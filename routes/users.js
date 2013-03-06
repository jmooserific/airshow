var mongo = require('mongodb'),
	formidable = require('formidable'),
	bcrypt = require('bcrypt'),
	database = require('../lib/db');

var BSON = mongo.BSONPure;

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving user: ' + id);
	database.connection(function(db) {
    	db.collection('users', function(err, collection) {
	        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
	            res.send(item);
	        });
	    });
	});
};

exports.findAll = function(req, res) {
	database.connection(function(db) {
    	db.collection('users', function(err, collection) {
	        collection.find().toArray(function(err, items) {
	            res.send(items);
	        });
	    });
	});
};

exports.addUser = function(req, res) {
    var user = req.body;
	database.connection(function(db) {
    	db.collection('users', function(err, collection) {
	        collection.insert(hashPassword(user), {safe:true}, function(err, result) {
	            if (err) {
	                res.send({'error':'An error has occurred'});
	            } else {
	                console.log('Success: ' + JSON.stringify(result[0]));
					console.log(JSON.stringify(user));
	                res.send(result[0]);
	            }
	        });
	    });
	});
}

exports.updateUser = function(req, res) {
    var id = req.params.id;
    var user = req.body;
    delete user._id;
    console.log('Updating user: ' + id);
	if (req.params.password) {
		user = hashPassword(user);
	}
	database.connection(function(db) {
    	db.collection('users', function(err, collection) {
	        collection.update({'_id':new BSON.ObjectID(id)}, user, {safe:true}, function(err, result) {
	            if (err) {
	                console.log('Error updating user: ' + err);
	                res.send({'error':'An error has occurred'});
	            } else {
	                console.log('' + result + ' document(s) updated');
					console.log(JSON.stringify(user));
	                res.send(user);
	            }
	        });
	    });
	});
}

exports.deleteUser = function(req, res) {
    var id = req.params.id;
    console.log('Deleting user: ' + id);
	database.connection(function(db) {
    	db.collection('users', function(err, collection) {
	        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
	            if (err) {
	                res.send({'error':'An error has occurred - ' + err});
	            } else {
	                console.log('' + result + ' document(s) deleted');
	                res.send(req.body);
	            }
	        });
	    });
	});
}

exports.findByEmail = function(email, callback) {
    console.log('Retrieving user: ' + email);
	database.connection(function(db) {
    	db.collection('users', function(err, collection) {
	        collection.findOne({'email': email}, function(err, user) {
	            callback(err, user);
	        });
	    });
	});
};

exports.findUserById = function(id, callback) {
    console.log('Retrieving user: ' + id);
	database.connection(function(db) {
    	db.collection('users', function(err, collection) {
	        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
	            callback(err, item);
	        });
	    });
	});
};

exports.validPassword = function(storedHash, salt, providedPassword) {
	newHash = hashThis(providedPassword, salt);
	console.log('comparing ' + storedHash + ' and ' + newHash);
    if (newHash == storedHash) {
		console.log('Authenticated!');
		return true;
	}
	return false;
};

// Hash password
var hashPassword = function(user) {
	password = user.password;
	delete user.password; // Don't store password
	salt = bcrypt.genSaltSync(10);
	user.passwordHash = hashThis(password, salt);
	user.passwordSalt = salt;
	return user;
};

var hashThis = function(password, salt) {
	return bcrypt.hashSync(password, salt);
}