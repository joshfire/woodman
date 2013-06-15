---
title: Contribute
layout: page
---

This section is meant as a quick introduction to the source code of Woodman, available in Woodman's [GitHub repository](https://github.com/joshfire/woodman). For all the gory details, check the code itself. It contains hopefully useful and readable comments that explain how the library operates in practice.

### Codebase
Woodman's [GitHub repository](https://github.com/joshfire/woodman) is organized in folders:

- The `dist/` folder contains Woodman distribution files, in other words the results building Woodman into a minified JavaScript file that contains all the code and exports Woodman for some JavaScript runtime environment.
- The `examples/` folder contains examples that you may try out in your Web browser or run in [node.js](http://nodejs.org)
- The `lib/` folder contains the actual source code of Woodman.
- The `precompile/` folder contains the precompiler library and command-line interface.
- The `test/` folder contains unit tests.
- The `grunt.js` file is a Grunt 0.3 compatible make file that runs the different instructions needed to build Woodman and updates the `dist/` folder accordingly.

To start developing for Woodman, clone the repository and run `npm install` to install the different libraries needed to build Woodman, precompile and/or run tests.

#### Architecture
Woodman is defined as a series of [AMD modules](http://requirejs.org/docs/whyamd.html#amd) that get bundled together during build. The [basic concepts](#basic-concepts-and-classes) presented earlier directly match the base classes that you will find in the `lib/` folder:

- `appender.js` defines the base `Appender` class.
- `logevent.js` defines the base `LogEvent` class.
- `logger.js` defines the `Logger` class.
- and so on!

Other files define classes that follow the [Apache Log4j architecture](http://logging.apache.org/log4j/2.x/manual/architecture.html), for instance: `loggercontext.js`, `logmanager.js`, `message.js`, or `lifecycle.js`.

There is one entry point per distribution of Woodman, named `woodman.js` or `woodman-xx.js`. If you take a look at one of these files, you will see that these entry points merely return the static `LogManager` class initialized with the different appenders, filters, and layouts that the distribution supports. In turn, the `LogManager` class wraps a `LoggerContext` instance that contains the gist of Woodman's configuration logic.

Said differently, when you issue a call to `woodman.getLogger`, you will actually call `LoggerContext.getLogger`.

#### Run tests
Unit tests are written using [Jasmine](https://github.com/pivotal/jasmine). To run the tests from the root folder of the repository:

```
node test/run.js
```

Unless something is wrong with the version of Woodman on which you run the tests, you should see a friendly green message that looks like `xxx specs, 0 failures`.

The test runner may also generate JUnit XML test reports (one per spec), e.g. for integrating in [Jenkins](jenkins-ci.org):

```
node test/run.js junit
```

The report files are written in the `test-reports` folder.

#### Build Woodman
Building Woodman essentially boils down to:

1. running [require.js optimizer](http://requirejs.org/docs/optimization.html) on the Woodman entry point you want to build
2. and adding some boilerplate to export Woodman for the targeted JavaScript runtime environment.

Woodman uses [Grunt](http://gruntjs.com/) to automate these tasks. The `grunt.js` file in the root folder of the repository contains the logic needed.

#### Dig into the precompiler
The `precompile/precompile.js` file implements the logic of the precompiler. Internally, the precompiler uses [Esprima](http://esprima.org/) to parse the incoming JavaScript into an Abstract Syntax Tree (AST). It then parses that tree to extract statements of interest and uses an adapted version of [Falafel](https://github.com/substack/node-falafel) to update the original source code. Using Falafel makes it easy to update the code while preserving spaces, lines and comments. It also has the drawback that it is also easy to create invalid code.

Check the code of the precompiler for details. The precompilation updates the initial code in steps:

1. First pass removes calls to Logger methods `log`, `info`, `warn`, `error`
   ex: `logger.log('blah');`
1. Second pass removes logger instantiation calls
   ex: `var logger = woodman.getLogger('foo');`
1. Third pass removes config declarations and calls to woodman initialization methods
   ex: `woodman.load(config, function (err) { ... });`
1. Fourth pass removes references to the Woodman library:
   ex: `var woody = require('woodman');`
   ex: `define(['woodman'], function (woodman) { ... });`
1. Fifth pass removes Woodman library definition, if found:
   ex: `define('woodman', ...);`

The precompiler is rather slow. It has the merit that it exists and does the right thing most of the time. It is most certainly possible to improve performances here. If you're into AST trees, feel free to have a look at the code and suggest improvements!

### Extend
Woodman is highly modularized with a view to making it easy to extend the library, in particular to create new types of appenders, layouts, or filters.

#### Add a new Appender
Appenders in Woodman should (although note that is not stricto senso required) derive from the base `Appender` class in `lib/appender.js`. To create a new type of appender:

1. Create a new JavaScript file for the appender in `lib/appenders`
1. Check some existing appender such as `lib/appenders/consoleappender.js` to create a class that derives from the base `Appender` class.
1. Implement the `doAppend` function.
1. Implement the `start` and `stop` functions if needed.
1. Update the distributions entry point files (`lib/woodman.js` and alike) to add a `require` call that loads the code of your appender and a call to `registerAppender` with the name that is to appear in the configuration to reference your appender.
1. Build Woodman.

#### Add a new Layout
Layouts in Woodman should (although, once again, that is not stricto senso required) derive from the base `Layout` class in `lib/layout.js`. To create a new type of Layout:

1. Create a new JavaScript file for the layout in `lib/layouts`
1. Check some existing appender such as `lib/layouts/patternlayout.js` to create a class that derives from the base `Layout` class.
1. Implement the `toMessageString` function.
1. Update the distributions entry point files (`lib/woodman.js` and alike) to add a `require` call that loads the code of your layout and a call to `registerLayout` with the name that is to appear in the configuration to reference your layout.
1. Build Woodman.

#### Add a new Filter
Starting to get it? Good, because it is just about the same thing for Filters... Filters in Woodman should (although not required) derive from the base `Filter` class in `lib/filter.js`. To create a new type of Filter:

1. Create a new JavaScript file for the filter in `lib/filters`
1. Check some existing appender such as `lib/filters/regexfilter.js` to create a class that derives from the base `Filter` class.
1. Implement the `filter` function.
1. Update the distributions entry point files (`lib/woodman.js` and alike) to add a `require` call that loads the code of your filter and a call to `registerFilter` with the name that is to appear in the configuration to reference your filter.
1. Build Woodman.

#### Custom log levels
By default, Woodman knows about the trace levels: `log`, `info`, `warn` and `error`. The order of these trace levels is significant, as loggers and appenders process log events that are at or below a given trace level. Woodman also handles the two specific values `all` (which means *any trace level*) and `off` (which means *no trace level*).

While these trace levels should be enough in most cases, you may also want to introduce additional levels, for instance a `trace` or `debug` level to trace even more things than the `log` level or a `fatal` level below the `error` level.

To introduce these new log levels, simply add corresponding calls to `registerLevel` in the entry point of the distribution you are using, for instance:

```javascript
LogManager.registerLevel('trace', 'log');
LogManager.registerLevel('debug', 'trace');
LogManager.registerLevel('fatal');
```

To actually start logging messages at these new levels, call the `trace` function directly:

```javascript
var logger = woodman.getLogger();
logger.trace('debug', 'Logging a message at the "debug" level');
logger.trace('fatal', 'Argh!');
```

Note that, if you only want to add new levels to use Woodman in a specific application, you may also directly issue calls such as `woodman.registerLevel('fatal');` from anywhere in your code and use these trace levels afterwards. In other words, you do not need to re-build Woodman to add new trace levels.


#### Build a custom distribution
If you want to create your own distribution of Woodman, run the following steps:

1. Duplicate the `lib/woodman.js` main distribution entry point into a `lib/woodman-xx.js` file.
1. Adjust the calls to `registerAppender`, `registerLayout`, `registerFilter`, `registerLevel` as needed.
1. Add a new `requirejs` task with the name of your distribution in the Grunt file with the appropriate wrapping code.
1. Add a similar `concat` task with the right banner and destination file.
1. Run the build. You're done!

### Contribute to Woodman
Did you find a bug? Do you have a new feature to suggest? Great! Use the [issue tracking system](https://github.com/joshfire/woodman/issues) on GitHub to report bugs or propose new features.

Do you feel like contributing to the code of Woodman? Even better! The best way forward would be to fork the repository, commit the changes in the forked version and send a pull request. Please note the [MIT License](#license).

Is documentation your thing? Awesome! Please get in touch through the [issue tracking system](https://github.com/joshfire/woodman/issues) on GitHub with suggestions to turn the documentation into a pleasant read. Translations welcome as well.
