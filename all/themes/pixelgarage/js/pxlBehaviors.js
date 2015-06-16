/**
 * This file contains all Drupal behaviours of the Apia theme.
 *
 * Created by ralph on 05.01.14.
 */

(function ($) {

    /**
     * Controls the video playback.
     */
    Drupal.behaviors.videoController = {
        attach: function () {
            var video = document.getElementById('picco-video'),
                $playPause = $(document).find('#picco-logo'),
                $peDialog = $('.main-container .pe-container #pe-modal-dialog');

            // PREVENT VIDEO FROM PLAYING ON MOBILES
            if ($(window).width() < 480) {
                video.pause();
            }

            // video playing/pause events
            $(video).once('playing', function () {
                $(video).on('playing', function () {
                    // set the pause button icon
                    $playPause.find('.fa').removeClass('fa-play').addClass('fa-pause');
                    $(this).removeClass('fadeout');
                });
            });
            $(video).once('pause', function () {
                $(video).on('pause', function () {
                    // set the play button icon
                    $playPause.find('.fa').removeClass('fa-pause').addClass('fa-play');
                    $(this).addClass('fadeout');
                });
            });

            // click on play / pause button
            $playPause.once('click', function () {
                $playPause.on('click', function () {
                    // toggle the play button
                    if (video.paused || video.ended) {
                        video.play();
                    } else {
                        video.pause();
                    }

                    // don't propagate click event further up
                    return false;
                });
            });

            // play/pause video on hiding/showing modal dialog
            $peDialog.once('events', function () {
                var isPaused = true;

                $peDialog.on('show.bs.modal', function () {
                    // pause video
                    isPaused = video.paused || video.ended;
                    video.pause();

                    // move logo behind dialog
                    $playPause.css('z-index', -10);
                });
                $peDialog.on('hide.bs.modal', function () {
                    // play video
                    if (!isPaused) {
                        video.play();
                    }

                    // move logo to the front
                    $playPause.css('z-index', 10);

                });
            });

        }
    };

    Drupal.behaviors.audioController = {
        attach: function () {
            var audio = document.getElementById('picco-audio'),
                $controls = $(document).find('div#audio-controls');

            // click on play / pause button
            $controls.once('click', function () {
                $controls.on('click', function () {
                    // toggle the play button
                    if (audio.paused || audio.ended) {
                        audio.play();
                    } else {
                        audio.pause();
                    }

                    // don't propagate click event further up
                    return false;
                });
            });

        }
    }

    Drupal.behaviors.backgroundImage = {
        attach: function () {
            // set interval for background image exchange
            var index = 1;

            setInterval(function() {
                var nextIndex = (index%4)+1;

                // display next background image in queue (animated)
                var selActive = '#background-wrapper .bg-img' + index,
                    selNext = '#background-wrapper .bg-img' + nextIndex;
                $(selNext).fadeIn(600);
                $(selActive).fadeOut(600);
                index = nextIndex;

            }, 7000);
        }
    }

})(jQuery);