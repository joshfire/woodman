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


    it('returns an array when toMessageBits is called', function () {
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var bits = layout.toMessageBits(evt);
      var re = new RegExp('^[0-9]+');
      bits = bits || [];
      expect(bits[0]).toMatch(re);
      expect(bits[1]).toEqual('log');
      expect(bits[2]).toEqual('spec');
      expect(bits[3]).toEqual('timber!');
    });


    it('returns an array with formatted message when toMessageBits is called', function () {
      var message = new Message(['Hello', { internet: 'of things' }, '!']);
      var evt = new LogEvent('spec', 'log', message);
      var bits = layout.toMessageBits(evt);
      var re = new RegExp('^[0-9]+');
      bits = bits || [];
      expect(bits[0]).toMatch(re);
      expect(bits[1]).toEqual('log');
      expect(bits[2]).toEqual('spec');
      expect(bits[3]).toEqual('Hello');
      expect(bits[4]).toEqual('{\n  "internet": "of things"\n}');
      expect(bits[5]).toEqual('!');
    });


    it('preserves objects when toMessageBits is called', function () {
      var message = new Message(['Hello', { internet: 'of things' }, '!']);
      var evt = new LogEvent('spec', 'log', message);
      var bits = layout.toMessageBits(evt, {
        preserveObjects: true
      });
      var re = new RegExp('^[0-9]+');
      bits = bits || [];
      expect(bits[0]).toMatch(re);
      expect(bits[1]).toEqual('log');
      expect(bits[2]).toEqual('spec');
      expect(bits[3]).toEqual('Hello');
      expect(bits[4]).toEqual({ internet: 'of things' });
      expect(bits[5]).toEqual('!');
    });

  });
});