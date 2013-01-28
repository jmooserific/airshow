function resizeLightbox() {
    if ($('#lightbox .front img') && $('#lightbox .front img').attr('data-width') && $('#lightbox .front img').attr('data-width') && $('#lightbox').is(':visible')) {
        var originalWidth = $('#lightbox .front img').attr('data-width');
        var originalHeight = $('#lightbox .front img').attr('data-height');
        
        var safeWidth = $(document).width() - 100;
        var safeHeight = $(document).height() - 100;

        var scaleWidth = originalWidth / safeWidth;
        var scaleHeight = originalHeight / safeHeight;
                    
        if (scaleWidth > scaleHeight) {
            $('.flip-container, .front, .back').width(originalWidth / scaleWidth);
            $('.flip-container, .front, .back').height(originalHeight / scaleWidth);
        } else {
            $('.flip-container, .front, .back').width(originalWidth / scaleHeight);
            $('.flip-container, .front, .back').height(originalHeight / scaleHeight);
        }
    }
}