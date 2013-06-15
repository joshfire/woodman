---
title: Download
layout: page
---

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
The [dist/woodman-disabled.js](https://raw.github.com/joshfire/woodman/master/dist/woodman-disabled.js) distribution is a tiny file (less than 1Kb) that contains a shim of Woodman that simply does nothing. You may want to use that distribution if you cannot or do not want to run Woodman's precompiler on your project for some reason but still would like to silence Woodman in a release version of the project without having to include a full release of Woodman in the mix. By definition, that shim does not support any Appender but equally will not complain if the configuration references types of Appender it does not know anything abou
