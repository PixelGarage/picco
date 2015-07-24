<?php
/**
 * @file
 * View theme template to layout the proximity items and add the bootstrap modal dialog functionality to each item.
 */
?>

<div id="<?php print $container_id; ?>" class="pe-container">
  <div class="pe-background-image"></div>

  <?php foreach ($rows as $id => $row): ?>

    <div class="pe-item pe-item-ajax <?php print 'pe-item-' . $ajax_load_params[$id]; ?> <?php if ($classes_array[$id]) print $classes_array[$id]; ?>" style="margin-left: -4px; width: <?php print $percentage_width; ?>%">
      <div class="pe-item-inner">
        <!-- modal trigger -->
        <a class="btn" role="button" href="<?php print $deep_link_base_url . $ajax_load_params[$id]; ?>" data-ajax-load-param="<?php print $ajax_load_params[$id]; ?>" data-toggle="modal" data-target="#pe-modal-dialog-<?php print $container_index; ?>" >
          <?php print $row; ?>
        </a>
      </div>
    </div>

  <?php endforeach; ?>

  <!--
  Modal dialog displaying the item content
  The item content is retrieved via AJAX or added directly on full page loads
  -->
  <div id="pe-modal-dialog-<?php print $container_index; ?>" class="modal" tabindex="-1" role="dialog" aria-labelledby="peModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <?php if ($title): ?>
            <h2 class="modal-title" id="peModalLabel"><?php print $title; ?></h2>
          <?php endif; ?>
        </div>
        <!-- Body -->
        <div class="modal-body">
          <?php if ($rendered_item) print render($rendered_item) ; ?>
        </div>
        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal"><?php print $close_text; ?></button>
        </div>

      </div>
    </div>
  </div>

  <!--
  Content container (used for page transitions)
  The content for the body is retrieved via AJAX
  -->
  <div id="pe-content-container-<?php print $container_index; ?>" class="pe-content-container" role="page">
    <div class="content"></div>
  </div>

</div>
