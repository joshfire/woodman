# Woodman

Woodman is a **JavaScript logger utility** for Web applications and Node.js applications. Woodman is roughly as simple to use as the `console`, only much more powerful. Woodman lets you take precise control over **what** gets logged **where** and **how**... and knows how to disappear from production code if needed. 

```javascript
// Using Woodman                            // Using the console
woodman.load('console');
var logger = woodman.getLogger('myapp');
logger.log('Hello Woodman');                console.log('Hello Woodman');
logger.warn('This is a warning');           console.warn('This is a warning');
logger.error('This is an error');           console.error('This is an error');
```

Woodman features:

- **message levels** similar to those exposed by the `console` object (`log`, `info`, `warn`, `error`). Through configuration, messages may be filtered based on their level.
- a **logger hierarchy** to keep track of the origin of messages and disable some of them based on their origin.
- **appenders** to change the destination where messages are sent without changing the code. Messages can be sent to multiple destinations at once. Examples of appenders include the `console`, a log file or a remote server using Web sockets. New appenders can easily be created.
- **layouts** to specify the format and structure of the messages sent to an appender: raw string, CSV, JSON, XML, whatever. New layouts can easily be created.
- **filters** to disable messages based on something else than their level or origin.
- a **removal tool** that drops all traces of Woodman from your code to create a shipping version of your app without logs. With Woodman, no more `console.log` in your production code! See [Precompilation](#precompilation) for details.

Wherever applicable, Woodman follows the architecture, terminology and API of the [Apache Log4j 2](http://logging.apache.org/log4j/2.x/) project.

To get started with Woodman, check the [documentation Web site](http://joshfire.github.io/woodman/).

## License

The Woodman library is licensed under the [MIT license](https://raw.github.com/joshfire/woodman/master/LICENSE). Copyright (c) 2013 Joshfire. All rights reserved.

See the [license](http://joshfire.github.io/woodman/about#license) section for details.