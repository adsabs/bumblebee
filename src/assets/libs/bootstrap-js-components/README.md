# bootstrap-js-components

The Bootstrap JavaScript components are great for non-Bootstrap projects. They do one thing well, are well written, and self-contained. However, you may not want to include the whole js build from Bootstrap just for one or two plugins, let alone the entire Bootstrap repo in your `bower_components`. Keeping individual files up to date manually and including minified version can be a chore.

bootstrap-js-components is a bower package that contains just the JavaScript components, in individual files, both in source form and minified with source maps. It provides every bootstrap version since `2.2.0`.

# Installation

Install via bower:

```sh
bower install bootstrap-js-components#<version>
```

**Note: always install a specific Boostrap version number, which will look like `v3.1.1` (note the `v` prefix).** This is generally good practice for dependency management anyway, and fits with the recommended practice of [checking in front-end dependencies](http://addyosmani.com/blog/checking-in-front-end-dependencies/).

Reference the relevant components:

```html
<script src="bower_components/boostrap-js-components/dist/dropdown.js"></script>
<script src="bower_components/boostrap-js-components/dist/modal.js"></script>
```

# Keeping up to date with Boostrap releases

This repository is mainly a set of tooling to allow it to easily update with Boostrap releases. If you notice there is a release missing, please [open an issue](https://github.com/roryf/bootstrap-js-components/issues/new) with the release version and I'll get to it as soon as I can.

# Building components

If you just want the files, you can also fork or clone the repository and build it manually:

```sh
git clone https://github.com/roryf/bootstrap-js-components.git
git submodule init
git submodule update
cd bootstrap
git checkout v<version>
cd ..
npm install
grunt
```

This will build the specified `<version>`, or replace this with `master` to buld the latest from the Bootstrap repo.

# Updating releases

If you want to fork the repo and keep it up to date yourself, use the `./bin/update` script to build any missing releases from the local repo and then `git push --tags` to push them to your fork. If the script fails for any reason, `./bin/reset` will reset the Bootstrap submodule to `master`.
