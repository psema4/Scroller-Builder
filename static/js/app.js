/* app.js
 *
 * app init and globals
 */

// simple polyfills
if (typeof(window.console) == 'undefined') {
    window.console = {
        log:   function() {}
      , warn:  function() {}
      , error: function() {}
      , dir:   function() {}
    }
}

window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || function(callback, element) {
            return window.setTimeout(function() { callback(Date.now()); }, 1000/60);
           }
    ;
})();

function $(sel) { document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

window.addEventListener('load', function() {
    console.log('app init');

    // Settings panel subscriptions
    var subscriptions = []
      , inputHandlers = {
        'engine/ticks': function() {
                            $$('#engine-ticks')[0].value = arguments[1];
                        }
    };

    var settingsInputs = $$('.setting');

    [].forEach.call(settingsInputs, function(setting) {
        var topic = setting.id.replace(/-/g, '/');
        subscriptions.push(pubsub.subscribe(topic, inputHandlers[topic]));
    });

    // Engine startup
    window.game = new GameEngine();

    game.loadGame('game.json', function(gameData) {
        console.log('loaded game file', gameData);
    });
});
