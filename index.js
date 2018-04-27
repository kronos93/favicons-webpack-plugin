'use strict';
const childCompiler = require('./lib/compiler.js');
const assert = require('assert');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const PackageMetadata = require('./lib/package-metadata');
class WebAppFaviconsWebpackPlugin {
  constructor(options) {
    this.compilationResult;
    this.packageMetadata = new PackageMetadata();
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
    // Default data
    if (!this.options.config.appName) {
      let appMinimumData = this.packageMetadata.guessMetaData(compiler.context);
      Object.assign(this.options.config,appMinimumData);
    }
    // Generate the favicons (webpack 4 compliant + back compat)
    (compiler.hooks
      ? compiler.hooks.make.tapAsync.bind(compiler.hooks.make, 'WebAppFaviconsWebpackMake')
      : compiler.plugin.bind(compiler, 'make'))((compilation, callback) => {
        childCompiler.compileTemplate(this.options, compiler.context, compilation)
          .then(result => {
            this.compilationResult = result;
            callback();
          })
          .catch(callback);
      });
    // Hook into the html-webpack-plugin processing
    // and add the html
    if (this.options.inject) {

      /**
       * Use: if webpack 4 is detected
       */
      if (compiler.hooks) {
        var tapped = 0;
        compiler.hooks.compilation.tap('WebAppFaviconsWebpackPlugin', (cmpp) => {
          compiler.hooks.compilation.tap('HtmlWebpackPluginHooks', () => {
            if (!tapped++ && cmpp.hooks.htmlWebpackPluginBeforeHtmlProcessing) {
              cmpp.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync('web-app-favicons-webpack-plugin', this.addFaviconsToHtml.bind(this));
            }
          });
        });

      }
      /**
       * Use: if webpack 3 is detected
       */
      else {
        compiler.plugin('compilation', (compilation) => {
          compilation.plugin('html-webpack-plugin-before-html-processing', this.addFaviconsToHtml.bind(this));
        });
      }
    }
    // Remove the stats from the output if they are not required (webpack 4 compliant + back compat)
    if (!this.options.emitStats) {
      (compiler.hooks
        ? compiler.hooks.emit.tapAsync.bind(compiler.hooks.emit, 'WebAppFaviconsWebpackPluginEmit')
        : compiler.plugin.bind(compiler, 'emit'))((compilation, callback) => {
          delete compilation.assets[this.compilationResult.outputName];
          callback();
        });
    }
  }

  addFaviconsToHtml(htmlPluginData, callback) {
    if (htmlPluginData.plugin.options.favicons !== false) {
      htmlPluginData.html = htmlPluginData.html.replace(/(<\/head>)/i, this.compilationResult.stats.html.join('') + '$&');
    }
    callback(null, htmlPluginData);
  };
}

module.exports = WebAppFaviconsWebpackPlugin;
