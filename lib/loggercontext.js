/**
 * @fileoverview Internally, LoggerContext is the anchor point for the logging
 * system. In particular, it exposes the "getLogger" function that returns a
 * Logger for use in a given module.
 *
 * From an external point of view, LoggerContext is the hidden class hidden and
 * exposed by the static LogManager class.
 *
 * A logger context is associated with a configuration file. In theory, there
 * could be more than one LoggerContext in use in a given application but note
 * the LogManager implementation in Woodman only supports a single logger
 * context.
 *
 * Appenders and layouts that may be used by the LoggerContext must be
 * registered through calls to "registerAppender" and "registerLayout".
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */

define([
  './logger',
  './appender',
  './layout'
], function (Logger, Appender, Layout) {

  /**
   * Internal anchor point for the logging system, used by LogManager.
   *
   * @constructor
   */
  var LoggerContext = function LoggerContext() {
    /**
     * Context start time
     */
    this.startTime = new Date();

    /**
     * Root logger, final ancestor of all loggers
     */
    this.rootLogger = new Logger('[root]');

    /**
     * List of loggers that have been created, indexed by name.
     */
    this.loggers = {};

    /**
     * List of appenders that have been registered through a call to
     * "registerAppender", indexed by name.
     */
    this.appenders = {};

    /**
     * List of layouts that have been registered through a call to
     * "registerLayout", indexed by name.
     */
    this.layouts = {
      'default': Layout
    };
  };


  /**
   * Registers an Appender.
   *
   * Registered appenders are used to initialize the logging configuration
   * when the "initialize" function is called. All appenders used in a given
   * configuration must be registered before initialization.
   *
   * The function associates the given Appender with the given name. If the
   * name is already associated with an Appender, the function overrides the
   * previous association.
   *
   * @function
   * @param {string} name The name of the appender
   * @param {function} appender The Appender class to associate with the name
   */
  LoggerContext.prototype.registerAppender = function (name, appender) {
    this.appenders[name] = appender;
  };


  /**
   * Registers a Layout.
   *
   * Registered layouts are used to initialize the logging configuration
   * when the "initialize" function is called. All layouts used in a given
   * configuration must be registered before initialization.
   *
   * The function associates the given Layout with the given name. If the
   * name is already associated with a Layout, the function overrides the
   * previous association.
   *
   * @function
   * @param {string} name The name of the layout
   * @param {function} layout The Layout class to associate with the name
   */
  LoggerContext.prototype.registerLayout = function (name, layout) {
    this.layouts[name] = layout;
  };


  /**
   * Initializes loggers available in the LoggerContext using the given
   * configuration.
   *
   * Initialization may be asynchronous if e.g. created loggers need to
   * setup some network connection before they may be used. The callback
   * function is called when initialization is over. It is called with an
   * error when initialization fails.
   *
   * Initialization may fail if:
   * 1. the configuration is incorrect
   * 2. the configuration references appenders/layouts that have not been
   * registered.
   * 3. the appenders/layouts could not be initialized for some reason.
   *
   * @function
   * @param {Object} config The configuration file
   * @param {function} callback Callback function called when the class is
   * done initializing loggers.
   */
  LoggerContext.prototype.initialize = function (config, callback) {
    config = config || {};
    callback = callback || function () {};



    // TODO!
  };


  /**
   * Retrieves or creates the logger that matches the given name.
   *
   * The logger is created if it does not exist yet.
   *
   * While loggers may be retrieved at any time, note they should not be used
   * before the "initialize" function has returned (logging events may be
   * lost otherwise).
   *
   * @function
   * @param {string} name The name of the logger to retrieve, using dots to
   * take advantage of the logger's hierarchy.
   * @return {Logger} The Logger instance that matches the given name.
   */
  LoggerContext.prototype.getLogger = function (name) {
    var logger = null;
    var parentLogger = '';
    var dotpos = 0;

    // Return root logger if no name has been given
    if (!name) return this.rootLogger;

    // Return logger if it already exists
    logger = this.loggers[name];
    if (logger) return logger;

    // Create logger otherwise
    logger = new Logger(name);

    // Retrieve the parent logger and set links
    // (the parent logger may be useful to set the configuration of this logger)
    dotpos = name.lastIndexOf('.');
    if (dotpos !== -1) {
      parentLogger = this.getLogger(name.substring(0, dotpos));
    }
    else {
      parentLogger = this.rootLogger;
    }
    logger.parent = parentLogger;
    parentLogger.children = parentLogger.children || [];
    parentLogger.children.push(logger);

    this.loggers[name] = logger;
    return logger;
  };


  /**
   * Returns the time at which the context was created,
   * in milliseconds since 1/1/1970.
   *
   * @return {number} context creation time
   */
  LoggerContext.prototype.getStartTime = function () {
    return this.startTime.getTime();
  };


  /**
   * Expose the LoggerContext class
   */
  return LoggerContext;
});