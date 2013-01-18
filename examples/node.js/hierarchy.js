/**
 * @fileoverview Example of node.js script that uses the logger hierarchy in
 * Woodman to log different trace levels per "module".
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global __dirname*/

var woodman = require(__dirname + '/../../dist/woodman');

var config = {
  appenders: [
    {
      type: 'ConsoleAppender',
      name: 'console',
      layout: {
        type: 'pattern',
        pattern: '%h{[%c] %p - %m}'
      }
    }
  ],
  loggers: [
    {
      level: 'all',
      appenders: [
        'console'
      ]
    },
    {
      name: 'joshfire',
      level: 'error'
    },
    {
      name: 'joshfire.woodman',
      level: 'warn'
    },
    {
      name: 'joshfire.woodman.examples',
      level: 'info'
    },
    {
      name: 'joshfire.woodman.examples.node.hierarchy',
      level: 'log'
    }
  ]
};

// Initialize and start Woodman with the above config,
// and log a few messages to the console.
woodman.load(config, function (err) {
  if (err) throw err;

  var rootLogger = woodman.getLogger();
  rootLogger.log('Welcome to Woodman');
  rootLogger.log('root logger configured to log everything');

  var logger = woodman.getLogger('joshfire');
  logger.log('This logger does not log events at the log level');
  logger.info('This logger does not log events at the info level');
  logger.warn('This logger does not log warnings');
  logger.error('This logger only logs errors');

  logger = woodman.getLogger('joshfire.woodman');
  logger.log('This logger does not log events at the log level');
  logger.info('This logger does not log events at the info level');
  logger.warn('This logger logs warnings');
  logger.error('This logger logs errors as well');

  logger = woodman.getLogger('joshfire.woodman.examples');
  logger.log('This logger does not log events at the log level');
  logger.info('This logger logs events at the info level');
  logger.warn('This logger logs warnings');
  logger.error('This logger logs errors as well');

  logger = woodman.getLogger('joshfire.woodman.examples.node');
  logger.log('This logger does not log events at the log level');
  logger.info('This logger logs events at the info level');
  logger.warn('This logger logs warnings');
  logger.error('This logger logs errors as well');

  logger = woodman.getLogger('joshfire.woodman.examples.hierarchy');
  logger.log('This logger logs events at the log level');
  logger.info('This logger logs events at the info level');
  logger.warn('This logger logs warnings');
  logger.error('This logger logs errors as well');
});