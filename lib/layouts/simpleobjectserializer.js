/**
 * @fileoverview Simple generic object serializer.
 *
 * Returns a function that can be used to serialize an arbitrary object as a
 * string. The serialization is basic, returning the first level(s).
 */
/*global module*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function (require) {
  var Utils = require('../utils');

  function pad(number) {
    var r = String(number);
    if (r.length === 1) {
      r = '0' + r;
    }
    return r;
  }

  /**
   * Inner function that clones an object up to a certain depth.
   *
   * The function removes cyclic dependencies (simply because it duplicates
   * all keys and values), and drops functions. The returned object may thus
   * be serialized using JSON.stringify.
   *
   * Continuation dots strings are used to replace values that are truncated.
   *
   * @function
   * @param {Object} obj The object to copy
   * @param {number} depth The depth
   * @return {Object} A copy of the object at the specified depth
   */
  var copyObjectToDepth = function (obj, depth) {
    var clone = null;

    depth = (typeof depth !== 'undefined') ? depth : 1;
    if (typeof obj === 'undefined') return undefined;
    if (Utils.isString(obj)) {
      return obj;
    }
    else if (Utils.isDate(obj)) {
      return obj.getUTCFullYear() + '-' +
        pad(obj.getUTCMonth() + 1) + '-' +
        pad(obj.getUTCDate()) + 'T' +
        pad(obj.getUTCHours()) + ':' +
        pad(obj.getUTCMinutes()) + ':' +
        pad(obj.getUTCSeconds()) + '.' +
        String((obj.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5) +
        'Z';
    }
    if (depth <= 0) return '…';

    if (Utils.isArray(obj)) {
      clone = [];
      Utils.each(obj, function (val) {
        clone.push(copyObjectToDepth(val, depth-1));
      });
    }
    else if (Utils.isObject(obj)) {
      clone = {};
      Utils.each(obj, function (val, key) {
        clone[key] = copyObjectToDepth(val, depth-1);
      });
    }
    else if (Utils.isFunction(obj)) {
      clone = '[func]';
    }
    else {
      clone = obj;
    }

    return clone;
  };


  /**
   * Exposes a function that takes an object as input and returns a JSON
   * serialization of the object at the specified depth.
   *
   * @function
   * @param {Object|Array} obj The object to serialize
   * @param {number} depth The depth to go down to
   * @param {boolean} compact True to return a compact JSON string, false
   *  to return a human readable JSON string with carriage return and spaces
   * @return {string} The JSON serialization of the object
   */
  return function (obj, depth, compact) {
    var clone = copyObjectToDepth(obj, depth);
    if (compact) {
      return JSON.stringify(clone);
    }
    else {
      return JSON.stringify(clone, null, 2);
    }
  };
});