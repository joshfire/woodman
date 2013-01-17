/**
 * @fileoverview Tests for the LogEvent class
 */
/*global describe, it, expect*/

define([
  '../../lib/logevent'
], function (LogEvent) {

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
      var evt = new LogEvent('spec', 'log');
      expect(evt).toHaveLevel('log');

      evt = new LogEvent('spec', 'info');
      expect(evt).toHaveLevel('info');

      evt = new LogEvent('spec', 'warn');
      expect(evt).toHaveLevel('warn');

      evt = new LogEvent('spec', 'error');
      expect(evt).toHaveLevel('error');
    });


    it('keeps track of messages', function () {
      var msg = (new LogEvent('spec', 'log', 'timber!')).getMessage();
      expect(msg).toEqual('timber!');

      msg = (new LogEvent('spec', 'log', [
        'timber!',
        'beware!'
      ])).getMessage();
      expect(msg).toEqual([
        'timber!',
        'beware!'
      ]);
    });


    it('maintains a logical timer', function () {
      var logEvent = new LogEvent('spec', 'info', 'timber!');
      expect(logEvent.getMillis()).toEqualOrBeGreatherThan(now.getTime());

      var otherLogEvent = new LogEvent('spec', 'warn', 'timber!');
      expect(otherLogEvent.getMillis()).toEqualOrBeGreatherThan(logEvent.getMillis());
    });
  });
});