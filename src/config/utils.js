define([], function() {

  const DEFAULT_TIMEOUT = 30000;

  /**
   * Waits for an element to appear in the DOM and be interactive using MutationObserver.
   * @param {string} selector - The CSS selector of the element to wait for.
   * @param {number} timeout - The maximum time to wait in milliseconds (default is 5000ms).
   * @returns {Promise<Element>} - A promise that resolves to the found element.
   */
  function waitForElement(selector, timeout = DEFAULT_TIMEOUT) {
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);

        if (element && element.offsetParent !== null) {
          observer.disconnect(); // Stop observing once the element is found and interactive
          resolve(element);
        }
      });

      // Start observing the document for changes in the DOM
      observer.observe(document.body, { childList: true, subtree: true });

      // Set a timeout to stop observing if the element doesn't appear in time
      setTimeout(() => {
        observer.disconnect();
        reject(
          new Error(
            `Element with selector "${selector}" was not found within ${timeout}ms.`
          )
        );
      }, timeout);
    });
  }

  window.utils = {
    waitForElement: waitForElement,
  };

  return window.utils;
});
