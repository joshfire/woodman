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


    it('inherits trace levels appropriately', function () {
      var log = new LoggerContext();
      log.initialize([
        {
          root: true,
          level: 'warn'
        }
      ]);
      var rootLogger = log.getLogger();
      var logger = log.getLogger('spec.logger.hierarchy');
      expect(rootLogger).toHaveLevel('warn');
      expect(logger).toHaveLevel('warn');
    });


    it('initializes even in the absence of a configuration', function () {
      var log = new LoggerContext();
      log.initialize();
      expect(log.createdAppenders.length).toEqual(0);
    });


    it('initializes even if given an empty configuration', function () {
      var log = new LoggerContext();
      log.initialize({});
      expect(log.createdAppenders.length).toEqual(0);
    });


    // Note calls to "start" in the tests below run synchronously so regular
    // test functions can be used

    it('loads even in the absence of a configuration', function () {
      var log = new LoggerContext();
      log.load(null, function (err) {
        expect(err).toBeFalsy();
      });
      expect(log).toBeStarted();
    });


    it('loads even if given an empty configuration', function () {
      var log = new LoggerContext();
      log.load({}, function (err) {
        expect(err).toBeFalsy();
      });
      expect(log).toBeStarted();
    });


    it('loads even if config does not reference any appender', function () {
      var log = new LoggerContext();
      log.load({
        loggers: [
          {
            name: 'woodman',
            level: 'off'
          }
        ]
      }, function (err) {
        expect(err).toBeFalsy();
      });
      expect(log).toBeStarted();
    });
  });
});