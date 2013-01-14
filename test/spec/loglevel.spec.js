/**
 * @fileoverview Tests for the LogLevel class
 */
/*global describe, it, expect*/

define([
  '../../lib/loglevel'
], function (LogLevel) {

  describe('LogLevel enumeration', function () {

    it('defines an "all" level', function () {
      expect(LogLevel.all).toBeNumber();
    });

    it('defines a "log" level', function () {
      expect(LogLevel.log).toBeNumber();
      expect(LogLevel.log).toBeGreaterThan(LogLevel.all);
    });

    it('defines an "info" level', function () {
      expect(LogLevel.info).toBeNumber();
      expect(LogLevel.info).toBeGreaterThan(LogLevel.log);
    });

    it('defines a "warn" level', function () {
      expect(LogLevel.warn).toBeNumber();
      expect(LogLevel.warn).toBeGreaterThan(LogLevel.info);
    });

    it('defines an "error" level', function () {
      expect(LogLevel.error).toBeNumber();
      expect(LogLevel.error).toBeGreaterThan(LogLevel.warn);
    });

    it('defines an "off" level', function () {
      expect(LogLevel.off).toBeNumber();
      expect(LogLevel.off).toBeGreaterThan(LogLevel.error);
    });
  });
});