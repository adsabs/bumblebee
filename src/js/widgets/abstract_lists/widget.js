define(['js/components/api_query', '../results/widget', 'hbs!./templates/container-template'],
  function(ApiQuery, ResultsWidget, containerTemplate){

  var AbstractListWidget = ResultsWidget.extend({

    initialize : function(options){
      _.bindAll(this, "_clearBibcodes");

//    so that the view can communicate with the contents layout

      try {
        this.operator = options.operator

      }catch (TypeError){
        throw new Error("need to provide an operator")
     }

      ResultsWidget.prototype.initialize.apply(this, arguments)

      this.listenTo(this.view, "before:show", this.onBeforeShow)

      this.view.template = containerTemplate;


    },

    collectionWait : true,

    defaultQueryArguments : {fl: 'title,abstract,bibcode,author,keyword,id,citation_count,pub,aff,email,volume,year' },

    //override activate
    activate: function (beehive) {
      this.pubsub = beehive.Services.get('PubSub');

      //custom dispatchRequest function goes here
      this.pubsub.subscribe(this.pubsub.INVITING_REQUEST, this._clearBibcodes);

      //custom handleResponse function goes here
      this.pubsub.subscribe(this.pubsub.DELIVERING_RESPONSE, this.processResponse);
    },

    _clearBibcodes : function(){
//      this.bibcodes = [];
    },

  onBeforeShow : function(){
    console.log("on before show")
    if(!this.collection.length){
      _.each(this.bibcodes, function(){

        this.dispatchRequest(this.getCurrentQuery())
      }, this)

    }

  },

    composeQuery: function (queryParams, apiQuery) {
      var query;
      if (!apiQuery) {
        query = this.getCurrentQuery();
        query = query.clone();
      }
      else {
        query = apiQuery;
      }

      if (queryParams) {
        _.each(queryParams, function (v, k) {
          query.set(k, v)
        });
      }

//    specially added for this widget
      var bib = this.bibcodes[0];
      query.set("q",  this.operator +"(\""+ bib +"\")")

      return query;
    },

//    processResponse: function(apiResponse){
//
//      ResultsWidget.prototype.processResponse.apply(this, arguments)
//      this.trigger("data:recieved")
//
//    },

    //takes list of bibcodes
    registerBib : function(bib) {
      if (bib instanceof Array) {
        this.bibcodes = bib
      }
      else {
        this.bibcodes = [];
        this.bibcodes.push(bib)

      }
    }

  })

  return AbstractListWidget


})