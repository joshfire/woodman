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

var woodman = require(__dirname + '/../../lib/woodman');

var config = {
  appenders: [
    {
      type: 'RollingFileAppender',
      name: 'rollingfile',
      fileName: 'log.txt',
      layout: {
        type: 'pattern',
        pattern: '%d{yyy-MM-dd HH:mm:ss} [%p] %c - %m%n'
      },
      triggeringPolicy: {
        time: 1,
        size: 250
      }
    }
  ],
  loggers: [
    {
      level: 'all',
      appenders: [
        'rollingfile'
      ]
    }
  ]
};

// Initialize and start Woodman with the above config,
// and log a few messages to the file.
woodman.load(config, function (err) {
  if (err) throw err;

  var logger = woodman.getLogger('joshfire.woodman.examples.node.standalone.rollingfile');
  logger.log('Hello woodman');
  logger.log('writing in the first log');
  logger.log('but this will get too long...');
  logger.log('So here I am in the second log');
  logger.log('triggered by size limit, and now wait...');
  setTimeout(function() {
    logger.log('Another second, another log');
    logger.log('as specified by the time limit');
    logger.log('but another limit awaits...');
    logger.log('Again, size limit has been broken');
    logger.log('a new log has been created');
    logger.log('but still, time passes...');
    setTimeout(function() {
      logger.log('... and yet another second');
      logger.log('and yet another log');
      logger.log('but now is time to');
      logger.log('stop');
    }, 1500);
  }, 1500);
});