/**
 * @fileoverview This module exposes a precompile function that processes
 * JavaScript code to remove any trace of the Woodman library.
 *
 * The precompilation process is not perfect and does not handle all possible
 * use cases. It should account for all usual uses of the Woodman library
 * though.
 *
 * The function:
 * - removes references to Woodman in AMD define calls, e.g.:
 *    define(['woodman'], function (woodman) { ... });
 * - removes references to Woodman in node.js require calls, e.g.:
 *    var woodman = require('woodman');
 * - removes calls to "woodman.load" or "woodman.start", replacing it by a call
 * to its callback argument directly
 * - removes calls such as "var logger = woodman.getLogger()", dropping the
 * variable declaration along the way
 * - removes calls to "logger.*" where "logger" is the variable name defined
 * as the result of a call to "woodman.getLogger()"
 * - removes the configuration definition used in the call to
 * "woodman.initialize" or "woodman.load"
 *
 * Some cases correctly handled by the precompilation function:
 *
 * // Logger variable defined and assigned on different lines
 * // (but note the variable declaration is not removed in that case)
 * var logger;
 * logger = woodman.getLogger('foo');
 *
 * // Logger variable defined with another name
 * var anotherLogger = woodman.getLogger('foo');
 *
 * // Logger variable defined with along with other variables
 * // (the function keeps the variable but nulls it in that case)
 * var logger = woodman.getLogger('foo'), j=3;
 *
 * // Logger used directly
 * woodman.getLogger('foo').log('info');
 *
 * Some cases that are not correctly handled by the precompilation function,
 * and that may generate invalid code in the end:
 *
 * // Calling a trace function within another statement
 * var l = logger.log('info');
 * if (logger.log('info')) { ... }
 *
 * // Assigning the logger to another variable
 * var logger = woodman.getLogger('foo');
 * truc = logger;
 * truc.log('info');
 *
 * // Re-assigning the logger variable
 * var logger = woodman.getLogger('foo');
 * logger = somethingelse;
 * logger.machin = 4;
 *
 * Precompilation requires incremental transformations of the initial code:
 * 1. First pass removes calls to Logger methods log, info, warn, error
 *  ex: logger.log('blah');
 * 2. Second pass removes logger instantiation calls
 *  ex: var logger = woodman.getLogger('foo');
 * 3. Third pass removes config declarations and calls to woodman
 *  initialization methods
 *  ex: woodman.load(config, function (err) { ... })
 * 4. Fourth pass removes references to the Woodman library:
 *  ex: var woody = require('woodman');
 *  ex: define(['woodman'], function (woodman) { ... });
 * 5. Fifth pass removes Woodman library definition, if found:
 *  ex: define('woodman', ...);
 */
/*global module*/

var falafel = require('./falafel');
var _ = require('underscore');
var woodman = require('../dist/woodman');
var logger = woodman.getLogger('precompile');


/**
 * Exports the precompilation function that takes JavaScript code as input and
 * returns the same code without reference to Woodman, or the same code without
 * the trace level calls that the caller does not want to keep.
 *
 * Possible options:
 * - keepLevels: lists the trace levels to keep in the precompiled code.
 *   If the array is empty or not given, the function removes all references to
 *   Woodman from the input code.
 *   Ex: { keepLevels: ['warn', 'error'] }
 * - comment: sets the flag to replace the initial source code with comments
 *   instead of removing the code (when possible)
 * - globalNames: list of global names used to reference Woodman. Defaults to
 *   ['woodman'].
 * - depNames: list of names used to import Woodman in the code. Defaults to
 *   ['woodman', 'joshlib!woodman']
 *
 * @function
 * @param {string} input The JavaScript code to precompile
 * @param {Object} opts Precompilation options. See above for details.
 * @return {string} The precompiled code witout any reference to Woodman or
 *  without the calls at levels that are not in the "keepLevel" array.
 */
module.exports = function (input, opts) {
  if (!input) {
    throw new Error('No input source to precompile');
  }

  // Check options
  opts = opts || {};
  opts.keepLevels = opts.keepLevels || opts.keepLevel || [];
  opts.globalNames = opts.globalNames || ['woodman'];
  opts.depNames = opts.depNames || ['woodman', 'joshlib!woodman'];

  /**
   * Returns the first ancestor of the given node in the AST tree that has the
   * specified node type.
   *
   * @function
   * @param {Object} node The node to start from in the AST tree
   * @param {string} nodeType The type of node you are searching for,
   *  e.g. "VariableDeclaration", "ExpressionStatement"...
   * @return {Object} The first node in the ancestors of the given node that
   *  matches the given type, null if not found
   */
  var searchParentByType = function (node, nodeType) {
    var parentNode = node;
    var levelNode = 0; // Security in while loop
    while ((parentNode.type !== nodeType) &&
        (parentNode.parent !== undefined) &&
        (levelNode <= 20)) {
      levelNode++;
      parentNode = parentNode.parent;
    }
    parentNode.levelNode = levelNode;
    return parentNode;
  };

  /**
   * Removes the source code associated with the given AST node from the
   * precompiled result, provided precompilation is configured to remove
   * all references to Woodman (empty "keepLevels" option).
   *
   * Depending on the "comment" option, the function either converts the
   * original source code to a JavaScript comment or removes it altogether.
   *
   * Important: once this function has been executed, the children of the
   * given node in the AST tree should not be updated in any way.
   *
   * @function
   * @param {Object} node The AST node whose code needs to be removed
   */
  var removeCode = function (node) {
    if (opts.comment) {
      node.update(node.source().replace(/^(.*)$/mg, '// $1'));
    }
    else {
      node.update('');
    }
  };

  /**
   * Extend the AST node to insert information about instances of Woodman
   * that exist at that level.
   *
   * The information we're particularly interested in is:
   * 1. the name(s) of the instance(s) of Woodman defined at that level,
   * e.g. ['woodman', 'woody', 'wood']
   * 2. the name(s) of the instance(s) of Loggers defined at that level,
   * e.g. ['logger', 'loggy', 'dalogger', 'mygreatlogger']
   *
   * The function may update the node's ancestors.
   *
   * The function is similar in essence to Falafel's "insertHelpers" function.
   *
   * @function
   * @param {Object} node The AST node to extend
   */
  var updateContext = function (node) {
    var parent = null;
    var scopeParent = null;
    var interestingNode = null;

    if (!node) return;

    // Info added to a "woodman" namespace to avoid any kind of conflict
    // with other propertis of the AST node.
    node.woodman = node.woodman || {
      instances: [],
      loggers: [],
      configs: []
    };

    // Helper function that retrieves the concatenation of the given list
    // on the current node and all of its ancestors
    node.woodman.getList = function (listName) {
      var list = [];
      var parentNode = node;
      while (parentNode) {
        if (!parentNode.woodman) {
          throw new Error('context not set on parent!');
        }
        list = list.concat(parentNode.woodman[listName]);
        parentNode = parentNode.parent;
      }
      return list;
    };

    // Helper function that retrieves the list of Woodman instance names
    // defined at that level
    node.woodman.getInstances = function () {
      return node.woodman.getList('instances');
    };

    // Helper function that retrieves the list of Woodman logger names
    // defined at that level
    node.woodman.getLoggers = function () {
      return node.woodman.getList('loggers');
    };

    // Helper function that retrieves the list of configuration variables
    // defined at that level
    node.woodman.getConfigs = function () {
      return node.woodman.getList('configs');
    };

    // Insert global names of Woodman to the root
    // (they will be available throughout the tree)
    parent = node.parent;
    if (!parent) {
      node.woodman.instances = opts.globalNames;
      return;
    }

    scopeParent = searchParentByType(node, 'FunctionExpression') ||
      searchParentByType(node, 'Program');
    if (!scopeParent) {
      throw new Error('Could not find the scope of a node');
    }

    // We're only looking for calls to "define", "require", "requirejs"
    // and "woodman" (or similar names) at this step.
    if (node.type !== 'CallExpression') return;
    if (!node.callee) return;

    // Check whether the current AST node is a call to "require"
    if ((node.callee.type === 'Identifier') &&
      (node.callee.name === 'require')) {
      if (node['arguments'] &&
          node['arguments'][0] &&
          (node['arguments'][0].type === 'Literal') &&
          _.include(opts.depNames, node['arguments'][0].value)) {
        if (parent.type !== 'VariableDeclarator') {
          throw new Error('Direct calls to Woodman function such as' +
            ' "require(\'woodman\').initialize(...)" are not yet supported');
        }
        // The "require" call imports "woodman",
        // add that declaration to the current scope
        scopeParent.woodman.instances.push(parent.id.name);
      }
    }

    // Check whether the current AST node is a call to "define" or "requirejs"
    if ((node.callee.type === 'Identifier') &&
      ((node.callee.name === 'define') || (node.callee.name === 'requirejs'))) {
      var tabDefine = {};
      var indArray;
      var instanceName = null;
      if (node['arguments']) {
        if (node['arguments'][0].type === 'ArrayExpression') {
          tabDefine = node['arguments'][0];
          indArray = 0;
        }
        if (node['arguments'][1] &&
          (node['arguments'][1].type === 'ArrayExpression')) {
          tabDefine = node['arguments'][1];
          indArray = 1;
        }
        interestingNode = node['arguments'][indArray + 1];
        // Get instance of woodman in function parameters
        if (tabDefine.elements) {
          for (var i = 0, c = tabDefine.elements.length; i < c; i++) {
            if (_.include(opts.depNames, tabDefine.elements[i].value)) {
              instanceName = node['arguments'][indArray + 1].params[i].name;
            }
          }
        }
      }
      if (instanceName) {
        interestingNode.woodman = interestingNode.woodman || {
          instances: [],
          loggers: [],
          configs: []
        };
        interestingNode.woodman.instances.push(instanceName);
      }
    }

    // Check whether the current AST node is a Logger instantiation
    if ((node.callee.type === 'MemberExpression') &&
      (node.callee.property.name === 'getLogger') &&
      (parent.type === 'VariableDeclarator') &&
      _.find(node.woodman.getInstances(), function (instanceName) {
        return (node.callee.object.name === instanceName);
      })) {
      scopeParent.woodman.loggers.push(parent.id.name);
    }

    // Check whether the current AST node is a call to woodman.initialize
    // or woodman.load and extract the configuration object name
    if ((node.callee.type === 'MemberExpression') &&
      _.include(['initialize', 'load'], node.callee.property.name) &&
      _.find(node.woodman.getInstances(), function (instanceName) {
        return (node.callee.object.name === instanceName);
      })) {
      if (node['arguments'] && node['arguments'][0] &&
        (node['arguments'][0].type === 'Identifier')) {
        scopeParent.woodman.configs.push(node['arguments'][0].name);
      }
    }
  };

  var falafelOpts = {
    insertAdditionalHelpers: updateContext
  };

  if (!input) return input;

  logger.log('start');


  // First pass
  // ----------
  // Remove calls to Logger methods log, info, warn, error
  // ex: logger.log('blah');
  logger.log('first pass to remove calls to Logger methods...');
  var loggerMethods = _.difference(
    ['error', 'warn', 'info', 'log', 'trace'],
    opts.keepLevels);
  logger.log('trace levels to remove', loggerMethods);
  var output = falafel(input, falafelOpts, function (node) {
    if ((node.type === 'CallExpression') &&
        (node.callee.type === 'MemberExpression') &&
        _.include(loggerMethods, node.callee.property.name)) {
      if ((node.callee.object.type === 'Identifier') &&
        _.find(node.woodman.getLoggers(), function (loggerName) {
          return (node.callee.object.name === loggerName);
        })) {
        if (node.parent && node.parent.type === 'ExpressionStatement') {
          logger.info('remove code:', node.parent.source());
          removeCode(node.parent);
        }
        else {
          // Replace the call expression with "null", in other words the
          // returned value of the call to one of these methods
          logger.info('replace code with null:', node.source());
          node.update('null');
        }
      }
      else if ((node.callee.object.type === 'CallExpression') &&
          (node.callee.object.callee.type === 'MemberExpression') &&
          (node.callee.object.callee.property.name === 'getLogger') &&
          _.find(node.woodman.getInstances(), function (instanceName) {
            return (node.callee.object.callee.object.name === instanceName);
          })) {
        if (node.parent && node.parent.type === 'ExpressionStatement') {
          logger.info('remove code:', node.parent.source());
          removeCode(node.parent);
        }
        else {
          // Replace the call expression with "null", in other words the returned
          // value of the call to one of these methods
          logger.info('replace code with null:', node.source());
          node.update('null');
        }
      }
    }
  });
  logger.log('serialize updated code');
  input = output.toString();
  logger.log('first pass to remove calls to Logger methods... done');

  // Stop here if we were to keep some calls to Logger methods,
  // the references to Woodman are still needed in that case.
  if (opts.keepLevels.length > 0) {
    logger.info('some trace levels to keep, no further pass to make');
    return input;
  }


  // Second pass
  // ----------
  // Remove logger instantiation calls
  // ex: var logger = woodman.getLogger('foo');
  logger.log('second pass to remove instantiation calls...');
  output = falafel(input, falafelOpts, function (node) {
    if ((node.type === 'CallExpression') &&
        (node.callee.type === 'MemberExpression') &&
        (node.callee.property.name === 'getLogger') &&
        _.find(node.woodman.getInstances(), function (instanceName) {
          return (node.callee.object.name === instanceName);
        })) {
      if ((node.parent.type === 'VariableDeclarator') &&
          node.parent.parent &&
          (node.parent.parent.type === 'VariableDeclaration') &&
          (node.parent.parent.declarations.length === 1)) {
        // "Classic" one-var declaration, remove the whole line
        // ex: var logger = woodman.getLogger();
        logger.info('remove getLogger var definition:',
          node.parent.parent.source());
        removeCode(node.parent.parent);
      }
      else if ((node.parent.type === 'AssignmentExpression') &&
          node.parent.parent) {
        // Retrieved logger is assigned to an existing variable,
        // remove the whole expression
        // ex: logger = woodman.getLogger();
        logger.info('remove getLogger assignment:',
          node.parent.parent.source());
        removeCode(node.parent.parent);
      }
      else if ((node.parent.type === 'MemberExpression') &&
          node.parent.parent &&
          (node.parent.parent.type === 'CallExpression')) {
        // Logger method called immediately, remove the whole thing
        // ex: woodman.getLogger('foo').log('bar');
        logger.info('remove getLogger call:',
          node.parent.parent.source());
        removeCode(node.parent.parent);
      }
      else {
        // The call to "getLogger" appears among other statements,
        // replace with "null"
        // ex: var foo = 'bar', logger = woodman.getLogger(), k = 0;
        logger.info('replace inline getLogger call with null:', node.source());
        node.update('null');
      }
    }
  });
  logger.log('serialize updated code');
  input = output.toString();
  logger.log('second pass to remove instantiation calls... done');


  // Third pass
  // ----------
  // Remove config objects and calls to woodman initialization methods
  // ex: woodman.load(config, function (err) { ... })
  logger.log('third pass to remove config objects...');
  output = falafel(input, falafelOpts, function (node) {
    var reg = null;
    if ((node.type === 'VariableDeclarator') &&
        (node.id.type === 'Identifier') &&
        _.include(node.woodman.getConfigs(), node.id.name)) {
      if ((node.parent.type === 'VariableDeclaration') &&
          (node.parent.declarations.length === 1)) {
        // "Classic" one-var declaration, remove the whole line
        // ex: var config = {};
        logger.info('remove config var definition:', node.id.name);
        removeCode(node.parent);
      }
      else {
        // Definition part of other definitions, probably, replace with "null"
        // ex: var k = 0, config = {};
        logger.info('replace inline config definition with null:',
          node.id.name);
        node.update(node.id.name + ' = null');
      }
    }
    else if ((node.type === 'AssignmentExpression') &&
        (node.left.type === 'Identifier') &&
        _.include(node.woodman.getConfigs(), node.left.name)) {
      logger.info('remove config assignment:' + node.left.name);
      removeCode(node.parent);
    }
    else if ((node.type === 'CallExpression') &&
        (node.callee.type === 'MemberExpression') &&
        (node.callee.property.name === 'load') &&
        _.find(node.woodman.getInstances(), function (instanceName) {
          return (node.callee.object.name === instanceName);
        })) {
      logger.info('remove call to woodman.load');
      node.update('(' + node['arguments'][1].source() + ')()');
    }
    else if ((node.type === 'CallExpression') &&
        (node.callee.type === 'MemberExpression') &&
        (node.callee.property.name === 'start') &&
        _.find(node.woodman.getInstances(), function (instanceName) {
          return (node.callee.object.name === instanceName);
        })) {
      logger.info('remove call to woodman.start');
      reg = new RegExp(node.callee.object.name + '\\.start');
      node.update(node.source().replace(reg, '') + '()');
    }
    else if ((node.type === 'CallExpression') &&
        (node.callee.type === 'MemberExpression') &&
        (node.callee.property.name === 'initialize') &&
        _.find(node.woodman.getInstances(), function (instanceName) {
          return (node.callee.object.name === instanceName);
        })) {
      logger.info('remove call to woodman.initialize');
      removeCode(node.parent);
    }
  });
  logger.log('serialize updated code');
  input = output.toString();
  logger.log('third pass to remove config objects... done');


  // Fourth pass
  // ----------
  // Remove references to the Woodman library
  // ex: var woody = require('woodman');
  // ex: define(['woodman'], function (woodman) { ... });
  logger.log('fourth pass to remove references to Woodman...');
  output = falafel(input, falafelOpts, function (node) {
    if ((node.type === 'CallExpression') &&
        (node.callee.type === 'Identifier') &&
        (node.callee.name === 'require') &&
        (node.parent.type === 'VariableDeclarator') &&
        node['arguments'] && node['arguments'][0] &&
        (node['arguments'][0].type === 'Literal') &&
        _.include(opts.depNames, node['arguments'][0].value)) {
      if (node.parent.parent &&
          (node.parent.parent.type === 'VariableDeclaration') &&
          (node.parent.parent.declarations.length === 1)) {
        // "Classic" one-var declaration, remove the whole line
        // ex: var woodman = require('woodman');
        logger.info('remove require call:', node.parent.parent.source());
        removeCode(node.parent.parent);
      }
      else {
        // Declaration is part of a multiple declaration statement,
        // replace with "null"
        logger.info('replace inline require call with null:', node.source());
        node.update(node.id.name + ' = null');
      }
    }
    else if ((node.type === 'Literal') &&
        _.include(opts.depNames, node.value) &&
        node.parent && (node.parent.type === 'ArrayExpression') &&
        node.parent.parent && (node.parent.parent.type === 'CallExpression') &&
        (node.parent.parent.callee.type === 'Identifier') &&
        ((node.parent.parent.callee.name === 'define') ||
         (node.parent.parent.callee.name === 'requirejs'))) {
      // The easiest way to remove the dependency here is to replace it with a
      // dependency on "require" which must exist. Using an empty string does
      // not work and using the specific "empty:" value only works in require.js
      // "paths" config.
      logger.info('replace define dep with fake "require" dep');
      node.update('\'require\'');
    }
  });
  logger.log('serialize updated code');
  input = output.toString();
  logger.log('fourth pass to remove references to Woodman... done');


  // Fifth pass
  // ----------
  // Remove Woodman module if found in the code
  // ex: define('woodman', function () { ... });
  logger.log('fifth pass to remove Woodman...');
  output = falafel(input, falafelOpts, function (node) {
    if ((node.type === 'CallExpression') &&
        (node.callee.type === 'Identifier') &&
        (node.callee.name === 'define') &&
        node['arguments'] && node['arguments'][0] &&
        (node['arguments'][0].type === 'Literal') &&
        _.include(opts.depNames, node['arguments'][0].value)) {
      logger.info('remove Woodman module definition');
      removeCode(node.parent);
    }
  });
  logger.log('serialize updated code');
  input = output.toString();
  logger.log('fifth pass to remove Woodman... done');

  return output.toString();
};
