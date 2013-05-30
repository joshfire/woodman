/*global console*/
require(['../../lib/woodman'], function (woodman) {
  woodman.load('console')
    .then(function () {
      return woodman.getLogger('joshfire.woodman.examples.browser.promise');
    })
    .then(function (logger) {
      logger.log('Welcome to Woodman');
      logger.info('This is an info message');
      logger.warn('This is a warning');
      logger.error('This is an error');
    })
    .then(null, function (err) {
      console.error('An error occurred', err);
    });
});