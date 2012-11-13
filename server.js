var port       = (process.env.NODE_ENV == 'production') ? 80 : 3000
  , fs         = require('fs')
  , util       = require('util')
  , express    = require('express')
  , app        = express()
  , gameFolder = 'games/'
  , sanitize   = function(d) { return d.replace(/;/g, '').replace(/\\/g, '').replace(/`/g, '').replace(/\.\./g, ''); }
;

app.use(express.bodyParser());
app.use(express.static(__dirname + '/static'));

// REST API
app.post('/save', function(req, res) {
    var gameData     = JSON.parse(req.body.data)
      , gameFilename = gameFolder + sanitize(gameData.title).replace(/ /g, '_').toLowerCase() + '.json'
    ;

    fs.writeFile(gameFilename, req.body.data, function(err) {
        var buf = gameFilename;
        if (err) buf = 'ERR';
        res.send(buf);
    });
});

app.get('/load/:filename', function(req, res) {
    var requestedGame = req.params.filename
      , gameFilename = gameFolder + sanitize(requestedGame).replace(/ /g, '_').toLowerCase()
    ;

    gameFilename += (gameFilename.match(/\.json$/)) ? '' : '.json';

    fs.readFile(gameFilename, 'ascii', function(err, data) {
        var buf = data;
        if (err) buf = 'ERR';
        res.send(buf);
    });
});

app.get('/list', function(req, res) {
    fs.readdir(gameFolder, function(err, files) {
        if (err) buf = 'ERR';
        var games = [];

        for (var i=0; i<files.length; i++) {
            if (files[i].match(/\.json$/)) games.push(files[i]);
        }

        res.send(JSON.stringify(games));
    });
});

// Start server
app.listen(port);
