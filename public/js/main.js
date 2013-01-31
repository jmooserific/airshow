var AppRouter = Backbone.Router.extend({

    routes: {
        ""                  : "home",
        "assets"	: "list",
        "assets/page/:page"	 : "list",
        "assets/add"         : "addAsset",
        "assets/:id/edit"    : "editAsset",
        "assets/:id"         : "assetDetails"
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
        assetList.fetch({success: function(){
            $("#content").html(new AssetListView({model: assetList, page: p}).el);
        }});
        this.headerView.selectMenuItem('home-menu');
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
        var asset = new Asset({_id: id});
        asset.fetch({success: function(){
            closeLightbox();
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

utils.loadTemplate(['HeaderView', 'AssetView', 'EditAssetView', 'AssetListItemView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});