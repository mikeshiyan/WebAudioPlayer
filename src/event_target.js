'use strict';

/**
 * Provides methods to work with events.
 *
 * @namespace
 */
class EventTarget {

  /**
   * Constructs an EventTarget object.
   *
   * @constructor
   */
  constructor() {

    /**
     * Contains event listeners.
     *
     * Object keys are event types, and values are arrays of callbacks.
     *
     * @type {object}
     */
    this.eventListeners = {};
  }

  /**
   * Registers an event handler of a specific type.
   *
   * @param {string} type
   *   Event type to listen for.
   * @param {function} callback
   *   Event handler to call.
   */
  addEventListener(type, callback) {
    if (!(type in this.eventListeners)) {
      this.eventListeners[type] = [];
    }

    const stack = this.eventListeners[type];
    let exists = false;

    for (let i = 0, l = stack.length; i < l; i++) {
      if (stack[i] === callback) {
        exists = true;
        break;
      }
    }

    if (!exists) {
      this.eventListeners[type].push(callback);
    }
  }

  /**
   * Removes an event listener.
   *
   * @param {string} type
   *   Event type.
   * @param {function} callback
   *   Event handler to remove.
   */
  removeEventListener(type, callback) {
    if (type in this.eventListeners) {
      let stack = this.eventListeners[type];

      for (let i = 0, l = stack.length; i < l; i++) {
        if (stack[i] === callback) {
          stack.splice(i, 1);
          break;
        }
      }
    }
  }

  /**
   * Dispatches an event.
   *
   * @param {string} type
   *   Event type to dispatch.
   */
  dispatchEvent(type) {
    if (type in this.eventListeners) {
      const stack = this.eventListeners[type];
      const args = Array.prototype.slice.call(arguments, 1);

      for (let i = 0, l = stack.length; i < l; i++) {
        stack[i].apply(this, args);
      }
    }
  }

}
