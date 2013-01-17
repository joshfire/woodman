/*global module:false*/
module.exports = function (grunt) {

  grunt.initConfig({
    /**
     * Variable initialized with the contents of the package.json file
     */
    pkg: '<json:package.json>',

    /**
     * Meta information used in different tasks
     */
    meta: {
      /**
       * Copyright and license banner
       */
      banner: '/*! Woodman - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> - ' +
        '<%= pkg.homepage %>\n' +
        'Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' MIT license\n' +
        'Based on log4j v2.0: http://logging.apache.org/log4j/2.x/\n' +
        'Portions adapted from log4javascript: http://log4javascript.org/ (copyright Tim Down, Apache License, Version 2.0) ' +
        '*/'
    },
    lint: {
      files: [
        'grunt.js',
        'lib/**/*.js',
        'test/runner.js',
        'test/spec/*.js'
      ]
    },
    test: {
      files: [
        'test/**/*.js'
      ]
    },
    concat: {
      browser: {
        src: ['<banner:meta.banner>', '<file_strip_banner:dist/woodman-browser.js>'],
        dest: 'dist/woodman-browser.js'
      },
      'browser-amd': {
        src: ['<banner:meta.banner>', '<file_strip_banner:dist/woodman-browser-amd.js>'],
        dest: 'dist/woodman-browser-amd.js'
      },
      'node': {
        src: ['<banner:meta.banner>', '<file_strip_banner:dist/woodman-node.js>'],
        dest: 'dist/woodman-node.js'
      }
    },

    /**
     * Woodman compilation task (using require.js optimizer)
     *
     * Compilations that are defined here:
     * - browser: stand-alone compilation for browsers. The Woodman library is
     * exposed in window.woodman. Available appenders are those that work in Web
     * browsers.
     * - browser-amd: AMD compilation for browsers. AMD loader required to run.
     * - node: stand-alone compilation for execution in node.js. Available
     * appenders are those that work in the node.js environment.
     */
    requirejs: {
      browser: {
        options: {
          wrap: {
            start: '(function() {',
            end: 'require(["./woodman-browser"], function (woodman) {' +
              ' window.woodman = woodman; }, null, true);' +
              '}());'
          },
          baseUrl: 'lib/',
          name: '../deps/almond',
          include: [ 'woodman-browser' ],
          out: 'dist/woodman-browser.js',
          preserveLicenseComments: false,
          optimize: 'uglify'
        }
      },

      'browser-amd': {
        options: {
          wrap: {
            start: '',
            end: 'define("woodman", ["./woodman-browser"], function (woodman) {' +
              ' return woodman; });'
          },
          baseUrl: 'lib/',
          name: 'woodman-browser',
          out: 'dist/woodman-browser-amd.js',
          preserveLicenseComments: false,
          optimize: 'uglify'
        }
      },

      'node': {
        options: {
          wrap: {
            start: '',
            end: 'require(["./woodman-node"], function (woodman) {' +
              ' module.exports = woodman; }, null, true);'
          },
          baseUrl: 'lib/',
          name: '../deps/almond',
          include: [ 'woodman-node' ],
          out: 'dist/woodman-node.js',
          preserveLicenseComments: false,
          optimize: 'uglify'
        }
      }
    },

    watch: {
      files: '<config:lint.files>',
      tasks: 'lint test'
    },

    jshint: {
      options: {
        "indent": 2,
        "evil": true,
        "regexdash": true,
        "browser": true,
        "wsh": false,
        "trailing": true,
        "sub": true,
        "undef": true,
        "eqeqeq": true,
        "unused": true,
        "predef": [
          "require",
          "define"
        ]
      },
      globals: {}
    },

    uglify: {}
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('build', 'requirejs concat');
};
