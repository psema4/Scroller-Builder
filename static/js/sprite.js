/* sprite.js
 *
 * sprite & sprite manager
 */

function Sprite(opts) {
    opts = opts || {};

    var frame = 0
      , frames = opts.frames || []
      , spritesheet = opts.spritesheet
      , x = opts.startx || 0
      , y = opts.starty || 0

      , logger = function() { console.log('Sprite:', arguments) }

      , moveTo = function(dx,dy) {
            x = dx;
            y = dy;
        }

      , draw = function(ctx) {
            var srcEl = $('#'+spritesheet)
              , w = frames[frame].srcw
              , h = frames[frame].srch
            ;

            ctx.drawImage( srcEl,
                frames[frame].srcx, frames[frame].srcy, w, h,
                x, y, w, h
            );
        }
    ;

    return {
        moveTo: moveTo
      , draw: draw
    };
}

function SpriteManager(opts) {
    opts = opts || {};

    var spriteSheets = {}
      , queue = []

      , loadSpritesheet = function(id, url, cb) {
            var el = document.createElement('img');
            el.id = id;
            el.className = 'spritesheet';
            el.src = url;

            if (cb && typeof(cb) == 'function') {
                el.addEventListener('load', cb);
            }

            $('#sprite-container').appendChild(el);
        }

      , addSprite = function(spritesheetName, data) {
            data.spritesheet = spritesheetName;
            queue.push(new Sprite(data));
        }

      , drawSprites = function(ctx) {
            for (var i=0; i<queue.length; i++) {
                queue[i].draw(ctx);
            }
        }
    ;

    return {
        drawSprites: drawSprites
      , loadSpritesheet: loadSpritesheet
      , addSprite: addSprite
    };
}
