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

  // background audio in different format
  $beat_uri = null;
  $icon_uri = null;
  $beat_title = '';

  $query = new EntityFieldQuery();
  $query->entityCondition('entity_type', 'node')
    ->entityCondition('bundle', 'PiccoBeat')
    ->range(0, 1);
  $result = $query->execute();

  if (isset($result['node'])) {
    // get audio file path and icon
    $node = node_load(key($result['node']));
    foreach ($node->field_beat_file[LANGUAGE_NONE] as $index => $file) {
      // file mime type
      $beat_mime = $file['filemime'];
      if (!empty($beat_mime)) {
        if ($beat_mime == 'audio/mpeg') $beat_mime = 'audio/mp4';
        $vars['beat_mime_' . $index] = $beat_mime;
        // file uri
        $beat_uri = $file['uri'];
        $vars['beat_src_' . $index] = !empty($beat_uri) ? file_create_url($beat_uri) : null;
      }
    }
    $icon_uri = $node->field_image[LANGUAGE_NONE][0]['uri'];
    $beat_title = $node->title;
  }
  $vars['beat_icon_src'] = !empty($icon_uri) ? file_create_url($icon_uri) : null;
  $vars['beat_title'] = $beat_title;

  // background video in different formats
  $video_path = file_create_url('public://') . '/videos';
  $image_path = drupal_get_path('theme', 'pixelgarage') . '/images';
  $vars['poster_img'] = $image_path . '/Picco001.jpg';
  $vars['webM_video'] = $video_path . '/Picco.webm';
  $vars['mp4_video'] = $video_path . '/Picco.mp4';

  // background images and logo
  $vars['img_001'] = $image_path . '/Picco001.jpg';
  $vars['img_002'] = $image_path . '/Picco002.jpg';
  $vars['img_003'] = $image_path . '/Picco003.jpg';
  $vars['img_004'] = $image_path . '/Picco004.jpg';
  $vars['picco_logo'] = $image_path . '/picco_logo.png';
}

