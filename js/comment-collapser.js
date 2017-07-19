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
