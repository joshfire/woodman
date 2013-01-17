/**
 * @fileoverview Known log levels
 *
 * Log levels are defined as numbers to ease comparison. Additional and
 * intermediary levels may be defined in custom builds (numbers must be
 * lower than 100000.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */

define(function () {
  /**
   * Known log levels.
   *
   * The order is significant, as loggers are configured to trace log events
   * below a certain level.
   *
   * The levels "off" and "all" do not appear in the list but are handled
   * appropriately by the functions below.
   *
   * New levels may be registered through a call to "registerLevel".
   */
  var levels = [
    'error',
    'warn',
    'info',
    'log',
    'trace'
  ];

  /**
   * Returns the sort index of the given level in the list of levels.
   *
   * @function
   * @param {string} level Level whose index you're interested in. The level
   *  must not be one of the specific values "off", "all" or "inherit".
   * @return {number} The level index in the array, -1 if not found.
   */
  var level2index = function (level) {
    var i = 0;
    var len = levels.length;
    for (i = 0; i < len; i++) {
      if (levels[i] === level) return i;
    }
    return -1;
  };


  return {
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
    registerLevel: function (level, before) {
      var insertionPos = 0;

      if (level2index(level) !== -1) {
        throw new Error('Log level "' + level + '" ' +
          'cannot be registered as it already exists');
      }

      if (before) {
        insertionPos = level2index(before);
        if (insertionPos === -1) {
          throw new Error('The log level "' + before + '" ' +
            'cannot be used as reference level as it does not exist');
        }
      }

      levels.splice(insertionPos, 0, level);
    },

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
    isBelow: function (level, referenceLevel) {
      if (level === 'off') return true;
      if (level === 'all') return (referenceLevel === 'all');
      if (referenceLevel === 'off') return false;
      if (referenceLevel === 'all') return true;
      return (level2index(level) <= level2index(referenceLevel));
    }
  };
});