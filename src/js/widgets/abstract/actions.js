'use strict';
define([
  'underscore',
  'js/components/api_query',
  './util',
  'js/mixins/common_actions'
], function (_, ApiQuery, util, common) {

  var API_QUERY_DELAY = 300;

  var actions = {
    updateQuery: function (apiQuery) {
      return {
        type: 'UPDATE_QUERY',
        value: apiQuery
      };
    },
    updateDocs: function (docs) {
      return {
        type: 'UPDATE_DOCS',
        value: docs
      };
    },
    startLoading: function () {
      return {
        type: 'START_LOADING',
        value: true
      };
    },
    doneLoading: function () {
      return {
        type: 'STOP_LOADING',
        value: false
      }
    },
    showError: function () {
      return {
        type: 'SHOW_ERROR',
        value: true
      }
    },
    hideError: function () {
      return {
        type: 'HIDE_ERROR',
        value: false
      };
    }
  };

  actions.provideCitationData = function (data) {
    return function (dispatch) {
      var resolvedCitations = data['[citations]'] ? data.num_citations : 0;
      
      // TODO: this creates dependency between abstract->citation
      dispatch(actions.triggerPageManagerEvent('broadcast-payload', {
        title: data.title,
        bibcode: data.bibcode,
        citation_discrepancy: data.citation_count - resolvedCitations,
        citation_count: data.citation_count
      }));
    };
  };

  actions.processResponse = function (apiResponse) {
    return function (dispatch) {
      var docs = apiResponse.get('response.docs[0]');
      if (docs && !_.isEmpty(docs)) {
        dispatch(actions.doneLoading());
        dispatch(actions.updateDocs(docs));
      } else {

        // No docs, should show error message
        dispatch(actions.showError());
      }
      dispatch(actions.triggerPageManagerEvent('widget-ready', {
        numFound: apiResponse.get('response.numFound')
      }));
      dispatch(actions.provideCitationData(docs));
    };
  };

  actions.onDisplayDocuments = function (apiQuery) {
    return function (dispatch, getState, widget) {
      var bibcode = apiQuery.get('q');
      if (bibcode.length > 0 && /bibcode:/.test(bibcode[0])) {
        bibcode = bibcode[0].replace(/bibcode:/, '');
      }

      // Attempt to shortcut the request by using stashed docs
      var beehive = widget.getBeeHive();
      var docs = (beehive.hasObject('DocStashController')) ?
        beehive.getObject('DocStashController').getDocs() : [];
      var found = docs.filter(function (doc) {
        return doc.bibcode === bibcode;
      });

      if (found.length) {
        dispatch(actions.doneLoading());
        return dispatch(actions.updateDocs(found[0]));
      }
      widget.dispatchRequest(apiQuery.clone());
    };
  };

  actions.handleFeedback = function (feedback) {
    return function (dispatch, getState, widget) {
      var state = getState();
      var widgetId = widget.getPubSub().getCurrentPubSubKey().getId();
      var stateQuery = (state.query && state.query.get) ? 
        state.query.get('q')[0] : null;
      var errorId = (feedback.psk && feedback.psk.getId) ? 
        feedback.psk.getId() : -1;

      if (
        widgetId === errorId &&
        feedback &&
        feedback.request &&
        feedback.request.has('query') &&
        feedback.request.get('query').has('q') &&
        state.loading
      ) {
        var query = feedback.request.get('query').get('q');
        var feedbackQuery = (query.length) ? query[0] : null;
        if (feedbackQuery === stateQuery) {

          _.delay(function () {
            dispatch(actions.doneLoading());
            dispatch(actions.showError());
          }, API_QUERY_DELAY);
        }
      } else {
        dispatch(actions.hideError());
      }
    };
  };

  _.extend(actions, common);
  return actions;
});
