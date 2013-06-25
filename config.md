---
title: Configuration
layout: page
---

In the absence of a proper configuration, calls to trace functions will not produce anything. To actually start logging something somewhere, you need to specify **what**, **how** and **where** to log events. This is all done through the configuration of Woodman, defined in a declarative JavaScript object that can be serialized as JSON.

The `console` string used in the examples of the [Getting started](getstarted.html) section is a [shortcut notation](#console-configuration-shortcut) that tells Woodman to send everything to the console using a usual pattern. You can achieve much more using a proper configuration object.

## <a id="basic-concepts-and-classes"></a>Basic concepts and classes

In Woodman, a [Logger](#logger) applies [filters](#filter) to a [log event](#log-event) to determine whether to send that event to registered [appenders](#appender) where it will be formatted according to some [layout](#layout). This section goes a bit more into details about these concepts. Interested readers may also check the [Apache Log4j documentation](http://logging.apache.org/log4j/2.x/manual/architecture.html).

### <a id="logger"></a>Logger
The Logger class is the *one* class you will interact with in your code. It exposes the trace functions that you will call to log messages.

A Logger has a name, a level, and may link to a list of Appenders and a Filter. Appenders and Filters are created once and for all when the [Woodman configuration](#loading-woodman-configuration) is loaded. Your code will never have to deal with Appenders and Filters directly in particular, only through configuration directives.

The names of the Logger implicitly create a Logger hierarchy: a logger is an ancestor of another one when its name followed by a dot is a prefix of the other logger name (e.g. a Logger named `daddy` is an ancestor of one named `daddy.baby`). Woodman maintains a root logger named `[root]` at the top of the hierarchy.

Although not a requirement, applications will typically instantiate one Logger per module to be able to filter logs based on their module of origin. It is perfectly ok to create more than one Logger per module although note that Woodman keeps a pointer on all created Logger instances, so you should not instantiate too many of them (for instance, it is likely not a good idea to have a `for` loop that runs thousands of times and creates one Logger at each iteration). You may also decide to maintain and use only one Logger throughout the application but note that kind of kills to possibility to filter out log events that makes Woodman useful in the first place.

### <a id="log-event"></a>Log event
A LogEvent is the object created internally when the user issues a call to one of a Logger's trace functions. It contains the actual message sent to the trace function as well as meta-information such as the current date, the name of the Logger that created it or the trace level.

Appenders, Filters and Layouts all operate on an instance of the LogEvent class.

### <a id="appender"></a>Appender
Appenders are responsible for delivering LogEvents to their destination. The Console Appender is the main appender that more or less all applications will use. Other possibilities such as logging to a file or sending events to a remote server over Web sockets are possible, although note Woodman only ships with a couple of Appenders for the time being.

### <a id="filter"></a>Filter
Filters allow LogEvents to be evaluated to determine whether they should be published. Filtering rules depend on the type of Filter being used. A typical Filter is the RegexFilter that applies a regular expression to the formatted message of a LogEvent and takes a decision based on whether the regular expression matched or not. The decision may either be *accept* to accept the log event right away, *deny* to reject the log event altogether, or *neutral* to leave the decision to further filters.

As explained in the [Apache Log4j documentation](http://logging.apache.org/log4j/2.x/manual/filters.html), filters may be attached to different locations:

- Context-wide Filters run before all the other filters. Events that are rejected by these filters will not be passed to loggers for further processing. Once an event has been accepted by a Context-wide filter it will not be evaluated by any other Context-wide Filters nor will the Logger's Level be used to filter the event. The event will be evaluated by Logger and Appender Filters however.
- Logger Filters are configured on a specified Logger. These are evaluated after the Context-wide Filters and the Log Level for the Logger. Events that are rejected by these filters will be discarded and the event will not be passed to a parent Logger regardless of the additivity setting.
- Appender Filters are used to determine if a specific Appender should handle the formatting and publication of the event.

(Note Woodman does not support Appender Reference Filters)

### <a id="layout"></a>Layout
A Layout formats a LogEvent into a form that meets the needs of an Appender, in most cases a string. The formatted form depends on the type of Layout. A typical example is the PatternLayout that takes a pattern string and formats a LogEvent according to follow that pattern. Other Layouts are possible although note Woodman only ships with a couple of Layouts for the time being.


## <a id="loading-woodman-configuration"></a>Loading Woodman configuration

You will typically load the configuration object once and for all when your application is started with code such as:

```javascript
// Load Woodman configuration
woodman.load({
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
});

// Main code of your application
```

Woodman throws an exception if loading fails. This may happen if the configuration is invalid or if an appender refuses to start.

Depending on the configuration, the call to `load` may actually trigger asynchronous processing. For instance, if you use a `SocketAppender`, the connection to the socket server may take some time to get established. Woodman automatically keeps track of log events it receives before it is started and processes them afterwards (up to a certain point, see [maxPendingEvents](#maxpendingevents) for details). Alternatively, you may provide a callback function to the `load` call:

```javascript
woodman.load('console', function (err) {
  if (err) {
    // Initialization failed
  }
  // Woodman is up and running
});
```

## <a id="configuration-outline"></a>Configuration outline

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

## <a id="logger-definition"></a>Logger definition

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

## <a id="appender-definition"></a>Appender definition

An Appender definition contains one or more of the following properties:

- `appendStrings`: Boolean flag that determines whether to log only strings or to log objects as objects. Preserving objects may be useful in Web browsers as the console often represents an object with an expandable structure. Default value is `true`.
- `filters`: The list of filters to apply to log events (provided that they are at the right level) to determine whether the Appender processes it. See [Filter definition](#filter-definition) for details. The order of the filters in the list determines the order of application.
- `layout`: The layout used by the Appender. The property is required. See [Layout definition](#layout-definition) for details.
- `level`: The trace level of the Appender. Log events above that level are rejected. Possible values are `all`, `log`, `info`, `warn`, `error` and `off` (although note the `off` value is kind of stupid since it basically creates an Appender that does not log anything).
- `type`: The type of the Appender. The property is required. Possible values are `Console` to log events to the console, `Socket` to send log events to a remote Web socket server, `File` and `RollingFile` to send log events to a file (provided you are running in a node.js environment). More types may be added in the future (see [Add a new Appender](contribute.html#add-a-new-appender) for details).
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

## <a id="layout-definition"></a>Layout definition

A Layout definition contains a `type` property that specifies the type of Layout to use to format the underlying log event. Possible values are `JSONLayout` to log events in a JSON structure and `PatternLayout` to format log events according to a pattern string. More types may be added in the future (see [Add a new Layout](contribute.html#add-a-new-layout) for details).

Other properties depend on the type of Layout.

### <a id="jsonlayout"></a>JSONLayout

A `JSONLayout` formats a log event as a JSON structure. The following properties may be set to fine-tune how the formatting is achieved:

- `compact`: A boolean that determines whether the resulting JSON string is compact or more human readable with tabs and carriage returns. Default value is `false`.
- `depth`: The depth at which to serialize the message of a log event is the `messageAsObject` flag is set. Default value is `2`.
- `messageAsObject`: Whether to format the message of a log event as an object or as a string. Default value is `false`.

### <a id="patternlayout"></a>PatternLayout

A `PatternLayout` formats a log event as a string that follows a pattern string. The following properties may be set:

- `pattern`: The pattern string used to format the log event. See below for details.
- `compactObjects`: A boolean flag that determines whether to serialize objects using a compact form. Default value is false.

The pattern string is composed of literal text and format control expressions called conversion specifiers. A conversion specifier starts with a `%` and is followed by optional *format modifiers* and a *conversion pattern*.

Note that any literal text may be included in the conversion pattern.

The *conversion patterns* supported by the pattern string are based on those defined by the [Apache Log4j documentation](http://logging.apache.org/log4j/2.x/manual/layouts.html#PatternLayout), but note Woodman only supports the following conversion patterns:

- `c` or `logger`: The name of the Logger
- `d` or `date`: The date of the log event. The actual date format to use may specified in a following set of braces, with predefined values `ABSOLUTE`, `COMPACT`, `DATE`, `ISO8601` and `ISO8601_BASIC`. You may also define formats such as `dd MMM yyyy HH:mm:ss,SSS`.
- `highlight`: To add colors based on the current log event. Colors are added to the pattern string enclosed in a following set of braces, e.g. `%highlight{{ "{%" }}level %message}`.
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
  "pattern": "%date{COMPACT} %highlight{{ "{%" }}-5level} [%logger] - %message%n"
}
```

## <a id="filter-definition"></a>Filter definition

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

## <a id="configuration-options"></a>Configuration options

Other configuration options can be set in the `properties` property. The `maxPendingEvents` setting is the only option available. More options may be added over time.

### <a id="maxpendingevents"></a>maxPendingEvents

Depending on configuration parameters, starting the appenders may take some time. Log events received while appenders get started are kept in memory and processed when Woodman is ready. To ensure that Woodman does not take up too much memory, only the last 1000 log events are kept in memory (Woodman will log a warning when it had to discard a bunch of log events). If your application creates many log events during initialization that you would prefer not to lose, you may increase the number of log events that Woodman keeps in memory through the `maxPendingEvents` option.

```javascript
woodman.load({
  properties: {
    maxPendingEvents: 10000
  },
  // rest of your config
});
```

Instead of increasing that number, consider providing a callback function to the `load` function to wait for Woodman to start before logging events:

```javascript
woodman.load({
  // config
}, function (err) {
  // Start logging events
});
```

## <a id="log4j-json-configuration-format"></a>Log4j JSON configuration format

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

## <a id="console-configuration-shortcut"></a>Console configuration shortcut
It is common to want to log everything to the console to start with. Not to have to think too hard about the configuration object to create to make that possible, Woodman gives you the possibility to provide the string `'console'` instead of the regular configuration object, optionally completed with the [pattern](#patternlayout) that you would like to use.

For instance, in a Web browser, the following calls to `load` are equivalent and mean *Console, all the things!*:

```javascript
woodman.load('console');

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
});
```

Similarly, the following calls to `load` are equivalent:

```javascript
woodman.load('console [%logger] %level - %message%n');

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
});
```
