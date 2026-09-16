function injectRetroTheme() {
  // Create URLs for local files without hardcoding chrome-extension URL scheme
  const styleEl = document.createElement("style");
  const colorsPath = chrome.runtime.getURL("image/colours");

  styleEl.textContent = `
    :root body.rcc-retro div.sitetable div.comment.noncollapsed .expand:before {
      height: calc(100% - 20px) !important;
      background-image: url('${colorsPath}/red.png') !important;
    }
    :root body.rcc-retro div.sitetable div.comment.noncollapsed .comment .expand:before {
      background-image: url('${colorsPath}/orange.png') !important;
    }
    :root body.rcc-retro div.sitetable div.comment.noncollapsed .comment .comment .expand:before {
      background-image: url('${colorsPath}/dark_green.png') !important;
    }
    :root body.rcc-retro div.sitetable div.comment.noncollapsed .comment .comment .comment .expand:before {
      background-image: url('${colorsPath}/blue.png') !important;
    }
    :root body.rcc-retro div.sitetable div.comment.noncollapsed .comment .comment .comment .comment .expand:before {
      background-image: url('${colorsPath}/navy.png') !important;
    }
    :root body.rcc-retro div.sitetable div.comment.noncollapsed .comment .comment .comment .comment .comment .expand:before {
      background-image: url('${colorsPath}/brown.png') !important;
    }
    :root body.rcc-retro div.sitetable div.comment.noncollapsed .comment .comment .comment .comment .comment .comment .expand:before {
      background-image: url('${colorsPath}/army.png') !important;
    }
    :root body.rcc-retro div.sitetable div.comment.noncollapsed .comment .comment .comment .comment .comment .comment .comment .expand:before {
      background-image: url('${colorsPath}/green.png') !important;
    }
    :root body.rcc-retro div.sitetable div.comment.noncollapsed .comment .comment .comment .comment .comment .comment .comment .comment .expand:before {
      background-image: url('${colorsPath}/pink.png') !important;
    }
  `;

  document.head.appendChild(styleEl);
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


window.addEventListener("click", function (ev) {
  // Only trigger for expando clicks
  if (!ev.target.matches(".expand")) return;

  let comment = ev.target.closest(".comment");
  let rect = comment.getBoundingClientRect();

  chrome.storage.sync.get({
    collapseAnimation: true
  }, function(items) {

    // If top of comment is out of viewport, scroll to it
    if (rect.top < 0) {
      const padding = 10;
      let scrollPosition = (window.scrollY + rect.top) - padding;

      if (items.collapseAnimation) {

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

      } else {

        window.scrollTo(null, scrollPosition);

      }

    }
  });
});

document.addEventListener("DOMContentLoaded", function(event) {

  chrome.storage.sync.get({
    style: 'minimalist'
  }, function(items) {

    if (items.style === 'minimalist') {

      document.body.classList.add('rcc-minimalist');

    } else {

      document.body.classList.add('rcc-retro');
      injectRetroTheme();

    }

  });

});
