/**
 * @fileoverview Tests for the Woodman precompiler lib
 */
/*global describe, it, expect*/

define(function () {
  var precompile = require('../../../precompile/precompile');
  var fs = require('fs');
  var base = 'test/spec/precompile/testfiles/';


  var getReftestFunction = function (reftest) {
    return function () {
      var input = reftest.input;
      if (input.match(/\.js$/)) {
        input = fs.readFileSync(base + reftest.input, 'utf8');
      }
      expect(input).toBeDefined();
      if (typeof input === 'undefined') return;
      
      var ref = reftest.ref;
      if (ref.match(/\.js$/)) {
        ref = fs.readFileSync(base + reftest.ref, 'utf8');
      }
      expect(ref).toBeDefined();
      if (typeof ref === 'undefined') return;

      var output = precompile(input, reftest.opts);
      expect(output).toBe(ref);
    };
  };

  describe('Precompilation', function () {

    var reftests = [
      {
        desc: 'removes a require("woodman") definition',
        input: 'var woodman = require("woodman");',
        ref: ''
      },

      {
        desc: 'leaves a require("blah") definition',
        input: 'var blah = require("blah");',
        ref: 'var blah = require("blah");'
      },
      {
        desc: 'removes the right require calls',
        input: 'var blah = require("blah");' +
          'var woodman = require("woodman");' +
          'var foo = require("foo");',
        ref: 'var blah = require("blah");' +
          'var foo = require("foo");'
      },

      {
        desc: 'removes reference in a define call',
        input: 'define(["blah", "woodman", "foo"], function (b, w, f) {});',
        ref: 'define(["blah", "", "foo"], function (b, w, f) {});'
      },

      {
        desc: 'removes call to woodman.initialize (global)',
        input: 'woodman.initialize({});',
        ref: ''
      },
      {
        desc: 'replaces call to woodman.start with callback (global)',
        input: 'woodman.start(function (err) {});',
        ref: '(function (err) {})()'
      },
      {
        desc: 'replaces call to woodman.load with callback (global)',
        input: 'woodman.load({}, function (err) {});',
        ref: '(function (err) {})()'
      },
      {
        desc: 'removes call to woodman.getLogger (global)',
        input: 'var logger = woodman.getLogger();',
        ref: ''
      },
      {
        desc: 'removes Woodman configuration variable (global)',
        input: 'var config = {};' +
          'woodman.initialize(config);',
        ref: ''
      },
      {
        desc: 'removes calls to trace functions (global)',
        input: 'var logger = woodman.getLogger("foo");' +
          'logger.log("blah", "foo");' +
          'logger.info("blah", "foo");' +
          'logger.warn("blah", "foo");' +
          'logger.error("blah", "foo");',
        ref: ''
      },

      {
        desc: 'removes call to woodman.initialize (require)',
        input: 'var wood = require("woodman");' +
          'wood.initialize({});',
        ref: ''
      },
      {
        desc: 'replaces call to woodman.start with callback (require)',
        input: 'var wood = require("woodman");' +
          'wood.start(function (err) {});',
        ref: '(function (err) {})();'
      },
      {
        desc: 'replaces call to woodman.load with callback (require)',
        input: 'var wood = require("woodman");' +
          'wood.load({}, function (err) {});',
        ref: '( function (err) {})();'
      },
      {
        desc: 'replaces call to woodman.load with callback (require)',
        input: 'var wood = require("woodman");' +
          'wood.load({}, function (err) {});',
        ref: '( function (err) {})();'
      },
      {
        desc: 'removes call to woodman.getLogger (require)',
        input: 'var wood = require("woodman");' +
          'var logger = wood.getLogger();',
        ref: ''
      },
      {
        desc: 'removes Woodman configuration variable (require)',
        input: 'var wood = require("woodman");' +
          'var config = {};' +
          'wood.initialize(config);',
        ref: ''
      },
      {
        desc: 'leaves call to getLogger that are not from Woodman (require)',
        input: 'var wood = require("woodman");' +
          'var config = {};' +
          'woodman.initialize(config);',
        ref: 'var config = {};' +
          'woodman.initialize(config);'
      },
      {
        desc: 'removes calls to trace functions (require)',
        input: 'var wood = require("woodman");' +
          'var logger = wood.getLogger("foo");' +
          'logger.log("blah", "foo");' +
          'logger.info("blah", "foo");' +
          'logger.warn("blah", "foo");' +
          'logger.error("blah", "foo");',
        ref: ''
      },
      {
        desc: 'removes calls to trace functions in woodman.start function (require)',
        input: 'var wood = require("woodman");' +
          'var logger = wood.getLogger("foo");' +
          'wood.start(function () {' +
          'logger.log("blah", "foo");' +
          'logger.info("blah", "foo");' +
          'logger.warn("blah", "foo");' +
          'logger.error("blah", "foo");' +
          '});',
        ref: '(function () {})();'
      },
      {
        desc: 'removes calls to trace functions in woodman.load function (require)',
        input: 'var wood = require("woodman");' +
          'var logger = wood.getLogger("foo");' +
          'wood.load({}, function () {' +
          'logger.log("blah", "foo");' +
          'logger.info("blah", "foo");' +
          'logger.warn("blah", "foo");' +
          'logger.error("blah", "foo");' +
          '});',
        ref: '( function () {})();'
      },

      {
        desc: 'returns the initial source if it does not reference Woodman',
        input: 'nowoodman.js',
        ref: 'nowoodman-ref.js'
      }
    ];


    reftests.forEach(function (reftest) {
      it(reftest.desc, getReftestFunction(reftest));
    });
  });
});