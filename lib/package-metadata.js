const { resolve } = require('path');
const fs = require('fs');
class PackageMetadata {
  /**
   * Tries to guess the name from the package.json - guess - adivinar
   */
  guessMetaData(compilerWorkingDirectory) {
    let packageJson = resolve(compilerWorkingDirectory, './package.json');
    if (!fs.existsSync(packageJson)) {
      packageJson = resolve(compilerWorkingDirectory, '../package.json');
      if (!fs.existsSync(packageJson)) {
        return {
          appName: 'Webpack App',
          appShortName: 'Webpack App',
          appDescription: 'A simple Webpack App',
        };
      }
    }
    let appName = JSON.parse(fs.readFileSync(packageJson)).name.replace(/\-/g, ' ');
    return {
      appName: appName,
      appShortName: appName,
      appDescription: appName,
    };
  }
}
module.exports = PackageMetadata;
