/**
 * @fileOverview Command-line interface for Woodman's precompiler
 */
/*global process, console*/
var fs = require('fs');
var fsExt = require('node-fs');
var precompile = require('./precompile');
var _ = require('underscore');
var woodman = require('../dist/woodman');


/**
 * Prints program usage
 *
 * @function
 */
var usage = function () {
  console.log('');
  console.log('  Usage: node precompiler.js [options] <input> [output]');
  console.log('');
  console.log('  Description:');
  console.log('    Removes calls to Woodman from a JavaScript file or folder.');
  console.log('');
  console.log('  Parameters:');
  console.log('    input   Full path to the JS file or folder to update.');
  console.log('    output  Full path to the JS file or folder to create.');
  console.log('            Precompiler outputs the result to the console otherwise.');
  console.log('');
  console.log('  Options:');
  console.log('    -h, --help          Outputs usage information.');
  console.log('    -k, --keep <levels> Keeps the specified trace levels in the updated file(s).');
  console.log('                        Comma-separated values.');
  console.log('                        Possible values: "log", "info", "warn", "error". ');
  console.log('                        Defaults to an empty list.');
  console.log('    -v, --verbose       Trace precompiler execution.');
  console.log('');
};


/**
 * Recurses within the folder given as parameter and returns an array that
 * contains all the JavaScript files contained in the folder.
 *
 * @function
 * @param {string} dir a path for e.g. './myFolder/myApp'
 * @param {function} callback Called when folders have been parsed. Optional.
 */
var walk = function (dir, callback) {
  callback = callback || function () {};

  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) {
      return callback(err);
    }

    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) {
        return callback(null, results);
      }
      file = dir + '/' + file;
      fs.stat(file, function (err, stat) {
        if (err) {
          return callback(err);
        }
        if (stat && stat.isDirectory()) {
          walk(file, function (err, res) {
            if (err) {
              return callback(err);
            }
            results = results.concat(res);
            next();
          });
        }
        else {
          if ((file.indexOf('.js') !== -1) &&
              (file.indexOf('.json') === -1)) {
            results.push(file);
          }
          next();
        }
      });
    })();
  });
};



/**
 * Main loop
 */
// Note: argv[0] === 'node', argv[1] === 'precompiler.js'
var logger = woodman.getLogger('main');
var args = process.argv.slice(2);
var arg = null;
var inputFolder = '';
var outputFolder = '';
var levels = '';
var verbose = false;
var woodmanConfig = null;


var nbArgs = args.length;
for (var i = 0; i < nbArgs; i++) {
  arg = args[i];
  switch (arg) {
  case '-k':
  case '--keep':
    i += 1;
    if (i >= nbArgs) {
      logger.error('Missing value for "--keep" options.\n');
      usage();
      process.exit(1);
    }
    else {
      arg = args[i];
      levels = arg.split(',');
    }
    break;

  case '-h':
  case '--help':
    usage();
    process.exit(0);
    break;

  case '-v':
  case '--verbose':
    verbose = true;
    break;

  default:
    if (!inputFolder) {
      inputFolder = arg;
    }
    else if (!outputFolder) {
      outputFolder = arg;
    }
    else {
      logger.error('Too many parameters provided.\n');
      usage();
      process.exit(1);
    }
    break;
  }
}

if (verbose) {
  woodmanConfig = {
    loggers: [
      {
        level: 'log',
        appenders: [
          {
            type: 'Console',
            name: 'console',
            layout: {
              type: 'PatternLayout',
              pattern: '%4r %m%n'
            }
          }
        ]
      }
    ]
  };
}
else {
  woodmanConfig = {
    loggers: [
      {
        level: 'info',
        appenders: [
          {
            type: 'Console',
            name: 'console',
            layout: {
              type: 'PatternLayout',
              pattern: '%m%n'
            }
          }
        ]
      },
      {
        name: 'precompile',
        level: 'error'
      }
    ]
  };
}
woodman.load(woodmanConfig);

if (!inputFolder) {
  console.error('Input file or folder must be provided.\n');
  usage();
  return process.exit(1);
}

var precompilerOptions = {
  keepLevel: levels || []
};

var input = '';
var output = '';

fs.stat(inputFolder, function (err, stat) {
  var startTime = null;

  if (err) {
    console.error('Input file or folder does not exist.\n');
    return process.exit(1);
  }

  if (stat && stat.isDirectory()) {
    // If input is a folder, convert all JavaScript files it contains
    walk(inputFolder, function (err, files) {
      if (err) {
        console.error('Could not parse the provided input folder');
        console.error('Make sure the folder exists and try again');
        console.error('Error: ' + err);
        return process.exit(2);
      }

      var dirPath = null;
      _.each(files, function (inputFileName) {
        if (!inputFileName.match(/\.js$/i)) {
          return;
        }

        input = fs.readFileSync(inputFileName, 'utf8');
        if (!input) {
          return;
        }

        var startTime = Date.now();
        logger.log('precompile ' + inputFileName + '...');
        output = precompile(input, precompilerOptions);

        var outputFileName = inputFileName.replace(inputFolder, outputFolder);
        if (outputFolder) {
          // Create the appropriate output folder hierarchy
          dirPath = outputFileName.split('/');
          dirPath.pop();
          dirPath = dirPath.join('/');
          fsExt.mkdirSync(dirPath, '0777', true);
          fs.writeFileSync(outputFileName, output, 'utf8');
          logger.info('precompile ' + inputFileName + ' => ' + outputFileName +
            ' (took ' + (Date.now() - startTime) + 'ms)');
        }
        else {
          logger.info('precompile ' + inputFileName + ' => done' +
            ' (took ' + (Date.now() - startTime) + 'ms)');
          console.log(output);
        }
      });
    });
  }
  else {
    // Input is a JavaScript file, convert the file
    input = fs.readFileSync(inputFolder, 'utf8');
    if (!input) {
      console.error('File to precompile is empty.\n');
      return;
    }

    startTime = Date.now();
    logger.log('precompile ' + inputFolder + '...');
    output = precompile(input, precompilerOptions);

    if (outputFolder) {
      fs.writeFileSync(outputFolder, output, 'utf8');
      logger.info('precompile ' + inputFolder + ' => ' + outputFolder +
        ' (took ' + (Date.now() - startTime) + 'ms)');
    }
    else {
      logger.info('precompile ' + inputFolder + ' => done' +
        ' (took ' + (Date.now() - startTime) + 'ms)');
      console.log(output);
    }
  }
});