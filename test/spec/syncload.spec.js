/**
 * @fileoverview Tests for the synchronous loading mechanism
 */
/*global define, describe, it, expect, spyOn, beforeEach*/

define(function (require) {
  var LoggerContext = require('../../lib/loggercontext');
  var ConsoleAppender = require('../../lib/appenders/consoleappender');
  var PatternLayout = require('../../lib/layouts/patternlayout');

  describe('Synchronous load', function () {
    var log = null;
    var logger = null;
    var rootLogger = null;

    beforeEach(function () {
      log = new LoggerContext();
      log.registerAppender('Console', ConsoleAppender);
      log.registerLayout('pattern', PatternLayout);

      rootLogger = log.getLogger();
      spyOn(rootLogger, 'traceLogEvent');

      logger = log.getLogger('sync');
      spyOn(logger, 'traceLogEvent');
    });


    it('keeps events in memory and processes them afterwards', function () {
      logger.log('message');
      logger.info('message');
      logger.warn('message');
      logger.error('message');

      expect(logger.traceLogEvent).not.toHaveBeenCalled();

      log.load('console');
      expect(logger.traceLogEvent).toHaveBeenCalled();
      expect(logger.traceLogEvent.callCount).toEqual(4);
    });


    it('discards first events when too many events are received', function () {
      for (var i = 0; i < 1100; i++) {
        logger.log('message ' + i);
      }

      expect(logger.traceLogEvent).not.toHaveBeenCalled();
      expect(rootLogger.traceLogEvent).not.toHaveBeenCalled();

      log.load('console');

      // Note the code discards 10% of the events received each time it
      // exceeds the limit, so 100 messages are discarded.
      expect(logger.traceLogEvent).toHaveBeenCalled();
      expect(logger.traceLogEvent.callCount).toEqual(1000);

      // A warning should have been sent to the root logger
      // about discarded pending events
      expect(rootLogger.traceLogEvent).toHaveBeenCalled();
      expect(rootLogger.traceLogEvent.callCount).toEqual(1);
    });


    it('applies the maxPendingEvents setting', function () {
      log.initialize({
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

      for (var i = 0; i < 1000; i++) {
        logger.log('message ' + i);
      }

      expect(logger.traceLogEvent).not.toHaveBeenCalled();
      expect(rootLogger.traceLogEvent).not.toHaveBeenCalled();

      log.start();
      expect(logger.traceLogEvent).toHaveBeenCalled();
      expect(logger.traceLogEvent.callCount).toEqual(20);

      // A warning should have been sent to the root logger
      // about discarded pending events
      expect(rootLogger.traceLogEvent).toHaveBeenCalled();
      expect(rootLogger.traceLogEvent.callCount).toEqual(1);
    });
  });
});