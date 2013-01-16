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

define(['../layout'], function (Layout) {
  var escapeNewLines = function escapeNewLines(str) {
    return str.replace(/\r\n|\r|\n/g, "\\r\\n");
  };

  var toStr = function toStr(obj) {
    if (obj && obj.toString) {
      return obj.toString();
    } else {
      return String(obj);
    }
  };

  /**
   * Lays out a log event as a JSON string
   *
   * @constructor
   * @extends {Layout}
   */
  var JSONLayout = function (config, loggerContext) {
    Layout.call(this, config, loggerContext);
  };
  JSONLayout.prototype = new Layout();

  JSONLayout.prototype.toMessageString = function (evt) {
    var layout = this;
    var dataValues = this.getDataValues(evt, this.combineMessages);
    var str = "{" + this.lineBreak;
    var i, len;

    var formatValue = function formatValue(val, prefix, expand) {
      // Check the type of the data value to decide whether quotation marks
      // or expansion are required
      var formattedValue;
      var valType = typeof val;
      if (val instanceof Date) {
        formattedValue = String(val.getTime());
      } else if (expand && (val instanceof Array)) {
        formattedValue = "[" + layout.lineBreak;
        for (var i = 0, len = val.length; i < len; i++) {
          var childPrefix = prefix + layout.tab;
          formattedValue += childPrefix + formatValue(val[i], childPrefix, false);
          if (i < val.length - 1) {
            formattedValue += ",";
          }
          formattedValue += layout.lineBreak;
        }
        formattedValue += prefix + "]";
      } else if (valType !== "number" && valType !== "boolean") {
        formattedValue = "\"" + escapeNewLines(toStr(val).replace(/\"/g, "\\\"")) + "\"";
      } else {
        formattedValue = val;
      }
      return formattedValue;
    };

    for (i = 0, len = dataValues.length - 1; i <= len; i++) {
      str += this.tab + "\"" + dataValues[i][0] + "\"" + this.colon + formatValue(dataValues[i][1], this.tab, true);
      if (i < len) {
        str += ",";
      }
      str += this.lineBreak;
    }

    str += "}" + this.lineBreak;
    return str;
  };


  // Expose the constructor
  return JSONLayout;
});