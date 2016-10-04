const colors = [
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

const makeCollapser = (color, width, height) => {
  let collapser = document.createElement('div')
  collapser.className = `collapser ${color}`
  collapser.setAttribute('style', `width: ${width}; height: calc(100% - ${height}px);`)

  collapser.addEventListener('click', e => {
    toggleCollapse(e)
  })

  return collapser
}

const makeExpander = () => {
  let expander = document.createElement('a')
  expander.href = 'javascript:void(0)'
  expander.className = 'expander'
  const expanderText = document.createTextNode('[-]')
  expander.appendChild(expanderText)

  expander.addEventListener('click', e => {
    toggleCollapse(e)
  })

  return expander
}

const addCollapser = comment => {
  const numChildComments = comment.querySelectorAll(':scope > .child .comment').length

  if (numChildComments === 0) return

  let depth = 0
  let currentComment = comment

  while (currentComment.closest('.comment') !== null) {
    depth++
    currentComment = currentComment.parentNode
  }

  const anchorEl = comment.classList.contains('deleted') ? comment.querySelector('.entry') : comment.querySelector('.midcol')

  const color = colors[depth % 10]
  const width = comment.classList.contains('deleted') ? '10px' : `${anchorEl.offsetWidth}px`
  const height = anchorEl.offsetHeight

  const collapser = makeCollapser(color, width, height)
  anchorEl.appendChild(collapser)

  const tagline = comment.querySelector(':scope > .entry .tagline')
  const expander = makeExpander()
  tagline.insertBefore(expander, tagline.firstChild)

  const toRemoveEl = comment.querySelector(':scope > .entry .tagline .expand')

  if (toRemoveEl) toRemoveEl.remove()
}

const toggleCollapse = e => {
  const comment = e.target.closest('.comment')

  if (comment.classList.contains('collapsed')) uncollapse(comment)
  else collapse(comment)
}

const uncollapse = comment => {
  comment.querySelector('.child').style.display = 'block'
  comment.querySelector('.midcol').style.display = 'block'
  comment.classList.remove('collapsed')
  comment.classList.add('noncollapsed')
  comment.querySelector('.expander').innerHTML = '[-]'
}

const collapse = comment => {
  if (!elementInViewport(comment)) {
    // Padding is so that the scroll position isn't directly on the edge of the collapsed comment
    const padding = 10
    let distanceFromTop = 0
    let commentContext = comment
    if (commentContext.offsetParent) {
      do {
        distanceFromTop += commentContext.offsetTop
        commentContext = commentContext.offsetParent
      } while (commentContext)
    }

    smoothScroll(distanceFromTop - padding)
  }

  // Set the height to a fixed value in order to animate it later
  const childToHide = comment.querySelector('.child')
  const animationTimeInMs = 300
  childToHide.style.overflow = 'hidden'
  childToHide.style.transition = `height ${animationTimeInMs.toString()}ms`
  childToHide.style.height = `${childToHide.offsetHeight}px`

  // This will now trigger the animated hide
  // Waiting a moment first to hopefully ensure that the above properties are
  // applied
  setTimeout(() => {
    childToHide.style.height = '0'

    // Not using the transitionstart and transitionend events here as they
    // refused to work, except when changing the CSS property value in the
    // Chrome dev tools...

    // This looks better if it happens before the animation is complete
    setTimeout(() => {
      comment.querySelector('.midcol').style.display = 'none'
      comment.querySelector('.expander').innerHTML = '[+]'
      comment.classList.remove('noncollapsed')
      comment.classList.add('collapsed')
    }, animationTimeInMs - 100)

    setTimeout(() => {
      childToHide.style.display = 'none'
      childToHide.style.height = 'auto' // For future (un)collapsing of this element
    }, animationTimeInMs)
  }, 50)
}

// Based on: https://github.com/alicelieutier/smoothScroll
const smoothScroll = destination => {
  const smoothScrollPosition = (start, destination, elapsed, animationTimeInMs) => {
    // Cubic easing algorithm
    const easeInOutCubic = t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1

    // If you want linear, simply take out the easeInOutCubic call and replace it with: (elapsed / animationTimeInMs)
    return elapsed > animationTimeInMs ? destination : start + (destination - start) * easeInOutCubic(elapsed / animationTimeInMs)
  }

  const animationTimeInMs = 500
  const start = window.scrollY
  const clock = Date.now()

  const requestAnimationFrame = window.requestAnimationFrame

  const step = () => {
    const elapsed = Date.now() - clock

    window.scroll(0, smoothScrollPosition(start, destination, elapsed, animationTimeInMs))

    if (elapsed <= animationTimeInMs) requestAnimationFrame(step)
  }

  step()
}

// Test whether a given element is visible in the viewport
const elementInViewport = el => {
  const rect = el.getBoundingClientRect()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
  )
}

// Watch for any new comments that are loaded and add collapsers to them too
let observer = new MutationObserver(mutations => {
  let once = false

  mutations.forEach(mutation => {
    // Only continue if mutation is to tree of nodes
    if (mutation.type !== 'childList') return

    Array.from(mutation.addedNodes).forEach(node => {
      // Only continue if node is an element
      if (node.nodeType !== 1 || !node.classList.contains('comment')) return

      if (!once) {
        once = true

        addCollapser(node.parentNode.parentNode.parentNode)
      }

      addCollapser(node)
    })
  })
})

observer.observe(document, {
  subtree: true,
  childList: true
})

// Add a collapser div to every non-deleted comment
let comments = Array.from(document.querySelectorAll('.comment')).reverse()

const createCollapsers = () => {
  const comment = comments.pop()

  if (!comment) return false

  addCollapser(comment)

  requestAnimationFrame(() => {
    createCollapsers()
  })
}

createCollapsers()
