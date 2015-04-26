<?php
/**
 * Proximity module hooks.
 *
 * User: ralph
 * Date: 22.04.15
 */

/**
 * Alter the ajax load parameter array. The ajax load parameter array defines an ajax request parameter
 * for each proximity item. This parameter is added at the end of the ajax request url allowing to retrieve
 * a specific content from the server (see next api function). This specific item content is then added to the dialog.
 *
 * @param $ajax_load_params array   Array of ajax load parameters to be altered, one for each proximity item
 *                                  retrieved by the view.
 * @param $view_result  array       The result array of the view.
 */
function hook_proximity_ajax_load_params_alter(&$ajax_load_params, &$view_result) {
  // Example: the view retrieves nodes as proximity items. Return the node id as ajax parameter for each item.
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
 * @param $args        array    The array of all parameters added to the ajax request for a specific proximity item (see above).
 */
function hook_proximity_ajax_render_item_alter(&$render_item, &$args) {
  // the $args variable contains a node id (see above), return the render array for the specific node
  $nid = $args[0];
  if ($node= node_load($nid)) {
    $render_item = node_view($node);
  }
}