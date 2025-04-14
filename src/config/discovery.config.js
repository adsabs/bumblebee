// Main config file for the Discovery application
require.config({
  // Initialize the application with the main application file or if we run
  // as a test, then load the test unittests
  deps: (function() {
    if (typeof window !== 'undefined' && window.skipMain) {
      return ['common.config'];
    }
    return ['config/common.config', 'js/apps/discovery/main'];
  })(),

  // this will be overridden in the compiled file
  waitSeconds: 30,

  // Configuration we want to make available to modules of ths application
  // see: http://requirejs.org/docs/api.html#config-moduleconfig
  config: {
    es6: {
      modules: undefined,
    },

    'js/components/persistent_storage': {
      // the unique namespace under which the local storage will be created
      // so every new instance of the storage will be saving its data into
      // <namespace>[other-name]
      namespace: 'bumblebee',
    },

    'js/apps/discovery/main':{
      core: {
        controllers: {
          FeedbackMediator: 'cdn!js/wraps/discovery_mediator',
          QueryMediator: 'cdn!js/components/query_mediator',
          Diagnostics: 'cdn!js/bugutils/diagnostics',
          AlertsController: 'cdn!js/wraps/alerts_mediator',
          Orcid: 'cdn!js/modules/orcid/module',
          SecondOrderController: 'cdn!js/components/second_order_controller',
          HotkeysController: 'cdn!js/components/hotkeys_controller',
          Experiments: 'cdn!js/components/experiments',
        },
        services: {
          Api: 'cdn!js/services/api',
          PubSub: 'cdn!js/services/pubsub',
          Navigator: 'cdn!js/apps/discovery/navigator',
          PersistentStorage: 'cdn!js/services/storage',
          HistoryManager: 'cdn!js/components/history_manager',
        },
        objects: {
          User: 'cdn!js/components/user',
          Session: 'cdn!js/components/session',
          DynamicConfig: 'cdn!config/discovery.vars',
          MasterPageManager: 'cdn!js/page_managers/master',
          AppStorage: 'cdn!js/components/app_storage',
          CSRFManager: 'cdn!js/components/csrf_manager',
          LibraryController: 'cdn!js/components/library_controller',
          DocStashController: 'cdn!js/components/doc_stash_controller',
          Utils: 'cdn!js/utils',
        },
        modules: {
          FacetFactory: 'cdn!js/widgets/facet/factory',
        },
      },
      widgets: {
        LandingPage: 'cdn!js/wraps/landing_page_manager/landing_page_manager',
        SearchPage: 'cdn!js/wraps/results_page_manager',
        DetailsPage: 'cdn!js/wraps/abstract_page_manager/abstract_page_manager',
        AuthenticationPage: 'cdn!js/wraps/authentication_page_manager',
        SettingsPage: 'cdn!js/wraps/user_settings_page_manager/user_page_manager',
        OrcidPage: 'cdn!js/wraps/orcid_page_manager/orcid_page_manager',
        OrcidInstructionsPage: 'cdn!js/wraps/orcid-instructions-page-manager/manager',
        ReactPageManager: 'cdn!js/react/PageManager',

        LibrariesPage: 'cdn!js/wraps/libraries_page_manager/libraries_page_manager',
        HomePage: 'cdn!js/wraps/home_page_manager/home_page_manager',
        PublicLibrariesPage: 'cdn!js/wraps/public_libraries_page_manager/public_libraries_manager',
        ErrorPage: 'cdn!js/wraps/error_page_manager/error_page_manager',

        Authentication: 'cdn!js/widgets/authentication/widget',
        UserSettings: 'cdn!js/widgets/user_settings/widget',
        UserPreferences: 'cdn!js/widgets/preferences/widget',
        LibraryImport: 'cdn!js/widgets/library_import/widget',
        BreadcrumbsWidget: 'cdn!js/widgets/filter_visualizer/widget',
        NavbarWidget: 'cdn!js/widgets/navbar/widget',
        UserNavbarWidget: 'cdn!js/widgets/user_navbar/widget',
        AlertsWidget: 'cdn!js/widgets/alerts/widget',
        ClassicSearchForm: 'cdn!js/widgets/classic_form/widget',
        SearchWidget: 'cdn!js/widgets/search_bar/search_bar_widget',
        PaperSearchForm: 'cdn!js/widgets/paper_search_form/widget',
        Results: 'cdn!js/widgets/results/widget',
        QueryInfo: 'cdn!js/widgets/query_info/query_info_widget',
        QueryDebugInfo: 'cdn!js/widgets/api_query/widget',
        ExportWidget: 'cdn!es6!js/widgets/export/widget.jsx',
        Sort: 'cdn!es6!js/widgets/sort/widget.jsx',
        ExportDropdown: 'cdn!js/wraps/export_dropdown',
        VisualizationDropdown: 'cdn!js/wraps/visualization_dropdown',
        AuthorNetwork: 'cdn!js/wraps/author_network',
        PaperNetwork: 'cdn!js/wraps/paper_network',
        ConceptCloud: 'cdn!js/widgets/wordcloud/widget',
        BubbleChart: 'cdn!js/widgets/bubble_chart/widget',
        AuthorAffiliationTool: 'cdn!es6!js/widgets/author_affiliation_tool/widget.jsx',

        Metrics: 'cdn!js/widgets/metrics/widget',
        CitationHelper: 'cdn!js/widgets/citation_helper/widget',
        OrcidBigWidget: 'cdn!js/modules/orcid/widget/widget',
        OrcidSelector: 'cdn!es6!js/widgets/orcid-selector/widget.jsx',

        AffiliationFacet: 'cdn!js/wraps/affiliation_facet',
        AuthorFacet: 'cdn!js/wraps/author_facet',
        BibgroupFacet: 'cdn!js/wraps/bibgroup_facet',
        BibstemFacet: 'cdn!js/wraps/bibstem_facet',
        DataFacet: 'cdn!js/wraps/data_facet',
        DatabaseFacet: 'cdn!js/wraps/database_facet',
        GrantsFacet: 'cdn!js/wraps/grants_facet',
        KeywordFacet: 'cdn!js/wraps/keyword_facet',
        ObjectFacet: 'cdn!js/wraps/simbad_object_facet',
        NedObjectFacet: 'cdn!js/wraps/ned_object_facet',
        RefereedFacet: 'cdn!js/wraps/refereed_facet',
        VizierFacet: 'cdn!js/wraps/vizier_facet',
        GraphTabs: 'cdn!js/wraps/graph_tabs',
        FooterWidget: 'cdn!js/widgets/footer/widget',
        PubtypeFacet: 'cdn!js/wraps/pubtype_facet',

        ShowAbstract: 'cdn!js/widgets/abstract/widget',
        ShowGraphics: 'cdn!js/widgets/graphics/widget',
        ShowGraphicsSidebar: 'cdn!js/wraps/sidebar-graphics-widget',
        ShowReferences: 'cdn!js/wraps/references',
        ShowCitations: 'cdn!js/wraps/citations',
        ShowCoreads: 'cdn!js/wraps/coreads',
        ShowSimilar: 'cdn!js/wraps/similar',
        MetaTagsWidget: 'cdn!js/widgets/meta_tags/widget',
        ShowToc: 'cdn!js/wraps/table_of_contents',
        ShowResources: 'cdn!es6!js/widgets/resources/widget.jsx',
        ShowAssociated: 'cdn!es6!js/widgets/associated/widget.jsx',
        ShowRecommender: 'cdn!js/widgets/recommender/widget',
        ShowMetrics: 'cdn!js/wraps/paper_metrics',
        ShowExportcitation: 'cdn!js/wraps/paper_export',
        ShowFeedback: 'cdn!reactify!js/react/BumblebeeWidget?FeedbackForms',
        ShowLibraryAdd: 'cdn!js/wraps/abstract_page_library_add/widget',

        IndividualLibraryWidget: 'cdn!js/widgets/library_individual/widget',
        LibraryActionsWidget: 'cdn!es6!js/widgets/library_actions/widget.jsx',
        AllLibrariesWidget: 'cdn!js/widgets/libraries_all/widget',
        LibraryListWidget: 'cdn!js/widgets/library_list/widget',

        MyAdsFreeform: 'cdn!reactify!js/react/BumblebeeWidget?MyAdsFreeform',
        MyAdsDashboard: 'cdn!reactify!js/react/BumblebeeWidget?MyAdsDashboard',
        RecommenderWidget: 'cdn!reactify!js/react/BumblebeeWidget?Recommender',
      },
      plugins: {},
    }
  },

  // Configuration for the facades (you can pick specific implementation, just for your
  // application) see http://requirejs.org/docs/api.html#config-map
  map: {
    '*': {
      pubsub_service_impl: 'js/services/default_pubsub',
    },
  },

  paths: {
    // bumblebee components (here we'll lists simple names), paths are relative
    // to the config (the module that bootstraps our application; look at the html)
    // as a convention, all modules should be loaded using 'symbolic' names

    // **********************
    // *** internal paths ***
    // **********************
    router: 'js/apps/discovery/router',
    analytics: 'js/components/analytics',
    utils: 'js/utils',
    reactify: 'js/plugins/reactify',
    cdn: 'js/plugins/cdn',
    es6: 'js/plugins/es6',
    suit: 'shared/dist/index.umd.development',
    // **********************

    // *************************************
    // *** development-only dependencies ***
    // *************************************
    babel: 'libs/babel',
    async: 'libs/requirejs-plugins/async',
    hbs: 'libs/requirejs-plugins/hbs',
    sinon: 'libs/sinon',
    enzyme: 'libs/enzyme',
    mocha: 'libs/mocha/mocha',
    chai: 'libs/chai',
    // *************************************

    // *******************************
    // *** production dependencies ***
    // *******************************

    sprintf: [
      'https://cdn.jsdelivr.net/npm/sprintf-js@1.1.3/src/sprintf.min',
      'https://unpkg.com/sprintf-js@1.1.3/dist/sprintf.min',
      'https://ads-assets.pages.dev/libs/sprintf',
      'libs/sprintf',
    ],

    underscore: [
      'https://cdn.jsdelivr.net/npm/lodash@2.4.2/dist/lodash.compat.min',
      'https://unpkg.com/lodash@2.4.2/dist/lodash.compat.min',
      'https://ads-assets.pages.dev/libs/lodash',
      'libs/lodash',
    ],
    backbone: [
      'https://cdn.jsdelivr.net/npm/backbone@1.1.2/backbone-min',
      'https://unpkg.com/backbone@1.1.2/backbone-min',
      'https://ads-assets.pages.dev/libs/backbone',
      'libs/backbone',
    ],
    'backbone-validation': [
      'https://cdn.jsdelivr.net/npm/backbone-validation@0.11.3/dist/backbone-validation-amd-min',
      'https://unpkg.com/backbone-validation@0.11.3/dist/backbone-validation-amd-min',
      'https://ads-assets.pages.dev/libs/backbone',
      'libs/backbone-validation',
    ],
    'backbone.stickit': [
      'https://cdn.jsdelivr.net/npm/backbone.stickit@0.9.2/backbone.stickit',
      'https://unpkg.com/backbone.stickit@0.9.2/backbone.stickit',
      'https://ads-assets.pages.dev/libs/backbone.stickit',
      'libs/backbone.stickit',
    ],
    'backbone.wreqr': [
      'https://cdn.jsdelivr.net/npm/backbone.wreqr@1.4.0/lib/backbone.wreqr.min',
      'https://unpkg.com/backbone.wreqr@1.4.0/lib/backbone.wreqr.min',
      'https://ads-assets.pages.dev/libs/backbone.wreqr',
      'libs/backbone.wreqr',
    ],
    bootstrap: [
      'https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/js/bootstrap.min',
      'https://unpkg.com/bootstrap@3.3.7/dist/js/bootstrap.min',
      'https://ads-assets.pages.dev/libs/bootstrap/bootstrap',
      'libs/bootstrap/bootstrap',
    ],
    bowser: [
      'https://cdn.jsdelivr.net/npm/bowser@2.11.0/es5',
      'https://unpkg.com/bowser@2.11.0/es5',
      'https://ads-assets.pages.dev/libs/bowser',
      'libs/bowser',
    ],
    clipboard: [
      'https://cdn.jsdelivr.net/npm/clipboard@1.7.1/dist/clipboard.min',
      'https://unpkg.com/clipboard@1.7.1/dist/clipboard.min',
      'https://ads-assets.pages.dev/libs/clipboard',
      'libs/clipboard',
    ],
    d3: [
      'https://cdn.jsdelivr.net/npm/d3@3.5.17/d3.min',
      'https://unpkg.com/d3@3.5.17/d3.min',
      'https://ads-assets.pages.dev/libs/d3',
      'libs/d3',
    ],
    'd3-cloud': [
      'https://cdn.jsdelivr.net/npm/d3-cloud@1.2.5/build/d3.layout.cloud',
      'https://unpkg.com/d3-cloud@1.2.5/build/d3.layout.cloud',
      'https://ads-assets.pages.dev/libs/d3-cloud',
      'libs/d3-cloud',
    ],
    filesaver: [
      'https://cdn.jsdelivr.net/npm/file-saver@1.3.8/FileSaver.min',
      'https://unpkg.com/file-saver@1.3.8/FileSaver.min',
      'https://ads-assets.pages.dev/libs/file-saver',
      'libs/file-saver',
    ],
    hotkeys: [
      'https://cdn.jsdelivr.net/npm/hotkeys-js@3.8.7/dist/hotkeys.min',
      'https://unpkg.com/hotkeys-js@3.8.7/dist/hotkeys.min',
      'https://ads-assets.pages.dev/libs/hotkeys',
      'libs/hotkeys',
    ],
    jquery: [
      'https://cdn.jsdelivr.net/npm/jquery@2.2.4/dist/jquery.min',
      'https://unpkg.com/jquery@2.2.4/dist/jquery.min',
      'https://ads-assets.pages.dev/libs/jquery',
      'libs/jquery',
    ],
    'jquery-ui': [
      'https://code.jquery.com/ui/1.12.1/jquery-ui.min',
      'https://unpkg.com/jquery-ui@1.12.1/jquery-ui.min',
      'https://ads-assets.pages.dev/libs/jquery-ui',
      'libs/jquery-ui',
    ],
    jsonpath: [
      'https://cdn.jsdelivr.net/npm/jsonpath@0.2.12/jsonpath.min',
      'https://unpkg.com/jsonpath@0.2.12/jsonpath.min',
      'https://ads-assets.pages.dev/libs/jsonpath',
      'libs/jsonpath',
    ],
    marionette: [
      'https://cdn.jsdelivr.net/npm/backbone.marionette@2.4.5/lib/backbone.marionette.min',
      'https://unpkg.com/backbone.marionette@2.4.5/lib/backbone.marionette.min',
      'https://ads-assets.pages.dev/libs/backbone.marionette',
      'libs/backbone.marionette',
    ],
    mathjax: [
      'https://cdn.jsdelivr.net/npm/mathjax@2.7.4/MathJax.js?config=TeX-AMS_HTML&amp;delayStartupUntil=configured',
      'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML&amp;delayStartupUntil=configured',
      'https://ads-assets.pages.dev/libs/mathjax/mathjax',
      'libs/mathjax/mathjax',
    ],
    moment: [
      'https://cdn.jsdelivr.net/npm/moment@2.22.2/min/moment.min',
      'https://unpkg.com/moment@2.22.2/min/moment.min',
      'https://ads-assets.pages.dev/libs/moment',
      'libs/moment',
    ],
    'persist-js': [
      'https://cdn.jsdelivr.net/npm/persist-js@0.3.1/persist-min',
      'https://unpkg.com/persist-js@0.3.1/persist-min',
      'https://ads-assets.pages.dev/libs/persist-js',
      'libs/persist-js',
    ],
    react: [
      'https://cdn.jsdelivr.net/npm/react@16/umd/react.development',
      'https://unpkg.com/react@16/umd/react.development',
      'https://ads-assets.pages.dev/libs/react',
      'libs/react',
    ],
    'react-bootstrap': [
      'https://cdn.jsdelivr.net/npm/react-bootstrap@0.33.0/dist/react-bootstrap.min',
      'https://unpkg.com/react-bootstrap@0.33.0/dist/react-bootstrap.min',
      'https://ads-assets.pages.dev/libs/react-bootstrap',
      'libs/react-bootstrap',
    ],
    'react-dom': [
      'https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min',
      'https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min',
      'https://ads-assets.pages.dev/libs/react-dom',
      'libs/react-dom',
    ],
    'prop-types': [
      'https://cdn.jsdelivr.net/npm/prop-types@15.6/prop-types.min',
      'https://unpkg.com/prop-types@15.6/prop-types.min',
      'https://ads-assets.pages.dev/libs/prop-types',
      'libs/prop-types',
    ],
    'react-redux': [
      'https://cdn.jsdelivr.net/npm/react-redux@7.2.4/dist/react-redux.min',
      'https://unpkg.com/react-redux@7.2.4/dist/react-redux.min',
      'https://ads-assets.pages.dev/libs/react-redux',
      'libs/react-redux',
    ],
    'react-transition-group': [
      'https://cdn.jsdelivr.net/npm/react-transition-group@2.4.0/dist/react-transition-group.min',
      'https://unpkg.com/react-transition-group@2.4.0/dist/react-transition-group.min',
      'https://ads-assets.pages.dev/libs/react-transition-group',
      'libs/react-transition-group',
    ],
    redux: [
      'https://cdn.jsdelivr.net/npm/redux@4.0.5/dist/redux.min',
      'https://unpkg.com/redux@4.0.5/dist/redux.min',
      'https://ads-assets.pages.dev/libs/redux',
      'libs/redux',
    ],
    'redux-thunk': [
      'https://cdn.jsdelivr.net/npm/redux-thunk@2.3.0/dist/redux-thunk.min',
      'https://unpkg.com/redux-thunk@2.3.0/dist/redux-thunk.min',
      'https://ads-assets.pages.dev/libs/redux-thunk',
      'libs/redux-thunk',
    ],
    select2: [
      'https://cdn.jsdelivr.net/npm/select2@4.0.3/dist/js/select2.min',
      'https://unpkg.com/select2@4.0.3/dist/js/select2.min',
      'https://ads-assets.pages.dev/libs/select2/select2',
      'libs/select2/select2',
    ],
    'react-aria-menubutton': [
      'https://cdn.jsdelivr.net/npm/react-aria-menubutton@7.0.3/umd/ReactAriaMenuButton',
      'https://unpkg.com/react-aria-menubutton@7.0.3/umd/ReactAriaMenuButton',
      'https://ads-assets.pages.dev/libs/react-aria-menubutton',
      'libs/react-aria-menubutton',
    ],
    'react-hook-form': [
      'https://cdn.jsdelivr.net/npm/react-hook-form@6.11.0/dist/index.umd.production.min',
      'https://unpkg.com/react-hook-form@6.11.0/dist/index.umd.production.min',
      'https://ads-assets.pages.dev/libs/react-hook-form',
      'libs/react-hook-form',
    ],
    'react-is': [
      'https://cdn.jsdelivr.net/npm/react-is@17.0.2/umd/react-is.production.min',
      'https://unpkg.com/react-is@17.0.2/umd/react-is.production.min',
      'https://ads-assets.pages.dev/libs/react-is',
      'libs/react-is',
    ],
    'react-data-table-component': [
      'https://cdn.jsdelivr.net/npm/react-data-table-component@6.11.7/dist/react-data-table-component.umd',
      'https://unpkg.com/react-data-table-component@6.11.7/dist/react-data-table-component.umd',
      'https://ads-assets.pages.dev/libs/react-data-table-component',
      'libs/react-data-table-component',
    ],
    'react-window': [
      'https://cdn.jsdelivr.net/npm/react-window@1.8.6/dist/index-prod.umd',
      'https://unpkg.com/react-window@1.8.6/dist/index-prod.umd',
      'https://ads-assets.pages.dev/libs/react-window',
      'libs/react-window',
    ],
    'react-async': [
      'https://cdn.jsdelivr.net/npm/react-async@10.0.1/dist-umd/index',
      'https://unpkg.com/react-async@10.0.1/dist-umd/index',
      'https://ads-assets.pages.dev/libs/react-async',
      'libs/react-async',
    ],
    'regenerator-runtime': [
      'https://cdn.jsdelivr.net/npm/regenerator-runtime@0.13.9/runtime',
      'https://unpkg.com/regenerator-runtime@0.13.9/runtime',
      'https://ads-assets.pages.dev/libs/regenerator-runtime',
      'libs/regenerator-runtime',
    ],
    diff: [
      'https://cdn.jsdelivr.net/npm/diff@4.0.2/dist/diff.min',
      'https://unpkg.com/diff@4.0.2/dist/diff.min',
      'https://ads-assets.pages.dev/libs/diff',
      'libs/diff',
    ],
    'styled-components': [
      'https://cdn.jsdelivr.net/npm/styled-components@5.1.0/dist/styled-components.min',
      'https://unpkg.com/styled-components@5.1.0/dist/styled-components.min',
      'https://ads-assets.pages.dev/libs/styled-components',
      'libs/styled-components',
    ],
    '@hookform/resolvers': [
      'https://cdn.jsdelivr.net/npm/@hookform/resolvers@0.1.0/dist/index.umd.production.min',
      'https://unpkg.com/@hookform/resolvers@0.1.0/dist/index.umd.production.min',
      'https://ads-assets.pages.dev/libs/hookform',
      'libs/hookform',
    ],

    // Google analytics loaded locally only
    'google-analytics': [
      // to activate local tunnel (for us to collect all analytics data)
      // uncomment this; k12 should have ingress-nginx-proxy image deployed
      // that can proxy requests to /analytics
      // '/analytics/analytics'
      'https://ads-assets.pages.dev/libs/g',
      'libs/g',
      'data:application/javascript,',
    ],

    // require special handling, fetched via `grunt curl` task
    yup: ['https://ads-assets.pages.dev/libs/yup', 'libs/yup'],
    cache: ['https://ads-assets.pages.dev/libs/cache', 'libs/cache'],
    polyfill: ['https://ads-assets.pages.dev/libs/polyfill', 'libs/polyfill'],
    'react-flexview': ['https://ads-assets.pages.dev/libs/react-flexview', 'libs/react-flexview'],
    'array-flat-polyfill': ['https://ads-assets.pages.dev/libs/array-flat-polyfill', 'libs/array-flat-polyfill'],
    // *******************************
  },

  hbs: {
    templateExtension: 'html',
    helpers: false,
  },

  babel: {
    presets: ['env', 'react'],
  },

  shim: {
    Backbone: {
      deps: ['backbone'],
      exports: 'Backbone',
    },
    'backbone.stickit': {
      deps: ['backbone'],
    },
    'backbone-validation': {
      deps: ['backbone'],
    },
    bootstrap: {
      deps: ['jquery', 'jquery-ui'],
    },
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone',
    },

    marionette: {
      deps: ['jquery', 'underscore', 'backbone'],
      exports: 'Marionette',
    },

    cache: {
      exports: 'Cache',
    },

    mocha: {
      exports: 'mocha',
    },

    sinon: {
      exports: 'sinon',
    },

    filesaver: {
      exports: 'saveAs',
    },

    d3: {
      exports: 'd3',
    },

    'd3-cloud': {
      deps: ['d3'],
    },

    'google-analytics': {
      exports: '__ga__',
    },

    'jquery-ui': {
      deps: ['jquery'],
    },

    'jquery-querybuilder': {
      deps: ['jquery'],
    },

    sprintf: {
      exports: 'sprintf',
    },

    'persist-js': {
      exports: 'Persist',
    },
  },
});
