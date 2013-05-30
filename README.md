# Woodman

Woodman is a **JavaScript logger utility** that follows the architecture, terminology and API (where applicable) of the [Apache Log4j 2](http://logging.apache.org/log4j/2.x/) project. Woodman is roughly as simple to use as the `console` object. Behind the scenes though, it brings a rich configuration mechanism that lets you take precise control over **what** gets logged **where** and **how**.

In particular, Woodman features:

- a **logger hierarchy** to organize traces and disable log statements based on their module of origin.
- **trace levels** similar to those exposed by the `console` object (log, info, warn, error)
- **appenders** to change the destination where log events are sent without changing the code itself (the `console` comes to mind, but other destinations such as a rotating log file or a remote server using Web sockets are possible). New appenders can easily be created.
- **layouts** to specify the format and structure of the log events sent to an appender: raw string, CSV, JSON, XML, whatever. New layouts can easily be created.
- **filters** for more flexibility in the rules that determine which log events are sent to an appender and which are ignored.

Woodman also includes a **precompiler** to remove all traces of Woodman from a given JavaScript file or project. This is typically useful to build a version of an app that runs in a production environment where logging is not needed, where bytes are a scarce resource or where performances need to be at their best. See [Precompilation](#precompilation) for details.

Woodman runs in Web browsers and in [node.js](http://nodejs.org) applications. The main distribution exposes a global `woodman` object if `window` is defined, a node.js module if `module.exports` is defined, and an [AMD module](http://requirejs.org/docs/whyamd.html#amd) if the `define` function is defined. [Other distributions](#available-distributions) that do not make assumptions about the underlying JavaScript runtime are available.

What now? If that all sounds clear and great, [get started](#getting-started) then check the [Woodman configuration](#woodman-configuration) section. If you're ready to dig in the code to fix a bug or implement a new Appender, Layout or Filter, take a look at the [Development](#development) section. Last but not least, if you cannot help but wonder why Woodman exists at all, what it brings on top of the usual `console` and how it relates to other similar projects, check the [About](#about) section.


## <a id="toc"></a>Table of Contents

- [Getting started](#getting-started)
  - [Using Woodman in a node.js application](#using-woodman-in-a-nodejs-application)
  - [Using Woodman in a Web browser](#using-woodman-in-a-web-browser)
  - [Using Woodman as an AMD module](#using-woodman-as-an-amd-module)
  - [Trace functions](#trace-functions)
- [Basic concepts and classes](#basic-concepts-and-classes)
  - [Logger](#logger)
  - [Log Event](#log-event)
  - [Appender](#appender)
  - [Filter](#filter)
  - [Layout](#layout)
- [Woodman configuration](#woodman-configuration)
  - [Configuration outline](#configuration-outline)
  - [Logger definition](#logger-definition)
  - [Appender definition](#appender-definition)
  - [Layout definition](#layout-definition)
  - [Filter definition](#filter-definition)
  - [Log4j JSON configuration format](#log4j-json-configuration-format)
  - [Console configuration shortcut](#console-configuration-shortcut)
- [Precompilation](#precompilation)
  - [Run the precompiler](#run-the-precompiler)
  - [What the precompiler does](#what-the-precompiler-does)
  - [Limits of the precompiler](#limits-of-the-precompiler)
- [Available distributions](#available-distributions)
  - [Main distribution](#main-distribution)
  - [AMD module](#amd-module)
  - [Console distribution](#console-distribution)
  - [Web Browser](#web-browser)
  - [Web Browser AMD](#web-browser-amd)
  - [node.js module](#nodejs-module)
  - [node.js AMD](#nodejs-amd)
  - [The "disabled" distribution](#the-disabled-distribution)
- [Development](#development)
  - [Codebase](#codebase)
      * [Architecture](#architecture)
      * [Run tests](#run-tests)
      * [Build Woodman](#build-woodman)
      * [Dig into the precompiler](#dig-into-the-precompiler)
  - [Extend](#extend)
      * [Add a new Appender](#add-a-new-appender)
      * [Add a new Layout](#add-a-new-layout)
      * [Add a new Filter](#add-a-new-filter)
      * [Custom log levels](#custom-log-levels)
      * [Build a custom distribution](#build-a-custom-distribution)
  - [Contribute to Woodman](#contribute-to-woodman)
- [About](#about)
  - [Who](#who)
  - [Why?!?](#why)
  - [Differences with log4j](#differences-with-log4j)
  - [Other JavaScript logging libraries](#other-javascript-logging-libraries)
  - [License](#license)
- [Changelog](#changelog)


## Getting started

### Using Woodman in a node.js application
Woodman is available as an [npm package](https://npmjs.org/package/woodman). To install Woodman in your node.js application:
```
npm install woodman
```

Woodman needs to be initialized before it may be used. Note this initialization process is asynchronous because appenders may need to setup network connections or execute similar I/O operations.
```javascript
var woodman = require('woodman');

// "console" means "console all the things!". See configuration for details.
woodman.load('console', function (err) {
  if (err) {
    // An error either means the configuration is incorrect
    // or that an I/O operation failed
  }
  var logger = woodman.getLogger('main');
  logger.log('Woodman is up and running');
});
```

The call to `woodman.load` needs to appear **only once** in your application. To use Woodman throughout your application once that is done:

1. import Woodman with a call to `require` if not already done
2. retrieve the instance of `Logger` for this module (the name implicitly creates a hierarchy among loggers, see below for details)
3. log events!

```javascript
var woodman = require('woodman');
var logger = woodman.getLogger('path.name');
logger.log('This is a log message at the log level');
```

For a running example, check the [standalone example](examples/node.js/standalone.js) which may be run with:
```
node examples/node.js/standalone.js
```

### Using Woodman in a Web browser
Using Woodman in a Web browser is essentially the same as using Woodman in a node.js application. To install Woodman, copy the `dist/woodman.js` file of this project to the JavaScript folder of your Web application (or [download the file](https://raw.github.com/joshfire/woodman/master/dist/woodman.js)). Reference that file from a `script` tag in the HTML page (the tag needs to appear before all scripts that make use of Woodman):
```html
<script type="text/javascript" src="path-to-js/woodman.js"></script>
```

The rest is pretty similar to the node.js case, except `woodman` is exposed as a global object. In particular, initialize Woodman once before use:
```javascript
// "console" means "console all the things!". See configuration for details.
woodman.load('console', function (err) {
  if (err) {
    // An error either means the configuration is incorrect
    // or that an I/O operation failed
  }
  var logger = woodman.getLogger('main');
  logger.log('Woodman is up and running');
});
```

Then, from any JavaScript file that composes your app:
```javascript
var logger = woodman.getLogger('path.name');
logger.log('This is a log message at the log level');
```

See the [examples/browser] folder for further examples.

### Using Woodman as an AMD module
Woodman exports itself as a module named `woodman` if the `define` function is defined. For instance, to define a module that depends on Woodman:
```javascript
define(['woodman'], function (woodman) {
  var logger = woodman.getLogger('loggername');
  logger.log('Using Woodman in an AMD module');
});
```

As above, the library needs to be initialized once before it may be used, typically in the first module that gets executed (in a Web browser) or within the first call to `requirejs` (in a node.js application):

```javascript
requirejs(['woodman'], function (woodman) {
  // "console" means "console all the things!". See configuration for details.
  woodman.load('console', function (err) {
    if (err) throw err;
    var logger = woodman.getLogger('main');
    logger.log('Yeepee');
  });
});
```

### Trace functions
Call the `log`, `info`, `warn`, `error` trace functions on a Logger instance to log a message. They mostly behave as those of the usual `console` object, meaning that they can take any number of arguments of basically any type.

There are a couple of differences though:

1. Woodman produces strings. If you pass an object, Woodman will not output the object itself but a serialization of that object as a string. Depending on whether the object overrides "toString", the serialization is either the result of running "toString" or a JSON serialization of the first levels of the object.

2. If the first parameter is a string, Woodman replaces the occurrences of `{}` in that string with the string serialization of the remaining parameters.

The code below illustrates these possibilities:

```javascript
var woodman = require('woodman');
var logger = woodman.getLogger('path.name');

logger.log('This is a log message at the log level');
logger.info('This is a log message at the info level');
logger.warn('This is a log message at the warn level');
logger.error('This is a log message at the error level');

logger.log('Logging', 'multiple', 'parameters', 'is', 'easy');
logger.log('Logging', { name: 'objects' }, 'as well');
logger.log('Woodman supports {} {}', 'parameters', 'substitution');
```


## Basic concepts and classes

In Woodman, a [Logger](#logger) applies [filters](#filter) to a [log event](#log-event) to determine whether to send that event to registered [appenders](#appender) where it will be formatted according to some [layout](#layout). This section goes a bit more into details about these concepts. Interested readers may also check the [Apache Log4j documentation](http://logging.apache.org/log4j/2.x/manual/architecture.html).

### Logger
The Logger class is the *one* class you will interact with in your code. It exposes the trace functions that you will call to log messages.

A Logger has a name, a level, and may link to a list of Appenders and a Filter. Appenders and Filters are created once and for all when the [Woodman configuration](#Woodman_configuration) is loaded. Your code will never have to deal with Appenders and Filters directly in particular, only through configuration directives.

The names of the Logger implicitly create a Logger hierarchy: a logger is an ancestor of another one when its name followed by a dot is a prefix of the other logger name (e.g. a Logger named `daddy` is an ancestor of one named `daddy.baby`). Woodman maintains a root logger named `[root]` at the top of the hierarchy.

Although not a requirement, applications will typically instantiate one Logger per module to be able to filter logs based on their module of origin. It is perfectly ok to create more than one Logger per module although note that Woodman keeps a pointer on all created Logger instances, so you should not instantiate too many of them (for instance, it is likely not a good idea to have a `for` loop that runs thousands of times and creates one Logger at each iteration). You may also decide to maintain and use only one Logger throughout the application but note that kind of kills to possibility to filter out log events that makes Woodman useful in the first place.

### Log event
A LogEvent is the object created internally when the user issues a call to one of a Logger's trace functions. It contains the actual message sent to the trace function as well as meta-information such as the current date, the name of the Logger that created it or the trace level.

Appenders, Filters and Layouts all operate on an instance of the LogEvent class.

### Appender
Appenders are responsible for delivering LogEvents to their destination. The Console Appender is the main appender that more or less all applications will use. Other possibilities such as logging to a file or sending events to a remote server over Web sockets are possible, although note Woodman only ships with a couple of Appenders for the time being.

### Filter
Filters allow LogEvents to be evaluated to determine whether they should be published. Filtering rules depend on the type of Filter being used. A typical Filter is the RegexFilter that applies a regular expression to the formatted message of a LogEvent and takes a decision based on whether the regular expression matched or not. The decision may either be *accept* to accept the log event right away, *deny* to reject the log event altogether, or *neutral* to leave the decision to further filters.

As explained in the [Apache Log4j documentation](http://logging.apache.org/log4j/2.x/manual/filters.html), filters may be attached to different locations:

- Context-wide Filters run before all the other filters. Events that are rejected by these filters will not be passed to loggers for further processing. Once an event has been accepted by a Context-wide filter it will not be evaluated by any other Context-wide Filters nor will the Logger's Level be used to filter the event. The event will be evaluated by Logger and Appender Filters however.
- Logger Filters are configured on a specified Logger. These are evaluated after the Context-wide Filters and the Log Level for the Logger. Events that are rejected by these filters will be discarded and the event will not be passed to a parent Logger regardless of the additivity setting.
- Appender Filters are used to determine if a specific Appender should handle the formatting and publication of the event.

(Note Woodman does not support Appender Reference Filters)

### Layout
A Layout formats a LogEvent into a form that meets the needs of an Appender, in most cases a string. The formatted form depends on the type of Layout. A typical example is the PatternLayout that takes a pattern string and formats a LogEvent according to follow that pattern. Other Layouts are possible although note Woodman only ships with a couple of Layouts for the time being.


## Woodman configuration

In the absence of a proper configuration, calls to trace functions will not produce anything. To actually start logging something somewhere, you need to specify **what**, **how** and **where** to log events. This is all done through the configuration of Woodman, defined in a declarative JavaScript object that can be serialized as JSON.

The `console` string used in the examples of the [Getting started](#getting-started) section is a [shortcut notation](#console-configuration-shortcut) that tells Woodman to send everything to the console using a usual pattern. You can achieve much more using a proper configuration object.

You will typically load the configuration object once and for all when your application is started with code such as:

```javascript
// Initialize Woodman configuration
var config = {
  "loggers": [
    {
      "root": true,
      "level": "log",
      "appenders": [
        {
          "type": "Console"
        }
      ]
    }
  ]
};

// Load the configuration
woodman.load(config, function (err) {
  if (err) {
    // Woodman could not apply the configuration
    throw err;
  }

  // Main code of your application
});
```

### Configuration outline

Loggers are at the heart of the configuration of Woodman. The `loggers` property is the only property required in the configuration. It contains a list of [Logger definitions](#logger-definition). If you want to add a bunch of context-wide filters, you may also add a `filters` property that contains a list of [Filter definitions](#filter-definition). If you need to share appenders between loggers, add an `appenders` property with a list of [Appender definitions](#appender-definition) and reference the names of these appenders from within the `appenders` property of the Logger definition.

The following is an example of a configuration object that creates a console appender, a socket appender, a context-wide filter that rejects all log events whose messages contain the word *dummy*, and logging rules for different families of loggers:

```json
{
  "appenders": [
    {
      "name": "theconsole",
      "type": "Console",
      "layout": {
        "type": "PatternLayout",
        "pattern": "%message"
      }
    },
    {
      "name": "socketserver",
      "type": "Socket",
      "url": "http://socketserver.example.org",
      "level": "error",
      "layout": {
        "type": "JSONLayout"
      }
    }
  ],
  "filters": [
    {
      "type": "RegexFilter",
      "regex": "(^|\\s)dummy(\\s|$)",
      "match": "deny",
      "mismatch": "neutral"
    }
  ],
  "loggers": [
    {
      "root": true,
      "level": "log",
      "appenders": [
        "socketserver"
      ]
    },
    {
      "name": "base",
      "level": "info",
      "appenders": [
        "theconsole"
      ]
    },
    {
      "name": "base.lib.unstable",
      "level": "log"
    }
  ]
}
```

To understand what happens when Woodman loads that configuration, keep the following bullet points in mind:

1. Logger names create a hierarchy of loggers, the root Logger being the common ancestor of all loggers. If the code uses a logger whose name does not appear in the configuration, it inherits its level and filter from its closest ancestor that appear in the configuration.
1. Loggers are additive by default, meaning that, provided a log event passes the level and filter criteria of the Logger, the log event is sent to all the appenders of the Logger ancestors (no matter the level and filter they may define).
1. Levels and filters specify the **what** to log.
1. The appenders specificy the **where** to send log events.
1. The layouts specificy the **how** to format log events.

The best is then to take a few examples of calls to trace functions:
- `woodman.getLogger('foo').warn('Woodman is great')` does not log anything: the closest ancestor of the `foo` Logger in the configuration is the root Logger which logs everything but the log event eventually gets filtered by its appender which only logs errors.
- `woodman.getLogger('foo').error('Woodman is great')` sends the log event to the socket appender as a JSON structure.
- `woodman.getLogger('foo').error('Oh no, a dummy message!')` does not log anything: the context-wide filter detects *dummy* in the message and rejects the log event.
- `woodman.getLogger('base').warn('Woodman is great')` logs the message to the console.
- `woodman.getLogger('base.lib.unstable').log('Woodman is great')` logs the message to the console: the trace level for the `base.lib.unstable` Logger is `log`; the appender of the `base` Logger gets called through additivity. Note the appender of the root Logger gets called as well but it does not log anything since the log event is above the error level.
- `woodman.getLogger('base.lib.something').error('Woodman is great')` logs the message to the console and sends the error to the socket appender as a JSON structure.

Do not worry if that sounds far-fetched at first sight. First, this mechanism is not complex for the sake of being complex: it gives you precise control over the treatment of log events. Second, you will likely just start with a simple *log everything to the console* configuration and adjust settings as your project grows and your needs evolve. More importantly, you'll get used to it ;)

### Logger definition

A Logger definition contains one or more of the following properties:

- `additivity`: A boolean flag that determines whether the Logger is additive. Loggers are additive by default. An additive Logger sends the log event it processes to the appenders of its ancestor (up until the root Logger or the first non additive Logger).
- `appenders`: The list of appenders directly associated with the Logger. See [Appender definition](#appender-definition) for details. The list may be empty.
- `filters`: The list of filters to apply to log events (provided that they are at the right level) to determine whether the Logger processes it. See [Filter definition](#filter-definition) for details. The order of the filters in the list determines the order of application. If not specified in the configuration, the list of filters is inherited from the closest ancestor of the Logger in the configuration.
- `level`: The trace level of the Logger. Log events above that level are rejected. Possible values are `all`, `log`, `info`, `warn`, `error` and `off`. If not specified in the configuration, the trace level is inherited from the closest ancestor of the Logger that specifies a trace level in the Logger hierarchy.
- `name`: The name of the Logger. A string. The property is required except if the `root` property is `true`. Dots in the name are used to build the hierarchy of Loggers.
- `root`: A special flag that identifies the root Logger. If this flag is set, the `name` property must not be set. The root Logger can appear at most once in the configuration.

The following configuration defines a Logger that sends log events at or below the `info` level to the console, except when the message to log contains the word `dummy`. Log events are formatted using the specified pattern:

```json
{
  "name": "path.name",
  "level": "info",
  "appenders": [
    {
      "type": "Console",
      "layout": {
        "type": "PatternLayout",
        "pattern": "%date [%level] %logger - %message%n"
      }
    }
  ],
  "filters": [
    {
      "type": "RegexFilter",
      "regex": "(^|\\s)dummy(\\s|$)",
      "match": "deny",
      "mismatch": "neutral"
    }
  ]
}
```

### Appender definition

An Appender definition contains one or more of the following properties:

- `appendStrings`: Boolean flag that determines whether to log only strings or to log objects as objects. Preserving objects may be useful in Web browsers as the console often represents an object with an expandable structure. Default value is `true`.
- `filters`: The list of filters to apply to log events (provided that they are at the right level) to determine whether the Appender processes it. See [Filter definition](#filter-definition) for details. The order of the filters in the list determines the order of application.
- `layout`: The layout used by the Appender. The property is required. See [Layout definition](#layout-definition) for details.
- `level`: The trace level of the Appender. Log events above that level are rejected. Possible values are `all`, `log`, `info`, `warn`, `error` and `off` (although note the `off` value is kind of stupid since it basically creates an Appender that does not log anything).
- `type`: The type of the Appender. The property is required. Possible values are `Console` to log events to the console, `Socket` to send log events to a remote Web socket server, `File` and `RollingFile` to send log events to a file (provided you are running in a node.js environment). More types may be added in the future (see [Add a new Appender](#add-a-new-appender) for details).
- `url`: The URL of the Web socket server. The property is required for a `Socket` Appender, meaningless otherwise.
- `fileName`: The filename of the file to send logs to. The property is required for a `File` or `RollingFile` Appender, meaningless otherwise. For the `RollingFile` Appender, the actual filename will be prefixed with the creation date of the file.
- `triggeringPolicy`: The policy used to determine when a `RollingFile` Appender should roll the log file. The policy can either be time based (roll once every xx minutes), size based (roll once when the size of the file is more than xx bytes), or both (roll when one of the conditions holds). Value must be an object of the form `{ time: <timeInMinutes>, size: <sizeInBytes> }`.

Here is an example of a possible Woodman configuration for an appender that sends error messages to a Web socket server as JSON objects provided the error message starts with "Alert ze world":

```json
{
  "type": "Socket",
  "url": "http://socketserver.example.org",
  "level": "error",
  "layout": {
    "type": "JSONLayout"
  },
  "filters": [
    {
      "type": "RegexFilter",
      "regex": "^Alert ze world"
      "match": "accept",
      "mismatch": "neutral"
    }
  ]
}
```

### Layout definition

A Layout definition contains a `type` property that specifies the type of Layout to use to format the underlying log event. Possible values are `JSONLayout` to log events in a JSON structure and `PatternLayout` to format log events according to a pattern string. More types may be added in the future (see [Add a new Layout](#add-a-new-layout) for details).

Other properties depend on the type of Layout.

#### JSONLayout

A `JSONLayout` formats a log event as a JSON structure. The following properties may be set to fine-tune how the formatting is achieved:

- `compact`: A boolean that determines whether the resulting JSON string is compact or more human readable with tabs and carriage returns. Default value is `false`.
- `depth`: The depth at which to serialize the message of a log event is the `messageAsObject` flag is set. Default value is `2`.
- `messageAsObject`: Whether to format the message of a log event as an object or as a string. Default value is `false`.

#### PatternLayout

A `PatternLayout` formats a log event as a string that follows a pattern string. The following properties may be set:

- `pattern`: The pattern string used to format the log event. See below for details.
- `compactObjects`: A boolean flag that determines whether to serialize objects using a compact form. Default value is false.

The pattern string is composed of literal text and format control expressions called conversion specifiers. A conversion specifier starts with a `%` and is followed by optional *format modifiers* and a *conversion pattern*.

Note that any literal text may be included in the conversion pattern.

The *conversion patterns* supported by the pattern string are based on those defined by the [Apache Log4j documentation](http://logging.apache.org/log4j/2.x/manual/layouts.html#PatternLayout), but note Woodman only supports the following conversion patterns:

- `c` or `logger`: The name of the Logger
- `d` or `date`: The date of the log event. The actual date format to use may specified in a following set of braces, with predefined values `ABSOLUTE`, `COMPACT`, `DATE`, `ISO8601` and `ISO8601_BASIC`. You may also define formats such as `dd MMM yyyy HH:mm:ss,SSS`.
- `highlight`: To add colors based on the current log event. Colors are added to the pattern string enclosed in a following set of braces, e.g. `%highlight{%level %message}`.
- `m` or `message`: The log event message.
- `n`: A newline.
- `p` or `level`: The level of the log event.
- `r` or `relative`: The number of milliseconds elapsed since the application started.
- `%`: The percent sign (i.e. `%%` will produce a single percent sign).

The *format modifiers* control such things as field width, padding, left and right justification. Given a conversion specifier `%-10.25logger`, the layout formats the name of the logger as follows:

1. If the name is less than `10` characters long, the name is right padded with spaces (right because of the initial `-`, it would be left padded in the absence of that character)
1. If the name is more than `25` characters long, the name is truncated.

All parts are optional. For instance you may specify `%.25logger` to keep only the truncation at 25 characters, or `%15logger` to left pad with spaces when the name is less than 15 characters long.

The following definition describes a possible `PatternLayout`:

```json
{
  "type": "PatternLayout",
  "pattern": "%date{COMPACT} %highlight{%-5level} [%logger] - %message%n"
}
```

### Filter definition

A Filter definition contains a `type` property that specifies the type of Filter to use to filter the underlying log event. The only possible value is `RegexFilter` for the time being to filter log events based on whether the log event message matches a regular expression.

Properties that may be set for a `RegexFilter` filter are:
- `regex`: The regular expression.
- `match` or `onMatch`: The decision to take when the regular expression matches the message. Possible values are `accept`, `deny` or `neutral`. Default value is `neutral`.
- `mismatch` or `onMismatch`: The decision to take when the regular expression does not match the message. Same possible values as the `match` property. Default value is `deny`.
- `useRawMsg`: If true the regular expression will match the format string of the log event if there is one, otherwise the formatted message will be used. The default value is `false`.

Here is an example

```json
{
  "type": "RegexFilter",
  "regex": "(^|\\s)borked(\\s|$)",
  "match": "deny",
  "mismatch": "neutral"
}
```

### Log4j JSON configuration format

If you are familiar with log4j, you may have noticed that Woodman's JSON configuration takes some leeway with log4j's [JSON Configuration](http://logging.apache.org/log4j/2.x/manual/configuration.html#JSON). In log4j, the JSON configuration is a direct translation of the XML configuration (where XML tags become property keys). Woodman JSON configuration is intended to be more natural to write for people used to JSON.

That said, Woodman also supports the log4j JSON configuration format, meaning that you may use Appender, Filter or Layout types as property keys if you so wish and start your configuration object with a `configuration` root. For instance, the configuration example presented earlier may also be written as:

```json
{
  "configuration": {
    "appenders": {
      "Console": {
        "name": "theconsole",
        "PatternLayout": {
          "pattern": "%message"
        }
      },
      "Socket": {
        "name": "socketserver",
        "url": "http://socketserver.example.org",
        "level": "error",
        "JSONLayout": {}
      }
    },
    "filters": {
      "RegexFilter": {
        "regex": "(^|\\s)dummy(\\s|$)",
        "match": "deny",
        "mismatch": "neutral"
      }
    },
    "loggers": {
      "root": {
        "level": "log",
        "appender-ref": {
          "ref": "socketserver"
        }
      },
      "logger": [
        {
          "name": "base",
          "level": "info",
          "appender-ref": {
            "ref": "theconsole"
          }
        },
        {
          "name": "base.lib.unstable",
          "level": "log"
        }
      ]
    }
  }
}
```

### Console configuration shortcut
It is common to want to log everything to the console to start with. Not to have to think too hard about the configuration object to create to make that possible, Woodman gives you the possibility to provide the string `'console'` instead of the regular configuration object, optionally completed with the [pattern](#patternlayout) that you would like to use.

For instance, in a Web browser, the following calls to `load` are equivalent and mean *Console, all the things!*:
```javascript
woodman.load('console', function (err) {});

woodman.load({
  loggers: [
    {
      level: 'all',
      appenders: [
        {
          type: 'Console',
          name: 'console',
          appendStrings: false,
          layout: {
            type: 'pattern',
            pattern: '%d{yyyy-MM-dd HH:mm:ss} [%logger] %message%n'
          }
        }
      ]
    }
  ]
}, function (err) {});
```

Similarly, the following calls to `load` are equivalent:
```javascript
woodman.load('console [%logger] %level - %message%n', function (err) {});

woodman.load({
  loggers: [
    {
      level: 'all',
      appenders: [
        {
          type: 'Console',
          name: 'console',
          layout: {
            type: 'pattern',
            pattern: '[%logger] %level - %message%n'
          }
        }
      ]
    }
  ]
}, function (err) {});
```


## Precompilation

When you package your application for release, you may not want that version to log anything, be it only because it is quite useless to log things to a destination that no one will ever see. While it's easy to silence Woodman, leaving the calls to Woodman in the code has a couple of drawbacks:

- Size often matters for a release version. It is common practice to run a JavaScript minifier to shrink the size of the code to a bare minimum before release. Including Woodman and calls to Woodman take up useful bytes for just about nothing.
- Speed matters as well and, even though they do not do anything when Woodman is configured not to log anything, calls to Woodman are regular JavaScript function calls that consume a little bit of time and memory.

Not being able to remove logs from the code is probably one of the reasons why most JavaScript libraries do not contain logging traces in the first place. Woodman would not be *that* useful if it could not address that issue. Fortunately, it can!

The *precompiler* that comes bundled with Woodman strips your code from all references to Woodman.

### Run the precompiler
To run the precompiler on a JavaScript file, clone Woodman's repository to some local folder, run `npm install` on that folder and run the following node.js command:

```
node {PATH TO WOODMAN}/precompile/precompiler.js {JSFILE}
```

This will output the resulting code directly to the console. To output the result to a named file, simply redirect the console to a file or provide an output file:

```
node {PATH TO WOODMAN}/precompile/precompiler.js {JSFILE} {OUTPUTJSFILE}
```

This may take up some time, from a couple of seconds for small JavaScript files up to a minute or so for large JavaScript files (>500Kb).

The precompiler can also process recursively all JavaScript files in a folder and create a similar folder structure where all JavaScript files have been precompiled:
```
node {PATH TO WOODMAN}/precompile/precompiler.js {JSFOLDER} {OUTPUTFOLDER}
```

### What the precompiler does

The precompilation:

- removes references to Woodman in AMD define calls, e.g.:
  `define(['woodman'], function (woodman) { ... });`
- removes references to Woodman in node.js require calls, e.g.:
  `var woodman = require('woodman');`
- removes calls to `woodman.load` or `woodman.start`, replacing it by a call to its callback argument directly
- removes calls such as `var logger = woodman.getLogger()`, dropping the variable declaration along the way
- removes calls to `logger.*` where `logger` is the variable name defined as the result of a call to `woodman.getLogger()`
- removes the configuration definition used in the call to `woodman.initialize` or `woodman.load`

### Limits of the precompiler
If you are familiar with what an *Abstract Syntax Tree (AST)* is, you probably know that manipulating JavaScript code to produce a slightly modified version of that code is not an easy task. While the precompilation process should account for all usual uses of the Woodman library, it does have its limits.

Here are examples of code correctly handled by the precompilation:

```javascript
// Logger variable defined and assigned on different lines
// (but note the variable declaration is not removed in that case)
var logger;
logger = woodman.getLogger('foo');

// Logger variable defined with another name
var anotherLogger = woodman.getLogger('foo');

// Logger variable defined with along with other variables
// (the function keeps the variable but nulls it in that case)
var logger = woodman.getLogger('foo'), j=3;

// Logger used directly
woodman.getLogger('foo').log('message');
```

Some cases that are not correctly handled by the precompilation function,
and that may generate invalid code in the end:

```javascript
// Calling a trace function within another statement
var l = logger.log('message');
if (logger.log('message')) {}
if (true) logger.log('message');

// Assigning the logger to another variable
var logger = woodman.getLogger('foo');
truc = logger;
truc.log('message');

// Re-assigning the logger variable
var logger = woodman.getLogger('foo');
logger = somethingelse;
logger.machin = 4;

// Not using the dot notation to call Logger functions
var logger = woodman.getLogger('blah');
logger['info']('Oh no!')
```

Internally, Woodman's precompiler uses [Esprima](http://esprima.org/) to produce the AST and an adapted version of [Falafel](https://github.com/substack/node-falafel) to update the code.


## Available distributions

The `dist/` folder in Woodman's repository contains different builds of Woodman. These builds differ by the types of Appenders they support and by the way the library exports itself to the underlying JavaScript runtime environment. If you're desesperatly looking for a distribution that does not yet exist, the [Development](#development) section explains how to build the distribution of Woodman of your dreams.

### Main distribution
The [dist/woodman.js](https://raw.github.com/joshfire/woodman/master/dist/woodman.js) file is the main build of Woodman, designed to run *everywhere*. It is the one that you get when you install Woodman through an `npm install` command. The distribution supports the `Console`, `File`, `RollingFile` and `Socket` appenders (although note the `File` and `RollingFile` appenders de facto cannot be used in a Web browser environment). The `dist/woodman.js` file exports a global `woodman` object if `window` is defined, a node.js module if `module.exports` is defined, and an AMD module if the `define` function is defined. This should make it easy to use Woodman in a vast majority of JavaScript runtime environments.

However, if you're as picky as we are, you may not appreciate the fact that Woodman leaks to the global scope in that distribution when `window` is defined. You may also run into situations where `window`, `define` or `module.exports` exist but do not have their usual meaning. This is where the *AMD module*, *node.js* or *Web browser* distribution might be useful.

### AMD module
If you want to use Woodman in a project that uses AMD modules, use the [dist/woodman-amd.js](https://raw.github.com/joshfire/woodman/master/dist/woodman-amd.js) file. This distribution is the same as the main distribution but it only exports Woodman as an AMD module and thus never leaks to the global scope.

### Console distribution
If you only need to use the `Console` appender and would prefer Woodman to remain as small as possible, use the [dist/woodman-console.js](https://raw.github.com/joshfire/woodman/master/dist/woodman-console.js) file. This distribution is the same as the main distribution but it drops support for the `Socket` appender in particular that amounts for a bit less than 2/3 of the size of the main distribution. Resulting size is `~20Ko` (`~10Ko` if compressed).

### Web Browser
Similarly, if you want to use Woodman in a project that will only run in Web browsers, the [dist/woodman-browser.js](https://raw.github.com/joshfire/woodman/master/dist/woodman-browser.js) file contains all that you need. It exports a global `woodman` object and does not contain the code of the `File` Appender since it is useless in that context.

### Web Browser AMD
If you want to use Woodman in a project that uses AMD modules and only runs in Web browser, the [dist/woodman-browser-amd.js](https://raw.github.com/joshfire/woodman/master/dist/woodman-browser-amd.js) file is a combinaison of the previous two distributions: it does not support the `File` Appender and exports Woodman as an AMD module.

### node.js module
If you want to use Woodman in a node.js only project, the [dist/woodman-node.js](https://raw.github.com/joshfire/woodman/master/dist/woodman-node.js) file is the same as the main distribution but it only exports Woodman as a node.js module.

### node.js AMD
IF you want to use Woodman in a node.js only project that uses AMD modules, the [dist/woodman-node-amd.js](https://raw.github.com/joshfire/woodman/master/dist/woodman-node-amd.js) file is the same as the node.js module but only exports Woodman as an AMD module.

### The "disabled" distribution
The [dist/woodman-disabled.js](https://raw.github.com/joshfire/woodman/master/dist/woodman-disabled.js) distribution is a tiny file (less than 1Kb) that contains a shim of Woodman that simply does nothing. You may want to use that distribution if you cannot or do not want to run Woodman's precompiler on your t. project for some reason but still would like to silence Woodman in a release version of the project without having to include a full release of Woodman in the mix. By definition, that shim does not support any Appender but equally will not complain if the configuration references types of Appender it does not know anything abou


## Development
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
node test/runner.js
```

Unless something is wrong with the version of Woodman on which you run the tests, you should see a friendly green message that looks like `xxx specs, 0 failures`.

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


## About

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

The Woodman library is licensed under the [MIT license](https://raw.github.com/joshfire/woodman/master/LICENSE).

The Woodman library uses, extends or was at least partially based on other great open-source projects:

- [RequireJS](http://requirejs.org/). Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved. [New BSD or MIT licensed](https://github.com/jrburke/requirejs/blob/master/LICENSE)
- [Almond](https://github.com/jrburke/almond). Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved. [New BSD or MIT licensed](https://github.com/jrburke/almond/blob/master/LICENSE)
- [Socket.IO](http://socket.io/). Copyright(c) 2011 LearnBoost <dev@learnboost.com>, MIT Licensed
- [log4javascript](http://log4javascript.org/), Copyright Tim Down, [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)
- and obviously [Apache Log4j 2](http://logging.apache.org). Copyright © 1999-2013 Apache Software Foundation. All Rights Reserved. [Apache License, Version 2.0](http://logging.apache.org/log4j/2.x/license.html)


## Changelog

@@TODO