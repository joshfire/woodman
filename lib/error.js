/**
 * @fileoverview Error class raised by Woodman and exposed by LogManager.
 *
 * All errors raised by Woodman derive from this error class
 */
/*global define*/

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
