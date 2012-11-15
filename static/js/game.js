/* *game.js*
*/

/* @constructor
 *
 * Creates a GameEngine
 *
 * Options:
 * - TBD
 *
 * Exports:
 * - AudioEngine as !.audio!
 * - SpriteManager as !.sprites!
 *
 * @param {Object} opts GameEngine options
 * @returns {Object} a GameEngine object
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
      , config = opts.config || { resumeOnDrop: false }
      , ctx // canvas context
      , stars = []
      , gameData = {}
      , level = 0
      , audio = new AudioEngine()
      , sprites = new SpriteManager()
      , prevFrame

      , engine = {
            state: 'loading'
        }

        /* @method logger
         * @private
         * @param {Mixed} arguments One or more items to log to the js console
         */
      , logger = function() {
            console.log('GameEngine', arguments);
        }

        /* @method getCtx
         * @public
         *
         * Provides direct access to the game's canvas
         *
         * @returns {Object} Graphics context for #game-screen canvas
         */
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

        /* @method startTicking
         * @public
         *
         * Starts the engine clock
         *
         */
      , startTicking = function() {
            if (isTicking) return;
            isTicking = true;
            update();
        }

        /* @method stopTicking
         * @public
         *
         * Stops the engine clock
         *
         */
      , stopTicking = function() {
            isTicking = false;
            window.webkitCancelAnimationFrame(prevFrame);
        }

        /* @method checkTicking
         * @public
         *
         * Determine if the engine clock is running or not
         *
         * @returns {Boolean} True if clock is running
         */
      , checkTicking = function() {
            return isTicking;
        }

        /* @method getTicks
         * @public
         *
         * Gets the engine clock's current tick
         *
         */
      , getTicks = function() {
            return ticks;
        }

        /* @method setTickDirection
         * @public
         *
         * Toggles direction of engine clock
         *
         * @returns {Integer} 1 for normal time, -1 for reverse time
         */
      , setTickDirection = function() {
            if (tickDirection > 0)
                tickDirection = -1
            else
                tickDirection = 1
            ;

            return tickDirection
        }

        /* @method update
         * @public
         *
         * Updates the game screen and increases the engine tick value by one.
         *
         * If the document is not visible (Page Visibility API), updates will not occur and the engine is effectively paused
         */
      , update = function() {
            var hidden = prefixNormalizer('hidden', document);
            if (hidden && (document[hidden])) return; // document is not active (see also http://www.html5rocks.com/en/tutorials/pagevisibility/intro/)

            if (isTicking) prevFrame = requestAnimationFrame(update);

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

            if (engine.state == 'level-title') {
                if (! gameData && gameData.levels) return;

                if (ticks - engine.levelStartTicks > gameData.levels[level].titleDelay) {
                    engine.state = 'level-playing';
                } else {
                    drawTitles();
                }
            }

            if (engine.state == 'level-playing') {
                // spawn waves
                var waves = gameData.levels[level].waves
                  , levelData = gameData.levels[level]
                ;

                for (var i=0; i<waves.length; i++) {
                    if (ticks == engine.levelStartTicks + waves[i].at) {
                        //FIXME: spawn here
                        var spritesheetName = 'level-'+ level +'-sprites'
                          , spriteName = waves[i].sprite
                          , sprite = sprites.addSprite(spritesheetName, levelData.sprites[spriteName])
                          , x = waves[i].x || Math.floor(Math.random() * 640) - sprite.getInfo().w;
                        ;

                        sprite.moveTo(x,0);
                    }
                }

                sprites.drawSprites(ctx);
            }

            if (gameData && gameData.levels && gameData.levels[level]) {
                if (gameData.levels[level].progressionType == 'ticks') {
                    var levelLengthTicks = gameData.levels[level].progressionValue
                      , endOfLevelTicks  = engine.levelStartTicks + levelLengthTicks
                    ;

                    if (ticks >= endOfLevelTicks) nextLevel();

                } else if (gameData.levels[level].progressionType == 'score') {
//FIXME
// getInfo failing below after a few loops through both test levels (nextLevel() issue?)
// ALSO: executing nextLevel() 5 times, spritesheet will appear... um... why?
try {
                    var targetScore  = gameData.levels[level].progressionValue
                      , spriteData   = sprites.queue[0].getInfo()
                      , currentScore = spriteData.score
                    ;

                    if (currentScore >= targetScore) nextLevel();
} catch(e) {}
                }
            }

            drawHud();
        }

        /* @method drawHud
         * @public
         *
         * Draws game information (eg. Lives, Score) to the game screen
         */
      , drawHud = function() {
            if (engine.state != 'level-playing')   return;
            if (! (gameData && gameData.levels)) return;

            var centeredX = parseInt(screen.width/2)
              , centeredY = parseInt(screen.height/2)
              , scoreX    = 10
              , scoreY    = 24
              , livesX    = screen.width - 90
              , livesY    = 24
            ;

            ctx.textAlign = 'left';
            ctx.font = '24px Ariel, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,1.0)';
            ctx.fillText('Score: ' + sprites.queue[0].getInfo().score, scoreX, scoreY);
            ctx.fillText('Lives: ' + gameData.playerStartData.lives, livesX, livesY);

        }

        /* @method clearScreen
         * @public
         *
         * Clears the game screen
         */
      , clearScreen = function() {
            var el = $('#game-screen');

            if (el && typeof(el.getContext) != "undefined")
                    el.width = screen.width;
                else
                    logger('game screen not found while trying to clear it :(')
            ;
        }

        /* @method drawStars
         * @public
         *
         * Draws a collection of stars to the game screen, for simple space-like backgrounds
         */
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

        /* @method drawTitles
         * @public
         *
         * Draws the level title & description to the game screen
         */
      , drawTitles = function() {
            if (engine.state != 'level-title')   return;
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

            ctx.fillText(gameData.levels[level].description, centeredX, subtitleY);
        }

        /* @method loadGame
         * @public
         * 
         * Loads a game configuration file (json) via an AJAX call
         * 
         * @param {String} gameFilename The filename of the game to be loaded
         * @param {Function} cb The function to execute after a successful load
         */

        // FIXME: error handling
      , loadGame = function(gameFilename, cb) {
            if (checkTicking()) stopTicking();
            ticks = 0;

            if (sprites.queue && sprites.queue.length > 0) {
                // not very graceful
                sprites.removeAll();
                $('#sprite-container').innerHTML = '';
                $('#audio-container').innerHTML = '';
            }

            var xhr = new XMLHttpRequest();

            xhr.open('GET', '/load/'+gameFilename, true);
            xhr.responseType = 'text';

            xhr.onload = function() {
                gameData = JSON.parse(xhr.responseText);
                level = 0;

                var namePrefix = 'level-' + level
                  , spritesheetName = namePrefix + '-sprites'
                  , musicName = namePrefix + '-music'
                ;

                sprites.loadSpritesheet(spritesheetName, gameData.levels[level].spritesheet, function() {
                    var playerSpriteData     = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.player)
                      , playerFireSpriteData = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.playerFire)
                      , playerHitSpriteData  = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.playerHit)
                      , playerLifeSpriteData = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.playerLife)

                      , enemy1SpriteData     = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.enemy1)
                      , enemy2SpriteData     = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.enemy2)
                      , enemyFireSpriteData  = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.enemyFire)
                      , enemyHitSpriteData   = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.enemyHit)

                      , obstacle1SpriteData  = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.obstacle1)
                      , obstacle2SpriteData  = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.obstacle2)
                    ;

                    audio.loadMusic(musicName, gameData.levels[level].music, function() {
                        $('#'+musicName).play();
                        engine.state = 'level-title';
                        engine.levelStartTicks = ticks;

                        startTicking(); // everything's loaded for this level, play!
                    });
                });

                //publish game settings for panel
                pubsub.publish('game/title',                   gameData.title);
                pubsub.publish('game/subtitle',                gameData.subtitle);
                pubsub.publish('level/titleDelay',             gameData.levels[level].titleDelay);
                pubsub.publish('level/title',                  gameData.levels[level].title);
                pubsub.publish('level/description',            gameData.levels[level].description);
                pubsub.publish('level/music',                  gameData.levels[level].music);
                pubsub.publish('level/backgroundType',         gameData.levels[level].backgroundType);
                pubsub.publish('level/progressionType',        gameData.levels[level].progressionType);
                pubsub.publish('level/progressionValue',       gameData.levels[level].progressionValue);

                engine.state = 'loaded';
                if (cb && typeof(cb) == 'function') cb(gameData);
            };

            xhr.send();
        }

        /* @method getGameData
         * @public
         *
         * Get a copy of the currently running game specification (the json file, possibly modified)
         *
         * @returns {Object} The game
         */
      , getGameData = function() {
            return gameData;
        }

        /* @method nextLevel
         * @public
         *
         * Instructs the game engine to proceed to the next level in the game
         */
      , nextLevel = function() {
            if (gameData && gameData.levels) {
                stopTicking();
                if (++level == gameData.levels.length) level = 0;
                engine.state = 'level-title';
                engine.levelStartTicks = ticks;

                // stop all audio
                var tracks = $$('.music');
                [].forEach.call(tracks, function(track) { track.currentTime=0; track.pause(); });

                var namePrefix = musicName = 'level-' + level
                  , musicName = namePrefix + '-music'
                  , spritesheetName = namePrefix + '-sprites'
                  , audioEl = $('#'+musicName)
                ;

                var oldPlayerSprite = sprites.queue[0]; // keep a copy of the old player so we can grab the current score

                sprites.removeAll();
                sprites.loadSpritesheet(spritesheetName, gameData.levels[level].spritesheet, function() {
                    var playerSpriteData     = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.player)
                      , playerFireSpriteData = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.playerFire)
                      , playerHitSpriteData  = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.playerHit)
                      , playerLifeSpriteData = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.playerLife)

                      , enemy1SpriteData     = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.enemy1)
                      , enemy2SpriteData     = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.enemy2)
                      , enemyFireSpriteData  = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.enemyFire)
                      , enemyHitSpriteData   = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.enemyHit)

                      , obstacle1SpriteData  = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.obstacle1)
                      , obstacle2SpriteData  = sprites.addSprite(spritesheetName, gameData.levels[level].sprites.obstacle2)
                    ;

                    sprites.queue[0].setScore(oldPlayerSprite.getInfo().score); // carry the current score forward
                });

                if (audioEl) {
                    audioEl.play();
                    startTicking();

                } else {
                    audio.loadMusic(musicName, gameData.levels[level].music, function() {
                        $('#'+musicName).play();
                        startTicking();
                    });
                }

                // publish engine & level updates
                pubsub.publish('engine/level',                 (level+1));
                pubsub.publish('level/title',                  gameData.levels[level].title);
                pubsub.publish('level/description',            gameData.levels[level].description);
                pubsub.publish('level/music',                  gameData.levels[level].music);
                pubsub.publish('level/backroundType',          gameData.levels[level].backgroundType);
                pubsub.publish('level/progressionType',        gameData.levels[level].progressionType);
                pubsub.publish('level/progressionValue',       gameData.levels[level].progressionValue);
            }
        }

        /* @method getLevelData
         * @public
         *
         * Like getGameData, but only for the currently running level
         *
         * @returns {Object} Description of the current level
         */
      , getLevelData = function() {
            return gameData.levels[level];
        }

        /* @method getLevel
         * @public
         *
         * Gets the current level number
         *
         * @returns {Integer} 0-based index for game.getGameData().levels[]
         */
      , getLevel = function() {
            return level;
        }

        /* @method addWaveToLevel
         * @public
         *
         * Adds new sprite(s) to the currently running level. A "wave" is currently limited to 1 sprite/wave.
         *
         * If the y-coordinate is non-zero, it used as a time offset: based on the dx & dy variables of a sprite specification, the engine can calculate what tick
         * a sprite should be created at, as well as what the x-coordinate value would be at that tick.
         *
         * @param {Integer} spriteIndex Sprite specification ID (refers to the 'sprites' entries in a a level definition)
         * @param {Integer} x The horizontal coordinate to create the "wave" at
         * @param {Integer} y the vertical coordinate to create the "wave" at
         * @returns {Object} Description of the current level
         */
      , addWaveToLevel = function(spriteIndex, x, y) {
            var wasTicking = checkTicking()
            if (wasTicking) stopTicking();

            // FIXME: calculations (calcTime, calcX) seem off a bit... almost right
            var time = ticks - engine.levelStartTicks
              , screenYOffset = parseInt(window.getComputedStyle($('#game-container')).top)
              , yOffset = (y - screenYOffset) // cancel out screen's y-offset
              , calcTime = time - yOffset     // figure out tick to generate wave at if y > 0
              , calcX = x || 0                // figure out what x would have been if y == 0
              , levelData = gameData.levels[level]
              , spriteData = sprites.queue[spriteIndex].getInfo()
              , xDelta = (spriteData.dx * spriteData.speed) * yOffset
              , yDelta = (spriteData.dy * spriteData.speed) * yOffset
            ;

            if (calcTime < 0) calcTime = 0;
            calcX -= xDelta;

            var waveData = {
                    sprite: spriteData.name
                  , class: 1
                  , at: calcTime
                  , x: calcX
                  , y: 0
                }
            ;

            //console.log('create waveData', waveData, 'using spriteData', spriteData, ' with spriteSpec', levelData.sprites[spriteData.name]);
            levelData.waves.push(waveData);

            // drop specified sprite at x,y
            var spritesheetName = 'level-'+ level +'-sprites'
              , sprite = sprites.addSprite(spritesheetName, levelData.sprites[spriteData.name])
            ;

            sprite.moveTo(x, yOffset);

            // resume ticking if we were previously
            if (config.resumeOnDrop && wasTicking)
                startTicking()

            // otherwise tick once to update the display
            else 
                update();
        }

        /* @method getEngineState
         * @public
         *
         * Get extended engine state information like what tick number the currently playing level started at (.levelStartTicks)
         *
         * @returns {Object} Engine state
         */
      , getEngineState = function() {
            return engine;
        }

        /* @method playerEventStart
         * @public
         *
         * Execute actions stored in player's sprite data based on keydown events
         *
         * @param {Event} evt Keyboard event
         */
      , playerEventStart = function(evt) {
            var key = evt.keyCode
              , sprite = sprites.queue[0]
              , levelData = gameData.levels[level]

              , leftActions    = levelData.playerActions.left
              , rightActions   = levelData.playerActions.right
              , forwardActions = levelData.playerActions.forward
              , backActions    = levelData.playerActions.back
              , fireActions    = levelData.playerActions.fire
            ;

            switch(key) {
                case 37:
                    // left action
                    for (var i=0; i< leftActions.length; i++) { try { sprite[leftActions[i]]() } catch(e) { logger('leftActions['+i+']', leftActions[i], e); } };
                    break;

                case 39:
                    // right action
                    for (var i=0; i< rightActions.length; i++) { try { sprite[rightActions[i]]() } catch(e) { logger('bad sprite command, rightAction', e); } };
                    break;

                case 38:
                    // up action
                    for (var i=0; i< forwardActions.length; i++) { try { sprite[forwardActions[i]]() } catch(e) { logger('forwardActions['+i+']', forwardActions[i], e); } };
                    break;

                case 40:
                    // down action
                    for (var i=0; i< backActions.length; i++) { try { sprite[backActions[i]]() } catch(e) { logger('backActions['+i+']', backActions[i], e); } };
                    break;

                case 32:
                    // fire action
                    for (var i=0; i< fireActions.length; i++) { try { sprite[fireActions[i]]() } catch(e) { logger('fireActions['+i+']', fireActions[i], e); } };
                    break;

                default:
            }
        }

        /* @method playerEventStop
         * @public
         *
         * Execute actions stored in player's sprite data based on keyup events
         *
         * @param {Event} evt Keyboard event
         */
      , playerEventStop = function(evt) {
            var key = evt.keyCode
              , sprite = sprites.queue[0]
              , levelData = gameData.levels[level]
              , startFrame = levelData.sprites.player.startFrame
              , postActions = levelData.playerPostActions
              , postLeftActions = postActions.left
              , postRightActions = postActions.right
              , postForwardActions = postActions.forward
              , postBackActions = postActions.back
              , postFireActions = postActions.fire
            ;

            switch(key) {
                case 37:
                    // left action end
                    for (var i=0; i< postLeftActions.length; i++) { try { sprite[postLeftActions[i]]() } catch(e) { logger('postLeftActions['+i+']', postLeftActions[i], e); } };
                    break;

                case 39:
                    // right action end
                    for (var i=0; i< postRightActions.length; i++) { try { sprite[postRightActions[i]]() } catch(e) { logger('postRightActions['+i+']', postRightActions[i], e); } };
                    break;

                case 38:
                    // up action end
                    break;

                case 40:
                    // down action end
                    break;

                case 32:
                    // fire action end
                    break;

                default:
            }
            
        }

        /* @method saveGame
         * @public
         * 
         * Saves a game configuration file (json) to the server, via an AJAX call
         */
      , saveGame = function() {
            var data = 'data=' + JSON.stringify(game.getGameData())
              , saveURL = '/save'
            ;

            var xhr = new XMLHttpRequest();
            xhr.open('POST', saveURL, true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.responseType = 'text';

            xhr.onload = function() {
                var result = xhr.responseText;
                if (result != 'ERR') 
                    console.log('saved: ' + result)
                else
                    console.warn('error saving game!')
                ;
            }

            xhr.send(encodeURI(data));
        }

        /* @method fullScreen
         * @public
         *
         * Make the game canvas use the whole screen
         *
         * [red[NOTE:] !Must! be called from a user-initiated event (such as a mouse event, button click, etc)
         */

        //FIXME: #game-screen is currently hardcoded to 640x480 in several places.  Need to clear this up to make best use of fullscreen mode (browser just centers canvas atm)
        //       see http://jlongster.com/2011/11/21/canvas.html for more on fullscreen canvas
      , fullScreen = function() {
            // http://davidwalsh.name/more-html5-apis
            var launchFullScreen = function(el) {
                if (el.requestFullScreen) {
                    el.requestFullScreen();
                } else if (el.mozRequestFullScreen) {
                    el.mozRequestFullScreen();
                } else if (el.webkitRequestFullScreen) {
                    el.webkitRequestFullScreen();
                }
            };

            launchFullScreen($('#game-screen'));
        }

        /* @method cancelFullScreen
         * @public
         *
         * Break out of fullscreen mode
         */
      , cancelFullScreen = function() {
            if(document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
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
    pubsub.subscribe('set/game/title',             function(topic, v) { gameData.title = v; }); 
    pubsub.subscribe('set/game/subtitle',          function(topic, v) { gameData.subtitle = v; }); 
    pubsub.subscribe('set/game/titleDelay',        function(topic, v) { gameData.titleDelay = v; }); 

    pubsub.subscribe('set/level/title',            function(topic, v) { gameData.levels[level].title = v; }); 
    pubsub.subscribe('set/level/description',      function(topic, v) { gameData.levels[level].description = v; }); 
    pubsub.subscribe('set/level/music',            function(topic, v) { gameData.levels[level].music = v; }); 
    pubsub.subscribe('set/level/backgroundType',   function(topic, v) { gameData.levels[level].backgroundType = v; }); 
    pubsub.subscribe('set/level/progressionType',  function(topic, v) { gameData.levels[level].progressionType = v; }); 
    pubsub.subscribe('set/level/progressionValue', function(topic, v) { gameData.levels[level].progressionValue = v; }); 

    // public api
    return {
        // methods
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
      , getLevelData: getLevelData // should just export engine with other objects below
      , getLevel: getLevel
      , getEngineState: getEngineState
      , playerEventStart: playerEventStart
      , playerEventStop: playerEventStop
      , addWaveToLevel: addWaveToLevel
      , saveGame: saveGame
      , fullScreen: fullScreen
      , cancelFullScreen: cancelFullScreen

        // objects
      , audio: audio
      , sprites: sprites // SpriteManager
      , config: config
    };
}
