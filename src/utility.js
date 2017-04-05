'use strict';

/**
 * The Audio object.
 *
 * @type {Audio}
 */
let _audio;

/**
 * The WebAudioPlayer instance.
 *
 * @type {WebAudioPlayer}
 */
let _player;

/**
 * Contains promises about loading URLs.
 *
 * Object keys are URLs, and values are Promise objects.
 *
 * @type {object}
 */
const _urlPromises = {};

/**
 * Contains various utility methods.
 */
class Utility {

  /**
   * Makes an XMLHttpRequest to url to get an array buffer.
   *
   * @param {string} url
   *   URL to get.
   *
   * @return {Promise.<ArrayBuffer, Error>}
   *   The Promise object.
   *   Fulfill callback arguments:
   *   - {ArrayBuffer} The ArrayBuffer object.
   *   Reject callback arguments:
   *   - {Error} The Error object.
   */
  static getArrayBuffer(url) {
    return new Promise((ok, fail) => {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.responseType = 'arraybuffer';

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 206) {
          ok(xhr.response);
        }
        else {
          fail(new Error(xhr.statusText));
        }
      };

      xhr.onerror = () => {
        fail(new Error('Unknown error.'));
      };

      xhr.send();
    });
  }

  /**
   * Loads the audio file by URL into buffer.
   *
   * @param {string[]} urls
   *   An array of mirror URLs.
   *
   * @return {Promise.<AudioBuffer, Error>}
   *   The Promise object.
   *   Fulfill callback arguments:
   *   - {AudioBuffer} The AudioBuffer object containing raw audio data.
   *   Reject callback arguments:
   *   - {Error} The Error object.
   */
  static loadUrl(urls) {
    let promise = Utility.getUrlPromise(urls);

    if (!promise) {
      const callback = (sequence, url) =>
        sequence.catch(() =>
          Utility.getArrayBuffer(url).then(data =>
            Utility.audio.OfflineContext.decodeAudioData(data)));

      promise = urls.reduce(callback, Promise.reject())
        .then(buffer => {
          Utility.removeUrlPromise(urls);
          return buffer;
        })
        .catch(() => {
          throw new Error('No valid audio URLs provided.');
        });

      Utility.setUrlPromise(urls, promise);
    }

    return promise;
  }

  /**
   * Gets a promise about loading URLs.
   *
   * @param {string[]} urls
   *   An array of mirror URLs.
   *
   * @return {Promise.<AudioBuffer, Error>|undefined}
   *   The Promise object if one exists at least for one of given URLs.
   *   Fulfill callback arguments:
   *   - {AudioBuffer} The AudioBuffer object containing raw audio data.
   *   Reject callback arguments:
   *   - {Error} The Error object.
   */
  static getUrlPromise(urls) {
    for (let i in urls) {
      if (urls.hasOwnProperty(i) && _urlPromises[urls[i]]) {
        return _urlPromises[urls[i]];
      }
    }
  }

  /**
   * Removes promises about loading URLs.
   *
   * @param {string[]} urls
   *   An array of mirror URLs.
   */
  static removeUrlPromise(urls) {
    urls.forEach(url => {
      delete _urlPromises[url];
    });
  }

  /**
   * Saves the promise about loading URLs in temporary static cache.
   *
   * @param {string[]} urls
   *   An array of mirror URLs.
   * @param {Promise} promise
   *   The Promise object.
   */
  static setUrlPromise(urls, promise) {
    urls.forEach(url => {
      _urlPromises[url] = promise;
    });
  }

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
  static readStorage(key) {
    if (typeof localStorage != 'undefined') {
      return JSON.parse(localStorage.getItem('WebAudioPlayer.' + key));
    }
  }

  /**
   * Updates data in the storage.
   *
   * @param {string} key
   *   Variable key.
   * @param {*} value
   *   Variable value.
   */
  static updateStorage(key, value) {
    if (typeof localStorage != 'undefined') {
      localStorage.setItem('WebAudioPlayer.' + key, JSON.stringify(value));
    }
  }

  /**
   * Returns the Audio object.
   *
   * @return {Audio}
   *   The Audio object.
   *
   * @readonly
   */
  static get audio() {
    if (!_audio) {
      _audio = new Audio();
    }

    return _audio;
  }

  /**
   * Saves the WebAudioPlayer instance to a statically cached variable.
   *
   * @param {WebAudioPlayer} player
   *   The WebAudioPlayer instance.
   *
   * @throws {TypeError}
   *   If provided parameter is not a WebAudioPlayer instance.
   */
  static set player(player) {
    if (player instanceof WebAudioPlayer) {
      _player = player;
    }
    else {
      throw new TypeError('Player parameter accepts the WebAudioPlayer instance only.');
    }
  }

  /**
   * Returns the WebAudioPlayer instance.
   *
   * @return {WebAudioPlayer}
   *   The WebAudioPlayer instance.
   */
  static get player() {
    return _player;
  }

}
