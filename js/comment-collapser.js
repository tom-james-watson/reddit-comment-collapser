
var colours = [
    'blue',
    'red',
    'green',
    'navy',
    'orange',
    'pink',
    'brown',
    'dark_green',
    'lilac',
    'army',
];


MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations) {
    var once = false;
    $.each(mutations, function(index, mutation) {
        if (mutation.type === 'childList') {
            $.each(mutation.addedNodes, function(index, node) {
                if ($(node).hasClass('comment')) {
                    console.log(once);
                    if (!once) {
                        once = true;
                        add_collapsers.bind($(node.parentNode.parentNode.parentNode))();
                    }
                    add_collapsers.bind($(node))();
                }
            });
        }
    });
});

observer.observe(document, {
    subtree: true,
    childList: true
});


// Add a collapser div to every non-deleted comment
$('.comment').each(add_collapsers);
$(document).ajaxSuccess(add_collapsers);

function add_collapsers() {

	var collapser;
    var anchor;

    if ($(this).hasClass('deleted')) {
        anchor = $(this).children('.entry');
    } else {
        anchor = $(this).children('.midcol');
    }

	var num_child_comments = $(this).find('> .child .comment').length;
    var depth = $(this).parents('.comment').length;
    var colour = colours[depth % 10];

	if (num_child_comments > 0) {

        var width;

        if ($(this).hasClass('deleted')) {
            width = '10px';
        } else {
            width = anchor.width();
        }

		collapser = $('<div class="collapser ' + colour + '"></div>');
		collapser.css({
			'height' : '-webkit-calc(100% - ' + anchor.height() + 'px)',
			'width'  : width
		});

		anchor.append(collapser);

		collapser.click(collapse_comment);
	}
}

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
}

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
