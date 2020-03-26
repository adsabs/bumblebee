define([
  './base_graph',
  'hbs!js/widgets/facet/graph-facet/templates/year-graph-legend',
  'marionette',
  'jquery-ui',
], function(BaseGraphView, legendTemplate, Marionette) {
  var YearGraphView = BaseGraphView.extend({
    bins: 10,

    margin: {
      top: 5,
      right: 0,
      bottom: 20,
      left: 10,
    },

    id: 'year-graph',

    legendTemplate: legendTemplate,

    formatXAxisText: function(textSelection) {
      textSelection
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '-1.1em')
        .attr('transform', function() {
          return 'rotate(-65)';
        });
    },

    buildGraph: function() {
      var that = this;
      var data;
      var xLabels;
      var x;
      var y;
      var xAxis;
      var yAxis;
      var chart;
      var bar;
      var maxVal;
      var standardFormatter = d3.format('s');
      data = _.clone(this.model.get('graphData'));
      data = this.binData(data, this.bins);
      xLabels = _.pluck(data, 'x');
      maxVal = d3.max(_.pluck(data, 'y'));
      x = d3.scale
        .ordinal()
        .domain(xLabels)
        .rangeRoundBands([0, this.width], 0.1);
      y = d3.scale
        .linear()
        .domain([0, maxVal])
        .range([this.height, 0]);
      xAxis = d3.svg
        .axis()
        .scale(x)
        .orient('bottom');

      function isInt(n) {
        return n % 1 === 0;
      }

      yAxis = d3.svg
        .axis()
        .scale(y)
        .ticks(5)
        .orient('left')
        .tickFormat(function(d) {
          if (d >= 1 && isInt(d)) {
            return standardFormatter(d);
          }

          return '';
        });

      chart = d3
        .select(this.el)
        .select('.chart')
        .attr('width', this.fullWidth)
        .attr('height', this.fullHeight)
        .attr('aria-label', 'limit years graph');
      this.innerChart = chart
        .append('g')
        .classed('inner-chart', true)
        .attr(
          'transform',
          'translate(' + this.margin.left + ',' + this.margin.top + ')'
        );

      bar = this.innerChart
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .classed('bar', true)
        .attr('transform', function(d) {
          return 'translate(' + x(d.x) + ',0)';
        });

      // full bar
      bar
        .append('rect')
        .classed('full-bar', true)
        .attr('y', function(d) {
          return y(d.y);
        })
        .attr('height', function(d) {
          return that.height - y(d.y);
        })
        .attr('width', function(d) {
          // console.log(that.binSize, x.rangeBand(), d.width)
          return (x.rangeBand() * d.width) / that.binSize;
        });

      // refereed bar
      bar
        .append('rect')
        .classed('refereed', true)
        .attr('y', function(d) {
          return y(d.refCount);
        })
        .attr('height', function(d) {
          return that.height - y(d.refCount);
        })
        .attr('width', function(d) {
          // console.log(that.binSize, x.rangeBand(), d.width)
          return (x.rangeBand() * d.width) / that.binSize;
        });

      this.innerChart
        .append('g')
        .classed({
          axis: true,
          'x-axis': true,
        })
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(xAxis)
        .selectAll('text')
        .call(this.formatXAxisText);

      this.innerChart
        .append('g')
        .classed({
          axis: true,
          'y-axis': true,
        })
        .call(yAxis)
        .selectAll('text')
        .style('text-anchor', 'start');

      this.innerChart
        .append('text')
        .attr('class', 's-label')
        .attr('x', this.width / 2 - 20)
        .attr('y', 212)
        .text(Marionette.getOption(this, 'xAxisTitle'));

      this.innerChart
        .append('text')
        .attr('class', 's-label')
        .attr('y', -40)
        .attr('x', -this.height / 2)
        .attr('transform', 'rotate(-90)')
        .text(Marionette.getOption(this, 'yAxisTitle'));
    },

    // takes current data and binNum, returns correctly binned data
    binData: function(data, binNum) {
      var extraBar;
      var remainder;
      var binSize;
      var indexList;
      var binnedX;
      var binnedY;

      if (data.length <= binNum) {
        this.binSize = 1;

        data = _.map(data, function(d) {
          return {
            x: '' + d.x,
            y: d.y,
            width: 1,
            refCount: d.refCount,
          };
        });
        return data;
      }

      extraBar = undefined;
      binSize = Math.floor(data.length / binNum);
      // storing for bar width calculations
      this.binSize = binSize;
      remainder = data.length % binNum;
      if (remainder) {
        binNum += Math.floor(remainder / binSize);
        remainder %= binSize;
        if (remainder) {
          extraBar = remainder;
        }
      }

      indexList = [];
      binnedX = [];
      binnedY = [];

      for (var i = 0; i < binNum; i += 1) {
        indexList.push(binSize);
      }
      if (extraBar) {
        indexList.push(extraBar);
      }

      _.each(indexList, function(d) {
        var totalCount = 0;
        var refCount = 0;
        var dateRange = [];
        while (d >= 1) {
          var v = data[0];
          dateRange.push(v.x);
          totalCount += v.y;
          refCount += v.refCount;

          data.shift();
          d -= 1;
        }
        binnedX.push(dateRange);
        binnedY.push({ totalCount: totalCount, refCount: refCount });
      });

      binnedX = _.map(binnedX, function(d) {
        if (d.length > 1) {
          return {
            x: d[0] + '-' + d[d.length - 1],
            width: d.length,
          };
        }

        // a remainder bar
        return {
          x: d[0] + '',
          width: 1,
        };
      });

      data = _.map(binnedX, function(d, i) {
        return {
          x: d.x,
          y: binnedY[i].totalCount,
          refCount: binnedY[i].refCount,
          width: d.width,
        };
      });

      return data;
    },

    graphChange: function(val1, val2) {
      var that = this;
      var data;
      var x;
      var xLabels;
      var y;
      var xAxis;
      var yAxis;
      var bar;
      var maxVal;
      data = _.clone(this.model.get('graphData'));

      /* checking : do we need to signal
       that facet is active/ show apply button?
        */

      var min = data[0].x;
      var max = data[data.length - 1].x;

      if (!(val1 === min && val2 === max)) {
        this.trigger('facet:active');
      } else {
        this.trigger('facet:inactive');
      }

      // now getting rid of anything outside of the new bounds
      data = _.filter(data, function(d) {
        return d.x >= val1 && d.x <= val2;
      });

      data = this.binData(data, this.bins);

      if (this.sizeSort === true) {
        data = _.sortBy(data, function(d) {
          return d.y;
        });
      }

      xLabels = _.pluck(data, 'x');
      maxVal = d3.max(_.pluck(data, 'y'));
      x = d3.scale
        .ordinal()
        .domain(xLabels)
        .rangeRoundBands([0, this.width], 0.1);
      y = d3.scale
        .linear()
        .domain([0, maxVal])
        .range([this.height, 0]);
      xAxis = d3.svg
        .axis()
        .scale(x)
        .orient('bottom');

      var standardFormatter = d3.format('s');

      function isInt(n) {
        return n % 1 === 0;
      }

      yAxis = d3.svg
        .axis()
        .scale(y)
        .orient('left')
        .tickFormat(function(d) {
          if (d >= 1 && isInt(d)) {
            return standardFormatter(d);
          }

          return '';
        });

      bar = this.innerChart.selectAll('.bar').data(data);

      bar.exit().remove();

      var enterSelection = bar
        .enter()
        .append('g')
        .classed('bar', true);
      enterSelection.append('rect').classed('full-bar', true);
      enterSelection.append('rect').classed('refereed', true);

      var countBars = xLabels.length;

      // update selection is within bar
      bar
        .transition(500)
        .attr('transform', function(d) {
          return 'translate(' + x(d.x) + ',0)';
        })
        .delay(function(d, i) {
          return (i * 500) / countBars;
        })
        .select('rect')
        .attr('y', function(d) {
          return y(d.y);
        })
        .attr('height', function(d) {
          return that.height - y(d.y);
        })
        .attr('width', function(d) {
          return (x.rangeBand() * d.width) / that.binSize;
        });

      bar
        .select('.refereed')
        .transition(500)
        .delay(function(d, i) {
          return (i * 500) / countBars;
        })
        .attr('y', function(d) {
          return y(d.refCount);
        })
        .attr('height', function(d) {
          return that.height - y(d.refCount);
        })
        .attr('width', function(d) {
          return (x.rangeBand() * d.width) / that.binSize;
        });

      d3.select(this.el)
        .select('.x-axis')
        .call(xAxis)
        .selectAll('text')
        .call(this.formatXAxisText);

      d3.select(this.el)
        .select('.y-axis')
        .transition()
        .call(yAxis)
        .selectAll('text')
        .style('text-anchor', 'start');
    },

    buildSlider: function() {
      var that = this;
      var data = _.clone(this.model.get('graphData'));
      var min = data[0].x;
      var max = data[data.length - 1].x;

      this.$('.slider').slider({
        range: true,
        min: min,
        max: max,
        values: [min, max],
        stop: function(event, ui) {
          var ui1 = ui.values[0];
          var ui2 = ui.values[1];
          that.graphChange(ui1, ui2);
        },
        slide: function(event, ui) {
          var ui1 = ui.values[0];
          var ui2 = ui.values[1];
          that.$('.show-slider-data-first').val(ui1);
          that.$('.show-slider-data-second').val(ui2);
        },
        create: function(event) {
          const $handles = $('a', event.target);
          $handles.attr('href', 'javascript:void(0)');
          $handles
            .first()
            .attr('title', 'start slider handle')
            .html('<span class="sr-only">start slider handle</span>');
          $handles
            .last()
            .attr('title', 'end slider handle')
            .html('<span class="sr-only">end slider handle</span>');
        },
      });
      this.$('.show-slider-data-first').val(min);
      this.$('.show-slider-data-second').val(max);
    },

    addSliderWindows: function() {
      this.$('.slider-data').html(
        'Limit results to papers from <br/> <input type="text" class="show-slider-data-first" aria-label="limit papers start year"></input> to' +
          ' <input type="text" class="show-slider-data-second" aria-label="limit papers end year"></input> <button class="apply btn btn-sm btn-primary-faded">Apply</button>'
      );
    },

    triggerGraphChange: function(update) {
      var data = _.clone(this.model.get('graphData'));
      if (_.isArray(data)) {
        var min = data[0].x;
        var max = data[data.length - 1].x;
        var $first = this.$('.show-slider-data-first');
        var $second = this.$('.show-slider-data-second');
        var a = $first.val();
        var b = $second.val();

        // a < min, set to min
        a = a < min ? min : a;

        // b > max, set to max
        b = b > max ? max : b;

        // a > max, set to b
        a = a > max ? b : a;

        // b < min, set to a
        b = b < min ? a : b;

        // a > b, set to b
        a = a > b ? b : a;

        // b < a, set to a
        b = b < a ? a : b;

        if (update) {
          $first.val(a);
          $second.val(b);
        }

        this.$('.slider').slider('values', [a, b]);
        this.graphChange(a, b);
      }
    },

    submitFacet: function() {
      this.trigger(
        'facet-applied',
        this.$('.slider')
          .slider('values')
          .join('-')
      );
    },
  });

  return YearGraphView;
});
