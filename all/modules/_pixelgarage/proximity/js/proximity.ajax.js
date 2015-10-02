/**
 * Proximity item AJAX implementation
 * This implementation allows to load a proximity item content via AJAX while supporting deep linking, that can be
 * used to share or bookmark specific proximity items.
 *
 * A single/double pointer click requests the item content via an AJAX call and allows to display
 * the content in a modal dialog or a div-container.
 *
 * Deep linking is implemented with the new HTML5 history object (pushState, replaceState etc.) and
 * the window popState event, which are supported by the following browsers (January 2013):
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
 *  If a browser doesn't support the HTML5 history object, the proximity item content is loaded with
 *  a full page request, as well as if no JavaScript is available.
 *
 *  See also the excellent article about deep linking ajax applications: http://www.codemag.com/Article/1301091
 */

(function ($) {

  /**
   * Loads the content of a specific proximity item via AJAX into the specified container.
   *
   * After the content is loaded, the modal dialog is positioned (if position is relative to item)
   * and the backdrop height is adjusted to the dialog height.
   *
   * @param container_index   int     Defines the container index of the proximity item.
   * @param param             string  Defines the specific proximity item parameter.
   */
  function loadItemContent(container_index, param) {
    //
    // Mobile devices: load item content on second touch
    var mobileBehavior = Drupal.settings.proximity['pe-container-' + container_index].mobile_behavior;

    if (isMobile.any && mobileBehavior == 'touch_two' && Drupal.settings.proximityItemTouchCounter == 0) {
      return;
    }

    //
    // load item specific content into specified container via ajax
    var $container    = $('#pe-container-' + container_index),
        $item         = $container.find('.pe-item-' + param),
        $dialog       = $container.find('.modal'),
        settings      = Drupal.settings.proximity['pe-container-' + container_index],
        $target       = (settings.ajax_container == 'div_cont') ? $container.find('.pe-content-container') : $dialog.find('.modal-body'),
        ajax_url      = settings.ajax_base_url + param,     // specific item ajax link
        transDuration = parseInt(settings.trans_duration);

    var _calcModalDialogPos = function () {
      // size and position the modal dialog relative to the item position
      var $innerDialog = $dialog.find('.modal-dialog'),
          wDialog      = $innerDialog.width(),
          iTop         = parseInt($item.css('top')),
          iLeft        = parseInt($item.css('left')),
          padding      = 20,
          wItem        = $item.width() + padding,
          hShift       = $container.offset().left,
          // show dialog always inside of the item container (left or right of the item)
          leftPos      = (iLeft + wItem + wDialog > $container.width())
            ? Math.max(iLeft + hShift - wDialog - padding, hShift)    // left of cell
            : iLeft + hShift + wItem;                                 // right of cell

      // position dialog
      $innerDialog.css({'position': 'absolute', 'top': iTop, 'left': leftPos});
    };

    var _setModalBackdropHeight = function () {
      var hContent = $dialog.find('.modal-content').height(),
          hDialog  = $dialog.find('.modal-dialog').height(),
          hTotal   = $(window).height() + hContent - hDialog;

      // update backdrop height according to dialog content
      $dialog.find('.modal-backdrop').css('height', hTotal);
    };


    //
    // set the loading indicator on the target and load target content via ajax
    $container.append(settings.ajax_loading_html);
    $target.load(ajax_url, function (response, status, xhr) {
      $container.find('div').remove('#proximity-ajax-loader');
      if (status == "error") {
        var msg = "Content could not be loaded: ";
        $target.html(msg + xhr.status + " " + xhr.statusText);
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
            _calcModalDialogPos();
          }

          // show modal dialog
          $dialog.fadeIn(transDuration).modal('show');

        }

        // set backdrop height according to content height.
        // Wait a short time to get correct height
        window.setTimeout(_setModalBackdropHeight, 200);
      }
    });

  }


  /*
   * Browser history support for AJAX deep linking
   *
   * Detects if the actual link in the history is an AJAX deep link
   * and loads the content accordingly.
   */

  // Chrome & Safari (WebKit browsers) raise the popstate
  // event when the page loads. All other browsers only
  // raise this event when the forward or back buttons are
  // clicked. Therefore, the '_popStateEventCount' allows
  // the page to skip running the contents of popstate event
  // handler during page load so the content is not loaded
  // twice in WebKit browsers.
  var _popStateEventCount = 0;

  // This event only fires in browsers that implement
  // the HTML5 History APIs.
  //
  // IMPORTANT: The use of single quotes here is required
  // for full browser support.
  //
  // Ex: Safari will not fire the event
  // if you use: $(window).on("popstate")
  $(window).off('popstate');
  $(window).on('popstate', function () {

    _popStateEventCount++;

    if (navigator.userAgent.indexOf('AppleWebKit') != -1 && _popStateEventCount == 1) {
      return;
    }

    // Remark to event arguments:
    // The event arguments are designed to include information of the state information passed
    // in by the first argument in the pushState or replaceState functions.
    // Unfortunately not all browsers persist the state information in the same way (Safari), so
    // we get the current location from the window.location object instead.
    var path = window.location.href;

    // if current location is a proximity item deep link, load it via AJAX
    if (path.indexOf(Drupal.settings.proximity_url_base_path) >= 0) {
      // get param from current location
      var isAdminOverlay = path.indexOf('#overlay=admin') > -1,
          pathSplitter   = path.split("/"),
          param          = pathSplitter.pop(),
          containerIndex = pathSplitter.pop();

      // load item with AJAX only, if no admin overlay is open
      if (!isAdminOverlay)
        loadItemContent(containerIndex, param);
    }

  });


  /**
   *  Pointer click implementation for all proximity items in all proximity containers on page.
   *
   *  A click on a proximity item requests the item content via AJAX and adds the content to a
   *  defined content container (modal dialog or dedicated div container).
   *
   *  If session history management is not available, do a full page request (no AJAX deep linking possible)
   */
  Drupal.behaviors.proximityItemClick = {
    attach: function () {
      // Iterate through all proximity container instances
      $.each(Drupal.settings.proximity, function (container, settings) {

        var $container = $('#' + container),
            $items     = $container.find('.pe-item-ajax');

        // attach click event to all proximity items to load their content via AJAX
        $items.once('item-click', function () {
          $(this).on('click', function () {
            //
            // if browser does not support history object, perform normal item click (full page request)
            // to build request history
            if (!Modernizr.history) {
              // don't open modal dialog before performing full page request (dialog is opened during page load)
              $(this).find('a.btn').removeAttr('data-toggle');
              return true;
            }

            //
            // load item specific content via ajax and update history object
            var $item          = $(this),
                $button        = $item.find('a.btn'),
                param          = $button.attr('data-ajax-load-param'),
                containerIndex = container.split('-').pop(),
                item_url = settings.item_base_url + param;        // specific item url

            // add item url to history object
            window.history.pushState(null, "", item_url);

            // load item content with AJAX
            loadItemContent(containerIndex, param);

            // This prevents the modal trigger button to be clicked (default behavior)
            // and instead opens the modal dialog when AJAX returns.
            return false;
          });
        });

      }); // proximity container instances
    }
  };

  /**
   *  Modal dialog handling.
   *
   *  Opens the modal dialog, if a full page request is performed (no ajax involved) and
   *  guarantees, that all content is cleared (audio, video stopped) on modal dialog closing.
   */
  Drupal.behaviors.modalDialogHandling = {
    attach: function () {
      // Iterate through all proximity container instances
      $.each(Drupal.settings.proximity, function (container, settings) {

        var $container    = $('#' + container),
            $dialog       = $container.find('.modal'),
            transDuration = parseInt(settings.trans_duration);


        //
        // open modal dialog, if a full item page request occurred (no ajax)
        if (!settings.ajax_request) {
          $dialog.fadeIn(transDuration).modal('show');
          // reset flag
          settings.ajax_request = false;

        }

        // when modal dialog is closed, make sure that all content is cleared (videos, audios etc.)
        $dialog.once('modal-hidden', function () {
          $dialog.on('hidden.bs.modal', function () {
            // empty the modal body stopping all media etc.
            $(this).find('.modal-body').empty();
          });
        });

      }); // proximity container instances
    }
  };

})(jQuery);

