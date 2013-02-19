var mongo = require('mongodb'),
    im = require('imagemagick'),
	gridform = require('gridform'),
	formidable = require('formidable'),
	exif = require('../lib/exif'),
	sanitizer = require('sanitizer'),
	path = require('path');

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
	gridform.db = database;
	gridform.mongo = mongo;
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
        collection.find({hasPreview: true}).sort('added', 'desc').toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.createAssets = function(req, res) {
	var asset = {};
	var form = gridform();

	form.parse(req, function (err, fields, files) {
		
		// use files and fields as you do today
		var file = files.file;
		//file.name // the uploaded file name
		//file.type // file type per [mime](https://github.com/bentomas/node-mime)
		//file.size // uploaded file size (file length in GridFS) named "size" for compatibility
		//file.path // same as file.name. included for compatibility
		//file.lastModified // included for compatibility

		// files contain additional gridfs info
		//file.root // the root of the files collection used in MongoDB ('fs' here means the full collection in mongo is named 'fs.files')
		//file.id   // the ObjectId for this file
		asset.originalGridID = file.id.toString();
		asset.title = path.basename(file.name, path.extname(file.name));
        asset.filename = file.name;
		asset.type = file.type;
		asset.added = new Date().toString();
        asset.modified = new Date().toString();
        asset.etag = Math.floor(new Date().getTime());
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
    
    console.log('Updating asset: ' + id);
    delete asset._id;

    //sanitize properties
    for (var property in asset) {
        asset[property] = sanitizer.sanitize(asset[property]);
    }
    
    asset.modified = new Date().toString();
    asset.hasPreview = true; //gets saved as string otherwise
    
    console.log(JSON.stringify(asset));
    database.collection('assets', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, asset, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating asset: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(asset);
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
    sendImage(req, res, id, false);
}

exports.getPreview = function(req, res) {
    var id = req.params.id;
    console.log('Serving preview for asset: ' + id);
    sendImage(req, res, id, true);
}

exports.download = function(req, res) {
    var id = req.params.id;
    console.log('Serving download for asset: ' + id);
    downloadImage(res, id);
}


// ============================================

var sendImage = function(req, res, id, isPreview) {
    database.collection('assets', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, asset) {
            if (asset) {
                if(req.headers['if-none-match'] === asset.etag) {
                    res.statusCode = 304;
                    res.end();
                } else {
                    grid.get(new BSON.ObjectID((isPreview ? asset.previewGridID : asset.originalGridID )), function(err, data) {
                        if (data) {
                            res.writeHead(200, {'Content-Type': (isPreview ? 'image/jpeg' : asset.type ), 'Content-Length': data.length, 'Last-Modified': asset.modified, 'Cache-Control': 'public, max-age=31536000','ETag': asset.etag });
                            res.end(data, 'binary');
                        } else {
                            console.log('Error:' + err);
                            res.send(404);
                        }
                    });
                }
            } else {
                res.send(404);
            }
        });
    });
}

var downloadImage = function(res, id) {
    database.collection('assets', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, asset) {
            if (asset) {
                grid.get(new BSON.ObjectID(asset.originalGridID), function(err, data) {
                    if (data) {
                        res.writeHead(200, {'Content-Type': asset.type, 'Content-Length': data.length, 'Last-Modified': asset.modified, 'Content-disposition': 'attachment; filename=' + asset.filename });
                        res.end(data, 'binary');
                    } else {
                        console.log('Error:' + err);
                        res.send(404);
                    }
                });
            } else {
                res.send(404);
            }
        });
    });
}

var processAsset = function(asset, id) {
    if (asset._id) {
        id = asset._id.toString();
    }
    console.log('Processing asset for ' + id);
    if (asset.originalGridID) {
        console.log('Creating preview for ' + id);
        grid.get(new BSON.ObjectID(asset.originalGridID), function(err, data) {
            if (err) throw err;
			
			exif(data, asset, function(err, exifPhoto){});
			if (asset.exif.description) {
				asset.description = asset.exif.description;
			}
			
            im.resize({
                srcData: data,
                quality: 0.5,
                width: 400,
                customArgs: ['-thumbnail','400x400^','-size','400x400','-extent','400x400','-gravity','center','-strip']
            }, function(err, stdout, stderr){
                if (err) throw err;
                grid.put(new Buffer(stdout, "binary"), {metadata:{type: asset.type}, content_type: 'binary'}, function(err, fileInfo) {
                    if (err) throw err;
					
                    asset.previewGridID = fileInfo._id.toString();
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

var getExif = function(asset, id) {
    if (asset._id) {
        id = asset._id.toString();
    }
    if (asset.originalGridID) {
        console.log('Getting EXIF for ' + id);
        grid.get(new BSON.ObjectID(asset.originalGridID), function(err, data) {
            if (err) throw err;
			
            try {
			    new ExifImage({ image: data }, function (error, data) {
			        if (error)
			            console.log('Error: ' + error.message);
			        else
						var image = data.image,
						exif = data.exif,
						gps = data.gps,
						arrays = image.concat(exif, gps);
						
			            console.log(arrays); // Do something with your data!
			    });
			} catch (error) {
			    console.log('Error: ' + error);
			}
        });
    }
};