"use strict";

/**
 * WARNING: this is a DEVELOPMENT server; DO NOT USE it in production!
 *
 * If you need to make SOLR available, you can use:
 *  http://github.com/adsabs/adsws
 *  http://github.com/adsabs/solr-service
 *
 * @type {exports}
 */

const express = require('express');
const path = require('path');
const compression = require('compression');
const proxy = require('http-proxy-middleware');
const app = express();
const targets = {
  dev: 'https://devapi.adsabs.harvard.edu',
  prod: 'https://api.adsabs.harvard.edu',
  qa: 'https://api.adsabs.harvard.edu'
};

// default configuration
let config = {

  // root path for web (usually src/ or dist/)
  root: '/src',

  // api route, this will be proxied
  apiPath: '/v1',

  // proxy settings
  proxy: {
    target: targets[process.env.TARGET || 'dev'],
    changeOrigin: true
  }
};

if (process.env.SERVER_ENV === 'release') {
  config = Object.assign(config, { root: '/dist' });
}

// little helper to keep paths less verbose
const p = function (url, base) {
  return path.join(__dirname, base ? '' : config.root, url);
}

// serve the static assets
app.use(compression());
app.use('/js', express.static(p('js')));
app.use('/libs', express.static(p('libs')));
app.use('/styles', express.static(p('styles')));
app.use('/test', express.static(p('test', true)));
app.use('/node_modules', express.static(p('node_modules', true)));
app.use('/bower_components', express.static(p('bower_components', true)));

// proxy api calls to the api endpoint
app.use(config.apiPath, proxy(config.proxy));

app.get('*', function (req, res) {

  console.log(req.url);

  if (/discovery\.config\.js/.test(req.url)) {
    res.sendFile(p('discovery.config.js'));
  } else if (/discovery\.vars\.js/.test(req.url)) {
    res.sendFile(p('discovery.vars.js'));
  }
  res.sendFile(p('index.html'));
});

// start the server
app.listen(8000, () => {
  console.log('config: ', JSON.stringify(config));
  console.log('Listening on port 8000');
});
