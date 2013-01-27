var images = require('../images'),
    util = require('util');

/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Hello.', images: images.getImageFiles});
};