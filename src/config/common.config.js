define([], function () {
  const waitForGlobal = (name, callback, errback = () => {}, interval = 500, max = 10) => {
    if (window[name]) {
      callback();
    } else if (max > 0) {
      setTimeout(() => {
        waitForGlobal(name, callback, interval, max - 1);
      }, interval);
    } else {
      errback();
    }
  };

  if (window.skipMain) {
    requirejs.config({
      baseUrl: '../../',
    });
  }

  requirejs.config({
    shim: {
      mathjax: {
        exports: 'MathJax',
        init: function () {
          MathJax.Hub.Config({
            messageStyle: 'none',
            HTML: ['input/TeX', 'output/HTML-CSS'],
            TeX: {
              extensions: ['AMSmath.js', 'AMSsymbols.js'],
              equationNumbers: {autoNumber: 'AMS'},
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
              linebreaks: {automatic: true},
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
    'config/utils',
    'regenerator-runtime',
    'array-flat-polyfill',
    'polyfill',
    'js/dark-mode-switch',
  ], function () {
    // stub here to make sure these load before the main app

  });

  // set up handlebars helpers
  require(['hbs/handlebars'], function (Handlebars) {

    // register helpers
    // http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/#comment-44

    // eg  (where current is a variable): {{#compare current 1 operator=">"}}

    Handlebars.registerHelper('compare', function (lvalue, rvalue, options) {
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
        '==': function (l, r) {
          return l == r;
        },
        '===': function (l, r) {
          return l === r;
        },
        '!=': function (l, r) {
          return l != r;
        },
        '!==': function (l, r) {
          return l !== r;
        },
        '<': function (l, r) {
          return l < r;
        },
        '>': function (l, r) {
          return l > r;
        },
        '<=': function (l, r) {
          return l <= r;
        },
        '>=': function (l, r) {
          return l >= r;
        },
        typeof: function (l, r) {
          return typeof l === r;
        },
      };
      if (!operators[operator]) {
        throw new Error(
          "Handlerbars Helper 'compare' doesn't know the operator " + operator,
        );
      }
      result = operators[operator](lvalue, rvalue);
      if (result) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
    Handlebars.registerHelper('toJSON', function (object) {
      return JSON.stringify(object, null, 2);
    });
    Handlebars.registerHelper('isdefined', function (value) {
      return typeof value !== 'undefined';
    });
    Handlebars.registerHelper('ifInSet', function (s, value, options) {
      if (s.has(value)) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
    Handlebars.registerHelper('ifSetEmpty', function (s, options) {
      if (s.size === 0) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
    Handlebars.registerHelper({
      eq: (v1, v2) => v1 === v2,
      ne: (v1, v2) => v1 !== v2,
      lt: (v1, v2) => v1 < v2,
      gt: (v1, v2) => v1 > v2,
      lte: (v1, v2) => v1 <= v2,
      gte: (v1, v2) => v1 >= v2,
      not: (v1) => !v1,
      and() {
        return Array.prototype.every.call(arguments, Boolean);
      },
      or() {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
      },
      startsWith: (str, prefix) => typeof str === 'string' && typeof prefix === 'string' ? str.startsWith(prefix) : false,
    });

    // array helpers
    Handlebars.registerHelper({
      includes(value, arr) {
        return Array.isArray(arr) && arr.includes(value);
      },
      prop: (key, obj) => (typeof obj === 'object' ? obj[key] : undefined),
    });
  });

  // set validation callbacks used by authentication and user settings widgets
  require(['backbone-validation'], function () {
    // this allows for instant validation of form fields using the backbone-validation plugin
    _.extend(Backbone.Validation.callbacks, {
      valid: function (view, attr, selector) {
        var $el = view.$('input[name=' + attr + ']');

        $el
        .closest('.form-group')
        .removeClass('has-error')
        .find('.help-block')
        .html('')
        .addClass('no-show');
      },
      invalid: function (view, attr, error, selector) {
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
  require(['d3', 'd3-cloud'], function (d3, cloud) {
    var win = window;
    if (!win.d3) {
      win.d3 = d3;
    }

    if (win.d3 && win.d3.layout && !win.d3.layout.cloud) {
      win.d3.layout.cloud = cloud;
    }

    waitForGlobal(
      'd3',
      () => {
        window.d3.legend = function(g) {
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
      },
      () => {
        window.getSentry((sentry) => {
          sentry.captureMessage('d3 not loaded');
        });
      }
    );
  });

  require(['jquery'], function ($) {
    waitForGlobal(
      '$',
      () => {
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
      },
      () => {
        window.getSentry((sentry) => {
          sentry.captureMessage('jQuery not loaded');
        });
      }
    );
  });
});
