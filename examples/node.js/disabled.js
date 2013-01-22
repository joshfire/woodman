/**
 * @fileoverview Example of node.js script that references the disabled
 * distribution of the Woodman library.
 *
 * Woodman uses "amdefine" to ensure compatibility of AMD modules with node.js
 * modules, so require.js is not needed in particular.
 *
 * The disabled version of the Woodman library is a no-op implementation of
 * Woodman intended for use in production environments when the author of the
 * app wants to disable all log traces. It is very lightweight (1Kb).
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global __dirname*/

var woodman = require(__dirname + '/../../dist/woodman-disabled');

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

  var logger = woodman.getLogger('joshfire.woodman.examples.node.standalone');
  logger.log('Welcome to Woodman');
  logger.info('This is an info message');
  logger.warn('This is a warning');
  logger.error('This is an error');
});