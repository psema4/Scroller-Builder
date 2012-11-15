/* *sprite.js*
*/

/* @constructor
 *
 * Represents a Sprite in ScrollerBuilder
 *
 * Options:
 * - spritesheet
 * - name
 * - x, y, dx, dy, speed (position, tick-delta's & multiplier)
 * - frames, startFrame, animate, animateSpeed
 * - score, value
 * - rotation, rotateStep, rotateSpeed !(not implemented)!
 *
 * @param {Object} opts Options
 * @returns {Object} a Sprite object
 */

function Sprite(opts) {
    opts = opts || {};

    var spritesheet = opts.spritesheet
      , name = opts.name || 'newsprite'
      , frame = opts.startFrame || 0
      , defFrame = opts.startFrame || 0
      , frames = opts.frames || []
      , animate = opts.animate || false
      , animateSpeed = opts.animateSpeed || 1
      , lastAnimated = 0
      , speed = opts.speed || 1
      , rotation = opts.rotation || 0
      , rotateStep = opts.rotateStep || 0
      , rotateSpeed = opts.rotateSpeed || 0
      , score = opts.score || 0
      , value = opts.value || 0
      , x = opts.startx || 0
      , y = opts.starty || 0
      , dx = opts.dx || 0
      , dy = opts.dy || 0
      , _img = new Image()

        /* @method saveAsImage
         * @public
         * 
         * Render the sprite's current frame to an internal Image 
         * 
         */
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

        /* @method getDataURL
         * @public
         *
         * Get the data URL representation of the sprite
         *
         * @returns {String} src attribute of internal Image
         */
      , getDataURL = function() {
            if (_img.src == "") saveAsImage(); return _img.src;
        }

        /* @method logger
         * @private
         * @param {Mixed} arguments One or more items to log to the js console
         */
      , logger = function() {
            console.log('Sprite:', arguments) }

        /* @method moveTo
         *
         * Position the sprite
         *
         * @param {Integer} x horizontal position
         * @param {Integer} y vertical position
         */
      , moveTo = function(dx,dy) {
            x = dx;
            y = dy;
        }

        /* @method draw
         * @public
         *
         * Renders the current frame after applying translations. Advances the current frame and applies rotation before exiting.
         *
         * @param {2dContext} ctx context of the canvas to draw to
         */
      , draw = function(ctx) {
            var srcEl = $('#'+spritesheet)
              , w = frames[frame].srcw
              , h = frames[frame].srch
            ;

            // update movement
            x += dx * speed
            y += dy * speed

            if (y > 480) speed = 0; // destroy

            ctx.drawImage( srcEl,
                frames[frame].srcx, frames[frame].srcy, w, h,
                x, y, w, h
            );

            if (animate && (game.getTicks()-lastAnimated >= animateSpeed)) {
                if (rotateStep != 0) {
                    rotation += rotateStep;
                    if (rotation < 0) rotation += 360;
                    if (rotation > 360) rotation -= 360;
                };

                

                nextFrame();
            }
        }

        /* @method setFrame
         * @public
         *
         * Sets the current frame index, wrapping at the lower and upper boundaries
         *
         * @param {Integer} targetFrame desired frame index
         */
      , setFrame = function(targetFrame) {
                lastAnimated = game.getTicks();
                frame = targetFrame;
                if (frame < 0) frame = 0;
                if (frame >= frames.length-1) frame = frames.length-1;
        }

        /* @method defaultFrame
         * @public
         *
         * Resets the sprite to the starting/default frame
         */
      , defaultFrame = function() {
            setFrame(defFrame);
        }

        /* @method nextFrame
         * @public
         *
         * Advances the Sprite frame index, wrapping to 0 at the upper bound
         */
      , nextFrame = function() {
                lastAnimated = game.getTicks();
                if (++frame >= frames.length-1) frame = frames.length-1;
        }

        /* @method prevFrame
         * @public
         *
         * Reduces the Sprite frame index, does not wrap to the upper bound
         */
      , prevFrame = function() {
                lastAnimated = game.getTicks();
                if (--frame < 0) frame = 0;
        }

        /* @method moveLeft
         * @public
         *
         * Move the sprite to the left by !speed! pixels
         */
      , moveLeft = function() {
            x -= speed;
            if (x < 0) x = 0;
        }

        /* @method moveRight
         * @public
         *
         * Move the sprite to the left by !speed! pixels
         */
      , moveRight = function() {
            x += speed;
            if (x > 639) x = 639;
        }

        /* @method
         * @public
         *
         * Move the sprite up by !speed! pixels
         */
      , moveForward = function() {
            y -= speed;
            if (y < 0) y = 0;
        }

        /* @method
         * @public
         *
         * Move the sprite down by !speed! pixels
         */
      , moveBack = function() {
            y += speed;
            if (y > 480) y = 480;
        }

        /* @method fire
         * @public
         *
         * Fire a secondary sprite (not implemented)
         */
      , fire = function() {
            logger('FIRE!');
        }

        /* @method setScore
         * @public
         *
         * Temporary spot to assign the player's score
         *
         * Should be deprecated in favor of a Player() object
         *
         * @param {Integer} v score to assign
         */
      , setScore = function(v) {
            score = v;
        }

        /* @method incScore
         * @public
         *
         * Temporary spot to increment the player's score
         *
         * Should be deprecated in favor of a Player() object
         *
         * @param {Integer} v value to add to the score
         */
      , incScore = function(v) {
            score += v;
        }

        /* @method setValue
         * @public
         *
         * Set the score-value for destroying this sprite
         *
         * @param {Integer} v score-value
         */
      , setValue = function(v) {
            value = v;
        }

        /* @method incValue
         * @public
         *
         * Increase (or decrease) the score-value for destroying this sprite
         *
         * @param {Integer} v score-value (use a negative number to decrease the score-value)
         */
      , incValue = function(v) {
            value += v;
        }

        /* @method getInfo
         * @public
         *
         * Get information about this sprite
         *
         * @returns {Object} an object representing key properties of this sprite
         */
      , getInfo = function() {
            return {
                name: name
              , animate: animate
              , frame: frame
              , speed: speed
              , rotation: rotation
              , score: score
              , value: value
              , x: x
              , y: y
              , dx: dx
              , dy: dy
              , w: frames[frame].srcw
              , h: frames[frame].srch
            };
        }

        /* @method setSpeed
         * @public
         *
         * Sets the speed multiplier.
         *
         * @param {Integer} value the speed multiplier to set
         */
      , setSpeed = function (value) {
      		speed = parseInt(value);
        }

        /* @method setRotation
         * @public
         *
         * Sets the rotation angle of the sprite !(rotations not yet implemented)!
         *
         * @param {Float} value new angle (in degrees)
         */
      , setRotation = function (value) {
      		rotation = parseInt(value);
        }

        /* @method setAnimate
         * @public
         *
         * Turn sprite animation on or off
         *
         * @param {Boolean} value set true to animate through the sprites' frames[] array
         */
      , setAnimate = function (value) {
      		animate = value;
        }
    ;

    // Public API
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
