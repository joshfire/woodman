/**
 * @fileoverview Tests on logger configuration
 */
/*global define, describe, it, expect, spyOn*/

define(function (require) {
  var Appender = require('../../lib/appender');
  var Layout = require('../../lib/layout');
  var LoggerContext = require('../../lib/loggercontext');
  var RegexFilter = require('../../lib/filters/regexfilter');

  var baseConfig = {
    filters: [
      {
        type: 'RegexFilter',
        regex: 'timber',
        match: 'accept',
        mismatch: 'neutral'
      }
    ],
    appenders: [
      {
        type: 'Appender',
        name: 'basic',
        layout: {
          type: 'Layout'
        }
      },
      {
        type: 'Appender',
        name: 'console',
        layout: {
          type: 'Layout'
        }
      }
    ],
    loggers: [
      {
        root: true,
        appenders: [
          'basic',
          'console'
        ],
        level: 'info'
      }
    ]
  };


  describe('Filtering tests', function () {

    it('processes the event if context-wide filter is neutral', function () {
      var log = new LoggerContext();
      log.registerAppender('Appender', Appender);
      log.registerAppender('ConsoleAppender', Appender);
      log.registerFilter('RegexFilter', RegexFilter);
      log.registerLayout('Layout', Layout);
      log.registerStandardLevels();
      log.load(baseConfig);

      var rootLogger = log.getLogger();
      var appender = rootLogger.appenders[0];
      spyOn(appender, 'doAppend');
      rootLogger.info('hello');
      expect(appender.doAppend).toHaveBeenCalled();
    });


    it('applies a context-wide filter', function () {
      var log = new LoggerContext();
      log.registerAppender('Appender', Appender);
      log.registerAppender('ConsoleAppender', Appender);
      log.registerFilter('RegexFilter', RegexFilter);
      log.registerLayout('Layout', Layout);
      log.registerStandardLevels();

      var config = JSON.parse(JSON.stringify(baseConfig));
      config.filters[0].mismatch = 'deny';
      log.load(config);

      var rootLogger = log.getLogger();
      var appender = rootLogger.appenders[0];
      spyOn(appender, 'doAppend');
      rootLogger.info('hello');
      expect(appender.doAppend).not.toHaveBeenCalled();
    });


    it('skips level filtering if a context-wide filter accepted the event', function () {
      var log = new LoggerContext();
      log.registerAppender('Appender', Appender);
      log.registerAppender('ConsoleAppender', Appender);
      log.registerFilter('RegexFilter', RegexFilter);
      log.registerLayout('Layout', Layout);
      log.registerStandardLevels();

      var config = JSON.parse(JSON.stringify(baseConfig));
      log.load(config);

      var rootLogger = log.getLogger();
      var appender = rootLogger.appenders[0];
      spyOn(appender, 'doAppend');
      rootLogger.log('timber');
      expect(appender.doAppend).toHaveBeenCalled();
    });


    it('applies a logger filter', function () {
      var log = new LoggerContext();
      log.registerAppender('Appender', Appender);
      log.registerAppender('ConsoleAppender', Appender);
      log.registerFilter('RegexFilter', RegexFilter);
      log.registerLayout('Layout', Layout);
      log.registerStandardLevels();

      var config = JSON.parse(JSON.stringify(baseConfig));
      config.loggers[0].filters = [
        {
          type: 'RegexFilter',
          regex: 'timber',
          mismatch: 'deny'
        }
      ];
      log.load(config);

      var rootLogger = log.getLogger();
      var appender = rootLogger.appenders[0];
      spyOn(appender, 'doAppend');
      rootLogger.info('hello');
      expect(appender.doAppend).not.toHaveBeenCalled();
    });


    it('applies an appender filter', function () {
      var log = new LoggerContext();
      log.registerAppender('Appender', Appender);
      log.registerAppender('ConsoleAppender', Appender);
      log.registerFilter('RegexFilter', RegexFilter);
      log.registerLayout('Layout', Layout);
      log.registerStandardLevels();

      var config = JSON.parse(JSON.stringify(baseConfig));
      config.appenders[0].filters = [
        {
          type: 'RegexFilter',
          regex: 'timber',
          mismatch: 'deny'
        }
      ];
      log.load(config);

      var rootLogger = log.getLogger();
      var appender = rootLogger.appenders[0];
      spyOn(appender, 'doAppend');
      rootLogger.info('hello');
      expect(appender.doAppend).not.toHaveBeenCalled();
    });
  });
});