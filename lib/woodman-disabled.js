/**
 * @fileoverview Tiny "disabled" version of the Woodman library that returns
 * empty shims for the different objects that the Woodman library exposes to an
 * application.
 *
 * This version is intended to replace the code of the Woodman library in
 * production where authors may want to restrict the size of the resulting
 * application and disable all logging traces.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */

define(function () {
  /**
   * Function that does nothing
   */
  var noop = function () {};

  /**
   * Function that does nothing (asynchronous version)
   *
   * The function expects the last parameter to be the callback function
   */
  var noopAsync = function () {
    if (arguments && (arguments.length > 0)) {
      arguments[arguments.length - 1]();
    }
  };

  return {
    registerAppender: noop,
    registerLayout: noop,
    load: noopAsync,
    unload: noopAsync,
    initialize: noopAsync,
    start: noopAsync,
    stop: noop,
    getLogger: function () {
      return {
        log: noop,
        info: noop,
        warn: noop,
        error: noop
      };
    }
  };
});