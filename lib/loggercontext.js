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
 * Appenders, filters and layouts that may be used by the LoggerContext must be
 * registered through calls to "registerAppender", "registerFilter" and
 * "registerLayout".
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global module, global*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function (require) {
  var LifeCycle = require('./lifecycle');
  var Logger = require('./logger');
  var utils = require('./utils');
  var CompositeFilter = require('./filters/compositefilter');


  /**
   * Internal anchor point for the logging system, used by LogManager.
   *
   * @constructor
   */
  var LoggerContext = function LoggerContext() {
    LifeCycle.call(this);

    /**
     * Context start time
     */
    this.startTime = new Date();

    /**
     * Root logger, final ancestor of all loggers
     */
    this.rootLogger = new Logger('[root]', this);

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
     * List of filters that have been registered through a call to
     * "registerFilter", indexed by name.
     */
    this.filters = {};

    /**
     * List of layouts that have been registered through a call to
     * "registerLayout", indexed by name.
     */
    this.layouts = {};

    /**
     * List of appenders that have been instantiated.
     *
     * The list is constructed when the configuration is applied. It is used
     * to start/stop appenders when corresponding functions are called on this
     * context.
     */
    this.createdAppenders = [];

    /**
     * The context-wide filter.
     *
     * The filter is constructed when the configuration is applied. If the
     * configuration specifies more than one context-wide filter, a
     * CompositeFilter filter is created.
     */
    this.filter = null;
  };
  LoggerContext.prototype = new LifeCycle();


  /**
   * Registers an Appender.
   *
   * Registered appenders are used to initialize the logging configuration
   * when the "initialize" function is called. All appenders used in a given
   * configuration must be registered before initialization.
   *
   * The function associates the given Appender with the given type. If the
   * type is already associated with an Appender, the function overrides the
   * previous association.
   *
   * @function
   * @param {string} type The type of the appender
   * @param {function} appender The Appender class to associate with the type
   */
  LoggerContext.prototype.registerAppender = function (type, appender) {
    this.appenders[type] = appender;
  };


  /**
   * Registers a Filter.
   *
   * Registered filters are used to initialize the logging configuration
   * when the "initialize" function is called. All filters used in a given
   * configuration must be registered before initialization.
   *
   * The function associates the given Filter with the given type. If the
   * type is already associated with a Filter, the function overrides the
   * previous association.
   *
   * @function
   * @param {string} type The type of the filter
   * @param {function} filter The Filter class to associate with the type
   */
  LoggerContext.prototype.registerFilter = function (type, filter) {
    this.filters[type] = filter;
  };


  /**
   * Registers a Layout.
   *
   * Registered layouts are used to initialize the logging configuration
   * when the "initialize" function is called. All layouts used in a given
   * configuration must be registered before initialization.
   *
   * The function associates the given Layout with the given type. If the
   * type is already associated with a Layout, the function overrides the
   * previous association.
   *
   * @function
   * @param {string} type The type of the layout
   * @param {function} layout The Layout class to associate with the type
   */
  LoggerContext.prototype.registerLayout = function (type, layout) {
    this.layouts[type] = layout;
  };


  /**
   * Retrieves the context-wide filter.
   *
   * @function
   * @return {Filter} The context-wide filter or null if none has been set.
   */
  LoggerContext.prototype.getFilter = function () {
    return this.filter;
  };


  /**
   * Traces a log event for the given logger.
   *
   * The function runs the "traceLogEvent" function of the given Logger instance
   * provided Woodman is started and provided the context-wide filter does not
   * reject the log event.
   *
   * If Woodman is not yet started, the function saves the log event in memory.
   * The event will be processed as soon as Woodman gets started or discarded if
   * Woodman receives too many events before it can even start.
   *
   * @function
   * @private
   * @param {LogEvent} evt The log event to consider.
   * @param {Logger} logger The logger that created the log event
   */
  LoggerContext.prototype.traceLogEvent = function (evt, logger) {
    if (!this.started) {
      // TODO: save the log event for later use
      throw new Error('Woodman is not yet started');
    }

    // Apply context-wide filter
    // (note "accept" means we'll skip the level filter)
    var decision = 'neutral';
    var filter = this.getFilter();
    if (filter) {
      decision = filter.filter(evt);
    }

    return logger.traceLogEvent(evt, decision);
  };


  /**
   * Helper function that parses an array of filters configuration parameters
   * and returns the appropriate filter.
   *
   * The function either returns the filter defined in the configuration if
   * there is only one or a composite filter that contains the filters defined
   * in the configuration if there are more than one.
   *
   * An error is thrown if the configuration references a type of filter that
   * this logger context does not know anything about.
   *
   * @function
   * @private
   * @params {Object|Array(Object)} rawFiltersConfig The filters configuration,
   *  which may be defined as an array of filters or as an object indexed by
   *  filter types.
   */
  LoggerContext.prototype.createFilter = function (rawFiltersConfig) {
    var filtersConfig = [];
    var filters = [];
    var filter = null;

    if (!rawFiltersConfig) {
      return null;
    }

    // Convert config defined as an object indexed by filter types
    // into an array of filter configurations.
    if (utils.isArray(rawFiltersConfig)) {
      filtersConfig = rawFiltersConfig;
    }
    else {
      utils.each(rawFiltersConfig, function (filterConfig, type) {
        if (utils.isArray(filterConfig)) {
          utils.each(filterConfig, function (config) {
            if (!config.type) {
              config.type = type;
            }
          });
          filtersConfig = filtersConfig.concat(filterConfig);
        }
        else {
          if (!filterConfig.type) {
            filterConfig.type = type;
          }
          filtersConfig.push(filterConfig);
        }
      });
    }

    // Create the corresponding list of filters
    utils.each(filtersConfig, function (filterConfig) {
      if (utils.isFunction(filterConfig.filter)) {
        // The configuration already references a Filter instance,
        // let's use it directly
        filters.push(filterConfig);
        return;
      }

      var filterClass = this.filters[filterConfig.type];
      if (!filterClass) {
        throw new Error('Unknown filter type "' + filterConfig.type + '"');
      }

      filters.push(new filterClass(filterConfig));
    }, this);

    // Wrap filters in a composite filter if there is more than one
    if (filters.length > 1) {
      filter = new CompositeFilter(filters);
    }
    else if (filters.length === 1) {
      filter = filters[0];
    }

    return filter;
  };


  /**
   * Initializes loggers available in the LoggerContext using the given
   * configuration.
   *
   * Initialization may fail if:
   * 1. the configuration is incorrect
   * 2. the configuration references appenders/filters/layouts that have not
   * been registered.
   * 3. the appenders/filters/layouts could not be initialized for some reason.
   *
   * The initialization does not start the appenders. In other words, the
   * caller should also issue a call to "start" afterwards (or consider
   * using the "load" function).
   *
   * @function
   * @param {Object} config The configuration structure
   * @param {function} callback Callback function called when the class is
   * done initializing loggers.
   */
  LoggerContext.prototype.initialize = function (config) {
    var nodeEnvironment = false;
    if (config &&
        utils.isString(config) &&
        config.match(/^console(\s|$)/i)) {
      // Users simply wants to start logging things to the console using a
      // usual pattern layout or the one provided. Note that, by definition,
      // this will only work provided that the Console Appender and Pattern
      // Layout are registered within the distribution of Woodman under use.

      // The "appendStrings" option flag is set to true when the runtime
      // environment is node.js. In other words, Woodman logs objects to the
      // console in the browser as the usual console.
      // TODO: The code below assumes that not being in a node.js environment
      // means Woodman is running in a browser console that can log objects
      // and that already flags the trace level with some scheme (icon, colour,
      // etc). There are other backend runtimes around and browsers may not all
      // support logging objects.
      nodeEnvironment = !!((typeof global !== 'undefined') &&
        global.process &&
        global.process.versions &&
        global.process.versions.node);

      config = {
        loggers: [
          {
            level: 'all',
            appenders: [
              {
                type: 'Console',
                name: 'console',
                layout: {
                  type: 'pattern',
                  pattern: config.substring('console '.length) ||
                    (nodeEnvironment ?
                      '%d{yyyy-MM-dd HH:mm:ss} [%logger] %level - %m%n' :
                      '%d{yyyy-MM-dd HH:mm:ss} [%logger] %m%n')
                },
                appendStrings: nodeEnvironment
              }
            ]
          }
        ]
      };
    }
    else {
      config = JSON.parse(JSON.stringify(config || {}));
    }

    var loggersConfig = [];
    var appendersConfig = [];
    var appenders = {};

    // Reset previous configuration
    this.reset();

    if (utils.isArray(config)) {
      // Configuration lists loggers directly
      loggersConfig = config;
    }
    else {
      // Configuration is an object structure that contains the list of loggers
      // Skip root level if structure follows the log4j format
      if (config.configuration) {
        config = config.configuration;
      }

      if (utils.isArray(config.loggers)) {
        loggersConfig = config.loggers;
      }
      else {
        loggersConfig = [];
        loggersConfig = utils.each(config.loggers, function (loggerConfig, type) {
          if (type === 'root') {
            loggerConfig.root = true;
          }
          if (utils.isArray(loggerConfig)) {
            utils.each(loggerConfig, function (config) {
              loggersConfig.push(config);
            });
          }
          else {
            loggersConfig.push(loggerConfig);
          }
        });
      }

      if (utils.isArray(config.appenders)) {
        appendersConfig = config.appenders;
      }
      else {
        utils.each(config.appenders, function (appenderConfig, type) {
          if (utils.isArray(appenderConfig)) {
            utils.each(appenderConfig, function (config) {
              if (!config.type) {
                config.type = type;
              }
            });
            appendersConfig = appendersConfig.concat(appenderConfig);
          }
          else {
            if (!appenderConfig.type) {
              appenderConfig.type = type;
            }
            appendersConfig.push(appenderConfig);
          }
        });
      }
    }

    // Parse loggers config to extract additional appenders
    utils.each(loggersConfig, function (loggerConfig) {
      var appendersRef = [];

      // Convert "appender-ref" structure into an array of strings
      // (the "appender-ref" property comes from log4j)
      if (loggerConfig['appender-ref']) {
        if (utils.isArray(loggerConfig['appender-ref'])) {
          appendersRef = utils.map(
            loggerConfig['appender-ref'],
            function (appenderRef) {
              return appenderRef.ref;
            }
          );
        }
        else {
          appendersRef.push(loggerConfig['appender-ref'].ref);
        }
        delete loggerConfig['appender-ref'];
      }

      // Add appenders referenced or defined in the "appenders" property
      // (the "appenders" property is not defined in log4j but more logical)
      if (utils.isArray(loggerConfig.appenders)) {
        utils.each(loggerConfig.appenders, function (appenderConfig) {
          if (utils.isObject(appenderConfig)) {
            appendersConfig.push(appenderConfig);
            appendersRef.push(appenderConfig.name);
          }
          else {
            appendersRef.push(appenderConfig);
          }
        });
      }
      loggerConfig.appenders = appendersRef;
    });

    // Create context-wide filters
    this.filter = this.createFilter(config.filters);

    // Create the Appender instances that will be used by loggers
    utils.each(appendersConfig, function (appenderConfig) {
      var appenderClass = this.appenders[appenderConfig.type];
      var layoutConfig = null;
      var layoutClass = null;
      var appender = null;

      if (!appenderClass) {
        throw new Error('Unknown appender type for "' +
          appenderConfig.name + '": ' + appenderConfig.type);
      }
      if (appenders[appenderConfig.name]) {
        throw new Error('Appender "' + appenderConfig.name +
          '" referenced twice in the configuration');
      }

      // Create the referenced layout
      if (appenderConfig.layout) {
        layoutConfig = appenderConfig.layout;
        layoutClass = this.layouts[layoutConfig.type];
      }
      else {
        utils.each(this.layouts, function (layout, type) {
          if (appenderConfig[type]) {
            layoutConfig = appenderConfig[type];
            layoutClass = layout;
          }
        });
      }
      if (!layoutClass) {
        throw new Error('No proper layout defined for appender "' +
          appenderConfig.name + '"');
      }
      appenderConfig.layout = new layoutClass(layoutConfig, this);

      // Create referenced filters if any
      if (appenderConfig.filters) {
        appenderConfig.filter = this.createFilter(appenderConfig.filters);
      }
      else if (appenderConfig.filter) {
        appenderConfig.filter = this.createFilter([appenderConfig.filter]);
      }

      appender = new appenderClass(appenderConfig);
      this.createdAppenders.push(appender);
      appenders[appenderConfig.name] = appender;
    }, this);


    // Create loggers
    utils.each(loggersConfig, function (loggerConfig) {
      var logger = null;

      // Prepare the list of appenders referenced by the logger
      // (note the "appenders" property now only contains references)
      loggerConfig.appenders = utils.map(loggerConfig.appenders, function (appenderRef) {
        var appender = appenders[appenderRef];
        if (!appender) {
          throw new Error('Logger "' + loggerConfig.name +
            '" references undefined appender "' + appenderRef + '"');
        }
        return appenders[appenderRef];
      });

      // Create referenced filters if any
      if (loggerConfig.filters) {
        loggerConfig.filter = this.createFilter(loggerConfig.filters);
      }
      else if (loggerConfig.filter) {
        loggerConfig.filter = this.createFilter(loggerConfig.filter);
      }

      // Retrieve (or create) the logger from the pool of loggers
      if (loggerConfig.root || !loggerConfig.name) {
        logger = this.getLogger();
      }
      else {
        logger = this.getLogger(loggerConfig.name);
      }

      // Initialize the logger's configuration
      logger.initialize(loggerConfig);
    }, this);

    // Propagate trace levels
    this.propagateLevels();
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
    logger = new Logger(name, this);

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
    logger.level = parentLogger.level;
    logger.filter = parentLogger.filter;
    parentLogger.children = parentLogger.children || [];
    parentLogger.children.push(logger);

    this.loggers[name] = logger;
    return logger;
  };


  /**
   * Returns the time at which the context was created,
   * in milliseconds since 1/1/1970.
   *
   * @function
   * @return {number} context creation time
   */
  LoggerContext.prototype.getStartTime = function () {
    return this.startTime.getTime();
  };


  /**
   * Resets the configuration of all existing loggers.
   *
   * This function is called by "initialize" to reset the list of loggers
   * before applying the new configuration.
   *
   * Note appenders should have been properly stopped through a call to "stop"
   * before this function gets called.
   *
   * @function
   * @private
   */
  LoggerContext.prototype.reset = function () {
    var name = '';
    for (name in this.loggers) {
      this.loggers[name].reset();
    }
    this.rootLogger.reset();
    this.rootLogger.level = 'all';
    this.createdAppenders = [];
    this.started = false;
  };


  /**
   * Propagates trace level (and filter) among existing loggers
   *
   * This function is called by "initialize" to set the appropriate
   * trace level of all loggers.
   *
   * The root logger gets forced to the "all" level if its level has not
   * been set before.
   *
   * @function
   * @private
   */
  LoggerContext.prototype.propagateLevels = function () {
    if (this.rootLogger.level === 'inherit') {
      this.rootLogger.level = 'all';
    }
    utils.each(this.loggers, function (logger) {
      var parent = logger;
      while (parent.level === 'inherit') {
        parent = parent.parent;
      }
      logger.level = parent.level;
      if (!logger.filter) {
        logger.filter = parent.filter;
      }
    });
  };


  /**
   * Starts all the appenders defined in the configuration
   *
   * @function
   * @param {function} callback Callback function called when all appenders
   *  have started. The function receives a potential error as first parameter.
   */
  LoggerContext.prototype.start = function (callback) {
    callback = callback || function () {};

    // Call the callback function when all appenders have been started
    // or when an error occurred. Note the callback function is called
    // only once, no matter, receiving the first error when multiple
    // errors occur.
    var self = this;
    var count = this.createdAppenders.length;
    var errOccurred = false;
    var cb = function (err) {
      if (errOccurred) return;
      if (err) {
        errOccurred = true;
        return callback(err);
      }
      count -= 1;
      if (count === 0) {
        self.started = true;
        return callback();
      }
    };

    if (count > 0) {
      // Start all the appenders (in parallel)
      utils.each(this.createdAppenders, function (appender) {
        appender.start(function (err) {
          return cb(err);
        });
      });
    }
    else {
      // No appender to start, woodman is started (and won't do much)
      this.started = true;
      return callback();
    }
  };


  /**
   * Stops all the appenders defined in the configuration
   *
   * @function
   * @param {function} callback Callback function called when all appenders
   *  have stopped. The function receives a potential error as first parameter.
   */
  LoggerContext.prototype.stop = function (callback) {
    callback = callback || function () {};

    // Call the callback function when all appenders have been started
    // or when an error occurred. Note the callback function is called
    // only once, no matter, receiving the first error when multiple
    // errors occur.
    var self = this;
    var count = this.createdAppenders.length;
    var errOccurred = false;
    var cb = function (err) {
      if (errOccurred) return;
      if (err) {
        errOccurred = true;
        return callback(err);
      }
      count -= 1;
      if (count === 0) {
        self.started = false;
        return callback();
      }
    };

    if (count > 0) {
      // Stop all the appenders (in parallel)
      utils.each(this.createdAppenders, function (appender) {
        appender.stop(function (err) {
          return cb(err);
        });
      });
    }
    else {
      // No appender to stop
      this.started = false;
      return callback();
    }
  };


  /**
   * Generic function that initializes the context with the configuration
   * provided as parameter and starts all created appenders.
   *
   * This function should be the first function called by an application that
   * uses this library.
   *
   * @function
   * @param {Object} config Context configuration
   * @param {function} callback Function called once appenders have started
   */
  LoggerContext.prototype.load = function (config, callback) {
    this.initialize(config);
    this.start(callback);
  };


  /**
   * Expose the LoggerContext class
   */
  return LoggerContext;
});