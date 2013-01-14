/**
 * @fileoverview Jasmine test runner for the Woodman's library
 *
 * The code uses demo snippets from the AMD Testing project:
 * https://github.com/geddesign/amd-testing
 * ... to make Jasmine and require.js work hand in hand.
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


// Retrieve the different suites of tests and run them, reporting results
// to the console.
requirejs([
  'spec/loglevel.spec',
  'spec/logevent.spec',
  'spec/layout.spec',
  'spec/appender.spec',
  'spec/logger.spec',
  'spec/loggercontext.spec',
  'spec/logmanager.spec'
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
      }
    });
  });

  jasmine.getEnv().execute();
});