/**
 * @fileoverview Tests for the LoggerContext class
 */
/*global describe, it, expect*/

define([
  '../../lib/loggercontext'
], function (LoggerContext) {

  describe('LoggerContext class', function () {

    var log = new LoggerContext();


    it('returns the root logger by default', function () {
      var logger = log.getLogger();
      expect(logger).toBeDefined();
      expect(logger).not.toBeNull();
      expect(logger.parent).toBeNull();
    });


    it('returns a Logger instance when getLogger is called', function () {
      var logger = log.getLogger('logger');
      expect(logger).not.toBeUndefined();
      expect(logger).not.toBeNull();
    });


    it('returns the same Logger instance for a given name', function () {
      var logger = log.getLogger('logger');
      var sameLogger = log.getLogger('logger');
      expect(logger).toBe(sameLogger);
    });


    it('returns different Logger instance for different names', function () {
      var logger = log.getLogger('logger');
      var differentLogger = log.getLogger('different');
      expect(logger).not.toBe(differentLogger);
    });


    it('creates the appropriate logger hierarchy', function () {
      var logger = log.getLogger('spec.loggercontext.hierarchy');
      var parentLogger = log.getLogger('spec.loggercontext');
      var greatParentLogger = log.getLogger('spec');
      var rootLogger = log.getLogger();

      expect(parentLogger).toBe(logger.parent);
      expect(greatParentLogger).toBe(logger.parent.parent);
      expect(rootLogger).toBe(logger.parent.parent.parent);
    });
  });
});