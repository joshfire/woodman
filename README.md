# Woodman

**Important:** as of end of January 2013, the Woodman library and documentation
are not yet complete. In particular, the WebSocket appender needs more love and
the documentation lacks important details.

Woodman is a JavaScript logger utility that follows the architecture,
terminology and API (where applicable) of the [log4j v2](http://logging.apache.org/log4j/2.x/)
Apache project. In particular, Woodman features:
- a **logger hierarchy** that lets users disable certain log statements while
allowing others to print unhindered.
- **trace levels** similar to the `console` object (log, info, warn, error)
- **appenders** that allow to log requests to multiple destinations at once
(the `console` comes in mind, but other destinations such as to a rotating log
file or to a remote server using Web sockets are possible). New appenders can
easily be created.
- **layouts** to specify the format and structure (raw string, CSV, JSON, XML,
whatever) of the log message sent to an appender. New layouts can easily be
created.

Woodman also includes a **precompiler** that removes all traces of Woodman from
a given JavaScript file. This is typically useful to build a version of an app
that runs in a production environment where logging is not needed, where bytes
are counted or where performances need to be at their best.

Woodman runs in Web browsers and in node.js applications. The main distribution
exposes a global `woodman` object if `window` is defined, a node.js module if
`module.exports` is defined, and an AMD module if the `define` function is
defined. Other distributions that do not make assumptions about the underlying
JavaScript runtime are available.

## Getting started

### Using Woodman in a node.js application
Woodman is available as an npm package. To install Woodman in your node.js
application:
```
npm install woodman
```

Woodman needs to be initialized before it may be used. Note this initialization
process is asynchronous because appenders may need to setup network connections
or execute similar I/O operations.
```javascript
var woodman = require('woodman');
var config = {}; // See below for details about configuration
woodman.load(config, function (err) {
  if (err) {
    // An error either means the configuration is incorrect
    // or that an I/O operation failed
  }
  // Woodman is up and running
});
```

The call to `woodman.load` needs to appear **only once** in your application.
To use Woodman throughout your application once that is done:
1. import Woodman with a call to `require`
2. retrieve the instance of `Logger` for this module (the name implicitly
creates a hierarchy among loggers, see below for details)
3. log events!
```javascript
var woodman = require('woodman');
var logger = woodman.getLogger('path.name');

logger.log('This is a log message at the log level');
logger.info('This is a log message at the info level');
logger.warn('This is a log message at the warn level');
logger.error('This is a log message at the error level');

logger.log('Logging', 'multiple', 'parameters', 'is', 'easy');
logger.log('Logging', { name: 'objects' }, 'as well');
```

For a running example, check the [standalone example](examples/node.js/standalone.js)
which may be run with:
```
node examples/node.js/standalone.js
```

### Using Woodman in a Web browser
Using Woodman in a Web browser is essentially the same as using Woodman in a
node.js application. To install Woodman, copy the `dist/woodman.js` file of this
project to the JavaScript folder of your Web application (or
[download the file](https://raw.github.com/joshfire/woodman/master/dist/woodman.js).
Reference that file from a `script` tag in the HTML page (the tag needs to
appear before all scripts that make use of Woodman):
```html
<script type="text/javascript" src="path-to-js/woodman.js"></script>
```

The rest is pretty similar to the node.js case, except `woodman` is exposed as
a global object. In particular, initialize Woodman once before use:
```javascript
var config = {}; // See below for details about configuration
woodman.load(config, function (err) {
  if (err) {
    // An error either means the configuration is incorrect
    // or that an I/O operation failed
  }
  // Woodman is up and running
});
```

Then, from any JavaScript file that composes your app:
```javascript
var logger = woodman.getLogger('path.name');

logger.log('This is a log message at the log level');
logger.info('This is a log message at the info level');
logger.warn('This is a log message at the warn level');
logger.error('This is a log message at the error level');

logger.log('Logging', 'multiple', 'parameters', 'is', 'easy');
logger.log('Logging', { name: 'objects' }, 'as well');
```

See the [examples/browser] folder for further examples.

### Using Woodman as an AMD module
Woodman exports itself as a module named `woodman` if the `define` function is
defined. For instance, to define a module that depends on Woodman:
```javascript
define(['woodman'], function (woodman) {
  var logger = woodman.getLogger('loggername');
  logger.log('Using Woodman in an AMD module');
});

As above, the library needs to be initialized once before it may be used,
typically in the first module that gets executed (in a Web browser) or within
the first call to `requirejs` (in a node.js application):

```javascript
requirejs(['woodman'], function (woodman) {
  var config = {};  // See below for details about configuration
  woodman.load(config, function (err) {
    if (err) throw err;
    var logger = woodman.getLogger('main');
    logger.log('Yeepee');
  });
});
```

## Woodman configuration

@@TODO

## Precompilation

While console statements are good for development, you often do not want them
to appear in production.

@@TODO

## Appenders

@@TODO

## Layouts

@@TODO

## Why?!?
"Surely, you've heard about that thing called `console`?", you may ask.
"Wake up, this is Java*Script*, not *Java*!", you might add. Yes indeed! The
`console` is extremely useful to debug an application. It is not quite enough,
mainly because:
- There are a number of devices that do not expose any `console` object. Perhaps
surprisingly, these devices are the ones that you need to support to surf the
HTML5-in-all-the-things wave. For instance, many connected TVs do not have any
debugging environment for instance). Using `console` calls is simply not an
option on these devices.
- Maintenance of a complex application often involves focusing on a specific
part of it. To help debugging, you often need to see the *right* logs in your
console, meaning those from the specific part you're looking at and not from
other parts of the application that just add noise. The `console` is
all-or-nothing, you cannot disable logs from certain parts of your application
without actually removing them from the code.
- At pre-production phase, you may want to hand over your application to
beta testers and monitor usage remotely to be able to quickly track down issues
they may report. You need to save logs to a file or to send them to a remote
log server. Said differently, you need to re-route the console to some other
destination.

In the end, `console` is underused in most JavaScript applications. More
precisely, most applications are written *without* log traces; `console`
statements are only ever used temporarily to nail down specific issues at debug
phase, or to report errors.

The [log4j introduction](http://logging.apache.org/log4j/2.x/manual/index.html)
provides a handful of reasons why flexible logging is useful. These reasons are
valid whether the underlying language is Java, JavaScript, C, Python...

In the end, log4j provides a very good abstraction over `console` that solves
the problems raised above for a reasonable cost: that of having to manage a
`Logger` instance per module.

## Other JavaScript logging libraries

Woodman is not the first logging library written in JavaScript.
[Winston](https://github.com/flatiron/winston) is a good example of a logging
library for node.js. Closer to Woodman, the
[log4javascript](http://log4javascript.org/) library is a nice and complete
implementation of log4j for Web browsers (and can easily be adapted to run in
node.js applications).

We decided to start over because we needed:
- an implementation that takes a declarative configuration object as input and
sets up loggers, appenders and layouts accordingly;
- an implementation that both runs in Web browsers and in node.js, using an AMD
loader or not;
- code modularization, one file per class to be able to create custom builds of
Woodman with selected appenders and layouts.
- a clean and small public interface to ease the work of the precompiler

## License

The Woodman library is licensed under the [MIT license](https://raw.github.com/joshfire/woodman/master/LICENSE).

The Woodman library uses, extends or was at least partially based on other great open-source projects:
- [RequireJS](http://requirejs.org/), [new BSD or MIT licensed](https://github.com/jrburke/requirejs/blob/master/LICENSE)
- [Almond](https://github.com/jrburke/almond), [new BSD or MIT licensed](https://github.com/jrburke/almond/blob/master/LICENSE)
- [log4javascript](http://log4javascript.org/), [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)
- and obviously [log4j](http://logging.apache.org), [Apache License, Version 2.0](http://logging.apache.org/log4j/2.x/license.html)
