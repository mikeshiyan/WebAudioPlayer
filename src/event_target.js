'use strict';

/**
 * Callback to execute on events.
 *
 * The callback context is the object on which the addEventListener() method was
 * called.
 *
 * @callback eventListener
 * @param {...*} arguments
 *   Any number of arguments supplied to the dispatchEvent() method (except its
 *   first argument - event type).
 *
 * @this EventTarget
 *
 * @see {@link EventTarget#dispatchEvent}
 */

/**
 * Provides methods to work with events.
 *
 * Meant to be extended by other classes.
 */
class EventTarget {

  /**
   * Constructs an EventTarget object.
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
   * @param {eventListener} callback
   *   Event handler to call when event occurs.
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
   * @param {eventListener} callback
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
   * @param {...*} other_arguments
   *   Other arguments to supply to event listeners.
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
