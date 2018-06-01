/**
 * JavaScript 'polyfill' for HTML5's <details> and <summary> elements
 * and 'shim' to add accessiblity enhancements for all browsers
 *
 * http://caniuse.com/#feat=details
 *
 * Usage instructions:
 * the 'polyfill' will be automatically initialised
 */
import '../../vendor/polyfills/Function/prototype/bind'
import '../../vendor/polyfills/Event' // addEventListener and event.target normaliziation
import { generateUniqueID } from '../../common.js'

function Details ($module) {
  // Default to applying this to everything in the document if no $module specified.
  this.$module = $module

  this.KEY_ENTER = 13
  this.KEY_SPACE = 32

  // Create a flag to know if the browser supports navtive details
  this.NATIVE_DETAILS = typeof document.createElement('details').open === 'boolean'
}

/**
* Initialise the script on a list of details elements in a container
*/
Details.prototype.init = function () {
  var $module = this.$module

  // If no details then we don't need to bother with the rest of the scripting
  if ($module.length === 0) {
    return
  }

  // Save shortcuts to the inner summary and content elements
  this.$summary = $module.getElementsByTagName('summary').item(0)
  this.$content = $module.getElementsByTagName('div').item(0)

  // If <details> doesn't have a <summary> and a <div> representing the content
  // it means the required HTML structure is not met so the script will stop
  if (!this.$summary || !this.$content) {
    return
  }

  // If the content doesn't have an ID, assign it one now
  // which we'll need for the summary's aria-controls assignment
  if (!this.$content.id) {
    this.$content.id = 'details-content-' + generateUniqueID()
  }

  // Add ARIA role="group" to details
  $module.setAttribute('role', 'group')

  // Add role=button to summary
  this.$summary.setAttribute('role', 'button')

  // Add aria-controls
  this.$summary.setAttribute('aria-controls', this.$content.id)

  // Set tabIndex so the summary is keyboard accessible for non-native elements
  // http://www.saliences.com/browserBugs/tabIndex.html
  if (!this.NATIVE_DETAILS) {
    this.$summary.tabIndex = 0
  }

  // Detect initial open state
  var openAttr = $module.getAttribute('open') !== null
  if (openAttr === true) {
    this.$summary.setAttribute('aria-expanded', 'true')
    this.$content.setAttribute('aria-hidden', 'false')
  } else {
    this.$summary.setAttribute('aria-expanded', 'false')
    this.$content.setAttribute('aria-hidden', 'true')
    if (!this.NATIVE_DETAILS) {
      this.$content.style.display = 'none'
    }
  }

  // Bind an event to handle summary elements
  this.addInputHandlers($module, this.setAttributes.bind(this))
}

/**
* Handle cross-modal click events
* @param {object} node element
* @param {function} callback function
*/
Details.prototype.addInputHandlers = function (node, callback) {
  node.addEventListener('keypress', function (event) {
    // When the key gets pressed - check if it is enter or space
    if (event.keyCode === this.KEY_ENTER || event.keyCode === this.KEY_SPACE) {
      if (event.target === this.$summary) {
        // Prevent space from scrolling the page
        // and enter from submitting a form
        event.preventDefault()
        // Click to let the click event do all the necessary action
        if (event.target.click) {
          event.target.click()
        } else {
          // except Safari 5.1 and under don't support .click() here
          callback()
        }
      }
    }
  }.bind(this))

  // Prevent keyup to prevent clicking twice in Firefox when using space key
  node.addEventListener('keyup', function (event) {
    if (event.keyCode === this.KEY_SPACE) {
      if (event.target === this.$summary) {
        event.preventDefault()
      }
    }
  }.bind(this))

  node.addEventListener('click', callback)
}

/**
* Define a statechange function that updates aria-expanded and style.display
*/
Details.prototype.setAttributes = function () {
  var expanded = this.$summary.getAttribute('aria-expanded') === 'true'
  var hidden = this.$content.getAttribute('aria-hidden') === 'true'

  this.$summary.setAttribute('aria-expanded', (expanded ? 'false' : 'true'))
  this.$content.setAttribute('aria-hidden', (hidden ? 'false' : 'true'))

  if (!this.NATIVE_DETAILS) {
    this.$content.style.display = (expanded ? 'none' : '')

    var hasOpenAttr = this.$module.getAttribute('open') !== null
    if (!hasOpenAttr) {
      this.$module.setAttribute('open', 'open')
    } else {
      this.$module.removeAttribute('open')
    }
  }
  return true
}

/**
* Remove the click event from the node element
* @param {object} node element
*/
Details.prototype.destroy = function (node) {
  node.removeEventListener('keypress')
  node.removeEventListener('keyup')
  node.removeEventListener('click')
}

export default Details
