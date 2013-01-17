/**
 * @fileoverview Tests for the PatternLayout class
 */
/*global describe, it, expect*/

define([
  '../../lib/layouts/patternlayout',
  '../../lib/logevent',
  '../../lib/loggercontext'
], function (PatternLayout, LogEvent, LoggerContext) {

  describe('PatternLayout class', function () {
    var loggerContext = new LoggerContext();

    it('returns the initial object when toLogEvent is called', function () {
      var layout = new PatternLayout({
        pattern: '%c'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', 'timber!');
      expect(layout.toLogEvent(evt)).toBe(evt);
    });


    it('outputs the logger name (%c)', function () {
      var layout = new PatternLayout({
        pattern: '%c'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', 'timber!');
      expect(layout.toMessageString(evt)).toEqual('loggername');
    });


    it('outputs the date (%d, ISO8601 format)', function () {
      var layout = new PatternLayout({
        pattern: '%d'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', 'timber!');
      expect(layout.toMessageString(evt)).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}$/);
    });


    it('outputs the actual message (%m)', function () {
      var layout = new PatternLayout({
        pattern: '%m'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', 'timber!');
      expect(layout.toMessageString(evt)).toEqual('timber!');
    });


    it('outputs newlines that are not at the end of the pattern (%n)', function () {
      var layout = new PatternLayout({
        pattern: '%n%m'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', 'timber!');
      expect(layout.toMessageString(evt)).toEqual('\ntimber!');
    });


    it('does not output last newline (%n)', function () {
      var layout = new PatternLayout({
        pattern: '%m%n'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', 'timber!');
      expect(layout.toMessageString(evt)).toEqual('timber!');
    });


    it('outputs the trace leve (%p)', function () {
      var layout = new PatternLayout({
        pattern: '%p'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', 'timber!');
      expect(layout.toMessageString(evt)).toEqual('warn');
    });


    it('outputs the number of milliseconds since context was created (%r)', function () {
      var layout = new PatternLayout({
        pattern: '%r'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', 'timber!');
      var elapsed = evt.getMillis() - loggerContext.getStartTime();
      expect(layout.toMessageString(evt)).toEqual('' + elapsed);
    });


    it('outputs single percent signs (%%)', function () {
      var layout = new PatternLayout({
        pattern: '%%'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', 'timber!');
      expect(layout.toMessageString(evt)).toEqual('%');
    });


    it('outputs regular text', function () {
      var layout = new PatternLayout({
        pattern: 'Woodman is a good logger'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', 'timber!');
      expect(layout.toMessageString(evt)).toEqual('Woodman is a good logger');
    });


    it('mixes patterns correctly', function () {
      var layout = new PatternLayout({
        pattern: '%d [%p] %c - %m%n'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', 'timber!');
      expect(layout.toMessageString(evt)).toMatch(
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} \[warn\] loggername - timber!$/);
    });
  });
});