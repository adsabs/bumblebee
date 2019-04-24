define([
  'js/apps/discovery/navigator',
  'js/bugutils/minimal_pubsub',
  'js/components/api_feedback',
  'js/components/session'

], function(
    Navigator,
    MinPubSub,
    ApiFeedback,
    Session

){

  describe("Navigator", function(){

    it("should handle the orcid endpoint and authenticating if code is provided", function(){

      var n = new Navigator();

      //fake Services

      var orcidApi = {
        //only testing after orcid access has been provided
        hasAccess : function(){
          return true
        },
        getADSUserData : function(){
          var d = $.Deferred();
          //pretending user hasnt filled in data yet
          d.resolve({});
          return d.promise();
        }
      };
      var storage = {
        get : function(val){
          if (val == "orcidAuthenticating"){
            return true;
          }
        },
        remove : sinon.spy(function(val){
        })
      };

      var appStorage = {
        executeStashedNav : sinon.spy(function(){
          return true;
        }),

        get : function(a){
          if (a == "stashedNav") return ["UserPreferences", {"subView":"orcid"}];
        }
      };

      var AlertsController = {
        alert : sinon.spy()
      };

      var MasterPageManager = {
        show: sinon.spy(function () {
          return $.Deferred().resolve().promise();
        })
      };

      var app = {

        getService: function (obj) {
          if (obj == "OrcidApi") {
            return orcidApi
          }
          else if (obj == "PersistentStorage") {
            return storage
          }
        },
        getObject: function (obj) {
          if (obj == "AppStorage") {
            return appStorage;
          }
          else if (obj == "User") {
            return {
              isLoggedIn: function () {
                return true
              }
            }
          }
          else if (obj === "MasterPageManager") {
            return MasterPageManager;
          }
          else if (obj === "LibraryController"){
            return {
              getLibraryBibcodes : function(){
                return ["1", "2", "3"]
              }
            }
          }
        },

        getController: function (obj) {
          if (obj == "AlertsController") {
            return AlertsController
          }
        },

        getWidget : function(obj){
          if (obj === "OrcidBigWidget"){
            return sinon.spy(function(){
              var d = $.Deferred();
              d.resolve();
              return d;
            })
          }
        }
      };


      n.start(app);

      //1. dont show the modal

      n.catalog.get("orcid-page").execute();
      //remove this flag that lets us know to show a special modal when user goes to #orcid-page
      expect(storage.remove.args[0][0]).to.eql("orcidAuthenticating");
      //modal wasn't called
      expect(AlertsController.alert.callCount).to.eql(0);

      //2. show the modal and redirect to orcidbigwidget

      var appStorage = {
        executeStashedNav : sinon.spy(function(){
          return false;
        }),

        get : function(a){
          if (a == "stashedNav") return undefined;
        }
      };

      n.catalog.get("orcid-page").execute();
      expect(AlertsController.alert.callCount).to.eql(1);
      expect(AlertsController.alert.args[0][0]).to.be.instanceof(ApiFeedback);
      expect(AlertsController.alert.args[0][0].title).to.eql("You are now logged in to ORCID");

      //remove this flag that lets us know to show a special modal when user goes to #orcid-page
      expect(storage.remove.args[0][0]).to.eql("orcidAuthenticating");

      expect(MasterPageManager.show.callCount).to.eql(2);

      expect(MasterPageManager.show.args[0][0]).to.eql("OrcidPage");


  });

    it("should have endpoints for library-export, library-metrics, and library-visualization", function(done){

      var n = new Navigator();

      n.getPubSub = function(){
        return {
          publish : sinon.spy()
        }
      }

      var Export = {
        renderWidgetForListOfBibcodes : sinon.spy()
      };
      var Library = {
        setSubView : sinon.spy()
      };

      var MasterPageManager = {
        show : sinon.spy(function() { return $.Deferred().resolve().promise()})
      };

      var app = {

        getObject: function (obj) {

          if (obj === "MasterPageManager") {
            return MasterPageManager;
          }
          else if (obj === "LibraryController"){
            return {
              getLibraryBibcodes : function(){
                return $.Deferred().resolve(["1", "2", "3"]);
              }
            }
          }
        },

        getWidget : function(obj){
          var d = $.Deferred();
          if (obj === "ExportWidget"){
            d.resolve(Export);
          }
          if (obj === "IndividualLibraryWidget"){
            d.resolve(Library);
          }

          // we only grab this for the sort prop on the model
          if (obj === 'LibraryListWidget') {
            d.resolve({ model: { get: _.constant('date desc') }});
          }
          return d;
        }
      };

      n.start(app);


      n.catalog.get("library-export").execute("library-export",    {
        "id": "1",
        "publicView": false,
        "subView": "export",
        "widgetName": "ExportWidget",
        "additional": {
          "format": "bibtex"
        }
      }).done(function() {

        expect(Export.renderWidgetForListOfBibcodes.callCount).to.eql(1);
        expect(Export.renderWidgetForListOfBibcodes.args[0]).to.eql([
          [
            "1",
            "2",
            "3"
          ],
          {
            "format": "bibtex",
            "sort": "date desc"
          }
        ]);

        expect(Library.setSubView.callCount).to.eql(1);
        expect(Library.setSubView.args[0]).to.eql([
          {
            "subView": "export",
            "publicView": false,
            "id": "1"
          }
        ]);

        expect(MasterPageManager.show.callCount).to.eql(1)
        expect(MasterPageManager.show.args[0]).to.eql([
          "LibrariesPage",
          [
            "IndividualLibraryWidget",
            "UserNavbarWidget",
            "ExportWidget"
          ]
        ]);
        done();
      })
    });

    it("should handle the three verify routes which are contained in email links, passing verify token to servers ", function(done){

      var minsub = new MinPubSub({verbose: true});
      minsub.initialize({
                      Api: {
                        request: function() {
                            return $.Deferred().promise();
                          }

                      }
                    });

      var navigator = new Navigator();
      var fakeSession = new Session();
      var beehive = minsub.beehive;
      var fakeApi = beehive.getService('Api')
      sinon.spy(fakeApi, 'request')
      var fakePubSub = minsub.pubsub;
      sinon.spy(fakePubSub, 'publish');

      var getAccess = null;
      navigator.getApiAccess = sinon.spy(function(){getAccess = $.Deferred(); return getAccess.promise()});
      fakePubSub.publish = sinon.spy()
      fakeSession.setChangeToken = sinon.spy();
      beehive.addObject("Session", fakeSession);

      navigator.activate(beehive);
      navigator.start();

      //1. account verification email link

      navigator.set('index-page', sinon.spy(function() {
        return $.Deferred().resolve().promise();
      }))

      var p = navigator.get('user-action').execute('user-action', {subView: "register", token: "fakeToken"});
      expect(fakeApi.request.args[0][0].toJSON().target).to.eql("accounts/verify/fakeToken");
      fakeApi.request.args[0][0].get("options").done.call(navigator, {email:"foo"});
      expect(navigator.getApiAccess.callCount).to.eql(1);
      expect(navigator.get('index-page').execute.callCount).to.eql(0);
      expect(p.state()).to.eql('pending');
      getAccess.resolve(); // pretend the verification was successful
      expect(navigator.get('index-page').execute.callCount).to.eql(1);
      expect(p.state()).to.eql('resolved');
      expect(fakePubSub.publish.args[0][2].toJSON()).to.eql({
        "code": 0,
        "msg": "<p>You have been successfully registered with the username</p> <p><b>foo</b></p>"
      })


      // pretend verification failed
      fakeApi.request.args[0][0].get("options").fail.call(navigator, {responseJSON : {error : "fakeError"}});
      expect(navigator.get('index-page').execute.callCount).to.eql(2);
      expect(fakePubSub.publish.args[1][2].toJSON()).to.eql({
        "code": 0,
        "msg": " <b>fakeError</b> <br/><p>Please try again, or contact <b> adshelp@cfa.harvard.edu for support </b></p>"
      })

      fakeApi.request.reset();
      fakePubSub.publish.reset();
      navigator.getApiAccess.reset();
      navigator.get('index-page').execute.reset();

      //2. change email link

      p = navigator.get('user-action').execute('user-action', {subView: "change-email", token: "fakeToken2"});
      expect(fakeApi.request.args[0][0].toJSON().target).to.eql("accounts/verify/fakeToken2");
      fakeApi.request.args[0][0].get("options").done.call(navigator, {email:"foo2"});
      expect(navigator.getApiAccess.callCount).to.eql(1);
      expect(navigator.get('index-page').execute.callCount).to.eql(0);
      expect(p.state()).to.eql('pending');
      getAccess.resolve(); // pretend the verification was successful
      expect(navigator.get('index-page').execute.callCount).to.eql(1);
      expect(p.state()).to.eql('resolved');
      expect(fakePubSub.publish.args[0][2].toJSON()).to.eql({
        "code": 0,
        "msg": "Your new ADS email is <b>foo2</b>"
      })



      fakeApi.request.args[0][0].get("options").fail.call(navigator, {responseJSON : {error : "fakeError2"}});
      expect(navigator.get('index-page').execute.callCount).to.eql(2);
      expect(fakePubSub.publish.args[1][2].toJSON()).to.eql({
        "code": 0,
        "msg": " <b>fakeError2</b> <br/>Please try again, or contact adshelp@cfa.harvard.edu for support"
      })



      fakeApi.request.reset();
      fakePubSub.publish.reset();
      navigator.getApiAccess.reset();
      navigator.get('index-page').execute.reset();


      //3. reset password is slightly more complicated, should redirect to part 2 of the form in authentication widget
      p = navigator.get('user-action').execute('user-action', {subView: "reset-password", token: "fakeToken3"});
      expect(fakeApi.request.args[0][0].toJSON().target).to.eql("accounts/reset-password/fakeToken3");
      fakeApi.request.args[0][0].get("options").done.call(navigator);

      //store the change token for re-submittal after user fills out second form
      expect(fakeSession.setChangeToken.args[0][0]).to.eql("fakeToken3");
      expect(fakePubSub.publish.args[0].slice(1)).to.eql([
        "[Router]-Navigate-With-Trigger",
        "authentication-page",
        {
          "subView": "reset-password-2"
        }
      ]);

      fakeApi.request.args[0][0].get("options").fail.call(navigator, {responseJSON : {error : "fakeErrorX"}});
      expect(navigator.get('index-page').execute.callCount).to.eql(1);
      expect(fakePubSub.publish.args[1][2].toJSON()).to.eql({
        "code": 0,
        "msg": " <b>fakeErrorX</b> <br/>Reset password token was invalid."
      })

      done();
      })




  });

});
