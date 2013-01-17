/**
 * @fileoverview Base class for objects that need to implement start/stop logic
 * to finish initialization after configuration has completed and to perform
 * cleanup during shutdown.
 *
 * LoggerContext and Appender derive from this base class in particular.
 * Appenders should override the start/stop functions to run appropriate
 * actions, as needed.
 *
 * The "start" and "stop" function may run asynchronously. They call the
 * callback function provided as parameter when they are done, passing a
 * potential error as first parameter.
 *
 * This class is inspired by the LifeCycle class in log4j:
 * http://logging.apache.org/log4j/2.x/log4j-core/apidocs/org/apache/logging/log4j/core/LifeCycle.html
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

define(function () {
  var LifeCycle = function () {
    this.started = false;
  };

  LifeCycle.prototype.start = function (callback) {
    callback = callback || function () {};
    this.started = true;
    return callback();
  };

  LifeCycle.prototype.stop = function (callback) {
    callback = callback || function () {};
    this.started = false;
    return callback();
  };

  LifeCycle.prototype.isStarted = function () {
    return this.started;
  };

  return LifeCycle;
});