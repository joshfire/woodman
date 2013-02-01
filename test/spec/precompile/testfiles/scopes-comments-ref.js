// define('woodman', [], function () {
//   var toto = 'turlututu';
// });

define(['require'], function (wood) {
  // var logger = wood.getLogger('blah');
  // logger.log('hello');
  // logger.info('world');
  // logger.warn('warning');
  // logger.error('error');
});

define(['require'], function (woodman) {
  var wood = {};
  // var logger = woodman.getLogger('logger');
  var fakelogger = wood.getLogger('logger');
});

define(['something', 'require'], function (something, woodman) {
  // var realLogger = woodman.getLogger('blah');
  var logger = {};
  logger.log('hello');
  logger.info('world');
  // realLogger.log('hello');
});

define(['require'], function (woodman) {
  // var config = {};
  (function () {
    // var logger = woodman.getLogger();
    // logger.log('test');
  })();
});