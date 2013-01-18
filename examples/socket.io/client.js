/*global woodman*/
// require(['../../lib/woodman'], function (woodman) {

  var config = {
    appenders: [
      {
        type: 'ConsoleAppender',
        name: 'console',
        layout: {
          type: 'JSONLayout',
          pattern: '%d{yyyy-MM-dd HH:mm:ss} [%p] %c - %m%n'
        }
      },
      {
        type: 'SocketAppender',
        name: 'socket',
        url: 'http://localhost:40031',
        layout: {
          type: 'pattern',
          pattern: '%d{yyyy-MM-dd HH:mm:ss} [%h{%p}] %c - %m%n'
        },
        appendStrings: true
      }
    ],
    loggers: [
      {
        level: 'all',
        appenders: [
          'console',
          'socket'
        ]
      }
    ]
  };

  woodman.load(config, function (err) {
    if (err) throw err;

    var logger = woodman.getLogger('joshfire.woodman.examples.socket');
    logger.log('Welcome to Woodman');
    logger.info('This is an info message');
    logger.warn('This is a warning');
    logger.error('This is an error');
  });
// });
