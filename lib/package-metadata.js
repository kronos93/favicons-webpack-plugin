const path = require('path');
class PackageMetadata {
  guessMetaData(compilerWorkingDirectory) {
    console.log('extract data');
    // var packageJson = path.resolve(compilerWorkingDirectory, 'package.json');
    // if (!fs.existsSync(packageJson)) {
    //   packageJson = path.resolve(compilerWorkingDirectory, '../package.json');
    //   if (!fs.existsSync(packageJson)) {
    //     return 'Webpack App';
    //   }
    // }
    // return JSON.parse(fs.readFileSync(packageJson)).name;
  }
}
module.exports = PackageMetadata;
