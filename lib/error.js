/**
 * @fileoverview Error class raised by Woodman and exposed by LogManager.
 *
 * All errors raised by Woodman derive from this error class
 */
/*global module*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function () {

  /**
   * Base error description.
   */
  var BaseError = function (message) {
    /**
     * The error message
     */
    this.message = message;

    Error.call(this);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, arguments.callee);
    }
  };
  BaseError.prototype = new Error();

  return BaseError;
});
