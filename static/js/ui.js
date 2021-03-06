/* *ui.js*
 *
 * basic dynamic content (will probably later break this into seperate modules if it gets too large)
*/

;
(function () {
 	// Helper functions; rewrite depending on browser support

 	// Add class to element
 	function add (elem, cls) {
 		elem.classList.add(cls);
 	}

 	// Remove class from element
 	function remove (elem, cls) {
 		elem.classList.remove(cls);
 	}

 	// Return if element has class
 	function has (elem, cls) {
 		return elem.classList.contains(cls);
 	}

 	// Bind an event to an element
 	function on (elem, evt, handler) {
 		elem.addEventListener(evt, handler, false);
 	}

 	// Get the left position of an element
 	function left (elem) {
 		var left = elem.offsetLeft;
 		while (elem = elem.offsetParent) {
 			left += elem.offsetLeft;
 		}
 		return left;
 	}

 	// Get the top position of an element
 	function top (elem) {
 		var top = elem.offsetTop;
 		while (elem = elem.offsetParent) {
 			top += elem.offsetTop;
 		}
 		return top;
 	}

 	$('#login_btn').onclick = function () {
 		add($('#login_form'), 'shown');
 		$('#login_form input').focus();
 	};

 	function login () {
 		var user = new User({username: $('#login_form input').value, password: $('#login_form input[type="password"]').value});
 		user.authenticate(function (err) {
 			if (!err) {
 				$('.login').innerHTML = 'Hello, <strong>' + $('#login_form input').value + '</strong>!';
 				remove($('#login_form'), 'shown');
 			}
 			else if (err === 'username')
 			{
 				$('#login_form input').focus();
 			}
 			else
 			{
 				$('#login_form input[type="password"]').focus();
 			}
 		});
 	}

 	$('#login_form').onkeydown = function (e) {
 		if (e.keyCode === 13) {
 			login();
 		}
 	}

 	$('#login_form .btn').onclick = login;

 	document.onclick = function (e) {
 		if (has(e.target, 'close')) {
 			remove(e.target.parentNode, 'shown');
 		}
 	};

 	$('#play_pause_btn').onclick = function () {
 		if (this.paused) {
 			this.innerHTML = '| |';
 			game.startTicking();
 			this.paused = false;
 			$('#level-' + game.getLevel() + '-music').play();

 			[].forEach.call($$('.pop-in'), function (popin) {
 				remove(popin, 'shown');
 			});
 		}
 		else
 		{
 			this.innerHTML = '►';
 			game.stopTicking();
 			this.paused = true;
 			$('#level-' + game.getLevel() + '-music').pause();
 		}
 		tick_slider.setValue(0);
 	};

 	$('#next_lvl_btn').onclick = function () {
 		game.nextLevel();
 		if ($('#play_pause_btn').paused) {
 			$('#play_pause_btn').innerHTML = '| |';
 			$('#play_pause_btn').paused = false;
 		}
 	}

 	function Slider (elem, opt) {
 		opt || (opt = {});

 		var min = opt.min || 0
 		  , max = opt.max || 100
 		  , value = opt.value || (opt.value = 0)
 		  , handle = elem.querySelector('.btn')
 		  , dragging = false
 		  , listener = function () {}
          , setValue = function (val) {
	 			if (val < min) val = min;
	 			if (val > max) val = max;
	 			handle.style.left = (val - min) / (max - min) * (elem.offsetWidth - handle.offsetWidth) - 2 + 'px';
	 			if (value !== val) listener(value = val);
	 		}
	 	  , getValue = function () {
	 	  		return value; 
	 	  	}
	 	  , onChange = function (fn) {
	 	  		listener = fn;
	 	  	}

 		setValue(value)

 		elem.onmousedown = function (e) {
 			if (has(e.target, 'btn')) {
 				dragging = true;
 			}
 			else
 			{
 				setValue((e.pageX - left(elem)) / elem.offsetWidth * (max - min) + min);
 			}
 		}

 		on(document, 'mousemove', function (e) {
 			if (dragging) {
 				setValue((e.pageX - left(elem)) / elem.offsetWidth * (max - min) + min);
 			}
 		})

 		on(document, 'mouseup', function () {
 			dragging = false;
 			if (opt.retain) {
 				setValue(opt.value)
 			}
 		})

 		return {
 			setValue: setValue,
 			getValue: getValue,
 			onChange: onChange
 		};
 	}

 	var tick_slider = new Slider($('#tick_slider'), {min: -1.5, max: 1.5, retain: true}), dir = 1;

 	tick_slider.onChange(function (val) {
 		if (val === 0 && $('#play_pause_btn').paused) game.stopTicking();
 		else if (!game.checkTicking()) game.startTicking();
 		var set = val < 0 ? -1 : 1;
 		if (set !== dir) game.setTickDirection(dir = set);
 	});

 	function open_popin (x, y, html, init) {
 		var popin = document.createElement('div');
 		add(popin, 'pop-in');
 		popin.innerHTML = "<a href='#' class='close'>&times;</a>" + html;
 		document.body.appendChild(popin);
 		popin.style.top = y + 'px';
 		popin.style.left = x + 'px';
 		setTimeout(add, 100, popin, 'shown');
 		if (init) init(popin);
 		return popin;
 	}

 	window.open_popin = open_popin

 	var sprites = new FileDialog('sprite');
 	sprites.add(new File({name: 'spaceArt.png', url: '/assets/img/spaceArt.png', local: false}));

 	// Open popups for editing objects if the game isn't running
 	$('#game-screen').onclick = function (e) {
 		if (game.checkTicking()) return;
 		var left_, top_, x = e.pageX - (left_ = left(this)), y = e.pageY - (top_ = top(this)), queue = game.sprites.queue, i = 0;

 		for (; i < queue.length; i++) {
 			var info = queue[i].getInfo(), right, bottom, elem;
 			if (info.x > x || info.y > y) continue;
 			right = info.x + info.w;
 			bottom = info.y + info.h;
 			if (right < x || bottom < y) continue;

 			if (elem = $('#config-' + i)) {
 				elem.parentNode.removeChild(elem);
 			}
	 		elem = open_popin(left_ + info.x + info.w, top_ + info.y, '\
<strong>Sprite ' + i + '</strong><br>\
Speed: <input data-is="speed" type="number"><br>\
StartX: <input data-is="startx" type="number"><br>\
StartY: <input data-is="starty" type="number"><br>\
Rotate: <input data-is="rotation" type="number"><br>\
Animate: <input data-is="animate" type="checkbox"><br>');
 			elem.id = 'config-' + i;
 			elem.style.width = '250px';
 			[].forEach.call(elem.querySelectorAll('input'), (function (sprite, info) {
 				return function (input) {
 				input.value = info[input.dataset.is]
 				input.onchange = function () {
 					switch (input.dataset.is) {
 						case 'speed':
 							sprite.setSpeed(input.value);
 						break;
 						case 'rotation':
 							sprite.setRotation(input.value);
 						break;
 						case 'animate':
 							sprite.setAnimate(input.value);
 						break;
 						// TODO: SET START POSITIONS
 						case 'startx':
 							
 						break;
 						case 'starty':
 							
 						break;
 					}
 				}
 				}
 			}(queue[i], info)));
	 		break;
 		}
 	}

 	var audio = new FileDialog('audio');
 	audio.add(new File({name: 'level1.mp3', url: '/assets/music/level1.mp3', local: false}));
 	audio.add(new File({name: 'level2.mp3', url: '/assets/music/level2.mp3', local: false}));

 	$('#level-music-fake').onfocus = function () {
 		var that = this;
 		audio.open(left(this), top(this), function (file) {
 			console.log(file);
 			that.value = file.name;
 			$('#level-music').value = file.url;
 			$('#level-music').onchange();
 		});
 	}

 	$('#level-music-fake').onblur = function () {
 		setTimeout(function () {
 			audio.close();
 		}, 100);
 	}

 } ());
