// Tell Woodman to log the message with the domain ID to the console.
var woodman = require('./js/woodman');
woodman.load('console Got "%message" from %domain domain.%n');

// Async function that logs two messages using Woodman.
// The function does not know anything about its underlying domain.
var logger = woodman.getLogger();
var func = function () {
  logger.log('sync message');
  setTimeout(function () {
    logger.log('async message');
  }, 0);
};

// Create two domains with an ID
var domain = require('domain');
var firstDomain = domain.create();
var secondDomain = domain.create();
firstDomain.id = 'first';
secondDomain.id = 'second';

// Run async function in both domains
firstDomain.run(func);
secondDomain.run(func);