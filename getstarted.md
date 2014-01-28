---
title: Get started with Woodman
layout: page
---

Woodman is extremely easy to use: the only real difference with the usual `console` is that you will typically instantiate one logger per JavaScript module that you will then use as if it were the `console`. Controlling what gets logged where and how comes at a later stage through configuration. No need to worry about that to start using Woodman!


## <a id="web"></a>Using Woodman in a Web browser

1. [Download Woodman](https://raw.github.com/joshfire/woodman/master/dist/woodman.js), install Woodman with [Bower](http://bower.io/), or copy the `dist/woodman.js` file of the Git repository to the JavaScript folder of your Web application.
2. Reference that file from a `script` tag in the HTML page before any script that is to use Woodman
3. Load Woodman's configuration
4. Use Woodman!

```html
<script type="text/javascript" src="path-to-js/woodman.js"></script>
<script type="text/javascript">
  // Load configuration, "console" means "console all the things!".
  // See configuration for details.
  woodman.load('console');

  // Instantiate a Logger
  var logger = woodman.getLogger('main');

  // Start logging messages
  logger.log('Woodman is up and running');
</script>
```

The call to `woodman.load` needs to appear **only once** in your application. To use Woodman from any JavaScript module referenced by your HTML, you will typically instantiate one logger per module and use it as if it were a `console` object:

```javascript
var logger = woodman.getLogger('path.name');
logger.log('This is a log message');
logger.info('This is an info');
logger.warn('This is a warning');
logger.error('This is an error');
```

Open one of the examples in the [examples/browser](https://github.com/joshfire/woodman/tree/master/examples/browser) folder to see Woodman in action.


## <a id="nodejs"></a>Using Woodman in a node.js application

1. Install Woodman with a call to npm: `npm install woodman`
2. Require `woodman` from your code
3. Load Woodman's configuration
4. Use Woodman!

```javascript
var woodman = require('woodman');

// Load configuration, "console" means "console all the things!".
// See configuration for details.
woodman.load('console');

// Instantiate a Logger
var logger = woodman.getLogger('main');

// Start logging messages
logger.log('Woodman is up and running');
```

The call to `woodman.load` needs to appear **only once** in your application. To use Woodman from any JavaScript module referenced by your HTML, you will typically instantiate one logger per module and use it as if it were a `console` object:

```javascript
var woodman = require('woodman');
var logger = woodman.getLogger('path.name');
logger.log('This is a log message');
logger.info('This is an info');
logger.warn('This is a warning');
logger.error('This is an error');
```

Run examples in the [examples/node.js](https://github.com/joshfire/woodman/tree/master/examples/node.js) folder to see Woodman in action, e.g.:

```bash
node examples/node.js/standalone.js
```


## <a id="amd"></a>Using Woodman as an AMD module

Woodman is compatible with typical AMD loaders. It exports itself as an AMD module named `woodman` if the `define` function is available. As above, the library needs to be initialized once before it may be used, typically in the first module that gets executed (in a Web browser) or within the first call to `requirejs` (in a node.js application):

```javascript
requirejs(['woodman'], function (woodman) {
  // "console" means "console all the things!".
  // See configuration for details.
  woodman.load('console');
  var logger = woodman.getLogger('main');
  logger.log('Yeepee');
});
```

Then, to define a module that depends on Woodman:

```javascript
define(['woodman'], function (woodman) {
  var logger = woodman.getLogger('loggername');
  logger.log('Using Woodman in an AMD module');
});
```


## <a id="web"></a>Using Woodman in other JavaScript runtimes

While not tested at this stage, Woodman should run well in a variety of JavaScript runtimes. Please get in touch through the [issue tracking system](https://github.com/joshfire/woodman/issues) if something needs to be done to properly export Woodman to the runtime of your choice.


## <a id="api"></a>The API

The examples presented in the previous sections cover most of the API exposed by Woodman. The library exposes the following public static functions:

* `load(config)`: loads a configuration object. The configuration describes what gets logged where and how. See [Woodman configuration](config.html#loading-woodman-configuration) for details.
* `getLogger(name)`: retrieves an instance of a Logger object with the given name. Dots in the name create an logger hierarchy. Again, see [Woodman configuration](config.html#logger) for details.
* `registerAppender`, `registerLayout`, `registerLevel`: registers an Appender, a Layout or a Log level. You should not need to use these functions unless you want to customize Woodman. See [Contribute](contribute.html) for details.

The Logger instance returned by `getLogger` exposes trace functions similar to those of the `console`:

* `log`: logs a message at the log level
* `info`: logs a message at the info level
* `warn`: logs a warning message
* `error`: logs an error message

These functions behave as those of the usual `console` object, meaning that they can take any number of arguments of basically any type.

There are a couple of differences though:

1. If the first parameter is a string, Woodman replaces the occurrences of `{}` in that string with the string serialization of the remaining parameters.
2. Woodman produces strings by default. If you pass an object, Woodman will not output the object itself but a serialization of that object as a string. If the object overrides `toString`, that serialization is the result of calling `toString`. If not, it is a JSON serialization of the first levels of the object. You may log real objects e.g. within a Web browser console thanks to the `appendStrings` setting. See [Appender definition](config.html#appender-definition) in configuration page for details.

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
