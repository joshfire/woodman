/**
 * @fileoverview Tests for the LogManager class
 */
/*global describe, it, expect, beforeEach*/

define([
  '../../lib/logmanager',
  '../../lib/appender',
  '../../lib/layout'
], function (LogManager, Appender, Layout) {

  describe('LogManager class', function () {

    beforeEach(function () {
      /**
       * Returns true when actual level is below the expected trace level
       */
      this.addMatchers({
        toBeStarted: function () {
          var not = this.isNot ? 'NOT ': '';

          this.message = function () {
            return 'Expected object ' + not +
              'to be started';
          };

          return this.actual.isStarted();
        }
      });
    });

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

    it('initializes and starts the context when "load" is called', function () {
      LogManager.registerAppender('Appender', Appender);
      LogManager.registerLayout('Layout', Layout);

      // Note that the code below is not asynchronous,
      // so Jasmine code works fine in particular
      LogManager.load([
        {
          root: true,
          appenders: [
            {
              type: 'Appender',
              layout: {
                type: 'Layout'
              }
            }
          ]
        }
      ], function (err) {
        expect(err).toBeFalsy();
        var logger = LogManager.getLogger();
        expect(logger.appenders[0]).toBeStarted();
      });
    });
  });

});