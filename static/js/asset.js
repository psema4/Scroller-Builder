function noopHandler (e) {
	e.preventDefault();
}

function File (opt) {
	opt || (opt = {});
	this.name = opt.name;
	this.url = opt.url;
	this.local = opt.local;
}

function FileDialog (type) {
	var files = []
	  , popin = document.createElement('div')
	  , open = function (x, y) {
	  		popin.style.left = x + 'px';
	  		popin.style.top = y + 'px';
	  		popin.className = 'pop-in shown';
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
	popin.innerHTML = '<ul class="list"><li class="add">Drag a file to upload</li></ul>';

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
					add(new File({name: file.name, url: evt.target.result, local: true}));
				};

				reader.readAsDataURL(file);
			});
		}
	}, false);
	window.files_ = files;

	return {
		open: open
	  , close: close
	  , add: add
	};
}