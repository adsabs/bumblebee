define(['marionette', 'hbs!../templates/facet-item', 'hbs!../templates/facet-data', 'hbs!../templates/facet-tooltip', 'hbs!../templates/facet-per-search', 'hbs!../templates/facet-hierarchical', 'bootstrap'],
  function(Marionette, facetItemTemplate, facetDataTemplate, facetTooltipTemplate, facetPerSearchTemplate, facetHierarchicalTemplate) {



    var FacetItemView = Marionette.ItemView.extend({

      template: facetItemTemplate,

      className: "facet-item-view",

      events: {
        "click .show-more": "showExtraItems",
        "change .facet-options input": "facetSelectionProcess",
        "click .apply": "submitFacet",
        "click .facet": "toggleFacet",
        "click button.close": "closeLogic",
        "click .dropdown-toggle": "showLogic",
        "click input[name=facet]": "showApply",
        "click .show-hier": "requestHier"
      },


      toggleFacet: function() {
        if (this.$(".facet").hasClass("facet-open")) {
          this.$(".facet").removeClass("facet-open");
          this.$(".facet").addClass("facet-closed");
          this.$(".dropdown-toggle").addClass("hide");
          this.$(".facet-body").addClass("hide");


        } else {
          this.$(".facet").removeClass("facet-closed");
          this.$(".facet").addClass("facet-open");
          this.$(".dropdown-toggle").removeClass("hide");
          this.$(".facet-body").removeClass("hide");


        }
      },


      requestHier: function(e) {
        var $e = $(e.target);
        var $facetParentDiv = $e.parent();
        if ($e.hasClass("facet-open")) {
          //facet is already open, just close it and don't make a request
          $e.removeClass("facet-open");
          $e.addClass("facet-closed");
          $facetParentDiv.find('.contains-hier').addClass("hide")
        } else {
          if ($facetParentDiv.find('.hierarchical-facets').length === 0) {

            var toExpand = $e.parent().attr("data-facet");
            console.log(toExpand)
            //making a new entry in hierarchy
            this.model.trigger("hierarchyRequest", this.model, toExpand);


          }
          //they are re-opening the facet, so just show them again
          else {
            $e.addClass("facet-open");
            $facetParentDiv.find('.contains-hier').removeClass("hide")
          }
        }
      },

      showHier: function(data) {
        var id = data.subFacetId;
        var toRender = _.pairs(data.toRender);
        //do some data preprocessing
        $e = this.$(".facet-individual[data-facet=\"" + id + "\"]")
        $e.find("i").removeClass("facet-closed");
        $e.find("i").addClass("facet-open");
        var preprocess = this.model.get("textPreprocess");
        _.each(preprocess, function(p) {
          toRender = this[p](toRender)
        }, this);
        toRender = _.object(toRender)
        $e.find(".contains-hier").html(facetHierarchicalTemplate({
          'toRender': toRender
        }))
      },

      toggleHighlight: function(e) {
        $(e.target).parent().toggleClass("selected");
      },

      closeLogic: function() {
        this.$(".dropdown").removeClass("open")

      },
      showLogic: function() {
        this.$(".dropdown").addClass("open")

      },

      facetSelectionProcess: function(e) {
        e.stopPropagation();

        this.toggleHighlight(e);
        var numSelected = this.$(".facet-options input:checked").length;
        //open the dropdown
        if (numSelected === 1) {
          this.$(".dropdown-menu").html(facetTooltipTemplate({
            single: true,
            logic: this.model.get("singleLogic"),
            selected: this.$(".facet-options input:checked").parent().attr("data-facet")
          }));

          this.$(".dropdown").addClass("open")


        } else if (numSelected > 1) {
          this.$(".dropdown-menu").html(facetTooltipTemplate({
            single: false,
            logic: this.model.get("manyLogic")
          }))

          this.$(".dropdown").addClass("open")


        } else {
          this.$(".dropdown-menu").html("Select one or more items to filter your search.")
          this.$(".dropdown").removeClass("open")

        }
      },


      submitFacet: function() {

        //change the model, and emit an event
        var sel = _.map($("label.selected"), function(t) {
          return $(t).attr("data-facet")
        });
        var logic = (function() {
          var l = this.$(".apply").attr("data-logic")
          if (l === "multi") {
            return $("input[name=facet]:checked").val()
          } else if (l === "single") {
            return $("input[name=facet]:checked").val()
          }

        })();
        this.model.set("facetsToApply", {
          "selected": sel,
          "logic": logic
        })
      },

      showApply: function() {
        this.$(".apply").removeClass("no-show");

      },

      facetDataRender: function() {
        this.$(".facet-body").empty();
        var initialItems = this.model.get("initialItems");
        var fData = _.pairs(this.model.get("currentFacetData"));
        //now preprocess the data in accordance with the textPreprocess setting
        var preprocess = this.model.get("textPreprocess");
        _.each(preprocess, function(p) {
          fData = this[p](fData)
        }, this);

        var hier = this.model.get("hierarchy");

        if (initialItems) {
          var visible = _.object(_.first(fData, initialItems));
          var invisible = _.object(fData.slice(initialItems));
          invisible ? more = true : more = false;

        } else {
          var visible = _.object(fData);
          var invisible = {};
          var more = false;
        };

        this.$(".facet-body").html(facetPerSearchTemplate({
          'visible': visible,
          'invisible': invisible,
          'more': more,
          'hier': hier
        }))
      },

      showExtraItems: function() {

        this.$(".facet-individual.hide:lt(5)").removeClass("hide");
        if (!this.$(".facet-individual.hide").length) {
          this.$(".show-more").addClass("hide");
        }

      },

      titleCase: function(l) {
        return _.map(l, function(item) {
          var properI = item[0].replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
          return [properI, item[1]]
        })
      },
      allCaps: function(l) {
        return _.map(l, function(item) {
          return [item[0].toUpperCase(), item[1]]
        })
      },

      removeSlash: function(l) {
        return _.map(l, function(item) {
          var name = item[0].match(/\/(.*)/)[1]
          return [name, item[1]]
        })

      },

      serializeData: function() {
        return {
          facet: this.model.get("facet"),
          facetType: this.model.get("facetType")
        }
      },

      initialize: function(options) {

        //assign model id (may get rid of this later)
        this.id = this.model.get("solrFacet");
        //re-insert on model change
        this.listenTo(this.model, "change:currentFacetData", this.facetDataRender);
        this.listenTo(this.model, "newHierFacetsReady", this.showHier);

        //first round won't hear the event for reasons yet to be determined

      },

      onRender: function() {
        if (!_.isEmpty(this.model.get("currentFacetData"))) {
          this.facetDataRender()
        }
      }


    });

    return FacetItemView


  })
