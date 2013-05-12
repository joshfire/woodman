/**
 * @fileoverview Tests for the CompositeFilter class
 */
/*global define, describe, it, expect*/

define([
  '../../lib/filters/compositefilter',
  '../../lib/filters/regexfilter',
  '../../lib/logevent',
  '../../lib/message'
], function (CompositeFilter, RegexFilter, LogEvent, Message) {

  describe('CompositeFilter class', function () {
    it('returns the result of the first filter if it matches', function () {
      var filters = [
        new RegexFilter({
          regex: '^timber',
          match: 'accept'
        }),
        new RegexFilter({
          regex: 'timber$'
        })
      ];
      var filter = new CompositeFilter(filters);
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('accept');
    });


    it('returns the result of the second filter if it matches', function () {
      var filters = [
        new RegexFilter({
          regex: 'timber$',
          match: 'accept',
          mismatch: 'neutral'
        }),
        new RegexFilter({
          regex: '^timber',
          match: 'accept',
          mismatch: 'neutral'
        })
      ];
      var filter = new CompositeFilter(filters);
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('accept');
    });


    it('skips further filters if event is denied by a filter', function () {
      var filters = [
        new RegexFilter({
          regex: '^timber',
          match: 'deny'
        }),
        new RegexFilter({
          regex: 'timber'
        })
      ];
      var filter = new CompositeFilter(filters);
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('deny');
    });


    it('skips further filters if event is accepted by a filter', function () {
      var filters = [
        new RegexFilter({
          regex: '^timber',
          match: 'accept',
          mismatch: 'neutral'
        }),
        new RegexFilter({
          regex: 'timber$',
          mismatch: 'deny'
        })
      ];
      var filter = new CompositeFilter(filters);
      var evt = new LogEvent('spec', 'log', new Message('timber!'));
      var decision = filter.filter(evt);
      expect(decision).toEqual('accept');
    });
  });
});