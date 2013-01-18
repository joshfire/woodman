/**
 * @fileoverview Example of a socket server that outputs log events received
 * from a SocketAppender.
 *
 * To run the server, type:
 *  node examples/socket.io/server.js
 *
 * To use a SocketAppender in Woodman, use an appender definition in Woodman's
 * config that looks like:
 * {
 *   "type": "SocketAppender",
 *   "name": "socket",
 *   "url": "http://localhost:40031"
 * }
 *
 * Copyright (c) 2013 Joshfire
 * MIT license (see LICENSE file)
 */
/*global console*/

var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);

io.set('log level', 0);

app.listen(40031);

function handler (req, res) {
  res.writeHead(200);
  res.end('Socket server up and running');
}

io.sockets.on('connection', function (socket) {
  socket.on('log', function (evt) {
    evt = evt || {};
    switch (evt.level) {
    case 'log':
      console.log(evt.message);
      break;
    case 'info':
      console.info(evt.message);
      break;
    case 'warn':
      console.warn(evt.message);
      break;
    case 'error':
      console.error(evt.message);
      break;
    default:
      console.log(evt.message);
      break;
    }
  });
});