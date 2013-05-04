/**
 * @fileoverview Tests for the PatternLayout class
 */
/*global define, describe, it, expect*/

define([
  '../../lib/layouts/patternlayout',
  '../../lib/logevent',
  '../../lib/loggercontext',
  '../../lib/message'
], function (PatternLayout, LogEvent, LoggerContext, Message) {

  describe('PatternLayout class', function () {
    var loggerContext = new LoggerContext();

    it('returns the initial object when toLogEvent is called', function () {
      var layout = new PatternLayout({
        pattern: '%logger'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toLogEvent(evt)).toBe(evt);
    });


    it('outputs the logger name (%logger)', function () {
      var layout = new PatternLayout({
        pattern: '%logger'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual('loggername');
    });


    it('outputs the date (%date, ISO8601 format)', function () {
      var layout = new PatternLayout({
        pattern: '%date'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}$/);
    });


    it('outputs the actual message (%message)', function () {
      var layout = new PatternLayout({
        pattern: '%message'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual('timber!');
    });


    it('outputs the trace level (%level)', function () {
      var layout = new PatternLayout({
        pattern: '%level'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual('warn');
    });


    it('outputs the number of milliseconds since context was created (%relative)', function () {
      var layout = new PatternLayout({
        pattern: '%relative'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      var elapsed = evt.getMillis() - loggerContext.getStartTime();
      expect(layout.toMessageString(evt)).toEqual('' + elapsed);
    });


    it('outputs the logger name (%c)', function () {
      var layout = new PatternLayout({
        pattern: '%c'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual('loggername');
    });


    it('outputs the date (%d, ISO8601 format)', function () {
      var layout = new PatternLayout({
        pattern: '%d'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}$/);
    });


    it('outputs the actual message (%m)', function () {
      var layout = new PatternLayout({
        pattern: '%m'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual('timber!');
    });


    it('outputs newlines that are not at the end of the pattern (%n)', function () {
      var layout = new PatternLayout({
        pattern: '%n%m'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual('\ntimber!');
    });


    it('does not output last newline (%n)', function () {
      var layout = new PatternLayout({
        pattern: '%m%n'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual('timber!');
    });


    it('outputs the trace level (%p)', function () {
      var layout = new PatternLayout({
        pattern: '%p'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual('warn');
    });


    it('outputs the number of milliseconds since context was created (%r)', function () {
      var layout = new PatternLayout({
        pattern: '%r'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      var elapsed = evt.getMillis() - loggerContext.getStartTime();
      expect(layout.toMessageString(evt)).toEqual('' + elapsed);
    });


    it('outputs single percent signs (%%)', function () {
      var layout = new PatternLayout({
        pattern: '%%'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual('%');
    });


    it('outputs regular text', function () {
      var layout = new PatternLayout({
        pattern: 'Woodman is a good logger'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual('Woodman is a good logger');
    });


    it('mixes patterns correctly', function () {
      var layout = new PatternLayout({
        pattern: '%d [%p] %c - %m%n'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toMatch(
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} \[warn\] loggername - timber!$/);
    });


    it('highlights parts of the message based on level (%highlight)', function () {
      var layout = new PatternLayout({
        pattern: '[%highlight{%level}] %c - %m%n'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'error', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual(
        '[\u001b[31merror\u001b[0m] loggername - timber!');
    });


    it('highlights parts of the message based on level (%h)', function () {
      var layout = new PatternLayout({
        pattern: '[%h{%level}] %c - %m%n'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual(
        '[\u001b[33mwarn\u001b[0m] loggername - timber!');
    });


    it('supports left padding', function () {
      var layout = new PatternLayout({
        pattern: '%5p %c'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual(' warn loggername');
    });


    it('supports truncation (from the beginning)', function () {
      var layout = new PatternLayout({
        pattern: '%.2p %c'
      }, loggerContext);
      var evt = new LogEvent('loggername', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual('rn loggername');
    });


    it('pads and truncates as needed', function () {
      var layout = new PatternLayout({
        pattern: '%5p %5.10c'
      }, loggerContext);
      var evt = new LogEvent('log', 'warn', new Message('timber!'));
      expect(layout.toMessageString(evt)).toEqual(' warn   log');
      evt = new LogEvent('loggername.long', 'warn', 'timber!');
      expect(layout.toMessageString(evt)).toEqual(' warn rname.long');
    });

  });
});