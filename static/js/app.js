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

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

window.addEventListener('load', function() {

    // Tool panel tab controller
    window.tltabs = {
        tab: function(targetTab) {
            var tabs = $$('.tab2');

            [].forEach.call(tabs, function(t) {
                t.style.visibility = (t.id == targetTab) ? 'visible' : 'hidden';
            });
        }
    };

    tltabs.tab('tab-tools1');

    // Settings panel tab controller
    window.sptabs = {
        tab: function(targetTab) {
            var tabs = $$('.tab');

            [].forEach.call(tabs, function(t) {
                t.style.visibility = (t.id == targetTab) ? 'visible' : 'hidden';
            });
        }
    };

    sptabs.tab('tab-engine-settings');

    // Settings panel subscriptions
    var subscriptions = []
      , handlers = {
            'engine/ticks':
                function() { var el = $('#engine-ticks'); el.value = arguments[1]; }
          , 'engine/level':
                function() { var el = $('#engine-level'); el.value = arguments[1]; el.onchange = function() { pubsub.publish('set/engine/level', this.value); }; }
          , 'game/title':
                function() { var el = $('#game-title'); el.value = arguments[1]; el.onchange = function() { pubsub.publish('set/game/title', this.value); }; }
          , 'game/subtitle':
                function() { var el = $('#game-subtitle'); el.value = arguments[1]; el.onchange = function() { pubsub.publish('set/game/subtitle', this.value); }; }
          , 'level/titleDelay':
                function() { var el = $('#level-titleDelay'); el.value = arguments[1]; el.onchange = function() { pubsub.publish('set/level/titleDelay', this.value); }; }
          , 'level/title':
                function() { var el = $('#level-title'); el.value = arguments[1]; el.onchange = function() { pubsub.publish('set/level/title', this.value); }; }
          , 'level/description':
                function() { var el = $('#level-description'); el.value = arguments[1]; el.onchange = function() { pubsub.publish('set/level/description', this.value); }; }
          , 'level/music':
                function() { var el = $('#level-music'); el.value = arguments[1]; el.onchange = function() { pubsub.publish('set/level/music', this.value); }; }
          , 'level/backgroundType':
                function() { var el = $('#level-backgroundType'); el.value = arguments[1]; el.onchange = function() { pubsub.publish('set/level/backgroundType', this.value); }; }
          , 'level/progressionType':
                function() { var el = $('#level-progressionType'); el.value = arguments[1]; el.onchange = function() { pubsub.publish('set/level/progressionType', this.value); }; }
          , 'level/progressionValue':
                function() { var el = $('#level-progressionValue'); el.value = arguments[1]; el.onchange = function() { pubsub.publish('set/level/progressionValue', this.value); }; }
        }
      , settingsInputs = $$('.setting')
    ;

    [].forEach.call(settingsInputs, function(setting) {
        var topic = setting.id.replace(/-/g, '/');
        subscriptions.push(pubsub.subscribe(topic, handlers[topic]));
    });

    // Engine startup
    window.game = new GameEngine();

    game.loadGame('game.json', function(gameData) {
        /* attach player inputs */
        window.addEventListener('keydown', function(evt) {
            game.playerEventStart(evt);
        });

        window.addEventListener('keyup', function(evt) {
            game.playerEventStop(evt);
        });
    });
});
