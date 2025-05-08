// Import all controllers
import Navigator from '../js/apps/discovery/navigator';
import Diagnostics from '../js/bugutils/diagnostics';
import AppStorage from '../js/components/app_storage';
import CSRFManager from '../js/components/csrf_manager';
import DocStashController from '../js/components/doc_stash_controller';
import Experiments from '../js/components/experiments';
import HistoryManager from '../js/components/history_manager';
import HotkeysController from '../js/components/hotkeys_controller';
import LibraryController from '../js/components/library_controller';
import QueryMediator from '../js/components/query_mediator';
import SecondOrderController from '../js/components/second_order_controller';
import Session from '../js/components/session';

// Import all objects
import User from '../js/components/user';
import Orcid from '../js/modules/orcid/module';

import OrcidBigWidget from '../js/modules/orcid/widget/widget';
import MasterPageManager from '../js/page_managers/master';
import ShowFeedback from '../js/react/FeedbackForms';
import ReactPageManager from '../js/react/PageManager';
import RecommenderWidget from '../js/react/Recommender';
import MyAdsDashboard from '../js/react/MyAdsDashboard';
import MyAdsFreeform from '../js/react/MyAdsFreeform';

// Import all services
import Api from '../js/services/api';
import PubSub from '../js/services/pubsub';
import PersistentStorage from '../js/services/storage';

import ShowAbstract from '../js/widgets/abstract/widget';
import AlertsWidget from '../js/widgets/alerts/widget';
import QueryDebugInfo from '../js/widgets/api_query/widget';
import ShowAssociated from '../js/widgets/associated/widget.jsx';
import Authentication from '../js/widgets/authentication/widget';
import AuthorAffiliationTool from '../js/widgets/author_affiliation_tool/widget.jsx';
import BubbleChart from '../js/widgets/bubble_chart/widget';

import CitationHelper from '../js/widgets/citation_helper/widget';
import ClassicSearchForm from '../js/widgets/classic_form/widget';
import ExportWidget from '../js/widgets/export/widget.jsx';

// Import all modules
import FacetFactory from '../js/widgets/facet/factory';
import BreadcrumbsWidget from '../js/widgets/filter_visualizer/widget';
import FooterWidget from '../js/widgets/footer/widget';
import ShowGraphics from '../js/widgets/graphics/widget';
import AllLibrariesWidget from '../js/widgets/libraries_all/widget';

import LibraryActionsWidget from '../js/widgets/library_actions/widget.jsx';
import LibraryImport from '../js/widgets/library_import/widget';
import IndividualLibraryWidget from '../js/widgets/library_individual/widget';
import LibraryListWidget from '../js/widgets/library_list/widget';
import MetaTagsWidget from '../js/widgets/meta_tags/widget';
import Metrics from '../js/widgets/metrics/widget';
import NavbarWidget from '../js/widgets/navbar/widget';
import OrcidSelector from '../js/widgets/orcid-selector/widget.jsx';
import PaperSearchForm from '../js/widgets/paper_search_form/widget';
import UserPreferences from '../js/widgets/preferences/widget';
import QueryInfo from '../js/widgets/query_info/query_info_widget';
import ShowRecommender from '../js/widgets/recommender/widget';
import ShowResources from '../js/widgets/resources/widget.jsx';
import Results from '../js/widgets/results/widget';
import SearchWidget from '../js/widgets/search_bar/search_bar_widget';
import Sort from '../js/widgets/sort/widget.jsx';
import UserNavbarWidget from '../js/widgets/user_navbar/widget';
import UserSettings from '../js/widgets/user_settings/widget';
import ConceptCloud from '../js/widgets/wordcloud/widget';
import DetailsPage from '../js/wraps/abstract_page_manager/abstract_page_manager';
import AffiliationFacet from '../js/wraps/affiliation_facet';
import AlertsController from '../js/wraps/alerts_mediator';
import AuthenticationPage from '../js/wraps/authentication_page_manager';
import AuthorFacet from '../js/wraps/author_facet';
import AuthorNetwork from '../js/wraps/author_network';
import BibgroupFacet from '../js/wraps/bibgroup_facet';
import BibstemFacet from '../js/wraps/bibstem_facet';
import ShowCitations from '../js/wraps/citations';
import ShowCoreads from '../js/wraps/coreads';
import DataFacet from '../js/wraps/data_facet';
import DatabaseFacet from '../js/wraps/database_facet';
import FeedbackMediator from '../js/wraps/discovery_mediator';
import ErrorPage from '../js/wraps/error_page_manager/error_page_manager';
import ExportDropdown from '../js/wraps/export_dropdown';
import GrantsFacet from '../js/wraps/grants_facet';
import GraphTabs from '../js/wraps/graph_tabs';
import HomePage from '../js/wraps/home_page_manager/home_page_manager';
import KeywordFacet from '../js/wraps/keyword_facet';

// Import all widgets
import LandingPage from '../js/wraps/landing_page_manager/landing_page_manager';
import LibrariesPage from '../js/wraps/libraries_page_manager/libraries_page_manager';
import NedObjectFacet from '../js/wraps/ned_object_facet';
import OrcidInstructionsPage from '../js/wraps/orcid-instructions-page-manager/manager';
import OrcidPage from '../js/wraps/orcid_page_manager/orcid_page_manager';
import ShowExportcitation from '../js/wraps/paper_export';
import ShowMetrics from '../js/wraps/paper_metrics';
import PaperNetwork from '../js/wraps/paper_network';
import PublicLibrariesPage from '../js/wraps/public_libraries_page_manager/public_libraries_manager';
import PubtypeFacet from '../js/wraps/pubtype_facet';
import RefereedFacet from '../js/wraps/refereed_facet';
import ShowReferences from '../js/wraps/references';
import SearchPage from '../js/wraps/results_page_manager';
import ShowGraphicsSidebar from '../js/wraps/sidebar-graphics-widget';
import ObjectFacet from '../js/wraps/simbad_object_facet';
import ShowSimilar from '../js/wraps/similar';
import ShowToc from '../js/wraps/table_of_contents';
import SettingsPage from '../js/wraps/user_settings_page_manager/user_page_manager';
import VisualizationDropdown from '../js/wraps/visualization_dropdown';
import VizierFacet from '../js/wraps/vizier_facet';
import DynamicConfig from './discovery.vars';
import Utils from '../js/utils';

const staticConfig = {
  core: {
    controllers: {
      AlertsController,
      Diagnostics,
      Experiments,
      FeedbackMediator,
      HotkeysController,
      Orcid,
      QueryMediator,
      SecondOrderController,
    },
    services: {
      Api,
      HistoryManager,
      Navigator,
      PersistentStorage,
      PubSub,
    },
    objects: {
      AppStorage,
      CSRFManager,
      DocStashController,
      DynamicConfig,
      LibraryController,
      MasterPageManager,
      Session,
      User,
      Utils,
    },
    modules: {
      FacetFactory,
    },
  },
  widgets: {
    AffiliationFacet,
    AlertsWidget,
    AllLibrariesWidget,
    Authentication,
    AuthenticationPage,
    AuthorAffiliationTool,
    AuthorFacet,
    AuthorNetwork,
    BibgroupFacet,
    BibstemFacet,
    BreadcrumbsWidget,
    BubbleChart,
    CitationHelper,
    ClassicSearchForm,
    ConceptCloud,
    DataFacet,
    DatabaseFacet,
    DetailsPage,
    // LibraryImport,
    ErrorPage,
    ExportDropdown,
    ExportWidget,
    FooterWidget,
    GrantsFacet,
    GraphTabs,
    HomePage,
    IndividualLibraryWidget,
    KeywordFacet,
    LandingPage,
    LibrariesPage,
    LibraryActionsWidget,
    LibraryImport,
    LibraryListWidget,
    MetaTagsWidget,
    Metrics,
    MyAdsDashboard,
    MyAdsFreeform,
    NavbarWidget,
    NedObjectFacet,
    ObjectFacet,
    OrcidBigWidget,
    OrcidInstructionsPage,
    OrcidPage,
    OrcidSelector,
    PaperNetwork,
    PaperSearchForm,
    PublicLibrariesPage,
    PubtypeFacet,
    QueryDebugInfo,
    QueryInfo,
    ReactPageManager,
    RecommenderWidget,
    RefereedFacet,
    Results,
    SearchPage,
    SearchWidget,
    SettingsPage,
    ShowAbstract,
    ShowAssociated,
    ShowCitations,
    ShowCoreads,
    ShowExportcitation,
    ShowFeedback,
    ShowGraphics,
    ShowGraphicsSidebar,
    ShowMetrics,
    ShowRecommender,
    ShowReferences,
    ShowResources,
    ShowSimilar,
    ShowToc,
    Sort,
    UserNavbarWidget,
    UserPreferences,
    UserSettings,
    VisualizationDropdown,
    VizierFacet,
  },
};

export default staticConfig;
