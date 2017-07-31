/**
 * Created by alex on 5/19/14.
 */
define([
  'underscore',
  'jquery',
  'react',
  'enzyme',
  'backbone',
  'js/components/api_query',
  'js/widgets/abstract/util',
  'es6!js/widgets/abstract/widget.jsx',
  'js/widgets/abstract/actions',
  'es6!js/widgets/abstract/component/app.jsx',
  'es6!js/widgets/abstract/component/abstract.jsx',
  'js/widgets/base/base_widget',
  'js/bugutils/minimal_pubsub'
], function (
  _, $, React, Enzyme, Backbone, ApiQuery, util, AbstractWidget,
  actions, App, Abstract,
  BaseWidget, MinimalPubSub
) {

  var mockApiQuery = new ApiQuery({ q: 'bibcode:foo' });

  var mockDocs = {
    "bibcode": "foo",
    "keyword": ["HARMONY OF THE UNIVERSE", "THEORY OF MUSIC", "PLATO'S BODIES"],
    "author": ["Lieske, J. H.", "Standish, E. M."],
    "abstract": "In the past twenty years there has been a great amount of growth in radiometric observing methods.",
    "pub": "IAU Colloq. 56: Reference Coordinate Systems for Earth Dynamics",
    "pubdate": "1981-00-00",
    "title": ["Planetary Ephemerides <a href=\"test-url\">TEST</a>"],
    "aff": ["Heidelberg, Universität, Heidelberg, Germany", "California Institute of Technology, Jet Propulsion Laboratory, Pasadena, CA"],
    "citation_count" : 5,
    "[citations]" : { num_citations : 3 }
  };

  var mockResponse = {
    get: function (str) {
      if (/docs/.test(str)) {
        return this.response.docs[0];
      } else if (/numFound/.test(str)) {
        return this.response.numFound;
      }
    },
    "responseHeader": {
      "status": 0,
      "QTime": 1,
      "params": {
        "wt": "json",
        "q": "bibcode:2017MNRAS.467.4015H",
        "fl": "links_data"
      }
    },
    "response": {
      "numFound": 1,
      "start": 0,
      "docs": [mockDocs]
    }
  };

  var mockDocStashController = {
    getDocs: function () {
      return [
        mockDocs
      ];
    },
    getHardenedInstance: function () {
      return this;
    }
  };

  describe('Abstract Widget', function () {
    var sandbox, widget, minsub, beehive, dispatchRequestStub;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      widget = new AbstractWidget();
      minsub = new MinimalPubSub();
      minsub.beehive.addObject('DocStashController', mockDocStashController);
      beehive = minsub.beehive.getHardenedInstance();
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('extends from BaseWidget', function () {
      expect(widget).to.be.instanceOf(BaseWidget);
    });

    it('onDisplayDocuments correctly parses query and dispatches from cache', function () {
      widget.activate(beehive);
      widget.dispatchRequest = sandbox.spy();
      var mockDispatch = sandbox.spy();
      actions.onDisplayDocuments(mockApiQuery)(mockDispatch, widget.store.getState, widget);
      expect(widget.dispatchRequest.called).to.be.false;
      expect(mockDispatch.args[0][0].type).to.equal('STOP_LOADING');
      expect(mockDispatch.args[0][0].value).to.be.false;
      expect(mockDispatch.args[1][0].type).to.equal('UPDATE_DOCS');
      expect(mockDispatch.args[1][0].value).to.deep.equal(mockDocs);
    });

    it('onDisplayDocuments correctly parses query and dispatches w/o cache', function () {
      widget.activate(beehive);
      widget.dispatchRequest = sandbox.spy();
      var mockDispatch = sandbox.spy();
      mockApiQuery.set('q', 'bibcode:bar');
      actions.onDisplayDocuments(mockApiQuery)(mockDispatch, widget.store.getState, widget);
      expect(widget.dispatchRequest.args[0][0].get('q')[0]).to.be.equal(mockApiQuery.get('q')[0]);
    });

    it('processResponses dispatches the update to the docs from the response', function () {
      widget.activate(beehive);
      widget.dispatchRequest = sandbox.spy();
      var mockDispatch = sandbox.spy();
      actions.processResponse(mockResponse)(mockDispatch, widget.store.getState, widget);
      expect(mockDispatch.args[0][0].type).to.equal('STOP_LOADING');
      expect(mockDispatch.args[0][0].value).to.be.false;
      expect(mockDispatch.args[1][0].type).to.equal('UPDATE_DOCS');
      expect(mockDispatch.args[1][0].value).to.deep.equal(mockDocs);
      expect(mockDispatch.args[2][0]).is.instanceOf(Function);
    });

    it('processResponses shows error if there are no docs', function () {
      widget.activate(beehive);
      widget.dispatchRequest = sandbox.spy();
      var mockDispatch = sandbox.spy();
      mockResponse.get = function () { return []; };
      actions.processResponse(mockResponse)(mockDispatch, widget.store.getState, widget);
      expect(mockDispatch.args[0][0].type).to.equal('SHOW_ERROR');
    });

    it('dispatchRequest updates query', function () {
      widget.activate(beehive);
      widget.store.dispatch = sandbox.spy();
      widget.dispatchRequest(mockApiQuery);
      expect(widget.getCurrentQuery()).to.deep.equal(mockApiQuery);
      expect(widget.store.dispatch.args[0][0].type).to.equal('UPDATE_QUERY');
      expect(widget.store.dispatch.args[0][0].value.get('q')[0]).to.equal(mockApiQuery.get('q')[0]);
    });

    it('parses docs correctly', function () {
      var parsed = util.parseDocs(_.cloneDeep(mockDocs));
      [
        ['hasAffiliation', null, 2],
        ['authorAff', 0, ['Lieske, J. H.', 'Heidelberg, Universität, Heidelberg, Germany', '%22Lieske%2C+J.+H.%22']],
        ['authorAff', 'length', 2],
        ['hasMoreAuthors', null, false],
        ['formattedDate', null, '1981'],
        ['titleLink', 'href', 'test-url'],
        ['titleLink', 'text', 'TEST'],
        ['title', null, 'Planetary Ephemerides']
      ].forEach(function (prop) {
        expect(parsed).to.have.property(prop[0]);
        expect(prop[1] !== null ?
          parsed[prop[0]][prop[1]] : parsed[prop[0]]).to.deep.equal(prop[2]);
      });
    });

    it('renders correctly', function () {
      var props = {
        docs: util.parseDocs(_.cloneDeep(mockDocs), 1)
      };
      var wrap = Enzyme.shallow(React.createElement(Abstract, props));

      // title
      var renderedTitle = Enzyme.render(wrap.children().get(0));
      expect(renderedTitle.find('h2').html()).to.be.equal('Planetary Ephemerides');

      // author affiliation button
      var wrapAuthAffButton = Enzyme.shallow(wrap.children().get(1));
      expect(wrapAuthAffButton.exists()).to.be.true;
      expect(wrap.state('showAffiliations')).to.be.false;
      expect(wrapAuthAffButton.text()).to.equal('Show Affiliations');
      wrapAuthAffButton.simulate('click');
      expect(wrap.state('showAffiliations')).to.be.true;
      wrapAuthAffButton = Enzyme.shallow(wrap.children().get(1));
      expect(wrapAuthAffButton.update().text()).to.equal('Hide Affiliations');

      // more authors button
      var moreAuthButton = Enzyme.shallow(wrap.children().get(3));
      expect(moreAuthButton.exists()).to.be.true;
      expect(wrap.state('showExtraAuthors')).to.be.false;
      expect(moreAuthButton.text()).to.equal('Show All Authors');
      moreAuthButton.simulate('click');
      expect(wrap.state('showExtraAuthors')).to.be.true;
      moreAuthButton = Enzyme.shallow(wrap.children().get(3));
      expect(moreAuthButton.update().text()).to.equal('Hide Authors');

      // authors and affiliations
      wrap.setState({
        showAffiliations: false,
        showExtraAuthors: false
      });
      var authAndAffs = Enzyme.shallow(wrap.children().get(4));
      expect(authAndAffs.find('ul').exists()).to.be.true;
      expect(authAndAffs.find('li').length).to.equal(2);
      expect(authAndAffs.find('a').length).to.equal(2);
      expect(authAndAffs.text()).to.equal('Lieske, J. H.; ...');
      wrap.setState({
        showExtraAuthors: true
      });
      authAndAffs = Enzyme.shallow(wrap.children().get(4));
      expect(authAndAffs.text()).to.equal('Lieske, J. H.Standish, E. M.');
      wrap.setState({
        showAffiliations: true,
        showExtraAuthors: true
      });
      authAndAffs = Enzyme.shallow(wrap.children().get(4));
      expect(authAndAffs.find('span').length).to.equal(2);
      expect(authAndAffs.text()).to.equal('Lieske, J. H. (Heidelberg, ' +
        'Universität, Heidelberg, Germany)Standish, E. M. (California' +
        ' Institute of Technology, Jet Propulsion Laboratory, Pasadena, CA)');
      wrap.setState({
        showAffiliations: false,
        showExtraAuthors: false
      });
      authAndAffs = Enzyme.shallow(wrap.children().get(4));
      Enzyme.shallow(authAndAffs.find('a').get(1)).simulate('click');
      authAndAffs = Enzyme.shallow(wrap.children().get(4));
      expect(wrap.state('showExtraAuthors')).to.be.true;
      expect(authAndAffs.text()).to.equal('Lieske, J. H.Standish, E. M.');

      // Abstract Text Body
      var renderedAbstractBody = Enzyme.render(wrap.children().get(5));
      expect(renderedAbstractBody.find('div').length).to.be.gte(0);
      expect(renderedAbstractBody.find('p').text()).to.be.equal('In the past ' +
        'twenty years there has been a great amount of growth in radiometric ' +
        'observing methods.');
      wrap.setProps({
        docs: _.omit(_.clone(mockDocs), 'abstract')
      });
      renderedAbstractBody = Enzyme.render(wrap.children().get(5));
      expect(renderedAbstractBody.find('p').text()).to.be.equal('No Abstract');
      wrap.setProps({
        docs: _.clone(mockDocs)
      });

      var setPropsAndTest = function (props, cb) {
        wrap.setProps({
          docs: _.extend({
            bibcode: 'foo'
          }, props)
        });
        var rendered = Enzyme.render(wrap.children().get(7));
        if (typeof cb === 'function') {
          return cb(rendered, props);
        } else {
          expect(rendered.text().trim().split(/\s/))
            .to.deep.equal(cb.trim().split(/\s/));
        }
      };

      _.each([
        [{}, 'Bibcodefoo'],
        [{ pub_raw: 'pub_raw_test' }, 'Publicationpub_raw_testBibcodefoo'],
        [{ formattedDate: '1988' }, 'Pub Date:1988Bibcodefoo'],
        [{ doi: { href: 'doi_url', doi: 'doi_test' }}, 'DOI:doi_testBibcodefoo'],
        [{ keyword: ['test', '1', '2', '3'] }, 'Bibcodefoo Keywordstest;1;2;3']
      ], function (test) {
        setPropsAndTest.apply(null, test);
      });

      // Abstract Container
      wrap.setProps({
        docs: undefined
      });
      wrap.update();
      expect(wrap.html()).to.be.null;
      wrap.setProps({
        docs: {
          bibcode: undefined
        }
      });
      wrap.update();
      expect(wrap.html()).to.match(/Abstract Not Found/);
    });
  });
});
