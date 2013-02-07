window.Asset = Backbone.Model.extend({

    urlRoot: "/assets",

    idAttribute: "_id",

    initialize: function () {       
        
    },
    
    defaults: {
        _id: null,
        title: "",
        description: "",
        filename: null,
        type: null,
        etag: null,
        hasPreview: false,
        originalGridID: null,
        previewGridID: null,
        added: new Date().toString(),
        modified: new Date().toString()
    }
});

window.AssetCollection = Backbone.Collection.extend({

    model: Asset,

    url: "/assets"

});