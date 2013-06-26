/**
 * @fileoverview Tests for the Appender class
 */
/*global define, describe, it, expect, spyOn*/

define(function (require) {
  var Appender = require('../../lib/appender');
  var LogEvent = require('../../lib/logevent');

  describe('Appender class', function () {

    it('keeps track of name of the appender', function () {
      var name = (new Appender({ name: 'spec' })).getName();
      expect(name).toEqual('spec');

      name = (new Appender({ name: 'spec.logevent' })).getName();
      expect(name).toEqual('spec.logevent');

      name = (new Appender({ name: 'spec.logevent.logger' })).getName();
      expect(name).toEqual('spec.logevent.logger');
    });


    it('always calls doAppend when fully enabled', function () {
      var appender = new Appender({
        name: 'spec',
        level: 'all'
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
        level: 'log'
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
        level: 'info'
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
        level: 'warn'
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
        level: 'error'
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
        level: 'off'
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