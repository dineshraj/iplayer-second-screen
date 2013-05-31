define(["jquery"], function ($) {

    var $content = $('.player-control');

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    // Bye bye if you don't have WebSockets natively
    if (!window.WebSocket) {
        $content.html($('<p>', { text: 'Sorry, but your browser doesn\'t support WebSockets.'} ));
        return;
    }

    // declare vars and connect to the server
    var $playButton = $('.state-control .play-pause'),
        $volumeDiv = $('.volume-control'),
        connection = new WebSocket('ws://94.76.249.84:1337'),
        author = 'secondScreen',
        data;

    /*
     * SUBSCRIBE TO WEBSOCKET EVENTS
     */
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
        $content.html($('<p>', { text: 'Sorry the server has gone...I guess it didn\'t like you' } ));
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
                priv._setPlayPauseButton(obj.playing);
                priv._getSynopsisData(obj.data);
                priv._setVolume(obj.volume);
                break;
            case 'play':
                priv._setPlayPauseButton();
                break;
            case 'pause':
                priv._setPlayPauseButton();
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
     $volumeDiv.children('input').change(function () {
        var vol = parseInt($(this).val(), 10)/10;
        connection.send(
            JSON.stringify(
                {
                    type: 'volume',
                    author: 'secondScreen',
                    data: vol
                }
            )
        );
    });

    $playButton.click(function () {
        connection.send(
            JSON.stringify(
                {
                    type: $(this).text(),
                    author: 'secondScreen'
                }
            )
        );
    });

    /*
     * PRIVATE METHODS FOR POPULATING INTERFACE
     */
    var priv = {
        _getSynopsisData: function (pid) {
          //  var url = 'http://www.bbc.co.uk/iplayer/ion/episodedetail/episode/' + pid + '/format/json';
            var url = 'fixtures/b01skh8t.json';

            $.getJSON(url)
            .done(function (data) {
                console.log(data);
            })
            .fail(function () {
                console.log('Error retrieving data for', pid);
            });
        },

        _setPlayPauseButton: function (playing) {

            if ($playButton.hasClass('pause') || (playing !== null && playing === false)) {
                $playButton.removeClass('pause').addClass('play');
            } else if ($playButton.hasClass('play') || (playing !== null && playing === true)) {
                $playButton.removeClass('play').addClass('pause');
            }
        },

        _setVolume: function(volume) {
            $volumeDiv.children('input').val((volume*10));
        }
    };

});
