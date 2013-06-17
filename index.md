---
title: Woodman
layout: home
---

Woodman is roughly as simple to use as the `console`, only much more powerful:

```javascript
// Using Woodman                            // Using the console
woodman.load('console');
var logger = woodman.getLogger('myapp');
logger.log('Hello Woodman');                console.log('Hello Woodman');
logger.warn('This is a warning');           console.warn('This is a warning');
logger.error('This is an error');           console.error('This is an error');
```

Behind the scenes, Woodman lets you take precise control over **what** gets logged **where** and **how**. In particular, Woodman features:

- **message levels** similar to those exposed by the `console` object (`log`, `info`, `warn`, `error`). Through configuration, messages may be filtered based on their level.
- a **logger hierarchy** to keep track of the origin of messages and disable some of them based on their origin.
- **appenders** to change the destination where messages are sent without changing the code. Messages can be sent to multiple destinations at once. Examples of appenders include the `console`, a log file or a remote server using Web sockets. New appenders can easily be created.
- **layouts** to specify the format and structure of the messages sent to an appender: raw string, CSV, JSON, XML, whatever. New layouts can easily be created.
- **filters** to disable messages based on something else than their level or origin.
- a **removal tool** that drops all traces of Woodman from your code to create a shipping version of your app without logs. With Woodman, no more `console.log` in your production code! See [Precompilation](#precompilation) for details.

Woodman runs in Web browsers and in [node.js](http://nodejs.org) applications. The main distribution exposes a global `woodman` object if `window` is defined, a node.js module if `module.exports` is defined, and an [AMD module](http://requirejs.org/docs/whyamd.html#amd) if the `define` function is defined. [Other distributions](#available-distributions) that do not make assumptions about the underlying JavaScript runtime are available.

What now? If that all sounds clear and great, [get started](#getting-started) then check the [Woodman configuration](#woodman-configuration) section. If you're ready to dig in the code to fix a bug or implement a new Appender, Layout or Filter, take a look at the [Development](#development) section. Last but not least, if you cannot help but wonder why Woodman exists at all, what it brings on top of the usual `console` and how it relates to other similar projects, check the [About](#about) section.

Wherever applicable, Woodman follows the architecture, terminology and API of the [Apache Log4j 2](http://logging.apache.org/log4j/2.x/) project.
