/* sprite.js
 *
 * sprite & sprite manager
 */

function Sprite(opts) {
    opts = opts || {};

    var spritesheet = opts.spritesheet
      , frame = opts.startFrame || 0
      , frames = opts.frames || []
      , animate = opts.animate || false
      , animateSpeed = opts.animateSpeed || 1
      , lastAnimated = 0
      , speed = opts.speed || 1
      , rotation = opts.rotation || 0
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

            if (animate && (game.getTicks()-lastAnimated >= animateSpeed)) {
                nextFrame();
            }
        }

      , nextFrame = function() {
                lastAnimated = game.getTicks();
                if (++frame >= frames.length-1) frame = frames.length-1;
        }

      , prevFrame = function() {
                lastAnimated = game.getTicks();
                if (--frame < 0) frame = 0;
        }

      , moveLeft = function() {
            x -= speed;
            if (x < 0) x = 0;
        }

      , moveRight = function() {
            x += speed;
            if (x > 639) x = 639;
        }

      , moveForward = function() {
            y -= speed;
            if (y < 0) y = 0;
        }

      , moveBack = function() {
            y += speed;
            if (y > 480) y = 480;
        }

      , fire = function() {
            logger('FIRE!');
        }

      , getInfo = function() {
            return {
                animate: animate
              , frame: frame
              , speed: speed
              , rotation: rotation
              , x: x
              , y: y
            };
        }
    ;

    return {
        moveTo: moveTo
      , draw: draw
      , nextFrame: nextFrame
      , prevFrame: prevFrame
      , getInfo: getInfo
      , moveLeft: moveLeft
      , moveRight: moveRight
      , moveForward: moveForward
      , moveBack: moveBack
      , fire: fire
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
      , queue: queue
    };
}
