const settings = {
    animationTimeInMs: 250,
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

// Create URLs for local files without hardcoding chrome-extension URL scheme
const styleEl = document.createElement("style");
const colorsPath = chrome.runtime.getURL("image/colours");

styleEl.textContent = `
    .army {
        background-image: url('${colorsPath}/army.png');
    }
    .blue {
        background-image: url('${colorsPath}/blue.png');
    }
    .brown {
        background-image: url('${colorsPath}/brown.png');
    }
    .green {
        background-image: url('${colorsPath}/green.png');
    }
    .lilac {
        background-image: url('${colorsPath}/lilac.png');
    }
    .navy {
        background-image: url('${colorsPath}/navy.png');
    }
    .orange {
        background-image: url('${colorsPath}/orange.png');
    }
    .pink {
        background-image: url('${colorsPath}/pink.png');
    }
    .red {
        background-image: url('${colorsPath}/red.png');
    }
    .dark_green {
        background-image: url('${colorsPath}/dark_green.png');
    }
`;

document.head.appendChild(styleEl);

function makeCollapser(color, width, height) {
    let collapser = document.createElement('div');
    collapser.className = `collapser ${color}`;
    collapser.setAttribute(
        'style',
        `width: ${width}px; height: calc(100% - ${height}px);`
    );

    collapser.addEventListener('click', toggleCollapse);

    return collapser;
}

function makeExpander(collapsed) {
    let expander = document.createElement('a');
    expander.href = 'javascript:void(0)';
    expander.className = 'expander';
    let expanderText = document.createTextNode(collapsed ? '[+]' : '[-]');
    expander.appendChild(expanderText);

    expander.addEventListener('click', toggleCollapse);

    return expander;
};

function addCollapser(comment) {
    let numChildComments = comment.querySelectorAll(
        ':scope > .child .comment'
    ).length;

    if (numChildComments === 0) {
        return;
    }

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

    let nativeExpander = comment.querySelector(
        ':scope > .entry .tagline .expand'
    );
    if (nativeExpander) {
        nativeExpander.remove();
    }
}

function toggleCollapse(e) {
    let comment = e.target.closest('.comment');

    if (comment.classList.contains('collapsed')) {
        uncollapse(comment);
    } else {
        collapse(comment);
    }
}

function uncollapse(comment) {
    comment.querySelector('.child').style.display = 'block';
    comment.querySelector('.midcol').style.display = 'block';
    comment.classList.remove('collapsed');
    comment.classList.add('noncollapsed');
    comment.querySelector('.expander').innerHTML = '[-]';
}

function collapse(commentTree) {
    let parentComment = commentTree.querySelector(':scope > .entry')

    if (!elementInViewport(parentComment)) {
        smoothScroll(parentComment.offsetParent.offsetTop - 10);
    }

    // Set the height to a fixed value in order to animate it later
    let elementToHide = commentTree.querySelector('.child');
    elementToHide.style.overflow = 'hidden';
    elementToHide.style.transition = `height ${settings.animationTimeInMs}ms`;
    elementToHide.style.height = `${elementToHide.offsetHeight}px`;

    // Delay start of animation, otherwise the above properties may not have
    // been set yet
    setTimeout(function() {
        elementToHide.style.height = '0';

        setTimeout(function () {
            commentTree.querySelector('.midcol').style.display = 'none';
            commentTree.querySelector('.expander').innerHTML = '[+]';
            commentTree.classList.remove('noncollapsed');
            commentTree.classList.add('collapsed');
        }, settings.animationTimeInMs - 100);

        setTimeout(function () {
            elementToHide.style.display = 'none';
            elementToHide.style.height = 'auto'; // prevent animation on uncollapse
        }, settings.animationTimeInMs);
    }, 50);
}

// Based on: https://github.com/alicelieutier/smoothScroll
function smoothScroll(destination) {
    let getComputedPosition = function (startScroll, destination, elapsed) {
        if (elapsed > settings.animationTimeInMs) {
            return destination;
        } else {
            return (
                startScroll + (destination - startScroll) *
                (elapsed / settings.animationTimeInMs)
            );
        }
    };

    let startScroll = window.scrollY;
    let startTime = Date.now();

    let step = function () {
        let elapsed = Date.now() - startTime;

        scroll(0, getComputedPosition(startScroll, destination, elapsed));

        if (elapsed <= settings.animationTimeInMs) {
            window.requestAnimationFrame(step);
        }
    };

    step();
}

function elementInViewport(el) {
    let rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth &&
        rect.bottom <= window.innerHeight
    );
}

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

function createCollapsers() {
    let comment = comments.pop();

    if (!comment) {
        return false;
    }

    addCollapser(comment);

    window.requestAnimationFrame(function () {
        createCollapsers();
    });
}

createCollapsers();
