/**
 * Extension for a controller; it adds a functionality that allows a widget
 * to handle ORCID actions.
 *
 * It is installed as return OrcidExtension(WidgetClass)
 */

define([
  'underscore',
  'js/components/api_query',
  'js/components/api_request',
  'js/components/api_query_updater',
  'js/components/api_targets',
  'js/modules/orcid/work',
  'js/components/api_feedback',
  'js/mixins/dependon',
], function(
  _,
  ApiQuery,
  ApiRequest,
  ApiQueryUpdater,
  ApiTargets,
  Work,
  ApiFeedback
) {
  return function(WidgetClass) {
    var queryUpdater = new ApiQueryUpdater('OrcidExtension');
    var processDocs = WidgetClass.prototype.processDocs;
    var activate = WidgetClass.prototype.activate;
    var onAllInternalEvents = WidgetClass.prototype.onAllInternalEvents;

    WidgetClass.prototype.activate = function(beehive) {
      this.setBeeHive(beehive);
      activate.apply(this, arguments);
      var pubsub = beehive.hasService('PubSub') && beehive.getService('PubSub');
      pubsub.subscribe(pubsub.CUSTOM_EVENT, _.bind(this.onCustomEvent));
    };

    WidgetClass.prototype.onCustomEvent = function(event, bibcodes) {
      /**
       * Find the models for each of the bibcodes
       * Filter out ones that can't perform the action
       * Trigger the action on each of the views
       */
      var orcidAction = _.bind(function(action, bibcodes) {
        var models = [];

        bibcodes.forEach(( bibcode ) => {
          var model = this.hiddenCollection.find((m) => m.get('bibcode') === bibcode);
          if (model) {
            models.push(model);
          }
        });

        console.group('Orcid Action');
        console.log(`Running action: ${action} on ${models.length} models`);
        // go through each model and grab the view for triggering
        _.forEach(
          models,
          _.bind(function(m) {
            // only continue if the model has the action available
            var actions = _.map(m.get('orcid').actions, 'action');

            if (_.contains(actions, action)) {
              var view = this.view.children.findByModel(m);

              if (view) {
                console.log('Found view for model, firing event on view', m);
                view.trigger('OrcidAction', {
                  action: action,
                  view: view,
                  model: m,
                });
              } else {
                console.warn('Could not find view for model, firing event directly', m);
                WidgetClass.prototype.onAllInternalEvents.call(this, 'childview:OrcidAction', null, {
                  action: action,
                  model: m,
                });
              }
            }
          }, this)
        );
        console.groupEnd('Orcid Action');
      }, this);

      switch (event) {
        case 'orcid-bulk-claim':
          orcidAction('orcid-add', bibcodes);
          break;
        case 'orcid-bulk-update':
          orcidAction('orcid-update', bibcodes);
          break;
        case 'orcid-bulk-delete':
          orcidAction('orcid-delete', bibcodes);
          break;
        default:
      }
    };

    /**
     * Apply messages or other information to the orcid control under
     * each record.  This will return a set of actions based on the
     * metadata passed in.
     *
     * @example
     * { isSourcedByADS: true, isCreatedByOthers: false, isCreatedByADS: true }
     *
     * //returns:
     * { actions: { update: {...}, delete: {...}, view: {...} }, provenance: 'ads' }
     *
     * @returns {object} - orcid action options
     */
    WidgetClass.prototype._getOrcidInfo = _.memoize(
      function(recInfo) {
        var msg = { actions: {}, provenance: null };

        if (recInfo.isCreatedByOthers && recInfo.isCreatedByADS) {
          msg.actions.update = {
            title: 'update in ORCID',
            caption: 'Update ADS version with latest data',
            action: 'orcid-update',
          };
          msg.actions.delete = {
            title: 'delete from ORCID',
            caption: 'Delete ADS version from ORCID',
            action: 'orcid-delete',
          };
          msg.actions.view = {
            title: 'view in ORCID',
            caption:
              "Another version exists (we don't have rights to update it)",
            action: 'orcid-view',
          };
        } else if (recInfo.isCreatedByOthers && !recInfo.isCreatedByADS) {
          if (recInfo.isKnownToADS) {
            msg.actions.add = {
              title: 'add ADS version ORCID',
              caption:
                "ORCID already has a record for this article (we don't have rights to update it).",
              action: 'orcid-add',
            };
          }
          msg.actions.view = {
            title: 'view in ORCID',
            caption:
              "Another version exists (we don't have rights to update it)",
            action: 'orcid-view',
          };
        } else if (!recInfo.isCreatedByOthers && recInfo.isCreatedByADS) {
          msg.actions.update = {
            title: 'update in ORCID',
            caption: 'Update ADS version with latest data',
            action: 'orcid-update',
          };
          msg.actions.delete = {
            title: 'delete from ORCID',
            caption: 'Delete ADS version from ORCID',
            action: 'orcid-delete',
          };
        } else {
          msg.actions.add = {
            title: 'add to ORCID',
            caption: 'Add ADS version to ORCID',
            action: 'orcid-add',
          };
        }

        if (recInfo.isCreatedByADS && recInfo.isCreatedByOthers) {
          msg.provenance = 'ads'; // duplicate, but just to be explicit
        } else if (recInfo.isCreatedByADS) {
          msg.provenance = 'ads';
        } else if (recInfo.isCreatedByOthers) {
          msg.provenance = 'others';
        } else {
          msg.provenance = null;
        }
        return msg;
      },
      function(ret) {
        return [
          ret.isCreatedByADS,
          ret.isCreatedByOthers,
          ret.isKnownToADS,
          ret.provenance,
        ];
      }
    );

    /**
     * Set the pending state on a set of docs
     * @param {array} docs the docs the update
     * @param {boolean} pending the new pending state
     */
    WidgetClass.prototype._setDocsToPending = function(docs, pending) {
      _.forEach(docs, function(d) {
        var p = _.isBoolean(pending) ? pending : true;
        d.orcid = _.extend({}, d.orcid, { pending: p });
      });
    };

    /**
     * Takes in a set of documents, should be a result of a search or orcid
     * record page.  In either case, it will match the models by bibcode and
     * update their orcid metadata
     *
     * @param {object[]} docs - the docs to update
     * @returns {object[]} - the updated docs
     */
    WidgetClass.prototype.addOrcidInfo = function(docs) {
      var self = this;
      var failRetry = false;
      var getDocInfo = _.noop;

      // add orcid info to the documents
      var orcidApi = this.getBeeHive().getService('OrcidApi');

      if (!orcidApi || !orcidApi.hasAccess()) {
        return docs;
      }

      // find all pending models, and update them with an error state
      var setPendingToError = _.debounce(function() {
        // go through the current models, and if something is pending
        // make it show an error
        _.forEach(self.hiddenCollection.models, function(m) {
          var orcid = m.get('orcid');
          if (orcid.pending) {
            orcid = _.extend({}, orcid, {
              pending: false,
              error: 'Error while applying Orcid Data',
            });
            m.set('orcid', orcid);
          }
        });
      }, 100);

      // find all pending models, and update them to a default state
      var setPendingToDefaultActions = _.debounce(function() {
        var defaultActions = self._getOrcidInfo({});

        // go through the current models, and if something is pending
        // make it show an error
        _.forEach(self.hiddenCollection.models, function(m) {
          if (m.get('orcid') && m.get('orcid').pending) {
            m.set('orcid', defaultActions);
          }
        });
      }, 100);

      // attempt to find the model to update and update it's orcid actions
      var onSuccess = function(documents, count) {
        _.forEach(_.rest(arguments), function(info, i) {
          // since the order is maintain from the promises we can grab by index
          var work = documents[i];

          // get the new set of actions
          var actions = self._getOrcidInfo(info);

          // if the record was created by ADS, we can update it now
          if (info.sourcedByADS && _.isUndefined(work.source_name)) {
            work.source_name = 'NASA Astrophysics Data System';
          }
          work.orcid = _.extend({}, work.orcid, actions, { pending: false });

          // make sure the doc has any information we gained
          if (_.isUndefined(work.identifier)) {
            work.identifier = work._work.getIdentifier();
          }

          var model = _.find(self.hiddenCollection.models, function(m) {
            // do our best to find the match
            return (
              (_.isPlainObject(work._work) && work._work === m.get('_work')) ||
              (!_.isUndefined(work.identifier) &&
                work.identifier === m.get('identifier'))
            );
          });

          // found the model, update it
          if (model) {
            var sources;

            // grab the array of sources, if it exists
            if (_.isPlainObject(work._work)) {
              sources = work._work.getSources();
            }

            if (_.isUndefined(model.get('identifier')) && self.orcidWidget) {
              model.set('identifier', work.identifier);
            }

            model.set({
              orcid: actions,
              source_name: _.isArray(sources)
                ? sources.join('; ')
                : model.get('source_name'),
            });
          } else if (count < 60) {
            _.delay(_.bind(onSuccess, self, [work], count + 1), 500);
          }

          // if entry has children, remove them
          if (_.isArray(info.children)) {
            _.forEach(info.children, function(putcode) {
              var model = _.find(self.hiddenCollection.models, function(m) {
                return (
                  _.isString(putcode) && putcode === m.get('_work').getPutCode()
                );
              });

              if (model) {
                self.removeModel(model);
              } else {
                // do nothing
              }
            });
          }
        });
      };

      // retry once, then just set everything still pending to errored
      var onFail = function(documents) {
        if (!failRetry) {
          failRetry = true;
          return getDocInfo(documents);
        }

        // set everything pending to be an error
        return _.defer(setPendingToError);
      };

      // set all docs to pending and start the async doc info requests
      getDocInfo = function(documents) {
        var promises = _.map(documents, function(d) {
          return orcidApi.getRecordInfo(d).done(function(info) {
            // if the record was created by ADS, we can update it now
            if (info.sourcedByADS && _.isUndefined(d.source_name)) {
              d.source_name = 'NASA Astrophysics Data System';
            }

            // no matter what, update the docs asap
            d.orcid = _.extend({}, d.orcid, self._getOrcidInfo(info), {
              pending: false,
            });
          });
        });

        // start the docs to pending
        self._setDocsToPending(documents);

        // wait for all the promises to resolve
        $.when
          .apply($, promises)
          .then(_.partial(onSuccess, documents), _.partial(onFail, documents));
      };

      getDocInfo(docs);
      return docs;
    };

    /**
     * Sync up the collection with orid information currently on the
     * hidden collection
     */
    WidgetClass.prototype._paginationUpdate = function() {
      var self = this;
      _.forEach(this.hiddenCollection.models, function(hiddenModel) {
        var match = _.find(self.collection.models, function(model) {
          return model.get('_work') === hiddenModel.get('_work');
        });

        if (match && match.get('orcid').pending) {
          match.set('orcid', hiddenModel.get('orcid'));
        }
      });
    };

    /**
     * update the models with orcid information
     * @param {number=} tries - number of current retries
     */
    WidgetClass.prototype._updateModelsWithOrcid = function(models, tries) {
      var modelsToUpdate = _.filter(
        models || this.hiddenCollection.models,
        function(m) {
          return !m.has('_work') && m.has('identifier');
        }
      );

      if (_.isEmpty(modelsToUpdate)) {
        if (tries < 60) {
          _.delay(
            _.bind(self._updateModelsWithOrcid, self, null, tries + 1),
            500
          );
        }
        return;
      }

      // this creates a connection between model->orcid, and updates source name
      var oApi = this.getBeeHive().getService('OrcidApi');
      oApi.getUserProfile().done(function(profile) {
        var works = profile.getWorks();
        _.forEach(modelsToUpdate, function(m) {
          var exIds = _.flatten(_.values(_.pick(m.attributes, ['identifier'])));
          _.forEach(works, function(w) {
            var wIds = _.flatten(_.values(w.getIdentifier()));
            var idMatch = _.intersection(exIds, wIds).length > 0;

            if (idMatch) {
              m.set({
                source_name: w.getSources().join('; '),
                _work: w,
              });
            } else if (tries < 60) {
              _.delay(
                _.bind(self._updateModelsWithOrcid, self, [m], tries + 1),
                500
              );
            }
          });
        });
      });
    };

    /**
     * if orcidMode is on, update the set of new docs with orcid information
     * @param {ApiResponse} apiResponse - the response from the api
     * @param {array} docs - set of docs to be processed
     * @param {object} pagination - pagination data (i.e. start, page, etc)
     */
    WidgetClass.prototype.processDocs = function(
      apiResponse,
      docs,
      pagination
    ) {
      docs = processDocs.apply(this, arguments);
      var user = this.getBeeHive().getObject('User');
      // for results list only show if orcidModeOn, for orcid big widget show always
      if ((user && user.isOrcidModeOn()) || this.orcidWidget) {
        var params = apiResponse.get('responseHeader.params');
        var docsSoFar = parseInt(params.start) + parseInt(params.rows);
        var result = this.addOrcidInfo(docs, docsSoFar);
        if (pagination.numFound !== result.length) {
          _.extend(pagination, this.getPaginationInfo(apiResponse, docs));
        }
        _.delay(_.bind(this._updateModelsWithOrcid, this, 0), 1000);
        return result;
      }
      return docs;
    };

    /**
     * Enhances the model with ADS metadata (iff we are coming from orcid)
     * or with Orcid metadata, iff we are coming from ADS. So, it works
     * both ways and can be used in both the search results views and in
     * the pure orcid listings
     *
     * @param model
     * @returns {*}
     */
    WidgetClass.prototype.mergeADSAndOrcidData = function(model) {
      var self = this;
      var final = $.Deferred();
      var oApi = self.getBeeHive().getService('OrcidApi');

      /**
       * Take the full orcid work (not summary) and extend the current matched
       * model with the data from each source
       *
       * @param {Work} fullOrcidWork
       * @param {object} adsResponse
       */
      var onRecieveFullADSWork = function(fullOrcidWork, adsResponse) {
        var adsWork =
          adsResponse.response &&
          adsResponse.response.docs &&
          adsResponse.response.docs[0];

        // work around to make sure updates work properly
        fullOrcidWork = new Work(fullOrcidWork._root, true);

        var parsedOrcidWork = fullOrcidWork.toADSFormat();

        parsedOrcidWork = _.isPlainObject(parsedOrcidWork)
          ? parsedOrcidWork
          : {};
        adsWork = _.isPlainObject(adsWork) ? adsWork : {};

        // extend the current model with our new information
        model.set(_.extend({}, model.attributes, parsedOrcidWork, adsWork));

        final.resolve(model);
      };

      /**
       * reject on failure
       */
      var onADSFailure = function() {
        final.reject.apply(final, arguments);
      };

      /**
       * reject on failure
       */
      var onOrcidFailure = function() {
        final.reject.apply(final, arguments);
      };

      /**
       * After getting back the full orcid work, we
       * create a new query to find an ADS match
       *
       * @param {Work} fullOrcidWork - the full orcid work record
       */
      var onRecieveFullOrcidWork = function(fullOrcidWork) {
        var identifier = model.get('identifier');

        var q = new ApiQuery({
          q: 'identifier:' + queryUpdater.quoteIfNecessary(identifier),
          fl: 'title,abstract,bibcode,author,pub,pubdate,doi,doctype',
        });

        var req = new ApiRequest({
          query: q,
          target: ApiTargets.SEARCH,
          options: {
            done: _.partial(onRecieveFullADSWork, fullOrcidWork),
            fail: onADSFailure,
          },
        });

        var pubSub = self.getPubSub();
        pubSub.publish(pubSub.EXECUTE_REQUEST, req);
      };

      var work = model.get('_work');
      if (work) {
        oApi
          .getWork(work.getPutCode())
          .done(onRecieveFullOrcidWork)
          .fail(onOrcidFailure);
      } else {
        this._findWorkByModel(model)
          .done(function(work) {
            oApi
              .getWork(work.getPutCode())
              .done(onRecieveFullOrcidWork)
              .fail(onOrcidFailure);
          })
          .fail(onOrcidFailure);
      }

      return final.promise();
    };

    /**
     * Finds a work by comparing a model to what we retrieve from ORCID,
     * It can also take a profile param that bypasses the call to orcid, if
     * it isn't necessary to get the most up-to-date data.
     *
     * @param {object} [model] model
     * @param {Profile} _profile
     * @private
     */
    WidgetClass.prototype._findWorkByModel = function(model, _profile) {
      var $dd = $.Deferred();
      var oApi = this.getBeeHive().getService('OrcidApi');
      var exId = _.pick(model.attributes, ['identifier']);
      var exIds = _.pick(model.attributes, ['all_ids']);
      var oldOrcid = _.clone(model.get('orcid') || {});
      var profile = null;
      if (_.isUndefined(_profile)) {
        profile = oApi.getUserProfile();
      }

      var success = function(profile) {
        var works = profile.getWorks();
        var noUpdate = true;
        var putCode = null;
        var matchedWork = _.find(works, function(w) {
          var wIds = w.getIdentifier();
          noUpdate = exId.identifier === wIds;
          putCode = w.getPutCode();
          return _.contains(exIds.all_ids, wIds);
        });
        if (matchedWork) {
          if (!noUpdate) {
            var work = Work.adsToOrcid(model.attributes, putCode);
            oApi.updateWork(work);
          }
          $dd.resolve(matchedWork);
        } else {
          $dd.reject();
          var msg = 'Could not find a matching ORCiD Record';
          console.error.apply(console, [msg].concat(arguments));
          model.set(
            'orcid',
            _.extend(oldOrcid, {
              pending: false,
              error: msg,
            })
          );
        }
      };

      var fail = function() {
        $dd.reject.apply($dd, arguments);
        var msg = 'Error retrieving ORCiD profile';
        console.error.apply(console, [msg].concat(arguments));
        model.set(
          'orcid',
          _.extend(oldOrcid, {
            pending: false,
            error: msg,
          })
        );
      };

      if (_.isUndefined(_profile)) {
        profile.done(success);
        profile.fail(fail);
      } else {
        success(_profile);
      }

      return $dd.promise();
    };

    /**
     * Remove a particular model from the collection and do some
     * clean up on the view to make sure things show up okay
     *
     * @param {Backbone.Model} model - the model to be removed
     */
    WidgetClass.prototype.removeModel = function(model) {
      var idx = model.resultsIndex;
      this.hiddenCollection.remove(model);
      var models = this.hiddenCollection.models;
      _.forEach(_.rest(models, idx), function(m) {
        m.set('resultsIndex', m.get('resultsIndex') - 1);
        m.set('indexToShow', m.get('indexToShow') - 1);
      });

      var showRange = this.model.get('showRange');
      var range = _.range(showRange[0], showRange[1] + 1);
      var visible = [];
      _.forEach(range, function(i) {
        if (models[i] && models[i].set) {
          models[i].set('visible', true);
          models[i].resultsIndex = i;
          models[i].set('resultsIndex', i);
          models[i].set('indexToShow', i + 1);
          visible.push(models[i]);
        }
      });
      this.hiddenCollection.reset(models);
      this.collection.reset(visible);

      // reset the total number of papers
      this.model.set('totalPapers', models.length);
    };

    /**
     * Called when any internal event is triggered
     *
     * @param {string} ev - the event
     * @param {object} arg1 - extra event information
     * @param {object} data - event action data
     */
    WidgetClass.prototype.onAllInternalEvents = function(ev, arg1, data) {
      if (ev === 'childview:OrcidAction') {
        var self = this;
        var action = data.action;
        var orcidApi = this.getBeeHive().getService('OrcidApi');
        var oldOrcid = _.clone(data.model.get('orcid') || {});
        var pubsub = this.getPubSub();
        pubsub.publish(pubsub.CUSTOM_EVENT, 'orcid-action', action);

        var handlers = {
          'orcid-add': function(model) {
            model.set('orcid', { pending: true });

            var onAddComplete = function() {
              self._findWorkByModel(model).done(function(work) {
                // we should be able to assume some record info
                var recInfo = {
                  isCreatedByADS: true,
                  isCreatedByOthers: false,
                  isKnownToADS: true,
                  provenance: 'ads',
                };

                model.set({
                  orcid: self._getOrcidInfo(recInfo),
                  source_name: work.getSources().join('; '),
                });

                self.trigger('orcidAction:' + action, model);
              });
            };

            var doAdd = function doAdd(adsWork) {
              orcidApi
                .addWork(adsWork)
                .done(onAddComplete)
                .fail(function addFailed(xhr, error, state) {
                  // there is a conflicting record, update record
                  if (state === 'CONFLICT') {
                    return onAddComplete();
                  }

                  var msg = 'Failed to add entry, please try again';
                  console.error.apply(console, [msg].concat(arguments));
                  model.set(
                    'orcid',
                    _.extend(oldOrcid, {
                      pending: false,
                      error: msg,
                    })
                  );
                });
            };

            var newWork = Work.adsToOrcid(model.attributes);
            if (newWork) {
              doAdd(newWork);
            } else {
              var msg = 'There was a problem adding the record, try again';
              console.error.apply(console, [msg].concat(arguments));
              model.set(
                'orcid',
                _.extend(oldOrcid, {
                  pending: false,
                  error: msg,
                })
              );
            }
          },
          'orcid-delete': function(model) {
            model.set('orcid', { pending: true });

            var deleteSuccess = function() {
              // Remove entry from collection after delete
              if (self.orcidWidget) {
                self.removeModel(model);
              } else {
                // reset orcid actions
                model.set('orcid', self._getOrcidInfo({}));
              }
              self.trigger('orcidAction:' + action, model);
            };

            var performDelete = function(work) {
              orcidApi
                .deleteWork(work.getPutCode())
                .done(deleteSuccess)
                .fail(function deleteFail(xhr, error, state) {
                  /*
                  record not found, treat like the delete worked
                  Subsequent deletes on an already deleted entity can cause
                  404s
                  */
                  if (state === 'NOT FOUND') {
                    return deleteSuccess();
                  }

                  var msg = 'Error deleting record, please try again';
                  console.error.apply(console, [msg].concat(arguments));
                  model.set(
                    'orcid',
                    _.extend(oldOrcid, {
                      pending: false,
                      error: msg,
                    })
                  );
                });
            };

            var work = model.get('_work');
            if (work) {
              performDelete(work);
            } else {
              self._findWorkByModel(model).done(performDelete);
            }
          },
          'orcid-update': function(model) {
            model.set('orcid', { pending: true });

            var failedUpdating = function() {
              var msg = 'Error updating record, please try again';
              console.error.apply(console, [msg].concat(arguments));
              model.set(
                'orcid',
                _.extend(oldOrcid, {
                  pending: false,
                  error: msg,
                })
              );
            };

            self
              .mergeADSAndOrcidData(model)

              // done merging, begin update
              .done(function(model) {
                var putCode = model.get('_work').getPutCode();

                var work = Work.adsToOrcid(model.attributes, putCode);
                if (_.isNull(work)) {
                  // if something went wrong parsing the work, fail it here
                  return failedUpdating(work);
                }

                orcidApi
                  .updateWork(work)

                  // update successful
                  .done(function doneUpdating(orcidWork) {
                    var work = new Work(orcidWork, true);
                    orcidApi
                      .getRecordInfo(work.toADSFormat())

                      // done getting record info, update model
                      .done(function doneGettingRecordInfo(recInfo) {
                        model.set('orcid', self._getOrcidInfo(recInfo));
                        self.trigger('orcidAction:' + action, model);
                      });
                  })

                  // update failed, update model accordingly
                  .fail(failedUpdating);

                // update the model with the updated data
                model.set(model.attributes, { silent: true });
              })

              // merging failed, update the model
              .fail(function failedMerging() {
                var msg = 'Failed to merge ORCiD and ADS data';
                console.error.apply(console, [msg].concat(arguments));
                model.set(
                  'orcid',
                  _.extend(oldOrcid, {
                    pending: false,
                    error: msg,
                  })
                );
              });
          },
          'orcid-login': function() {
            orcidApi.signIn();
          },
          'orcid-logout': function() {
            orcidApi.signOut();
          },
          'orcid-view': function(model) {
            // send them to the work on their orcid profile
            var url = model.get('orcidWorkPath');
            if (_.isString(url)) {
              var win = window.open(url, '_blank');
              win.focus();
            }
          },
        };
        handlers[action] && handlers[action](data.model);
      }
      return onAllInternalEvents.apply(this, arguments);
    };

    return WidgetClass;
  };
});
