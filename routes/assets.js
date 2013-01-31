var mongo = require('mongodb')
    im = require('imagemagick');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('airshow-assetdb', server, {safe: true});

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'airshow-assetdb' database");
    }
});

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving asset: ' + id);
    db.collection('assets', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('assets', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addAsset = function(req, res) {
    var asset = req.body;
    //console.log('Adding asset: ' + JSON.stringify(asset));
    db.collection('assets', function(err, collection) {
        collection.insert(asset, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                processAsset(result[0]);
                //console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateAsset = function(req, res) {
    var id = req.params.id;
    var asset = req.body;
    delete asset._id;
    console.log('Updating asset: ' + id);
    db.collection('assets', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, asset, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating asset: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                processAsset(asset, id);
                console.log('' + result + ' document(s) updated');
                res.send(asset);
            }
        });
    });
}

exports.deleteAsset = function(req, res) {
    var id = req.params.id;
    console.log('Deleting asset: ' + id);
    db.collection('assets', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

exports.getOriginal = function(req, res) {
    var id = req.params.id;
    console.log('Serving original for asset: ' + id);
    db.collection('assets', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            if (item.originalData) {
                var body = new Buffer(item.originalData, 'base64');
                res.setHeader('Content-Type', item.type);
                res.setHeader('Content-Length', body.length);
                res.end(body);
            } else {
                res.send(404);
            }
        });
    });
}

exports.getPreview = function(req, res) {
    var id = req.params.id;
    console.log('Serving preview for asset: ' + id);
    db.collection('assets', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            if (item.previewData) {
                var body = new Buffer(item.previewData, 'base64');
                res.setHeader('Content-Type', 'image/jpeg');
                res.setHeader('Content-Length', body.length);
                res.end(body);
            } else {
                res.send(404);
            }
        });
    });
}


// ============================================

var processAsset = function(asset, id) {
    if (asset._id) {
        id = asset._id.toString();
    }
    console.log('Processing asset for ' + id);
    console.log(JSON.stringify(asset));
    if (asset.originalData) {
        console.log('Creating preview for ' + id);
        im.resize({
            srcData: new Buffer(asset.originalData, 'base64'),
            width: 400,
            customArgs: ['-depth','8','-colorspace','sRGB','-thumbnail','400x400^','-size','400x400','-extent','400x400','xc:white','+swap','-gravity','center','-composite']
        }, function(err, stdout, stderr){
            if (err) throw err
            var base64Image = new Buffer(stdout, "binary").toString('base64');
            asset.previewData = base64Image;
            asset.hasPreview = true;
            delete asset._id;
            console.log('Updating asset with preview: ' + id);
            db.collection('assets', function(err, collection) {
                collection.update({'_id':new BSON.ObjectID(id)}, asset, {safe:true}, function(err, result) {
                    if (err) {
                        console.log('Error updating asset: ' + err);
                        res.send({'error':'An error has occurred'});
                    } else {
                        console.log('' + result + ' document(s) updated');
                    }
                });
            });
        });
    }
};