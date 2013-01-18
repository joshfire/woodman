/*global woodman*/

var config = {
  appenders: [
    {
      type: 'console',
      name: 'console',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd HH:mm:ss} [%p] %c - %m%n'
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

woodman.load(config, function (err) {
  if (err) throw err;

  var logger = woodman.getLogger('joshfire.woodman.examples.browser.browser-standalone');
  logger.log('Welcome to Woodman');
  logger.info('This is an info message');
  logger.warn('This is a warning');
  logger.error('This is an error');
});
