/**
 * @fileoverview Simple generic object serializer.
 *
 * Returns a function that can be used to serialize an arbitrary object as a
 * string. The serialization is basic, returning the first level(s)
 */
/*global module*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['../utils'], function (Utils) {

  var serializeLevel = function serializeLevel (obj, depth) {
    depth = (typeof depth !== 'undefined') ? depth : 1;

    var str = '';
    var hasKey = false;

    if (typeof obj === 'undefined') return '[undefined]';
    if (depth === 0) return '[...]';
    if (Utils.isArray(obj)) {
      str += '[';
      Utils.each(obj, function (val, idx) {
        if (idx > 0) str += ', ';
        str += serializeLevel(val, depth-1);
      });
      str += ']';
    }
    else if (Utils.isString(obj)) {
      str += '"' + obj.replace(/"/g, '\\"') + '"';
    }
    else if (Utils.isObject(obj)) {
      str += '{';
      hasKey = false;
      Utils.each(obj, function (val, key) {
        str += key + ': ' + serializeLevel(val, depth-1) + ', ';
        hasKey = true;
      });
      if (hasKey) {
        str = str.substring(0, str.length - 2);
      }
      str += '}';

    }
    else if (Utils.isFunction(obj)) {
      str += '[func]';
    }
    else {
      str += obj;
    }

    return str;
  };

  return function (obj, depth) {
    return serializeLevel(obj, depth);
  };
});