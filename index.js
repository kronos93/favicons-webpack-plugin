'use strict';
var childCompiler = require('./lib/compiler.js');
var assert = require('assert');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

class WebAppFaviconsWebpackPlugin {
  constructor(options) {
    if (typeof options === 'string') {
      options = { logo: options };
    }
    //assert(value, message)
    //Tests if value is truthy,
    assert(typeof options === 'object', 'FaviconsWebpackPlugin options are required');
    assert(options.logo, 'An input file is required');

    this.options = {
      prefix: 'icons-[hash]/',
      emitStats: false,
      statsFilename: 'iconstats-[hash].json',
      persistentCache: true,
      inject: true,
      ...options
    };
    this.options.icons = {
      android: true,
      appleIcon: true,
      appleStartup: true,
      coast: true,
      favicons: true,
      firefox: true,
      windows: true,
      yandex: true,
      opengraph: false,
      twitter: false,
      ...this.options.config.icons
    };
  }

  apply(compiler) {
    var self = this;
    if (this.options.config.appName) {
      this.options.config.appName = guessAppName(compiler.context);
    }
    // Generate the favicons (webpack 4 compliant + back compat)
    var compilationResult;
    (compiler.hooks
      ? compiler.hooks.make.tapAsync.bind(compiler.hooks.make, 'FaviconsWebpackPluginMake')
      : compiler.plugin.bind(compiler, 'make'))((compilation, callback) => {
        childCompiler.compileTemplate(self.options, compiler.context, compilation)
          .then(function (result) {
            compilationResult = result;
            callback();
          })
          .catch(callback);
      });
    // Hook into the html-webpack-plugin processing
    // and add the html
    if (self.options.inject) {
      var addFaviconsToHtml = function (htmlPluginData, callback) {
        if (htmlPluginData.plugin.options.favicons !== false) {
          htmlPluginData.html = htmlPluginData.html.replace(/(<\/head>)/i, compilationResult.stats.html.join('') + '$&');
        }
        callback(null, htmlPluginData);
      };
      /**
       * Use: if webpack 4 is detected
       */
      if (compiler.hooks) {
        var tapped = 0;
        compiler.hooks.compilation.tap('FaviconsWebpackPlugin', function (cmpp) {
          compiler.hooks.compilation.tap('HtmlWebpackPluginHooks', function () {
            if (!tapped++ && cmpp.hooks.htmlWebpackPluginBeforeHtmlProcessing) {
              cmpp.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync('favicons-webpack-plugin', addFaviconsToHtml);
            }
          });
        });
        /**
         * Use: if webpack 3 is detected
         */
      }
      else {
        compiler.plugin('compilation', function (compilation) {
          compilation.plugin('html-webpack-plugin-before-html-processing', addFaviconsToHtml);
        });
      }
    }
    // Remove the stats from the output if they are not required (webpack 4 compliant + back compat)
    if (!self.options.emitStats) {
      (compiler.hooks
        ? compiler.hooks.emit.tapAsync.bind(compiler.hooks.emit, 'FaviconsWebpackPluginEmit')
        : compiler.plugin.bind(compiler, 'emit'))((compilation, callback) => {
          delete compilation.assets[compilationResult.outputName];
          callback();
        });
    }
  }
}


/**
 * Tries to guess the name from the package.json - guess - adivinar
 */
function guessAppName(compilerWorkingDirectory) {
  var packageJson = path.resolve(compilerWorkingDirectory, 'package.json');
  if (!fs.existsSync(packageJson)) {
    packageJson = path.resolve(compilerWorkingDirectory, '../package.json');
    if (!fs.existsSync(packageJson)) {
      return 'Webpack App';
    }
  }
  return JSON.parse(fs.readFileSync(packageJson)).name;
}

module.exports = WebAppFaviconsWebpackPlugin;
