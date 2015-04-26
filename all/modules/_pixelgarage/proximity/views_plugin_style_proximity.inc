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
      'proximity_random_position' => 1,
      'proximity_trans_duration' => 400,
      'proximity_start_scale' => 1.0,
      'proximity_end_scale' => 1.3,
      'proximity_start_opacity' => 0.3,
      'proximity_end_opacity' => 0.9,
      'proximity_extent' => 80.0,
      'proximity_item_selector' => '',
      'proximity_desc_selector' => '',
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

    // define proximity effect
    $form['proximity_random_position'] = array(
      '#type' => 'checkbox',
      '#title' => t('Position items randomly'),
      '#description' => t('Flag defines, if the position of the proximity items are randomly set inside the container or not.'),
      '#default_value' => $default_values['proximity_random_position'],
      '#weight' => 0,
      '#fieldset' => 'proximity',
    );
    $form['proximity_item_selector'] = array(
      '#type' => 'textfield',
      '#title' => t('Item selector'),
      '#description' => t('Define the field selector (css class) of the field to be animated when approached. Leave empty to animate the row as a whole (default).'),
      '#default_value' => $default_values['proximity_item_selector'],
      '#size' => 128,
      '#maxlength' => 60,
      '#weight' => 1,
      '#fieldset' => 'proximity',
    );
    $form['proximity_desc_selector'] = array(
      '#type' => 'textfield',
      '#title' => t('Description selector'),
      '#description' => t('Define the field selector (css class) of the description field to be shown when approached. Leave empty to suppress a description.'),
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
      '#description'  => t('Define the initial scale factor for the cells in the proximity effect widget.'),
      '#default_value' => $default_values['proximity_start_scale'],
      '#weight' => 3,
      '#fieldset' => 'proximity',
    );
    $form['proximity_end_scale'] = array (
      '#type' => 'textfield',
      '#title' => t('Final scale factor'),
      '#size' => 5,
      '#description'  => t('Define the final scale factor for the cells in the proximity effect widget.'),
      '#default_value' => $default_values['proximity_end_scale'],
      '#weight' => 4,
      '#fieldset' => 'proximity',
    );
    $form['proximity_start_opacity'] = array (
      '#type' => 'textfield',
      '#title' => t('Initial opacity'),
      '#size' => 5,
      '#description'  => t('Define the initial opacity for the cells in the proximity effect widget [0,1].'),
      '#default_value' => $default_values['proximity_start_opacity'],
      '#weight' => 5,
      '#fieldset' => 'proximity',
    );
    $form['proximity_end_opacity'] = array (
      '#type' => 'textfield',
      '#title' => t('Final opacity'),
      '#size' => 5,
      '#description'  => t('Define the final opacity for the cells in the proximity effect widget [0,1].'),
      '#default_value' => $default_values['proximity_end_opacity'],
      '#weight' => 6,
      '#fieldset' => 'proximity',
    );
    $form['proximity_extent'] = array (
      '#type' => 'textfield',
      '#title' => t('Extent of proximity effect'),
      '#size' => 5,
      '#description'  => t('Define the extent of the proximity effect in the widget (unit = px).'),
      '#default_value' => $default_values['proximity_extent'],
      '#weight' => 7,
      '#fieldset' => 'proximity',
    );
    $form['proximity_trans_duration'] = array(
      '#type' => 'textfield',
      '#title' => t('Transition duration'),
      '#description' => t('Duration in milliseconds of the transition when items change position or appearance.'),
      '#default_value' => $default_values['proximity_trans_duration'],
      '#size' => 10,
      '#maxlength' => 5,
      '#weight' => 8,
      '#fieldset' => 'proximity',
    );

    // display help text for proximity usage
    $form['proximity_help'] = array(
      '#markup' => t('Help text'),
      '#fieldset' => 'proximity',
    );

  }

}

