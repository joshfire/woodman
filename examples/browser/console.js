/*global woodman*/

woodman.load('console [%c] %m', function (err) {
  if (err) throw err;

  var logger = woodman.getLogger('browser.console');
  logger.log('Welcome to Woodman');
  logger.info('This is an info message');
  logger.warn('This is a warning');
  logger.error('This is an error');
});
