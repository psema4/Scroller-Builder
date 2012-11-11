/* sprite.js
 *
 * sprite & sprite manager
 */

function Sprite(opts) {
    opts = opts || {};

    var spritesheet = opts.spritesheet
      , frame = opts.startFrame || 0
      , defFrame = opts.startFrame || 0
      , frames = opts.frames || []
      , animate = opts.animate || false
      , animateSpeed = opts.animateSpeed || 1
      , lastAnimated = 0
      , speed = opts.speed || 1
      , rotation = opts.rotation || 0
      , score = opts.score || 0
      , value = opts.value || 0
      , x = opts.startx || 0
      , y = opts.starty || 0
      , _img = new Image()

      , saveAsImage = function() {
            var srcEl = $('#'+spritesheet)
              , w = frames[frame].srcw
              , h = frames[frame].srch
              , tmpCanvas = document.createElement('canvas')
              , tmpCtx = tmpCanvas.getContext('2d')
            ;

            tmpCanvas.width = w;
            tmpCanvas.height = h;

            // copy sprite source frame to tmpCanvas
            tmpCtx.drawImage( srcEl,
                frames[frame].srcx, frames[frame].srcy, w, h,
                0, 0, w, h
            );

            _img.src = tmpCanvas.toDataURL("image/png");
        }
      , getDataURL = function() { if (_img.src == "") saveAsImage(); return _img.src; }

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

      , setFrame = function(targetFrame) {
                lastAnimated = game.getTicks();
                frame = targetFrame;
                if (frame < 0) frame = 0;
                if (frame >= frames.length-1) frame = frames.length-1;
        }

      , defaultFrame = function() {
            setFrame(defFrame);
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

      , setScore = function(v) {
            score = v;
        }

      , incScore = function(v) {
            score += v;
        }

      , setValue = function(v) {
            value = v;
        }

      , incValue = function(v) {
            value += v;
        }

      , getInfo = function() {
            return {
                animate: animate
              , frame: frame
              , speed: speed
              , rotation: rotation
              , score: score
              , value: value
              , x: x
              , y: y
              , w: frames[frame].srcw
              , h: frames[frame].srch
            };
        }

      , setSpeed = function (value) {
      		speed = parseInt(value);
        }

      , setRotation = function (value) {
      		rotation = parseInt(value);
        }

      , setAnimate = function (value) {
      		animate = value;
        }
    ;

    return {
        moveTo: moveTo
      , draw: draw
      , setFrame: setFrame
      , defaultFrame: defaultFrame
      , nextFrame: nextFrame
      , prevFrame: prevFrame
      , getInfo: getInfo
      , moveLeft: moveLeft
      , moveRight: moveRight
      , moveForward: moveForward
      , moveBack: moveBack
      , fire: fire
      , setScore: setScore
      , setValue: setValue
      , saveAsImage: saveAsImage
      , getDataURL: getDataURL
      , setSpeed: setSpeed
      , setRotation: setRotation
    };
}

function SpriteManager(opts) {
    opts = opts || {};

    var spriteSheets = {}
      , queue = []

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

      , addSprite = function(spritesheetName, data) {
            data.spritesheet = spritesheetName;
            queue.push(new Sprite(data));
            return queue[queue.length-1];
        }

      , drawSprites = function(ctx) {
            for (var i=0; i<queue.length; i++) {
                queue[i].draw(ctx);
            }
        }

      , removeAll = function() {
            while (queue.length > 0) queue.pop();
        }
    ;

    return {
        drawSprites: drawSprites
      , loadSpritesheet: loadSpritesheet
      , addSprite: addSprite
      , queue: queue
      , removeAll: removeAll
    };
}
