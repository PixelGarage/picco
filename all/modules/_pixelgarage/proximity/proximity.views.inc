<?php
/**
 * @file
 * Defines a views style plugin to add proximity layouts to views.
 */

/**
 * Implements hook_views_plugins().
 */
function proximity_views_plugins() {
  return array(
    'style' => array(
      'proximity' => array(
        'title' => t('Proximity layouts'),
        'handler' => 'views_plugin_style_proximity',
        'uses options' => TRUE,
        'help' => t("Display regularly or irregularly distributed items that animate on mouse approach."),
        'theme' => 'views_view_proximity', // theme hook
        'type' => 'normal',
        'uses row plugin' => TRUE,
        'uses row class' => TRUE,
        'uses grouping' => FALSE,
      ),
    ),
  );
}

