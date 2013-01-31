define('woodman', [], function () {
  var toto = 'turlututu';
});

define(['woodman'], function (wood) {
  var logger = wood.getLogger('blah');
  logger.log('hello');
  logger.info('world');
  logger.warn('warning');
  logger.error('error');
});

define(['woodman'], function (woodman) {
  var wood = {};
  var logger = woodman.getLogger('logger');
  var fakelogger = wood.getLogger('logger');
});

define(['something', 'woodman'], function (something, woodman) {
  var realLogger = woodman.getLogger('blah');
  var logger = {};
  logger.log('hello');
  logger.info('world');
  realLogger.log('hello');
});

define(['woodman'], function (woodman) {
  var config = {};
  woodman.load(config, function () {
    var logger = woodman.getLogger();
    logger.log('test');
  });
});