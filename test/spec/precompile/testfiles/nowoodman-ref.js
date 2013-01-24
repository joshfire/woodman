woodm.initialize(function (err) {
  var logger = woodm.getLogger();
  logger.log('test');
  logger.info('test');
  logger.warn('test');
  logger.error('test');
});