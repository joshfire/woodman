/**
 * @fileoverview Tests for the LogManager class
 */
/*global describe, it, expect, define, beforeEach*/

define(function (require) {
  var LogManager = require('../../lib/logmanager');
  var Appender = require('../../lib/appender');
  var Layout = require('../../lib/layout');

  describe('LogManager class', function () {

    beforeEach(function () {
      /**
       * Returns true when the Logger instance has the appropriate trace
       * function.
       */
      this.addMatchers({
        toHaveTraceFunction: function (level) {
          var not = this.isNot ? 'NOT ': '';

          this.message = function () {
            return 'Expected "' + level + '" ' + not +
              'to be a member function of the Logger';
          };

          return typeof this.actual[level] === 'function';
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
      });

      var logger = LogManager.getLogger();
      expect(logger.appenders[0]).toBeStarted();
    });


    it('registers log levels when registerLevel is called', function () {
      LogManager.registerAppender('Appender', Appender);
      LogManager.registerLayout('Layout', Layout);
      LogManager.registerLevel('mylevel');
      LogManager.registerLevel('myotherlevel', 'mylevel');
      LogManager.load();

      var logger = LogManager.getLogger();
      expect(logger).toHaveTraceFunction('mylevel');
      expect(logger).toHaveTraceFunction('myotherlevel');
      expect(logger).not.toHaveTraceFunction('warn');
      expect(logger).not.toHaveTraceFunction('error');
    });


    it('registers log levels when registerStandardLevels is called', function () {
      LogManager.registerAppender('Appender', Appender);
      LogManager.registerLayout('Layout', Layout);
      LogManager.registerStandardLevels();
      LogManager.load();

      var logger = LogManager.getLogger();
      expect(logger).toHaveTraceFunction('log');
      expect(logger).toHaveTraceFunction('info');
      expect(logger).toHaveTraceFunction('warn');
      expect(logger).toHaveTraceFunction('error');
      expect(logger).toHaveTraceFunction('mylevel');
      expect(logger).toHaveTraceFunction('myotherlevel');
    });
  });

});