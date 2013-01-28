var AppRouter = Backbone.Router.extend({

    routes: {
        ""                  : "list",
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
        window.location.hash = '#assets';
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
        var asset = new Asset({_id: id});
        asset.fetch({success: function(){
            $("#lightbox_content").html(new AssetView({model: asset}).el);
            $('#lightbox').fadeIn();
            resizeLightbox();
            $('#lightbox .front').click(function(event) {
                $('#lightbox .flipper').css( "-webkit-transform","rotateY(180deg)" );
                $('#lightbox .flipper').css( "-moz-transform","rotateY(180deg)" );
                $('#lightbox .flipper').css( "transform","rotateY(180deg)" );

                event.stopPropagation();
            });
            $('#lightbox .back').click(function(event) {
                $('#lightbox .flipper').css( "-webkit-transform","rotateY(0deg)" );
                $('#lightbox .flipper').css( "-moz-transform","rotateY(0deg)" );
                $('#lightbox .flipper').css( "transform","rotateY(0deg)" );
                
                event.stopPropagation();
            });
        }});
    },
    
    editAsset: function (id) {
        var asset = new Asset({_id: id});
        asset.fetch({success: function(){
            $("#content").html(new EditAssetView({model: asset}).el);
        }});
        this.headerView.selectMenuItem();
    },

	addAsset: function() {
        var asset = new Asset();
        $('#content').html(new AssetView({model: asset}).el);
        this.headerView.selectMenuItem('add-menu');
	},

    about: function () {
        if (!this.aboutView) {
            this.aboutView = new AboutView();
        }
        $('#content').html(this.aboutView.el);
        this.headerView.selectMenuItem('about-menu');
    }

});

utils.loadTemplate(['HeaderView', 'AssetView', 'EditAssetView', 'AssetListItemView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});