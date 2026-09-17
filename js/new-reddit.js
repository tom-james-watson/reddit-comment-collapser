const COMMENT_PADDING = 7;

function commentOffset() {
  const header = document.querySelector('header, [role="banner"]');

  if (!header) {
    return COMMENT_PADDING;
  }

  const headerBottom = header.getBoundingClientRect().bottom;

  if (headerBottom <= 0 || headerBottom >= window.innerHeight / 2) {
    return COMMENT_PADDING;
  }

  return headerBottom + COMMENT_PADDING;
}

window.addEventListener('toggle', function(event) {
  const comment = event.target;

  if (
    !(comment instanceof Element) ||
    !comment.matches('shreddit-comment > details[role="article"]') ||
    comment.open
  ) {
    return;
  }

  const offset = commentOffset();

  if (comment.getBoundingClientRect().top >= offset) {
    return;
  }

  chrome.storage.sync.get({ collapseAnimation: true }, function(items) {
    if (!comment.isConnected || comment.open) {
      return;
    }

    const top = window.scrollY + comment.getBoundingClientRect().top - offset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: items.collapseAnimation ? 'smooth' : 'instant'
    });
  });
}, true);
