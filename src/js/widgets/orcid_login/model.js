define([
    'backbone',
    'underscore'
  ],
  function(
    Backbone,
    _
  ) {

    var OrcidProfileModel = Backbone.Model.extend({
      defaults: function () {
        var result = {
          familyName: undefined,
          givenName: undefined,


          isSignedOut : true,
          isWaitingForProfileInfo : false,
          isSignedIn : false,
          currentState: 'signedOut'

        };

        return result;
      }
    });

    return OrcidProfileModel;

  });