/**
 * @fileoverview Internal structure used to represent a message to log.
 *
 * The structure is created by the "trace" function of a Logger instance and
 * passed to the created LogEvent instance. Layouts retrieve the Message
 * through the "LogEvent.getMessage" and should call the getFormattedMessage
 * function to serialize the message as a string.
 *
 * Note the "trace" function directly uses the Message instance it receives
 * as argument if the the user decided to create its own Message, for instance
 * something like:
 *  logger.log(new Message('yeepee'));
 *
 * This only really makes sense if the user creates an instance of a class that
 * inherits from Message and exposes additional serialization functionalities,
 * for instance with a hypothetical HellogMessage that takes a user to issue
 * a "hello Robert" message:
 *  logger.log(new HelloMessage(user));
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

define(function (require) {
  var utils = require('./utils');
  var serializeObject = require('./layouts/simpleobjectserializer');

  /**
   * Definition of the Message class.
   *
   * If the first parameter in the message is a string that contains "{}", it
   * is taken to be a format string, and the getFormattedMessage function will
   * substitute the occurrences of "{}" with the serialization of the other
   * parameters in order.
   *
   * @constructor
   * @param {(string|Object|Array.<(string|Object)>)} params The parameters
   *  that compose the message.
   */
  var Message = function (params) {
    this.formatString = '';
    this.params = [];

    if (!params) {
      return;
    }

    params = utils.isArray(params) ? params : [params];
    if ((params.length > 0) &&
        utils.isString(params[0]) &&
        (params[0].indexOf('{}') !== -1)) {
      this.formatString = params[0];
      this.params = params.slice(1);
    }
    else {
      this.params = params;
    }
  };


  /**
   * Serializes the message to a string.
   *
   * The function tries to do the "right" thing with objects. If the object
   * exposes a "toString" method that is different from the basic
   * "Object.prototype.toString" method, it calls that function to serialize
   * the object. If that's not the case, it uses the Object serializer to
   * output the first levels of the objects.
   *
   * If the message contains a format string, the function substitutes the
   * occurrences of "{}" with the message parameters.
   *
   * It completes the string with the concatenation of the serialization of
   * remaining parameters separated by a space.
   *
   * @function
   * @param {Object?} options Serialization options. Use "separator" to specify
   *  the parameter separator (default is space), "compactObjects" to force
   *  serialized objects to be in a compact form (default is false),
   *  "objectDepth" to specify the depth up to which objects should be
   *  serialized (default is 2).
   * @return {string} The message formatted as a string
   */
  Message.prototype.getFormattedMessage = function (options) {
    options = options || {};
    options.separator = utils.isString(options.separator) ?
      options.separator :
      ' ';
    var formatted = this.getFormattedParams(options);
    return formatted.join(options.separator);
  };


  /**
   * Serializes the message parameters to an array of strings or objects.
   *
   * The function tries to do the "right" thing with objects. If the object
   * exposes a "toString" method that is different from the basic
   * "Object.prototype.toString" method, it calls that function to serialize
   * the object. If that's not the case, it uses the Object serializer to
   * output the first levels of the objects.
   *
   * If the message contains a format string, the function substitutes the
   * occurrences of "{}" with the message parameters.
   *
   * It completes the string with the concatenation of the serialization of
   * remaining parameters separated by a space.
   *
   * @function
   * @param {Object?} options Serialization options. Use "separator" to specify
   *  the parameter separator (default is space), "compactObjects" to force
   *  serialized objects to be in a compact form (default is false),
   *  "objectDepth" to specify the depth up to which objects should be
   *  serialized (default is 2), "preserveObjects" to leave objects untouched.
   * @return {Array<string|Object>} Message parameters formatted as an array of
   *  strings (or objects if "preserveObjects" option is set)
   */
  Message.prototype.getFormattedParams = function (options) {
    options = options || {};
    options.separator = utils.isString(options.separator) ?
      options.separator :
      ' ';
    options.compactObjects = options.compactObjects || false;
    options.objectDepth = options.objectDepth || 2;

    var currentParamIndex = 0;
    var currentParam = 0;
    var len = this.params.length;
    var message = '';
    var formatted = [];
    var substOptions = {
      compactObjects: options.compactObjects,
      objectDepth: options.objectDepth
    };

    // Loop on occurrences of "{}" and replace them with the
    // right parameter
    var lastPos = 0;
    var substPos = this.formatString.indexOf('{}');
    while (substPos !== -1) {
      message += this.formatString.substring(lastPos, substPos);
      if (currentParamIndex < len) {
        currentParam = this.params[currentParamIndex];
        message += this.getFormattedParam(currentParam, substOptions);
      }
      currentParamIndex +=1;
      lastPos = substPos + 2;
      substPos = this.formatString.indexOf('{}', lastPos);
    }

    // Let's not forget the last part of the format string (#13)
    message += this.formatString.substring(lastPos);
    if (message) {
      formatted.push(message);
    }

    // Complete the message with remaining parameters if any
    for (true; currentParamIndex < len; currentParamIndex++) {
      currentParam = this.params[currentParamIndex];
      formatted.push(this.getFormattedParam(currentParam, options));
    }

    return formatted;
  };


  /**
   * Serializes a message parameter as a string.
   *
   * The function tries to do the "right" thing when param is an object.
   * If its "toString" method has been overloaded, it calls that method.
   * It serializes the object using "serializeObject" otherwise.
   *
   * @function
   * @param {*} param The message parameter to serialize
   * @param {Object?} options Serialization options. Use "compactObjects" to
   *  force serialized objects to be in a compact form (default is false),
   *  "objectDepth" to specify the depth up to which objects should be
   *  serialized (default is 2).
   * @return {string} The parameter serialized as a string.
   */
  Message.prototype.getFormattedParam = function (param, options) {
    options = options || {};
    options.objectDepth = options.objectDepth || 2;

    if (utils.isString(param)) {
      return param;
    }
    else if (options.preserveObjects && utils.isObject(param)) {
      return param;
    }
    else if (param && param.toString &&
        (param.toString !== Object.prototype.toString)) {
      return param.toString();
    }
    else {
      return serializeObject(param,
        options.objectDepth, options.compactObjects);
    }
  };


  /**
   * Retrieves the message parameters, if any
   *
   * @function
   * @return {Array} The message parameters or an empty array
   */
  Message.prototype.getParameters = function () {
    return this.params;
  };


  /**
   * Retrieves the format string, if any
   *
   * @function
   * @return {string} The format string or an empty string.
   */
  Message.prototype.getFormat = function () {
    return this.formatString;
  };


  // Expose the Message constructor
  return Message;
});