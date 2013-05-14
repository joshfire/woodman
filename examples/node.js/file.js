/**
 * @fileoverview Example of node.js script that references the standalone
 * distribution of the Woodman library.
 *
 * This method should only really be used for debugging purpose of the Woodman
 * library. Using a compiled version of Woodman is preferred.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global __dirname*/

var woodman = require(__dirname + '/../../dist/woodman');

var config = {
  appenders: [
    {
      type: 'FileAppender',
      name: 'file',
      fileName: 'log.txt',
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
        'file'
      ]
    }
  ]
};

// Initialize and start Woodman with the above config,
// and log a few messages to the file.
woodman.load(config, function (err) {
  if (err) throw err;

  var logger = woodman.getLogger('joshfire.woodman.examples.node.standalone');
  logger.log('Welcome to Woodman');
  logger.info('This is an info message');
  logger.warn('This is a warning');
  logger.error('This is an error');
});