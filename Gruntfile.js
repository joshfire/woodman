/*global module:false*/
module.exports = function (grunt) {

  grunt.initConfig({
    /**
     * Variable initialized with the contents of the package.json file
     */
    pkg: grunt.file.readJSON('package.json'),

    /**
     * Meta information used in different tasks
     */
    meta: {
      /**
       * Copyright and license banner
       */
      woodman: 'Woodman - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' MIT license\n' +
        ' <%= pkg.homepage %>\n',
      log4j: 'Based on Apache Log4j 2\n' +
        ' Copyright © 1999-2013 Apache Software Foundation. All Rights Reserved.\n' +
        ' Apache License, Version 2.0\n' +
        ' http://logging.apache.org/log4j/2.x/\n',
      requirejs: 'Built with RequireJS optimizer r.js 2.1.2\n' +
        ' Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.\n' +
        ' new BSD or MIT licensed\n' +
        ' http://github.com/jrburke/requirejs\n',
      almond: 'Includes Almond 0.2.3\n' +
        ' Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved\n' +
        ' Available via the MIT or new BSD license\n' +
        ' http://github.com/jrburke/almond\n',
      socketio: 'Includes Socket.IO.js build:0.9.11, development\n' +
        ' Copyright(c) 2011 LearnBoost <dev@learnboost.com>\n' +
        ' MIT Licensed\n',
      log4javascript: 'Portions adapted from log4javascript\n' +
        ' Copyright Tim Down\n' +
        ' Apache License, Version 2.0\n' +
        ' http://log4javascript.org/\n',
      fullBanner: '/*!\n' +
        '<%= meta.woodman %>' +
        '\n<%= meta.log4j %>' +
        '\n<%= meta.requirejs %>' +
        '\n<%= meta.almond %>' +
        '\n<%= meta.socketio %>' +
        '\n<%= meta.log4javascript %>' +
        '*/\n',
      disabledBanner: '/*!\n' +
        '<%= meta.woodman %>' +
        '\n<%= meta.log4j %>' +
        '\n<%= meta.requirejs %>' +
        '*/\n',
      consoleBanner: '/*!\n' +
        '<%= meta.woodman %>' +
        '\n<%= meta.log4j %>' +
        '\n<%= meta.requirejs %>' +
        '\n<%= meta.almond %>' +
        '\n<%= meta.log4javascript %>' +
        '*/\n'
    },


    /**
     * Ensures source code follows code guidelines
     */
    jshint: {
      options: {
        indent: 2,
        evil: true,
        regexdash: true,
        browser: true,
        wsh: false,
        trailing: true,
        sub: true,
        undef: true,
        eqeqeq: true,
        unused: true,
        predef: [
          'require'
        ]
      },
      all: [
        'Gruntfile.js',
        'lib/**/*.js'
      ]
    },


    /**
     * Woodman compilation task (using require.js optimizer)
     *
     * There are a number of distributions available. Differences between
     * distributions include:
     * - the list of appenders and layouts supported by default
     * - how the Woodman library gets exposed to the global scope
     * (global variable, named AMD module, anonymous AMD module)
     */
    requirejs: {
      /**
       * Global standalone distribution that includes all known appenders and
       * layouts. Some of them may not work depending on the environment under
       * which the distribution is run.
       *
       * The Woodman library is exposed as:
       * - window.woodman (client-side) or to the global "this" scope (node.js)
       * - an anonymous AMD module if "define" is defined
       * - a node.js module if "module" is defined
       *
       * Note the "require" call with the fourth parameter set to "true" to
       * force synchronous load of modules. Also note that the call to "define"
       * is made outside at the global level (instead of within the "require"
       * callback) because RequireJS r.js optimizer would miss it otherwise
       * if it is run against that distribution (to build an app that uses
       * Woodman).
       */
      woodman: {
        options: {
          wrap: {
            start: '/*! Full distribution */\n' +
              '(function (root, rootRequire, rootModule) {\n',
            end: 'require(["./woodman"], function (woodman) {\n' +
              '  if (root) root.woodman = woodman;\n' +
              '  if (rootModule) rootModule.exports = woodman;\n' +
              '}, null, true);\n' +
              '}(((typeof window !== "undefined") ? window : this),' +
              ' ((typeof require === "function") ? require : null),' +
              ' ((typeof module !== "undefined") ? module : null)' +
              '));\n' +
              'if (typeof define === "function") {\n' +
              '  define([], ((typeof window !== "undefined") ? window : this).woodman);\n' +
              '};'
          },
          baseUrl: 'lib/',
          name: '../deps/almond',
          include: ['woodman'],
          out: 'dist/woodman.js',
          preserveLicenseComments: false,
          optimize: 'uglify'
        }
      },

      /**
       * Same as above but the Woodman library is only exposed as an anonymous
       * AMD module.
       *
       * In particular, the library does not leak anything to the global scope
       * in that distribution (but "define" needs to be defined).
       */
      'woodman-amd': {
        options: {
          wrap: {
            start: '/*! Full distribution, AMD module */\n' +
              '(function (rootRequire) {\n' +
              '  define([], function () {\n',
            end: '    var woodman = null;\n' +
              '    require(["./woodman"], function (wood) {\n' +
              '      woodman = wood;\n' +
              '    }, null, true);\n' +
              '    return woodman;\n' +
              '  });\n' +
              '})((typeof require === "function") ? require : null);'
          },
          baseUrl: 'lib/',
          name: '../deps/almond',
          include: ['woodman'],
          out: 'dist/woodman-amd.js',
          preserveLicenseComments: false,
          optimize: 'uglify'
        }
      },

      /**
       * Standalone distribution for browsers. Available appenders are those
       * that run in Web browsers.
       *
       * The Woodman library is exposed as window.woodman in that distribution.
       */
      browser: {
        options: {
          wrap: {
            start: '/*! Browser distribution */\n' +
              '(function () {\n',
            end: '  require(["./woodman-browser"], function (woodman) {' +
              '    window.woodman = woodman;\n' +
              '  }, null, true);\n' +
              '}());'
          },
          baseUrl: 'lib/',
          name: '../deps/almond',
          include: ['woodman-browser'],
          out: 'dist/woodman-browser.js',
          preserveLicenseComments: false,
          optimize: 'uglify'
        }
      },

      /**
       * Same as above but the Woodman library is only exposed as an anonymous
       * AMD module.
       *
       * In particular, the library does not leak anything to the global scope
       * in that distribution (but "define" needs to be defined).
       */
      'browser-amd': {
        options: {
          wrap: {
            start: '/*! Browser distribution, AMD module */\n' +
              'define([], function () {\n',
            end: '  var woodman = null;\n' +
              '  require(["./woodman-browser"], function (wood) {\n' +
              '    woodman = wood;\n' +
              '  }, null, true);\n' +
              '  return woodman;\n' +
              '});'
          },
          baseUrl: 'lib/',
          name: '../deps/almond',
          include: ['woodman-browser'],
          out: 'dist/woodman-browser-amd.js',
          preserveLicenseComments: false,
          optimize: 'uglify'
        }
      },

      /**
       * Standalone compilation for execution in node.js. Available appenders
       * are those that run in the node.js environment.
       *
       * The Woodman library is exposed as a regular node.js module.
       */
      node: {
        options: {
          wrap: {
            start: '/*! Node.js distribution */\n' +
              '(function(rootRequire) {\n',
            end: '  require(["./woodman-node"], function (woodman) {\n' +
              '    module.exports = woodman;\n' +
              '  }, null, true);\n' +
              '}(require));'
          },
          baseUrl: 'lib/',
          name: '../deps/almond',
          include: ['woodman-node'],
          out: 'dist/woodman-node.js',
          preserveLicenseComments: false,
          optimize: 'uglify'
        }
      },


      /**
       * Same as above but the Woodman library is only exposed as an anonymous
       * AMD module.
       */
      'node-amd': {
        options: {
          wrap: {
            start: '/*! Node.js distribution, AMD module */\n' +
              '(function (rootRequire) {\n' +
              '  define([], function () {\n',
            end: '    var woodman = null;\n' +
              '    require(["./woodman-node"], function (wood) {\n' +
              '      woodman = wood;\n' +
              '    }, null, true);\n' +
              '    return woodman;\n' +
              '  });\n' +
              '})((typeof require === "function") ? require : null);'
          },
          baseUrl: 'lib/',
          name: '../deps/almond',
          include: ['woodman-node'],
          out: 'dist/woodman-node-amd.js',
          preserveLicenseComments: false,
          optimize: 'uglify'
        }
      },

      /**
       * Standalone minimal distribution that only supports the "Console"
       * appender.
       *
       * In particular, the library does not leak anything to the global scope
       * in that distribution (but "define" needs to be defined).
       */
      'woodman-console': {
        options: {
          wrap: {
            start: '/*! Console-only distribution */\n' +
              '(function (root, rootRequire, rootModule) {\n',
            end: 'require(["./woodman-console"], function (woodman) {\n' +
              '  if (root) root.woodman = woodman;\n' +
              '  if (rootModule) rootModule.exports = woodman;\n' +
              '}, null, true);\n' +
              '}(((typeof window !== "undefined") ? window : this),' +
              ' ((typeof require === "function") ? require : null),' +
              ' ((typeof module !== "undefined") ? module : null)' +
              '));\n' +
              'if (typeof define === "function") {\n' +
              '  define([], ((typeof window !== "undefined") ? window : this).woodman);\n' +
              '};'
          },
          baseUrl: 'lib/',
          name: '../deps/almond',
          include: ['woodman-console'],
          out: 'dist/woodman-console.js',
          preserveLicenseComments: false,
          optimize: 'uglify'
        }
      },

      /**
       * Global standalone distribution that only includes Woodman's "disabled"
       * shim, for use in production environments instead of the generic Woodman
       * distribution to suppress all traces.
       */
      disabled: {
        options: {
          wrap: {
            start: '/*! Disabled distribution */\n' +
              '(function (root, rootRequire, rootModule) {\n',
            end: 'require(["./woodman-disabled"], function (woodman) {\n' +
              '  if (root) root.woodman = woodman;\n' +
              '  if (rootModule) rootModule.exports = woodman;\n' +
              '}, null, true);\n' +
              '}(((typeof window !== "undefined") ? window : this),' +
              ' ((typeof require === "function") ? require : null),' +
              ' ((typeof module !== "undefined") ? module : null)' +
              '));\n' +
              'if (typeof define === "function") {\n' +
              '  define([], ((typeof window !== "undefined") ? window : this).woodman);\n' +
              '};'
          },
          baseUrl: 'lib/',
          name: '../deps/almond',
          include: ['woodman-disabled'],
          out: 'dist/woodman-disabled.js',
          preserveLicenseComments: false,
          optimize: 'uglify'
        }
      }
    },


    /**
     * Adds Copyright and license banner to all distributions
     */
    concat: {
      options: {
        stripBanners: true,
        banner: '<%= meta.fullBanner %>'
      },
      woodman: {
        src: 'dist/woodman.js',
        dest: 'dist/woodman.js'
      },
      'woodman-amd': {
        src: 'dist/woodman-amd.js',
        dest: 'dist/woodman-amd.js'
      },
      browser: {
        src: 'dist/woodman-browser.js',
        dest: 'dist/woodman-browser.js'
      },
      'browser-amd': {
        src: 'dist/woodman-browser-amd.js',
        dest: 'dist/woodman-browser-amd.js'
      },
      node: {
        src: 'dist/woodman-node.js',
        dest: 'dist/woodman-node.js'
      },
      'node-amd': {
        src: 'dist/woodman-node-amd.js',
        dest: 'dist/woodman-node-amd.js'
      },
      'woodman-console': {
        options: {
          banner: '<%= meta.consoleBanner %>'
        },
        src: 'dist/woodman-console.js',
        dest: 'dist/woodman-console.js'
      },
      disabled: {
        options: {
          banner: '<%= meta.disabledBanner %>'
        },
        src: 'dist/woodman-disabled.js',
        dest: 'dist/woodman-disabled.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('build', ['jshint', 'requirejs', 'concat']);
  grunt.registerTask('default', 'build');
};
