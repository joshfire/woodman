/**
 * @fileoverview Tests for the Appender class
 */
/*global describe, it, expect, spyOn*/

define([
  '../../lib/appender',
  '../../lib/logevent',
  '../../lib/loglevel'
], function (Appender, LogEvent, LogLevel) {

  describe('Appender class', function () {

    it('keeps track of name of the appender', function () {
      var name = (new Appender('spec')).getName();
      expect(name).toEqual('spec');

      name = (new Appender('spec.logevent')).getName();
      expect(name).toEqual('spec.logevent');

      name = (new Appender('spec.logevent.logger')).getName();
      expect(name).toEqual('spec.logevent.logger');
    });


    it('always calls doAppend when fully enabled', function () {
      var appender = new Appender('spec');
      spyOn(appender, 'doAppend');

      appender.level = LogLevel.all;
      
      appender.append(new LogEvent('spec', LogLevel.error));
      appender.append(new LogEvent('spec', LogLevel.warn));
      appender.append(new LogEvent('spec', LogLevel.info));
      appender.append(new LogEvent('spec', LogLevel.log));

      expect(appender.doAppend).toHaveBeenCalledXTimes(4);
    });


    it('calls doAppend correctly when enabled at the "log" level', function () {
      var appender = new Appender('spec');
      spyOn(appender, 'doAppend');

      appender.level = LogLevel.log;
      
      appender.append(new LogEvent('spec', LogLevel.error));
      appender.append(new LogEvent('spec', LogLevel.warn));
      appender.append(new LogEvent('spec', LogLevel.info));
      appender.append(new LogEvent('spec', LogLevel.log));
      appender.append(new LogEvent('spec', 0));

      expect(appender.doAppend).toHaveBeenCalledXTimes(4);
    });


    it('calls doAppend correctly when enabled at the "info" level', function () {
      var appender = new Appender('spec');
      spyOn(appender, 'doAppend');

      appender.level = LogLevel.info;
      
      appender.append(new LogEvent('spec', LogLevel.error));
      appender.append(new LogEvent('spec', LogLevel.warn));
      appender.append(new LogEvent('spec', LogLevel.info));
      appender.append(new LogEvent('spec', LogLevel.log));

      expect(appender.doAppend).toHaveBeenCalledXTimes(3);
    });


    it('calls doAppend correctly when enabled at the "warn" level', function () {
      var appender = new Appender('spec');
      spyOn(appender, 'doAppend');

      appender.level = LogLevel.warn;
      
      appender.append(new LogEvent('spec', LogLevel.error));
      appender.append(new LogEvent('spec', LogLevel.warn));
      appender.append(new LogEvent('spec', LogLevel.info));
      appender.append(new LogEvent('spec', LogLevel.log));

      expect(appender.doAppend).toHaveBeenCalledXTimes(2);
    });


    it('calls doAppend correctly when enabled at the "error" level', function () {
      var appender = new Appender('spec');
      spyOn(appender, 'doAppend');

      appender.level = LogLevel.error;
      
      appender.append(new LogEvent('spec', LogLevel.error));
      appender.append(new LogEvent('spec', LogLevel.warn));
      appender.append(new LogEvent('spec', LogLevel.info));
      appender.append(new LogEvent('spec', LogLevel.log));

      expect(appender.doAppend).toHaveBeenCalledXTimes(1);
    });


    it('never calls doAppend when disabled', function () {
      var appender = new Appender('spec');
      spyOn(appender, 'doAppend');

      appender.level = LogLevel.off;
      
      appender.append(new LogEvent('spec', LogLevel.error));
      appender.append(new LogEvent('spec', LogLevel.warn));
      appender.append(new LogEvent('spec', LogLevel.info));
      appender.append(new LogEvent('spec', LogLevel.log));

      expect(appender.doAppend).not.toHaveBeenCalled();
    });
  });
});