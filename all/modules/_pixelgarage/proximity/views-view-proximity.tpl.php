<?php
/**
 * @file
 * View theme template to layout the proximity items and add the bootstrap modal dialog functionality to each item.
 */
?>

<div class="pe-container">
  <div class="pe-background-image"></div>

  <?php foreach ($rows as $id => $row): ?>

    <div class="pe-item <?php print 'pe-item-' . $id; ?> <?php if ($classes_array[$id]) print $classes_array[$id]; ?>" style="margin-left: -4px; width: <?php print $percentage_width; ?>%">
      <div class="pe-item-inner">
        <!-- modal trigger -->
        <a class="btn" role="button" data-toggle="modal" data-target="#pe-modal-dialog" data-ajax-load-param="<?php if ($ajax_load_params[$id]) print $ajax_load_params[$id]; ?>">
          <?php print $row; ?>
        </a>
      </div>
    </div>

  <?php endforeach; ?>

  <!--
  Modal dialog
  The content for the body is retrieved via AJAX
  -->
  <div id="pe-modal-dialog" class="modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        </div>
        <!-- Body -->
        <div class="modal-body">
        </div>
        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal"><?php print $close_text; ?></button>
        </div>

      </div>
    </div>
  </div>

</div>
