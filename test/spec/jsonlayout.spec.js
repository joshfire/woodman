/**
 * @fileoverview Tests for the JSONLayout class
 */
/*global define, describe, it, expect*/

define(function (require) {
  var JSONLayout = require('../../lib/layouts/jsonlayout');
  var LogEvent = require('../../lib/logevent');
  var LoggerContext = require('../../lib/loggercontext');
  var Message = require('../../lib/message');

  describe('JSONLayout class', function () {
    var loggerContext = new LoggerContext();

    it('returns the initial object when toLogEvent is called', function () {
      var layout = new JSONLayout(null, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toLogEvent(evt)).toBe(evt);
    });


    it('serializes the message as a string by default', function () {
      var layout = new JSONLayout(null, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      var str = layout.toMessageString(evt);
      expect(str).toEqual(JSON.stringify({
        time: evt.getMillis(),
        loggerName: 'loggername',
        level: 'warn',
        message: 'timber!'
      }, null, 2));
    });


    it('compacts the result if so requested', function () {
      var layout = new JSONLayout({
        compact: true
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      var str = layout.toMessageString(evt);
      expect(str).toEqual(JSON.stringify({
        time: evt.getMillis(),
        loggerName: 'loggername',
        level: 'warn',
        message: 'timber!'
      }));
    });


    it('serializes the message as an object if so requested', function () {
      var layout = new JSONLayout({
        messageAsObject: true,
        depth: 4
      }, loggerContext);
      var params = [
        'Hello {}',
        'world',
        {
          name: 'timber!',
          sub: {
            foo: 'bar',
            bar: 'baz'
          }
        }
      ];
      var message = new Message(params);
      var evt = new LogEvent('loggername', 'warn', message);
      var str = layout.toMessageString(evt);
      expect(str).toEqual(JSON.stringify({
        time: evt.getMillis(),
        loggerName: 'loggername',
        level: 'warn',
        message: message
      }, null, 2));
    });


    it('serializes the object to the requested depth', function () {
      var layout = new JSONLayout({
        messageAsObject: true,
        depth: 2
      }, loggerContext);
      var params = [
        'Hello {}',
        'world',
        {
          name: 'timber!',
          sub: {
            foo: 'bar',
            bar: 'baz'
          }
        }
      ];
      var message = new Message(params);
      var msgObj = {
        formatString: 'Hello {}',
        params: [
          'world',
          '…'
        ]
      };
      var evt = new LogEvent('loggername', 'warn', message);
      var str = layout.toMessageString(evt);
      expect(str).toEqual(JSON.stringify({
        time: evt.getMillis(),
        loggerName: 'loggername',
        level: 'warn',
        message: msgObj
      }, null, 2));
    });
  });
});