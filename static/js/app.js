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
    // center game screen & slider
    var canvasEl = $('#game-screen')
        sliderEl = $('#game-slider')
        w = window.innerWidth
        x = (w/2)-320
        y = 0
    ;

    if (x < 0) x = 0;

    canvasEl.style.top = y+'px';
    canvasEl.style.left = x+'px';
    sliderEl.style.top = y+480+'px';
    sliderEl.style.left = x+10+'px';

    // Tool panel tab controller
    window.tltabs = {
        tab: function(targetTab) {
            var tabs = $$('.tab2');

            [].forEach.call(tabs, function(t) {
                t.style.display = (t.id == targetTab) ? 'block' : 'none';
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
                function() { var el = $('#level-music'), el2 = $('#level-music-fake'); el.value = arguments[1]; el2.value = arguments[1].split('/').slice(-1)[0];  el.onchange = function() { el2.value = this.value.split('/').slice(-1)[0]; pubsub.publish('set/level/music', this.value); }; }
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

    // Export
    $('#export').addEventListener('click', function() {
        var data = game.getGameData()
          , exportOutEl = $('#export-out')
        ;

        exportOutEl.value = JSON.stringify(data);
        exportOutEl.style.visibility = 'visible';
    });

    // Engine startup
    window.game = new GameEngine();

    game.loadGame('game.json', function(gameData) {
        /* copy sprites to toolbox */
        var toolboxSetup = function() {
            var numSprites = game.sprites.queue.length;

            if (numSprites < 1) {
                setTimeout(toolboxSetup, 500);

            } else {
                var selPrefix = "img[alt='tool "
                  , selPostfix = "']"
                  , boxes = $$('img[alt]')
                ;

                [].forEach.call(boxes, function(box) {
                    box.style.visibility = 'hidden';
                });

                for (var i=0; i<numSprites; i++) {
                    var sel = selPrefix + i + selPostfix;
                    $(sel).src = game.sprites.queue[i].getDataURL()
                    $(sel).style.visibility = 'visible';

                    // setup drag operations
                    $(sel).addEventListener('dragstart', function(evt) {
                        evt.dataTransfer.effectAllowed = 'move';
                        this.style.opacity = 0.5;

                        // set the drag image (toolbutton scaled to 64x64, use source sprite image data)
                        var spriteIndex = this.alt.replace(/^tool /, '')
                          , dragIcon = document.createElement('img')
                        ;

                        dragIcon.src = game.sprites.queue[spriteIndex].getDataURL();
                        evt.dataTransfer.setDragImage(dragIcon, 0, 0);

                        // set transfer data - not used
                        var evtData = 'dragData';
                        evt.dataTransfer.setData('text/plain', evtData);
                    }, false);

                    $(sel).addEventListener('dragend', function(evt) {
                        var screenX1 = parseInt(window.getComputedStyle($('#game-screen')).left)
                          , screenY1 = parseInt(window.getComputedStyle($('#game-screen')).top)
                          , screenX2 = screenX1+640
                          , screenY2 = screenY1+480
                          , x = evt.pageX
                          , y = evt.pageY
                        ;

                        if (x > screenX1 && x < screenX2) {
                            if (y > screenY1 && y < screenY2) {
                                var spriteId = this.alt.replace(/^tool /, '');
                                // pass in x,y and use y to work out the actual tick and x values (y == time)
                                game.addWaveToLevel(spriteId, x-screenX1, y-screenY1);
                            }
                        }

                        this.style.opacity = 1.0;

                    }, false);

                    $('#game-screen').addEventListener('drop', function(evt) {
                        console.log('drop');
                    }, false);
                }
            }

        };

        setTimeout(toolboxSetup, 2000);

        /* attach player inputs */
        window.addEventListener('keydown', function(evt) {
            game.playerEventStart(evt);
        });

        window.addEventListener('keyup', function(evt) {
            game.playerEventStop(evt);
        });
    });
});
