// Saves options to chrome.storage.sync.
function save_options() {

  var style = document.getElementById('style').value;
  var collapseAnimation = document.getElementById('collapseAnimation').checked;

  chrome.storage.sync.set({
    style: style,
    collapseAnimation: collapseAnimation
  }, function() {

    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);

  });

}

function restore_options() {

  chrome.storage.sync.get({
    style: 'minimalist',
    collapseAnimation: true
  }, function(items) {

    document.getElementById('style').value = items.style;
    document.getElementById('collapseAnimation').checked = items.collapseAnimation;

  });

}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
