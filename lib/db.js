var mongo = require('mongodb');

var database = null;

exports.connection = function(callback) {
	if (database == null) {
		mongo.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/airshow-assetdatabase', {}, function(error, db) {       
		    console.log("Connected to database");

		    db.addListener("error", function(error){
		        console.log("Error connecting to database:" + error);
		    });

			db.collection('users', {safe:true}, function(err, collection) {
			    if (err) {
			        console.log("The 'users' collection doesn't exist. Creating it with a default account...");
			        populateDB(db);
			    }
			});
			
			database = db;
			
			callback(db);
		});
	} else {
		callback(database);
	}
}

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function(database) {
    var users = [
	{
        name: "Administrator",
		email: "change_me@fake.com",
		passwordSalt: "$2a$10$BF0q/dxFNbmxPCKniufLeu",
		passwordHash: "$2a$10$BF0q/dxFNbmxPCKniufLeuCszwnU.p9kPayqoqrvF2PNy3v4dHUuy" // "Airshow"
    }
	];

    database.collection('users', function(err, collection) {
        collection.insert(users, {safe:true}, function(err, result) {});
    });
};