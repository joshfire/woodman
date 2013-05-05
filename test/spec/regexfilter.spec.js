/**
 * @fileoverview Tests for the RegexFilter class
 */
/*global define, describe, it, expect*/

define([
  '../../lib/filters/regexfilter',
  '../../lib/logevent',
  '../../lib/message'
], function (RegexFilter, LogEvent, Message) {

  describe('RegexFilter class', function () {
    it('accepts an event that matches the regexp', function () {
      var filter = new RegexFilter({
        regex: '^timber'
      });
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('accept');
    });


    it('stays neutral for an event that does not match the regexp', function () {
      var filter = new RegexFilter({
        regex: 'timber$'
      });
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('neutral');
    });


    it('takes the "match" parameter into account', function () {
      var filter = new RegexFilter({
        regex: '^timber',
        match: 'deny'
      });
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('deny');
    });


    it('takes the "mismatch" parameter into account', function () {
      var filter = new RegexFilter({
        regex: 'timber$',
        mismatch: 'deny'
      });
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('deny');
    });


    it('applies regexp to formatted string', function () {
      var filter = new RegexFilter({
        regex: '^Hello toto$'
      });
      var evt = new LogEvent('spec', 'log', new Message(['Hello {}', 'toto']));
      var decision = filter.filter(evt);
      expect(decision).toEqual('accept');
    });


    it('applies regexp to format string when "useRawMsg" is set', function () {
      var filter = new RegexFilter({
        regex: '^Hello \\{\\}$',
        useRawMsg: true
      });
      var evt = new LogEvent('spec', 'log', new Message(['Hello {}', 'toto']));
      var decision = filter.filter(evt);
      expect(decision).toEqual('accept');
    });
  });
});