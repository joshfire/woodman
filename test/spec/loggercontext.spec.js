/**
 * @fileoverview Tests for the LoggerContext class
 */
/*global describe, it, expect*/

define([
  '../../lib/loggercontext'
], function (LoggerContext) {

  describe('LoggerContext class', function () {

    it('returns the root logger by default', function () {
      var log = new LoggerContext();
      var logger = log.getLogger();
      expect(logger).toBeDefined();
      expect(logger).not.toBeNull();
      expect(logger.parent).toBeNull();
    });


    it('returns a Logger instance when getLogger is called', function () {
      var log = new LoggerContext();
      var logger = log.getLogger('logger');
      expect(logger).not.toBeUndefined();
      expect(logger).not.toBeNull();
    });


    it('returns the same Logger instance for a given name', function () {
      var log = new LoggerContext();
      var logger = log.getLogger('logger');
      var sameLogger = log.getLogger('logger');
      expect(logger).toBe(sameLogger);
    });


    it('returns different Logger instance for different names', function () {
      var log = new LoggerContext();
      var logger = log.getLogger('logger');
      var differentLogger = log.getLogger('different');
      expect(logger).not.toBe(differentLogger);
    });


    it('creates the appropriate logger hierarchy (parent)', function () {
      var log = new LoggerContext();
      var logger = log.getLogger('spec.loggercontext.hierarchy');
      var parentLogger = log.getLogger('spec.loggercontext');
      var greatParentLogger = log.getLogger('spec');
      var rootLogger = log.getLogger();

      expect(parentLogger).toBeParentOf(logger);
      expect(greatParentLogger).toBeParentOf(logger.parent);
      expect(rootLogger).toBeParentOf(logger.parent.parent);
    });


    it('creates the appropriate logger hierarchy (children)', function () {
      var log = new LoggerContext();
      var logger = log.getLogger('spec.loggercontext.hierarchy');
      var parentLogger = log.getLogger('spec.loggercontext');
      var greatParentLogger = log.getLogger('spec');
      var rootLogger = log.getLogger();

      expect(greatParentLogger).toBeChildOf(rootLogger);
      expect(parentLogger).toBeChildOf(greatParentLogger);
      expect(logger).toBeChildOf(parentLogger);
    });

  });
});