const path = require('node:path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const dotenv = require('dotenv');
const DotenvPlugin = require('dotenv-webpack');
const { WebpackAssetsManifest } = require('webpack-assets-manifest');
const CopyPlugin = require('copy-webpack-plugin');

dotenv.config();
const OUTPUT_DIR = path.resolve(__dirname, 'dist');
const isDev = process.env.NODE_ENV !== 'production';
const ASSETS_PATH = process.env.LOCAL_BUILD ? '/' : 'https://ads-assets.pages.dev/';

module.exports = {
  mode: isDev ? 'development' : 'production',
  devServer: {
    proxy: [
      {
        context: ['/v1'],
        target: process.env.API_TARGET,
        changeOrigin: true,
        secure: false,
      },
    ],
    static: {
      directory: OUTPUT_DIR,
      publicPath: '/',
    },
    compress: true,
    port: 8000,
    hot: true,
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [{ from: /^\/.*$/, to: '/index.html' }],
    },
    client: {
      overlay: false,
      progress: true,
    },
  },
  resolve: {
    extensions: ['.ts', '.js', '.jsx', '.tsx'],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      assert: require.resolve('assert/'),
      util: require.resolve('util/'),
      process: require.resolve('process/browser.js'),
    },
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    alias: {
      analytics: path.resolve('src/js/components/analytics'),
      utils: path.resolve(__dirname, 'src/js/utils'),
      reactify: path.resolve(__dirname, 'src/js/plugins/reactify'),
      es6: path.resolve(__dirname, 'src/js/plugins/es6'),
      pubsub_service_impl: path.resolve(__dirname, 'src/js/services/default_pubsub'),
      router: path.resolve(__dirname, 'src/js/apps/discovery/router'),

      // libraries
      backbone: path.resolve(__dirname, 'node_modules/backbone'),

      // Patch all broken nested dependency paths
      'backbone.babysitter/node_modules/backbone': path.resolve(__dirname, 'node_modules/backbone'),
      'backbone.marionette/node_modules/backbone': path.resolve(__dirname, 'node_modules/backbone'),
      'backbone.wreqr/node_modules/backbone': path.resolve(__dirname, 'node_modules/backbone'),

      // Other relevant aliases
      'backbone.marionette': path.resolve(__dirname, 'node_modules/backbone.marionette'),
      'backbone.babysitter': path.resolve(__dirname, 'node_modules/backbone.babysitter'),
      'backbone.wreqr': path.resolve(__dirname, 'node_modules/backbone.wreqr'),
      marionette: 'backbone.marionette',
      cache: path.resolve(__dirname, 'src/libs/cache'),
      yup: path.resolve(__dirname, 'src/libs/yup'),
      polyfill: path.resolve(__dirname, 'src/libs/polyfill'),
      hbs: path.resolve(__dirname, 'src/libs/requirejs-plugins/hbs'),
      async: path.resolve(__dirname, 'src/libs/requirejs-plugins/async'),
    },
    symlinks: false,
  },
  resolveLoader: {
    alias: {
      backbone: path.resolve(__dirname, 'node_modules/backbone'),
      'backbone.babysitter/node_modules/backbone': path.resolve(__dirname, 'node_modules/backbone'),
      'backbone.marionette/node_modules/backbone': path.resolve(__dirname, 'node_modules/backbone'),
      'backbone.wreqr/node_modules/backbone': path.resolve(__dirname, 'node_modules/backbone'),
    },
    symlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
        options: {
          partialDirs: [path.join(__dirname, 'src')],
          helperDirs: [path.join(__dirname, 'src/js/helpers')],
          inlineRequires: '/assets/images/',
        },
      },
      {
        test: /\.(js|jsx|tsx|ts|jsx\.js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            targets: 'defaults',
            presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.s[a|c]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true,
            },
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/,
        type: 'asset/resource',
      },
    ],
  },
  entry: {
    app: path.resolve(__dirname, 'src/config/webpack-entry.js'),
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    path: OUTPUT_DIR,
    publicPath: isDev ? '/' : ASSETS_PATH,
    clean: true,
    assetModuleFilename: 'assets/[name][ext][query]',
    charset: true,
  },
  optimization: {
    runtimeChunk: false,
    chunkIds: 'named',
    moduleIds: 'named',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]|[\\/]src[\\/]libs[\\/]/,
          name: 'vendor',
          chunks: 'all',
          priority: 18,
          enforce: true,
        },
        core: {
          test: /[\\/]src[\\/]js[\\/](apps|bugutils|components|helpers|mixins|modules|page_managers|plugins|services|wraps)[\\/]/,
          name: 'core',
          chunks: 'all',
          priority: 9,
          enforce: true,
        },
        widgets: {
          test: /[\\/]src[\\/]js[\\/](widgets|react)[\\/]/,
          name: 'widgets',
          chunks: 'all',
          priority: 9,
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/backbone$/, path.resolve(__dirname, 'node_modules/backbone')),
    new DotenvPlugin({ safe: false }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: false,
    }),
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
      inject: 'body',
    }),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/404.html'), to: OUTPUT_DIR },
        { from: path.resolve(__dirname, 'src/500.html'), to: OUTPUT_DIR },
        { from: path.resolve(__dirname, 'src/assets/favicon'), to: path.resolve(OUTPUT_DIR, 'assets/favicon') },
        { from: path.resolve(__dirname, 'src/assets/images'), to: path.resolve(OUTPUT_DIR, 'assets/images') },
      ],
    }),
    new WebpackAssetsManifest({
      output: path.resolve(__dirname, 'dist/manifest.json'),
      publicPath: ASSETS_PATH,
      writeToDisk: true,
    }),
    // Add underscore as a global
    new webpack.ProvidePlugin({
      Backbone: 'backbone',
      Marionette: 'backbone.marionette',
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery',
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    new ForkTsCheckerWebpackPlugin(),
    isDev
      ? null
      : new webpack.SourceMapDevToolPlugin({
          filename: '[file].map[query]',
          exclude: ['vendor.js', 'vendor.css'],
        }),
  ],
  devtool: isDev ? 'eval-source-map' : false,
};
