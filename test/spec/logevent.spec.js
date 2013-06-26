/**
 * @fileoverview Tests for the LogEvent class
 */
/*global define, describe, it, expect*/

define(function (require) {
  var LogEvent = require('../../lib/logevent');
  var Message = require('../../lib/message');

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
      var message = new Message('timber!');
      var msg = (new LogEvent('spec', 'log', message)).getMessage();
      expect(msg).toEqual(message);

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
      var message = new Message('timber!');
      var logEvent = new LogEvent('spec', 'info', message);
      expect(logEvent.getMillis()).toEqualOrBeGreatherThan(now.getTime());

      var otherLogEvent = new LogEvent('spec', 'warn', message);
      expect(otherLogEvent.getMillis()).toEqualOrBeGreatherThan(logEvent.getMillis());
    });
  });
});