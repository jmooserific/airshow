window.AssetListView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        var assets = this.model.models;
        var len = assets.length;
        var startPos = (this.options.page - 1) * 24;
        var endPos = Math.min(startPos + 24, len);

        $(this.el).html('<ul class="thumbnails"></ul>');

        for (var i = startPos; i < endPos; i++) {
            $('.thumbnails', this.el).append(new AssetListItemView({model: assets[i]}).render().el);
        }

        //$(this.el).append(new Paginator({model: this.model, page: this.options.page}).render().el);

        return this;
    }
});

window.AssetListItemView = Backbone.View.extend({

    tagName: "li",

    initialize: function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render: function () {
        $(this.el).addClass('span2').html(this.template(this.model.toJSON()));
        return this;
    }

});