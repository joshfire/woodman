/**
 * @fileoverview Tests for the Layout class
 */
/*global describe, it, expect*/

define([
  '../../lib/layout',
  '../../lib/logevent',
  '../../lib/message'
], function (Layout, LogEvent, Message) {

  describe('Layout class', function () {

    var layout = new Layout();


    it('returns the initial object when toLogEvent is called', function () {
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      expect(layout.toLogEvent(evt)).toBe(evt);
    });


    it('returns a simple string message when toMessageString is called', function () {
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var msg = layout.toMessageString(evt);
      var re = new RegExp('^[0-9]+ log spec timber!');
      expect(msg).toBeTruthy();
      expect(msg).toMatch(re);
    });

  });
});