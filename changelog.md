---
title: Changelog
layout: page
---

## <a id="v1.1.0"></a>v1.1.0 - 28 January 2014

Changelog since v1.0.0:

- Bug fix: Console appender crashed when given null messages ([#32](https://github.com/joshfire/woodman/issues/32))
- New `RegexLoggerNameFilter` filter ([#30](https://github.com/joshfire/woodman/issues/30))

## <a id="v1.0.0"></a>v1.0.0 - 31 December 2013

All known bugs should have been fixed. Time to publish v1.0!

Changelog since v0.9.0:

- Bug fix: Full distribution crashed in an app optimized with r.js ([#20](https://github.com/joshfire/woodman/issues/20))
- Bug fix: The `disabled` distribution did not support the synchronous variant of the `load` function introduced in [v0.7.0](#v0.7.0) ([#26](https://github.com/joshfire/woodman/issues/26))
- Bug fix: Raw source version crashed if it was used in a Node.js environment without RequireJS ([#27](https://github.com/joshfire/woodman/issues/27))
- Upgraded all dependencies to their latest version
- New `%domain` pattern in `PatternLayout` to output Node.js domain ID if available ([#28](https://github.com/joshfire/woodman/issues/28))

## <a id="v0.9.0"></a>v0.9.0 - 14 November 2013

- Woodman throws a "woodman.Error" error when load fails ([#15](https://github.com/joshfire/woodman/issues/15))
- Woodman available as a Bower package ([#22](https://github.com/joshfire/woodman/issues/22), [#23](https://github.com/joshfire/woodman/issues/23)), thx @elskwid
- Precompiler supports unknown logger/woodman functions ([#f8edc9a54e](https://github.com/joshfire/woodman/commit/f8edc9a54e156807c3556c3bb66db71ec018a43e))
- Precompiler crashed when RequireJS sugar syntax was used ([#25](https://github.com/joshfire/woodman/issues/25))

## <a id="v0.8.0"></a>v0.8.0 - 27 June 2013

- `registerLevel` now creates corresponding trace functions on loggers ([#16](https://github.com/joshfire/woodman/issues/16)), meaning you can register the level `fatal` and start calling `logger.fatal` right away
- Added JUnit XML report file generation to test runner


## <a id="v0.7.0"></a>v0.7.0 - 08 June 2013

- Synchronous use of `woodman.load` possible and encouraged ([#3](https://github.com/joshfire/woodman/issues/3))
- New `maxPendingEvents` option to adjust size of memory buffer ([#3](https://github.com/joshfire/woodman/issues/3))
- Bug fix: `load` did not pass the error to callback function ([#14](https://github.com/joshfire/woodman/issues/14))
- Bug fix: The end of substitution string was lost ([#13](https://github.com/joshfire/woodman/issues/13))
- Bug fix: Time taken reported by the precompiler was incorrect ([#11](https://github.com/joshfire/woodman/issues/11))
- Bug fix: Woodman crashed when logging an undefined value ([#12](https://github.com/joshfire/woodman/issues/12))
- Doc: started to rewrite intro ([#7](https://github.com/joshfire/woodman/issues/7))


## <a id="v0.6.0"></a>v0.6.0 - 30 May 2013

- Added Woodman traces to precompiler library to monitor performances
- New `--verbose` option for the cli of the precompiler
- `appendStrings: false` in ConsoleAppender preserves objects ([#5](https://github.com/joshfire/woodman/issues/5))
- Config shortcut `console` preserves objects by default in browsers


## <a id="v0.5.0"></a>v0.5.0 - 15 May 2013

- Fixed console only distribution (wrapping code was invalid)
- New `console` configuration shortcut notation to get started faster
- New `RollingFile` Appender for use in Node.js runtime environments
- New "console only" distribution added to shrink size of Woodman


## <a id="v0.4.0"></a>v0.4.0 - 14 May 2013

- New File Appender implemented (node.js runtime only)
- Distributions shims fixed (e.g. standalone execution in node.js)
- Proper copyright and licenses mentioned in distributions
- Grunt tasks cleaned


## <a id="v0.3.0"></a>v0.3.0 - 13 May 2013

- Documentation completed
- RegexFilter: default values updated to match log4j
- Logger: inherits Filter on top of trace level from its ancestor
- Console and Socket appenders now have the same names as in log4j
- Updated build file to Grunt v0.4
- new `registerLevel` function exposed in LogManager


## <a id="v0.2.1"></a>v0.2.1 - 05 May 2013

- Bug fix: LogManager did not expose the registerFilter method,
meaning v0.2.0 is a non working version in practice.
- Feature: String parameters substitution support: `log('H{}!', 'ey');`
- Feature: Decision to use "toString" based on method overloading
- Feature: PatternLayout supports non abbreviated conversion patterns
- Feature: Log event filtering supported, RegexFilter created
- Chore: switched to require.js shortcut notation
- Bug fix: JSONLayout did not return the right object structure