/**
 * @fileoverview Example of node.js script that references the source code of
 * the Woodman library directly and shows how Woodman keeps messages received
 * while Woodman is loaded in memory as well as how it discards some of them
 * where it receives too many messages before it is loaded.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global __dirname*/

var woodman = require(__dirname + '/../../lib/woodman');
var logger = woodman.getLogger('joshfire.woodman.examples.node.pending');

woodman.initialize({
  properties: {
    maxPendingEvents: 20
  },
  loggers: [
    {
      level: 'all',
      appenders: [
        {
          type: 'Console',
          name: 'console',
          layout: {
            type: 'pattern',
            pattern: '%d{yyyy-MM-dd HH:mm:ss} [%level] %logger - %message%n'
          },
          appendStrings: true
        }
      ]
    }
  ]
});

for (var i = 1; i <= 2000; i++) {
  logger.log('message ' + i);
}

// Call to start happens after the above calls to "log".
// Woodman kept the last 20 messages into memory.
// Note that, for the maxPendingEvents setting to be taken into account right
// away, the call to "load" needs to be split into an initial call to
// "initialize" and later on a call to "start". Woodman keeps 1000 messages into
// memory by default otherwise.
woodman.start();