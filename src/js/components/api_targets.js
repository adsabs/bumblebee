/**
 * Created by rchyla on 1/20/15
 *
 * contains api targets
 * and any related limits
 */

define([
    'underscore',
    'backbone'
  ],
  function(
    _,
    Backbone
    ) {

    return {
      SEARCH: 'search/query',
      QTREE: 'search/qtree',
      BIGQUERY: 'search/bigquery',
      EXPORT: 'export/',
      SERVICE_AUTHOR_NETWORK: 'vis/author-network',
      SERVICE_PAPER_NETWORK: 'vis/paper-network',
      SERVICE_WORDCLOUD: 'vis/word-cloud',
      SERVICE_METRICS: 'metrics',
      SERVICE_OBJECTS: 'objects',
      MYADS_STORAGE: 'vault',

      CSRF : 'accounts/csrf',
      USER: 'accounts/user',
      USER_DATA: 'vault/user-data',
      SITE_CONFIGURATION : 'vault/configuration',
      TOKEN:'accounts/token',
      LOGOUT: 'accounts/logout',
      REGISTER: 'accounts/register',
      VERIFY : 'accounts/verify',
      DELETE: 'accounts/user/delete',
      RESET_PASSWORD: 'accounts/reset-password',
      CHANGE_PASSWORD: 'accounts/change-password',
      CHANGE_EMAIL: 'accounts/change-email',

      RECOMMENDER : 'recommender',
      GRAPHICS: 'graphics',
      FEEDBACK : 'feedback/slack',

      //library endpoints
      //can get info about all libraries, or list of bibcodes associated w/specific lib (libraries/id)
      //post to /libraries/ to create a library
      LIBRARIES : "biblib/libraries",
      //can post, put, and delete changes to individual libs using this endpoint
      DOCUMENTS : "biblib/documents",
      PERMISSIONS : "biblib/permissions",


      _limits  : {
        //use the same name from discovery.config.js

        Metrics : {
          default : 1000, limit : 2000
        },

        AuthorNetwork : {
          default : 400, limit : 1000

        },
        PaperNetwork : {
          default : 400, limit : 1000

        },
        ConceptCloud : {
          default : 150, limit : 150

        },
        BubbleChart : {
          //default == limit
          default : 1500

        }
      }

    };
  });
