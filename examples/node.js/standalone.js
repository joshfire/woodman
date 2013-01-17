/**
 * @fileoverview Example of node.js script that references the source code of
 * the Woodman library directly.
 *
 * Woodman uses "amdefine" to ensure compatibility of AMD modules with node.js
 * modules, so require.js is not needed in particular, although possible (see
 * source-amd.js for an example).
 *
 * This method should only really be used for debugging purpose of the Woodman
 * library. Using a compiled version of Woodman is preferred.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global __dirname*/

var woodman = require(__dirname + '/../../dist/woodman-node');

var config = {
  appenders: [
    {
      type: 'console',
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

  var logger = woodman.getLogger('browser.main');
  logger.log('Welcome to Woodman');
  logger.info('This is an info message');
  logger.warn('This is a warning');
  logger.error('This is an error');
});