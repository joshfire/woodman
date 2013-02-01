requirejs(['woodman'], function (woodman) {
  var logger = woodman.getLogger('main');

  var config = {
    loggers: [
      {
        level: 'all',
        appenders: [
          {
            type: 'ConsoleAppender',
            layout: {
              type: 'PatternLayout',
              pattern: '%p %c - %m'
            }
          }
        ]
      }
    ]
  };

  woodman.load(config, function () {
    logger.log('Ready to start');
  });
});

define(['woodman'], function (woodman) {
  woodman.load({
    loggers: [
      {
        level: 'all',
        appenders: [
          {
            type: 'ConsoleAppender',
            layout: {
              type: 'PatternLayout',
              pattern: '%p %c - %m'
            }
          }
        ]
      }
    ]
  }, function () {
    var logger = woodman.getLogger();
    logger.log('test');
    var list = ['one', 'two', 'three'];
  });
});