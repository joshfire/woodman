/**
 * @fileoverview Tests for the Logger class
 */
/*global describe, it, expect, spyOn*/

define([
  '../../lib/logger',
  '../../lib/loglevel'
], function (Logger, LogLevel) {

  describe('Logger class', function () {

    it('always calls "trace" when one of the log methods is called', function () {
      var logger = new Logger();
      spyOn(logger, 'trace');

      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.trace.callCount).toEqual(4);
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

      expect(logger.append.callCount).toEqual(4);
    });


    it('calls "append" correctly when enabled at the "log" level', function () {
      var logger = new Logger();
      spyOn(logger, 'append');

      logger.level = LogLevel.log;
      
      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append.callCount).toEqual(4);
    });


    it('calls "append" correctly when enabled at the "info" level', function () {
      var logger = new Logger();
      spyOn(logger, 'append');

      logger.level = LogLevel.info;
      
      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append.callCount).toEqual(3);
    });


    it('calls "append" correctly when enabled at the "warn" level', function () {
      var logger = new Logger();
      spyOn(logger, 'append');

      logger.level = LogLevel.warn;
      
      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append.callCount).toEqual(2);
    });


    it('calls "append" correctly when enabled at the "error" level', function () {
      var logger = new Logger();
      spyOn(logger, 'append');

      logger.level = LogLevel.error;
      
      logger.log('timber!');
      logger.info('timber!');
      logger.warn('timber!');
      logger.error('timber!');

      expect(logger.append.callCount).toEqual(1);
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


    // TODO: add tests that check logger hierarchy
  });
});