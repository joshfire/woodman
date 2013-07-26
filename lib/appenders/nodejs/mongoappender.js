/**
 * @fileoverview An Appender that delivers log events to a file.
 *
 * This appender only works in a node.js server-side environment.
 * It checks the presence of the "global" global variable and uses
 * "nodeRequire" to load node.js File System module if defined, or
 * "require" otherwise. The "nodeRequire" variable should be exposed by
 * the function that wraps the distribution when Woodman is built with
 * Almond, since Almond overrides "require" for its own purpose.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global module, global, rootRequire, process*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function (require) {
  var Appender = require('../../appender');
  // mongoose dependency
  // TODO find a way inject
  var mongoose = require('mongoose');
  var Schema   = mongoose.Schema;

  /**
   * Appends a log event to a mongo collection.
   *
   * @constructor
   * @extends {Appender}
   */
  var MongoAppender = function (config) {
    config = config || {};
    Appender.call(this, config);

    this.mongoUrl = config.mongoUrl;
    this.mongoCollectionName = config.mongoCollectionName;

    /**
     * True to log strings instead of objects
     */
    this.appendStrings = (typeof config.appendStrings !== 'undefined') ?
      config.appendStrings :
      true;

  };
  MongoAppender.prototype = new Appender();

  /**
   * Appends the given event to the underlying mongo collection.
   *
   * This function needs to be overridden in concrete appenders.
   *
   * @function
   * @param {LogEvent} evt The logger event to append
   */
  MongoAppender.prototype.doAppend = function (evt) {
    var layout = this.getLayout();
    var message = null;

    if (this.appendStrings) {
      message = layout.toMessageString(evt);
    }
    else {
      evt = layout.toLogEvent(evt);
      if (layout.compactObjects || layout.compact) {
        message = JSON.stringify(evt);
      }
      else {
        message = JSON.stringify(evt, null, 2);
      }
    }
    // standard line ending on Windows platform is \r\n, instead of \n
    // on unix based systems.
    if (process.platform === 'win32') {
      message = message.replace(/\n/g,'\r\n');
    }

    // log into mongo

    var bm = new this.Log({
      name: evt.name,
      level: evt.level,
      message:message
    });

    bm.save(function(err, log) {
      // TODO : log somewhere in console by example
      // console.info('test');
      //if (err) console.log('failed save log in mongo '+log);
    });
  };

  /**
   * Opens mongo connexion
   */
  MongoAppender.prototype.start = function (callback) {
    callback = callback || function () {};

    if (this.isStarted()) return callback();

    // Connection
    var db = mongoose.createConnection(this.mongoUrl);

    mongoose.connection.on('error', function(error) {
        this.started = false;
        return callback('Can not connect to mongo instance'+error);
      });

    db.on('error', function(err) {
      return callback('Error while connecting to mongo instance'+err);
    });

    var self = this;

    db.once('open', function callback () {

      var LogSchema = new Schema({
        name: { type: String, required: false },
        level: { type: String, required: false },
        message: { type: String, required: false },
        creation: { type: Date}
      }, { collection: self.mongoCollectionName });

      self.Log = db.model('Log', LogSchema);
      self.started = true;
      return callback();
    });
  };

  /**
   * Closes
   */
  MongoAppender.prototype.stop = function (callback) {    
    callback = callback || function () {};
    this.started = false;
    // nothing needed here for mongo
  };

  return MongoAppender;
});
