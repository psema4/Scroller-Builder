/* game.js
 *
 * game engine
 */
function GameEngine(opts) {
    opts = opts || {};

    var ticks = 0
      , isTicking = false
      , screen = {
            width: 640
          , height: 480
        }
      , ctx // canvas context
      , stars = []

      , $ = function(sel) { return document.querySelector(sel); }
      , $$ = function(sel) { return document.querySelectorAll(sel); }

      , logger = function() { console.log('GameEngine', arguments); }

      , getCtx = function() {
            // if we have a 2d context, return it
            if (ctx && typeof(ctx.fillStyle) != 'undefined') return ctx;

            // otherwise try and get it
            var el = $('#game-screen');

            if (el && typeof(el.getContext) != "undefined")
                    ctx = el.getContext('2d')
                else
                    logger('game screen not found')
            ;

            el.width = screen.width;
            el.height = screen.height;

            return ctx;
        }

      , startTicking = function() {
            isTicking = true;
            update();
        }

      , stopTicking = function() {
            isTicking = false;
        }

      , getTicks = function() {
            return ticks;
        }

      , update = function() {
            if (isTicking) requestAnimationFrame(update);
            ticks++;

            clearScreen();
            drawStars();
        }

      , clearScreen = function() {
            var el = $('#game-screen');

            if (el && typeof(el.getContext) != "undefined")
                    el.width = screen.width;
                else
                    logger('game screen not found while trying to clear it :(')
            ;
        }

      , drawStars = function() {
            ctx.font = '24px Ariel, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,1.0)';

            for (var i=0; i < stars.length; i++) {
                if (ticks - stars[i].lastTick > stars[i].speed) {
                    stars[i].lastTick = ticks;
                    stars[i].y++;
                    if (stars[i].y > screen.height) {
                        stars[i].y = 0;
                    }
                }

                ctx.fillText('.', stars[i].x, stars[i].y);
            }
        }
    ;

    for (var i=0; i<50; i++) {
        stars.push({
            x: Math.floor(Math.random() * screen.width)
          , y: Math.floor(Math.random() * screen.height)
          , speed: Math.floor(Math.random() * 3) + 1
          , lastTick: ticks
        });
    }

    if (getCtx()) // start ticking
        startTicking()
    else
        logger('failed to get context')
    ;

    return {
        update: update
      , getCtx: getCtx
      , getTicks: getTicks
      , startTicking: startTicking
      , stopTicking: stopTicking
    };
}
