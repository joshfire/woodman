---
title: Changelog
layout: page
---

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
