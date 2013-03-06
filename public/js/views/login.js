window.LoginView = Backbone.View.extend({

    initialize:function () {
        console.log('Initializing Login View');
		this.render();
    },

    events: {
        "click #loginButton": "login"
    },

    render:function () {
        $(this.el).html(this.template());
        return this;
    },

    login:function (event) {
        event.preventDefault(); // Don't let this button submit the form
        $('.alert-error').hide(); // Hide any errors on a new submit
        var url = '/login';
        console.log('Logging in... ');
        var formValues = {
            email: $('#email').val(),
            password: $('#password').val()
        };
        $.ajax({
            url:url,
            type:'POST',
            dataType:"json",
            data: formValues,
            success:function (data) {
                console.log(["Login request details: ", data]);
               
                if (data.error) {  // If there is an error, show the error messages
                    $('.alert-error').text(data.error.text).show();
                } 
 				if (data.user) { // Success!
					$.cookie.json = true;
					$.cookie('user', data.user);
					this.headerView = new HeaderView();
			        $('.header').html(this.headerView.el);
					window.location.replace('#'); 
                }
            }
        });
    }
});