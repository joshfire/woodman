---
title: Get started
layout: page
---

### Using Woodman in a node.js application
Woodman is available as an [npm package](https://npmjs.org/package/woodman). To install Woodman in your node.js application:
```
npm install woodman
```

Woodman needs to load some configuration before it may be used:
```javascript
var woodman = require('woodman');

// "console" means "console all the things!". See configuration for details.
woodman.load('console');

// Instantiate a Logger instance
var logger = woodman.getLogger('main');

// Start logging messages
logger.log('Woodman is up and running');
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
woodman.load('console');

// Instantiate a Logger
var logger = woodman.getLogger('main');

// Start logging messages
logger.log('Woodman is up and running');
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
  woodman.load('console');
  var logger = woodman.getLogger('main');
  logger.log('Yeepee');
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
