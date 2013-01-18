/**
 * @fileoverview Lays out a log event as a JSON string
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 *
 * This Layout borrows code from a similar class defined in the log4javascript
 * library. Copyright and license:
 *  Copyright 2012 Tim Down.
 *  Licensed under the Apache License, Version 2.0 (the "License")
 *  http://log4javascript.org/
 */
/*global module*/

// Ensure "define" is defined in node.js in the absence of require.js
// See: https://github.com/jrburke/amdefine
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([
  '../layout',
  './simpleobjectserializer'
], function (Layout, serializeObject) {
  /**
   * Lays out a log event as a JSON string
   *
   * @constructor
   * @extends {Layout}
   */
  var JSONLayout = function (config, loggerContext) {
    config = config || {};
    Layout.call(this, config, loggerContext);

    this.compact = config.compact || false;
    this.depth = config.depth || 2;
  };
  JSONLayout.prototype = new Layout();

  JSONLayout.prototype.toMessageString = function (evt) {
    return serializeObject(evt, this.depth, this.compact);
  };


  // Expose the constructor
  return JSONLayout;
});