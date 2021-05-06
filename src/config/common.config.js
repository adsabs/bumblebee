define([], function() {
  if (window.skipMain) {
    requirejs.config({
      baseUrl: '../../',
    });
  }

  requirejs.config({
    shim: {
      mathjax: {
        exports: 'MathJax',
        init: function() {
          MathJax.Hub.Config({
            messageStyle: 'none',
            HTML: ['input/TeX', 'output/HTML-CSS'],
            TeX: {
              extensions: ['AMSmath.js', 'AMSsymbols.js'],
              equationNumbers: { autoNumber: 'AMS' },
            },
            extensions: ['tex2jax.js'],
            jax: ['input/TeX', 'output/HTML-CSS'],
            tex2jax: {
              inlineMath: [
                ['$', '$'],
                ['\\(', '\\)'],
              ],
              displayMath: [
                ['$$', '$$'],
                ['\\[', '\\]'],
              ],
              processEscapes: true,
            },
            'HTML-CSS': {
              availableFonts: ['TeX'],
              linebreaks: { automatic: true },
            },
          });
          MathJax.Hub.Startup.onload();
          return MathJax;
        },
      },
    },
  });

  require([
    'config/discovery.vars',
    'regenerator-runtime',
    'array-flat-polyfill',
    'polyfill',
  ], function(config) {
    // rca: not sure why the ganalytics is loaded here instead of inside analytics.js
    //      perhaps it is because it is much/little sooner this way?

    // make sure that google analytics never blocks app load
    setTimeout(function() {
      require(['google-analytics', 'analytics'], function(_, analytics) {
        // set ganalytics debugging
        //window.ga_debug = {trace: true};
        analytics(
          'create',
          config.googleTrackingCode || '',
          config.googleTrackingOptions
        );

        // if we ever want to modify what experiment/variant the user
        // is going to receive, it has to happen here - by modifying the
        // _gaexp cookie -- but at this stage we haven't yet downloaded
        // optimize AND we haven't setup any of our api calls

        // example that sets the variant 2 of the experiment
        // document.cookie = '_gaexp=GAX1.1.WFD4u8V3QkaI5EcZ969yeQ.18459.2;';

        if (config.googleOptimizeCode) {
          analytics('require', config.googleOptimizeCode);
          if (!config.debugExportBBB)
            console.warn(
              'AB testing will be loaded, but bbb object is not exposed. Change debugExportBBB if needed.'
            );
        }
      });
    }, 0);
  });

  // set up handlebars helpers
  require(['hbs/handlebars'], function(Handlebars) {
    // register helpers
    // http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/#comment-44

    // eg  (where current is a variable): {{#compare current 1 operator=">"}}

    Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {
      var operators;
      var result;
      var operator;
      if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
      }

      if (options === undefined || !options.hash || !options.hash.operator) {
        operator = '===';
      } else {
        operator = options.hash.operator;
      }

      operators = {
        '==': function(l, r) {
          return l == r;
        },
        '===': function(l, r) {
          return l === r;
        },
        '!=': function(l, r) {
          return l != r;
        },
        '!==': function(l, r) {
          return l !== r;
        },
        '<': function(l, r) {
          return l < r;
        },
        '>': function(l, r) {
          return l > r;
        },
        '<=': function(l, r) {
          return l <= r;
        },
        '>=': function(l, r) {
          return l >= r;
        },
        typeof: function(l, r) {
          return typeof l === r;
        },
      };
      if (!operators[operator]) {
        throw new Error(
          "Handlerbars Helper 'compare' doesn't know the operator " + operator
        );
      }
      result = operators[operator](lvalue, rvalue);
      if (result) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
    Handlebars.registerHelper('toJSON', function(object) {
      return JSON.stringify(object);
    });
    Handlebars.registerHelper('isdefined', function(value) {
      return typeof value !== 'undefined';
    });
  });

  // set validation callbacks used by authentication and user settings widgets
  require(['backbone-validation'], function() {
    // this allows for instant validation of form fields using the backbone-validation plugin
    _.extend(Backbone.Validation.callbacks, {
      valid: function(view, attr, selector) {
        var $el = view.$('input[name=' + attr + ']');

        $el
          .closest('.form-group')
          .removeClass('has-error')
          .find('.help-block')
          .html('')
          .addClass('no-show');
      },
      invalid: function(view, attr, error, selector) {
        var $el = view.$('[name=' + attr + ']');
        $group = $el.closest('.form-group');

        if (view.submit === true) {
          // only show error states if there has been a submit event
          $group.addClass('has-error');
          $group
            .find('.help-block')
            .html(error)
            .removeClass('no-show');
        }
      },
    });
  });

  // d3/d3-cloud don't like to load normally from a CDN
  require(['d3', 'd3-cloud'], function(d3, cloud) {
    var g = window;
    if (!g.d3) {
      g.d3 = d3;
    }

    if (g.d3 && g.d3.layout && !g.d3.layout.cloud) {
      g.d3.layout.cloud = cloud;
    }

    /**
     * d3.legend.js
     * (C) 2012 ziggy.jonsson.nyc@gmail.com
     * MIT licence
     */
    (function() {
      d3.legend = function(g) {
        g.each(function() {
          var g = d3.select(this);
          var items = {};
          var svg = d3.select(g.property('nearestViewportElement'));
          var legendPadding = g.attr('data-style-padding') || 5;
          var lb = g.selectAll('.legend-box').data([true]);
          var li = g.selectAll('.legend-items').data([true]);

          lb.enter()
            .append('rect')
            .classed('legend-box', true);
          li.enter()
            .append('g')
            .classed('legend-items', true);

          try {
            svg.selectAll('[data-legend]').each(function() {
              var self = d3.select(this);
              items[self.attr('data-legend')] = {
                pos: self.attr('data-legend-pos') || this.getBBox().y,
                color:
                  self.attr('data-legend-color') != undefined
                    ? self.attr('data-legend-color')
                    : self.style('fill') != 'none'
                    ? self.style('fill')
                    : self.style('stroke'),
              };
            });
          } catch (e) {
            // firefox tends to have issue with hidden elements
            // should continue if it doesn't die here
          }

          items = d3.entries(items).sort(function(a, b) {
            return a.value.pos - b.value.pos;
          });
          var itemOffset = 0;
          li.selectAll('text')
            .data(items, function(d) {
              return d.key;
            })
            .call(function(d) {
              d.enter().append('text');
            })
            .call(function(d) {
              d.exit().remove();
            })
            .attr('y', function(d, i) {
              if (i === 0) {
                return '0em';
              }
              itemOffset += 0.2;
              return i + itemOffset + 'em';
            })
            .attr('x', '1em')
            .text(function(d) {
              return d.key;
            });

          li.selectAll('circle')
            .data(items, function(d) {
              return d.key;
            })
            .call(function(d) {
              d.enter().append('circle');
            })
            .call(function(d) {
              d.exit().remove();
            })
            .attr('cy', function(d, i) {
              return i - 0.25 + 'em';
            })
            .attr('cx', 0)
            .attr('r', '0.4em')
            .style('fill', function(d) {
              return d.value.color;
            });

          // Reposition and resize the box
          var lbbox = li[0][0].getBBox();
          lb.attr('x', lbbox.x - legendPadding)
            .attr('y', lbbox.y - legendPadding)
            .attr('height', lbbox.height + 2 * legendPadding)
            .attr('width', lbbox.width + 2 * legendPadding);
        });
        return g;
      };
    })();
  });

  require(['jquery'], function($) {
    $.fn.getCursorPosition = function() {
      var input = this.get(0);
      if (!input) return; // No (input) element found
      if ('selectionStart' in input) {
        // Standard-compliant browsers
        return input.selectionStart;
      }
      if (document.selection) {
        // IE
        input.focus();
        var sel = document.selection.createRange();
        var selLen = document.selection.createRange().text.length;
        sel.moveStart('character', -input.value.length);
        return sel.text.length - selLen;
      }
    };

    // manually highlight a selection of text, or just move the cursor if no end val is given
    $.fn.selectRange = function(start, end) {
      if (!end) end = start;
      return this.each(function() {
        if (this.setSelectionRange) {
          this.focus();
          this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
          var range = this.createTextRange();
          range.collapse(true);
          range.moveEnd('character', end);
          range.moveStart('character', start);
          range.select();
        }
      });
    };
  });
});
