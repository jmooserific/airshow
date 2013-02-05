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
        originalGridID: null,
        previewGridID: null,
        added: (new Date()).getTime(),
        modified: (new Date()).getTime()
    }
});

window.AssetCollection = Backbone.Collection.extend({

    model: Asset,

    url: "/assets"

});