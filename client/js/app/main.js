define(["jquery"], function ($) {

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // Bye bye if you don't have WebSockets natively
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t support WebSockets.'} ));
        return;
    }

    // connect to the server
    var connection = new WebSocket('ws://94.76.249.84:1337');

    connection.onopen = function (e) {
        console.log(e);
    };


});