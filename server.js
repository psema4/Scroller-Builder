var port    = (process.env.NODE_ENV == 'production') ? 80 : 3000
  , fs      = require('fs')
  , util    = require('util')
  , express = require('express')
  , app     = express()
  , gameId  = 0
  , gameFolder = 'games'
;

app.use(express.bodyParser());
app.use(express.static(__dirname + '/static'));

app.post('/save', function(req, res) {
    gameId++;

    var gameData = req.body.data
      , gameFilename = gameFolder+'/game_'+gameId+'.json'
    ;

    fs.writeFile(gameFilename, gameData, function(err) {
        var buf = gameFilename;
        if (err) buf = 'ERR';
        res.send(buf);
    });
}); 

app.get('/', function (req, res) {
	res.send('Hello');
});

app.listen(port);
