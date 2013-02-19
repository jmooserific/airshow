##Airshow##

A _simply_ awesome photo gallery server.

This web application is primarily a vehicle for me to experiment with [Node.js](http://nodejs.org), [Express](http://expressjs.com), [Backbone.js](http://backbonejs.org), [mongoDB](http://www.mongodb.org) and [HTML5](http://en.wikipedia.org/wiki/HTML5)/[CSS3](http://en.wikipedia.org/wiki/CSS3#CSS_3). Perhaps it will be interesting to you, too.

It only works in the most modern of browsers– the latest versions of Safari and Chrome, for example.

Here's a [demo](http://airshow.herokuapp.com).

The basic structure of the application was strongly inspired by the excellent [nodecellar](https://github.com/ccoenraets/nodecellar) sample application by Christophe Coenraets.

##Features##
* displays a paginated grid of images
* opens image in a lightbox
* uses CSS transforms to flip image to show details
* new images can be uploaded via drag and drop in batches and previews are generated
* images are stored and served from the database ([GridFS](http://docs.mongodb.org/manual/applications/gridfs/))
* responsive layout– resize your browser window
* displays EXIF information

##Coming soon##
* validation
* support for larger image files 
* authentication/authorization

## To install on your own Heroku account:##

1. Install the [Heroku Toolbelt](http://toolbelt.heroku.com)

2. [Sign up](http://heroku.com/signup) for a Heroku account

3. Login to Heroku from the `heroku` CLI:

        $ heroku login

4. Create a new app on Heroku:

        $ heroku create

5. Add the [MongoLab Heroku Add-on](http://addons.heroku.com/mongolab)

        $ heroku addons:add mongolab

6. Upload the app to Heroku:

        $ git push heroku master

7. Open the app in your browser:

        $ heroku open

