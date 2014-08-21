
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
    var expander;

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

        expander = $('<a href="javascript:void(0)" class="expander">[–]</a>');
        $(this).find('> .entry .tagline').prepend(expander);

		collapser.click(toggle_collapse);
        expander.click(toggle_collapse);
	}

    $(this).find('> .entry .tagline .expand').remove();

}

function toggle_collapse(event) {

	var comment = $($(this).parents('.comment')[0]);

    if (comment.hasClass('collapsed')) {
        comment.children('.child').show(300);
        comment.children('.midcol').show();
        comment.removeClass('collapsed');
        comment.addClass('noncollapsed');
        comment.find('.expander').html('[–]');
    }
    else {
        comment.children('.child').hide(300);
        comment.children('.midcol').hide();
        window.setTimeout(function() {
            comment.find('.expander').html('[+]');
            comment.removeClass('noncollapsed');
            comment.addClass('collapsed');
        }, 300);

        if (!elementInViewport(comment)) {	
            $('html, body').animate({
                scrollTop: comment.offset().top
            }, 300);
        }
    }
}

// Test whether a given element is visible in the viewport
function elementInViewport(element) {
	var top    = element.offset().top;

	return (top > window.pageYOffset);
}
