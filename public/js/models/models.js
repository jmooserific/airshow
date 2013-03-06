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

window.User = Backbone.Model.extend({

    urlRoot: "/users",

    idAttribute: "_id",

    initialize: function () {       
        this.validators = {};

        this.validators.name = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "You must enter a name"};
        };

        this.validators.email = function (value) {
            return value.length > 0 ? {isValid: true} : {isValid: false, message: "You must enter an e-mail address"};
        };
    },
    
	validateItem: function (key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) : {isValid: true};
    },

    // TODO: Implement Backbone's standard validate() method instead.
    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} : {isValid: true};
    },
	
    defaults: {
        _id: null,
        name: null,
        email: null
    }
});

window.UserCollection = Backbone.Collection.extend({

    model: User,

    url: "/users"

});