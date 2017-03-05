const settings = {
    animationTimeInMs: 250,
    animationType: 'linear', // Can be: 'linear' or 'ease'
    colors: [
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
    ]
};

const makeCollapser = function (color, width, height) {
    let collapser = document.createElement('div');
    collapser.className = `collapser ${color}`;
    collapser.setAttribute(
        'style',
        `width: ${width.toString()}px; height: calc(100% - ${height.toString()}px);`
    );

    collapser.addEventListener('click', toggleCollapse);

    return collapser;
};

const makeExpander = function (collapsed) {
    let expander = document.createElement('a');
    expander.href = 'javascript:void(0)';
    expander.className = 'expander';
    let expanderText = document.createTextNode(collapsed ? '[+]' : '[-]');
    expander.appendChild(expanderText);

    expander.addEventListener('click', toggleCollapse);

    return expander;
};

const addCollapser = function (comment) {
    let numChildComments = comment.querySelectorAll(':scope > .child .comment').length;

    if (numChildComments === 0) return;

    let isDeleted = comment.classList.contains('deleted');
    let isCollapsed = comment.classList.contains('collapsed');
    let depth = 0;
    let currentComment = comment;

    while (currentComment.closest('.comment') !== null) {
        depth++;
        currentComment = currentComment.parentNode;
    }

    let anchorEl = comment.querySelector('.midcol');

    let color = settings.colors[depth % 10];
    let width = anchorEl.offsetWidth;
    let height = isDeleted ? 30 : anchorEl.offsetHeight;

    let collapser = makeCollapser(color, width, height);
    anchorEl.appendChild(collapser);

    let tagline = comment.querySelector(':scope > .entry .tagline');
    let expander = makeExpander(isCollapsed);
    tagline.insertBefore(expander, tagline.firstChild);

    let toRemoveEl = comment.querySelector(':scope > .entry .tagline .expand');

    if (toRemoveEl) toRemoveEl.remove();
};

const toggleCollapse = function (e) {
    let comment = e.target.closest('.comment');

    if (comment.classList.contains('collapsed')) uncollapse(comment);
    else collapse(comment);
};

const uncollapse = function (comment) {
    comment.querySelector('.child').style.display = 'block';
    comment.querySelector('.midcol').style.display = 'block';
    comment.classList.remove('collapsed');
    comment.classList.add('noncollapsed');
    comment.querySelector('.expander').innerHTML = '[-]';
};

const collapse = function (commentTree) {
    let parentComment = commentTree.querySelector(':scope > .entry')

    // Only change scroll position if the parent comment is not entirely in
    // viewport
    if (!elementInViewport(parentComment)) {
        // Padding is so that the scroll position isn't directly on the edge of
        // the collapsed comment
        let padding = 10;
        let distanceFromTop = 0;
        let commentContext = commentTree;
        if (commentContext.offsetParent) {
            do {
                distanceFromTop += commentContext.offsetTop;
                commentContext = commentContext.offsetParent;
            } while (commentContext);
        }

        smoothScroll(distanceFromTop - padding);
    }

    // Set the height to a fixed value in order to animate it later
    let childToHide = commentTree.querySelector('.child');
    childToHide.style.overflow = 'hidden';
    childToHide.style.transition = `height ${settings.animationTimeInMs.toString()}ms`;
    childToHide.style.height = `${childToHide.offsetHeight.toString()}px`;

    // This will now trigger the animated hide
    // Waiting a moment first to hopefully ensure that the above properties are
    // applied
    setTimeout(function () {
        childToHide.style.height = '0';

        // Not using the transitionstart and transitionend events here as they
        // refused to work, except when changing the CSS property value in the
        // Chrome dev tools...

        // This looks better if it happens before the animation is complete
        setTimeout(function () {
            commentTree.querySelector('.midcol').style.display = 'none';
            commentTree.querySelector('.expander').innerHTML = '[+]';
            commentTree.classList.remove('noncollapsed');
            commentTree.classList.add('collapsed');
        }, settings.animationTimeInMs - 100);

        setTimeout(function () {
            childToHide.style.display = 'none';
            childToHide.style.height = 'auto'; // For future (un)collapsing of this element
        }, settings.animationTimeInMs);
    }, 50);
};

// Based on: https://github.com/alicelieutier/smoothScroll
const smoothScroll = function (destination) {
    let getComputedPosition = function (start, destination, elapsed) {
        // Cubic easing algorithm
        let easeInOutCubic = function (t) {
            return t < .5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
        };

        if (settings.animationType === 'ease') {
            return elapsed > settings.animationTimeInMs ? destination : start + (destination - start) * easeInOutCubic(elapsed / settings.animationTimeInMs);
        } else {
            // This will also be used for 'linear' option
            return elapsed > settings.animationTimeInMs ? destination : start + (destination - start) * (elapsed / settings.animationTimeInMs);
        }
    };

    let start = window.scrollY;
    let clock = Date.now();

    let requestAnimationFrame = window.requestAnimationFrame;

    let step = function () {
        let elapsed = Date.now() - clock;

        window.scroll(0, getComputedPosition(start, destination, elapsed));

        if (elapsed <= settings.animationTimeInMs) requestAnimationFrame(step);
    };

    step();
};

// Test whether a given element is visible in the viewport
const elementInViewport = function (el) {
    let rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth &&
        rect.bottom <= window.innerHeight
    );
};

// Watch for any new comments that are loaded and add collapsers to them too
let observer = new MutationObserver(function (mutations) {
    let once = false;

    mutations.forEach(function (mutation) {
      // Only continue if mutation is to tree of nodes
        if (mutation.type !== 'childList') return;

        Array.from(mutation.addedNodes).forEach(function (node) {
            // Only continue if node is an element
            if (node.nodeType !== 1 || !node.classList.contains('comment')) return;

            if (!once) {
                once = true;

                addCollapser(node.parentNode.parentNode.parentNode);
            }

            addCollapser(node);
        });
    });
});

observer.observe(document, {
    subtree: true,
    childList: true
});

// Add a collapser div to every non-deleted comment
let comments = Array.from(document.querySelectorAll('.comment')).reverse();

const createCollapsers = function () {
    let comment = comments.pop();

    if (!comment) return false;

    addCollapser(comment);

    requestAnimationFrame(function () {
        createCollapsers();
    });
};

createCollapsers();
