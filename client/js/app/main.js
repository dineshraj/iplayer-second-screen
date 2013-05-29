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
        data,
        author = 'secondScreen';

    // subscribe to websocket events
    connection.onopen = function () {
        console.log('Connection opened.');
    };

    connection.onerror = function (error) {
        content.html($('<p>', { text: 'Sorry the server has gone...I guess it didn\'t like you' } ));
    };

    connection.onmessage = function (message) {

        console.log(JSON.parse(message.data));


 /*       try {
            data = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
*/

//        if (data.type === 'pid' && data.author !== author) {
            /*
             * This client wasnt the one that send the PID, so act
             * on the pid and populate the information (Synopsis and MLT)
             */
//            getSynopsisData(data.pid);

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
//        }

    };

    function getSynopsisData(pid) {
        var url = 'http://www.bbc.co.uk/iplayer/ion/episodedetail/episode/' + pid + '/format/json';

        $.getJSON(url + '?callback=?', null, function (data) {
            alert(data);
            return data;
        })
        .fail(function () {
            alert('error');
        });
    }

});