/**
 * @fileoverview Tests for the Logger class
 */
/*global describe, it, expect, spyOn, define*/

define(function (require) {
  var Logger = require('../../lib/logger');
  var Appender = require('../../lib/appender');
  var LoggerContext = require('../../lib/loggercontext');

  describe('Logger class', function () {

    var loggerContext = new LoggerContext();
    loggerContext.registerStandardLevels();
    loggerContext.load();

    it('saves the name passed during instantiation', function () {
      var logger = new Logger('woodman', loggerContext);
      logger.level = 'all';
      expect(logger.name).toEqual('woodman');
    });


    it('resets internal settings when "reset" is called', function () {
      var logger = new Logger('woodman', loggerContext);
      logger.level = 'all';
      logger.additive = false;
      logger.appenders = [
        'blah'
      ];
      logger.reset();

      expect(logger).toHaveLevel('inherit');
      expect(logger.additive).toBeTruthy();
      expect(logger.appenders).toEqual([]);
    });


    it('sets internal level when "initialize" is called', function () {
      var logger = new Logger('woodman', loggerContext);
      logger.initialize({
        level: 'warn'
      });
      expect(logger).toHaveLevel('warn');
    });


    it('sets internal level to "inherit" by default', function () {
      var logger = new Logger('woodman', loggerContext);
      logger.initialize();
      expect(logger).toHaveLevel('inherit');
    });


    it('sets additivity at initialization', function () {
      var logger = new Logger('woodman', loggerContext);
      logger.initialize({
        level: 'error',
        additivity: false
      });
      expect(logger.additive).toBeFalsy();
    });


    it('keeps additivity at initialization if not provided', function () {
      var logger = new Logger('woodman', loggerContext);
      logger.initialize({
        level: 'error',
        appenders: [
          'blah'
        ]
      });
      expect(logger.additive).toBeTruthy();
    });


    it('sets the list of appenders when "initialize" is called', function () {
      var logger = new Logger('woodman', loggerContext);
      logger.initialize({
        appenders: [
          'blah',
          'foo'
        ]
      });
      expect(logger.appenders).toEqual([
        'blah',
        'foo'
      ]);
    });


    it('sets internal level to "inherit" by default', function () {
      var logger = new Logger('woodman', loggerContext);
      logger.reset();
      logger.initialize();
      expect(logger).toHaveLevel('inherit');
    });

    it('always calls "traceAtLevel" when one of the log methods is called', function () {
      var logger = new Logger(null, loggerContext);
      spyOn(logger, 'traceAtLevel');

      logger.level = 'all';

      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.traceAtLevel).toHaveBeenCalledXTimes(4);
    });


    it('calls "traceAtLevel" with the right trace level', function () {
      var logger = new Logger(null, loggerContext);
      spyOn(logger, 'traceAtLevel');

      logger.level = 'all';

      logger.log('timber!');
      expect(logger.traceAtLevel.mostRecentCall.args[0]).toEqual('log');

      logger.info('timber!');
      expect(logger.traceAtLevel.mostRecentCall.args[0]).toEqual('info');

      logger.warn('timber!');
      expect(logger.traceAtLevel.mostRecentCall.args[0]).toEqual('warn');

      logger.error('timber!');
      expect(logger.traceAtLevel.mostRecentCall.args[0]).toEqual('error');
    });


    it('always calls "append" when fully enabled', function () {
      var logger = new Logger(null, loggerContext);
      spyOn(logger, 'append');

      logger.level = 'all';

      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append).toHaveBeenCalledXTimes(4);
    });


    it('calls "append" correctly when enabled at the "log" level', function () {
      var logger = new Logger(null, loggerContext);
      spyOn(logger, 'append');

      logger.level = 'log';

      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append).toHaveBeenCalledXTimes(4);
    });


    it('calls "append" correctly when enabled at the "info" level', function () {
      var logger = new Logger(null, loggerContext);
      spyOn(logger, 'append');

      logger.level = 'info';

      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append).toHaveBeenCalledXTimes(3);
    });


    it('calls "append" correctly when enabled at the "warn" level', function () {
      var logger = new Logger(null, loggerContext);
      spyOn(logger, 'append');

      logger.level = 'warn';

      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append).toHaveBeenCalledXTimes(2);
    });


    it('calls "append" correctly when enabled at the "error" level', function () {
      var logger = new Logger(null, loggerContext);
      spyOn(logger, 'append');

      logger.level = 'error';

      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append).toHaveBeenCalledXTimes(1);
    });


    it('never calls "append" when disabled', function () {
      var logger = new Logger(null, loggerContext);
      spyOn(logger, 'append');

      logger.level = 'off';

      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append).not.toHaveBeenCalled();
    });


    it('calls the "append" function of its parent when additive', function () {
      var logger = new Logger(null, loggerContext);
      var parentLogger = new Logger(null, loggerContext);
      spyOn(parentLogger, 'append');

      logger.level = 'all';
      parentLogger.level = 'all';

      logger.parent = parentLogger;

      logger.log('timber!');

      expect(parentLogger.append).toHaveBeenCalledXTimes(1);
    });


    it('calls the "append" function of its parent even if parent is off', function () {
      var logger = new Logger(null, loggerContext);
      var parentLogger = new Logger(null, loggerContext);
      spyOn(parentLogger, 'append');

      logger.level = 'all';
      parentLogger.level = 'off';

      logger.parent = parentLogger;

      logger.log('timber!');

      expect(parentLogger.append).toHaveBeenCalledXTimes(1);
    });


    it('does not call the "append" function of its parent if not additive', function () {
      var logger = new Logger(null, loggerContext);
      var parentLogger = new Logger(null, loggerContext);
      spyOn(parentLogger, 'append');

      logger.level = 'all';
      parentLogger.level = 'all';

      logger.additive = false;
      logger.parent = parentLogger;

      logger.log('timber!');

      expect(parentLogger.append).not.toHaveBeenCalled();
    });


    it('calls the "append" method of all its appenders', function () {
      var logger = new Logger(null, loggerContext);
      var firstAppender = new Appender('first');
      var secondAppender = new Appender('second');
      var thirdAppender = new Appender('third');
      spyOn(firstAppender, 'append');
      spyOn(secondAppender, 'append');
      spyOn(thirdAppender, 'append');

      logger.level = 'all';
      logger.appenders = [
        firstAppender,
        secondAppender,
        thirdAppender
      ];

      logger.log('timber!');

      expect(firstAppender.append).toHaveBeenCalledXTimes(1);
      expect(secondAppender.append).toHaveBeenCalledXTimes(1);
      expect(thirdAppender.append).toHaveBeenCalledXTimes(1);
    });


    it('exposes functions named after the registered levels', function () {
      var logger = new Logger(null, loggerContext);
      var i = 0;
      var levels = loggerContext.logLevel.getLevels();
      for (i = 0; i < levels.length; i++) {
        expect(typeof logger[levels[i]]).toEqual('function');
      }
    });

  });
});