/**
 * ---
 * @author Ralph Moser (http://ramosoft.ch)
 * @version 0.1
 * @updated 11-06-14
 * ---
 */

(function ($) {

  var $activeItem = null;

  /**
   * Holds the number of touches on the active proximity item globally (only one active item).
   *
   * Used to define mobile behavior. The proximity event on touch screens is triggered on a single pointer touch.
   * The implemented behavior on touch screens is as follows:
   *      - first touch on item adds effects to item
   *      - second touch on item opens displays item content (dialog)
   */
  Drupal.settings.proximityItemTouchCounter = 0;

  /**
   * Proximity event handler (default implementation).
   *
   * The default event handler can be overwritten by adding a new handler to the Drupal.settings.proximityEventHandler
   * in a separate java script file. Make sure that the script file is loaded after this script file to have any effect.
   *
   * The following parameters are available in the event handler:
   *
   * @param event object  The event object with the all event properties.
   *                      The event.data object contains the following proximity event specific data:
   *                          min                 : defined max. distance (pixels) from item with proximity factor equal 1 (default = 0)
   *                          max                 : outside this defined distance (pixels) the proximity factor is 0 (proximity extent)
   *                          startScale          : starting item scale factor (float) of proximity effect (defined in proximity view settings)
   *                          endScale          : ending item scale factor (float) of proximity effect (defined in proximity view settings)
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
  Drupal.settings.proximityEventHandler = function (event, proximity, distance) {
    // transform and / or change opacity of item depending on the pointer proximity
    var $item      = $(this),
        d          = event.data,
        $descr     = $item.find(d.descrSelector),
        scaleVal   = proximity * ( d.endScale - d.startScale ) + d.startScale,
        scaleExp   = 'scale(' + scaleVal + ')',
        opacityVal = proximity * (d.endOpacity - d.startOpacity ) + d.startOpacity;

    if (proximity == 1) {
      // force the item to the front when proximity equals 1 and add effects, if available
      $item.css('z-index', 10);
      if (!$item.is($activeItem)) {
        $descr.fadeIn(d.transDuration);
        $activeItem = $item;
        if (isMobile.any) Drupal.settings.proximityItemTouchCounter = 0;

      } else {
        // count touches on specific item
        if (isMobile.any) Drupal.settings.proximityItemTouchCounter++;

      }

    } else {
      $item.css('z-index', 1);

      if (proximity == 0) {
        // hide description
        $descr.stop(true, true).hide();

        //
        // reset active item
        if ($item.is($activeItem)) {
          $activeItem                               = null;
          Drupal.settings.proximityItemTouchCounter = 0;
        }

      }

    }

    // add item effects
    $item.css({
      '-webkit-transform': scaleExp,
      '-moz-transform': scaleExp,
      '-o-transform': scaleExp,
      '-ms-transform': scaleExp,
      'transform': scaleExp,
      'opacity': opacityVal
    });
  };


  /**
   * This behavior initialises the proximity items in the responsive proximity widget (proximity behavior and item positioning).
   * The proximity event is supported in IE 9+, Chrome, Firefox, Safari and Opera.
   */
  Drupal.behaviors.proximityInitItems = {
    attach: function () {

      // Iterate through all proximity container instances
      $.each(Drupal.settings.proximity, function (container, settings) {

        var contSelector  = '#' + container,
            $container    = $(contSelector),
            $items        = $container.find(settings.item_selector),
            eventData     = {
              min: 0,
              max: parseInt(settings.extent),
              throttle: 20,
              fireOutOfBounds: true,
              startScale: parseFloat(settings.start_scale),
              endScale: parseFloat(settings.end_scale),
              startOpacity: parseFloat(settings.start_opacity),
              endOpacity: parseFloat(settings.end_opacity),
              transDuration: parseInt(settings.trans_duration),
              containerSelector: contSelector,
              descrSelector: settings.desc_selector
            },
            _getRandomInt = function (min, max) {
              return Math.floor(Math.random() * (max - min)) + min;
            };


        // random positioning on tablets and bigger screens, if requested
        if (settings.position_randomly) {
          var randomlyPositioned = false;

          // add window load and resize events
          $(window).off('.proximity');
          $(window).on('load.proximity resize.proximity', function () {
            // initialize grid for random item positioning
            var cellSize             = parseInt(settings.random_grid_cell_size),
                xGrid                = Math.floor($container.width() / cellSize),
                yGrid                = Math.floor($container.height() / cellSize),
                grid                 = new Array(xGrid * yGrid),
                _randomItemPosInGrid = function ($itemPos) {
                  var xPos  = _getRandomInt(0, xGrid - 1),
                      yPos  = _getRandomInt(0, yGrid - 1),
                      index = yPos * xGrid + xPos;

                  // check grid position and mark it when free
                  if (typeof grid[index] === "undefined") {
                    grid[index] = 1;
                    if (xPos > 0) grid[index - 1] = 1;
                    if (xPos < xGrid - 1) grid[index + 1] = 1;
                    $itemPos.iTop  = yPos * cellSize;
                    $itemPos.iLeft = xPos * cellSize;
                    return true;
                  }
                  return false;
                };

            // position all items
            $items.each(function () {
              var $item = $(this);

              if ($(window).width() >= 768) {
                // random positioning once per page load
                if (randomlyPositioned) return;

                // position item randomly in grid without item overlapping
                var count = 0,
                    $pos  = {iTop: 0, iLeft: 0};

                do {
                  count++;
                } while (!_randomItemPosInGrid($pos) && count < 10);

                $item.css({'position': 'absolute', 'top': $pos.iTop, 'left': $pos.iLeft});

              } else {
                // position item in css
                $item.css({'position': 'static', 'top': 'auto', 'left': 'auto'});
              }
            });

            // update random flag
            randomlyPositioned = $(window).width() >= 768;
          });

        }

        // attach the proximity event handler to all proximity items (once)
        $items.once('pe', function () {
          $(this).on('proximity', eventData, Drupal.settings.proximityEventHandler);
        });

        // init all proximity items with given settings by triggering a mouse move on document
        $(document).trigger('mousemove');

      }); // container instances

    }
  };

})(jQuery);

