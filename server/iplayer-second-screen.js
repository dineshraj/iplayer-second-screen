// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

/**
 * Global variables
 */
// list of currently connected clients (users)
var clients = [ ];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
  console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;

  console.log((new Date()) + ' Connection accepted.');

    // user sent some message
    connection.on('message', function(message) {
            /*
             * a client has sent a message to the server we have to
             * broadcast it again for it to reach the other clients
             */

              console.log(message.utf8Data);

              var StatsD = require('node-statsd').StatsD,
                  client = new StatsD({
                    host: "198.199.67.216",
                    port: 8125,
                    prefix: "bbc.tviplayer."
                  });

              client.increment('second-screen.' + JSON.parse(message.utf8Data).type +'.clicks');

                for (var i = 0; i < clients.length; i++) {
                    clients[i].sendUTF(message.utf8Data);
            }
    });

    // user disconnected
    connection.on('close', function(connection) {
        console.log('user leaves');

        // remove user from the list of connected clients
//        clients.splice(index, 1);
    });

});