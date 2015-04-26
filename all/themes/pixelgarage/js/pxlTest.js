/**
 * This file contains behaviors for the test page.
 *
 * Created by ralph on 31.01.15.
 */

(function ($) {

    /**
     * Helper function. Cleans the html markup for display.
     */
    function cleanSource(html) {
        var lines = html.split(/\n/);

        lines.shift();
        lines.splice(-1, 1); // remove the source button at the end

        var indentSize = lines[0].length - lines[0].trim().length,
            re = new RegExp(" {" + indentSize + "}");

        lines = lines.map(function(line){
            if (line.match(re)) {
                line = line.substring(indentSize);
            }

            return line;
        });

        lines = lines.join("\n");

        return lines;
    }

    /**
     * Displays a code button when hovering over test component. Clicking the button
     * opens a modal displaying the component html markup.
     */
    Drupal.behaviors.pxlTestCodeModalDlg = {
        attach: function () {
            // create a source button
            var $bs_comp = $(".bs-component").css("position", "relative").append("\n"),
                $button = $('<div id="source-button" class="btn btn-primary btn-xs" style="position: absolute;top:0;right:0;">&lt;html&gt;</div>');

            // add click event
            $button.click(function(){
                var html = $(this).parent().html();
                html = cleanSource(html);
                $("#source-modal pre").text(html);
                $("#source-modal").modal();
            });

            // add source button to component on hover
            $bs_comp.hover(function() {
                $(this).append($button);
                $button.show();
            }, function(){
                $button.hide();
            });
        }
    }

    /**
     * Adds a splash to the page.
     */
    Drupal.behaviors.pxlTestSplash = {
        attach: function () {
            $(window).scroll( function () {
                var top = $(document).scrollTop();
                $('.splash').css({
                    'background-position': '0px -'+(top/3).toFixed(2)+'px'
                });
                if(top > 50)
                    $('#home > .navbar').removeClass('navbar-transparent');
                else
                    $('#home > .navbar').addClass('navbar-transparent');
            });
        }
    }

})(jQuery);

