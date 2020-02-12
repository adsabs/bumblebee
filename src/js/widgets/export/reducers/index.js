/**
 * Collects and combines all reducers
 */
define([
  'underscore',
  'js/components/api_targets',
  'es6!../actions/index',
  'js/widgets/config',
  'redux',
], function(_, ApiTargets, actions, config, Redux) {
  const {
    SET_QUERY,
    SET_FORMAT,
    SET_FORMATS,
    SET_CUSTOM_FORMAT,
    SET_PROGRESS,
    SET_COUNT,
    SET_PAGE,
    SET_IGNORE,
    SET_HAS_ERROR,
    SET_SHOW_CLOSER,
    SET_ERROR_MSG,
    SET_MAX_COUNT,
    SET_TOTAL_RECS,
    SET_BATCH_SIZE,
    REQUEST_IDS,
    RECEIVE_IDS,
    REQUEST_EXPORT,
    RECEIVE_EXPORT,
    REQUEST_FAILED,
    REQUEST_CANCELLED,
    TAKE_SNAPSHOT,
    SET_ORIGIN,
    SET_SORT,
    RESET,
    HARD_RESET,
    SET_CUSTOM_FORMATS,
    SET_BIBTEX_MAX_AUTHORS,
    SET_BIBTEX_KEY_FORMAT,
    SET_BIBTEX_ABS_MAX_AUTHORS,
    SET_BIBTEX_ABS_KEY_FORMAT,
    SET_BIBTEX_AUTHOR_CUTOFF,
    SET_BIBTEX_ABS_AUTHOR_CUTOFF,
  } = actions;

  // format reducer
  const format = (
    state = {
      label: 'BibTeX',
      value: 'bibtex',
      id: '0',
    },
    action
  ) => {
    switch (action.type) {
      case SET_FORMAT:
        return action.format;
      default:
        return state;
    }
  };

  const exFormats = _.map(config.export.formats, function(f, idx) {
    return _.extend(f, { id: String(idx) });
  });

  // format collection reducer
  const formats = (state = exFormats, action) => {
    switch (action.type) {
      case SET_FORMATS:
        return action.formats;
      default:
        return state;
    }
  };

  // error messages reducer
  const error = (
    state = {
      hasError: false,
      errorMsg:
        'Sorry, something happened during the request. Please try again',
    },
    action
  ) => {
    switch (action.type) {
      case SET_HAS_ERROR:
        return { ...state, hasError: action.hasError };
      case SET_ERROR_MSG:
        return { ...state, errorMsg: action.errorMsg };
      default:
        return state;
    }
  };

  // exports reducer (main export functionality)
  const exports = (
    state = {
      isFetching: false,
      output: '',
      progress: 0,
      ids: [],
      sort: 'date desc, bibcode desc',
      count: 0,
      page: 0,
      maxCount: ApiTargets._limits.ExportWidget.default,
      batchSize: ApiTargets._limits.ExportWidget.default,
      ignore: false,
      totalRecs: 0,
      customFormatString: '',
      customFormats: [],
      snapshot: {},
      bibtexKeyFormat: null,
      bibtexMaxAuthors: 0,
      bibtexAuthorCutoff: 200,
      bibtexABSKeyFormat: null,
      bibtexABSMaxAuthors: 0,
      bibtexABSAuthorCutoff: 200,
    },
    action
  ) => {
    switch (action.type) {
      case REQUEST_IDS:
        return { ...state, isFetching: true, progress: 0 };
      case RECEIVE_IDS:
        return {
          ...state,
          isFetching: false,
          progress: 100,
          ids: action.ids,
        };
      case SET_TOTAL_RECS:
        return { ...state, totalRecs: action.totalRecs };
      case REQUEST_EXPORT:
        return { ...state, isFetching: true, progress: 0 };
      case SET_CUSTOM_FORMAT:
        return { ...state, customFormatString: action.format };
      case SET_CUSTOM_FORMATS:
        return { ...state, customFormats: action.customFormats };
      case SET_BIBTEX_MAX_AUTHORS:
        return { ...state, bibtexMaxAuthors: action.maxAuthors };
      case SET_BIBTEX_KEY_FORMAT:
        return { ...state, bibtexKeyFormat: action.keyFormat };
      case SET_BIBTEX_AUTHOR_CUTOFF:
        return { ...state, bibtexAuthorCutoff: action.payload };
      case SET_BIBTEX_ABS_MAX_AUTHORS:
        return { ...state, bibtexABSMaxAuthors: action.maxAuthors };
      case SET_BIBTEX_ABS_KEY_FORMAT:
        return { ...state, bibtexABSKeyFormat: action.keyFormat };
      case SET_BIBTEX_ABS_AUTHOR_CUTOFF:
        return { ...state, bibtexABSAuthorCutoff: action.payload };
      case RECEIVE_EXPORT:
        return {
          ...state,
          isFetching: false,
          progress: 100,
          output: action.exports,
          ignore: false,
        };
      case REQUEST_FAILED:
        return {
          ...state,
          isFetching: false,
          progress: 0,
        };
      case REQUEST_CANCELLED:
        return {
          ...state,
          ignore: true,
          isFetching: false,
          progress: 0,
          output: '',
        };
      case SET_IGNORE:
        return { ...state, ignore: action.ignore };
      case SET_PROGRESS:
        return { ...state, progress: action.progress };
      case SET_BATCH_SIZE:
        return { ...state, batchSize: action.batchSize };
      case SET_COUNT:
        return {
          ...state,
          count: action.count > state.maxCount ? state.maxCount : action.count,
        };
      case SET_MAX_COUNT:
        return {
          ...state,
          maxCount:
            action.maxCount > state.totalRecs
              ? state.totalRecs
              : action.maxCount,
        };
      case SET_PAGE:
        return { ...state, page: action.page };
      case SET_SORT:
        return { ...state, sort: action.sort };
      case TAKE_SNAPSHOT:
        return { ...state, snapshot: action.snapshot };
      case RESET: {
        return { ...state.snapshot, output: '', snapshot: state.snapshot };
      }
      default:
        return state;
    }
  };

  // main state reducer
  const main = (
    state = {
      query: {},
      showCloser: true,
      showSlider: true,
      origin: 'results-page',
      showReset: true,
      splitCols: true,
      autoSubmit: false,
    },
    action
  ) => {
    switch (action.type) {
      case SET_SHOW_CLOSER:
        return { ...state, showCloser: action.showCloser };
      case SET_QUERY:
        return { ...state, query: action.query };
      case SET_ORIGIN:
        return {
          ...state,
          showCloser: action.origin === 'results-page',
          showSlider: action.origin === 'results-page',
          splitCols: action.origin === 'results-page',
          showReset: action.origin === 'results-page',
          autoSubmit: action.origin !== 'results-page',
          origin: action.origin,
        };
      default:
        return state;
    }
  };

  const appReducer = Redux.combineReducers({
    format,
    formats,
    error,
    exports,
    main,
  });

  const rootReducer = (state, action) => {
    if (action.type === HARD_RESET) {
      state = undefined;
    }

    return appReducer(state, action);
  };

  return rootReducer;
});
