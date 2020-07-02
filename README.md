[![Build Status](https://travis-ci.org/adsabs/bumblebee.svg?branch=master)](https://travis-ci.org/adsabs/bumblebee) [![Coverage Status](https://coveralls.io/repos/github/adsabs/bumblebee/badge.svg)](https://coveralls.io/github/adsabs/bumblebee)

## bumblebee

Official web application built for the [Astrophysics Data System](https://ui.adsabs.harvard.edu) and its API.

### Development

You will need to have Docker installed to run the development server. [Get Docker](https://docs.docker.com/get-docker/)

#### Installation

```bash
# fork and/or clone repo
$ git clone git@github.com:adsabs/bumblebee.git

# initialize submodule
$ git submodule update --init

# install assets
$ npm install -g grunt-cli
$ npm install
$ grunt setup

# start the server
$ ./server
```

You should then be able to access the application locally at `http://localhost:8000`.

#### Configuration

Create a `src/config/discovery.vars.js` file, based on `discovery.vars.js.default`.

#### Building

```bash
$ grunt release
# full build will be in dist/ directory
# point the dev server to there:
$ ./server dist
```

### Testing

**Note!** There is a separate server for testing, you'll need to first stop the dev server then start the testing server: `grunt server`.

During testing, you can add `debugger` statements and use mocha's `only` to isolate a test when running in debug mode.

```bash
# Run everything
$ grunt test

# Run with puppeteer window open
$ grunt test:debug
```

### Documentation

- [How to write a widget](https://github.com/adsabs/bumblebee/blob/master/docs/how-to-write-widget.md)
- [Architecture Overview](https://github.com/adsabs/bumblebee/blob/master/docs/architecture.md)
- [Explanation of the Search Cycle](https://github.com/adsabs/bumblebee/blob/master/docs/search-cycle.md)
