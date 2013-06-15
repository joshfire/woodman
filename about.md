---
title: About
layout: page
---

### Who
Woodman has been manufactured on the assembly line by [Joshfire Factory](http://factory.joshfire.com) workers to help develop and maintain various cross-device Web applications and other backend tools.

### Why?!?
"Surely, you've heard about that thing called `console`?", you may ask. "Wake up, this is *JavaScript*, not *Java*!", you might add. Yes indeed! The `console` is extremely useful to debug an application. It is not quite enough, mainly because:

- No all devices expose a `console` object. Perhaps surprisingly, the devices that do not are the ones that you might want to support to surf the HTML5-in-all-the-things wave. For instance, many connected TVs do not expose a debugging environment. Using `console` calls is simply not an option on such devices.
- Maintenance of a complex application often involves focusing on a specific part of it. To help debugging, you often need to see the *right* logs in your console, meaning those from the specific part you're looking at and not from other parts of the application that just add noise. The `console` is all-or-nothing, you cannot disable logs from certain parts of your application
without actually removing them from the code.
- At pre-production phase, you may want to hand over your application to beta testers and monitor usage remotely to be able to track down issues they may report. You need to save logs to a file or to send them to a remote log server. Said differently, you need to re-route the console to some other destination.

The net result is that `console` is underused in most JavaScript applications. More precisely, most applications are written *without* log traces; `console` statements are only ever used temporarily to nail down specific issues at debug phase, or to report errors.

The [Apache Log4j introduction](http://logging.apache.org/log4j/2.x/manual/index.html) provides a handful of reasons why flexible logging is useful. These reasons are valid whether the underlying language is Java, JavaScript, C, Python...

In the end, log4j provides a very good abstraction over `console` that solves the problems raised above for a reasonable cost: that of having to manage a `Logger` instance per module.

### Differences with log4j
While Woodman attempts to follow Apache Log4j 2 as closely as possible, it does not implement all its features. In particular, compared to Apache Log4j 2, Woodman comes with: 

- a restricted number of [Appenders](http://logging.apache.org/log4j/2.x/manual/filters.html)
- a restricted number of [Layouts](http://logging.apache.org/log4j/2.x/manual/layouts.html)
- a restricted number of [Filters](http://logging.apache.org/log4j/2.x/manual/filters.html)
- no support for Appender Reference Filters (fourth type in [Filters](http://logging.apache.org/log4j/2.x/manual/filters.html))
- no support for [Markers](http://logging.apache.org/log4j/2.x/manual/markers.html)
- no support for [Plugins](http://logging.apache.org/log4j/2.x/manual/plugins.html) and [Lookups](http://logging.apache.org/log4j/2.x/manual/lookups.html)

API functions in Woodman may also not have the exact same signature as those specified in log4j to stick to more JavaScript-friendly paradigms. For instance, log levels in JavaScript are lower-case strings, as opposed to a proper enumeration in Apache Log4j 2.

New features get introduced in Woodman when the need arises. If you need something that does not yet exist, check [Contribute to Woodman](#contribute-to-woodman) and get in touch!

### Other JavaScript logging libraries

Woodman is not the first logging library written in JavaScript. [Winston](https://github.com/flatiron/winston) is a good example of a logging library for node.js. Closer to Woodman, the
[log4javascript](http://log4javascript.org/) library is a nice and complete implementation of log4j for Web browsers (and can easily be adapted to run in node.js applications).

We decided to start over because we needed:

- an implementation that takes a declarative configuration object as input and sets up loggers, appenders and layouts accordingly;
- an implementation that runs both in Web browsers and in node.js, using an AMD loader or not;
- code modularization, one file per class to be able to create custom builds of Woodman with selected appenders and layouts.
- a clean and small public interface to ease the work of the precompiler

### License

The Woodman library is licensed under the [MIT license](https://raw.github.com/joshfire/woodman/master/LICENSE). Copyright (c) 2013 Joshfire. All rights reserved.

The core source code of the Woodman library uses, extends or was at least partially based on other great open-source projects:

- [RequireJS](http://requirejs.org/). Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved. [New BSD or MIT licensed](https://github.com/jrburke/requirejs/blob/master/LICENSE)
- [Almond](https://github.com/jrburke/almond). Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved. [New BSD or MIT licensed](https://github.com/jrburke/almond/blob/master/LICENSE)
- [Socket.IO](http://socket.io/). Copyright(c) 2011 LearnBoost <dev@learnboost.com>, MIT Licensed for the socket appender.
- [log4javascript](http://log4javascript.org/), Copyright Tim Down, [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)
- and obviously [Apache Log4j 2](http://logging.apache.org). Copyright © 1999-2013 Apache Software Foundation. All Rights Reserved. [Apache License, Version 2.0](http://logging.apache.org/log4j/2.x/license.html)

Additionally, the precompiler uses:

- [Esprima](http://esprima.org/). Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>, [BSD Licensed](https://github.com/ariya/esprima/blob/master/LICENSE.BSD)
- [falafel](https://github.com/substack/node-falafel) by James Halliday. MIT licensed.
- [node-fs](). Copyright 2010 Bruno Pedro. All rights reserved. [MIT licensed](https://github.com/bpedro/node-fs/blob/master/LICENSE).
- [Underscore](http://underscorejs.org/). Copyright (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc. MIT licensed

The test runner relies on:

- [Jasmine](http://pivotal.github.io/jasmine/). Copyright (c) 2008-2013 Pivotal Labs. [MIT Licensed](https://github.com/pivotal/jasmine/blob/master/MIT.LICENSE).
- [Jasmine-reporters](https://github.com/larrymyers/jasmine-reporters/). Copyright (c) 2010 Larry Myers. [MIT Licensed](https://github.com/larrymyers/jasmine-reporters/blob/master/LICENSE). Used for JUnit XML reporting.

Woodman distributions are prepared with:

- [Grunt](http://gruntjs.com/). Copyright (c) 2013 "Cowboy" Ben Alman. [MIT licensed](http://github.com/gruntjs/grunt/blob/master/LICENSE-MIT)
- [Grunt-contrib-concat](https://github.com/gruntjs/grunt-contrib-concat). Copyright (c) 2012 "Cowboy" Ben Alman, contributors. [MIT licensed](https://github.com/gruntjs/grunt-contrib-concat/blob/master/LICENSE-MIT)
- [Grunt-contrib-jshint](https://github.com/gruntjs/grunt-contrib-jshint). Copyright (c) 2013 "Cowboy" Ben Alman, contributors. [MIT licensed](https://github.com/gruntjs/grunt-contrib-jshint/blob/master/LICENSE-MIT)
- [Grunt-contrib-requirejs](https://github.com/gruntjs/grunt-contrib-requirejs). Copyright (c) 2012 Tyler Kellen, contributors. [MIT licensed](https://github.com/gruntjs/grunt-contrib-requirejs/blob/master/LICENSE-MIT)
