<?php
/**
 * @file
 * Implements the Proximity views style plugin.
 */

class views_plugin_style_proximity extends views_plugin_style {

  /**
   * Set default options.
   */
  function option_definition() {
    $options = parent::option_definition();

    // define default options
    $default_options = array(
      'proximity_content_container' => 'modal_fix',
      'proximity_position_randomly' => 1,
      'proximity_random_grid_cell_size' => 40,
      'proximity_item_selector' => '',
      'proximity_desc_selector' => '',
      'proximity_start_scale' => 1.0,
      'proximity_end_scale' => 1.3,
      'proximity_start_opacity' => 0.3,
      'proximity_end_opacity' => 0.9,
      'proximity_extent' => 80.0,
      'proximity_trans_duration' => 400,
    );

    // Set default values for proximity
    foreach ($default_options as $option => $default_value) {
      $options[$option]['default'] = $default_value;
      if (is_int($default_value)) {
        $options[$option]['bool'] = TRUE;
      }
    }

    return $options;
  }

  /**
   * Includes the proximity option form into the views style form.
   */
  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);

    // add options to form filled with saved values
    $default_values = $this->options;

    // Add proximity layout options to views style form in a dedicated field set
    $form['proximity'] = array(
      '#type' => 'fieldset',
      '#title' => t('Proximity settings'),
    );

    // display help text for proximity usage
    $form['proximity_help'] = array(
      '#markup' => t('<strong>Proximity style</strong></br>' .
        'Use the proximity style to layout proximity items randomly (or css-positioned) in a container. Proximity items are defined by the view rows and ' .
        'are animated in scale and transparency, when the mouse pointer approches them. Additionally an item description can be displayed, ' .
        'when the mouse is close enough (defined by proximity extent). A mouse click on an item fetches its content via AJAX (see API for more information) and ' .
        'displays it in a modal dialog or a full page container. '
      ),
      '#weight' => -10,
      '#fieldset' => 'proximity',
    );

    // define proximity items
    $form['proximity_content_container'] = array(
      '#type' => 'select',
      '#title' => t('Select content container'),
      '#options' => array(
        'modal_fix' => t('Modal dialog fixed position'),
        'modal_rel' => t('Modal dialog relative to item'),
        'div_cont' => t('Page container'),
      ),
      '#description' => t('Select one of the given container options defining in which container the item content is displayed. Options are: modal dialog relative to item position, modal dialog with fixed position defined in css and a flexible page container.'),
      '#default_value' => $default_values['proximity_content_container'],
      '#required' => true,
      '#weight' => -2,
      '#fieldset' => 'proximity',
    );
    $form['proximity_position_randomly'] = array(
      '#type' => 'checkbox',
      '#title' => t('Position items randomly'),
      '#description' => t('Define, if the proximity items are distributed randomly in the container (default). Deselecting this property means, that the items have to be positioned with css.'),
      '#default_value' => $default_values['proximity_position_randomly'],
      '#weight' => -1,
      '#fieldset' => 'proximity',
    );
    $form['proximity_random_grid_cell_size'] = array(
      '#type' => 'textfield',
      '#title' => t('Random grid cell size'),
      '#description' => t('Define the cell size of the grid used for random distribution (default = 40px).'),
      '#default_value' => $default_values['proximity_random_grid_cell_size'],
      '#size' => 5,
      '#weight' => 0,
      '#fieldset' => 'proximity',
    );
    $form['proximity_item_selector'] = array(
      '#type' => 'textfield',
      '#title' => t('Item selector'),
      '#description' => t('Define the selector of the item element to be animated when approached. Leave empty to animate the item as a whole (default).'),
      '#default_value' => $default_values['proximity_item_selector'],
      '#size' => 128,
      '#maxlength' => 60,
      '#weight' => 1,
      '#fieldset' => 'proximity',
    );
    $form['proximity_desc_selector'] = array(
      '#type' => 'textfield',
      '#title' => t('Description selector'),
      '#description' => t('Define the selector of the item description element to be shown when approached (relative to item). Leave empty to suppress a description popup.'),
      '#default_value' => $default_values['proximity_desc_selector'],
      '#size' => 128,
      '#maxlength' => 60,
      '#weight' => 2,
      '#fieldset' => 'proximity',
    );
    $form['proximity_start_scale'] = array (
      '#type' => 'textfield',
      '#title' => t('Initial scale factor'),
      '#size' => 5,
      '#description'  => t('Define the initial scale factor of an item.'),
      '#default_value' => $default_values['proximity_start_scale'],
      '#weight' => 3,
      '#fieldset' => 'proximity',
    );
    $form['proximity_end_scale'] = array (
      '#type' => 'textfield',
      '#title' => t('Final scale factor'),
      '#size' => 5,
      '#description'  => t('Define the final scale factor of an item.'),
      '#default_value' => $default_values['proximity_end_scale'],
      '#weight' => 4,
      '#fieldset' => 'proximity',
    );
    $form['proximity_start_opacity'] = array (
      '#type' => 'textfield',
      '#title' => t('Initial opacity'),
      '#size' => 5,
      '#description'  => t('Define the initial opacity of an item [0,1].'),
      '#default_value' => $default_values['proximity_start_opacity'],
      '#weight' => 5,
      '#fieldset' => 'proximity',
    );
    $form['proximity_end_opacity'] = array (
      '#type' => 'textfield',
      '#title' => t('Final opacity'),
      '#size' => 5,
      '#description'  => t('Define the final opacity of an item [0,1].'),
      '#default_value' => $default_values['proximity_end_opacity'],
      '#weight' => 6,
      '#fieldset' => 'proximity',
    );
    $form['proximity_extent'] = array (
      '#type' => 'textfield',
      '#title' => t('Extent of proximity effect'),
      '#size' => 5,
      '#description'  => t('Define the extent of the proximity effect for an item (unit = px).'),
      '#default_value' => $default_values['proximity_extent'],
      '#weight' => 7,
      '#fieldset' => 'proximity',
    );
    $form['proximity_trans_duration'] = array(
      '#type' => 'textfield',
      '#title' => t('Transition duration'),
      '#description' => t('Duration of the transition in milliseconds when items change position or appearance.'),
      '#default_value' => $default_values['proximity_trans_duration'],
      '#size' => 10,
      '#maxlength' => 5,
      '#weight' => 8,
      '#fieldset' => 'proximity',
    );

  }

}

