function setSize() {
    $("<img/>") // Make in memory copy of image to avoid css issues
        .attr("src", $('#lightbox .front img').attr('src'))
        .load(function() {
            $('#lightbox .front img').attr('data-width', this.width);
            $('#lightbox .front img').attr('data-height', this.height);
            $('#loading').hide();
            showLightbox();
            resizeElements();
        });
}

function showLightbox() {
    $('#lightbox .flipper').css( "-webkit-transform","rotateY(-90deg)" );
    $('#lightbox .flipper').css( "-moz-transform","rotateY(-90deg)" );
    $('#lightbox .flipper').css( "transform","rotateY(-90deg)" );

    $('#lightbox').fadeIn();

    $('#lightbox .flipper').css( "-webkit-transform","rotateY(0deg)" );
    $('#lightbox .flipper').css( "-moz-transform","rotateY(0deg)" );
    $('#lightbox .flipper').css( "transform","rotateY(0deg)" );

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
}

function resizeElements() {
    if ($('#lightbox').is(':visible') && $('#lightbox .front img')) {
		var originalWidth = 800;
		var originalHeight = 800;

        if ($('#lightbox .front img').attr('data-width')) {
			originalWidth = $('#lightbox .front img').attr('data-width');
		}

		if ($('#lightbox .front img').attr('data-height')) {
			originalHeight = $('#lightbox .front img').attr('data-height');
		}

        var safeWidth = $(document).width() - 40;
        var safeHeight = $(document).height() - 40;

        var scaleWidth = safeWidth / originalWidth;
        var scaleHeight = safeHeight / originalHeight;
        var scale;
        if (scaleWidth < scaleHeight) {
            scale = scaleWidth;
        } else {
            scale = scaleHeight;
        }


        if (scale >= 1) {
            $('.flip-container, .front, .back').css('width', originalWidth);
            $('.flip-container, .front, .back').css('height', originalHeight);
        } else {
            $('.flip-container, .front, .back').css('width', originalWidth * scale);
            $('.flip-container, .front, .back').css('height', originalHeight * scale - 1);
        }
    }
}

function closeLightbox() {
    $('#lightbox .flipper').css( "-webkit-transform","rotateY(90deg)" );
    $('#lightbox .flipper').css( "-moz-transform","rotateY(90deg)" );
    $('#lightbox .flipper').css( "transform","rotateY(90deg)" );
    $('#lightbox').fadeOut();
}

function confirmDelete() {
    var agree = confirm("Are you sure you wish to delete this asset?");
    if (agree)
        return true ;
    else
        return false ;
}