var mongo = require('mongodb'),
    im = require('imagemagick');

var database = null,
    grid = null,
    BSON = mongo.BSONPure,
    Grid = mongo.Grid;

mongo.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/airshow-assetdatabase', {}, function(error, db) {       
    console.log("Connected to database");

    database = db;    

    database.addListener("error", function(error){
        console.log("Error connecting to database:" + error);
    });
    
    grid = new Grid(database, 'fs');
});

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving asset: ' + id);
    database.collection('assets', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    database.collection('assets', function(err, collection) {
        collection.find().sort('added', 'desc').toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addAsset = function(req, res) {
    var asset = req.body;
    
    grid.put(new Buffer(asset.originalData, 'base64'), {metadata:{type: asset.type}, content_type: 'binary'}, function(err, fileInfo) {
        if (err) throw err;
        asset.originalGridID = fileInfo._id;
        asset.originalData = null;
        //console.log('Adding asset: ' + JSON.stringify(asset));
        database.collection('assets', function(err, collection) {
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
    });
}

exports.updateAsset = function(req, res) {
    var id = req.params.id;
    var asset = req.body;
    delete asset._id;
    console.log('Updating asset: ' + id);
    var buffer = new Buffer(asset.originalData, 'base64');
    asset.originalData = null;
    database.collection('assets', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, asset, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating asset: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                grid.put(buffer, {metadata:{type: asset.type}, content_type: 'binary'}, function(err, fileInfo) {
                    if (err) throw err;
                    if (asset.originalGridID) {
                        grid.delete(asset.originalGridID, function(err, result) {});
                    }
                    asset.originalGridID = fileInfo._id;
                    processAsset(asset, id);
                    console.log('' + result + ' document(s) updated');
                    res.send(asset);
                });
            }
        });
    });
}

exports.deleteAsset = function(req, res) {
    var id = req.params.id;
    console.log('Deleting asset: ' + id);

    database.collection('assets', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, asset) {
            if (asset && asset.originalGridID) {
                grid.delete(asset.originalGridID, function(err, result) {
                    if (err) throw err;
                });
            }
        });
    });
    
    database.collection('assets', function(err, collection) {
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
    database.collection('assets', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, asset) {
            if (asset && asset.originalGridID) {
                grid.get(asset.originalGridID, function(err, data) {
                    if (data) {
                        res.setHeader('Content-Type', asset.type);
                        res.setHeader('Content-Length', data.length);
                        res.end(data);
                    } else {
                        res.send(404);
                    }
                });
            } else {
                res.send(404);
            }
        });
    });
}

exports.getPreview = function(req, res) {
    var id = req.params.id;
    console.log('Serving preview for asset: ' + id);
    database.collection('assets', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, asset) {
            if (asset && asset.previewGridID) {
                grid.get(asset.previewGridID, function(err, data) {
                    if (data) {
                        res.setHeader('Content-Type', asset.type);
                        res.setHeader('Content-Length', data.length);
                        res.end(data);
                    } else {
                        res.send(404);
                    }
                });
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
    if (asset.originalGridID) {
        console.log('Creating preview for ' + id);
        grid.get(asset.originalGridID, function(err, data) {
            if (err) throw err;
            im.resize({
                srcData: data,
                width: 400,
                customArgs: ['-thumbnail','400x400^','-size','400x400','-extent','400x400','-gravity','center']
            }, function(err, stdout, stderr){
                if (err) throw err;
                grid.put(new Buffer(stdout, "binary"), {metadata:{type: asset.type}, content_type: 'binary'}, function(err, fileInfo) {
                    if (err) throw err;
                    asset.previewGridID = fileInfo._id;
                    asset.hasPreview = true;
                    delete asset._id;
                    database.collection('assets', function(err, collection) {
                        collection.update({'_id':new BSON.ObjectID(id)}, asset, {safe:true}, function(err, result) {
                            if (err) {
                                console.log('Error updating asset: ' + err);
                                res.send({'error':'An error has occurred'});
                            } else {
                                console.log('' + result + ' document processed');
                                console.log(JSON.stringify(asset));
                            }
                        });
                    });
                });
            });
        });
    }
};