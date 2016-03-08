/**
 * WARNING: this is a DEVELOPMENT server; DO NOT USE it in production!
 *
 * If you need to make SOLR available, you can use:
 *  http://github.com/adsabs/adsws
 *  http://github.com/adsabs/solr-service
 *
 * @type {exports}
 */

require("amd-loader");

var routes = require('./src/assets/js/apps/discovery/routes');
var Backbone = require('backbone');

var _ = require('underscore');
var express = require('express');
var exphbs = require('express-handlebars');

var http = require('http');
var url = require('url');
var request = require('request');
var path = require('path');


var apikey = '2tMa7SNHQNSEKFjlsrUHlmkmp7nGKiKvw45R71DJ';
var queryEndpoint = 'http://api.adsabs.harvard.edu/v1/search/query';

var app = express();
// log requests
//app.use(express.logger('dev'));


app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', __dirname + '/src');


// this examples does not have any routes, however
// you may `app.use(app.router)` before or after these
// static() middleware. If placed before them your routes
// will be matched BEFORE file serving takes place. If placed
// then file serving is performed BEFORE any routes are hit:
app.use(app.router);
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
// log requests

// serve the static files & folders
home = process.env.HOMEDIR || 'src';

app.use('/assets', express.static(path.join(__dirname, home, "assets")));

// map test daependencies so that we can run tests too
app.use('/test', express.static(__dirname + '/test'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));



//import all routes from bbb
var router = new Backbone.Router();
delete routes['*invalidRoute'];
var route_regex  = _.pairs(routes).map(function(r){return router._routeToRegExp(r[0])});

//for some reason you need to exclude assets folder even though
//from what I understand it should be caught by the app.use('assets')
//above (??)
app.get(/^\/(?!assets).*/, function(req, res){

  console.log('non asset')

    var route = req.url.replace(/^\//, "");
    var matches = false;

    for (var i = 0; i < route_regex.length; i ++) {

      if (route_regex[i].test(route)){
        matches = true;
        break
      }
    }

    if (matches){

      console.log("route matched: " +  route_regex[i] + " serving index.html", req.url);
      res.render('index', {
        metadata: {},
        metadataHeaders: {}
      });

    }
    else {
      res.status(404).send('This page cannot be found');
    }

});



app.get(/^\/abs\/.*/, function (req, res) {

  var bib;

  try {
    bib = req.url.match(/\/abs\/([^\/]+)(\/\w*)?/)[1];
  }
  catch (e) {
    res.status(500).send('unable to parse document identifier from url');
    return
  }

  request({
        uri: queryEndpoint,
        headers: {
          'Authorization': 'Bearer:2tMa7SNHQNSEKFjlsrUHlmkmp7nGKiKvw45R71DJ'
        },
        qs: {
          //search for bibcode or alternate_bibcode (if old arxiv bibcode)
          q: 'bibcode:' + bib + ' OR alternate_bibcode:' + bib,
          fl: 'title,abstract,bibcode,author,keyword,id,citation_count,[citations],pub,aff,volume,pubdate,doi,pub_raw'
        }
      },
      function (error, response, body) {

        var numFound, doc;

        if (error) {
          res.status(500).send('unable to contact solr');
          return
        }

        try {
          body = JSON.parse(body);
        }
        catch (e) {
          res.status(500).send('unable to parse solr response: ' + body);
          return
        }

        numFound = body.response.numFound;

        if (!numFound) {
          res.status(404).send('ADS does not (yet) have a record of this bibcode.');
          return
        }

        doc = body.response.docs[0];

        if (bib !== doc.bibcode) {
          res.redirect(301, '/abs/' + doc.bibcode +'/');
          return
        }

        var metadata =  {
          title: doc.title && doc.title.length > 0 ? doc.title[0] : undefined,
          author: doc.author ? doc.author : undefined,
          abstract: doc.abstract ? doc.abstract : undefined,
          "publication date": doc.pubdate ? doc.pubdate : undefined,
          "journal title": doc.journal_title ? doc.journal_title : undefined,
          volume: doc.volume ? doc.volume : undefined,
          issue: doc.issue ? doc.issue : undefined,
          doi: doc.doi ? doc.doi.doi : undefined
        };

        var metadataHeaders = _.clone(metadata);
        //replace spaces with underscores
        for (var k in metadataHeaders){
          if ( (/\s+/).test(k) ) {
            metadataHeaders[k.replace(/\s/g, "_")] = metadataHeaders[k];
            delete metadataHeaders[k]
          }
        }

        metadata = _.pick(metadata, function(v,k){ return v; });
        metadataHeaders = _.pick(metadataHeaders, function(v,k){ return v; });

        res.render('index', {
          metadata: metadata,
          metadataHeaders: metadataHeaders
        });

      });

});


port = process.env.PORT || 8000;
app.listen(port);

console.log('listening on port ' + port);