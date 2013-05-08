var mongo = require('mongodb'),
	formidable = require('formidable'),
	im = require('imagemagick'),
	exif = require('../lib/exif'),
	sanitizer = require('sanitizer'),
	path = require('path'),
	fs = require('fs'),
	database = require('../lib/db');

var grid = null,
	BSON = mongo.BSONPure,
	Grid = mongo.Grid;



exports.findById = function(req, res) {
	var id = req.params.id;
	console.log('Retrieving asset: ' + id);
	database.connection(function(db) {
		db.collection('assets', function(err, collection) {
			collection.findOne({
				'_id': new BSON.ObjectID(id)
			}, function(err, item) {
				res.send(item);
			});
		});
	});
};

exports.findAll = function(req, res) {
	database.connection(function(db) {
		db.collection('assets', function(err, collection) {
			collection.find({
				hasPreview: true
			})
				.sort('added', 'desc')
				.toArray(function(err, items) {
				res.send(items);
			});
		});
	});
};

exports.createAssets = function(req, res) {
	database.connection(function(db) {
		console.log(JSON.stringify(req.files.file));
		var asset = {};
		asset.filename = path.basename(req.files.file.name);
		asset.title = path.basename(req.files.file.name, path.extname(asset.filename));
		asset.type = req.files.file.type;
		asset.size = req.files.file.size;
		asset.added = new Date()
			.toString();
		asset.modified = new Date()
			.toString();
		asset.etag = Math.floor(new Date()
			.getTime());
		console.log('Title: ' + asset.title);

		grid = new Grid(db, 'fs');

		fs.readFile(req.files.file.path, function(err, data) {
			grid.put(data, {
				metadata: {
					type: asset.type
				},
				content_type: 'binary'
			}, function(err, fileInfo) {
				if (err) throw err;

				asset.originalGridID = fileInfo._id.toString();

				db.collection('assets', function(err, collection) {
					collection.insert(asset, {
						safe: true
					}, function(err, result) {
						if (err) {
							console.log('Error updating asset: ' + err);
							res.send({
								'error': 'An error has occurred'
							});
						} else {
							console.log(JSON.stringify(result[0]));
							processAsset(result[0]);
							res.send(result[0]);
						}
					});
				});
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

	asset.modified = new Date()
		.toString();
	asset.hasPreview = true; //gets saved as string otherwise

	console.log(JSON.stringify(asset));
	database.connection(function(db) {
		db.collection('assets', function(err, collection) {
			collection.update({
				'_id': new BSON.ObjectID(id)
			}, asset, {
				safe: true
			}, function(err, result) {
				if (err) {
					console.log('Error updating asset: ' + err);
					res.send({
						'error': 'An error has occurred'
					});
				} else {
					console.log('' + result + ' document(s) updated');
					res.send(asset);
				}
			});
		});
	});
}

exports.deleteAsset = function(req, res) {
	var id = req.params.id;
	console.log('Deleting asset: ' + id);
	database.connection(function(db) {
		grid = new Grid(db, 'fs');

		db.collection('assets', function(err, collection) {
			collection.findOne({
				'_id': new BSON.ObjectID(id)
			}, function(err, asset) {
				if (asset && asset.originalGridID) {
					grid.delete(asset.originalGridID, function(err, result) {
						if (err) throw err;
					});
				}
			});
		});

		db.collection('assets', function(err, collection) {
			collection.remove({
				'_id': new BSON.ObjectID(id)
			}, {
				safe: true
			}, function(err, result) {
				if (err) {
					res.send({
						'error': 'An error has occurred - ' + err
					});
				} else {
					console.log('' + result + ' document(s) deleted');
					res.send(req.body);
				}
			});
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
	database.connection(function(db) {
		grid = new Grid(db, 'fs');
		db.collection('assets', function(err, collection) {
			collection.findOne({
				'_id': new BSON.ObjectID(id)
			}, function(err, asset) {
				if (asset) {
					if (req.headers['if-none-match'] === asset.etag) {
						res.statusCode = 304;
						res.end();
					} else {
						grid.get(new BSON.ObjectID((isPreview ? asset.previewGridID : asset.originalGridID)), function(err, data) {
							if (data) {
								res.writeHead(200, {
									'Content-Type': (isPreview ? 'image/jpeg' : asset.type),
									'Content-Length': data.length,
									'Last-Modified': asset.modified,
									'Cache-Control': 'public, max-age=31536000',
									'ETag': asset.etag
								});
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
	});
}

var downloadImage = function(res, id) {
	database.connection(function(db) {
		grid = new Grid(db, 'fs');
		db.collection('assets', function(err, collection) {
			collection.findOne({
				'_id': new BSON.ObjectID(id)
			}, function(err, asset) {
				if (asset) {
					grid.get(new BSON.ObjectID(asset.originalGridID), function(err, data) {
						if (data) {
							res.writeHead(200, {
								'Content-Type': asset.type,
								'Content-Length': data.length,
								'Last-Modified': asset.modified,
								'Content-disposition': 'attachment; filename=' + asset.filename
							});
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
	});
}

var processAsset = function(asset, id) {
	if (asset._id) {
		id = asset._id.toString();
	}
	console.log('Processing asset for ' + id);
	if (asset.originalGridID) {
		console.log('Creating preview for ' + id);
		database.connection(function(db) {
			grid = new Grid(db, 'fs');
			grid.get(new BSON.ObjectID(asset.originalGridID), function(err, data) {
				if (err) throw err;

				exif(data, asset, function(err, exifPhoto) {});
				asset.exif["Size"] = getReadableFileSizeString(asset.size);
				if (asset.exif["Description"]) {
					asset.description = asset.exif["Description"];
					delete asset.exif["Description"];
				}

				im.resize({
					srcData: data,
					quality: 0.5,
					width: 400,
					customArgs: ['-thumbnail', '400x400^', '-size', '400x400', '-extent', '400x400', '-gravity', 'center', '-strip']
				}, function(err, stdout, stderr) {
					if (err) throw err;
					grid.put(new Buffer(stdout, "binary"), {
						metadata: {
							type: asset.type
						},
						content_type: 'binary'
					}, function(err, fileInfo) {
						if (err) throw err;

						asset.previewGridID = fileInfo._id.toString();
						asset.hasPreview = true;
						delete asset._id;
						db.collection('assets', function(err, collection) {
							collection.update({
								'_id': new BSON.ObjectID(id)
							}, asset, {
								safe: true
							}, function(err, result) {
								if (err) {
									console.log('Error updating asset: ' + err);
									res.send({
										'error': 'An error has occurred'
									});
								} else {
									console.log('' + result + ' document processed');
									console.log(JSON.stringify(asset));
								}
							});
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
		database.connection(function(db) {
			grid = new Grid(db, 'fs');
			grid.get(new BSON.ObjectID(asset.originalGridID), function(err, data) {
				if (err) throw err;

				try {
					new ExifImage({
						image: data
					}, function(error, data) {
						if (error) console.log('Error: ' + error.message);
						else var image = data.image,
							exif = data.exif,
							gps = data.gps,
							arrays = image.concat(exif, gps);

						console.log(arrays); // Do something with your data!
					});
				} catch (error) {
					console.log('Error: ' + error);
				}
			});
		});
	}
};

function getReadableFileSizeString(fileSizeInBytes) {
	var i = -1;
	var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
	do {
		fileSizeInBytes = fileSizeInBytes / 1024;
		i++;
	} while (fileSizeInBytes > 1024);

	return Math.max(fileSizeInBytes, 0.1)
		.toFixed(1) + byteUnits[i];
};
