<?php
/**
 * Created by PhpStorm.
 * User: ralph
 * Date: 06.02.15
 * Time: 17:23
 */

/**
 * Preprocess variables for the html template.
 */
function pixelgarage_preprocess_html(&$vars) {
  // make sure jQuery UI and effects is loaded for anonymous users
  drupal_add_library('system', 'ui');
  drupal_add_library('system', 'effects');

}

/**
 * Override or insert variables for the page templates.
 */
function pixelgarage_preprocess_page(&$vars) {
  // hide titles on login forms
  pg_login_preprocess_page($vars);

  // background video in different formats
  $video_path = file_create_url('public://') . '/videos';
  $image_path = drupal_get_path('theme', 'pixelgarage') . '/images';
  $vars['poster_img'] = $image_path . '/picco.jpg';
  $vars['webM_video'] = $video_path . '/picco.webm';
  $vars['m4v_video'] = $video_path . '/picco.m4v';
  $vars['ogg_video'] = $video_path . '/picco.ogv';
  $vars['mp4_video'] = $video_path . '/picco.mp4';

}

