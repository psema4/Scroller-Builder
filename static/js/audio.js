/* audio.js
 *
 * audio engine
 */

function AudioEngine(opts) {
    opts = opts || {};

    var ctx // webkitAudioContext
      , logger = function() { console.log('AudioEngine', arguments); }
    ;

    return {
        loadMusic: function(id, url, cb) {
            var el = document.createElement('audio');
            el.id = id;
            el.className = 'music';
            el.src = url;

            if (cb && typeof(cb) == 'function') {
                // per http://stackoverflow.com/questions/5335064/html5-audio-onload
                var ready = function() {
                    if (el.readyState == 4)
                        cb();
                    else
                        setTimeout(ready, 250)
                    ;
                };

                ready();
            }
            $('#audio-container').appendChild(el);
        }
    };
}
