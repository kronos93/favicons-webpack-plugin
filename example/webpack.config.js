'use strict';
var FaviconsWebpackPlugin = require('..');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  context: __dirname,
  devtool: 'eval',
  entry: './src/entry.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new FaviconsWebpackPlugin({
      // Your source logo
      logo: './src/logo.png',
      // The prefix for all image files (might be a folder or a name)
      prefix: './',
      // Emit all stats of the generated icons
      emitStats: false,
      // The name of the json containing all favicon information
      statsFilename: 'iconstats-[hash].json',
      // Generate a cache file with control hashes and
      // don't rebuild the favicons until those hashes change
      persistentCache: true,
      // Inject the html into the html-webpack-plugin
      inject: true,
      //see https://github.com/haydenbleasel/favicons#usage)
      config: {
        path: '/',                      // Path for overriding default icons path. `string`
        appName: 'Demo PWA App',                  // Your application's name. `string`
        appShortName: 'Demo App',
        appDescription: 'A simple Demo App',           // Your application's description. `string`
        developerName: 'Samuel R.',            // Your (or your developer's) name. `string`
        developerURL: "https://gitlab.com/samuel93/",             // Your (or your developer's) URL. `string`
        dir: 'ltr',
        lang: 'es-MX',
        background: '#FFF',             // Background colour for flattened icons. `string`, in meta is theme_color :(
        theme_color: '#3F51B5',            // Theme color for browser chrome. `string`
        display: "standalone",          // Android display: "browser" or "standalone". `string`
        appleStatusBarStyle: 'black-translucent',
        orientation: "portrait-primary",        // Android orientation: "portrait" or "landscape". `string`
        start_url: "/?utm_source=homescreen",    // Android start application's URL. `string`
        scope: '.',
        version: "1.0.0",                 // Your application's version number. `number`
        logging: false,                 // Print logs to console? `boolean`
        icons: {
          // Platform Options:
          // - offset - offset in percentage
          // - shadow - drop shadow for Android icons, available online only
          // - background:
          //   * false - use default
          //   * true - force use default, e.g. set background for Android icons
          //   * color - set background for the specified icons
          //
          android: true,              // Create Android homescreen icon. `boolean` or `{ offset, background, shadow }`
          appleIcon: true,            // Create Apple touch icons. `boolean` or `{ offset, background }`
          appleStartup: true,         // Create Apple startup images. `boolean` or `{ offset, background }`
          coast: { offset: 25 },      // Create Opera Coast icon with offset 25%. `boolean` or `{ offset, background }`
          favicons: true,             // Create regular favicons. `boolean`
          firefox: true,              // Create Firefox OS icons. `boolean` or `{ offset, background }`
          windows: true,              // Create Windows 8 tile icons. `boolean` or `{ background }`
          yandex: true,               // Create Yandex browser icon. `boolean` or `{ background }`
          opengraph: true,
          twitter: true,
        }
      }
    }),
    new HtmlWebpackPlugin()
  ]
};
