window.UserListView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
		var users = this.model.models;
        
        $(this.el).html('<a href="#users/add" class="btn adduser">Add a User</a><br><table class="users table table-striped table-hover table-condensed"><tr><th>Name</th><th>E-Mail Address</th><th></th></tr></table>');

        for (var i = 0; i < users.length; i++) {
            $('.users', this.el).append(new UserListItemView({model: users[i]}).render().el);
        }

		if (users.length == 0) {
			$(this.el).html('<p class="no-images">Please <a href="#users/add">add some users</a>.</p>');
		}
        
        return this;
    }
});

window.UserListItemView = Backbone.View.extend({

    tagName: "tr",

    initialize: function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }
});