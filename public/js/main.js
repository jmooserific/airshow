$.ajaxSetup({
    statusCode: {
        401: function(){
            // Redirec the to the login page.
            window.location.replace('/#login');

        },
        403: function() {
            // 403 -- Access denied
            window.location.replace('/#login');
        }
    }
});

var AppRouter = Backbone.Router.extend({

    routes: {
        ""                  : "home",
        "assets"			: "listAssets",
        "assets/page/:page"	: "listAssets",
        "assets/add"        : "addAsset",
        "assets/:id/edit"   : "editAsset",
        "assets/:id"        : "assetDetails",
		"newassets"			: "newAssets",
		"login"				: "login",
		"users"				: "listUsers",
		"users/add"         : "addUser",
		"users/:id"         : "userDetails"
    },

    initialize: function () {
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);
    },

    home: function (id) {
        app.navigate('assets', true);
    },

	listAssets: function(page) {
        var p = page ? parseInt(page, 10) : 1;
        var assetList = new AssetCollection();
        $(".thumbnails").fadeOut();
        assetList.fetch({success: function(){
            $("#content").html(new AssetListView({model: assetList, page: p}).el);
            $(".thumbnails").fadeIn();
        }});
    },

	newAssets: function() {
        $('#content').html(new NewAssetsView().el);
		$(".dropzone").dropzone();
	},

    assetDetails: function (id) {
        if ($('.thumbnails').length == 0) {
            var route = Backbone.history.fragment;
            app.navigate('assets', true);
            app.navigate(route, {trigger: false, replace: true});
        }
        $('#loading').show();
        var asset = new Asset({_id: id});
        asset.fetch({success: function(){
            $("#lightbox_content").html(new AssetView({model: asset}).el);
        }});
    },

    editAsset: function (id) {
		closeLightbox();
        var asset = new Asset({_id: id});
        asset.fetch({success: function(){
            $("#content").html(new EditAssetView({model: asset}).el);
            CKEDITOR.replace( 'description' );
        }});
    },

	addAsset: function() {
        var asset = new Asset();
        $('#content').html(new EditAssetView({model: asset}).el);
	},

	listUsers: function() {
        var userList = new UserCollection();
        userList.fetch({success: function(){
            $("#content").html(new UserListView({model: userList}).el);
        }});
    },

	userDetails: function (id) {
        var user = new User({_id: id});
        user.fetch({success: function(){
            $("#content").html(new UserView({model: user}).el);
        }});
    },

	addUser: function() {
        var user = new User();
        $('#content').html(new UserView({model: user}).el);
	},

	login: function() {
        $('#content').html(new LoginView().el);
	},
});

utils.loadTemplate(['HeaderView', 'AssetView', 'EditAssetView', 'AssetListItemView', 'NewAssetsView', 'UserListItemView', 'UserView', 'LoginView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});