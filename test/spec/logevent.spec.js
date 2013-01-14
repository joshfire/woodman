/**
 * @fileoverview Tests for the LogEvent class
 */
/*global describe, it, expect*/

define([
  '../../lib/logevent',
  '../../lib/loglevel'
], function (LogEvent, LogLevel) {

  describe('LogEvent class', function () {

    var now = new Date();


    it('keeps track of name of the logger', function () {
      var name = (new LogEvent('spec')).getLoggerName();
      expect(name).toEqual('spec');

      name = (new LogEvent('spec.logevent')).getLoggerName();
      expect(name).toEqual('spec.logevent');

      name = (new LogEvent('spec.logevent.logger')).getLoggerName();
      expect(name).toEqual('spec.logevent.logger');
    });


    it('keeps track of the trace level', function () {
      var level = (new LogEvent('spec', LogLevel.log)).getLevel();
      expect(level).toEqual(LogLevel.log);

      level = (new LogEvent('spec', LogLevel.info)).getLevel();
      expect(level).toEqual(LogLevel.info);

      level = (new LogEvent('spec', LogLevel.warn)).getLevel();
      expect(level).toEqual(LogLevel.warn);

      level = (new LogEvent('spec', LogLevel.error)).getLevel();
      expect(level).toEqual(LogLevel.error);
    });


    it('keeps track of messages', function () {
      var msg = (new LogEvent('spec', LogLevel.log, 'timber!')).getMessage();
      expect(msg).toEqual('timber!');

      msg = (new LogEvent('spec', LogLevel.log, [
        'timber!',
        'beware!'
      ])).getMessage();
      expect(msg).toEqual([
        'timber!',
        'beware!'
      ]);
    });


    it('maintains a logical timer', function () {
      var logEvent = new LogEvent('spec', LogLevel.info, 'timber!');
      expect(logEvent.getMillis()).toEqualOrBeGreatherThan(now.getTime());

      var otherLogEvent = new LogEvent('spec', LogLevel.warn, 'timber!');
      expect(otherLogEvent.getMillis()).toEqualOrBeGreatherThan(logEvent.getMillis());
    });
  });
});