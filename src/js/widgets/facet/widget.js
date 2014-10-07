

define(['backbone',
        'marionette',
    'js/components/api_query',
    'js/components/api_request',
    'js/widgets/base/paginated_multi_callback_widget',
    'js/components/paginator',
    'js/mixins/widget_pagination',
    'js/components/api_query_updater'],
  function (Backbone,
            Marionette,
            ApiQuery,
            ApiRequest,
            PaginatedMultiCallbackWidget,
            Paginator,
            WidgetPagination,
            ApiQueryUpdater) {

    var BaseFacetWidget = PaginatedMultiCallbackWidget.extend({



      initialize: function (options) {
        options = options || {};
        this._checkStandardWidgetOptions(options);

        this.view = options.view;
        this.collection = options.view.collection;

        this.showLoad = true;

        PaginatedMultiCallbackWidget.prototype.initialize.call(this, options)

        this.listenTo(this.view, "all", this.onAllInternalEvents);

        this.facetField = options.facetField || this.defaultQueryArguments['facet.field'] || _.uniqueId('facets');
        this.queryUpdater = new ApiQueryUpdater(this.facetField);

        this.responseProcessors = options['responseProcessors'] || this.responseProcessors || [];
        this.extractionProcessors = options['extractionProcessors'] || this.extractionProcessors || [];
        this.hierMaxLevels = options['hierMaxLevels'] || this.hierMaxLevels || -1;

        this._extractor = undefined;
        this._preprocessor = undefined;



      },


      _dispatchRequest: function (apiQuery, data) {
        var q = this.customizeQuery(apiQuery);
        data = data || {};
        if (q) {
          var qid = q.url();
          this.registerCallback(qid, this.processFacetResponse, {collection: data.collection || this.collection, view: data.view || this.view});
          var req = this.composeRequest(q);
          if (req) {
            this.pubsub.publish(this.pubsub.DELIVERING_REQUEST, req);
          }
        }

        if (this.showLoad === true){
          this.startWidgetLoad()
        }

      },

      /**
       * Default (generic) method for handling single-level facets; it knows how to page
       * through results
       *
       * @param apiResponse
       * @param data
       */
      processFacetResponse: function (apiResponse, data) {

        var query = apiResponse.getApiQuery();
        var paginator = this.findPaginator(query).paginator;

        paginator.setMaxNum(this.maxDisplayNum || 100); // even if not good for facets; it is important that maxNum be > -1
        //console.log('setting maxNum    ', paginator.maxNum, query.url());

        var view = data.view;
        var coll = data.collection;

        // XXX:rca - this is a hack (to make the nested views use the same
        // parameters as the parent view
        view.displayNum = this.view.displayNum;
        view.maxDisplayNum = this.view.maxDisplayNum;

        // set into the nested hierarchical view the query that was used to get the data
        // will be needed for paging
        if (view.setCurrentQuery) {
          view.setCurrentQuery(query);
        }
        else {
          this.setCurrentQuery(query);
        }


        var facets;
        var extractor = this.getExtractorChain();

        if (extractor) {
          facets = extractor(apiResponse);
        }
        else {
          var fField = query.get('facet.field');

          if (!fField) {
            throw Error('The query contains no facet.field parameter!');
          }
          var facetPath = "facet_counts.facet_fields." + fField;
          facets = apiResponse.get(facetPath);
        }

        // no data for us
        if (!facets) {
          console.warn('No facet data for:', this.facetField);
          //coll.reset();
          return;
        }

        var facetsCol = [];
        var l = facets.length;
        var fValue, fNum;
        var preprocessorChain = this.getPreprocessorChain();

        for (var i=0; i<l; i=i+2) {

          fValue = facets[i];
          fNum = facets[i+1];

          var modifiedValue = fValue;
          if (preprocessorChain) {
            modifiedValue = preprocessorChain.call(this, fValue);
          }

          var d = {
            total : apiResponse.toJSON().response.numFound,
            title: modifiedValue,
            value: fValue,
            count: fNum,
            modified: modifiedValue,
            children: []
          };

          facetsCol.push(d)

        };


        if (paginator.getCycle() <= 1) {
          coll.reset(facetsCol);
        }
        else {
          coll.add(facetsCol);

          if (!view.enableHierarchicalShowMore && facetsCol.length < this.view.displayNum){

            view.disableShowMore();
            //tell loading view that there is nothing else, it can remove itself
            coll.trigger("noneFound")

          }

        }

      //check for hierarchical facets on both reset and add
      if (facetsCol.length > 0 && view.enableHierarchicalShowMore) { // we got a full batch (so we'll assume there is more)
            view.enableHierarchicalShowMore();

          }
          else if (view.enableHierarchicalShowMore) {

            view.disableHierarchicalShowMore();
          }


      },

      getPreprocessorChain: function() {
        if (this._preprocessor === undefined) {
          this._preprocessor = this._buildChain(this.responseProcessors);
        }

        return this._preprocessor;
      },

      getExtractorChain: function() {
        if (this._extractor === undefined) {
          this._extractor = this._buildChain(this.extractionProcessors);
        }
        return this._extractor;
      },

      _buildChain: function(processors) {
        var func;
        if (_.isArray(processors) && processors.length > 0) {
          func = _.compose.apply(_, processors);
        }
        else if (typeof processors === 'function') {
          func = processors;
        }
        else {
          func = null;
        }
        return func;
      },


      //deliver info to pubsub after one of two main submit events (depending on facet type)
      onAllInternalEvents: function(ev, arg1, arg2) {
        //console.log('widget', ev);
        if (ev.indexOf("fetchMore") > -1) {
          var numOfLoadedButHidden = arguments[arguments.length-2];
          var data = arguments[arguments.length-1];
          var paginator, view, collection, q;
          if (data && data.view) {
            q = data.query || this.getCurrentQuery();
            view = data.view;
            collection = data.collection;
            paginator = this.findPaginator(q).paginator;
          }
          else {
            numOfLoadedButHidden = data;
            q = this.getCurrentQuery();
            view = this.view;
            collection = this.collection;
            paginator = this.findPaginator(q).paginator;
          }
          var p = this.handlePagination(this.view.displayNum, this.view.maxDisplayNum, numOfLoadedButHidden, paginator, view, collection);
          if (p && p.before) {
            p.before();
          }
          if (p && p.runQuery) {
            this._dispatchRequest(q, {collection: collection, view: view});
          }
        }
        else if (ev.substring(ev.length-20) == 'itemview:itemClicked') {
          var view = arguments[arguments.length-1];
          this.handleConditionApplied(view.model);

        }
        else if (ev.substring(ev.length-20) == 'itemview:treeClicked') { // hierarchical view
          var view = arguments[arguments.length-1];
          this.handleConditionApplied(view.model);
        }
        else if (ev.indexOf('treeNodeDisplayed') > -1) {
          if (this.hierMaxLevels > -1 && ev.split('itemview:').length >= this.hierMaxLevels+1) {
            return; // ignore further requests
          }

          var view = arguments[arguments.length-1];
          this.handleTreeExpansion(view); // see if we need to fetch deeper data
        }
        else if (ev == 'composite:collection:rendered') {
          this.view.displayMore(this.view.displayNum);
        }
        else if (ev == 'containerLogicSelected') {
          this.handleLogicalSelection(arg1);
        }
      },


      handleTreeExpansion: function(view) {

        var model = view.model;
        var children = view.collection;

        if (!children || children._finished) {
          return; // do nothing
        }

        // we need to fetch data one level deeper
        var q = this.getCurrentQuery();
        q = q.clone();

        q = this.composeQuery(_.clone(this.defaultQueryArguments), q);

        var val = model.get('value');

        if (!val) {
          return; // nothing to do
        }

        var elems = val.split('/');
        var nextLevel = parseInt(elems[0]) + 1;
        var prefix = nextLevel + "/" + elems.slice(1).join('/') + '/';
        q.set('facet.prefix', prefix);

        var self = this;
        var paginator = this.findPaginator(q).paginator;

        q = paginator.run(q);
        this.registerCallback(q.url(), function(apiResponse) {
          self.processFacetResponse(apiResponse, {view: view, collection: children});
        });

        var req = this.composeRequest(q);
        if (req) {
          this.pubsub.publish(this.pubsub.DELIVERING_REQUEST, req);
          setTimeout(function() {
            if (children.length == 0) {
              view.triggerMethod('NoMoreDataOnThisLevel');
            }
          }, 5000);
        }


        children._finished = true;
      },

      handleConditionApplied: function(model) {

        var q = this.getCurrentQuery();

        if (this.view.logicOptions) { // we'll just save the values and wait for the operator

          var selectedItems = this.queryUpdater.getTmpEntry(q, 'SelectedItems', {});
          if (model.get('selected')) {
            selectedItems[model.cid] = model.attributes;
          }
          else {
            delete selectedItems[model.cid];
          }
        }
        else {

          var value = this.facetField + ":" + model.get('value');

          if (value) {
            var paginator = this.findPaginator(q).paginator;

            q = q.clone();
//            value = this.queryUpdater.escapeInclWhitespace(value);

            var fieldName = 'q'; // + this.facetField;
            //make default limit to
              this.queryUpdater.updateQuery(q, fieldName, 'limit', value);
            //not sure when exclude would ever be useful in this case
            //this.queryUpdater.updateQuery(q, 'q', 'exclude', value);
            this.dispatchNewQuery(paginator.cleanQuery(q));
          }
        }
      },

      handleLogicalSelection: function(operator) {
        var q = this.getCurrentQuery();
        var paginator = this.findPaginator(q).paginator;
        var conditions = this.queryUpdater.removeTmpEntry(q, 'SelectedItems');

        //XXX:rca - hack ; this logic is triggerd multiple times
        // we need to prevent that

        var self = this;

        if (conditions && _.keys(conditions).length > 0) {


          conditions = _.values(conditions);
          _.each(conditions, function(c, i, l) {
            l[i] = self.facetField + ':' + self.queryUpdater.escapeInclWhitespace(c.value);
          });

          q = q.clone();

          var fieldName = 'fq_' + this.facetField;

          if (operator == 'and' || operator == 'limit to') {
            this.queryUpdater.updateQuery(q, fieldName, 'limit', conditions);
          }
          else if (operator == 'or') {
            this.queryUpdater.updateQuery(q, fieldName, 'expand', conditions);
          }
          else if (operator == 'exclude' || operator == 'not') {
            if (q.get(fieldName)) {
              this.queryUpdater.updateQuery(q, fieldName, 'exclude', conditions);
            }
            else {
              conditions.unshift('*:*');
              this.queryUpdater.updateQuery(q, fieldName, 'exclude', conditions);
            }
          }

          var fq = '{!type=aqp v=$' + fieldName +'}';
          var fqs = q.get('fq');
          if (!fqs || fqs.length == 0) {
            q.set('fq', [fq]);
          }
          else {
            var i = _.indexOf(fqs, fq);
            if (i == -1) {
              fqs.push(fq);
            }
            q.set('fq', fqs);
          }

          this.dispatchNewQuery(paginator.cleanQuery(q));
        }
      }

    });

    // add mixins
    _.extend(BaseFacetWidget.prototype, WidgetPagination);

    return BaseFacetWidget

  });