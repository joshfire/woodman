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
 * var logger = woodman.getLoggeR('foo');
 * logger = somethingelse;
 * logger.machin = 4;
 */
/*global module*/

var falafel = require('falafel');

// opts =>
// Level Error
// 0 = comment (in test),
// 1 = delete all console and all woodman references,
// 2 = keep console.error,
// 3 = keep warn and error,
// 4 = keep info, warn and error,
// 5 = keep log, info, warn and error,
module.exports = function (input, opts) {
  if(!input){
    console.error('You need to enter some input source');
    return;
  }
  var levelError = 1;

  if(opts){
    if(opts.level && !isNaN(opts.level) && (opts.level >= 0)){
      levelError = opts.level;
    }
  }

  /**
   * Search in a node ascendance a specified type node
   *
   * @function
   * @param {object} node
   * @param {string} nodeType contain a plain text node type e.g. "VariableDeclaration, ExpressionStatement ..."
   */

  function searchParentByType( node, nodeType ){
      parentNode = node;
      var levelNode = 0; // Security in while loop
      while((parentNode.type != nodeType) && (parentNode.parent !== undefined) && (levelNode <= 20)) {
        levelNode++;
        parentNode = parentNode.parent;
      }
      parentNode.levelNode = levelNode;
      return parentNode;
  }

  // Update node which is passed as an argument (comment or delete)
  function makeUpdate( node ){
    if( levelError === 0 ){
      node.update('/*' + node.source() +'*/');
    }
    if( levelError === 1 ){
      node.update('');
    }
  }

  var instanceWoodmanName;
  var instanceLoggerName;
  var instanceConfigName;
  var parentNode;

  // Selecting require (getting instance name), woodman.initialize(getting instance name), woodman.getLogger(getting instance name)
  var output = falafel( input, function (node) {
    if ((node.source() === 'require')) {
      parentNode = searchParentByType( node, 'VariableDeclaration' );
      if(parentNode !== undefined){
        if(parentNode.declarations !== undefined) {
          instanceWoodmanName = parentNode.declarations[0].id.name;
        }
        makeUpdate( parentNode );
      }
    }

    if ((node.source() === instanceWoodmanName + '.initialize')) {
      if((node.parent.arguments) && (node.parent.arguments[0] !== undefined) && (node.parent.arguments[0].name !== undefined)){
        instanceConfigName = node.parent.arguments[0].name;
      }
      parentNode = searchParentByType( node, 'ExpressionStatement' );
      if(parentNode !== undefined){
        makeUpdate( parentNode );
      }
    }

    if (node.source() === instanceWoodmanName + '.getLogger') {
      var parentNodeExpressionStatement = searchParentByType( node, 'ExpressionStatement' );
      var parentNodeVariableDeclaration = searchParentByType( node, 'VariableDeclaration' );
      if(parentNodeExpressionStatement.levelNode <= parentNodeVariableDeclaration.levelNode) {
        parentNode = parentNodeExpressionStatement;
        if(parentNode.expression.expressions !== undefined) {
          instanceLoggerName = parentNode.expression.expressions[0].left.name;
          parentNode = searchParentByType( node, 'CallExpression' );
          parentNode.update('null');
        }
        else{
          instanceLoggerName = parentNode.expression.left.name;
          makeUpdate( parentNode );
        }
      }
      else{
        parentNode = parentNodeVariableDeclaration;
        if(parentNode.declarations !== undefined) {
          instanceLoggerName = parentNode.declarations[0].id.name;
          // Case when var contain more than one variable declaration (ex : var log = woodman.getLogger('foo'), j=3;)
          if(parentNode.declarations.length > 1) {
            parentNode = searchParentByType( node, 'CallExpression' );
            parentNode.update('null');

            parentNode = searchParentByType( node, 'VariableDeclarator' );
            instanceLoggerName = parentNode.id.name;
          }
          else{
            makeUpdate( parentNode );
          }
        }
      }
    }
  });


  var levelErrorArray = [ '.error', '.warn', '.info', '.log' ];
  // Selecting .log, .info, .warn, .err depending levelError
  output = falafel( output.toString(), function (node) {
    for(var i = levelError - 1, c = levelErrorArray.length; i < c; i++){
      if (node.source() === instanceLoggerName + levelErrorArray[ i ]) {
        var parentNodeExpressionStatement = searchParentByType( node, 'ExpressionStatement' );
        var parentNodeVariableDeclaration = searchParentByType( node, 'VariableDeclaration' );
        if(parentNodeExpressionStatement.levelNode <= parentNodeVariableDeclaration.levelNode) {
          parentNode = parentNodeExpressionStatement;
          if( levelError === 0 ){
            parentNode.update('//' + parentNode.source());
          }
          else{
            parentNode.update('');
          }
        }
      }
    }
  });


  // Selecting woodman.load
  output = falafel( output.toString(), function (node) {
    if ((node.source() === instanceWoodmanName + '.load')) {
      if((node.parent.arguments) && (node.parent.arguments[0] !== undefined) && (node.parent.arguments[0].name !== undefined)){
        instanceConfigName = node.parent.arguments[0].name;
      }
      var reg = new RegExp(instanceWoodmanName + '.load\\(.+,', "g");
      if( levelError < 2 ){
        node.parent.update(node.parent.source().replace(reg, '(') + '()');
      }
    }
  });


  // Selecting configuration
  output = falafel( output.toString(), function (node) {
    if (node.source() === instanceConfigName){
      parentNode = searchParentByType( node, 'VariableDeclaration' );
      makeUpdate( parentNode );
    }
  });

  // Selecting woodman.start
  output = falafel( output.toString(), function (node) {
    if ((node.source() === instanceWoodmanName + '.start')) {
      var reg = new RegExp(instanceWoodmanName + '.start', "g");
      if( levelError < 2 ){
        node.parent.update(node.parent.source().replace(reg, '') + '()');
      }
    }
  });

  return output.toString();
};
