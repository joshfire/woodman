---
title: Remove traces
layout: page
---

When you package your application for release, you may not want that version to log anything, be it only because it is quite useless to log things to a destination that no one will ever see. While it's easy to silence Woodman, leaving the calls to Woodman in the code has a couple of drawbacks:

- Size often matters for a release version. It is common practice to run a JavaScript minifier to shrink the size of the code to a bare minimum before release. Including Woodman and calls to Woodman take up useful bytes for just about nothing.
- Speed matters as well and, even though they do not do anything when Woodman is configured not to log anything, calls to Woodman are regular JavaScript function calls that consume a little bit of time and memory.

Not being able to remove logs from the code is probably one of the reasons why most JavaScript libraries do not contain logging traces in the first place. Woodman would not be *that* useful if it could not address that issue. Fortunately, it can!

The *precompiler* that comes bundled with Woodman strips your code from all references to Woodman.

## <a id="run-the-precompiler"></a>Run the precompiler
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

## <a id="what-the-precompiler-does"></a>What the precompiler does

The precompilation:

- removes references to Woodman in AMD define calls, e.g.:
  `define(['woodman'], function (woodman) { ... });`
- removes references to Woodman in node.js require calls, e.g.:
  `var woodman = require('woodman');`
- removes calls to `woodman.load` or `woodman.start`, replacing it by a call to its callback argument directly if they are available
- removes calls such as `var logger = woodman.getLogger()`, dropping the variable declaration along the way
- removes calls to `logger.*` where `logger` is the variable name defined as the result of a call to `woodman.getLogger()`
- removes the configuration definition used in the call to `woodman.initialize` or `woodman.load`

## <a id="limits-of-the-precompiler"></a>Limits of the precompiler
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
// NOT SUPPORTED: Calling a trace function within another statement
var l = logger.log('message');
if (logger.log('message')) {}
if (true) logger.log('message');

// NOT SUPPORTED: Assigning the logger to another variable
var logger = woodman.getLogger('foo');
truc = logger;
truc.log('message');

// NOT SUPPORTED: Re-assigning the logger variable
var logger = woodman.getLogger('foo');
logger = somethingelse;
logger.machin = 4;

// NOT SUPPORTED: Not using the dot notation to call Logger functions
var logger = woodman.getLogger('blah');
logger['info']('Oh no!')
```

Internally, Woodman's precompiler uses [Esprima](http://esprima.org/) to produce the AST and an adapted version of [Falafel](https://github.com/substack/node-falafel) to update the code.
