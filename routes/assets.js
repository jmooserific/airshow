var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('airshow-assetdb', server, {safe: true});

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'airshow-assetdb' database");
        db.collection('assets', {safe:true}, function(err, collection) {
            if (err) {
                console.log("The 'assets' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
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
    console.log('Adding asset: ' + JSON.stringify(asset));
    db.collection('assets', function(err, collection) {
        collection.insert(asset, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
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
    console.log(JSON.stringify(asset));
    db.collection('assets', function(err, collection) {
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

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    var assets = [
    {
        title: "Portrait of Lorenzo di Credi",
        description: "Pietro Perugino (Italian, c. 1450 - 1523 ), Portrait of Lorenzo di Credi, 1488, oil on panel transferred to canvas, Widener Collection",
        filename: "A10649.jpg",
        preview: "A10649.jpg",
        dimensionsX: 842,
        dimensionsY: 1200
    },
    {
        title: "Panoramic View of the Ile-de-France",
        description: "Théodore Rousseau (French, 1812 - 1867 ), Panoramic View of the Ile-de-France, c. 1830, oil on canvas, Chester Dale Fund",
        filename: "F-002745.jpg",
        preview: "F-002745.jpg",
        dimensionsX: 1200,
        dimensionsY: 324
    }];

    db.collection('assets', function(err, collection) {
        collection.insert(assets, {safe:true}, function(err, result) {});
    });

};