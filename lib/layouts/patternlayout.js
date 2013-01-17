/**
 * @fileoverview Lays out a log event according to some regexp-like format
 * string.
 *
 * Patterns supported are based on those defined by the log4j documentation:
 * http://logging.apache.org/log4j/2.x/manual/layouts.html#PatternLayout
 *
 * This implementation only supports basic patterns (see below for a full list),
 * and shortcut notations ("%d" but not "%date" for instance).
 *
 * Supported patterns:
 * - %c the logger name
 * - %d the date
 * - %m the actual message
 * - %n a newline (note loggers always end up a message with a newline)
 * - %p trace level name in uppercase letters
 * - %r number of milliseconds elapsed since the logger context was created
 * - %% to output a single percent sign
 *
 * Most of the code is a minor adaptation of similar code in the
 * log4javascript library. Copyright and license:
 *  Copyright 2012 Tim Down.
 *  Licensed under the Apache License, Version 2.0 (the "License")
 *  http://log4javascript.org/
 *
 * Copyright and license of updated code:
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global toString, module*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([
  '../layout',
  './simpledateformat',
  './simpleobjectserializer'
], function (Layout, SimpleDateFormat, serializeObject) {

  /**
   * Regular expression used to extract a pattern in a pattern string
   *
   * A pattern has the following pseudo format:
   *   %[padding?][truncation?][pattern identifier]{[pattern parameters]}?
   * The expression also matches non-pattern pieces of string.
   *
   * Running the regular expression once with "exec" yields the following array:
   * 0 - the entire matched string
   * 1 - the padding if defined, "undefined" otherwise
   * 2 - the truncation if defined, "undefined" otherwise
   * 3 - the pattern identifier character, "undefined" when pattern is a regular
   * piece of text.
   * 4 - pattern parameters if defined, "undefined", otherwise.
   * 5 - the text when the extracted substring  is a regular piece of text and
   * not a real pattern. All other items (save 0) are "undefined".
   */
  var rPattern = /%(-?[0-9]+)?(\.?[0-9]+)?([cdmnpr%])(?:\{([^\}]+)\})?|([^%]+)/g;


  /**
   * Basic date formats
   */
  var dateFormats = {
    absolute: 'HH:mm:ss,SSS',
    compact: 'yyyyMMddHHmmssSSS',
    date: 'dd MMM yyyy HH:mm:ss,SSS',
    iso8601: 'yyyy-MM-dd HH:mm:ss,SSS',
    iso8601_basic: 'yyyy-MM-DD HHmmss,SSS'
  };


  /**
   * Returns true when given variable is an array
   */
  var isArray = Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
  };

  /**
   * Returns true when given variable is a string
   */
  var isString = function (obj) {
    return toString.call(obj) === '[object String]';
  };


  /**
   * Lays out a log event using a regexp-like format string.
   *
   * @constructor
   * @extends {Layout}
   * @param {Object} config Layout configuration. Structure depends on concrete
   *  layout class being used
   * @param {LoggerContext} loggerContext Reference to the logger context that
   *  gave birth to this layout.
   */
  var PatternLayout = function (config, loggerContext) {
    Layout.call(this, config, loggerContext);
    this.pattern = this.config.pattern ||
      PatternLayout.DEFAULT_CONVERSION_PATTERN;
  };
  PatternLayout.prototype = new Layout();

  /**
   * Public basic patterns.
   */
  PatternLayout.DEFAULT_CONVERSION_PATTERN = '%m%n';
  PatternLayout.TTCC_CONVERSION_PATTERN = '%r %p %c - %m%n';
  PatternLayout.SIMPLE_CONVERSION_PATTERN = '%d %p %c - %m%n';


  /**
   * Formats the given log event as a string following the pattern set
   * when the layout was created.
   */
  PatternLayout.prototype.toMessageString = function (evt) {
    var formattedString = '';
    var rawResult = [];
    var result = {
      matched: '',
      padding: '',
      truncation: '',
      pattern: '',
      params: '',
      text: ''
    };
    var separationCharacter = '';
    var str = '';
    var nb = 0;
    var messages = [];
    var replacement = '';
    var i = 0;
    var len = 0;
    var dateFormat = '';
    var date = null;

    while ((rawResult = rPattern.exec(this.pattern))) {
      result.matched = rawResult[0];
      result.padding = rawResult[1];
      result.truncation = rawResult[2];
      result.pattern = rawResult[3];
      result.params = rawResult[4];
      result.text = rawResult[5];
      replacement = '';

      // Check if the pattern matched was just normal text
      if (result.text) {
        formattedString += result.text;
        continue;
      }

      // Complete the formatted string with the requested information
      switch (result.pattern) {
      case 'c':
        // Output the logger's name, applying precision parameter if defined
        str = evt.getLoggerName();
        if (result.params) {
          nb = parseInt(result.params, 10);
          messages = str.split('.');
          if (nb >= messages.length) {
            replacement = str;
          } else {
            replacement = messages
              .slice(messages.length - nb)
              .join('.');
          }
        } else {
          replacement = str;
        }
        break;

      case 'd':
        // Output the date
        dateFormat = result.params || 'ISO8601';

        // Convert predefined formats in real date formats
        if (dateFormat === 'ISO8601') {
          dateFormat = dateFormats.iso8601;
        }
        else if (dateFormat === 'ABSOLUTE') {
          dateFormat = dateFormats.absolute;
        }
        else if (dateFormat === 'COMPACT') {
          dateFormat = dateFormats.compact;
        }
        else if (dateFormat === 'DATE') {
          dateFormat = dateFormats.date;
        }
        else if (dateFormat === 'ISO8601_BASIC') {
          dateFormat = dateFormats.iso8601_basic;
        }

        // Format the date
        date = new Date(evt.getMillis());
        replacement = (new SimpleDateFormat(dateFormat)).format(date);
        break;

      case 'm':
        // Output the messages as a space-separated string (or using the
        // provided parameter if it exists as separation character)
        messages = isArray(evt.getMessage()) ?
          evt.getMessage() :
          [evt.getMessage()];
        separationCharacter = result.params || ' ';

        for (i = 0, len = messages.length; i < len; i++) {
          if (i > 0) replacement += separationCharacter;
          if (isString(messages[i])) {
            replacement += messages[i];
          }
          else {
            replacement += serializeObject(messages[i], 2);
          }
        }
        break;

      case "n":
        // Output a new line
        replacement = '\n';
        break;

      case "p":
        // Output the trace level
        replacement = evt.getLevel();
        break;

      case "r":
        // Output the number of milliseconds since logger context
        // was created.
        nb = evt.getMillis() - this.loggerContext.getStartTime();
        replacement = '' + nb;
        break;

      case "%":
        // Output the literal % sign
        replacement = "%";
        break;

      default:
        // Unknown pattern, treat the pattern as regular text
        replacement = result.matched;
        break;
      }

      // Apply truncation if requested
      // (note truncation is from the beginning in log4j)
      if (result.truncation) {
        nb = parseInt(result.truncation.substr(1), 10);
        len = replacement.length;
        if (nb < len) {
          replacement = replacement.substring(len - nb, len);
        }
      }

      // Pad the result with spaces if requested
      if (result.padding) {
        if (result.padding.charAt(0) === '-') {
          // Right padding
          len = parseInt(result.padding.substr(1), 10);
          for (i = replacement.length; i < len; i++) {
            replacement += ' ';
          }
        } else {
          // Left padding
          len = parseInt(result.padding, 10);
          str = '';
          for (i = replacement.length; i < len; i++) {
            str += ' ';
          }
          replacement = str + replacement;
        }
      }
      formattedString += replacement;
    }

    if (formattedString.lastIndexOf('\n') === formattedString.length - 1) {
      formattedString = formattedString.substring(0,
        formattedString.length - 1);
    }
    return formattedString;
  };


  // Expose the constructor
  return PatternLayout;
});