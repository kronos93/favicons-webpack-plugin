'use strict';
const loaderUtils = require('loader-utils');
const favicons = require('favicons');
const faviconPersitenceCache = require('./cache');

module.exports = function (content) {
  var self = this;

  this.cacheable && this.cacheable();
  if (!this.emitFile) throw new Error('emitFile is required from module system');
  if (!this.async) throw new Error('async is required');

  const callback = this.async();
  const query = loaderUtils.parseQuery(this.query);
  const pathPrefix = loaderUtils.interpolateName(this, query.outputFilePrefix, {
    context: query.context || this.rootContext || this.options.context,
    content: content,
    regExp: query.regExp
  });
  const fileHash = loaderUtils.interpolateName(this, '[hash]', {
    context: query.context || this.rootContext || this.options.context,
    content: content,
    regExp: query.regExp
  });
  const cacheFile = pathPrefix + '.cache';
  faviconPersitenceCache.loadIconsFromDiskCache(this, query, cacheFile, fileHash, (err, cachedResult) => {
    if (err) return callback(err);
    if (cachedResult) {
      return callback(null, 'module.exports = ' + JSON.stringify(cachedResult));
    }
    // Generate icons
    generateIcons(this, content, pathPrefix, query, (err, iconResult) => {
      if (err) return callback(err);
      faviconPersitenceCache.emitCacheInformationFile(this, query, cacheFile, fileHash, iconResult);
      callback(null, 'module.exports = ' + JSON.stringify(iconResult));
    });
  });
};

function getPublicPath(compilation) {
  let publicPath = compilation.outputOptions.publicPath || '';
  if (publicPath.length && publicPath.substr(-1) !== '/') {
    publicPath += '/';
  }
  return publicPath;
}

function generateIcons(loader, imageFileStream, pathPrefix, query, callback) {

  var publicPath = getPublicPath(loader._compilation);
  favicons(imageFileStream, {
    path: '',
    url: '',
    //path: query.path,
    appName: query.appName,
    appShortName: query.appShortName,
    appDescription: query.appDescription,
    developerName: query.developerName,
    developerURL: query.developerURL,
    dir: query.dir,
    lang: query.lang,
    background: query.background,
    theme_color: query.theme_color,
    display: query.display,
    appleStatusBarStyle: query.appleStatusBarStyle,
    orientation: query.orientation,
    start_url: query.start_url,
    scope: query.scope,
    version: query.version,
    logging: query.logging,
    icons: query.icons,
  }, function (err, result) {

    if (err) return callback(err);
    var html = result.html.filter(function (entry) {
      return entry;
    })
      .map(function (entry) {
        //Fix theme color
        entry = entry == `<meta name="theme-color" content="${query.background}">` ? `<meta name="theme-color" content="${query.theme_color}">` : entry;
        //Fix manifest result
        entry = entry == `<link rel="manifest" href="manifest.json">` ? entry.replace(/(manifest\.json)/g,'manifest.webmanifest') : entry;
        console.log(entry);
        return entry.replace(/(href=[""])/g, `$1${(publicPath + pathPrefix).replace(/(\.\/)/, '')}`);
      });
    var loaderResult = {
      outputFilePrefix: pathPrefix,
      html: html,
      files: []
    };

    result.images.forEach(function (image) {
      loaderResult.files.push(pathPrefix + image.name);
      loader.emitFile(pathPrefix + image.name, image.contents);
    });
    let webmanifest = {
      name: 'manifest.webmanifest',
      contents: '',
    };
    let manifestJson;
    let manifestWebApp;
    result.files.forEach(function (file) {

      file.contents = file.contents.replace(`"short_name": "${query.appName}"`, `"short_name": "${query.appShortName}"`);
      if (file.name == 'manifest.json') {
        manifestJson = JSON.parse(file.contents);
      } else if (file.name == 'manifest.webapp') {
        manifestWebApp = JSON.parse(file.contents);;
      }
      loaderResult.files.push(pathPrefix + file.name);
      loader.emitFile(pathPrefix + file.name, file.contents);
    });
    manifestJson.developer = manifestWebApp.developer;
    manifestJson.version = manifestWebApp.version;
    // Los logos de firefox tienen fondo, y se vene extraños mejor no ponerlos por ahora
    // for (let icon in manifestWebApp.icons) {
    //   manifestJson.icons.push(
    //     {
    //       src: manifestWebApp.icons[icon],
    //       type: (() => {
    //         let type = '';
    //         if (/\.png$/.test(manifestWebApp.icons[icon])) {
    //           type = 'image/png';
    //         }
    //         return type;
    //       })(),
    //       sizes: `${icon}x${icon}`
    //     }
    //   );
    // }
    webmanifest.contents = JSON.stringify(manifestJson);
    loaderResult.files.push(pathPrefix + webmanifest.name);
    loader.emitFile(pathPrefix + webmanifest.name, webmanifest.contents);
    callback(null, loaderResult);
  });
}

module.exports.raw = true;
