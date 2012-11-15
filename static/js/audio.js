/* *audio.js*
*/

/* Creates an AudioEngine
 * @constructor
 *
 * @param {Object} opts AudioEngine options
 * @returns {Object} an AudioEngine object
 */

function AudioEngine(opts) {
    opts = opts || {};

    var ctx // webkitAudioContext
            // NOTE: investigate, used <audio> el's for the contest because Firefox still
            //       using deprecated Audio API, not same as Chrome's

        /* @method logger
         * @private
         * @param {Mixed} arguments One or more items to log to the js console
         */
      , logger = function() {
            console.log('AudioEngine', arguments);
        }

        /* @method loadMusic
         * @public
         *
         * Loads a music file.  Use the audio element API for playing, volume, etc
         *
         * @param {String} id DOM ID to assign after creating an audio element
         * @param {String} url MP3 source URL
         * @param {Function} cb Function to execute after successful load 
         */
      , loadMusic = function(id, url, cb) {
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
    ;

    return {
        loadMusic: loadMusic
    };
}
