
// Add a collapser div to every non-deleted comment
$('.comment:not(.deleted)').each(function(index) {

	var collapser;
	var midcol = $(this).children('.midcol');
	var num_child_comments = $(this).find('> .child .comment').length;

	if (num_child_comments > 0) {

		collapser = $('<div class="collapser"></div>');
		collapser.css({
			'height' : '-webkit-calc(100% - ' + midcol.height() + 'px)',
			'width'  : midcol.width()
		});

		midcol.append(collapser);

		collapser.click(collapse_comment);
	};
});

// Collapse a comment and all of it's children when a collapser is clicked
function collapse_comment(event) {

	var comment = $(this).parent().parent();
	var collapsed = comment.find('> .entry .collapsed');
	var noncollapsed = comment.find('> .entry .noncollapsed');

	noncollapsed.hide(300);
	comment.children('.child').hide(300);
	comment.children('.midcol').hide();

	collapsed.show();

	if (!elementInViewport(collapsed[0])) {	
		$('html, body').animate({
			scrollTop: collapsed.offset().top
		}, 300);
	}
};

// Test whether a given element is visible in the viewport
function elementInViewport(element) {
	var top    = element.offsetTop;
	var left   = element.offsetLeft;
	var width  = element.offsetWidth;
	var height = element.offsetHeight;

	while(element.offsetParent) {
		element = element.offsetParent;
		top    += element.offsetTop;
		left   += element.offsetLeft;
	}

	return (
		top  >= window.pageYOffset &&
		left >= window.pageXOffset &&
		(top  + height) <= (window.pageYOffset + window.innerHeight) &&
		(left + width)  <= (window.pageXOffset + window.innerWidth)
	);
}
