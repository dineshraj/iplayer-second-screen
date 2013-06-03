define(["jquery"], function ($) {

    // Webkit bug. Firefox rawks.
    var causeRepaintsOn = $(".icon, span, h2, h3");
    $(window).resize(function() {
        causeRepaintsOn.css("z-index", 1);
    });

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
        $rewindButton = $('.state-control .rewind'),
        $forwardButton = $('.state-control .forward'),
        $muteButton = $('.mute'),
        $unmuteButton = $('.volume'),
        connection = new WebSocket('ws://94.76.249.84:1337'),
        author = 'secondScreen',
        clickEvent = 'ontouchstart' in window ? 'touchstart' : 'click',
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
                priv._setPlayPauseButton(true);
                break;
            case 'pause': case 'ended':
                priv._setPlayPauseButton(false);
                break;
            case 'volume':
                priv._setVolume(obj.data);
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

    $playButton.on(clickEvent, function () {
        connection.send(
            JSON.stringify(
                {
                    type: $(this).hasClass('play') ? 'play' : 'pause',
                    author: 'secondScreen'
                }
            )
        );
    });

    $rewindButton.on(clickEvent, function () {
        connection.send(
            JSON.stringify(
                {
                    type: 'rewind',
                    author: 'secondScreen'
                }
            )
        );
    });

    $forwardButton.on(clickEvent, function () {
        connection.send(
            JSON.stringify(
                {
                    type: 'forward',
                    author: 'secondScreen'
                }
            )
        );
    });

    $muteButton.on(clickEvent, function () {
        connection.send(
            JSON.stringify(
                {
                    type: 'mute',
                    author: 'secondScreen',
                    data: true
                }
            )
        );
    });

    $unmuteButton.on(clickEvent, function () {
        connection.send(
            JSON.stringify(
                {
                    type: 'mute',
                    author: 'secondScreen',
                    data: false
                }
            )
        );
    });

    /*
     * PRIVATE METHODS FOR POPULATING INTERFACE
     */
    var priv = {
        _getSynopsisData: function (pid) {
            var url = 'http://94.76.249.84/ion.php?type=episodedetail&pid=' + pid + '&callback=?';
            $.getJSON(url)
            .done(function (data) {
                priv._setSynopsisData((data.blocklist).shift());
                priv._getMoreData(pid);
            })
            .fail(function () {
                console.log('Error retrieving data for', pid);
                return;
            });
        },

        _setSynopsisData: function (data) {
            $('.programme-information').html(
                '<h2>' + data.complete_title + '</h2>' +
                '<img src="http://ichef.bbci.co.uk/images/ic/384x216/legacy/episode/' + data.id + '.jpg" width="192" height="108">' +
                '<div class="metadata">' +
                    '<span class="snyopsis">' + data.short_synopsis + '</span>' +
                    '<span class="duration">' + this._formatDuration(parseInt(data.duration, 10)) + '</span>' +
                    '<span class="availability">' + data.available_until + '</span>' +
                '</div>'
            ).hide().fadeIn();
        },

        _getMoreData: function (pid) {
            var url = 'http://94.76.249.84/ion.php?type=morelikethis&pid=' + pid + '&callback=?';
            $.getJSON(url)
            .done(function (data) {
                priv._setMoreData((data.blocklist));
            })
            .fail(function () {
                console.log('Error retrieving data for', pid);
                return;
            });
        },
        _setMoreData: function (data) {
            var html = '<h2>More Like This</h2>' +
                '<ul>';
            for (var i = 0; i < data.length; i++) {
                html += '<li data-src="' + data[i].id + '">' +
                    '<h3>' + data[i].complete_title + '</h3>' +
                    '<img src="http://ichef.bbci.co.uk/images/ic/384x216/legacy/episode/' + data[i].id + '.jpg" width="192" height="108">' +
                    '<div class="metadata">' +
                        '<span class="duration">' + this._formatDuration(parseInt(data[i].duration, 10)) + '</span>' +
                        '<span class="availability">' + data[i].available_until + '</span>' +
                    '</div>' +
                '</li>';
            }
            html += '</ul>';
            $('.more-like-this').html(html).hide().fadeIn();

            $('.more-like-this li').on(clickEvent, function() {
                connection.send(
                    JSON.stringify(
                        {
                            type: 'pid',
                            author: 'secondScreen',
                            data: $(this).attr('data-src')
                        }
                    )
                );
            });
        },

        _setPlayPauseButton: function (playing) {
            if ($playButton.hasClass('pause') && playing === false) {
                $playButton.removeClass('pause').addClass('play');
            } else if ($playButton.hasClass('play') && playing === true) {
                $playButton.removeClass('play').addClass('pause');
            }
        },

        _setVolume: function (volume) {
            $volumeDiv.children('input').val((volume*10));
        },

        _formatDuration: function (seconds) {
            var minutes;

            if (seconds > 60) {
                minutes =  Math.ceil(seconds/60);
                return minutes + ((minutes == 1) ? ' minute' : ' minutes');
            }
            return seconds + ' seconds';
        }
    };

});
