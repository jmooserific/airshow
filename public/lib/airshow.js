function showLightbox() {
    $('#lightbox .flipper').css( "-webkit-transform","rotateY(-90deg)" );
    $('#lightbox .flipper').css( "-moz-transform","rotateY(-90deg)" );
    $('#lightbox .flipper').css( "transform","rotateY(-90deg)" );
    
    $('#lightbox').fadeIn();
    
    $('#lightbox .flipper').css( "-webkit-transform","rotateY(0deg)" );
    $('#lightbox .flipper').css( "-moz-transform","rotateY(0deg)" );
    $('#lightbox .flipper').css( "transform","rotateY(0deg)" );
    
    resizeElements();
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
    if ($('#lightbox .front img') && $('#lightbox .front img').attr('data-width') && $('#lightbox .front img').attr('data-width') && $('#lightbox').is(':visible')) {
        var originalWidth = $('#lightbox .front img').attr('data-width');
        var originalHeight = $('#lightbox .front img').attr('data-height');
        
        var safeWidth = $(document).width() - 40;
        var safeHeight = $(document).height() - 40;

        var scaleWidth = originalWidth / safeWidth;
        var scaleHeight = originalHeight / safeHeight;
        
        if (originalWidth / scaleWidth >= originalWidth && originalHeight / scaleHeight >= originalHeight) {
            $('.flip-container, .front, .back').width(originalWidth);
            $('.flip-container, .front, .back').height(originalHeight);
        } else {
            if (scaleWidth > scaleHeight) {
                $('.flip-container, .front, .back').width(originalWidth / scaleWidth);
                $('.flip-container, .front, .back').height(originalHeight / scaleWidth);
            } else {
                $('.flip-container, .front, .back').width(originalWidth / scaleHeight);
                $('.flip-container, .front, .back').height(originalHeight / scaleHeight - 1);
            }
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