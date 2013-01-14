/**
 * @fileoverview Tests for the LogManager class
 */
/*global describe, it, expect*/

define([
  '../../lib/logmanager'
], function (LogManager) {

  describe('LogManager class', function () {

    it('returns a Logger instance when getLogger is called', function () {
      var logger = LogManager.getLogger('logger');
      expect(logger).not.toBeUndefined();
      expect(logger).not.toBeNull();
    });


    it('returns the same Logger instance for a given name', function () {
      var logger = LogManager.getLogger('logger');
      var sameLogger = LogManager.getLogger('logger');
      expect(logger).toBe(sameLogger);
    });


    it('returns different Logger instance for different names', function () {
      var logger = LogManager.getLogger('logger');
      var differentLogger = LogManager.getLogger('different');
      expect(logger).not.toBe(differentLogger);
    });
  });

});