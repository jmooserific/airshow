var express = require('express'),
    path = require('path'),
    http = require('http'),
    asset = require('./routes/assets');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/assets', asset.findAll);
app.get('/assets/:id', asset.findById);
app.post('/assets', asset.addAsset);
app.put('/assets/:id', asset.updateAsset);
app.delete('/assets/:id', asset.deleteAsset);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
