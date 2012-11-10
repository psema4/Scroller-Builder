/* game.js
 *
 * game engine
 */
function GameEngine(opts) {
    opts = opts || {};

    var ticks
      , ctx // canvas context
      , logger = function() { console.log('GameEngine', arguments); }
      , update = function() { logger('update'); }
    ;

    return {
        update: update
    };
}
