define(['js/mixins/link_generator_mixin'],
  function(LinkGeneratorMixin){

    describe("Link Generator Mixin", function(){
      var mixin;

      beforeEach(function(){
        mixin = LinkGeneratorMixin;
      });


      it("should have a adsUrlRedirect function used by other functions that takes an identifier and a type, and returns a classic ads url resolver link", function(){
        //this function directly uses Giovanni's logic from beer

        expect(mixin.adsUrlRedirect).to.be.instanceof(Function);
        expect(mixin.adsUrlRedirect('article', 'fakeBibcode')).to.eql("http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=fakeBibcode&link_type=ARTICLE");
        expect(mixin.adsUrlRedirect('doi', 'fakeBibcode')).to.eql("http://adsabs.harvard.edu/cgi-bin/nph-abs_connect?fforward=http://dx.doi.org/fakeBibcode");

      });

      it("should have a getTextAndDataLinks function that takes links data and parses it into seperate dicts with link information, and gets rid of duplicates", function(){

        var links_data = ['{"title":"", "type":"simbad", "instances":"10", "access":""}',
          '{"title":"", "type":"ned", "instances":"3", "access":""}',
          '{"title":"", "type":"pdf", "instances":"", "access":"open"}',
          '{"title":"", "type":"gif", "instances":"", "access":"open"}',
          '{"title":"", "type":"article", "instances":"", "access":"open"}',
          '{"title":"", "type":"preprint", "instances":"", "access":"open"}',
          '{"title":"", "type":"data", "instances":"", "access":""}',
          '{"title":"", "type":"electr", "instances":"", "access":"open"}',
          '{"title":"", "type":"electr", "instances":"", "access":""}'
        ];

        var output = mixin.getTextAndDataLinks(links_data, "fakeBib");

        //testing every link type

        expect(output.text.length).to.eql(5);
        //type : electr
        expect(_.where(output.text, {title : "Publisher Article"}).length).to.eql(1);
        //type : gif
        expect(_.where(output.text, {title : "ADS Scanned Article"}).length).to.eql(1);
        //type : preprint
        expect(_.where(output.text, {title : "arXiv e-print"}).length).to.eql(1);
        //type : pdf
        expect(_.where(output.text, {title : "Publisher PDF"}).length).to.eql(1);
        //type : article
        expect(_.where(output.text, {title : "ADS PDF"}).length).to.eql(1);

        //get rid of duplicate publisher articles, only show 1 listing with openaccess
        expect(_.findWhere(output.text, {title : "Publisher Article"}).openAccess).to.be.true;

        expect(output.data.length).to.eql(3);

        expect(_.where(output.data, {title : "SIMBAD objects (10)"}).length).to.eql(1);
        expect(_.where(output.data, {title : "Archival Data"}).length).to.eql(1);
        expect(_.where(output.data, {title : "NED objects (3)"}).length).to.eql(1);

      })

      it("should have a parseLinksData method used to add links for a list of results", function(){

        var dataWithLinks = mixin.parseLinksData([{
          "bibcode": "1993A&A...277..309L",

          "[citations]": {
            "num_citations": 62,
            "num_references": 8
          },
          links_data : ['{"title":"", "type":"simbad", "instances":"10", "access":""}',
            '{"title":"", "type":"ned", "instances":"3", "access":""}',
            '{"title":"", "type":"pdf", "instances":"", "access":"open"}',
            '{"title":"", "type":"gif", "instances":"", "access":""}',
            '{"title":"", "type":"article", "instances":"", "access":"open"}',
            '{"title":"", "type":"preprint", "instances":"", "access":"open"}',
            '{"title":"", "type":"data", "instances":"", "access":""}',
            '{"title":"", "type":"electr", "instances":"", "access":"open"}',
            '{"title":"", "type":"electr", "instances":"", "access":""}'
          ],

          "property": [
            "OPENACCESS",
            "NOT REFEREED",
            "ADS_SCAN",
            "TOC",
            "ARTICLE"
          ],

        "orderNum": 5
        }]);

        expect(JSON.stringify(dataWithLinks[0].links.list)).to.eql('[{"letter":"C","title":"Citations (62)","link":"#abs/1993A&A...277..309L/citations"},{"letter":"R","title":"References (8)","link":"#abs/1993A&A...277..309L/references"},{"letter":"T","title":"Table of Contents","link":"#abs/1993A&A...277..309L/tableofcontents"}]');

        expect(JSON.stringify(dataWithLinks[0].links.text)).to.eql('[{"openAccess":true,"title":"Publisher PDF","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1993A&A...277..309L&link_type=ARTICLE"},'+
        '{"openAccess":false,"title":"ADS Scanned Article","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1993A&A...277..309L&link_type=GIF"},'+
        '{"openAccess":true,"title":"ADS PDF","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1993A&A...277..309L&link_type=ARTICLE"},'+
        '{"openAccess":true,"title":"arXiv e-print","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1993A&A...277..309L&link_type=PREPRINT"},'+
        '{"openAccess":true,"title":"Publisher Article","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1993A&A...277..309L&link_type=EJOURNAL","openUrl":false}]');

        expect(JSON.stringify(dataWithLinks[0].links.data)).to.eql('[{"title":"SIMBAD objects (10)","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1993A&A...277..309L&link_type=SIMBAD"},'+
        '{"title":"NED objects (3)","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1993A&A...277..309L&link_type=NED"},'+
        '{"title":"Archival Data","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1993A&A...277..309L&link_type=DATA"}]');

      })

      it("should have a parseResourcesData method used by the resources widget on the abstract page", function(){

        var dataWithLinks = mixin.parseResourcesData({
          "bibcode": "1989RMxAA..18..125C",

          "links_data": ['{"title":"", "type":"simbad", "instances":"10", "access":""}',
            '{"title":"", "type":"ned", "instances":"3", "access":""}',
            '{"title":"", "type":"pdf", "instances":"", "access":"open"}',
            '{"title":"", "type":"gif", "instances":"", "access":"false"}',
            '{"title":"", "type":"article", "instances":"", "access":"open"}',
            '{"title":"", "type":"preprint", "instances":"", "access":"open"}',
            '{"title":"", "type":"data", "instances":"", "access":""}',
            '{"title":"", "type":"electr", "instances":"", "access":"open"}',
            '{"title":"", "type":"electr", "instances":"", "access":""}'
          ],
          "property": [
            "OPENACCESS",
            "NOT REFEREED",
            "ADS_SCAN",
            "TOC",
            "ARTICLE"
          ],
          "[citations]": {
            "num_citations": 9,
            "num_references": 48
          }
        });

        expect(JSON.stringify(dataWithLinks.fullTextSources)).to.eql('[{"openAccess":true,"title":"Publisher PDF","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1989RMxAA..18..125C&link_type=ARTICLE"},{"openAccess":false,"title":"ADS Scanned Article","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1989RMxAA..18..125C&link_type=GIF"},{"openAccess":true,"title":"ADS PDF","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1989RMxAA..18..125C&link_type=ARTICLE"},{"openAccess":true,"title":"arXiv e-print","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1989RMxAA..18..125C&link_type=PREPRINT"},{"openAccess":true,"title":"Publisher Article","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1989RMxAA..18..125C&link_type=EJOURNAL","openUrl":false}]');
        expect(JSON.stringify(dataWithLinks.dataProducts)).to.eql('[{"title":"SIMBAD objects (10)","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1989RMxAA..18..125C&link_type=SIMBAD"},{"title":"NED objects (3)","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1989RMxAA..18..125C&link_type=NED"},{"title":"Archival Data","link":"http://adsabs.harvard.edu/cgi-bin/nph-data_query?bibcode=1989RMxAA..18..125C&link_type=DATA"}]');


      })

      it("should determine if an openURL is required and generate it using the OpenURLGenerator mixin", function() {

        /**
         * Test passes the following situation:
         *   - user is authenticated
         *   - user has library link service
         *   - journal has NO open access
         *   - journal has NO scan available from the ADS
         */

        var stub_meta_data = {
          "bibcode": "2015MNRAS.451.4686F",
          "first_author": "Friis, M.",
          "year": "2015",
          "page": ["4686-4690"],
          "pub": "Monthly Notices of the Royal Astronomical Society",
          "pubdate": "2015-05-00",
          "title": ["The warm, the excited, and the molecular gas: " +
          "GRB 121024A shining through its star-forming galaxy"],
          "volume": "451",
          "doi": ["10.1093/mnras/stv960"],
          "issue": 1,
          "issn": ["0035-8711"],
          "link_server": "MyBaseURL"
        };

        var stub_links_data = [
          '{"title":"", "type":"article", "instances":"", "access":""}',
          '{"title":"", "type":"preprint", "instances":"", "access":"open"}',
          '{"title":"", "type":"electr", "instances":"", "access":""}'
        ];

        // Check that an openURL is created
        var output = mixin.getTextAndDataLinks(stub_links_data, stub_meta_data.bibcode, stub_meta_data);
        expect(_.where(output.text, {title : "Publisher Article"})[0]["link"]).to.contain("doi:10.1093/mnras/stv960");
        expect(_.where(output.text, {title : "Publisher Article"})[0]["link"]).to.contain("MyBaseURL");
        expect(_.where(output.text, {title : "Publisher Article"})[0]["openUrl"]).to.eql(true);

      });

      it("should not generate an openURL if the article is open access", function() {

        /**
         * Test passes the following situation:
         *   - user is authenticated
         *   - user has library link service
         *   - journal has OPEN access
         *   - journal has NO scan available from the ADS
         */

        var stub_meta_data = {
          "bibcode": "2015MNRAS.451.4686F",
          "first_author": "Friis, M.",
          "year": "2015",
          "page": ["4686-4690"],
          "pub": "Monthly Notices of the Royal Astronomical Society",
          "pubdate": "2015-05-00",
          "title": ["The warm, the excited, and the molecular gas: " +
          "GRB 121024A shining through its star-forming galaxy"],
          "volume": "451",
          "doi": ["10.1093/mnras/stv960"],
          "issue": 1,
          "issn": ["0035-8711"],
          "link_server": "MyBaseURL"
        };

        var stub_links_data = [
          '{"title":"", "type":"article", "instances":"", "access":""}',
          '{"title":"", "type":"preprint", "instances":"", "access":"open"}',
          '{"title":"", "type":"electr", "instances":"", "access":"open"}'
        ];

        // Check that an openURL is NOT created
        var output = mixin.getTextAndDataLinks(stub_links_data, stub_meta_data.bibcode, stub_meta_data);
        expect(_.where(output.text, {title : "Publisher Article"})[0]["link"]).to.not.contain("url_ver");
        expect(_.where(output.text, {title : "Publisher Article"})[0]["openUrl"]).to.eql(false);

      });

      it("should not generate an openURL if there is an ADS scan available", function() {

        /**
         * Test passes the following situation:
         *   - user is authenticated
         *   - user has library link service
         *   - journal has NO open access
         *   - journal has SCAN available from the ADS
         */

        var stub_meta_data = {
          "bibcode": "2015MNRAS.451.4686F",
          "first_author": "Friis, M.",
          "year": "2015",
          "page": ["4686-4690"],
          "pub": "Monthly Notices of the Royal Astronomical Society",
          "pubdate": "2015-05-00",
          "title": ["The warm, the excited, and the molecular gas: " +
          "GRB 121024A shining through its star-forming galaxy"],
          "volume": "451",
          "doi": ["10.1093/mnras/stv960"],
          "issue": 1,
          "issn": ["0035-8711"]
        };

        var stub_links_data = [
          '{"title":"", "type":"article", "instances":"", "access":""}',
          '{"title":"", "type":"preprint", "instances":"", "access":"open"}',
          '{"title":"", "type":"electr", "instances":"", "access":""}',
          '{"title":"", "type":"gif", "instances":"", "access":"open"}'
        ];

        // Check that an openURL is NOT created
        var output = mixin.getTextAndDataLinks(stub_links_data, stub_meta_data.bibcode, stub_meta_data);
        expect(_.where(output.text, {title : "Publisher Article"})[0]["link"]).to.not.contain("url_ver");
        expect(_.where(output.text, {title : "Publisher Article"})[0]["openUrl"]).to.eql(false);

      });

      it("should not generate an openURL if user is not authenticated", function() {

        /**
         * Test passes the following situation:
         *   - user is NOT authenticated (no link server)
         *   - user has library link service
         *   - journal has NO open access
         *   - journal has NO scan available from the ADS
         */

        var stub_meta_data = {
          "bibcode": "2015MNRAS.451.4686F",
          "first_author": "Friis, M.",
          "year": "2015",
          "page": ["4686-4690"],
          "pub": "Monthly Notices of the Royal Astronomical Society",
          "pubdate": "2015-05-00",
          "title": ["The warm, the excited, and the molecular gas: " +
          "GRB 121024A shining through its star-forming galaxy"],
          "volume": "451",
          "doi": ["10.1093/mnras/stv960"],
          "issue": 1,
          "issn": ["0035-8711"]
        };

        var stub_links_data = [
          '{"title":"", "type":"article", "instances":"", "access":""}',
          '{"title":"", "type":"preprint", "instances":"", "access":"open"}',
          '{"title":"", "type":"electr", "instances":"", "access":""}'
        ];

        // Check that an openURL is NOT created
        var output = mixin.getTextAndDataLinks(stub_links_data, stub_meta_data.bibcode, stub_meta_data);
        expect(_.where(output.text, {title : "Publisher Article"})[0]["link"]).to.not.contain("url_ver");
        expect(_.where(output.text, {title : "Publisher Article"})[0]["openUrl"]).to.eql(false);

      });

      it("should not generate an openURL if the user has no library server for the openURL service", function (){

        /**
         * Test passes the following situation:
         *   - user is authenticated
         *   - user has NO library link service
         *   - journal has NO open access
         *   - journal has NO scan available from the ADS
         */

        var stub_meta_data = {
          "bibcode": "2015MNRAS.451.4686F",
          "first_author": "Friis, M.",
          "year": "2015",
          "page": ["4686-4690"],
          "pub": "Monthly Notices of the Royal Astronomical Society",
          "pubdate": "2015-05-00",
          "title": ["The warm, the excited, and the molecular gas: " +
          "GRB 121024A shining through its star-forming galaxy"],
          "volume": "451",
          "doi": ["10.1093/mnras/stv960"],
          "issue": 1,
          "issn": ["0035-8711"],
          "link_server": undefined
        };

        var stub_links_data = [
          '{"title":"", "type":"article", "instances":"", "access":""}',
          '{"title":"", "type":"preprint", "instances":"", "access":"open"}',
          '{"title":"", "type":"electr", "instances":"", "access":""}'
        ];

        // Check that an openURL is NOT created
        var output = mixin.getTextAndDataLinks(stub_links_data, stub_meta_data.bibcode, stub_meta_data);
        expect(_.where(output.text, {title : "Publisher Article"})[0]["link"]).to.not.contain("url_ver");
        expect(_.where(output.text, {title : "Publisher Article"})[0]["openUrl"]).to.eql(false);

      });

      it("should not generate an openURL at all if there is no DOI/ISSN/ISBN", function (){
        /**
         * Test passes the following situation
         *   - user is authenticated
         *   - user has a library link service
         *   - journal has NO open access
         *   - journal has NO scan available from the ADS
         *   - journal has NO doi available
         */
        var stub_meta_data = {
          "bibcode": "2015MNRAS.451.4686F",
          "first_author": "Friis, M.",
          "year": "2015",
          "page": ["4686-4690"],
          "pub": "Monthly Notices of the Royal Astronomical Society",
          "pubdate": "2015-05-00",
          "title": ["The warm, the excited, and the molecular gas: " +
          "GRB 121024A shining through its star-forming galaxy"],
          "volume": "451",
          "issue": 1,
          "link_server": "MyBaseUrl"
        };

        var stub_links_data = [
          '{"title":"", "type":"article", "instances":"", "access":""}',
          '{"title":"", "type":"preprint", "instances":"", "access":"open"}',
          '{"title":"", "type":"electr", "instances":"", "access":""}'
        ];


        // Check that an openURL is NOT created
        var output = mixin.getTextAndDataLinks(stub_links_data, stub_meta_data.bibcode, stub_meta_data);
        expect(_.where(output.text, {title : "Publisher Article"})[0]["link"]).to.not.contain("url_ver");
        expect(_.where(output.text, {title : "Publisher Article"})[0]["openUrl"]).to.eql(false);

        // Check that an openURL IS created
        var identifierList = ['isbn', 'issn', 'doi'];
        for (var i=0; i < identifierList.length; ++i){

          var tempIdentifiers = identifierList.slice(0);
          tempIdentifiers.splice(i,1);

          stub_meta_data[identifierList[i]] = 'fake'
          var output = mixin.getTextAndDataLinks(stub_links_data, stub_meta_data.bibcode, stub_meta_data);
          expect(_.where(output.text, {title : "Publisher Article"})[0]["link"]).to.contain(identifierList[i]);
          tempIdentifiers.forEach(function (value){
            expect(_.where(output.text, {title : "Publisher Article"})[0]["link"]).to.not.contain(value);
            expect(_.where(output.text, {title : "Publisher Article"})[0]["link"]).to.not.contain(value);
          });

          expect(_.where(output.text, {title : "Publisher Article"})[0]["openUrl"]).to.eql(true);

          stub_meta_data[identifierList[i]] = undefined

        }

      });
    })
})