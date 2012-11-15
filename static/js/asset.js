/* *asset.js*
*/

/* @function
 *
 * Consume an event
 *
 * @param {Event} e Event to consume 
 *
 */
function noopHandler (e) {
	e.preventDefault();
}

/* @constructor
 *
 * Represts a file using the File API
 *
 * Options:
 * - name
 * - url
 * - local
 *
 * @param {Object} opt Options
 */
function File (opt) {
	opt || (opt = {});
	this.name = opt.name;
	this.url = opt.url;
	this.local = opt.local;
}
/* @constructor
 *
 * Creates a FileDialog for File()'s
 *
 * @param {?} type Add description here
 * @returns FileDialog A file dialog
 */
function FileDialog (type) {
	var files = []
	  , callback = null
	  , popin = document.createElement('div')
	  , open = function (x, y, cb) {
	  		popin.style.left = x + 'px';
	  		popin.style.top = y + 'px';
	  		popin.className = 'pop-in shown';
	  		callback = function (file) {
				callback = null;
				cb(file);
			};
		}
	  , close = function (x, y) {
	  		popin.className = 'pop-in';
		}
	  , add = function (file) {
	  		var li = document.createElement('li');
			li.innerHTML = file.name;
			popin.lastChild.insertBefore(li, popin.lastChild.lastChild);
	  		li.dataset.id = files.push(file) - 1;
	    }

	popin.className = 'pop-in';
	popin.innerHTML = '<ul class="list"><li class="add" style=display:none>Drag a file to upload</li></ul>';

	document.body.appendChild(popin);

	popin.addEventListener("dragenter", noopHandler, false);
		popin.addEventListener("dragexit", noopHandler, false);
		popin.addEventListener("dragover", noopHandler, false);
		popin.addEventListener('drop', function (e) {
		e.preventDefault();
		var files = e.dataTransfer.files;
		if (files.length > 0) {
			[].forEach.call(files, function (file) {
				var reader = new FileReader();
				 
				reader.onload = function (evt) {
					var file;
					add(file = new File({name: file.name, url: evt.target.result, local: true}));
					if (callback) callback(file);
				};

				reader.readAsDataURL(file);
			});
		}
	}, false);
	window.files_ = files;

	popin.onclick = function (e) {
		if (e.target.dataset.id && callback) {
			callback(files[e.target.dataset.id]);
		}
	};

	return {
		open: open
	  , close: close
	  , add: add
	};
}
