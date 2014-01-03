/**
 * @fileoverview Tests for the RegexLoggerNameFilter class
 */
/*global define, describe, it, expect*/

define(function (require) {
  var RegexLoggerNameFilter = require('../../lib/filters/regexloggernamefilter');
  var LogEvent = require('../../lib/logevent');
  var Message = require('../../lib/message');

  describe('RegexLoggerNameFilter class', function () {
    it('stays neutral for an event that matches the regexp', function () {
      var filter = new RegexLoggerNameFilter({
        regex: '^spec'
      });
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('neutral');
    });


    it('denies an event that does not match the regexp', function () {
      var filter = new RegexLoggerNameFilter({
        regex: 'spe$'
      });
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('deny');
    });


    it('takes the "match" parameter into account', function () {
      var filter = new RegexLoggerNameFilter({
        regex: '^spec',
        match: 'deny'
      });
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('deny');
    });


    it('takes the "mismatch" parameter into account', function () {
      var filter = new RegexLoggerNameFilter({
        regex: 'spec$',
        mismatch: 'neutral'
      });
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('neutral');
    });

  });
});