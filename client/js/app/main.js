define(["jquery"], function ($) {

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    // Bye bye if you don't have WebSockets natively
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t support WebSockets.'} ));
        return;
    }

    // connect to the server
    var content = $('#second-screen'),
        connection = new WebSocket('ws://94.76.249.84:1337'),
        author = 'secondScreen',
        data;

    // subscribe to websocket events
    connection.onopen = function () {
        console.log('Connection open.');
        connection.send(
            JSON.stringify(
                {
                    type: 'pid',
                    author: 'secondScreen'
                }
            )
        );
    };

    connection.onerror = function (error) {
        content.html($('<p>', { text: 'Sorry the server has gone...I guess it didn\'t like you' } ));
    };

    connection.onmessage = function (message) {
        var obj;

        try {
            obj = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        if (obj.author !== author) {
            switch (obj.type) {
            case 'pid':
                if (obj.playing) {
                    $('.state').removeClass('play').addClass('pause').text('pause');
                }
                console.log('returned object', obj);
                priv._getSynopsisData(obj.data);
                break;
            default:
                console.log(obj);
                break;
            }
        }

/*
 * @TODO
 * Synopsis stuff
 * - Getting metadata information from episodedetails feed in order to populate the synopsis
 * - format image and display it
 *
 * 'More Like This' stuff
 * - Get a list of 5(?) things that are similar to current PID (morelikethis feed)
 * - Format and store them in an array
 * - Populate the HTML with the data
 *
 * Twitter
 * - Make request to twitter API
 */

    };

    /*
     * BINDING EVENTS FROM PAGE
     */
     $('div.volume-control span').click(function () {
        connection.send(
            JSON.stringify(
                {
                    type: 'volume',
                    author: 'secondScreen',
                    data: parseInt($(this).text(), 10)/10
                }
            )
        );
    });

    $('div.volume-control span').click(function () {
        connection.send(
            JSON.stringify(
                {
                    type: 'state',
                    author: 'secondScreen',
                    data: $(this).text()
                }
            )
        );
    });

    /*
     * PRIVATE METHODS FOR POPULATING INTERFACE
     */
    var priv = {
        _getSynopsisData: function (pid) {
            var url = 'http://www.bbc.co.uk/iplayer/ion/episodedetail/episode/' + pid + '/format/json';

            $.getJSON(url)
                .done(function (data) {
                    console.log(data);
                })
                .fail(function () {
                    console.log('Error retrieving data for', pid);
                });
        }
    };

});