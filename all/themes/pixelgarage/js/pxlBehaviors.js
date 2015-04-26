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
                $playPause = $(document).find('#playpause'),
                $peDialog = $('.main-container .pe-container #pe-modal-dialog');

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

            // modal dialog showing / hiding
            $peDialog.once('events', function () {
                var isPaused = true;

                $peDialog.on('show.bs.modal', function () {
                    // pause video
                    isPaused = video.paused || video.ended;
                    video.pause();

                });
                $peDialog.on('hide.bs.modal', function () {
                    // play video
                    if (!isPaused) {
                        video.play();
                    }
                });
            });

        }
    };

})(jQuery);