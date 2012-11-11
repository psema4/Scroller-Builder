var port    = (process.env.NODE_ENV == 'production') ? 80 : 3000;
  , express = require('express')
  , app     = express()
;

app.use(express.static(__dirname + '/static'));

app.get('/', function (req, res) {
	res.send('Hello');
});

app.listen(port);
