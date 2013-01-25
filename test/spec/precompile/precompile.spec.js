/**
 * @fileoverview Tests for the Woodman precompiler lib
 */
/*global describe, it, expect*/

define(function () {
  var precompile = require('../../../precompile/precompile');
  var fs = require('fs');
  var base = 'test/spec/precompile/testfiles/';

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
        desc: 'removes reference to Woodman in a define call',
        input: 'define(["blah", "woodman", "foo"], function (b, w, f) {});',
        ref: 'define(["blah", "", "foo"], function (b, w, f) {});'
      },

      {
        desc: 'removes call to woodman.initialize (global)',
        input: 'woodman.initialize({});',
        ref: ''
      },
      {
        desc: 'removes call to woodman.initialize (require)',
        input: 'var wood = require("woodman");' +
          'wood.initialize({});',
        ref: ''
      },

      {
        desc: 'replaces call to woodman.start with callback (global)',
        input: 'woodman.start(function (err) {});',
        ref: '(function (err) {})()'
      },
      {
        desc: 'replaces call to woodman.start with callback (require)',
        input: 'var wood = require("woodman");' +
          'wood.start(function (err) {});',
        ref: '(function (err) {})();'
      },

      {
        desc: 'replaces call to woodman.load with callback (global)',
        input: 'woodman.load({}, function (err) {});',
        ref: '(function (err) {})()'
      },
      {
        desc: 'replaces call to woodman.load with callback (require)',
        input: 'var wood = require("woodman");' +
          'wood.load({}, function (err) {});',
        ref: '( function (err) {})();'
      },

      {
        desc: 'removes logger declaration (global)',
        input: 'var logger = woodman.getLogger();',
        ref: ''
      },
      {
        desc: 'removes logger declaration (require)',
        input: 'var wood = require("woodman");' +
          'var logger = wood.getLogger();',
        ref: ''
      },

      {
        desc: 'removes logger declaration whatever its name (global)',
        input: 'var log = woodman.getLogger();' +
          'var woody = woodman.getLogger();',
        ref: ''
      },
      {
        desc: 'removes logger declaration whatever its name (require)',
        input: 'var wood = require("woodman");' +
          'var log = wood.getLogger();' +
          'var woody = wood.getLogger();',
        ref: ''
      },

      {
        desc: 'nulls logger declaration among other declarations (global)',
        input: 'var blah = {}, woodman = woodman.getLogger(), foo = "baz";',
        ref: 'var blah = {}, woodman = null, foo = "baz";'
      },
      {
        desc: 'nulls logger declaration among other declarations (require)',
        input: 'var wood = require("woodman");' +
          'var blah = {}, woodman = wood.getLogger(), foo = "baz";',
        ref: 'var blah = {}, woodman = null, foo = "baz";'
      },

      {
        desc: 'removes logger declaration if assigned on different line (global)',
        input: 'var logger;' +
          'logger = woodman.getLogger("foo");',
        ref: ''
      },
      {
        desc: 'removes logger declaration if assigned on different line (require)',
        input: 'var wood = require("woodman");' +
          'var logger;' +
          'logger = woodman.getLogger("foo");',
        ref: ''
      },

      {
        desc: 'removes Woodman configuration variable (global)',
        input: 'var config = {};' +
          'woodman.initialize(config);',
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
        desc: 'removes calls to trace functions (global)',
        input: 'var logger = woodman.getLogger("foo");' +
          'logger.log("blah", "foo");' +
          'logger.info("blah", "foo");' +
          'logger.warn("blah", "foo");' +
          'logger.error("blah", "foo");',
        ref: ''
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
        desc: 'leaves call to initialize if Woodman used with "require"',
        input: 'var wood = require("woodman");' +
          'var config = {};' +
          'woodman.initialize(config);',
        ref: 'var config = {};' +
          'woodman.initialize(config);',
        options: {
          require: true
        }
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
        desc: 'removes direct calls to trace functions (global)',
        input: 'woodman.getLogger("foo").log("info");',
        ref: ''
      },
      {
        desc: 'removes direct calls to trace functions (require)',
        input: 'var wood = require("woodman");' +
          'wood.getLogger().log("blah");',
        ref: ''
      },

      {
        desc: 'returns the initial source if it does not reference Woodman',
        input: 'nowoodman.js',
        ref: 'nowoodman-ref.js'
      }
    ];


    reftests.forEach(function (reftest) {
      it(reftest.desc, function () {
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
      });
    });
  });
});