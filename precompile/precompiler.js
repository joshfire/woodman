/*global process, console*/
var fs = require('fs');
var fsExt = require('node-fs');
var precompile = require('./precompile');

var args = process.argv;
var inputFolder = '';
var input = '';
var outputFolder = '';
var output = '';
var opts = {};
var indexArg = 0;

// INFO : args[0] == 'node', args[1] == 'precompiler.js'
var reg = new RegExp('-level.*', 'gi');
var level = -1;
var ind;
for (var i = 0, c = args.length; i < c; i++) {
  ind = args[i].search(reg);
  if (ind !== -1) {
    level = i;
    opts.keepLevel = args[i + 1].split(',');
  }
}
if (level !== -1) {
  indexArg = level + 2;
}
else {
  indexArg = 2;
}


if (args.length > indexArg) {
  inputFolder = args[indexArg];
}
if (!inputFolder) {
  console.error('You need to enter an input as first argument');
  return;
}
if (args.length > (indexArg + 1)) {
  outputFolder = args[indexArg + 1];
}
/**
 * Return an array of string containing all files in dir recursively
 * @param {String} dir a path for e.g. './myFolder/myApp'
 * @param done callback is optional.
 */
var walk = function (dir, done) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function (err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

var inputFileName;
var outputFileName;

fs.stat(inputFolder, function (err, stat) {
  if (stat) {
    // Case input is a directory
    if (stat.isDirectory()) {
      walk(inputFolder, function (err, result) {
        if (err) throw err;
        // console.log(result);
        for (var i = 0, c = result.length; i < c; i++) {
          inputFileName = result[ i ];
          if ((inputFileName.indexOf('.js') !== -1) &&
              (inputFileName.indexOf('.json') === -1)) {
            outputFileName = inputFileName.replace(inputFolder, outputFolder);

            console.log(inputFileName);
            input = fs.readFileSync(inputFileName, 'utf8');
            output = precompile(input, opts);

            if (outputFolder) {
              var dirPath = outputFileName.split('/');
              dirPath.pop();
              dirPath = dirPath.join('/');
              fsExt.mkdirSync(dirPath, 0777, true);
              fs.writeFileSync(outputFileName, 'utf8');
            }
            else {
              console.log(output);
            }
          }
        }
      });
    }
    // Case input is a file
    else {
      inputFileName = inputFolder;
      if ((inputFileName.indexOf('.js') !== -1) &&
          (inputFileName.indexOf('.json') === -1)) {
        input = fs.readFileSync(inputFileName, 'utf8');
        output = precompile(input, opts);
      }
      if (outputFolder) {
        fs.writeFileSync(outputFolder, 'utf8');
        console.log('done on ' + outputFolder);
      }
      else {
        console.log(output);
      }
    }
  }
});