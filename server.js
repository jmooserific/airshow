var express = require('express'),
    path = require('path'),
    http = require('http'),
    asset = require('./routes/assets');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.compress()),
    app.use(express.json()),
    app.use(express.urlencoded()),
    app.use(express.static(path.join(__dirname, 'public'), { maxAge: 86400 })); // one day
});

app.get('/assets', asset.findAll);
app.post('/newassets', asset.createAssets);
app.get('/assets/:id', asset.findById);
app.put('/assets/:id', asset.updateAsset);
app.delete('/assets/:id', asset.deleteAsset);
app.get('/assets/original/:id', asset.getOriginal);
app.get('/assets/preview/:id', asset.getPreview);


http.createServer(app).listen(process.env.PORT || app.get('port'), function () {
    // the PORT variable will be assigned by Heroku
    console.log("Express server listening on port " + app.get('port'));
});
