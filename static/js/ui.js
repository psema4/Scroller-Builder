/* ui.js
 *
 * basic dynamic content (will probably later break this into seperate modules if it gets too large)
 */

 ;(function () {

 	function $ (id) {
 		return document.getElementById(id);
 	}

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


 	$('login_btn').onclick = function () {
 		add($('login_form'), 'shown');
 	};

 	document.onclick = function (e) {
 		if (has(e.target, 'close')) {
 			remove(e.target.parentNode, 'shown');
 		}
 	};

 	$('play_pause_btn').onclick = function () {
 		if (this.paused) {
 			this.innerHTML = '| |';
 			game.startTicking();
 			this.paused = false;
 		}
 		else
 		{
 			this.innerHTML = '►';
 			game.stopTicking();
 			this.paused = true;
 		}
 		tick_slider.setValue(0);
 	};

 	$('next_lvl_btn').onclick = function () {
 		game.nextLevel();
 		game.update();
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

 	var tick_slider = new Slider($('tick_slider'), {min: -1.5, max: 1.5, retain: true}), dir = 1;

 	tick_slider.onChange(function (val) {
 		if (val === 0 && $('play_pause_btn').paused) game.stopTicking();
 		else if (!game.checkTicking()) game.startTicking();
 		var set = val < 0 ? -1 : 1;
 		if (set !== dir) game.setTickDirection(dir = set);
 	});

 } ());