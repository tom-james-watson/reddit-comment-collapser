function injectCSS() {
  const styleEl = document.createElement("style");

  styleEl.textContent = `
    :root .comment,
    :root .comment .comment,
    :root .comment .comment .comment,
    :root .comment .comment .comment .comment,
    :root .comment .comment .comment .comment .comment,
    :root .comment .comment .comment .comment .comment .comment,
    :root .comment .comment .comment .comment .comment .comment .comment,
    :root .comment .comment .comment .comment .comment .comment .comment .comment,
    :root .comment .comment .comment .comment .comment .comment .comment .comment .comment,
    :root.res.res-commentBoxes .comment,
    :root.res.res-commentBoxes .comment .comment,
    :root.res.res-commentBoxes .comment .comment .comment,
    :root.res.res-commentBoxes .comment .comment .comment .comment,
    :root.res.res-commentBoxes .comment .comment .comment .comment .comment,
    :root.res.res-commentBoxes .comment .comment .comment .comment .comment .comment,
    :root.res.res-commentBoxes .comment .comment .comment .comment .comment .comment .comment,
    :root.res.res-commentBoxes .comment .comment .comment .comment .comment .comment .comment .comment,
    :root.res.res-commentBoxes .comment .comment .comment .comment .comment .comment .comment .comment .comment,
    :root.res.res.res-commentBoxes .commentarea .sitetable > .comment,
    :root.res.res.res-commentBoxes .commentarea .sitetable > .comment .comment,
    .res .commentarea .thing {
      margin-left: initial !important;
      padding-left: 20px !important;
      position: relative !important;
    }

    .comment .midcol {
      left: initial !important;
    }

    .comment .midcol,
    .comment .arrow,
    .comment .entry,
    .comment .tagline,
    .comment .child {
      margin-left: initial !important;
      padding-left: initial !important;
    }

    :root .comment .expand {
      all: initial !important;
      background-color: rgba(255, 255, 0, 0.05) !important;
      border: none !important;
      border-left: 1px solid rgba(0, 0, 0, 0.1) !important;
      border-radius: initial !important;
      height: 100% !important;
      left: 0 !important;
      font-size: 10px !important;
      margin: initial !important;
      padding: initial !important;
      position: absolute !important;
      top: 0 !important;
      width: 15px !important;
      text-align: center !important;
      transition: initial !important;
    }

    :root .comment .expand:hover {
      background-color: rgba(255, 255, 0, 0.3) !important;
      text-decoration: initial !important;
    }

    .res-nightmode .comment .expand {
      color: #DDDDDD !important;
    }

    .expand::before,
    .expand::after {
      content: initial !important;
    }
  `;

  document.documentElement.appendChild(styleEl);
}

// Based on: https://github.com/alicelieutier/smoothScroll
function smoothScroll(destination) {
  let duration = 250;

  function getComputedPosition (startScroll, destination, elapsed) {
    if (elapsed > duration) {
      return destination;
    } else {
      return (
        startScroll + (destination - startScroll) *
        (elapsed / duration)
      );
    }
  }

  let startScroll = window.scrollY;
  let startTime = Date.now();

  window.requestAnimationFrame(function step () {
    let elapsed = Date.now() - startTime;

    window.scroll(window.scrollX, getComputedPosition(startScroll, destination, elapsed));

    if (elapsed <= duration) {
      window.requestAnimationFrame(step);
    }
  });
}

injectCSS();

window.addEventListener("click", function (ev) {
  // Only trigger for expando clicks
  if (!ev.target.matches(".expand")) return;

  let comment = ev.target.closest(".comment");
  let rect = comment.getBoundingClientRect();

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
});
