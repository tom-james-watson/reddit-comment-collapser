let colors = [
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

function make_collapser(color, width, height) {
  let collapser = document.createElement('div')
  collapser.className = `collapser ${color}`
  collapser.setAttribute('style', `width: ${width}; height: calc(100% - ${height}px);`)

  collapser.addEventListener('click', function(e) {
    toggle_collapse(e)
  })

  return collapser
}

function make_expander() {
  let expander = document.createElement('a')
  expander.href = 'javascript:void(0)'
  expander.className = 'expander'
  let expanderText = document.createTextNode('[-]')
  expander.appendChild(expanderText)

  expander.addEventListener('click', function(e) {
    toggle_collapse(e)
  })

  return expander
}

function add_collapser(comment) {
  let depth = 0
  let anchorEl
  let color
  let collapser
  let expander
  let tagline
  let width
  let height

  let num_child_comments = comment.querySelectorAll(':scope > .child .comment').length

  if (num_child_comments > 0) {
    let currentComment = comment

    while (currentComment.closest('.comment') !== null) {
      depth++
      currentComment = currentComment.parentNode
    }

    color = colors[depth % 10]

    if (comment.classList.contains('deleted')) anchorEl = comment.querySelector('.entry')
    else anchorEl = comment.querySelector('.midcol')

    if (comment.classList.contains('deleted')) width = '10px'
    else width = `${anchorEl.offsetWidth}px`

    height = anchorEl.offsetHeight

    collapser = make_collapser(color, width, height)
    anchorEl.appendChild(collapser)

    expander = make_expander()
    tagline = comment.querySelector(':scope > .entry .tagline')
    tagline.insertBefore(expander, tagline.firstChild)

    let toRemoveEl = comment.querySelector(':scope > .entry .tagline .expand')

    if (!toRemoveEl) return

    toRemoveEl.remove()
  }
}

function toggle_collapse(e) {
  let comment = e.target.closest('.comment')

  if (comment.classList.contains('collapsed')) uncollapse(comment)
  else collapse(comment)
}

function uncollapse(comment) {
  comment.querySelector('.child').style.display = 'block'
  comment.querySelector('.midcol').style.display = 'block'
  comment.classList.remove('collapsed')
  comment.classList.add('noncollapsed')
  comment.querySelector('.expander').innerHTML = '[-]'
}

function collapse(comment) {
  if (!elementInViewport(comment)) {
    // Padding is so that the scroll position isn't directly on the edge of the collapsed comment
    let padding = 10
    let distanceFromTop = 0
    let commentContext = comment
    if (commentContext.offsetParent) {
      do {
        distanceFromTop += commentContext.offsetTop
        commentContext = commentContext.offsetParent
      } while (commentContext)
    }

    window.scrollTo(0, distanceFromTop - padding)
  }

  // TODO This is where the jQuery .hide(300) animation was before
  comment.querySelector('.child').style.display = 'none'

  window.setTimeout(function() {
    comment.querySelector('.midcol').style.display = 'none'
    comment.querySelector('.expander').innerHTML = '[+]'
    comment.classList.remove('noncollapsed')
    comment.classList.add('collapsed')
  }, 0) // TODO Previously set to 200, probably related to the (300) animation above
}

// Test whether a given element is visible in the viewport
function elementInViewport(el) {
  let rect = el.getBoundingClientRect()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
  )
}

// Watch for any new comments that are loaded and add collapsers to them too
let observer = new MutationObserver(function(mutations) {
  let once = false

  mutations.forEach(function(mutation) {
    // Only continue if mutation is to tree of nodes
    if (mutation.type !== 'childList') return

    Array.from(mutation.addedNodes).forEach(function(node) {
      // Only continue if node is an element
      if (node.nodeType !== 1) return

      if (node.classList.contains('comment')) {
        if (!once) {
          once = true

          add_collapser(node.parentNode.parentNode.parentNode)
        }

        add_collapser(node)
      }
    })
  })
})

observer.observe(document, {
  subtree: true,
  childList: true
})

// Add a collapser div to every non-deleted comment
let comments = Array.from(document.querySelectorAll('.comment')).reverse()

function create_collapsers() {
  let comment = comments.pop()

  if (!comment) return false

  add_collapser(comment)

  requestAnimationFrame(function() {
    create_collapsers()
  })
}

create_collapsers()
