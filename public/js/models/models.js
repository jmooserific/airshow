window.Asset = Backbone.Model.extend({

    urlRoot: "/assets",

    idAttribute: "_id",

    initialize: function () {       
        
    },

    readFile: function(file){                                                                                                                  
        var reader = new FileReader();                                                                                                         
        self = this;                                                                                                                           
        reader.onloadend = (function(fileToSave, that){                                                                                                   
            return function(e){
                var matches = e.target.result.match(/^data:.+\/(.+);base64,(.*)$/);
                var ext = matches[1];
                var base64_data = matches[2];
                
                var theImage = new Image();
                
                if ($('#picture')) {
                    $('#picture').attr('src', e.target.result);
                }
                
                theImage.src = e.target.result;
                theImage.onload = function() {
                    that.set({filename: fileToSave.name, type: fileToSave.type, originalData: base64_data,
                        dimensionsX: theImage.width, dimensionsY: theImage.height});
                }
            };                                                                                                                                 
        })(file, this);                                                                                                                              

        reader.readAsDataURL(file);                                                                                                            
    },
    
    defaults: {
        _id: null,
        title: "",
        description: "",
        filename: null,
        type: null,
        originalData: null,
        originalGridID: null,
        previewGridID: null,
        dimensionsX: 800,
        dimensionsY: 800,
        added: new Date()
    }
});

window.AssetCollection = Backbone.Collection.extend({

    model: Asset,

    url: "/assets"

});