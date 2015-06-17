/**
 * ---
 * @author Ralph Moser (http://ramosoft.ch)
 * @version 0.1
 * @updated 11-06-14
 * ---
 */

(function($) {
    /**
     * Proximity event handler (default implementation).
     *
     * The default event handler can be overwritten by adding a new handler to the Drupal.settings.proximityEventHandler
     * in a separate java script file. Make sure that the script file is loaded after this script file to have any effect.
     *
     * The following parameters are available in the event handler:
     *
     * @param event object  The event object with the usual properties.
     *                      The event.data object contains the following event specific data:
     *                          min                 : defined max. distance (pixels) from item with proximity factor equal 1 (default = 0)
     *                          max                 : outside this defined distance (pixels) the proximity factor is 0 (proximity extent)
     *                          startScale          : starting item scale factor (float) of proximity effect (defined in proximity view settings)
     *                          endScale	        : ending item scale factor (float) of proximity effect (defined in proximity view settings)
     *                          startOpacity        : starting item opacity factor (float) of proximity effect (defined in proximity view settings)
     *                          endOpacity          : ending item opacity factor (float) of proximity effect (defined in proximity view settings)
     *                          containerSelector   : css-selector of proximity container (can be used to define different proximity effects for different containers)
     *                          descrSelector       : css-selector of the item description element, that can be displayed when pointer is close.
     *
     * @param proximity float  The proximity factor [0,1]. 0 means no proximity effect (too far away from item), 1 means full proximity effect (closer than min. distance)
     *
     * @param distance  int     Distance of pointer from item (bounding box) in pixels.
     *
     */
    Drupal.settings.proximityEventHandler = function(event, proximity, distance) {
        // scale and / or change opacity of item depending on the mouse-item distance
        var $item		= $(this),
            d           = event.data,
            $descr      = $item.find(d.descrSelector),
            scaleVal	= proximity * ( d.endScale - d.startScale ) + d.startScale,
            scaleExp	= 'scale(' + scaleVal + ')',
            opacityVal  = proximity * (d.endOpacity - d.startOpacity ) + d.startOpacity;

        // force the item to the front when proximity equals 1 and show its description, if available
        if (proximity == 1) {
            // put cell to front
            $item.css( 'z-index', 10 );
            $descr.fadeIn( 400 );

        } else {
            // reset cell, stop animation and hide description
            $item.css( 'z-index', 1 );
            $descr.stop(true,true).hide();

        }

        // scale cell and set its transparency
        $item.css({
            '-webkit-transform'	: scaleExp,
            '-moz-transform'	: scaleExp,
            '-o-transform'		: scaleExp,
            '-ms-transform'		: scaleExp,
            'transform'			: scaleExp,
            'opacity'			: opacityVal
        });
    };


    /**
     * This behavior initialises the proximity items in the responsive proximity widget (proximity behavior and item positioning).
     * The proximity event is supported in IE 9+, Chrome, Firefox, Safari and Opera.
     */
    Drupal.behaviors.proximityInitItems =  {
        attach: function() {

          // Iterate through all proximity container instances
          $.each(Drupal.settings.proximity, function (container, settings) {

              var $container  = $(container),
                  $items      = $container.find(settings.item_selector),
                  eventData   = {
                      min               : 0,
                      max               : parseInt(settings.extent),
                      throttle          : 20,
                      fireOutOfBounds   : true,
                      startScale        : parseFloat(settings.start_scale),
                      endScale	        : parseFloat(settings.end_scale),
                      startOpacity      : parseFloat(settings.start_opacity),
                      endOpacity        : parseFloat(settings.end_opacity),
                      containerSelector : container,
                      descrSelector     : settings.desc_selector
                  },
                  _getRandomInt = function(min, max) {
                      return Math.floor(Math.random() * (max - min)) + min;
                  };


              // random positioning on tablets and bigger screens, if requested
              if (settings.random_position) {
                  var randomlyPositioned = false;

                  // add window load and resize events
                  $(window).off('.proximity');
                  $(window).on('load.proximity resize.proximity', function() {
                      // initialize grid for random item positioning
                      var cellSize = parseInt(settings.random_cell_size),
                          xGrid = Math.floor($container.width() / cellSize),
                          yGrid = Math.floor($container.height() / cellSize),
                          grid = new Array(xGrid * yGrid),
                          _randomItemPosInGrid = function($itemPos) {
                              var xPos = _getRandomInt(0, xGrid-1),
                                  yPos = _getRandomInt(0, yGrid-1),
                                  index = yPos*xGrid + xPos;

                              // check grid position and mark it when free
                              if (typeof grid[index] === "undefined") {
                                  grid[index] = 1;
                                  if (xPos > 0) grid[index-1] = 1;
                                  if (xPos < xGrid-1) grid[index+1] = 1;
                                  $itemPos.iTop = yPos*cellSize;
                                  $itemPos.iLeft = xPos*cellSize;
                                  return true;
                              }
                              return false;
                          };

                      // position all items and their dialogs
                      $items.each(function () {
                          var $item = $(this);

                          if ($(window).width() >= 768) {
                              // random positioning once per page load
                              if (randomlyPositioned) return;

                              // position item randomly in grid without item overlapping
                              var count = 0,
                                  $pos = {iTop: 0, iLeft: 0};

                              do {
                                  count++;
                              } while (!_randomItemPosInGrid($pos) && count < 10);

                              $item.css({'position': 'absolute', 'top': $pos.iTop, 'left': $pos.iLeft});

                          } else {
                              // positioning of item and dialog in css
                              $item.css({'position': 'static', 'top': 'auto', 'left': 'auto'});
                          }
                      });

                      // update random flag
                      randomlyPositioned = $(window).width() >= 768;
                  });

              }

              // attach the proximity event handler to all proximity items (once)
              $items.once('pe', function() {
                  $(this).on('proximity', eventData, Drupal.settings.proximityEventHandler);
              });

              // init all proximity items with given settings by triggering a mouse move on document
              $(document).trigger('mousemove');

          }); // container instances

        }
    };

    /**
     * Defines deep linking for proximity items, meaning each item has a unique url, by which the item content is requested from the server.
     * This is valid also for AJAX calls. The URL's are added to the browser history and can be shared (trigger a full page request).
     *
     * See the excellent article about deep linking: http://www.codemag.com/Article/1301091
     */
    Drupal.behaviors.proximityDeepLinks =  {
        attach: function() {
            // Iterate through all proximity container instances
            $.each(Drupal.settings.proximity, function (container, settings) {

                var $container  = $(container),
                    $items      = $container.find(settings.item_selector),
                    _positionModalDialog = function($item) {
                        // size and position the modal dialog relative to the item position
                        var $dialog     = $container.find('#pe-modal-dialog .modal-dialog'),
                            wDialog     = $dialog.width(),
                            iTop        = parseInt($item.css('top')),
                            iLeft       = parseInt($item.css('left')),
                            padding     = 20,
                            wItem       = $item.width() + padding,
                            hShift      = $container.offset().left,
                            // show dialog always inside of the item container (left or right of cell
                            leftPos     = (iLeft + wItem + wDialog > $container.width())
                                ? Math.max(iLeft + hShift - wDialog - padding, hShift)    // left of cell
                                : iLeft + hShift + wItem;                                 // right of cell

                        // position dialog
                        $dialog.css({'position': 'absolute', 'top': iTop, 'left': leftPos});
                    },
                    _setModalBackdropHeight  = function () {
                        var hContent    = $container.find('#pe-modal-dialog .modal-content').height(),
                            hDialog     = $container.find('#pe-modal-dialog .modal-dialog').height(),
                            hTotal      = $(window).height() + hContent - hDialog;

                        // update backdrop height according to dialog content
                        $container.find('#pe-modal-dialog .modal-backdrop').css('height', hTotal);
                    };

                // attach click event to all proximity items to load dialog content via AJAX
                $items.once('click', function() {
                    $(this).on('click', function(ev) {
                        // load content in defined container via ajax
                        var $item = $(this),
                            $button = $item.find('a.btn'),
                            param = $button.attr('data-ajax-load-param'),
                            $target = $('#pe-modal-dialog .modal-body'),
                            ajax_url = settings.ajax_url + param;

                        // set target container as requested
                        if (settings.proximity_content_container == 'page_cont') {
                            $target = $('#pe-content-container');
                        }

                        // set the loading html on the target and load target content via ajax
                        $target.html(settings.ajax_loading);
                        $target.load(ajax_url, function( response, status, xhr ) {
                            if ( status == "error" ) {
                                var msg = "Content could not be loaded: ";
                                $target.html( msg + xhr.status + " " + xhr.statusText );
                            } else {
                                // make sure all behaviors are attached to new content
                                Drupal.attachBehaviors($target, settings);

                                // set dialog position when content is available (depends on content)
                                if (settings.proximity_content_container == 'modal_rel') {
                                    _positionModalDialog($item);
                                }

                                // set backdrop height according to content height (wait a little to get correct height)
                                window.setTimeout(_setModalBackdropHeight, 200);
                            }
                        });
                    });
                });

            }); // container instances
        }
    };

})(jQuery);

