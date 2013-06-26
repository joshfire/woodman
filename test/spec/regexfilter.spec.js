/**
 * @fileoverview Tests for the RegexFilter class
 */
/*global define, describe, it, expect*/

define(function (require) {
  var RegexFilter = require('../../lib/filters/regexfilter');
  var LogEvent = require('../../lib/logevent');
  var Message = require('../../lib/message');

  describe('RegexFilter class', function () {
    it('stays neutral for an event that matches the regexp', function () {
      var filter = new RegexFilter({
        regex: '^timber'
      });
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('neutral');
    });


    it('denies an event that does not match the regexp', function () {
      var filter = new RegexFilter({
        regex: 'timber$'
      });
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('deny');
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
        mismatch: 'neutral'
      });
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('neutral');
    });


    it('applies regexp to formatted string', function () {
      var filter = new RegexFilter({
        regex: '^Hello toto$',
        match: 'accept'
      });
      var evt = new LogEvent('spec', 'log', new Message(['Hello {}', 'toto']));
      var decision = filter.filter(evt);
      expect(decision).toEqual('accept');
    });


    it('applies regexp to format string when "useRawMsg" is set', function () {
      var filter = new RegexFilter({
        regex: '^Hello \\{\\}$',
        useRawMsg: true,
        match: 'accept'
      });
      var evt = new LogEvent('spec', 'log', new Message(['Hello {}', 'toto']));
      var decision = filter.filter(evt);
      expect(decision).toEqual('accept');
    });
  });
});