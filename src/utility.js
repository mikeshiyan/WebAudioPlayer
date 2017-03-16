'use strict';

/**
 * Contains various utility methods.
 *
 * @namespace
 */
var Utility = {};

/**
 * Contains promises about loading URLs.
 *
 * Object keys are URLs, and values are Promise objects.
 *
 * @type {object}
 */
Utility.urlPromises = {};

/**
 * Makes an XMLHttpRequest to url to get an array buffer.
 *
 * @param {string} url
 *   URL to get.
 *
 * @return {Promise}
 *   The Promise object.
 *   Fulfill callback arguments:
 *   - {ArrayBuffer} The ArrayBuffer object.
 *   Reject callback arguments:
 *   - {Error} The Error object.
 */
Utility.getArrayBuffer = function (url) {
  return new Promise(function (ok, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function () {
      if (xhr.status === 200 || xhr.status === 206) {
        ok(xhr.response);
      }
      else {
        fail(new Error(xhr.statusText));
      }
    };

    xhr.onerror = function () {
      fail(new Error('Unknown error.'));
    };

    xhr.send();
  });
};

/**
 * Gets a promise about loading URLs.
 *
 * @param {string[]} urls
 *   An array of mirror URLs.
 *
 * @return {Promise|undefined}
 *   The Promise object if one exists at least for one of given URLs.
 *   Fulfill callback arguments:
 *   - {Track} The Track object.
 *   Reject callback arguments:
 *   - {Error} The Error object.
 */
Utility.getUrlPromise = function (urls) {
  for (var i in urls) {
    if (urls.hasOwnProperty(i) && Utility.urlPromises[urls[i]]) {
      return Utility.urlPromises[urls[i]];
    }
  }
};

/**
 * Removes promises about loading URLs.
 *
 * @param {string[]} urls
 *   An array of mirror URLs.
 */
Utility.removeUrlPromise = function (urls) {
  urls.forEach(function (url) {
    delete Utility.urlPromises[url];
  });
};

/**
 * Saves the promise about loading URLs in temporary static cache.
 *
 * @param {string[]} urls
 *   An array of mirror URLs.
 * @param {Promise} promise
 *   The Promise object.
 */
Utility.setUrlPromise = function (urls, promise) {
  urls.forEach(function (url) {
    Utility.urlPromises[url] = promise;
  });
};

/**
 * Reads data from the storage.
 *
 * @param {string} key
 *   Variable key.
 *
 * @return {*|null|undefined}
 *   Variable value if it exists in the storage, null if it doesn't, or
 *   undefined in case of undefined local storage.
 */
Utility.readStorage = function (key) {
  if (typeof localStorage != 'undefined') {
    return JSON.parse(localStorage.getItem('WebAudioPlayer.' + key));
  }
};

/**
 * Updates data in the storage.
 *
 * @param {string} key
 *   Variable key.
 * @param {*} value
 *   Variable value.
 */
Utility.updateStorage = function (key, value) {
  if (typeof localStorage != 'undefined') {
    localStorage.setItem('WebAudioPlayer.' + key, JSON.stringify(value));
  }
};
