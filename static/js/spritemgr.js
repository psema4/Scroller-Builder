/* *spritemgr.js*
*/

/* @constructor
 *
 * Creates a SpriteManager
 * 
 * @param {Object} opts SpriteManager options
 * @returns {Object} a SpriteManager object
 */

function SpriteManager(opts) {
    opts = opts || {};

    var spriteSheets = {}
      , queue = []

        /* @method loadSpritesheet
         * @public
         * 
         * Load a spritesheet into the DOM. Individual Sprites() can extract rects from this image to use as frames.
         * 
         * @param {String} id dom node id to hold this spritesheet
         * @param {String} url src for this spritesheet
         * @param {Function} cb function to execute after successful load
         */
      , loadSpritesheet = function(id, url, cb) {
      		if (document.getElementById(id)) {
      			return cb();
      		}
            var el = document.createElement('img');
            el.id = id;
            el.className = 'spritesheet';
            el.src = url;

            if (cb && typeof(cb) == 'function') {
                el.addEventListener('load', cb);
            }

            $('#sprite-container').appendChild(el);
        }

        /* @method addSprite
         * @public
         *
         * Add a sprite to the queue
         *
         * @param {String} spritesheetName the spritesheets dom node id
         * @param {Object} data sprite specification object
         * @returns {Sprite} the new Sprite() that was added
         */
      , addSprite = function(spritesheetName, data) {
            data.spritesheet = spritesheetName;
            queue.push(new Sprite(data));
            return queue[queue.length-1];
        }

        /* @method drawSprites
         * @public
         *
         * Draw all known sprites to the specified canvas context
         * @param {2dContext} ctx the canvas context to blit the sprites to
         */
      , drawSprites = function(ctx) {
            for (var i=0; i<queue.length; i++) {
                queue[i].draw(ctx);
            }
        }

        /* @method removeAll
         * @public
         *
         * Remove all known sprites
         */
      , removeAll = function() {
            while (queue.length > 0) queue.pop();
        }
    ;

    // Public API
    return {
        drawSprites: drawSprites
      , loadSpritesheet: loadSpritesheet
      , addSprite: addSprite
      , queue: queue
      , removeAll: removeAll
    };
}
