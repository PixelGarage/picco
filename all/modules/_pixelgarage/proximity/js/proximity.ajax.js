/**
 * Proximity AJAX implementation
 *
 * AJAX implementation for the proximity items. A single pointer click requests the item content via AJAX calls and allows to display
 * the content in different containers. The implementation supports deep linking creating a unique url for each proximity item, which
 * is added to the browser history and can be shared or bookmarked.
 *
 * Deep linking is implemented with the new HTML5 features in the history object (pushState, popState), which is supported by
 * the folllowing browsers (January 2013):
 *      IE 10+
 *      Firefox 14 +
 *      Chrome 21 +
 *      Safari 5.1 + (Support is partial, but your script can work around these limitations)
 *      iOS Safari 5 +
 *      Opera 12 +
 *      Blackberry 7 +
 *
 *      And the following browsers do not support the API:
 *      IE 9 and lower
 *      Opera Mini
 *      Android (support was included in version 2.3, but in current versions the feature is buggy)
 *
 *
 *  See the excellent article about deep linking: http://www.codemag.com/Article/1301091
 *
 * Created by ralph on 19.06.15.
 */

(function($) {


    // Chrome & Safari (WebKit browsers) raise the popstate
    // event when the page loads. All other browsers only
    // raise this event when the forward or back buttons are
    // clicked. Therefore, the '_popStateEventCount'
    // (in conjunction with '$.browser.webkit') allows the page
    // to skip running the contents of popstate event handler
    // during page load so the content is not loaded twice in
    // WebKit browsers.
    var _popStateEventCount = 0;

    /**
     *  Pointer click implementation for all proximity items. A click on an item requests the item content with AJAX
     *  and adds the content to a defined container (modal dialog or dedicated div).
     */
    Drupal.behaviors.proximityItemClick =  {
        attach: function() {
            // Iterate through all proximity container instances
            $.each(Drupal.settings.proximity, function (container, settings) {

                var $container  = $(container),
                    $items = $container.find(settings.item_selector),
                    transDuration = parseInt(settings.trans_duration),

                    _calcModalDialogPos = function($item) {
                        // size and position the modal dialog relative to the item position
                        var $dialog     = $container.find('#pe-modal-dialog .modal-dialog'),
                            wDialog     = $dialog.width(),
                            iTop        = parseInt($item.css('top')),
                            iLeft       = parseInt($item.css('left')),
                            padding     = 20,
                            wItem       = $item.width() + padding,
                            hShift      = $container.offset().left,
                            // show dialog always inside of the item container (left or right of the item)
                            leftPos     = (iLeft + wItem + wDialog > $container.width())
                                ? Math.max(iLeft + hShift - wDialog - padding, hShift)    // left of cell
                                : iLeft + hShift + wItem;                                 // right of cell

                        // position dialog
                        $dialog.css({'position': 'absolute', 'top': iTop, 'left': leftPos});
                    },

                    _setModalBackdropHeight = function() {
                        var $dialog     = $container.find('#pe-modal-dialog'),
                            hContent    = $dialog.find('.modal-content').height(),
                            hDialog     = $dialog.find('.modal-dialog').height(),
                            hTotal      = $(window).height() + hContent - hDialog;

                        // update backdrop height according to dialog content
                        $dialog.find('.modal-backdrop').css('height', hTotal);
                    },

                    _loadItemContent = function(param) {
                        //
                        // load item specific content in defined container via ajax
                        var $target = (settings.ajax_container == 'div_cont') ? $('#pe-content-container') : $('#pe-modal-dialog .modal-body'),
                            ajax_url = settings.ajax_base_url + param;        // specific item ajax link


                        //
                        // set the loading indicator on the target and load target content via ajax
                        $target.html(settings.ajax_loading_html);
                        $target.load(ajax_url, function( response, status, xhr ) {
                            if ( status == "error" ) {
                                var msg = "Content could not be loaded: ";
                                $target.html( msg + xhr.status + " " + xhr.statusText );
                            } else {
                                // make sure all behaviors are attached to new content
                                Drupal.attachBehaviors($target, settings);

                                // show target container animated
                                if (settings.ajax_container == 'page_cont') {
                                    // show dedicated container
                                    $target.fadeIn(transDuration);

                                } else {
                                    // set dialog position relative to item
                                    if (settings.ajax_container == 'modal_rel') {
                                        _calcModalDialogPos($item);
                                    }

                                    // show modal dialog
                                    $('#pe-modal-dialog').fadeIn(transDuration).modal('show');

                                }


                                // set backdrop height according to content height (wait a short time to get correct height)
                                window.setTimeout(_setModalBackdropHeight, 200);
                            }
                        });

                    };



                // open modal dialog, if deep link request occurred
                if (settings.deep_link_request) {
                    $('#pe-modal-dialog').fadeIn(transDuration).modal('show');

                }

                // attach click event to all proximity items to load their content via AJAX
                $items.once('item-click', function() {
                    $(this).on('click', function() {
                        //
                        // load item specific content in defined container via ajax
                        var $item = $(this),
                            $button = $item.find('a.btn'),
                            param = $button.attr('data-ajax-load-param'),
                            deep_link = settings.deep_link_base_url + param;        // specific item deep link


                        // add deep link to history object
                        window.history.pushState(null, "", deep_link);

                        // load item content with AJAX
                        _loadItemContent(param);

                        // prevent default behavior and further bubble/capture of the event
                        // Remark: This prevents the modal trigger button to be clicked (open dialog when AJAX returns)
                        return false;
                    });
                });

                /*
                 * Support for browser previous next button
                 */

                // This event only fires in browsers that implement
                // the HTML5 History APIs.
                //
                // IMPORTANT: The use of single quotes here is required
                // for full browser support.
                //
                // Ex: Safari will not fire the event
                // if you use: $(window).on("popstate"
                $(window).off('popstate');
                $(window).on('popstate', function() {

                    _popStateEventCount++;

                    if(navigator.userAgent.indexOf('AppleWebKit') != -1  && _popStateEventCount == 1){
                        return;
                    }

                    // get param from current location
                    var param = window.location.pathname.split("/").pop();

                    // load item with AJAX
                    _loadItemContent(param);
                });


            }); // proximity container instances
        }
    };

})(jQuery);
