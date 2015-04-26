<?php
/**
 * @file
 * template.php
 */

global $pixelgarage_path;
$pixelgarage_path = drupal_get_path('theme', 'pixelgarage');

include_once($pixelgarage_path . '/inc/login.inc');        // alters login forms
include_once($pixelgarage_path . '/inc/alter.inc');        // all alter hooks
include_once($pixelgarage_path . '/inc/preprocess.inc');   // all preprocess overrides
include_once($pixelgarage_path . '/inc/process.inc');      // all process overrides
include_once($pixelgarage_path . '/inc/theme.inc');        // all theme overrides


/* =============================================================================
 *    Proximity alter hooks implementation
 * ========================================================================== */

/**
 * Alter the ajax load parameter array. The ajax load parameter array defines an ajax request parameter
 * for each proximity item. This parameter is added at the end of the ajax request url allowing to retrieve
 * a specific content from the server (see next api function). This specific item content is then added to the dialog.
 *
 * @param $ajax_load_params array   Array of ajax load parameters to be altered, one for each proximity item
 *                                  retrieved by the view.
 * @param $view_result      array   The result array of the view.
 */
function pixelgarage_proximity_ajax_load_params_alter(&$ajax_load_params, &$view_result) {
  // Return the node id as ajax parameter for each item.
  foreach ($view_result as $id => $item) {
    $ajax_load_params[$id] = $item->nid;
  }
}

/**
 * Alters the render item that is returned in the ajax call. The $args variable contains the specific arguments
 * added to a specific ajax request.
 *
 * @param $render_item  mixed   The rendered content to be returned to the client. The $render_item should be
 *                              replaced either by a string (rendered html content), a render array or an integer (error code).
 * @param $args         array   The array of all parameters added to the ajax request for a specific proximity item (see above).
 */
function pixelgarage_proximity_ajax_render_item_alter(&$render_item, &$args) {
  // return the render array for the specific node, if available
  $nid = $args[1];
  if ($node= node_load($nid)) {
    $view_mode = 'full';
    if (property_exists($node, 'ds_switch')) {
      // take an alternate view mode set by the ds switch
      $view_mode = $node->ds_switch;
    }
    $render_item = node_view($node, $view_mode);
  }
}


/* =============================================================================
 *      PxlTest theming
 * ========================================================================== */
/**
 * ONLY for PXLTEST
 * To prevent soft line-breaks in HTML pasted to the body field of pxlTest, clean text from <br>.
 * This cleanup is needed for a fully functional Bootstrap test page.
 */
function pixelgarage_field__body__pxltest ($variables) {
  $output = '';

  // Render the label, if it's not hidden.
  if (!$variables['label_hidden']) {
    $output .= '<div class="field-label"' . $variables['title_attributes'] . '>' . $variables['label'] . ':&nbsp;</div>';
  }

  // Render the items.
  $output .= '<div class="field-items"' . $variables['content_attributes'] . '>';
  foreach ($variables['items'] as $delta => $item) {
    $classes = 'field-item ' . ($delta % 2 ? 'odd' : 'even');
    // clean HTML of soft line-breaks
    $item = str_replace(array('<br>', '<br />'), "\n", $item);
    $output .= '<div class="' . $classes . '"' . $variables['item_attributes'][$delta] . '>' . drupal_render($item) . '</div>';
  }
  $output .= '</div>';

  // Render the top-level DIV.
  $output = '<div class="' . $variables['classes'] . '"' . $variables['attributes'] . '>' . $output . '</div>';

  return $output;
}