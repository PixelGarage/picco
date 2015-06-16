/**
 * ---
 * @author Ralph Moser (http://ramosoft.ch)
 * @version 0.1
 * @updated 11-06-14
 * ---
 */

(function($) {

    /**
     * This behavior adds the proximity event to all items in the responsive proximity widget.
     * The proximity event is supported in IE 9+, Chrome, Firefox, Safari and Opera.
     */
    Drupal.behaviors.proximityInitItems =  {
        attach: function() {

          // Iterate through all proximity view instances
          $.each(Drupal.settings.proximity, function (container, settings) {

              var $container  = $(container),
                  $items      = $container.find(settings.item_selector),
                  minScale    = parseFloat(settings.start_scale),
                  maxScale	  = parseFloat(settings.end_scale),
                  minOpacity  = parseFloat(settings.start_opacity),
                  maxOpacity  = parseFloat(settings.end_opacity),
                  eventData   = {
                    min             : 0,
                    max             : parseInt(settings.extent),
                    throttle        : 20,
                    fireOutOfBounds : true
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
                      var whItem = 60,
                          xGrid = Math.floor($container.width() / whItem),
                          yGrid = Math.floor($container.height() / whItem),
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
                                  $itemPos.iTop = yPos*whItem;
                                  $itemPos.iLeft = xPos*whItem;
                                  return true;
                              }
                              return false;
                          },
                          _posItemDialog = function($item, $dialog, iTop, iLeft) {
                              // size and position the dialog based on the scaled item
                              var dist        = 20,
                                  wItem       = $item.width() + dist,
                                  wShift      = $container.offset().left,
                              // show dialog always inside of the item container (left or right of cell
                                  leftPos     = (iLeft + wItem + $dialog.width() > $container.width())
                                      ? Math.max(iLeft + wShift - $dialog.width() - dist, wShift)    // left of cell
                                      : iLeft + wShift + wItem;                               // right of cell

                              // position dialog
                              $dialog.css({'position': 'absolute', 'top': iTop, 'left': leftPos});
                          };

                      // position all items and their dialogs
                      $items.each(function () {
                          var $item = $(this),
                              $dialog = $item.next().find('.modal-dialog');

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
                              //_posItemDialog($item, $dialog, $pos.iTop, $pos.iLeft);

                          } else {
                              // normal positioning of item and dialog
                              $item.css({'position': 'static', 'top': 'auto', 'left': 'auto'});
                              //$dialog.css({'position': 'relative', 'top': 0, 'left': 0});
                          }
                      });

                      // update random flag
                      randomlyPositioned = $(window).width() >= 768;
                  });

              }

              // attach the proximity event handler to all proximity items (once)
              $items.once('pe', function() {
                $(this).on('proximity', eventData, function(event, proximity, distance) {
                    // scale and / or change opacity of item depending on the mouse-item distance
                    var $item		= $(this),
                        scaleVal	= proximity * ( maxScale - minScale ) + minScale,
                        scaleExp	= 'scale(' + scaleVal + ')',
                        opacityVal  = proximity * ( maxOpacity - minOpacity ) + minOpacity;

                    // force the cell to the front when it reaches the maximum scale value and show its description, if available
                    if (scaleVal === maxScale) {
                        // put cell to front
                        $item.css( 'z-index', 10 );

                    } else {
                        // reset cell, stop animation and hide description
                        $item.css( 'z-index', 1 );

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
                });
              });

              // attach click event to all proximity items to load dialog content via AJAX
              $items.once('click', function() {
                $(this).on('click', function(ev) {
                    var $button = $(this).find('a.btn'),
                        $target = $('#pe-modal-dialog .modal-body'),
                        param = $button.attr('data-ajax-load-param'),
                        ajax_url = settings.ajax_url + param;

                    // set the loading html on the target and load target content via ajax
                    $target.html(settings.ajax_loading);
                    $target.load(ajax_url, function( response, status, xhr ) {
                        if ( status == "error" ) {
                            var msg = "Content could not be loaded: ";
                            $target.html( msg + xhr.status + " " + xhr.statusText );
                        } else {
                            // make sure all behaviors are attached to new content
                            Drupal.attachBehaviors($target, settings);

                            // adapt backdrop height to full height (dialog overflow)
                            var overflow = $('#pe-modal-dialog .modal-content').height() - $('#pe-modal-dialog .modal-dialog').height();
                            $('#pe-modal-dialog .modal-backdrop').css('height', '+=' + overflow);
                        }
                    });
                });
              });

              // init all proximity items with given settings by triggering a mouse move on document
              $(document).trigger('mousemove');

          }); // container instances

        }
    };


})(jQuery);

