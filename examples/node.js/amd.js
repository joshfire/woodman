/**
 * @fileoverview Example of node.js script that references the standalone
 * distribution of the Woodman library, using require.js
 *
 * Woodman uses "amdefine" to ensure compatibility of AMD modules with node.js
 * modules, so require.js is not stricto senso necessary. See standalone.js for
 * an example that does not use require.js.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global __dirname*/

// Retrieve and configure require.js
var requirejs = require('requirejs');
requirejs.config({
  nodeRequire: require,
  baseUrl: __dirname + '/../../dist'
});

requirejs(['woodman'], function (woodman) {
  // Woodman example config (logs to the console)
  var config = {
    appenders: [
      {
        type: 'ConsoleAppender',
        name: 'console',
        layout: {
          type: 'pattern',
          pattern: '%d{yyy-MM-dd HH:mm:ss} [%p] %c - %m%n'
        }
      }
    ],
    loggers: [
      {
        level: 'all',
        appenders: [
          'console'
        ]
      }
    ]
  };

  // Initialize and start Woodman with the above config,
  // and log a few messages to the console.
  woodman.load(config, function (err) {
    if (err) throw err;

    var logger = woodman.getLogger('joshfire.woodman.examples.node.amd');
    logger.log('Welcome to Woodman');
    logger.info('This is an info message');
    logger.warn('This is a warning');
    logger.error('This is an error');
  });
});
