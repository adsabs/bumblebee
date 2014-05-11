define(['marionette', 'd3', 'hbs!../templates/facet-item-checkbox',
    'hbs!../templates/facet-slider', 'hbs!../templates/facet-graph', '../facet-collection', 'jquery-ui'
  ],
  function(Marionette, d3, facetItemCheckboxTemplate, facetSliderTemplate, facetGraphTemplate, IndividualFacetCollection) {

    var BaseItem = Marionette.ItemView.extend({

      className : "item-view hide"

      //most widgets are hidden by default until parent container view
      //explicitly shows them

    });

    var BaseHierarchicalItem = Marionette.CompositeView.extend({

      className : "item-view hide",

      itemViewContainer: ".child-facets",

      events : {
        "click .show-more": "showExtraItems"
      },

      initialize: function(options) {
        console.log("new hierarchical view created with cid", this.cid, this.model.attributes)

        //first, give the requesting facet a collection of its own
        this.collection = new IndividualFacetCollection([], {});

        this.events["click .facet-caret"] = "toggleChildren";
        this.events["click .show-more"] = "showExtraItems"

        this.listenTo(this.collection, "re-rendering", this.onAdd)
      },

      defaultNumFacets: Marionette.getOption(this, "defaultNumFacets") || 5,

      onAdd : function(){

        //show initial number of facets
        var visible = 0;
        var $childFacets = this.$(".child-facets .item-view")
        if ($childFacets.length) {

          while (visible < this.defaultNumFacets) {

            $childFacets.eq(visible).removeClass("hide");
            visible++
          }
        }

        var $childFacets = this.$(".child-facets .item-view");
        console.log(this, this.collection.moreFacets, $childFacets.length, this.defaultNumFacets )

        //unhide "show more" button if necessary
        if (this.collection.moreFacets && !($childFacets.length < this.defaultNumFacets)) {
          //this confirms there are more facets to be shown, so present it as an option
          this.$(".child-facets + .show-more").removeClass("hide")
        }

      },

      //adding the hier flag for hierarchical view
      serializeData: function() {
        var m = this.model.toJSON();
        m.hier = true;
        return m
      },

      //function to show or hide children
      toggleChildren: function(e) {

        e.stopPropagation();
        var $target = $(e.target)

        if ($target.hasClass("item-open")) {
          //just close the facet
          $target.removeClass("item-open").addClass("item-closed")
          $($target.siblings()[1]).addClass("hide")

        } else {
          if (this.collection && this.collection.models.length) {
            //reopening the toggle since the collection already has data
            $target.removeClass("item-closed").addClass("item-open")
            $($target.siblings()[1]).removeClass("hide")

          } else {
            //request facets
            this.trigger("requestChildData", this);

            $target.removeClass("item-closed").addClass("item-open");

            $($target.siblings()[1]).removeClass("hide")

          }
        }
      },

      showExtraItems: function(e) {
        e.stopPropagation();
        var $target = $(e.target);

        this.$(".item-view.hide").slice(0, this.defaultNumFacets ).removeClass("hide");

        //because some facets are pruned, this might be triggered earlier than you would think
        if(!(this.$(".item-view.hide").length >= this.defaultNumFacets * 2)){
          if(this.collection.moreFacets === true){
            console.log("requesting more data")
            this.trigger("requestChildData")
          }
          else {
            console.log("NO MORE facets to show!")
            this.$("button.show-more").addClass("hide")
          }
        }

      }

    });

    var checkboxMultiselectMixin = {

      //when someone clicks a checkbox
      toggleHighlight: function(e) {
        $(e.target).parent().toggleClass("selected");
        this.model.set({
          "selected": !this.model.get("selected")
        })
      },

      events: {
        "change input": "toggleHighlight",
      },

    };


    var ZoomableGraphView = BaseItem.extend({


        initialize: function(options) {

          try {
          //need to pass x-axis title in for sorting
          this.xAxisTitle = options.xAxisTitle;
          this.parentTitle = options.title;

          }
          catch(e){
            throw new Error("Missing key information: x axis title or graph title")
          }

          this.yAxisTtitle = options.yAxisTitle || "size";

          //some variables need to be accessible for the sort function
          this.currentData = {
            x: undefined,
            xAxis: undefined,
            binnedData: undefined,
            xLabels : undefined
          };

          //setting some constants for the graph
          this.bins = 12; //will be around 12, depending on remainders
          this.margin = {
            top: 10,
            right: 10,
            bottom: 5,
            left: 55
          };
          this.fullWidth = 350;
          this.fullHeight = 200;

          this.width = this.fullWidth - this.margin.left - this.margin.right;
          this.height = this.fullHeight - this.margin.top - this.margin.bottom;

          /*filling in blank x values between real values so as to get a more consistent graph,
          and getting rid of blank values on the left and right side of graph.
        It seems like this will always be desirable but possibly not.  (Can we get solr to do it?)*/
          try {
            var data = this.model.toJSON().graphInfo;
          }
          catch(e){
            throw new Error("Graph widget has no model or else an incorrect model")
          }

          var dataYears = _.pluck(data, "x")
          var yearRange = [];
          var valRange = this.model.get("value");

          for (var i = valRange[0]; i <= valRange[1]; i++) {
            (function(i){
               yearRange.push(i)
            })(i)
          };

          _.each(yearRange, function(d){
            //it's a zero value, we must add it
            if (!_.contains(dataYears, d)) {
              data.push({x: d, y: 0})
            };
          })

          data = _.sortBy(data, function (d) {
              return d.x
            });
          
          //save to widget 
          this.graphData = data;

        },

        //pass in xAxisTitle,
        serializeData : function(){
          var data = {};
          data.xAxisTitle = this.xAxisTitle.toLowerCase();
          data.title = this.parentTitle;
          return data
        },

        className: "zoomable-graph",

        events: {
          "click .apply": "submitFacet",
          "blur input[type=text]": "triggerGraphChange",
          "change .sort-options input": "triggerSortChange"
        },

        template: facetGraphTemplate,

        submitFacet: function() {
          this.model.set("newValue", this.$(".slider").slider("values"))

        },

        triggerGraphChange: function() {
          var val1, val2;
          val1 = this.$(".show-slider-data-first").val();
          val2 = this.$(".show-slider-data-second").val();

          this.$(".slider").slider("values", [val1, val2]);

          this.graphChange(val1, val2)

        },

        triggerSortChange: function(e) {

          if (this.animate === true){
            return
          }
          this.animate = true;
          var that = this;
          var data, x, xAxis, innerChart, sortVal;
          var transition, delay, x0;

          sortVal = $(e.target).val();
          if (sortVal==="size"){
             //if people redraw the graph by narrowing it
            this.sizeSort = true;
          }
          else {
            this.sizeSort = false;
          };

          data = this.currentData.binnedData;
          x = this.currentData.x;
          xAxis = this.currentData.xAxis;
          xLabels = this.currentData.xLabels;
          innerChart = d3.select(this.el).select(".inner-chart");

          //from http://bl.ocks.org/mbostock/3885705
          x0 = x.domain(data.sort(sortVal == "size" ? function(a, b) {
                return a.y - b.y;
              } : function(a, b) {
                var retrieveNum = function(s) {
                  var l = s.split("-");
                  return parseInt(l[l.length - 1])
                };
            return d3.ascending(retrieveNum(a.x), retrieveNum(b.x));
          })
          .map(function(d) {
            return d.x;
          }))
      .copy();

      transition = innerChart.transition().duration(2000); 

      delay = function(d, i) {
        return i *50
      };

      transition.selectAll(".bar")
      .delay(delay)
      .attr("transform", function(d) {
        return "translate(" + x0(d.x) + ",0)";
      });

      transition.select(".x-axis")
      .call(xAxis)
      .selectAll("g")
      .delay(function(d,i){
        // find d's position in d axis list
        var pos = xLabels.indexOf(d)
        return pos *50
      })
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em");

      //adjust this later, need a timeout otherwise weird stuff happenss
      setTimeout(function(){that.animate = false}, data.length*100);
    },

      buildSlider: function() {

        var that = this;

        var data = _.clone(this.graphData);
        min = data[0].x,
        max = data[data.length - 1].x;

        this.$(".slider").slider({
          range: true,
          min: min,
          max: max,
          values: [min, max],
          stop: function(event, ui) {
            var ui1 = ui.values[0],
              ui2 = ui.values[1];
            if (!(ui1 === min && ui2 === max)) {
              that.$(".apply").removeClass("no-show")
            } else {
              that.$(".apply").addClass("no-show")
            }
            that.graphChange(ui1, ui2)
          },
          slide: function(event, ui) {
            var ui1 = ui.values[0],
              ui2 = ui.values[1];
            that.$(".show-slider-data-first").val(ui1)
            that.$(".show-slider-data-second").val(ui2)
          }

        });
        this.$(".show-slider-data-first").val(min);
        this.$(".show-slider-data-second").val(max);
      },

      graphChange: function(val1, val2) {

        var that = this;

        var data, standardWidth, innerChart, x, xLabels,
          y, xAxis, yAxis, bar;

        data = _.clone(this.graphData);

        //now getting rid of anything outside of the new bounds
        data = _.filter(data, function(d, i) {
          return (d.x >= val1 && d.x <= val2)
        })

        data = this.binData(data, this.bins);
        //store for sort
        this.currentData.binnedData = data;

        if (this.sizeSort === true) {
          data = _.sortBy(data, function(d) {
            return d.y
          });
        };

        innerChart = d3.select(this.el).select(".inner-chart")

        xLabels = _.pluck(data, "x"),
        maxVal = d3.max(_.pluck(data, "y"));

        x = d3.scale.ordinal()
          .domain(xLabels)
          .rangeRoundBands([0, this.width], .1)

        //store for sort
        this.currentData.x = x;
        this.currentData.xLabels = xLabels;

        y = d3.scale.linear()
          .domain([0, maxVal])
          .range([this.height, 0]);

        xAxis = d3.svg.axis()
          .scale(x)
          .ticks(5)
          .orient("bottom");

        //store for sort
        this.currentData.xAxis = xAxis;

        yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickFormat(d3.format(".2s"));

        bar = innerChart.selectAll(".bar")
          .data(data);

        bar.exit().remove();

        bar.enter().append("g")
          .classed("bar", true)
          .append("rect")

        //update selection is within bar
        bar.attr("transform", function(d) {
          return "translate(" + x(d.x) + ",0)";
        })
          .transition()
          .select("rect")
          .attr("y", function(d) {
            return y(d.y);
          })
          .attr("height", function(d) {
            return that.height - y(d.y);
          })
          .attr("width", function(d) {
            return x.rangeBand() * d.width / that.binSize
          });

        d3.select(this.el).select(".x-axis")
          .call(xAxis)
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", function(d) {
            return "rotate(-65)"
          });

        d3.select(this.el).select(".y-axis")
          .transition()
          .call(yAxis);

        /*add hover event listener
        have to do this again because delegated events don't
        work with svg :( */

        this.$(".bar")
          .on("mouseover", function() {
            var sorted = _.sortBy($(this).parent().find(".bar"), function(d) {
              return parseInt($(d).attr("transform").match(/\((\d+),/)[1])
            });
            var i = sorted.indexOf(this)
            var t = innerChart.select(".x-axis").selectAll(".tick")[0][i];
            d3.select(t).classed("active", true);

          });

        this.$(".bar")
          .on("mouseout", function(i) {
            var sorted = _.sortBy($(this).parent().find(".bar"), function(d) {
              return parseInt($(d).attr("transform").match(/\((\d+),/)[1])
            });
            var i = sorted.indexOf(this)
            var t = innerChart.select(".x-axis").selectAll(".tick")[0][i]
            d3.select(t).classed("active", false);

          })
      },

      //takes current data and binNum, returns correctly binned data
      binData: function(data, binNum) {
        var extraBar, remainder, binSize,
          indexList, binnedX, binnedY;

        if (data.length <= binNum) {
            this.binSize = 1;

          data = _.map(data, function(d, i) {
            return {
              x: "" + d.x,
              y: d.y,
              width: 1
            }
          })
          return data
        };

        extraBar = undefined;

        binSize = Math.floor(data.length / binNum);
        //storing for bar width calculations
        this.binSize = binSize;
        remainder = data.length % binNum;
        if (remainder) {
          binNum += (Math.floor(remainder / binSize))
          remainder = remainder % binSize
          if (remainder) {
            extraBar = remainder;
          }
        }

        indexList = [];
        binnedX = [];
        binnedY = [];

        for (var i = 0; i < binNum; i++) {
          indexList.push(binSize)
        };
        if (extraBar) {
          indexList.push(extraBar)
        }

        _.each(indexList, function(d, i) {
          var val = 0;
          var dateRange = [];
          while (d >= 1) {
            var v = data[0]
            dateRange.push(v.x)
            val += v.y
            data.shift();
            d -= 1
          }
          binnedX.push(dateRange);
          binnedY.push(val)
        })

        binnedX = _.map(binnedX, function(d, i) {
          if (d.length > 1) {
            return {
              x: d[0] + "-" + d[d.length - 1],
              width: d.length
            }
          } else {
            //a remainder bar
            return {
              x: d[0] + "",
              width: 1
            }
          }
        })

        data = _.map(binnedX, function(d, i) {
          return {
            x: d.x,
            y: binnedY[i],
            width: d.width
          }
        });

        return data
      },

      buildGraph: function() {

        var that = this;

        var data, xLabels, x,
          y, xAxis, yAxis, chart, innerChart, bar;

        data = _.clone(this.graphData);

        data = this.binData(data, this.bins);

        //initial sort
        data = _.sortBy(data, function(d) {
          var l = d.x.split("-");
          return parseInt(l[l.length - 1])
        });

        //store for sort
        this.currentData.binnedData = data;

        xLabels = _.pluck(data, "x"),
        maxVal = d3.max(_.pluck(data, "y"));

        x = d3.scale.ordinal()
          .domain(xLabels)
          .rangeRoundBands([0, this.width], .1);

        //store for sort
        this.currentData.x = x;
        this.currentData.xLabels = xLabels;


        y = d3.scale.linear()
          .domain([0, maxVal])
          .range([this.height, 0])

        xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

        //store for sort
        this.currentData.xAxis = xAxis;

        yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickFormat(d3.format(".2s"));

        chart = d3.select(this.el).select(".chart")
          .attr("width", this.fullWidth)
          .attr("height", this.fullHeight);

        innerChart = chart.append("g")
          .classed("inner-chart", true)
          .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        bar = innerChart.selectAll("g")
          .data(data)
          .enter().append("g")
          .classed("bar", true)
          .attr("transform", function(d) {
            return "translate(" + x(d.x) + ",0)";
          });

        bar.append("rect")
          .attr("y", function(d) {
            return y(d.y);
          })
          .attr("height", function(d) {
            return that.height - y(d.y);
          })
          .attr("width", function(d) {
            console.log(that.binSize, x.rangeBand(), d.width)
            return x.rangeBand() * d.width / that.binSize
          });

        innerChart.append("g")
          .classed({
            "axis": true,
            "x-axis": true
          })
          .attr("transform", "translate(0," + this.height + ")")
          .call(xAxis)
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", function(d) {
            return "rotate(-65)"
          });

        innerChart.append("g")
          .classed({
            "axis": true,
            "y-axis": true
          })
          .call(yAxis);

        //for sorting later
        _.each(d3.select(this.el).selectAll(".bar")[0], function(d, i ){d._i = i})
        _.each(d3.select(this.el).select(".x-axis").selectAll(".tick")[0], function(d, i ){d._i = i})

        //add hover event listener

        this.$(".bar")
          .on("mouseover", function() {
            //get index
            var sorted = _.sortBy($(this).parent().find(".bar"), function(d) {
              return parseInt($(d).attr("transform").match(/\((\d+),/)[1])
            });
            var i = sorted.indexOf(this);
            var t = innerChart.select(".x-axis").selectAll(".tick")[0][i];
            d3.select(t).classed("active", true);

          });

        this.$(".bar")
          .on("mouseout", function(i) {
            var sorted = _.sortBy($(this).parent().find(".bar"), function(d) {
              return parseInt($(d).attr("transform").match(/\((\d+),/)[1])
            });
            var i = sorted.indexOf(this)
            var t = innerChart.select(".x-axis").selectAll(".tick")[0][i]
            d3.select(t).classed("active", false);
          })
      },

      onRender: function() {
        this.buildGraph();
        this.buildSlider()
      }

  });


var CheckboxHierarchicalView = BaseHierarchicalItem.extend(checkboxMultiselectMixin).extend({
  template: facetItemCheckboxTemplate
});
var CheckboxOneLevelView = BaseItem.extend(checkboxMultiselectMixin).extend({
  template: facetItemCheckboxTemplate
});


var ItemViews = {
  CheckboxHierarchicalView: CheckboxHierarchicalView,
  CheckboxOneLevelView: CheckboxOneLevelView,
  ZoomableGraphView: ZoomableGraphView
}


return ItemViews


})
