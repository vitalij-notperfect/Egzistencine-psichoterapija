(function ($) {
	"use strict";

	let linkSelector = 'a';
	let isMobile = false;
	const cursorHolder = $('#circularcursor');
	const cussorHeight = 8;

	$(document).ready(function () {
		detectMobileDevide();
	});

	$(document).on('mousemove', function(e) {
		if ( ! isMobile ) {
			cursorHolder.css({
				left: e.clientX,
				top: e.clientY
			});
		}
	});

	$(document).on('mouseenter', linkSelector, function(e) {
		if ( ! isMobile ) {
			cursorHolder.animate( { 'width': 2 * cussorHeight + 'px', 'height': 2 * cussorHeight + 'px' }, 100 );
		}
	});

	$(document).on('mouseleave', linkSelector, function(e) {
		if ( ! isMobile ) {
			cursorHolder.animate( { 'width': cussorHeight + 'px', 'height': cussorHeight + 'px' }, 100 );
		}
	});

	/**
	 * Detect mobile device
	 */
	const detectMobileDevide = () => {
		// device detection
		

		if( /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()) ) { 
			isMobile = true;

			// Hide custom cursor on mobile
			cursorHolder.css({'display':'none'});

			// If is mobile then add class to body
			$('body').addClass('is_mobile');
		}
	}

})(jQuery);
