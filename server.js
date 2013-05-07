var express = require('express'),
	path = require('path'),
	http = require('http'),
	asset = require('./routes/assets'),
	user = require('./routes/users'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

var app = express();

passport.use(new LocalStrategy({
		usernameField: 'email',
	},
	function(email, password, done) {
	console.log("Authenticating!");
		user.findByEmail(email, function(err, foundUser) {
			if (err) { return done(err); }
			if (!foundUser) {
				return done(null, false, { message: 'Incorrect username.' });
			}
			if (!user.validPassword(foundUser.passwordHash, foundUser.passwordSalt, password)) {
				return done(null, false, { message: 'Incorrect password.' });
			}
			return done(null, foundUser);
		});
	}
));

passport.serializeUser(function(user, done) {
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	user.findUserById(id, function(err, user) {
		done(err, user);
	});
});

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	app.use(express.logger('dev'));	/* 'default', 'short', 'tiny', 'dev' */
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.session({ secret: 'keyboard cat' }));
	app.use(express.compress());
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.static(path.join(__dirname, 'public'), { maxAge: 86400 })); // one day
});

app.post('/login',
	function(req, res, next) {
			console.log('before authenticate');
			passport.authenticate('local', function(err, user, info) {
				console.log('authenticate callback');
				if (err) { return res.send({'error': {'text': err.message}}); }
				if (!user) { return res.send({'error': {'text': info.message}}); }
				req.logIn(user, function(err) {
					if (err) { return res.send({'error': {'text': err.message}}); }
					var response = user;
					delete response.passwordHash;
					delete response.passwordSalt;
					return res.send({'user': response});
				});
			})(req, res, next);
		},
		function(err, req, res, next) {
			// failure in login test route
			return res.send({'status':'err','message':err.message});
		});
app.get('/logout', function(req, res){
	req.logout();
	res.send({'status': 'logged out'});
});
app.get('/assets', asset.findAll);
app.post('/newassets', ensureAuthenticated, asset.createAssets);
app.get('/assets/:id', asset.findById);
app.put('/assets/:id', ensureAuthenticated, asset.updateAsset);
app.delete('/assets/:id', ensureAuthenticated, asset.deleteAsset);
app.get('/assets/original/:id', asset.getOriginal);
app.get('/assets/preview/:id', asset.getPreview);
app.get('/assets/download/:id', asset.download);

app.get('/users', ensureAuthenticated, user.findAll);
app.get('/users/:id', ensureAuthenticated, user.findById);
app.post('/users', ensureAuthenticated, user.addUser);
app.put('/users/:id', ensureAuthenticated, user.updateUser);
app.delete('/users/:id', ensureAuthenticated, user.deleteUser);


http.createServer(app).listen(process.env.PORT || app.get('port'), function () {
		// the PORT variable will be assigned by Heroku
		console.log("Express server listening on port " + app.get('port'));
});

// Simple route middleware to ensure user is authenticated.
//	 Use this route middleware on any resource that needs to be protected.	If
//	 the request is authenticated (typically via a persistent login session),
//	 the request will proceed.	Otherwise, the user will be redirected to the
//	 login page.
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.send(401, 'You must login to access this page.');
}
