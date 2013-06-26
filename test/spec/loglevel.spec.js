/**
 * @fileoverview Tests for the LogLevel class
 */
/*global define, describe, it, expect, beforeEach*/

define(function (require) {
  var LogLevel = require('../../lib/loglevel');

  describe('LogLevel enumeration', function () {

    beforeEach(function () {
      /**
       * Returns true when actual level is below the expected trace level
       */
      this.addMatchers({
        toBeBelow: function (expected) {
          var not = this.isNot ? 'NOT ': '';

          this.message = function () {
            return 'Expected "' + this.actual + '" ' + not +
              'to be below "' + expected + '"';
          };

          return LogLevel.isBelow(this.actual, expected);
        }
      });
    });


    it('defines an "all" level', function () {
      expect('all').not.toBeBelow('off');
      expect('all').not.toBeBelow('error');
      expect('all').not.toBeBelow('warn');
      expect('all').not.toBeBelow('info');
      expect('all').not.toBeBelow('log');
      expect('all').not.toBeBelow('trace');
      expect('all').toBeBelow('all');
    });

    it('defines a "trace" level', function () {
      expect('trace').not.toBeBelow('off');
      expect('trace').not.toBeBelow('error');
      expect('trace').not.toBeBelow('warn');
      expect('trace').not.toBeBelow('info');
      expect('trace').not.toBeBelow('log');
      expect('trace').toBeBelow('trace');
      expect('trace').toBeBelow('all');
    });

    it('defines a "log" level', function () {
      expect('log').not.toBeBelow('off');
      expect('log').not.toBeBelow('error');
      expect('log').not.toBeBelow('warn');
      expect('log').not.toBeBelow('info');
      expect('log').toBeBelow('log');
      expect('log').toBeBelow('trace');
      expect('log').toBeBelow('all');
    });

    it('defines an "info" level', function () {
      expect('info').not.toBeBelow('off');
      expect('info').not.toBeBelow('error');
      expect('info').not.toBeBelow('warn');
      expect('info').toBeBelow('info');
      expect('info').toBeBelow('log');
      expect('info').toBeBelow('trace');
      expect('info').toBeBelow('all');
    });

    it('defines a "warn" level', function () {
      expect('warn').not.toBeBelow('off');
      expect('warn').not.toBeBelow('error');
      expect('warn').toBeBelow('warn');
      expect('warn').toBeBelow('info');
      expect('warn').toBeBelow('log');
      expect('warn').toBeBelow('trace');
      expect('warn').toBeBelow('all');
    });

    it('defines an "error" level', function () {
      expect('error').not.toBeBelow('off');
      expect('error').toBeBelow('error');
      expect('error').toBeBelow('warn');
      expect('error').toBeBelow('info');
      expect('error').toBeBelow('log');
      expect('error').toBeBelow('trace');
      expect('error').toBeBelow('all');
    });

    it('defines an "off" level', function () {
      expect('off').toBeBelow('off');
      expect('off').toBeBelow('error');
      expect('off').toBeBelow('warn');
      expect('off').toBeBelow('info');
      expect('off').toBeBelow('log');
      expect('off').toBeBelow('trace');
      expect('off').toBeBelow('all');
    });
  });
});