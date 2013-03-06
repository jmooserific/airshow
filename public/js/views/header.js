window.HeaderView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template());
        return this;
    },

    selectMenuItem: function (menuItem) {
        $('.nav li').removeClass('active');
        if (menuItem) {
            $('.' + menuItem).addClass('active');
        }
    },
	
	events: {
        "click #logout": "logout"
    },

    logout:function (event) {
        event.preventDefault(); // Don't let this button submit the form
        var url = '/logout';
        console.log('Logging out... ');
        $.get(url, function () {
			// Success!
			$.removeCookie('user');
	              console.log(["Logged out."]);
			this.headerView = new HeaderView();
	        $('.header').html(this.headerView.el);
	        window.location.replace('#'); 
		});
    }

});