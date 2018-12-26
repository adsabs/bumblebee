// Main config file for the Discovery application
require.config({
  // Initialize the application with the main application file or if we run
  // as a test, then load the test unittests
  deps: (function() {

    if (typeof window !== "undefined" && window.skipMain) {
      return [];
    } else {
      return ['js/apps/discovery/main'];
    }

  }()),


  //this will be overridden in the compiled file
  waitSeconds: 30,

  // Configuration we want to make available to modules of ths application
  // see: http://requirejs.org/docs/api.html#config-moduleconfig
  config: {

    'es6': {
      modules: undefined
    },

    'js/components/persistent_storage': {
      // the unique namespace under which the local storage will be created
      // so every new instance of the storage will be saving its data into
      // <namespace>[other-name]
      namespace: 'bumblebee'
    },

    'js/apps/discovery/main': {

      core: {
        controllers: {
          FeedbackMediator: 'js/wraps/discovery_mediator',
          QueryMediator: 'js/components/query_mediator',
          Diagnostics: 'js/bugutils/diagnostics',
          AlertsController: 'js/wraps/alerts_mediator',
          Orcid: 'js/modules/orcid/module'
        },
        services: {
          Api: 'js/services/api',
          PubSub: 'js/services/pubsub',
          Navigator: 'js/apps/discovery/navigator',
          PersistentStorage: 'js/services/storage',
          HistoryManager: 'js/components/history_manager'
        },
        objects: {
          User: 'js/components/user',
          Session: 'js/components/session',
          DynamicConfig: 'discovery.vars',
          MasterPageManager: 'js/page_managers/master',
          AppStorage: 'js/components/app_storage',
          RecaptchaManager: 'js/components/recaptcha_manager',
          CSRFManager: "js/components/csrf_manager",
          LibraryController: 'js/components/library_controller',
          DocStashController: 'js/components/doc_stash_controller'
        },
        modules: {
          FacetFactory: 'js/widgets/facet/factory'
        }
      },
      widgets: {
        LandingPage: 'js/wraps/landing_page_manager/landing_page_manager',
        SearchPage: 'js/wraps/results_page_manager',
        DetailsPage: 'js/wraps/abstract_page_manager/abstract_page_manager',
        AuthenticationPage: 'js/wraps/authentication_page_manager',
        SettingsPage: 'js/wraps/user_settings_page_manager/user_page_manager',
        OrcidPage: 'js/wraps/orcid_page_manager/orcid_page_manager',
        OrcidInstructionsPage: 'js/wraps/orcid-instructions-page-manager/manager',

        LibrariesPage: 'js/wraps/libraries_page_manager/libraries_page_manager',
        HomePage: 'js/wraps/home_page_manager/home_page_manager',
        PublicLibrariesPage: 'js/wraps/public_libraries_page_manager/public_libraries_manager',
        ErrorPage: 'js/wraps/error_page_manager/error_page_manager',

        Authentication: 'js/widgets/authentication/widget',
        UserSettings: 'js/widgets/user_settings/widget',
        UserPreferences: 'js/widgets/preferences/widget',
        LibraryImport: 'js/widgets/library_import/widget',
        BreadcrumbsWidget: 'js/widgets/filter_visualizer/widget',
        NavbarWidget: 'js/widgets/navbar/widget',
        UserNavbarWidget: 'js/widgets/user_navbar/widget',
        AlertsWidget: 'js/widgets/alerts/widget',
        ClassicSearchForm: 'js/widgets/classic_form/widget',
        SearchWidget: 'js/widgets/search_bar/search_bar_widget',
        PaperSearchForm: 'js/widgets/paper_search_form/widget',
        Results: 'js/widgets/results/widget',
        QueryInfo: 'js/widgets/query_info/query_info_widget',
        QueryDebugInfo: 'js/widgets/api_query/widget',
        ExportWidget: 'es6!js/widgets/export/widget.jsx',
        Sort: 'es6!js/widgets/sort/widget.jsx',
        ExportDropdown: 'js/wraps/export_dropdown',
        VisualizationDropdown: 'js/wraps/visualization_dropdown',
        AuthorNetwork: 'js/wraps/author_network',
        PaperNetwork: 'js/wraps/paper_network',
        ConceptCloud: 'js/widgets/wordcloud/widget',
        BubbleChart: 'js/widgets/bubble_chart/widget',
        AuthorAffiliationTool: 'es6!js/widgets/author_affiliation_tool/widget.jsx',

        Metrics: 'js/widgets/metrics/widget',
        CitationHelper: 'js/widgets/citation_helper/widget',
        OrcidBigWidget: 'js/modules/orcid/widget/widget',
        OrcidSelector: 'es6!js/widgets/orcid-selector/widget.jsx',

        AffiliationFacet: 'js/wraps/affiliation_facet',
        AuthorFacet: 'js/wraps/author_facet',
        BibgroupFacet: 'js/wraps/bibgroup_facet',
        BibstemFacet: 'js/wraps/bibstem_facet',
        DataFacet: 'js/wraps/data_facet',
        DatabaseFacet: 'js/wraps/database_facet',
        GrantsFacet: 'js/wraps/grants_facet',
        KeywordFacet: 'js/wraps/keyword_facet',
        ObjectFacet: 'js/wraps/simbad_object_facet',
        NedObjectFacet: 'js/wraps/ned_object_facet',
        RefereedFacet: 'js/wraps/refereed_facet',
        VizierFacet: 'js/wraps/vizier_facet',
        GraphTabs: 'js/wraps/graph_tabs',
        FooterWidget: 'js/widgets/footer/widget',
        PubtypeFacet: 'js/wraps/pubtype_facet',

        ShowAbstract: 'js/widgets/abstract/widget',
        ShowGraphics: 'js/widgets/graphics/widget',
        ShowGraphicsSidebar: 'js/wraps/sidebar-graphics-widget',
        ShowReferences: 'js/wraps/references',
        ShowCitations: 'js/wraps/citations',
        ShowCoreads: 'js/wraps/coreads',
        MetaTagsWidget: 'js/widgets/meta_tags/widget',
        //can't camel case because router only capitalizes first letter
        ShowTableofcontents: 'js/wraps/table_of_contents',
        ShowResources: 'es6!js/widgets/resources/widget.jsx',
        ShowAssociated: 'es6!js/widgets/associated/widget.jsx',
        ShowRecommender: 'js/widgets/recommender/widget',
        ShowMetrics: 'js/wraps/paper_metrics',
        ShowPaperExport: 'js/wraps/paper_export',
        ShowLibraryAdd: 'js/wraps/abstract_page_library_add/widget',

        IndividualLibraryWidget: 'js/widgets/library_individual/widget',
        AllLibrariesWidget: 'js/widgets/libraries_all/widget',
        LibraryListWidget: 'js/widgets/library_list/widget'
      },
      plugins: {}
    }
  },

  // Configuration for the facades (you can pick specific implementation, just for your
  // application) see http://requirejs.org/docs/api.html#config-map
  map: {
    '*': {
      'pubsub_service_impl': 'js/services/default_pubsub'
    }
  },

  paths: {

    //TODO: these libs will need manual optimization (they dont come with minified sources)
    //TODO: require-handlebars-js, d3-cloud, jquery-hoverIntent, dsjslib/cache, query-builder

    // bumblebee components (here we'll lists simple names), paths are relative
    // to the config (the module that bootstraps our application; look at the html)
    // as a convention, all modules should be loaded using 'symbolic' names
    'config': './discovery.config',
    'main': 'js/apps/discovery/main',
    'router': 'js/apps/discovery/router',
    'analytics': 'js/components/analytics',

    // Opt for Lo-Dash Underscore compatibility build over Underscore.
    'underscore': [
      '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.2/lodash.min',
      'libs/lodash/lodash.compat'
    ],

    // 3rd party dependencies
    // I can't for the life of my figure out how to swap non-minified libs in dev
    // to minified libs in the r.js optimize task
    'async': 'libs/requirejs-plugins/async',
    'babel': 'libs/requirejs-babel-plugin/babel-5.8.34.min',
    'backbone': [
      '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
      'libs/backbone/backbone'
    ],
    'backbone-validation': [
      '//cdnjs.cloudflare.com/ajax/libs/backbone.validation/0.11.3/backbone-validation-amd-min',
      'libs/backbone-validation/backbone-validation'
    ],
    'backbone.stickit': [
      '//cdnjs.cloudflare.com/ajax/libs/backbone.stickit/0.8.0/backbone.stickit.min',
      'libs/backbone.stickit/backbone.stickit'
    ],
    'backbone.wreqr': [
      '//cdnjs.cloudflare.com/ajax/libs/backbone.wreqr/1.0.0/backbone.wreqr.min',
      'libs/backbone.wreqr/lib/backbone.wreqr'
    ],
    'bootstrap': [
      '//ajax.aspnetcdn.com/ajax/bootstrap/3.3.5/bootstrap.min',
      'libs/bootstrap/bootstrap'
    ],
    'cache': 'libs/dsjslib/lib/Cache',
    'chai': '../bower_components/chai/chai',
    'classnames': [
      '//cdnjs.cloudflare.com/ajax/libs/classnames/2.2.5/index.min',
      '../bower_components/classnames/index'
    ],
    'clipboard': [
      '//cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.7.1/clipboard.min',
      'libs/clipboard/clipboard'
    ],
    'create-react-class': [
      '//cdn.jsdelivr.net/npm/create-react-class@15.6.2/create-react-class.min',
      'libs/create-react-class/index'
    ],
    'd3': [
      '//cdnjs.cloudflare.com/ajax/libs/d3/3.4.6/d3.min',
      'libs/d3/d3.min'
    ],
    'd3-cloud': [
      '//cdnjs.cloudflare.com/ajax/libs/d3-cloud/1.2.5/d3.layout.cloud.min',
      'libs/d3-cloud/d3.layout.cloud'
    ],
    'enzyme': 'libs/enzyme/enzyme',
    'es5-shim': [
      '//cdnjs.cloudflare.com/ajax/libs/es5-shim/4.5.10/es5-shim.min',
      'libs/es5-shim/es5-shim'
    ],
    'es6': 'libs/requirejs-babel-plugin/es6',
    'filesaver': [
      '//cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.8/FileSaver.min',
      'libs/file-saver/index'
    ],
    'google-analytics': [
      '//google-analytics.com/analytics',
      'data:application/javascript,'
    ],
    'google-recaptcha': [
      '//google.com/recaptcha/api.js?&render=explicit&onload=onRecaptchaLoad',
      'data:application/javascript,'
    ],
    'hbs': 'libs/require-handlebars-plugin/hbs',
    'immutable': 'libs/immutable/index',
    'jquery': [
      '//ajax.aspnetcdn.com/ajax/jQuery/jquery-2.0.3.min',
      'libs/jquery/jquery'
    ],
    'jquery-querybuilder': 'libs/jQuery-QueryBuilder/query-builder',
    'jquery-ui': [
      '//ajax.aspnetcdn.com/ajax/jquery.ui/1.10.4/jquery-ui.min',
      'libs/jqueryui/jquery-ui'
    ],
    'jsonpath': [
      '//cdn.jsdelivr.net/npm/jsonpath@0.2.12/jsonpath.min',
      'libs/jsonpath/jsonpath'
    ],
    'marionette': [
      '//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.5/backbone.marionette.min',
      'libs/marionette/backbone.marionette'
    ],
    'mathjax': [
      '//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_HTML&amp;delayStartupUntil=configured',
      'libs/mathjax/index'
    ],
    'mocha': 'libs/mocha/mocha',
    'moment': [
      '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min',
      'libs/momentjs/moment'
    ],
    'persist-js': [
      '//cdn.jsdelivr.net/npm/persist-js@0.3.1/src/persist.min',
      'libs/persist-js/src/persist'
    ],
    'react': [
      '//cdnjs.cloudflare.com/ajax/libs/react/15.6.1/react-with-addons.min',
      'libs/react/index'
    ],
    'react-bootstrap': [
      '//cdnjs.cloudflare.com/ajax/libs/react-bootstrap/0.32.1/react-bootstrap.min',
      'libs/react-bootstrap/index',
    ],
    'react-dom': [
      '//cdnjs.cloudflare.com/ajax/libs/react/15.6.1/react-dom.min',
      'libs/react-dom/index'
    ],
    'react-prop-types': [
      '//cdnjs.cloudflare.com/ajax/libs/prop-types/15.6.0/prop-types.min',
      'libs/react-prop-types/index'
    ],
    'react-redux': [
      '//cdnjs.cloudflare.com/ajax/libs/react-redux/4.4.5/react-redux.min',
      'libs/react-redux/index'
    ],
    'redux': [
      '//cdnjs.cloudflare.com/ajax/libs/redux/3.5.2/redux.min',
      'libs/redux/index'
    ],
    'redux-immutable': 'libs/redux-immutable/index',
    'redux-thunk': [
      '//cdnjs.cloudflare.com/ajax/libs/redux-thunk/2.1.0/redux-thunk.min',
      'libs/redux-thunk/index'
    ],
    'select2': [
      '//cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/js/select2.min',
      'libs/select2/select2'
    ],
    'sinon': [
      '//cdnjs.cloudflare.com/ajax/libs/sinon.js/1.9.0/sinon.min',
      '../bower_components/sinon/index'
    ],
    'sprintf': [
      '//cdnjs.cloudflare.com/ajax/libs/sprintf/1.0.2/sprintf.min',
      'libs/sprintf/sprintf'
    ],
    'utils': 'js/utils',
    'reselect': [
      '//cdnjs.cloudflare.com/ajax/libs/reselect/3.0.1/reselect.min',
      'libs/reselect'
    ]
  },

  hbs: {
    'templateExtension': 'html',
    helpers: false
  },

  shim: {

    "Backbone": {
      deps: ["backbone"],
      exports: "Backbone"
    },
    'mocha': {
      exports: 'mocha'
    },
    'backbone.stickit': {
      deps: ['backbone']
    },
    'backbone-validation': {
      deps: ['backbone']
    },
    'bootstrap': {
      deps: ['jquery', 'jquery-ui']
    },
    'backbone': {
      deps: ['jquery', 'underscore']
    },

    marionette: {
      deps: ['jquery', 'underscore', 'backbone'],
      exports: 'Marionette'
    },

    analytics: {
      'deps': ['google-analytics']
    },

    cache: {
      exports: 'Cache'
    },

    'jquery-querybuilder': {
      deps: ['jquery']
    },

    'filesaver': {
      exports: 'saveAs'
    },

    'd3': {
      exports: 'd3'
    },

    'd3-cloud': {
      deps: ['d3']
    },

    'google-analytics': {
      exports: '__ga__'
    },

    'jquery-ui': {
      deps: ['jquery']
    },

    'sprintf': {
      exports: 'sprintf'
    },

    'persist-js': {
      exports: 'Persist'
    },

    mathjax: {
      exports: "MathJax",
      init: function() {
        MathJax.Hub.Config({
          messageStyle: 'none',
          HTML: ["input/TeX", "output/HTML-CSS"],
          TeX: {
            extensions: ["AMSmath.js", "AMSsymbols.js"],
            equationNumbers: { autoNumber: "AMS" }
          },
          extensions: ["tex2jax.js"],
          jax: ["input/TeX", "output/HTML-CSS"],
          tex2jax: {
            inlineMath: [
              ['$', '$'],
              ["\\(", "\\)"]
            ],
            displayMath: [
              ['$$', '$$'],
              ["\\[", "\\]"]
            ],
            processEscapes: true
          },
          "HTML-CSS": {
            availableFonts: ["TeX"],
            linebreaks: { automatic: true }
          }
        });
        MathJax.Hub.Startup.onload();
        return MathJax;
      }
    },

    'redux-immutable': {
      deps: ['immutable']
    }
  },

  callback: function() {

    window.GoogleAnalyticsObject = '__ga__';

    require(['discovery.vars', 'google-analytics', 'analytics'], function(config) {
      var qa = window[window.GoogleAnalyticsObject];
      qa.l = Date.now();
      qa('create', config.googleTrackingCode || '', config.googleTrackingOptions);
    });

    require([
      'hbs/handlebars'
    ], function(
      Handlebars
    ) {

      // register helpers
      // http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/#comment-44

      //eg  (where current is a variable): {{#compare current 1 operator=">"}}

      Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {
        var operators, result, operator;
        if (arguments.length < 3) {
          throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }

        if (options === undefined || !options.hash || !options.hash.operator) {
          operator = "===";
        } else {
          operator = options.hash.operator;
        }

        operators = {
          '==': function(l, r) { return l == r; },
          '===': function(l, r) { return l === r; },
          '!=': function(l, r) { return l != r; },
          '!==': function(l, r) { return l !== r; },
          '<': function(l, r) { return l < r; },
          '>': function(l, r) { return l > r; },
          '<=': function(l, r) { return l <= r; },
          '>=': function(l, r) { return l >= r; },
          'typeof': function(l, r) { return typeof l == r; }
        };
        if (!operators[operator]) {
          throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }
        result = operators[operator](lvalue, rvalue);
        if (result) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      });
    });

    //set validation callbacks used by authentication and user settings widgets
    require(['backbone-validation'], function() {

      //this allows for instant validation of form fields using the backbone-validation plugin
      _.extend(Backbone.Validation.callbacks, {
        valid: function(view, attr, selector) {
          var $el = view.$('input[name=' + attr + ']');

          $el.closest('.form-group')
          .removeClass('has-error')
          .find('.help-block')
          .html('')
          .addClass('no-show');

        },
        invalid: function(view, attr, error, selector) {
          var $el = view.$('[name=' + attr + ']');
          $group = $el.closest('.form-group');

          if (view.submit === true) {
            //only show error states if there has been a submit event
            $group.addClass('has-error');
            $group.find('.help-block').html(error).removeClass('no-show');
          }
        }
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
            var g = d3.select(this),
            items = {},
            svg = d3.select(g.property("nearestViewportElement")),
            legendPadding = g.attr("data-style-padding") || 5,
            lb = g.selectAll(".legend-box").data([true]),
            li = g.selectAll(".legend-items").data([true])

            lb.enter().append("rect").classed("legend-box", true)
            li.enter().append("g").classed("legend-items", true)

            try {
              svg.selectAll("[data-legend]").each(function() {
                var self = d3.select(this)
                items[self.attr("data-legend")] = {
                  pos: self.attr("data-legend-pos") || this.getBBox().y,
                  color: self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") :
                    self.style("fill") != 'none' ? self.style("fill") : self.style("stroke")
                }
              })
            } catch (e) {
              // firefox tends to have issue with hidden elements
              // should continue if it doesn't die here
            }

            items = d3.entries(items).sort(function(a, b) { return a.value.pos - b.value.pos });
            var itemOffset = 0;
            li.selectAll("text")
              .data(items, function(d) { return d.key })
              .call(function(d) { d.enter().append("text") })
              .call(function(d) { d.exit().remove() })
              .attr("y", function(d, i) {
                if (i === 0) { return '0em'; }
                itemOffset += 0.2;
                return (i + itemOffset) + "em"
              })
              .attr("x", "1em")
              .text(function(d) {; return d.key })

            li.selectAll("circle")
              .data(items, function(d) { return d.key })
              .call(function(d) { d.enter().append("circle") })
              .call(function(d) { d.exit().remove() })
              .attr("cy", function(d, i) { return i - 0.25 + "em" })
              .attr("cx", 0)
              .attr("r", "0.4em")
              .style("fill", function(d) { return d.value.color })

            // Reposition and resize the box
            var lbbox = li[0][0].getBBox();
            lb.attr("x", (lbbox.x - legendPadding))
              .attr("y", (lbbox.y - legendPadding))
              .attr("height", (lbbox.height + 2 * legendPadding))
              .attr("width", (lbbox.width + 2 * legendPadding))
          });
          return g;
        }
      })();
    });

    // for pre-rendered abstract pages
    window.__PREPARE_STATIC_PAGE__ = function (cb) {
      require(['jquery'], function ($) {
        var toRemove = [
          '#toggle-aff',
          '#toggle-more-authors',
          'div.navbar-collapse',
          'head>script',
          '.popover'
        ];
        $(toRemove.join(', ')).remove();
        $('#authors-and-aff').prepend('<div style="height:20px;"></div>')
        $('.s-nav-container nav>[data-widget-id]>div')
          .not('[data-widget-id~="ShowAbstract"]>div').addClass('s-nav-inactive').attr('href', '#');
        $('form[name="main-query"] input').addClass('disabled');
        $('form[name="main-query"] button[type="submit"]>i').addClass('disabled fa-spin fa-spinner');
        $('head').append('<script>window.__PRERENDERED = true;</script>');
        cb && cb(function () {
          return document.documentElement.outerHTML;
        });
      });
    };
  }
});
