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
            if (isTicking) return;
            isTicking = true;
            update();
        }

      , stopTicking = function() {
            isTicking = false;
            window.webkitCancelAnimationFrame(prevFrame);
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

        // FIXME: error handling
      , loadGame = function(url, cb) {
            var xhr = new XMLHttpRequest();

            xhr.open('GET', url, true);
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

      , getGameData = function() { return gameData; }

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

      , getLevelData = function() { return gameData.levels[level]; }
      , getLevel = function() { return level; }

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

      , getEngineState = function() { return engine; }

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

        // objects
      , audio: audio
      , sprites: sprites // SpriteManager
      , config: config
    };
}
