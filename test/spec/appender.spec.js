/**
 * @fileoverview Tests for the Appender class
 */
/*global define, describe, it, expect, spyOn*/

define(function (require) {
  var Appender = require('../../lib/appender');
  var LogEvent = require('../../lib/logevent');
  var LogLevel = require('../../lib/loglevel');

  describe('Appender class', function () {
    var levels = new LogLevel();
    levels.registerStandardLevels();

    var isBelow = function (level, referenceLevel) {
      return levels.isBelow(level, referenceLevel);
    };

    it('keeps track of name of the appender', function () {
      var name = (new Appender({
        name: 'spec',
        isLogLevelBelow: isBelow
      })).getName();
      expect(name).toEqual('spec');

      name = (new Appender({
        name: 'spec.logevent',
        isLogLevelBelow: isBelow
      })).getName();
      expect(name).toEqual('spec.logevent');

      name = (new Appender({
        name: 'spec.logevent.logger',
        isLogLevelBelow: isBelow
      })).getName();
      expect(name).toEqual('spec.logevent.logger');
    });


    it('always calls doAppend when fully enabled', function () {
      var appender = new Appender({
        name: 'spec',
        level: 'all',
        isLogLevelBelow: isBelow
      });
      spyOn(appender, 'doAppend');
      appender.start();

      appender.append(new LogEvent('spec', 'error'));
      appender.append(new LogEvent('spec', 'warn'));
      appender.append(new LogEvent('spec', 'info'));
      appender.append(new LogEvent('spec', 'log'));

      expect(appender.doAppend).toHaveBeenCalledXTimes(4);
    });


    it('calls doAppend correctly when enabled at the "log" level', function () {
      var appender = new Appender({
        name: 'spec',
        level: 'log',
        isLogLevelBelow: isBelow
      });
      spyOn(appender, 'doAppend');
      appender.start();

      appender.append(new LogEvent('spec', 'error'));
      appender.append(new LogEvent('spec', 'warn'));
      appender.append(new LogEvent('spec', 'info'));
      appender.append(new LogEvent('spec', 'log'));

      expect(appender.doAppend).toHaveBeenCalledXTimes(4);
    });


    it('calls doAppend correctly when enabled at the "info" level', function () {
      var appender = new Appender({
        name: 'spec',
        level: 'info',
        isLogLevelBelow: isBelow
      });
      spyOn(appender, 'doAppend');
      appender.start();

      appender.append(new LogEvent('spec', 'error'));
      appender.append(new LogEvent('spec', 'warn'));
      appender.append(new LogEvent('spec', 'info'));
      appender.append(new LogEvent('spec', 'log'));

      expect(appender.doAppend).toHaveBeenCalledXTimes(3);
    });


    it('calls doAppend correctly when enabled at the "warn" level', function () {
      var appender = new Appender({
        name: 'spec',
        level: 'warn',
        isLogLevelBelow: isBelow
      });
      spyOn(appender, 'doAppend');
      appender.start();

      appender.append(new LogEvent('spec', 'error'));
      appender.append(new LogEvent('spec', 'warn'));
      appender.append(new LogEvent('spec', 'info'));
      appender.append(new LogEvent('spec', 'log'));

      expect(appender.doAppend).toHaveBeenCalledXTimes(2);
    });


    it('calls doAppend correctly when enabled at the "error" level', function () {
      var appender = new Appender({
        name: 'spec',
        level: 'error',
        isLogLevelBelow: isBelow
      });
      spyOn(appender, 'doAppend');
      appender.start();

      appender.append(new LogEvent('spec', 'error'));
      appender.append(new LogEvent('spec', 'warn'));
      appender.append(new LogEvent('spec', 'info'));
      appender.append(new LogEvent('spec', 'log'));

      expect(appender.doAppend).toHaveBeenCalledXTimes(1);
    });


    it('never calls doAppend when disabled', function () {
      var appender = new Appender({
        name: 'spec',
        level: 'off',
        isLogLevelBelow: isBelow
      });
      spyOn(appender, 'doAppend');
      appender.start();

      appender.append(new LogEvent('spec', 'error'));
      appender.append(new LogEvent('spec', 'warn'));
      appender.append(new LogEvent('spec', 'info'));
      appender.append(new LogEvent('spec', 'log'));

      expect(appender.doAppend).not.toHaveBeenCalled();
    });
  });
});