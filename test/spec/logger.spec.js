/**
 * @fileoverview Tests for the Logger class
 */
/*global describe, it, expect, spyOn*/

define([
  '../../lib/logger',
  '../../lib/loglevel',
  '../../lib/appender'
], function (Logger, LogLevel, Appender) {

  describe('Logger class', function () {

    it('saves the name passed during instantiation', function () {
      var logger = new Logger('woodman');
      expect(logger.name).toEqual('woodman');
    });


    it('always calls "trace" when one of the log methods is called', function () {
      var logger = new Logger();
      spyOn(logger, 'trace');

      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.trace).toHaveBeenCalledXTimes(4);
    });


    it('calls "trace" with the right trace level', function () {
      var logger = new Logger();
      spyOn(logger, 'trace');

      logger.log('timber!');
      expect(logger.trace.mostRecentCall.args[0]).toEqual(LogLevel.log);

      logger.info('timber!');
      expect(logger.trace.mostRecentCall.args[0]).toEqual(LogLevel.info);

      logger.warn('timber!');
      expect(logger.trace.mostRecentCall.args[0]).toEqual(LogLevel.warn);

      logger.error('timber!');
      expect(logger.trace.mostRecentCall.args[0]).toEqual(LogLevel.error);
    });


    it('always calls "append" when fully enabled', function () {
      var logger = new Logger();
      spyOn(logger, 'append');

      logger.level = LogLevel.all;

      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append).toHaveBeenCalledXTimes(4);
    });


    it('calls "append" correctly when enabled at the "log" level', function () {
      var logger = new Logger();
      spyOn(logger, 'append');

      logger.level = LogLevel.log;
      
      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append).toHaveBeenCalledXTimes(4);
    });


    it('calls "append" correctly when enabled at the "info" level', function () {
      var logger = new Logger();
      spyOn(logger, 'append');

      logger.level = LogLevel.info;
      
      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append).toHaveBeenCalledXTimes(3);
    });


    it('calls "append" correctly when enabled at the "warn" level', function () {
      var logger = new Logger();
      spyOn(logger, 'append');

      logger.level = LogLevel.warn;
      
      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append).toHaveBeenCalledXTimes(2);
    });


    it('calls "append" correctly when enabled at the "error" level', function () {
      var logger = new Logger();
      spyOn(logger, 'append');

      logger.level = LogLevel.error;
      
      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append).toHaveBeenCalledXTimes(1);
    });


    it('never calls "append" when disabled', function () {
      var logger = new Logger();
      spyOn(logger, 'append');

      logger.level = LogLevel.off;
      
      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append).not.toHaveBeenCalled();
    });


    it('calls the "append" function of its parent when additive', function () {
      var logger = new Logger();
      var parentLogger = new Logger();
      spyOn(parentLogger, 'append');

      logger.parent = parentLogger;

      logger.log('timber!');

      expect(parentLogger.append).toHaveBeenCalledXTimes(1);
    });


    it('does not call the "append" function of its parent if not additive', function () {
      var logger = new Logger();
      var parentLogger = new Logger();
      spyOn(parentLogger, 'append');

      logger.additive = false;
      logger.parent = parentLogger;

      logger.log('timber!');

      expect(parentLogger.append).not.toHaveBeenCalled();
    });


    it('calls the "append" method of all its appenders', function () {
      var logger = new Logger();
      var firstAppender = new Appender('first');
      var secondAppender = new Appender('second');
      var thirdAppender = new Appender('third');
      spyOn(firstAppender, 'append');
      spyOn(secondAppender, 'append');
      spyOn(thirdAppender, 'append');

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

  });
});