/**
 * @fileOverview Adaptation of the Falafel node package
 *
 * Copyright James Halliday, http://substack.net
 * Licensed under an MIT license
 * https://github.com/substack/node-falafel
 *
 * The adapted code performs a two-step pass, one to add local context info
 * to the AST nodes, and the other one to run the transformation function.
 */
/*global module*/
var parse = require('esprima').parse;
var woodman = require('../dist/woodman');
var logger = woodman.getLogger('falafel');

module.exports = function (src, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts;
    opts = {};
  }
  if (typeof src === 'object') {
    opts = src;
    src = opts.source;
    delete opts.source;
  }
  src = src || opts.source || '';
  opts.range = true;
  if (typeof src !== 'string') src = String(src);

  logger.log('parse source...');
  var ast = parse(src, opts);
  logger.log('parse source... done');

  var result = {
    chunks : src.split(''),
    toString : function () { return result.chunks.join(''); },
    inspect : function () { return result.toString(); }
  };

  var walk = function (node, parent, func) {
    if (!func) {
      insertHelpers(node, parent, result.chunks);
      if (opts.insertAdditionalHelpers) {
        opts.insertAdditionalHelpers(node);
      }
    }

    Object.keys(node).forEach(function (key) {
      if (key === 'parent') return;

      var child = node[key];
      if (Array.isArray(child)) {
        child.forEach(function (c) {
          if (c && typeof c.type === 'string') {
            walk(c, node, func);
          }
        });
      }
      else if (child && typeof child.type === 'string') {
        walk(child, node, func);
      }
    });
    if (func) func(node);
  };

  // First pass to extend the AST tree with context information
  logger.log('add context information...');
  walk(ast, undefined, undefined);
  logger.log('add context information... done');

  // Second pass to run the transformation function
  logger.log('run transformation function...');
  walk(ast, undefined, fn);
  logger.log('run transformation function... done');

  return result;
};

function insertHelpers (node, parent, chunks) {
  if (!node.range) return;

  node.parent = parent;

  node.source = function () {
    return chunks.slice(
      node.range[0], node.range[1]
    ).join('');
  };

  if (node.update && typeof node.update === 'object') {
    var prev = node.update;
    Object.keys(prev).forEach(function (key) {
      update[key] = prev[key];
    });
    node.update = update;
  }
  else {
    node.update = update;
  }

  function update (s) {
    chunks[node.range[0]] = s;
    for (var i = node.range[0] + 1; i < node.range[1]; i++) {
      chunks[i] = '';
    }
  }
}
