/**
 * Focus Management Utility for Enhanced Keyboard Navigation
 * 
 * This utility provides functions to improve keyboard navigation and focus management
 * across the application, following WCAG 2.1 guidelines.
 */

/**
 * Trap focus within a container (useful for modals, dropdowns)
 * @param {HTMLElement} container - Container element to trap focus within
 * @returns {Function} Cleanup function to remove focus trap
 */
export function trapFocus(container) {
  if (!container) return () => {};

  const focusableElements = container.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  // Focus first element initially
  if (firstFocusableElement) {
    firstFocusableElement.focus();
  }

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Restore focus to a previously focused element
 * @param {HTMLElement} element - Element to restore focus to
 */
export function restoreFocus(element) {
  if (element && typeof element.focus === 'function') {
    // Use setTimeout to ensure the element is ready to receive focus
    setTimeout(() => {
      element.focus();
    }, 0);
  }
}

/**
 * Save the currently focused element (useful before opening modals)
 * @returns {HTMLElement} Currently focused element
 */
export function saveFocus() {
  return document.activeElement;
}

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - Container to search within
 * @returns {NodeList} List of focusable elements
 */
export function getFocusableElements(container) {
  return container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
}

/**
 * Focus the first focusable element within a container
 * @param {HTMLElement} container - Container to search within
 * @returns {boolean} True if an element was focused, false otherwise
 */
export function focusFirstElement(container) {
  if (!container) return false;
  
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
    return true;
  }
  return false;
}

/**
 * Move focus to the next/previous focusable element
 * @param {HTMLElement} container - Container to search within
 * @param {boolean} backwards - Whether to move backwards
 */
export function moveFocus(container, backwards = false) {
  const focusableElements = Array.from(getFocusableElements(container));
  const currentIndex = focusableElements.indexOf(document.activeElement);
  
  let nextIndex;
  if (backwards) {
    nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
  } else {
    nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
  }
  
  if (focusableElements[nextIndex]) {
    focusableElements[nextIndex].focus();
  }
}

/**
 * Handle arrow key navigation for lists/menus
 * @param {KeyboardEvent} event - Keyboard event
 * @param {HTMLElement} container - Container element
 * @param {object} options - Configuration options
 */
export function handleArrowKeyNavigation(event, container, options = {}) {
  const {
    itemSelector = '[role="menuitem"], [role="option"], [role="tab"], button, a',
    orientation = 'vertical', // 'vertical', 'horizontal', or 'both'
    loop = true, // Whether to loop back to start/end
    activate = false // Whether to activate item on navigation (useful for tabs)
  } = options;

  const items = Array.from(container.querySelectorAll(itemSelector));
  const currentIndex = items.indexOf(document.activeElement);
  
  if (currentIndex === -1) return;

  let nextIndex = currentIndex;
  const lastIndex = items.length - 1;

  switch (event.key) {
    case 'ArrowDown':
      if (orientation === 'vertical' || orientation === 'both') {
        event.preventDefault();
        nextIndex = currentIndex === lastIndex ? (loop ? 0 : lastIndex) : currentIndex + 1;
      }
      break;
      
    case 'ArrowUp':
      if (orientation === 'vertical' || orientation === 'both') {
        event.preventDefault();
        nextIndex = currentIndex === 0 ? (loop ? lastIndex : 0) : currentIndex - 1;
      }
      break;
      
    case 'ArrowRight':
      if (orientation === 'horizontal' || orientation === 'both') {
        event.preventDefault();
        nextIndex = currentIndex === lastIndex ? (loop ? 0 : lastIndex) : currentIndex + 1;
      }
      break;
      
    case 'ArrowLeft':
      if (orientation === 'horizontal' || orientation === 'both') {
        event.preventDefault();
        nextIndex = currentIndex === 0 ? (loop ? lastIndex : 0) : currentIndex - 1;
      }
      break;
      
    case 'Home':
      event.preventDefault();
      nextIndex = 0;
      break;
      
    case 'End':
      event.preventDefault();
      nextIndex = lastIndex;
      break;
      
    default:
      return;
  }

  if (items[nextIndex]) {
    items[nextIndex].focus();
    
    if (activate) {
      // Trigger click or custom activation
      items[nextIndex].click();
    }
  }
}

/**
 * Manage skip links for improved keyboard navigation
 * @param {Array} skipLinks - Array of skip link objects {text, target}
 */
export function createSkipLinks(skipLinks) {
  const skipContainer = document.createElement('div');
  skipContainer.className = 'sr-only focus-within:not-sr-only absolute top-0 left-0 z-50 bg-blue-600 text-white p-2 rounded-md';
  skipContainer.setAttribute('role', 'navigation');
  skipContainer.setAttribute('aria-label', 'Enlaces de navegación rápida');

  skipLinks.forEach(link => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${link.target}`;
    skipLink.textContent = link.text;
    skipLink.className = 'block underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white';
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(link.target);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
    
    skipContainer.appendChild(skipLink);
  });

  // Insert at the beginning of the body
  document.body.insertBefore(skipContainer, document.body.firstChild);
  
  return skipContainer;
}

/**
 * Announce content to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - Priority level ('polite' or 'assertive')
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if element is visible and focusable
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether element is focusable
 */
export function isFocusable(element) {
  if (!element || element.disabled || element.hidden) return false;
  
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex === '-1') return false;
  
  return true;
}

export default {
  trapFocus,
  restoreFocus,
  saveFocus,
  getFocusableElements,
  focusFirstElement,
  moveFocus,
  handleArrowKeyNavigation,
  createSkipLinks,
  announceToScreenReader,
  isFocusable
};
