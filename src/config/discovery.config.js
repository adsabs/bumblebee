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
  waitSeconds: 7,

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

    'js/apps/discovery/main': {
      core: {
        controllers: {
          FeedbackMediator: 'js/wraps/discovery_mediator',
          QueryMediator: 'js/components/query_mediator',
          Diagnostics: 'js/bugutils/diagnostics',
          AlertsController: 'js/wraps/alerts_mediator',
          Orcid: 'js/modules/orcid/module',
          SecondOrderController: 'js/components/second_order_controller',
          HotkeysController: 'js/components/hotkeys_controller',
          Experiments: 'js/components/experiments',
        },
        services: {
          Api: 'js/services/api',
          PubSub: 'js/services/pubsub',
          Navigator: 'js/apps/discovery/navigator',
          PersistentStorage: 'js/services/storage',
          HistoryManager: 'js/components/history_manager',
        },
        objects: {
          User: 'js/components/user',
          Session: 'js/components/session',
          DynamicConfig: 'config/discovery.vars',
          MasterPageManager: 'js/page_managers/master',
          AppStorage: 'js/components/app_storage',
          RecaptchaManager: 'recaptcha!js/components/recaptcha_manager',
          CSRFManager: 'js/components/csrf_manager',
          LibraryController: 'js/components/library_controller',
          DocStashController: 'js/components/doc_stash_controller',
          Utils: 'utils',
        },
        modules: {
          FacetFactory: 'js/widgets/facet/factory',
        },
      },
      widgets: {
        LandingPage: 'js/wraps/landing_page_manager/landing_page_manager',
        SearchPage: 'js/wraps/results_page_manager',
        DetailsPage: 'js/wraps/abstract_page_manager/abstract_page_manager',
        AuthenticationPage: 'js/wraps/authentication_page_manager',
        SettingsPage: 'js/wraps/user_settings_page_manager/user_page_manager',
        OrcidPage: 'js/wraps/orcid_page_manager/orcid_page_manager',
        OrcidInstructionsPage:
          'js/wraps/orcid-instructions-page-manager/manager',
        ReactPageManager: 'js/react/PageManager',

        LibrariesPage: 'js/wraps/libraries_page_manager/libraries_page_manager',
        HomePage: 'js/wraps/home_page_manager/home_page_manager',
        PublicLibrariesPage:
          'js/wraps/public_libraries_page_manager/public_libraries_manager',
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
        AuthorAffiliationTool:
          'es6!js/widgets/author_affiliation_tool/widget.jsx',

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
        ShowSimilar: 'js/wraps/similar',
        MetaTagsWidget: 'js/widgets/meta_tags/widget',
        // can't camel case because router only capitalizes first letter
        ShowToc: 'js/wraps/table_of_contents',
        ShowResources: 'es6!js/widgets/resources/widget.jsx',
        ShowAssociated: 'es6!js/widgets/associated/widget.jsx',
        ShowRecommender: 'js/widgets/recommender/widget',
        ShowMetrics: 'js/wraps/paper_metrics',
        ShowExportcitation: 'js/wraps/paper_export',
        ShowFeedback: 'reactify!js/react/BumblebeeWidget?FeedbackForms',
        ShowLibraryAdd: 'js/wraps/abstract_page_library_add/widget',

        IndividualLibraryWidget: 'js/widgets/library_individual/widget',
        LibraryActionsWidget: 'es6!js/widgets/library_actions/widget.jsx',
        AllLibrariesWidget: 'js/widgets/libraries_all/widget',
        LibraryListWidget: 'js/widgets/library_list/widget',

        // react widgets

        MyAdsFreeform: 'reactify!js/react/BumblebeeWidget?MyAdsFreeform',
        MyAdsDashboard: 'reactify!js/react/BumblebeeWidget?MyAdsDashboard',
        RecommenderWidget: 'reactify!js/react/BumblebeeWidget?Recommender',
      },
      plugins: {},
    },
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
    darkMode: 'js/dark-mode-switch',
    recaptcha: 'js/plugins/recaptcha',
    reactify: 'js/plugins/reactify',
    es6: 'js/plugins/es6',
    suit: 'shared/dist/index.umd.development',
    // **********************

    // *************************************
    // *** development-only dependencies ***
    // *************************************
    babel: 'libs/babel',
    async: 'libs/requirejs-plugins/async',
    hbs: 'libs/requirejs-plugins/hbs',
    sprintf: 'libs/sprintf',
    sinon: 'libs/sinon',
    enzyme: 'libs/enzyme',
    mocha: 'libs/mocha/mocha',
    chai: 'libs/chai',
    // *************************************

    // *******************************
    // *** production dependencies ***
    // *******************************
    underscore: [
      // 'https://unpkg.com/lodash@2.4.2/dist/lodash.compat.min',
      'libs/lodash',
    ],
    backbone: [
      'https://unpkg.com/backbone@1.1.2/backbone-min',
      'libs/backbone',
    ],
    'backbone-validation': [
      // 'https://unpkg.com/backbone-validation@0.11.3/dist/backbone-validation-amd-min',
      'libs/backbone-validation',
    ],
    'backbone.stickit': [
      // 'https://unpkg.com/backbone.stickit@0.9.2/backbone.stickit',
      'libs/backbone.stickit',
    ],
    'backbone.wreqr': [
      // 'https://unpkg.com/backbone.wreqr@1.4.0/lib/backbone.wreqr.min',
      'libs/backbone.wreqr',
    ],
    bootstrap: [
      // 'https://unpkg.com/bootstrap@3.3.7/dist/js/bootstrap.min',
      'libs/bootstrap/bootstrap',
    ],
    bowser: [
      // 'https://unpkg.com/bowser@2.11.0/es5',
      'libs/bowser',
    ],
    clipboard: [
      // 'https://unpkg.com/clipboard@1.7.1/dist/clipboard.min',
      'libs/clipboard',
    ],
    d3: [
      // 'https://unpkg.com/d3@3.5.17/d3.min',
      'libs/d3',
    ],
    'd3-cloud': [
      // 'https://unpkg.com/d3-cloud@1.2.5/build/d3.layout.cloud',
      'libs/d3-cloud',
    ],
    filesaver: [
      // 'https://unpkg.com/file-saver@1.3.8/FileSaver.min',
      'libs/file-saver',
    ],
    hotkeys: [
      // 'https://unpkg.com/hotkeys-js@3.8.7/dist/hotkeys.min',
      'libs/hotkeys',
    ],
    jquery: [
      // 'https://unpkg.com/jquery@2.2.4/dist/jquery.min',
      'libs/jquery',
    ],
    'jquery-ui': [
      'https://code.jquery.com/ui/1.12.1/jquery-ui.min',
      'libs/jquery-ui',
    ],
    jsonpath: [
      // 'https://unpkg.com/jsonpath@0.2.12/jsonpath.min',
      'libs/jsonpath',
    ],
    marionette: [
      // 'https://unpkg.com/backbone.marionette@2.4.5/lib/backbone.marionette.min',
      'libs/backbone.marionette',
    ],
    mathjax: [
      'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML&amp;delayStartupUntil=configured',
      'libs/mathjax/mathjax',
    ],
    moment: [
      // 'https://unpkg.com/moment@2.22.2/min/moment.min',
      'libs/moment',
    ],
    'persist-js': [
      // 'https://unpkg.com/persist-js@0.3.1/persist-min',
      'libs/persist-js',
    ],
    react: [
      // 'https://unpkg.com/react@16/umd/react.development',
      'libs/react',
    ],
    'react-bootstrap': [
      // 'https://unpkg.com/react-bootstrap@0.33.0/dist/react-bootstrap.min',
      'libs/react-bootstrap',
    ],
    'react-dom': [
      // 'https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min',
      'libs/react-dom',
    ],
    'prop-types': [
      // 'https://unpkg.com/prop-types@15.6/prop-types.min',
      'libs/prop-types',
    ],
    'react-redux': [
      // 'https://unpkg.com/react-redux@7.2.4/dist/react-redux.min',
      'libs/react-redux',
    ],
    'react-transition-group': [
      // 'https://unpkg.com/react-transition-group@2.4.0/dist/react-transition-group.min',
      'libs/react-transition-group',
    ],
    redux: [
      // 'https://unpkg.com/redux@4.0.5/dist/redux.min',
      'libs/redux',
    ],
    'redux-thunk': [
      // 'https://unpkg.com/redux-thunk@2.3.0/dist/redux-thunk.min',
      'libs/redux-thunk',
    ],
    select2: [
      // 'https://unpkg.com/select2@4.0.3/dist/js/select2.min',
      'libs/select2/select2',
    ],
    'react-aria-menubutton': [
      // 'https://unpkg.com/react-aria-menubutton@7.0.3/umd/ReactAriaMenuButton',
      'libs/react-aria-menubutton',
    ],
    'react-hook-form': [
      // 'https://unpkg.com/react-hook-form@6.11.0/dist/index.umd.production.min',
      'libs/react-hook-form',
    ],
    'react-is': [
      // 'https://unpkg.com/react-is@17.0.2/umd/react-is.production.min',
      'libs/react-is',
    ],
    'react-data-table-component': [
      // 'https://unpkg.com/react-data-table-component@6.11.7/dist/react-data-table-component.umd',
      'libs/react-data-table-component',
    ],
    'react-window': [
      // 'https://unpkg.com/react-window@1.8.6/dist/index-prod.umd',
      'libs/react-window',
    ],
    'react-async': [
      // 'https://unpkg.com/react-async@10.0.1/dist-umd/index',
      'libs/react-async',
    ],
    'regenerator-runtime': [
      // 'https://unpkg.com/regenerator-runtime@0.13.9/runtime',
      'libs/regenerator-runtime',
    ],
    diff: [
      // 'https://unpkg.com/diff@4.0.2/dist/diff.min',
      'libs/diff',
    ],
    'styled-components': [
      // 'https://unpkg.com/styled-components@5.1.0/dist/styled-components.min',
      'libs/styled-components',
    ],
    '@hookform/resolvers': [
      // 'https://unpkg.com/@hookform/resolvers@0.1.0/dist/index.umd.production.min',
      'libs/hookform',
    ],
    'google-analytics': [
      // to activate local tunnel (for us to collect all analytics data)
      // uncomment this; k12 should have ingress-nginx-proxy image deployed
      // that can proxy requests to /analytics
      // '/analytics/analytics'
      'libs/g',
      'data:application/javascript,',
    ],

    // require special handling, fetched via `grunt curl` task
    yup: 'libs/yup',
    cache: 'libs/cache',
    polyfill: 'libs/polyfill',
    'react-flexview': 'libs/react-flexview',
    'array-flat-polyfill': 'libs/array-flat-polyfill',
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
  onNodeCreated: function(node, config, module, path) {
    // SRIs for the CDNs used in the paths above
    const sri = {
      underscore:
        'sha384-qDQQphxk4GGOzXrYWcGvL65XEe3wWt0lpN1IWIttQvQvewLpET6XzmQiKr3kew5R',
      backbone:
        'sha384-VxD8tH2DiVJvByaMC34LoFrsCoF3qBeDvlSoyzjXU9t1SJVuOVwcGui/gigIavIN',
      'backbone-validation':
        'sha384-fpdyr8ISauDi3YRemFSS/fadDnGzGiz2QdiRavwVGgPr2dd8f9VEaubnO5XhWZGr',
      'backbone.stickit':
        'sha384-LnepiBNV2LUVxUIF/sLNzcLmusDbfFnOVijtZFrhooeopW0037kRRfZD/xIZWXoC',
      'backbone.wreqr':
        'sha384-IzfqdomcRie+VgR5xKLxPJABpi9TADoX+rb7/w2Ao1up49TbjdBZXaIpoagGW20t',
      bootstrap:
        'sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa',
      bowser:
        'sha384-Z0KxlcdLj4l74yAkZm1zrXtmCVWpuBPQ2MbDARb3dgtIwzTfG95hDk53DYVunmKL',
      clipboard:
        'sha384-cV+rhyOuRHc9Ub/91rihWcGmMmCXDeksTtCihMupQHSsi8GIIRDG0ThDc3HGQFJ3',
      d3:
        'sha384-N8EP0Yml0jN7e0DcXlZ6rt+iqKU9Ck6f1ZQ+j2puxatnBq4k9E8Q6vqBcY34LNbn',
      'd3-cloud':
        'sha384-6RmikqUV3J90YjNQ6j3aGUYxrYRgPnpfL+iGR7riVJSMgSaUxq12B9bYc7xgk29E',
      filesaver:
        'sha384-VgWGwiEJnh9P379lbU8DxPcfRuFkfLl0uPuL9tolOHtm2tx8Qy8d/KtvovfM0Udh',
      hotkeys:
        'sha384-a9EmIZ/DK+uZtwt6PYXWQnJ5HVwJ9a8klNTM9UizXmEdYbVAfuhoERwcC9MDTrLU',
      jquery:
        'sha384-rY/jv8mMhqDabXSo+UCggqKtdmBfd3qC2/KvyTDNQ6PcUJXaxK1tMepoQda4g5vB',
      jsonpath:
        'sha384-87Cywb3gQWq5tkmzcpOPCT5fkfEMexH1yQUBGx0xrr/BvXqwulIHsB8JSg06h6mV',
      marionette:
        'sha384-Vhqh90N6FKyphb9enak5e49Ty9xD2dHphudmx93Y1ZgxShTXxiNsUliAbMsyOsQ0',
      moment:
        'sha384-sIzeKWIAHvT0Vm8QbfLCqZwBG0WMCkWVAOYd/330YSNeeQ1Y57N3T9lQz5Ry/EHH',
      'persist-js':
        'sha384-IQ8LQBnxRLItFm2zBR7ehQAjX2c5kAvrnmQUDQCDhl5whNOy/Qrt4OkNPBPZqrgE',
      react:
        'sha384-ZHBAhj6mPF2wke1Ie6UN+ozxCHBXIuRrcszqkblgAqCrZtYGI3zZYn4SsU+ozss4',
      'react-bootstrap':
        'sha384-9Cmt0BSVYuRFR8JkyWNFQ7b58m8/zLVP3u9etA7xRzOTmv9v6dk0exj5ZVr/US/7',
      'react-dom':
        'sha384-vj2XpC1SOa8PHrb0YlBqKN7CQzJYO72jz4CkDQ+ePL1pwOV4+dn05rPrbLGUuvCv',
      'prop-types':
        'sha384-9Fq52URRAaPlKGhu0AzshypUBBQa7Q8Rz1ze2svcZNUHGb/PlxTygZmtyYeqEHOK',
      'react-redux':
        'sha384-ZcmZKz11wjrgTJINgsPUjE81MDefPp3T3yXjqwmOfWs3mOrXiNJp8tuDDGIL4SBh',
      'react-transition-group':
        'sha384-WabrKyNVsCPcBkbcgLk2GI5B9r3bcu7AS+xIjuNWXpiEG2YFbGYKxIMH30PZ8ppV',
      redux:
        'sha384-9HbrkMEA4yvYaxArVwUh+buL6aVxBnmvot0vCxX8eUFaa1U/iT5eb51kaT7X4q+j',
      'redux-thunk':
        'sha384-clksQEsrkq4U3jNhSd+pCTsDFvPnSxN2xr0WUy2LOXFxC8KvqinvNJJ3656K5Tkf',
      select2:
        'sha384-222hzbb8Z8ZKe6pzP18nTSltQM3PdcAwxWKzGOKOIF+Y3bROr5n9zdQ8yTRHgQkQ',
      'react-aria-menubutton':
        'sha384-sAiCfhNvllSt31QXulF/DbYmp8k6C5WIdSygBF7QC7wK5h8mnwxrN1fsEV0K8H+Z',
      'react-hook-form':
        'sha384-o00KobsI/OBvRsqSR+XM/cniIcEZDOEDS+fEtCVrU4fdh90ysgmIQZZ3TXBGEw/H',
      'react-is':
        'sha384-SrjF4gb2WbeLH6ACmw6dLWBMHqfhwqgZe9F/N1TPzAyFjFESpC/3OGcG6fGVFmk7',
      'react-data-table-component':
        'sha384-VyrMwF3/DjWtRddANOUdwGMV7031w/5cVZqzVwvGUbbulGSJsybNgmS2D8QBUOK5',
      'react-window':
        'sha384-Z5ne52XzIcFV98V/UeunHiOluolr3PBTKThF1pmLrbAMod3centtxqggBRdbxyyE',
      'react-async':
        'sha384-pe0YbZ0dk7ipNViDks2le1j8l9T6jhcuzbc9MLfv8TwNe8BwdwE0/h0BcKL07khI',
      'regenerator-runtime':
        'sha384-jMSVkO5iDhd7A6dfEXFuT++7Gvv/f6T8bq3ZRHA9KE/kpyE/GL8B7NLfGSONzAym',
      mathjax:
        'sha512-xAWI9i8WMRLdgksuhaMCYMTw9D+MEc2cYVBApWwGRJ0cdcywTjMovOfJnlGt9LlEQj6QzyMzpIZLMYujetPcQg==',
      'jquery-ui': 'sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=',
      'styled-components':
        'sha384-BJn7wepCcL8YGN8QnwJVmNKvnmPJD2zhlTLhZu5bNAJPs8OcbR38EctHcBG9KkF5',
      '@hookform/resolvers':
        'sha384-S8X/bKV7Zk250Ypfl+DfV8dUbSy1ZxD1pumo0pibFWGpFmGyAZ8+Zj3cz2EGup6g',
      diff:
        'sha384-dt7nA4/ksfhWiEl0OCs7aTXG5NkDyqzERlkfaGZ2kwmEn58sz6Yo9d+mF8XgA+H/',
    };

    if (sri[module] && /^https?/.exec(path)) {
      node.setAttribute('integrity', sri[module]);
      node.setAttribute('crossorigin', 'anonymous');
    }
  },
});
