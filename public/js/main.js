var AppRouter = Backbone.Router.extend({

    routes: {
        ""                  : "home",
        "assets"	: "list",
        "assets/page/:page"	 : "list",
        "assets/add"         : "addAsset",
        "assets/:id/edit"    : "editAsset",
        "assets/:id"         : "assetDetails",
		"newassets"			 : "newAssets"
    },

    initialize: function () {
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);
    },

    home: function (id) {
        app.navigate('assets', true);
    },

	list: function(page) {
        var p = page ? parseInt(page, 10) : 1;
        var assetList = new AssetCollection();
        $(".thumbnails").fadeOut();
        assetList.fetch({success: function(){
            $("#content").html(new AssetListView({model: assetList, page: p}).el);
            $(".thumbnails").fadeIn();
        }});
        this.headerView.selectMenuItem('home-menu');
    },

	newAssets: function() {
        $('#content').html(new NewAssetsView().el);
		$(".dropzone").dropzone();
        this.headerView.selectMenuItem();
	},

    assetDetails: function (id) {
        if (!$('.thumbnails')) {
            app.navigate('assets', true);
        }
        var asset = new Asset({_id: id});
        asset.fetch({success: function(){
            $("#lightbox_content").html(new AssetView({model: asset}).el);
            
            showLightbox();
        }});
    },
    
    editAsset: function (id) {
		closeLightbox();
        var asset = new Asset({_id: id});
        asset.fetch({success: function(){
            $("#content").html(new EditAssetView({model: asset}).el);
        }});
        this.headerView.selectMenuItem();
    },

	addAsset: function() {
        var asset = new Asset();
        $('#content').html(new EditAssetView({model: asset}).el);
        this.headerView.selectMenuItem('add-menu');
	}
});

utils.loadTemplate(['HeaderView', 'AssetView', 'EditAssetView', 'AssetListItemView', 'NewAssetsView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});