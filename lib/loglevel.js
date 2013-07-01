/**
 * @fileoverview Defines the objects that contains the list of trace levels
 * available in a LoggerContext and their order.
 *
 * Levels are mere strings kept in an ordered array that defines which level
 * is below another.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global module*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function (require) {
  var WoodmanError = require('./error');

  /**
   * Definition of the LogLevel class.
   *
   * There should be one and only one LogLevel instance per LoggerContext.
   *
   * @constructor
   */
  var LogLevel = function () {
    this.levels = [];
  };


  /**
   * Returns the sort index of the given level in the list of levels.
   *
   * @function
   * @private
   * @param {string} level Level whose index you're interested in. The level
   *  must not be one of the specific values "off", "all" or "inherit".
   * @return {number} The level index in the array, -1 if not found.
   */
  LogLevel.prototype.level2index = function (level) {
    var i = 0;
    var len = this.levels.length;
    for (i = 0; i < len; i++) {
      if (this.levels[i] === level) return i;
    }
    return -1;
  };


  /**
   * Registers the given level before the level passed as second parameter.
   *
   * To clarify the "before" relationship, a logger set to trace log events
   * at the level identified by the second parameter will also trace log
   * events at the registered level. Converserly, a logger set to trace log
   * events at the registered level will not trace log events at the level
   * identified by the second parameter.
   *
   * If the second parameter is null, the level is inserted at the first
   * position in the array, meaning all loggers will trace log events at
   * this level (unless loggers are at the "off" level).
   *
   * @function
   * @param {!string} level The level to register. The level must not
   *  already exist in the list
   * @param {string} before The level that should come next in the list
   *  of levels. If provided, the level must exist in the list. In particular,
   *  the level cannot be one of the specific values "off", "all", "inherit".
   * @throws {Error} The level to register already exists or the second
   *  parameter is invalid
   */
  LogLevel.prototype.registerLevel = function (level, before) {
    var insertionPos = 0;

    if (this.level2index(level) !== -1) {
      throw new WoodmanError('Log level "' + level + '" ' +
        'cannot be registered as it already exists');
    }

    if (before) {
      insertionPos = this.level2index(before);
      if (insertionPos === -1) {
        throw new WoodmanError('The log level "' + before + '" ' +
          'cannot be used as reference level as it does not exist');
      }
    }

    this.levels.splice(insertionPos, 0, level);
  };


  /**
   * Registers usual levels "trace", "log", "info", "warn", "error".
   *
   * @function
   */
  LogLevel.prototype.registerStandardLevels = function () {
    this.registerLevel('trace');
    this.registerLevel('log');
    this.registerLevel('info');
    this.registerLevel('warn');
    this.registerLevel('error');
  };


  /**
   * Returns true when log level is below or equal to the provided reference
   * log level.
   *
   * Note that "off" is below all levels, and "all" above all levels.
   *
   * @function
   * @param {string} level Log level
   * @param {string} referenceLevel Reference log level
   * @return {boolean} true when log level is below the reference log level
   *   in the list of log levels
   */
  LogLevel.prototype.isBelow = function (level, referenceLevel) {
    if (level === 'off') return true;
    if (level === 'all') return (referenceLevel === 'all');
    if (referenceLevel === 'off') return false;
    if (referenceLevel === 'all') return true;
    return (this.level2index(level) <= this.level2index(referenceLevel));
  };


  /**
   * Returns the list of registered levels
   *
   * @function
   * @return {Array.<string>} List of levels that have been registered
   */
  LogLevel.prototype.getLevels = function () {
    return this.levels;
  };

  // Expose the LogLevel constructor
  return LogLevel;
});