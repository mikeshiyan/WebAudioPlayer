'use strict';

/**
 * Constructs an EventTarget object.
 *
 * @constructor
 */
var EventTarget = function () {
  this.eventListeners = {};
};

/**
 * Contains event listeners.
 *
 * Object keys are event types, and values are arrays of callbacks.
 *
 * @type {object}
 */
EventTarget.prototype.eventListeners = null;

/**
 * Registers an event handler of a specific type.
 *
 * @param {string} type
 *   Event type to listen for.
 * @param {function} callback
 *   Event handler to call.
 */
EventTarget.prototype.addEventListener = function (type, callback) {
  if (!(type in this.eventListeners)) {
    this.eventListeners[type] = [];
  }

  var stack = this.eventListeners[type];
  var exists = false;

  for (var i = 0, l = stack.length; i < l; i++) {
    if (stack[i] === callback) {
      exists = true;
      break;
    }
  }

  if (!exists) {
    this.eventListeners[type].push(callback);
  }
};

/**
 * Removes an event listener.
 *
 * @param {string} type
 *   Event type.
 * @param {function} callback
 *   Event handler to remove.
 */
EventTarget.prototype.removeEventListener = function (type, callback) {
  if (type in this.eventListeners) {
    var stack = this.eventListeners[type];

    for (var i = 0, l = stack.length; i < l; i++) {
      if (stack[i] === callback) {
        stack.splice(i, 1);
        break;
      }
    }
  }
};

/**
 * Dispatches an event.
 *
 * @param {string} type
 *   Event type to dispatch.
 */
EventTarget.prototype.dispatchEvent = function (type) {
  if (type in this.eventListeners) {
    var stack = this.eventListeners[type];
    var args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0, l = stack.length; i < l; i++) {
      stack[i].apply(this, args);
    }
  }
};
