/**
 * @fileoverview Example of node.js script that references the node.js
 * distribution of the Woodman library.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global __dirname*/

var woodman = require(__dirname + '/../../dist/woodman-node');

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

  var logger = woodman.getLogger('joshfire.woodman.examples.node.node-amd');
  logger.log('Welcome to Woodman');
  logger.info('This is an info message');
  logger.warn('This is a warning');
  logger.error('This is an error');
});