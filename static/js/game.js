/* game.js
 *
 * game engine
 */
function GameEngine(opts) {
    opts = opts || {};

    var ticks = 0
      , tickDirection = +1
      , isTicking = false
      , screen = {
            width: 640
          , height: 480
        }
      , ctx // canvas context
      , stars = []
      , gameData = {}
      , level = 0
      , audio = new AudioEngine()

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

      , checkTicking = function() {
            return isTicking;
        }

      , getTicks = function() {
            return ticks;
        }

      , setTickDirection = function() {
            if (tickDirection > 0)
                tickDirection = -1
            else
                tickDirection = 1
            ;

            return tickDirection
        }

      , update = function() {
            if (isTicking) requestAnimationFrame(update);

            ticks += 1 * tickDirection;
            if (ticks < 0) { tickDirection = 1; stopTicking(); }
            pubsub.publish('engine/ticks', ticks);

            clearScreen();

            // handle backgrounds
            if (gameData && gameData.levels) {
                switch(gameData.levels[0].backgroundType) {
                    case 'stars':
                        drawStars();
                        break;

                    default:
                        // none
                }
            }

            // FIXME: engine state
            drawTitles();
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
                if (tickDirection > 0) {
                    if (ticks - stars[i].lastTick > stars[i].speed) {
                        stars[i].lastTick = ticks;
                        stars[i].y++;
                        if (stars[i].y > screen.height) stars[i].y = 0;
                    }


                } else { // reverse time
                    if (Math.abs(ticks - stars[i].lastTick) > stars[i].speed) {
                        stars[i].lastTick = ticks;
                        stars[i].y--;
                        if (stars[i].y <= 0) stars[i].y = screen.height-1;
                    }
                }

                ctx.fillText('.', stars[i].x, stars[i].y);
            }
        }

        // FIXME: engine state
      , drawTitles = function() {
            if (! (gameData && gameData.levels)) return;

            var centeredX = parseInt(screen.width/2)
              , centeredY = parseInt(screen.height/2)
              , titleY    = parseInt(screen.height/4)
              , subtitleY = centeredY
            ;

            ctx.textAlign = 'center';
            ctx.font = '64px Ariel, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,1.0)';
            ctx.fillText(gameData.levels[level].title, centeredX, titleY);

            ctx.font = '32px Ariel, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,1.0)';

//            if (engine.state == 'mainmenu') {
//            } else {
            ctx.fillText(gameData.levels[level].description, centeredX, subtitleY);
//            }
        }

        // FIXME: error handling
      , loadGame = function(url, cb) {
            var xhr = new XMLHttpRequest();

            xhr.open('GET', url, true);
            xhr.responseType = 'text';

            xhr.onload = function() {
                gameData = JSON.parse(xhr.responseText);
                level = 0;

                var musicName = 'level-' + level + '-music';
                audio.loadMusic(musicName, gameData.levels[level].music, function() {
                    logger('loaded music', musicName);
                    $('#'+musicName).play();
                });

                //publish game settings for panel
                pubsub.publish('game/title',        gameData.title);
                pubsub.publish('game/subtitle',     gameData.subtitle);
                pubsub.publish('level/title',       gameData.levels[level].title);
                pubsub.publish('level/description', gameData.levels[level].description);
                pubsub.publish('level/music',       gameData.levels[level].music);

                if (cb && typeof(cb) == 'function') cb(gameData);
            };

            xhr.send();
        }

      , getGameData = function() { return gameData; }

      , nextLevel = function() {
            if (gameData && gameData.levels) {
                stopTicking();
                if (++level == gameData.levels.length) level = 0;

                // stop all audio
                var tracks = $$('.music');
                [].forEach.call(tracks, function(track) { track.currentTime=0; track.pause(); });

                var musicName = 'level-' + level + '-music';
                var audioEl = $('#'+musicName);
                if (audioEl) {
                    audioEl.play();
                    startTicking();

                } else {
                    audio.loadMusic(musicName, gameData.levels[level].music, function() {
                        logger('loaded music', musicName);
                        $('#'+musicName).play();
                        startTicking();
                    });
                }

                // publish engine & level updates
                pubsub.publish('engine/level', (level+1));
                pubsub.publish('level/title',       gameData.levels[level].title);
                pubsub.publish('level/description', gameData.levels[level].description);
                pubsub.publish('level/music',       gameData.levels[level].music);
            }
        }

     , getLevelData = function() { return gameData.levels[level]; }
    ;

    // Constructor
    for (var i=0; i<50; i++) {
        stars.push({
            x: Math.floor(Math.random() * screen.width)
          , y: Math.floor(Math.random() * screen.height)
          , speed: Math.floor(Math.random() * 3) + 1
          , lastTick: ticks
        });
    }

    if (getCtx())
        startTicking()
    else
        logger('failed to get context')
    ;

    // publish initial engine settings for panel
    pubsub.publish('engine/ticks', ticks);
    pubsub.publish('engine/level', (level+1));

    // subscribe to changes from panel
    pubsub.subscribe('set/game/title', function(topic, v) { gameData.title = v; }); 
    pubsub.subscribe('set/game/subtitle', function(topic, v) { gameData.subtitle = v; }); 

    pubsub.subscribe('set/level/title', function(topic, v) { gameData.levels[level].title = v; }); 
    pubsub.subscribe('set/level/description', function(topic, v) { gameData.levels[level].description = v; }); 
    pubsub.subscribe('set/level/music', function(topic, v) { gameData.levels[level].music = v; }); 

    // public api
    return {
        update: update
      , getCtx: getCtx
      , getTicks: getTicks
      , startTicking: startTicking
      , stopTicking: stopTicking
      , checkTicking: checkTicking
      , setTickDirection: setTickDirection
      , loadGame: loadGame
      , getGameData: getGameData
      , nextLevel: nextLevel
      , getLevelData: getLevelData
      , audio: audio
    };
}
