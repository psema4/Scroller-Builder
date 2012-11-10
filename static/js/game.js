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
            drawSomething();
        }

      , clearScreen = function() {
            var el = $('#game-screen');

            if (el && typeof(el.getContext) != "undefined")
                    el.width = screen.width;
                else
                    logger('game screen not found while trying to clear it :(')
            ;
        }

      , drawSomething = function() {
            ctx.fillStyle = 'rgba(255,0,0,1.0)';
            ctx.fillRect(0,0,100,100);
        }
    ;

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
