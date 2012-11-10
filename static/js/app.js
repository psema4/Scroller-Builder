/* app.js
 *
 * app init and globals
 */

if (typeof(window.console) == 'undefined') {
    window.console = {
        log:   function() {}
      , warn:  function() {}
      , error: function() {}
      , dir:   function() {}
    }
}

window.addEventListener('load', function() {
    console.log('app init');

    window.game = new GameEngine();
});
