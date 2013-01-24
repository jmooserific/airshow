var fs = require('fs'),
    path = require('path'),
    im = require('imagemagick');

var imageFiles = [];
var pathToOriginals = 'public/originals';
var pathToPreviews = 'public/previews';
var urlToOriginals = 'originals';
var urlToPreviews = 'previews';
var excludeFilter = /^Thumbs.db|^\.[a-zA-Z0-9]+/; // Files matching this will be ignored

// Create previews directory if it doesn't already exist
fs.exists(pathToPreviews, function(exists) {
    if (!exists) {
        fs.mkdirSync(pathToPreviews);
    }
});


function init() {
    fs.readdir(pathToOriginals, function (err, list) {
        if (err) {
            console.log("Error reading files: ", err);
        } else {
            list.forEach(function(file) {
                if (!file.match(excludeFilter)) {
                    // TODO: check to see if file is image
                
                    var imageName = file.replace(/.[^\.]+$/, "");
                    var image = {
                      name: imageName,
                      filepath: path.join(pathToOriginals, file),
                      filepreview: pathToPreview(path.join(pathToOriginals, file)),
                      url: path.join(urlToOriginals, file),
                      previewurl: urlToPreview(path.join(urlToOriginals, file))
                    };
                    generatePreview(path.join(pathToOriginals, file), 400, true);
                    imageFiles.push(image);
                }
            });
        }
    });
};

function pathToPreview(pathToOriginal) {
    return path.join(pathToPreviews, path.basename(pathToOriginal, path.extname(pathToOriginal)) + '.jpg');
};

function urlToPreview(pathToOriginal) {
    return path.join(urlToPreviews, path.basename(pathToOriginal, path.extname(pathToOriginal)) + '.jpg');
};

function generatePreview(pathToOriginal, size, isSquare) {
    fs.exists(pathToPreview(pathToOriginal), function(exists) {
        if (!exists) {
            im.convert([pathToOriginal, '-quality','85%','-depth','8','-colorspace','sRGB','-thumbnail','400x400^','-size','400x400','-extent','400x400','xc:white','+swap','-gravity','center','-composite', pathToPreview(pathToOriginal)], function(err, stdout){
                if (err) throw err;
                console.log("Created preview for", pathToOriginal);
            });
        }
    });
};

init();

exports.getImageFiles = imageFiles;