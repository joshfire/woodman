/**
 * @fileoverview Example of node.js script that uses domains and asks Woodman
 * to output the ID of the domain along with the traces.
 *
 * This method should only really be used for debugging purpose of the Woodman
 * library. Using a compiled version of Woodman is preferred.
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global __dirname*/

var woodman = require(__dirname + '/../../lib/woodman');
var domain = require('domain');

woodman.load('console Got "%message" from %domain domain.%n');

var logger = woodman.getLogger('joshfire.woodman.examples.node.domain');

var firstDomain = domain.create();
var secondDomain = domain.create();
var thirdDomain = domain.create();

// Set an ID to first two domains
firstDomain.id = 'first';
firstDomain.nested = {};
firstDomain.nested.guid = 'nested first';
secondDomain.id = 'second';
secondDomain.nested = {};
secondDomain.nested.guid = 'nested second';

logger.log('Welcome to Woodman');
logger.info('this message does not belong to any domain');

firstDomain.run(function () {
  logger.log('this message belongs to the first domain');
  setTimeout(function () {
    logger.info('this message belongs to the first domain too!');
  }, 0);
});

secondDomain.run(function () {
  logger.log('this message belongs to the second domain');
  setTimeout(function () {
    logger.info('this message belongs to the second domain too!');
  }, 0);
});

thirdDomain.run(function () {
  logger.log('this message belongs to the third anonymous domain');
  setTimeout(function () {
    logger.info('this message belongs to the third anonymous domain too!');
  }, 0);
});
