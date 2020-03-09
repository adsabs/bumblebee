/**
 * Main collection point for all the actions
 */
define([
  'underscore',
  'jquery',
  'js/components/api_query',
  'js/components/api_targets',
  'filesaver',
], function(_, $, ApiQuery, ApiTargets) {
  // set of action names
  const actions = {
    SET_TAB: 'SET_TAB',
    SET_QUERY: 'SET_QUERY',
    SET_FORMAT: 'SET_FORMAT',
    SET_FORMATS: 'SET_FORMATS',
    SET_CUSTOM_FORMAT: 'SET_CUSTOM_FORMAT',
    SET_PROGRESS: 'SET_PROGRESS',
    SET_COUNT: 'SET_COUNT',
    SET_IGNORE: 'SET_IGNORE',
    SET_HAS_ERROR: 'SET_HAS_ERROR',
    SET_ERROR_MSG: 'SET_ERROR_MSG',
    SET_MAX_COUNT: 'SET_MAX_COUNT',
    SET_TOTAL_RECS: 'SET_TOTAL_RECS',
    SET_SHOW_CLOSER: 'SET_SHOW_CLOSER',
    SET_PAGE: 'SET_PAGE',
    SET_SORT: 'SET_SORT',
    SET_BATCH_SIZE: 'SET_BATCH_SIZE',
    TAKE_SNAPSHOT: 'TAKE_SNAPSHOT',
    RESET: 'RESET',
    HARD_RESET: 'HARD_RESET',
    REQUEST_IDS: 'REQUEST_IDS',
    RECEIVE_IDS: 'RECEIVE_IDS',
    REQUEST_EXPORT: 'REQUEST_EXPORT',
    RECEIVE_EXPORT: 'RECEIVE_EXPORT',
    REQUEST_FAILED: 'REQUEST_FAILED',
    REQUEST_CANCELLED: 'REQUEST_CANCELLED',
    SET_ORIGIN: 'SET_ORIGIN',
    SET_CUSTOM_FORMATS: 'SET_CUSTOM_FORMATS',
    SET_BIBTEX_KEY_FORMAT: 'SET_BIBTEX_KEY_FORMAT',
    SET_BIBTEX_MAX_AUTHORS: 'SET_BIBTEX_MAX_AUTHORS',
    SET_BIBTEX_ABS_KEY_FORMAT: 'SET_BIBTEX_ABS_KEY_FORMAT',
    SET_BIBTEX_ABS_MAX_AUTHORS: 'SET_BIBTEX_ABS_MAX_AUTHORS',
    SET_BIBTEX_AUTHOR_CUTOFF: 'SET_BIBTEX_AUTHOR_CUTOFF',
    SET_BIBTEX_ABS_AUTHOR_CUTOFF: 'SET_BIBTEX_ABS_AUTHOR_CUTOFF',
    SET_BIBTEX_JOURNAL_FORMAT: 'SET_BIBTEX_JOURNAL_FORMAT',
  };

  actions.setTab = (tab) => ({ type: actions.SET_TAB, tab });
  actions.setFormat = (format) => ({ type: actions.SET_FORMAT, format });
  actions.setFormats = (formats) => ({ type: actions.SET_FORMATS, formats });
  actions.setCustomFormat = (format) => ({
    type: actions.SET_CUSTOM_FORMAT,
    format,
  });
  actions.setProgress = (progress) => ({
    type: actions.SET_PROGRESS,
    progress,
  });
  actions.setTotalRecs = (totalRecs) => ({
    type: actions.SET_TOTAL_RECS,
    totalRecs,
  });
  actions.setShowCloser = (showCloser) => ({
    type: actions.SET_SHOW_CLOSER,
    showCloser,
  });
  actions.requestIds = () => ({ type: actions.REQUEST_IDS });
  actions.receiveIds = (ids) => ({ type: actions.RECEIVE_IDS, ids });
  actions.requestExport = () => ({ type: actions.REQUEST_EXPORT });
  actions.receiveExport = (exports) => ({
    type: actions.RECEIVE_EXPORT,
    exports,
  });
  actions.setBatchSize = (batchSize) => ({
    type: actions.SET_BATCH_SIZE,
    batchSize,
  });
  actions.setQuery = (query) => ({ type: actions.SET_QUERY, query });
  actions.setCount = (count) => ({ type: actions.SET_COUNT, count });
  actions.setMaxCount = (maxCount) => ({
    type: actions.SET_MAX_COUNT,
    maxCount,
  });
  actions.cancelRequest = () => ({ type: actions.REQUEST_CANCELLED });
  actions.setIgnore = (ignore) => ({ type: actions.SET_IGNORE, ignore });
  actions.setHasError = (hasError) => ({
    type: actions.SET_HAS_ERROR,
    hasError,
  });
  actions.setErrorMsg = (errorMsg) => ({
    type: actions.SET_ERROR_MSG,
    errorMsg,
  });
  actions.setPage = (page) => ({ type: actions.SET_PAGE, page });
  actions.setSort = (sort) => ({ type: actions.SET_SORT, sort });
  actions.reset = () => ({ type: actions.RESET });
  actions.hardReset = () => ({ type: actions.HARD_RESET });
  actions.setOrigin = (origin) => ({ type: actions.SET_ORIGIN, origin });
  actions.setCustomFormats = (customFormats) => ({
    type: actions.SET_CUSTOM_FORMATS,
    customFormats,
  });
  actions.setBibtexMaxAuthors = (maxAuthors) => ({
    type: actions.SET_BIBTEX_MAX_AUTHORS,
    maxAuthors,
  });
  actions.setBibtexKeyFormat = (keyFormat) => ({
    type: actions.SET_BIBTEX_KEY_FORMAT,
    keyFormat,
  });
  actions.setBibtexABSMaxAuthors = (maxAuthors) => ({
    type: actions.SET_BIBTEX_ABS_MAX_AUTHORS,
    maxAuthors,
  });
  actions.setBibtexABSKeyFormat = (keyFormat) => ({
    type: actions.SET_BIBTEX_ABS_KEY_FORMAT,
    keyFormat,
  });
  actions.setBibtexAuthorCutoff = (payload) => ({
    type: actions.SET_BIBTEX_AUTHOR_CUTOFF,
    payload,
  });
  actions.setBibtexABSAuthorCutoff = (payload) => ({
    type: actions.SET_BIBTEX_ABS_AUTHOR_CUTOFF,
    payload,
  });
  actions.setBibtexJournalFormat = (payload) => ({
    type: actions.SET_BIBTEX_JOURNAL_FORMAT,
    payload,
  });

  /**
   * On request failure, we want to display a message to the user here
   *
   * @param args
   */
  actions.requestFailed = (...args) => (dispatch) => {
    const { setHasError } = actions;
    dispatch(setHasError(true));
    dispatch({ type: 'REQUEST_FAILED' });
  };

  /**
   * Update the selected format
   *
   * @param {string} format - the selected format
   */
  actions.findAndSetFormat = (format) => (dispatch, getState) => {
    const { formats } = getState();
    const found = _.find(formats, { value: format });
    dispatch(actions.setFormat(found || formats[0]));
  };

  /**
   * Fetch ids using a query
   *
   * @returns {$.Promise} the request promise
   */
  actions.fetchUsingQuery = () => (dispatch, getState, widget) => {
    const { exports, main } = getState();
    const { composeRequest } = widget;
    const {
      requestIds,
      receiveIds,
      requestFailed,
      setTotalRecs,
      setHasError,
      setSort,
    } = actions;

    // create a new query from the serialized params
    const query = new ApiQuery(main.query);
    query.set({
      // use a specific count, if it's less than the default batchSize
      rows:
        exports.count < exports.batchSize ? exports.count : exports.batchSize,
      fl: 'bibcode',

      // start at the maxCount - batchSize, to get a particular window
      start: exports.maxCount - exports.batchSize,
    });

    dispatch(setHasError(false));

    // start requesting ids
    dispatch(requestIds());
    const req = composeRequest(query);

    // execute the actual request
    const prom = widget._executeApiRequest(req);
    prom.then((res) => {
      // pull out only the bibcodes
      const ids = _.map(res.get('response.docs'), 'bibcode');
      const sort = res.get('responseHeader.params.sort', false, 'date desc');

      // update the ids on the state
      dispatch(receiveIds(ids));

      // get the sort from the query
      dispatch(setSort(sort));

      // set the total recs to based on the number of ids found
      dispatch(setTotalRecs(res.get('response.numFound')));
    });

    // on failure, dispatch our handler
    prom.fail((...args) => dispatch(requestFailed(...args)));

    return prom;
  };

  /**
   * Fetch using ids, this will set up a request and fetch a request using
   * identifiers and some other information.
   */
  actions.fetchUsingIds = (isLibrary) => (dispatch, getState, widget) => {
    const {
      requestExport,
      receiveExport,
      requestFailed,
      setIgnore,
      setHasError,
    } = actions;
    const { composeRequest } = widget;
    const { format, exports } = getState();

    dispatch(setHasError(false));

    // starting an export
    dispatch(requestExport());

    // get the current count, which the user selected
    const count =
      exports.count < exports.batchSize ? exports.count : exports.batchSize;
    const start = exports.maxCount - exports.batchSize;

    // only grab the first n records
    const ids = isLibrary
      ? exports.ids.slice(start, start + count)
      : _.take(exports.ids, count);

    // setting up a new query using our current ids
    const q = new ApiQuery();
    q.set('bibcode', ids);
    q.set('sort', exports.sort);
    if (format.value === 'custom' && exports.customFormatString.length > 0) {
      q.set('format', exports.customFormatString);
    } else if (
      format.value === 'custom' &&
      exports.customFormatString.length <= 0
    ) {
      // send back an empty response
      return $.Deferred()
        .resolve()
        .promise()
        .then(function() {
          dispatch(receiveExport(''));
        });
    } else if (format.value === 'bibtex') {
      if (exports.bibtexKeyFormat) {
        q.set('keyformat', exports.bibtexKeyFormat);
      }

      // set maxauthor, convert it to number first
      q.set('maxauthor', +exports.bibtexMaxAuthors);
      q.set('authorcutoff', +exports.bibtexAuthorCutoff);
      q.set('journalformat', exports.bibtexJournalFormat);
    } else if (format.value === 'bibtexabs') {
      if (exports.bibtexABSKeyFormat) {
        q.set('keyformat', exports.bibtexABSKeyFormat);
      }

      // set maxauthor, convert it to number first
      q.set('maxauthor', +exports.bibtexABSMaxAuthors);
      q.set('authorcutoff', +exports.bibtexABSAuthorCutoff);
      q.set('journalformat', exports.bibtexJournalFormat);
    } else if (format.value === 'aastex') {
      q.set('journalformat', exports.bibtexJournalFormat);
    }

    const req = composeRequest(q);
    req.set({
      target: ApiTargets.EXPORT + format.value,
      options: {
        type: 'POST',
        contentType: 'application/json',
      },
    });

    // send off the request
    return (
      widget
        ._executeApiRequest(req)
        .done((res) => {
          // if we are ignoring, then don't bother with the response
          if (!exports.ignore) {
            dispatch(receiveExport(res.get('export')));
          }

          // stop ignoring
          dispatch(setIgnore(false));
        })

        // on failure, send off to our handler
        .fail((...args) => dispatch(requestFailed(...args)))
    );
  };

  /**
   * Get the next batch of records
   */
  actions.getNextBatch = () => (dispatch, getState) => {
    const {
      setMaxCount,
      setBatchSize,
      setCount,
      fetchUsingQuery,
      fetchUsingIds,
    } = actions;
    const { exports } = getState();

    // get the total, based on the max count and our batchsize
    let max = exports.maxCount + exports.batchSize;

    // if that total is greater than the amount of records, we have to adjust it
    if (max > exports.totalRecs) {
      // reset the batch size to be the total records minus our max
      const batch = exports.totalRecs - exports.maxCount;

      // count is the current lower value (i.e. <count> of <maxCount>)
      // the next batch will be smaller than (maxCount - count)
      const count = exports.count < batch ? exports.count : batch;

      // max is the current upper value + the batch value, should be same as totalRecs
      max = exports.maxCount + batch;

      dispatch(setBatchSize(batch));
      dispatch(setCount(count));
    }
    dispatch(setMaxCount(max));

    // check if we are in a library (been given all of our ids)
    if (exports.ids.length === exports.totalRecs) {
      dispatch(fetchUsingIds(true));
    } else {
      dispatch(fetchUsingQuery()).done(() => dispatch(fetchUsingIds()));
    }
  };

  /**
   * Take a snapshot of the current state of the application
   *
   * We can use this in conjunction with reset, to reset back to an earlier state
   *
   * @param {object} snapshot - the current state
   */
  actions.takeSnapshot = () => (dispatch, getState) => {
    const snapshot = _.omit(getState().exports, 'snapshot');
    dispatch({ type: actions.TAKE_SNAPSHOT, snapshot: snapshot });
  };

  /**
   * Close the component using the widget method
   * also resets the widget so it's not in a weird state
   */
  actions.closeComponent = () => (dispatch, getState, widget) => {
    dispatch(actions.hardReset());
    widget.closeWidget();
  };

  /**
   * Download the export string as a text file
   */
  actions.downloadFile = () => (dispatch, getState) => {
    const state = getState();
    const blob = new Blob([state.exports.output], {
      type: 'text/plain;charset=utf-8',
    });

    // save Blob to file, passing true to not automatically add BOM
    saveAs(blob, `export-${state.format.value}.${state.format.ext}`, true);
  };

  return actions;
});
