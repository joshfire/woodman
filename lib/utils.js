/**
 * @fileoverview A few utility functions extracted from Underscore
 *
 * Underscore.js 1.3.3
 * (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Underscore is freely distributable under the MIT license.
 * Portions of Underscore are inspired or borrowed from Prototype,
 * Oliver Steele's Functional, and John Resig's Micro-Templating.
 * For all details and documentation:
 */
/*global toString, module*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function () {
  /**
   * Returns true when given variable is an array
   */
  var isArray = Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
  };

  /**
   * Returns true when given variable is a string
   */
  var isString = function (obj) {
    return toString.call(obj) === '[object String]';
  };


  /**
   * Returns true when given variable is an object
   */
  var isObject = function (obj) {
    return obj === Object(obj);
  };

  /**
   * Returns true when given variable is a function
   */
  var isFunction = function (obj) {
    return toString.call(obj) === '[object Function]';
  };

  /**
   * Returns true when given variable is a date
   */
  var isDate = function(obj) {
    return toString.call(obj) === '[object Date]';
  };


  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = function (obj, iterator, context) {
    if (!obj) return;
    if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker
          ) return;
      }
    } else {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  var map = function (obj, iterator, context) {
    var results = [];
    if (!obj) return results;
    if (Array.prototype.map && obj.map === Array.prototype.map) {
      return obj.map(iterator, context);
    }
    each(obj, function (value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };


  // Expose utility functions defined above
  return {
    isArray: isArray,
    isString: isString,
    isObject: isObject,
    isFunction: isFunction,
    isDate: isDate,
    each: each,
    map: map
  };
});