/**
 * @fileoverview Tests for the Woodman precompiler lib
 */
/*global define, describe, it, expect*/

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
        ref: 'define(["blah", \'require\', "foo"], function (b, w, f) {});'
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
        desc: 'removes call to woodman.initialize (amd)',
        input: 'define(["woodman"], function (wood) {' +
          'wood.initialize({});' +
          '});',
        ref: 'define([\'require\'], function (wood) {});'
      },

      {
        desc: 'removes call to woodman.start (global)',
        input: 'woodman.start();',
        ref: ''
      },
      {
        desc: 'removes call to woodman.start (require)',
        input: 'var wood = require("woodman");' +
          'wood.start();',
        ref: ''
      },
      {
        desc: 'removes call to woodman.start (amd)',
        input: 'define(["woodman"], function (wood) {' +
          'wood.start();' +
          '});',
        ref: 'define([\'require\'], function (wood) {});'
      },

      {
        desc: 'replaces call to woodman.start with callback (global)',
        input: 'woodman.start(function (err) {});',
        ref: '(function (err) {})();'
      },
      {
        desc: 'replaces call to woodman.start with callback (require)',
        input: 'var wood = require("woodman");' +
          'wood.start(function (err) {});',
        ref: '(function (err) {})();'
      },
      {
        desc: 'replaces call to woodman.start with callback (amd)',
        input: 'define(["woodman"], function (wood) {' +
          'wood.start(function (err) {});' +
          '});',
        ref: 'define([\'require\'], function (wood) {(function (err) {})();});'
      },

      {
        desc: 'removes call to woodman.load (global)',
        input: 'woodman.load({});',
        ref: ''
      },
      {
        desc: 'removes call to woodman.load (require)',
        input: 'var wood = require("woodman");' +
          'wood.load({});',
        ref: ''
      },
      {
        desc: 'removes call to woodman.load (amd)',
        input: 'define(["woodman"], function (wood) {' +
          'wood.load({});' +
          '});',
        ref: 'define([\'require\'], function (wood) {});'
      },

      {
        desc: 'replaces call to woodman.load with callback (global)',
        input: 'woodman.load({}, function (err) {});',
        ref: '(function (err) {})();'
      },
      {
        desc: 'replaces call to woodman.load with callback (require)',
        input: 'var wood = require("woodman");' +
          'wood.load({}, function (err) {});',
        ref: '(function (err) {})();'
      },
      {
        desc: 'replaces call to woodman.load with callback (amd)',
        input: 'define(["woodman"], function (wood) {' +
          'wood.load({}, function (err) {});' +
          '});',
        ref: 'define([\'require\'], function (wood) {(function (err) {})();});'
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
        desc: 'removes logger declaration (amd)',
        input: 'define(["woodman"], function (wood) {' +
          'var logger = wood.getLogger();' +
          '});',
        ref: 'define([\'require\'], function (wood) {});'
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
        desc: 'removes logger declaration whatever its name (amd)',
        input: 'define(["woodman"], function (wood) {' +
          'var log = wood.getLogger();' +
          'var woody = wood.getLogger();' +
          '});',
        ref: 'define([\'require\'], function (wood) {});'
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
        desc: 'nulls logger declaration among other declarations (amd)',
        input: 'define(["woodman"], function (wood) {' +
          'var blah = {}, woodman = wood.getLogger(), foo = "baz";' +
          '});',
        ref: 'define([\'require\'], function (wood) {' +
          'var blah = {}, woodman = null, foo = "baz";' +
          '});'
      },

      {
        desc: 'leaves logger declaration if assigned on different line (global)',
        input: 'var logger;' +
          'logger = woodman.getLogger("foo");',
        ref: 'var logger;'
      },
      {
        desc: 'leaves logger declaration if assigned on different line (require)',
        input: 'var wood = require("woodman");' +
          'var logger;' +
          'logger = wood.getLogger("foo");',
        ref: 'var logger;'
      },
      {
        desc: 'leaves logger declaration if assigned on different line (amd)',
        input: 'define(["woodman"], function (wood) {' +
          'var logger;' +
          'logger = wood.getLogger("foo");' +
          '});',
        ref: 'define([\'require\'], function (wood) {' +
          'var logger;' +
          '});'
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
        desc: 'removes Woodman configuration variable (amd)',
        input: 'define(["woodman"], function (wood) {' +
          'var config = {};' +
          'wood.initialize(config);' +
          '});',
        ref: 'define([\'require\'], function (wood) {' +
          '});'
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
        desc: 'removes calls to trace functions (amd)',
        input: 'define(["woodman"], function (wood) {' +
          'var logger = wood.getLogger("foo");' +
          'logger.log("blah", "foo");' +
          'logger.info("blah", "foo");' +
          'logger.warn("blah", "foo");' +
          'logger.error("blah", "foo");' +
          '});',
        ref: 'define([\'require\'], function (wood) {' +
          '});'
      },

      {
        desc: 'leaves call to initialize if "woodman" not in globalNames',
        input: 'var wood = require("woodman");' +
          'var config = {};' +
          'wood.initialize({});' +
          'woodman.initialize(config);',
        ref: 'var config = {};' +
          'woodman.initialize(config);',
        options: {
          globalNames: []
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
        ref: '(function () {})();'
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
        desc: 'removes direct calls to trace functions (amd)',
        input: 'define(["woodman"], function (wood) {' +
          'wood.getLogger().log("blah");' +
          '});',
        ref: 'define([\'require\'], function (wood) {' +
          '});'
      },

      {
        desc: 'removes the Woodman library if found (amd)',
        input: 'define("woodman", function (wood) {' +
          '});',
        ref: ''
      },

      {
        desc: 'returns the initial source if it does not reference Woodman',
        input: 'nowoodman.js',
        ref: 'nowoodman-ref.js'
      },

      {
        desc: 'manages scopes correctly',
        input: 'scopes.js',
        ref: 'scopes-ref.js'
      },
      {
        desc: 'turns code into comments if so requested',
        input: 'scopes.js',
        ref: 'scopes-comments-ref.js',
        options: {
          comment: true
        }
      },
      {
        desc: 'detects configuration objects in load calls correctly',
        input: 'load.js',
        ref: 'load-ref.js'
      }
    ];

    // reftests = reftests.slice(reftests.length - 1, reftests.length);
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

        var output = precompile(input, reftest.options);
        expect(output).toBe(ref);
      });
    });
  });
});