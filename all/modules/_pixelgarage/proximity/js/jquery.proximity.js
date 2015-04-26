/**
 * Proximity event for jQuery
 * ---
 * @author James Padolsey (http://james.padolsey.com)
 * @version 0.1
 * @updated 28-JUL-09
 * @info http://github.com/jamespadolsey/jQuery-plugins/proximity-event/
 * ---
 * @author Ralph Moser (http://ramosoft.ch)
 * @version 0.2
 * @updated 07-Dec-13
 * @info    Added touch events to support proximity event on mobile devices
 * ---
 * For a deeper understanding of how to build jQuery Special Events read the excellent article of Ben Alman
 * @info http://benalman.com/news/2010/03/jquery-special-events/
 */

(function($){
    
    var elems = $([]),
        doc = $(document);
    
    $.event.special.proximity = {
        
        defaults: {
            max: 100,           // max. distance of an element from the mouse pointer the element gets the proximity event
            min: 0,             // min. distance of an element from the mouse pointer ...
            throttle: 0,        // minimal time in milli-seconds between two consecutive events
            fireOutOfBounds: 1  // event fires for elements out of bound, if TRUE (if number > 0, fires n times)
        },
        
        setup: function(data) {
            
            if (!elems[0]) {
                doc.mousemove(mouseMoveHandle);
                //doc.on('touchmove', touchMoveHandle);
                //doc.on('touchend', touchEndHandle);
            }

            elems = elems.add(this);
            
        },
        
        add: function(o) {
            
            var handler = o.handler,
                data = $.extend({}, $.event.special.proximity.defaults, o.data),
                lastCall = 0,
                nFiredOutOfBounds = 0,
                hoc = $(this);
            
            o.handler = function(e, pageX, pageY) {
                
                var max = data.max,
                    min = data.min,
                    throttle = data.throttle,
                    date = +new Date,
                    distance,
                    proximity,
                    inBounds,
                    fireOutOfBounds = data.fireOutOfBounds;

                // throttle the number of calls per seconds (mousemove is called extensively)
                if (throttle && lastCall + throttle > date) {
                    return;
                }
                
                lastCall = date;
                
                distance = calcDistance(hoc, pageX, pageY);
                inBounds = distance < max && distance > min;
                
                if (fireOutOfBounds || inBounds) {
                    
                    if (inBounds) {
                        nFiredOutOfBounds = 0;
                    } else {
                        
                        // If fireOutOfBounds is a number then keep incrementing a
                        // counter to determine how many times the handler's been
                        // called out of bounds. Note: the counter is reset whenever
                        // the cursor goes back inBounds...
                        
                        if (typeof fireOutOfBounds === 'number' && nFiredOutOfBounds > fireOutOfBounds) {
                            return;
                        }
                        ++nFiredOutOfBounds;
                    }
                
                    proximity = e.proximity = 1 - (
                        distance < max ? distance < min ? 0 : distance / max : 1
                    );
                    
                    e.distance = distance;
                    e.pageX = pageX;
                    e.pageY = pageY;
                    e.data = data;

                    // call the attached handler with the calculated values
                    return handler.call(this, e, proximity, distance);
                
                }
                
            };
            
        },
        
        teardown: function(){
            
            elems = elems.not(this);
            
            if (!elems[0]) {
                doc.unbind('mousemove', mouseMoveHandle);
                //doc.off('touchmove', touchMoveHandle);
                //doc.off('touchend', touchEndHandle);
            }

        }
        
    };
    
    function calcDistance(el, x, y) {
        
        // Calculate the distance from the closest edge of the element
        // to the cursor's current position
        
        var left, right, top, bottom, offset,
            cX, cY, dX, dY,
            distance = 0;
        
        offset = el.offset();
        left = offset.left;
        top = offset.top;
        right = left + el.outerWidth();
        bottom = top + el.outerHeight();
        
        cX = x > right ? right : x > left ? x : left;
        cY = y > bottom ? bottom : y > top ? y : top;
        
        dX = Math.abs( cX - x );
        dY = Math.abs( cY - y );
        
        return Math.sqrt( dX * dX + dY * dY );
            
    }
    
    function mouseMoveHandle(e) {
        
        var x = e.pageX,
            y = e.pageY,
            i = -1,
            fly = $([]);
        
        while (fly[0] = elems[++i]) {
            fly.triggerHandler('proximity', [x,y]);
        }

    }

    /**
     * This handler suppresses the default behavior for a one-finger touch move (scrolling)
     * to allow a new behavior based on the proximity event.
     *
     * @param e
     */
    function touchMoveHandle(e) {
        // get original event to access touch info
        var event = e.originalEvent;

        // handle one finger touch move only
        if (event.touches.length == 1) {

            var touch = event.touches[0],
                x = touch.pageX,
                y = touch.pageY,
                i = -1,
                fly = $([]);

            // stop the scrolling
            event.preventDefault();

            while (fly[0] = elems[++i]) {
                fly.triggerHandler('proximity', [x,y]);
            }

        }

    }

    /**
     * This handler ends a one-finger touch move. Used to reset proximity event.
     *
     * @param e
     */
    function touchEndHandle(e) {
        // get original event to access touch info
        var event = e.originalEvent;

        // handle one finger touch end only
        if (event.changedTouches.length == 1) {

            var fly = $([]),
                i   = -1;

            // use a far away point to reset all involved elements
            while (fly[0] = elems[++i]) {
                fly.triggerHandler('proximity', [9999,9999]);
            }

        }

    }
    
}(jQuery));