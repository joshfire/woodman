/**
 * @fileoverview Jasmine test runner for the Woodman's library
 *
 * The code uses demo snippets from the AMD Testing project:
 *   https://github.com/geddesign/amd-testing
 * ... to make Jasmine and require.js work hand in hand.
 *
 * The code also makes use of a couple of matchers from Uxebu's Jasmine
 * matchers project:
 *   https://github.com/uxebu/jasmine-matchers
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global global*/

var requirejs = require('requirejs');

// Ensure require's "define" and Jasmine's "describe", "it", and "expect"
// are globally available.
global.define = requirejs;
global.describe = require('./jasmine').describe;
global.it = require('./jasmine').it;
global.expect = require('./jasmine').expect;
global.spyOn = require('./jasmine').spyOn;
global.beforeEach = require('./jasmine').beforeEach;
global.jasmine = require('./jasmine').jasmine;


// Retrieve the different suites of tests and run them, reporting results
// to the console.
requirejs([
  'spec/loglevel.spec',
  'spec/logevent.spec',
  'spec/layout.spec',
  'spec/lifecycle.spec',
  'spec/appender.spec',
  'spec/logger.spec',
  'spec/loggercontext.spec',
  'spec/logmanager.spec',
  'spec/config.spec',
  'spec/patternlayout.spec'
], function () {

  var jasmine = require('./jasmine').jasmine;

  var ConsoleJasmineReporter2 = require('./consolereporter').ConsoleJasmineReporter;
  jasmine.getEnv().addReporter(new ConsoleJasmineReporter2());

  jasmine.getEnv().beforeEach(function () {
    this.addMatchers({
      /**
       * Returns true when object under scrutiny is a number
       */
      toBeNumber: function () {
        return typeof this.actual === 'number';
      },

      /**
       * Returns true when actual object is equal or greater than the provided
       * number
       */
      toEqualOrBeGreatherThan: function (expected) {
        return this.actual >= expected;
      },

      /**
       * Returns true when function has been called the expected number of times
       */
      toHaveBeenCalledXTimes: function (count) {
        var callCount = this.actual.callCount;
        var not = this.isNot ? 'NOT ' : '';
        this.message = function () {
          return 'Expected spy "' + this.actual.identity + '" ' + not +
            'to have been called ' + count + ' times, ' +
            'but was ' + callCount + '.';
        };
        return callCount === count;
      },

      /**
       * Returns true when actual object is in the children's array of the
       * expected object.
       */
      toBeChildOf: function (expected) {
        var children = expected.children || [];
        var i = 0;
        var not = this.isNot ? 'NOT ' : '';

        this.message = function () {
          return 'Expected "' + this.actual.name + '" ' + not +
            'to be child of ' + expected.name;
        };

        for (i = 0; i < children.length; i++) {
          if (children[i] === this.actual) return true;
        }
        return false;
      },

      /**
       * Returns true when actual object is the parent of the expected object.
       */
      toBeParentOf: function (expected) {
        var not = this.isNot ? 'NOT ' : '';

        this.message = function () {
          return 'Expected "' + this.actual.name + '" ' + not +
           'to be a parent of ' + expected.name;
        };

        return expected.parent === this.actual;
      },

      /**
       * Returns true when actual logger has the expected trace level
       */
      toHaveLevel: function (expected) {
        var not = this.isNot ? 'NOT ' : '';

        this.message = function () {
          return 'Expected "' + this.actual.name + '" ' + not +
            'to have trace level "' + expected + '", ' +
            'but was "' + this.actual.level + '"';
        };

        return this.actual.level === expected;
      }
    });
  });

  jasmine.getEnv().execute();
});