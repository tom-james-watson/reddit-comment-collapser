const settings = {
    animationTimeInMs: 250
};

let collapsedHeight;

function injectCSS() {
    // Create URLs for local files without hardcoding chrome-extension URL scheme
    const styleEl = document.createElement("style");
    const colorsPath = chrome.runtime.getURL("image/colours");

    // Find a comment to base sizes on
    let testComment = document.querySelector(`
            .commentarea > .sitetable > .comment:not(.deleted),
            .commentarea > .sitetable > #listings > .comment:not(.deleted)`);

    let midcol = testComment.querySelector(".midcol");

    // Computed styles for exact sizes
    let testCommentStyle = window.getComputedStyle(testComment);
    let midcolStyle = window.getComputedStyle(midcol);

    let testCommentPaddingTop = parseInt(testCommentStyle.paddingTop);

    // Padding from the containing comment
    let testCommentPaddingHeight =
            testCommentPaddingTop +
            parseInt(testCommentStyle.paddingBottom);

    // Height and margin of the voting buttons
    let midcolHeight =
            parseInt(midcolStyle.marginTop) +
            parseInt(midcolStyle.marginBottom) +
            midcol.getBoundingClientRect().height;

    let offsetHeight = midcolHeight + testCommentPaddingHeight;


    let expand = testComment.querySelector(".tagline > .expand");

    // Toggle comment to get the collapsed size
    expand.click();

    // Get size of collapsed comments
    collapsedHeight =
            parseInt(testCommentStyle.height) +
            parseInt(testCommentStyle.paddingTop) +
            parseInt(testCommentStyle.paddingBottom);

    // Re-show comment without triggering a paint
    expand.click();


    styleEl.textContent = `
        .depth-1 {
            background-image: url('${colorsPath}/red.png');
        }
        .depth-2 {
            background-image: url('${colorsPath}/orange.png');
        }
        .depth-3 {
            background-image: url('${colorsPath}/dark_green.png');
        }
        .depth-4 {
            background-image: url('${colorsPath}/blue.png');
        }
        .depth-5 {
            background-image: url('${colorsPath}/navy.png');
        }
        .depth-6 {
            background-image: url('${colorsPath}/brown.png');
        }
        .depth-7 {
            background-image: url('${colorsPath}/army.png');
        }
        .depth-8 {
            background-image: url('${colorsPath}/green.png');
        }
        .depth-9 {
            background-image: url('${colorsPath}/pink.png');
        }

        .collapser {
            width: 15px;
            height: calc(100% - ${offsetHeight}px);
        }
        .comment.deleted > .midcol > .collapser {
            height: calc(100% - ${testCommentPaddingHeight}px);
            top: ${testCommentPaddingTop}px;
        }

        .comment {
            overflow: hidden !important;
            transition: height ${settings.animationTimeInMs}ms ease;
        }
    `;

    document.head.appendChild(styleEl);
}

function makeCollapser(depth) {
    let collapser = document.createElement('div');
    collapser.className = `collapser depth-${depth}`;
    collapser.addEventListener('click', toggleCollapse);

    return collapser;
}

function addCollapser(comment) {
    let childCount = comment.querySelectorAll(':scope > .child .comment').length;
    if (childCount === 0) return;

    let depth = 0;
    let currentComment = comment;

    while (currentComment !== null) {
        if (currentComment.matches(".comment")) {
            depth++;
        }

        currentComment = currentComment.parentElement;
    }

    let midcol = comment.querySelector('.midcol');
    let collapser = makeCollapser(depth);

    midcol.appendChild(collapser);
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
    comment.querySelector(".expand").click();
}

function collapse(comment) {
    let parentComment = comment.querySelector(':scope > .entry')
    let rect = parentComment.getBoundingClientRect();

    // If top of comment is out of viewport, scroll to it
    if (rect.top < 0) {
        const padding = 10;
        let scrollPosition = (window.scrollY + rect.top) - padding;

        try {
            // Try and use browser's smooth scrolling if available
            window.scroll({
                top: scrollPosition,
                behavior: "smooth"
            });
        } catch (e) {
            // Fallback
            smoothScroll(scrollPosition);
        }
    }

    // Set the height to a fixed value in order to animate it later
    comment.style.height = window.getComputedStyle(comment).height;

    // Timeout of 0ms to trigger transition
    setTimeout(function() {
        comment.style.height = `${collapsedHeight}px`;

        comment.addEventListener("transitionend", function onTransitionEnd() {
            comment.querySelector(".expand").click();

            comment.style.height = "";
            comment.removeEventListener("transitionend", onTransitionEnd);
        });
    }, 0);
}

// Based on: https://github.com/alicelieutier/smoothScroll
function smoothScroll(destination) {
    function getComputedPosition (startScroll, destination, elapsed) {
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

    window.requestAnimationFrame(function step () {
        let elapsed = Date.now() - startTime;

        window.scroll(window.scrollX, getComputedPosition(startScroll, destination, elapsed));

        if (elapsed <= settings.animationTimeInMs) {
            window.requestAnimationFrame(step);
        }
    });
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


injectCSS();

// Add a collapser div to every non-deleted comment
let comments = document.querySelectorAll('.comment');

for (let comment of comments) {
    if (!comment) break;

    addCollapser(comment);
}
