/* game.js
 *
 * game engine
 */
function GameEngine(opts) {
    opts = opts || {};

    var ticks
      , screen = {
            width: 640
          , height: 480
        }
      , ctx // canvas context
      , logger = function() { console.log('GameEngine', arguments); }
      , getCtx = function() {
            if (ctx && typeof(ctx.fillStyle) != 'undefined') return ctx;

            var el = document.querySelector('#game-screen');
            if (el && typeof(el.getContext) != "undefined")
                    ctx = el.getContext('2d')
                else
                    logger('game screen not found')
            ;

            el.width = screen.width;
            el.height = screen.height;

            return ctx;
        }
      , update = function() { logger('update'); }
    ;

    if (! getCtx()) logger('failed to get context');

    return {
        update: update
      , getCtx: getCtx
    };
}
