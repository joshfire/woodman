/**
 * @fileoverview Implementation of the Promises/A+ spec
 *
 * The implementation is heavily based on PinkySwear.js, slightly updated in
 * particular to be exported as an AMD module.
 *
 * PinkySwear comes with the following license:
 * Public Domain. Use, modify and distribute it any way you like.
 * No attribution required.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 *
 * See original project:
 * https://github.com/timjansen/PinkySwear.js
 *
 * The library returns a factory function that returns a promise function in
 * the pending state. To fulfill the Promise, call it with true as first
 * parameter and a potential fulfillment value as second parameter. To reject
 * the Promise, call it with false as first parameter and a potential rejection
 * reason as second parameter.
 *
 * For example, supposing the library gets imported as "makePromise":
 *  var promise = makePromise();
 *  promise.then(function (value) {});
 *  promise(true, 'fulfillment value');
 *  promise.then(function (value) {}, function (err) {});
 */
/*global module*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function (require) {
  var utils = require('./utils');

  /**
   * Defers the execution of the provided callback function to next tick
   *
   * @function
   * @param {callback} The function to call after next tick
   */
  var defer = function defer(callback) {
    setTimeout(callback, 0);
  };


  /**
   * Returns a promise function in the pending state.
   *
   * Call the function with true as first parameter to fulfill the promise.
   * Call the function with false as first parameter to reject the promise.
   *
   * You may pass the fulfillment value or rejection reason as second parameter.
   *
   * @function
   * @return {function} A promise function in the pending state
   */
  var makePromise = function makePromise() {
    // Promise state is either:
    // - null = pending
    // - true = fulfilled
    // - false = rejected
    var state = null;

    // Value returned by promise
    var value = null;

    // List of functions to call when promise transitions to fulfilled or
    // rejected state
    var pendingCallbacks = [];

    /**
     * Transitions the internal Promise to its final state and calls
     * registered callbacks so far.
     *
     * The function is returned by makePromise and thus represents a Promise
     * in the pending state. To fulfill or reject the Promise, simply call the
     * function with the appropriate first parameter.
     *
     * @function
     * @param {boolean} finalState Whether to fulfill or reject the promise
     * @param {*?} finalValue The fulfillment reason or rejection reason
     */
    var promise = function promise(finalState, finalValue) {
      if (state === null) {
        state = finalState;
        value = finalValue;
        defer(function () {
          utils.each(pendingCallbacks, function (fn) {
            fn();
          });
          pendingCallbacks = [];
        });
      }
    };

    /**
     * The "then" method allows one to access the current or eventual
     * fulfillment value of rejection reason of the Promise.
     *
     * @function
     * @param {function?} onFulfilled Callback method to call when Promise
     *  is resolved. Receives fulfillment value as first parameter.
     * @param {function?} onRejected Callback method to call when Promise
     *  is rejected. Receives rejection reason as first parameter.
     * @return {Promise} A Promise that gets fulfilled/rejected when callbacks
     *  are fulfilled/rejected.
     */
    promise.then = function (onFulfilled, onRejected) {
      var newPromise = makePromise();
      var callCallbacks = function () {
        try {
          var fn = (state ? onFulfilled : onRejected);
          if (utils.isFunction(fn)) {
            var response = fn.call(null, value);
            if (response && utils.isFunction(response.then)) {
              response.then(function (value) {
                newPromise(true, value);
              }, function (err) {
                newPromise(false, err);
              });
            }
            else {
              newPromise(true, response);
            }
          }
          else {
            newPromise(state, value);
          }
        }
        catch (err) {
          newPromise(false, err);
        }
      };
      if (state !== null) {
        defer(callCallbacks);
      }
      else {
        pendingCallbacks.push(callCallbacks);
      }
      return newPromise;
    };

    return promise;
  };

  // Expose the makePromise factory function
  return makePromise;
});