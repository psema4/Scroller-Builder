/* ui.js
 *
 * basic dynamic content (will probably later break this into seperate modules if it gets too large)
 */

 ;(function () {

 	function $ (id) {
 		return document.getElementById(id);
 	}

 	// Class functions; rewrite depending on browser support
 	function add (elem, cls) {
 		elem.classList.add(cls);
 	}

 	function remove (elem, cls) {
 		elem.classList.remove(cls);
 	}

 	function has (elem, cls) {
 		return elem.classList.contains(cls);
 	}

 	$('login_btn').onclick = function () {
 		add($('login_form'), 'shown');
 	};

 	document.onclick = function (e) {
 		if (has(e.target, 'close')) {
 			remove(e.target.parentNode, 'shown');
 		}
 	};

 } ());