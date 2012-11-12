Scroller-Builder
================

Build 2D Scroller games with HTML5

Background
----------

Team NorthernNode's Node Knockout 2012 entry

* http://northernnode.nko3.jitsu.com/
* http://nodeknockout.com/teams/northernnode

Screenshots
-----------

<img src="http://projects.psema4.com/scroller-builder/Scroller-Builder-ss1.png" alt="Scroller Builder screenshot #1" />

Instructions
------------

* Running *

** Requires ** nodejs - http://nodejs.org

Setup

    $ git clone https://github.com/psema4/Scroller-Builder.git
    $ cd Scroller-Builder
    $ npm install

Run

    $ node server.js

Open Chrome to http://localhost:3000/

* Playing *

- Use the arrow keys to move
- Space key fires, note: SpriteManager is not hooked up here so no lazerz yet :(

* Editing *
- Drag sprites from a toolbox onto the game screen to add a "wave" to the current level (currently limited to 1 sprite/wave)
- Change the settings properties to alter game and level attributes & properties
- While paused, click on a visible sprite to get it's details (in progress)

