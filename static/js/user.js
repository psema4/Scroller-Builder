/* *user.js*
 *
 * class for managing the logged-in user
*/

function User (opts) {
	opts = opts || {};

	var authenticate = function (callback) {
			console.log('Authenticate', opts.username, opts.password);
			callback(null);
		}
	  , load = function (callback) {
	  		
 		}

	return {
		authenticate: authenticate,
		load: load
	};
}
