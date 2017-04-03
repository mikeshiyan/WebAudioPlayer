/**
 * @file
 * Audio player using Web Audio API.
 *
 * @version 2.0.1
 */

(function () {

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

'use strict';

/**
 * Links to the internal AudioContext and related objects.
 */
class Audio {

  /**
   * Constructs an Audio object.
   */
  constructor() {

    /**
     * The AudioContext object.
     *
     * @type {AudioContext}
     */
    this.Context = new (window.AudioContext || window.webkitAudioContext)();

    /**
     * The OfflineAudioContext object.
     *
     * @type {OfflineAudioContext}
     */
    this.OfflineContext = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 2, this.Context.sampleRate);

    /**
     * The AnalyserNode object.
     *
     * @type {AnalyserNode}
     */
    this.Analyser = this.Context.createAnalyser();

    /**
     * The GainNode object.
     *
     * @type {GainNode}
     */
    this.Gain = this.Context.createGain();

    /**
     * The ScriptProcessorNode object.
     *
     * @type {ScriptProcessorNode}
     */
    this.ScriptProcessor = this.Context.createScriptProcessor();

    /**
     * Array of BiquadFilterNode objects.
     *
     * @type {BiquadFilterNode[]}
     */
    this.filters = [];

    const frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

    for (let i = 0; i < 10; i++) {
      this.filters[i] = this.Context.createBiquadFilter();
      this.filters[i].frequency.value = frequencies[i];

      if (i === 0) {
        this.filters[0].type = 'lowshelf';
      }
      else if (i === 9) {
        this.filters[9].type = 'highshelf';
      }
      else {
        this.filters[i].type = 'peaking';
      }

      if (i > 0) {
        this.filters[i - 1].connect(this.filters[i]);
      }
    }

    this.Analyser
      .connect(this.filters[0]);
    this.filters[9]
      .connect(this.Gain)
      .connect(this.Context.destination);

    this.ScriptProcessor
      .connect(this.Context.destination);
  }

}

'use strict';

/**
 * Callback to execute on time markers.
 *
 * @callback markerCallback
 *
 * @this Track
 *
 * @see {@link Track#when}
 */

/**
 * Provides audiotrack-specific methods.
 *
 * @extends EventTarget
 */
class Track extends EventTarget {

  /**
   * Constructs a Track object.
   *
   * @param {string[]} urls
   *   Track sources - an array of mirror URLs pointing to the same audio piece.
   */
  constructor(urls) {
    super();

    /**
     * The AudioBuffer object containing raw audio data.
     *
     * @type {AudioBuffer}
     */
    let buffer = null;

    /**
     * Indicates whether an audio is currently playing.
     *
     * @type {boolean}
     */
    let isPlaying = false;

    /**
     * Contains all markers registered with a when() method for current track.
     *
     * An array of plain objects. Each object has the following elements:
     * - m: A time marker in seconds.
     * - fn: A callback to execute on a marker.
     *
     * @type {object[]}
     *
     * @see {@link Track#when}
     */
    let markers = [];

    /**
     * Contains markers and corresponding callbacks to fire during playback.
     *
     * @type {object[]}
     *
     * @see {@link markers}
     */
    let markersToFire = [];

    /**
     * Indicates the offset with which the most recent playback was started.
     *
     * This variable contains a number of seconds from the start of an audio
     * file.
     * Offset must be changed only when !isPlaying, because other numbers (for
     * example, the current time) are calculated based on it and current
     * playback state.
     *
     * @type {number}
     */
    let offset = 0;

    /**
     * Indicates the time the track was actually played.
     *
     * This variable contains a number of seconds from the first play() of
     * a track until its finish or explicit stop(), excluding pauses and skips.
     * It means that this variable only evenly increases when playing and never
     * jumps back or forward.
     *
     * @type {number}
     */
    let playedTime = 0;

    /**
     * Indicates the most recent moment when the playback was started.
     *
     * This variable contains a number of seconds on the AudioContext time line.
     *
     * @type {number}
     */
    let playStartedAt = 0;

    /**
     * The promise of a loaded track.
     *
     * @type {Promise}
     */
    let promise = null;

    /**
     * Contains the total time skipped when changing playback positions.
     *
     * This variable contains a sum of time jumps in seconds. The number can be
     * negative in case of backward jumps.
     *
     * @type {number}
     */
    let skipped = 0;

    /**
     * Contains an AudioBufferSourceNode object.
     *
     * @type {AudioBufferSourceNode}
     */
    let source = null;

    /**
     * Contains this Track object.
     *
     * @type {Track}
     */
    let track = this;

    /**
     * Fires marker callbacks if corresponding marker is reached.
     */
    const fireMarkers = () => {
      for (let i in markersToFire) {
        if (markersToFire[i].m <= playedTime) {
          setTimeout(markersToFire[i].fn.bind(this), 0);

          // One thing at a time. Remove the marker and break the loop.
          markersToFire.splice(i, 1);
          break;
        }
      }
    };

    /**
     * Makes the routine work while track is playing.
     *
     * @listens WebAudioPlayer#event:audioprocess
     * @fires Track#playing
     */
    const audioprocess = () => {
      if (isPlaying) {
        // Played time is only being increased while playing. When not playing
        // it remains with the same value, not minding of actual value of
        // the 'skipped' var.
        playedTime = this.getCurrentTime() - skipped;

        fireMarkers();

        /**
         * Indicates that the track is playing.
         *
         * @event Track#playing
         */
        this.dispatchEvent('playing');
      }
    };

    /**
     * Loads the audio file into buffer.
     *
     * Multiple calls to this method get the same Promise object.
     *
     * @return {Promise.<Track, Error>}
     *   The Promise object.
     *   Fulfill callback arguments:
     *   - {Track} This Track instance, loaded.
     *   Reject callback arguments:
     *   - {Error} The Error object.
     */
    this.load = function () {
      if (!promise) {
        promise = Utility.loadUrl(urls).then(newBuffer => {
          buffer = newBuffer;
          return this;
        });
      }

      return promise;
    };

    /**
     * Plays the loaded audio file or resumes the playback from pause.
     *
     * @return {Track}
     *   The Track object.
     *
     * @throws {Error}
     *   If track is not loaded.
     */
    this.play = function () {
      if (!buffer) {
        throw new Error('Track is not loaded.');
      }

      if (!isPlaying && offset < buffer.duration) {
        const audio = Utility.audio;
        const player = Utility.player;
        isPlaying = true;
        offset = Math.max(offset, 0);
        let duration = Math.max(buffer.duration - offset, 0);

        player.addEventListener('audioprocess', audioprocess);

        source = audio.Context.createBufferSource();
        source.connect(audio.Analyser);
        source.buffer = buffer;

        /**
         * Runs code in response to the audio track finishing playback.
         *
         * @fires Track#finished
         *
         * @this AudioBufferSourceNode
         */
        source.onended = function () {
          this.finished = true;

          // Check if the actual source object is finished, but the state is
          // still 'playing'. This means that no new source started for current
          // track.
          if (source.finished && isPlaying) {
            isPlaying = false;
            skipped = offset = buffer.duration;

            /**
             * Indicates that the track has finished playing.
             *
             * @event Track#finished
             */
            track.dispatchEvent('finished');
            player.removeEventListener('audioprocess', audioprocess);

            // Set all markers back to array.
            markersToFire = markers.slice(0);
          }
        };

        playStartedAt = audio.Context.currentTime;
        source.start(0, offset, duration);
      }

      return this;
    };

    /**
     * Stops the playback and resets the track state.
     *
     * This method resets the current time position and the skipped time
     * counter, which impacts the played time in the way that next play() will
     * count it from 0.
     *
     * @return {Track}
     *   The Track object.
     */
    this.stop = function () {
      isPlaying = false;

      if (source) {
        source.stop();
      }

      skipped = offset = 0;
      Utility.player.removeEventListener('audioprocess', audioprocess);
      markersToFire = markers.slice(0);

      return this;
    };

    /**
     * Pauses the playback.
     *
     * @return {Track}
     *   The Track object.
     */
    this.pause = function () {
      const wasPlaying = isPlaying;
      isPlaying = false;

      if (source) {
        source.stop();
      }

      if (wasPlaying) {
        offset += Utility.audio.Context.currentTime - playStartedAt;
      }

      Utility.player.removeEventListener('audioprocess', audioprocess);

      return this;
    };

    /**
     * Seeks on an audio track.
     *
     * @param {number} newOffset
     *   Seconds from the start of an audio file.
     *
     * @return {Track}
     *   The Track object.
     *
     * @throws {TypeError}
     *   If provided offset is negative.
     */
    this.seek = function (newOffset) {
      if (newOffset < 0) {
        throw new TypeError('Offset parameter accepts non-negative numbers only.');
      }

      skipped += newOffset - this.getCurrentTime();

      if (isPlaying) {
        isPlaying = false;

        if (source) {
          source.stop();
        }

        offset = newOffset;
        this.play();
      }
      else {
        offset = newOffset;
      }

      return this;
    };

    /**
     * Sets the callback to execute on a time marker.
     *
     * This method uses the actual played time. It means that markers cannot be
     * accidentally skipped if a listener skips track parts.
     *
     * @param {number} marker
     *   A time marker in seconds of actual playback.
     * @param {markerCallback} callback
     *   A callback to execute when marker is reached.
     *
     * @return {Track}
     *   The Track object.
     *
     * @throws {TypeError}
     *   If marker is negative.
     *
     * @see {@link Track#getPlayedTime}
     */
    this.when = function (marker, callback) {
      if (marker < 0) {
        throw new TypeError('Marker parameter accepts non-negative numbers only.');
      }

      const item = {m: marker, fn: callback};
      markersToFire.push(item);
      markers.push(item);

      return this;
    };

    /**
     * Gets the current playback position.
     *
     * @return {number}
     *   Seconds from the start of an audio file.
     */
    this.getCurrentTime = function () {
      return isPlaying ? Utility.audio.Context.currentTime - playStartedAt + offset : offset;
    };

    /**
     * Gets the time the track was actually played.
     *
     * @return {number}
     *   Seconds from the first play() of a track, excluding pauses and skips.
     */
    this.getPlayedTime = function () {
      return playedTime;
    };

    /**
     * Gets the duration of a track.
     *
     * @return {number}
     *   The duration in seconds.
     *
     * @throws {Error}
     *   If track is not loaded.
     */
    this.getDuration = function () {
      if (!buffer) {
        throw new Error('Track is not loaded.');
      }

      return buffer.duration;
    };

    /**
     * Indicates whether a track is currently playing.
     *
     * @return {boolean}
     *   True if audio is playing, false otherwise.
     */
    this.isPlaying = function () {
      return isPlaying;
    };
  }

}

'use strict';

/**
 * The main, public class, providing general methods.
 *
 * @extends EventTarget
 * @global
 */
class WebAudioPlayer extends EventTarget {

  /**
   * Constructs a WebAudioPlayer object.
   */
  constructor() {
    super();

    Utility.player = this;

    /**
     * Runs code while audio is processing.
     *
     * @fires WebAudioPlayer#audioprocess
     */
    Utility.audio.ScriptProcessor.onaudioprocess = () => {

      /**
       * Indicates that audio is processing.
       *
       * This event is fired constantly during the life of an Audio object and
       * should not be generally listened for. Track objects use this event to
       * fire their own 'playing' event to indicate when the corresponding track
       * is actually playing.
       *
       * @event WebAudioPlayer#audioprocess
       *
       * @see {@link Track#event:playing}
       */
      this.dispatchEvent('audioprocess');
    };

    const eq = Utility.readStorage('eq');
    const vol = Utility.readStorage('vol');

    if (eq) {
      this.setEq(eq);
    }
    if (vol) {
      this.setVolume(vol);
    }
  }

  /**
   * Returns the Audio object.
   *
   * @return {Audio}
   *   The Audio object.
   */
  getAudio() {
    return Utility.audio;
  }

  /**
   * Returns the new Track instance.
   *
   * @param {string[]} urls
   *   Track sources - an array of mirror URLs pointing to the same audio piece.
   *   Only the first valid URL will be ultimately used.
   *
   * @return {Track}
   *   The Track instance.
   */
  createTrack(urls) {
    return new Track(urls);
  }

  /**
   * Sets the playback volume to new level.
   *
   * @param {number} gain
   *   Number between 0 and 1.
   *
   * @return {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  setVolume(gain) {
    Utility.audio.Gain.gain.value = gain;

    Utility.updateStorage('vol', gain);

    return this;
  }

  /**
   * Gets the current value of the playback volume level.
   *
   * @return {number}
   *   Previously set value.
   */
  getVolume() {
    return Utility.audio.Gain.gain.value;
  }

  /**
   * Sets the equalizer bands to new levels.
   *
   * @param {number[]|object} bands
   *   Array or object which keys are indexes from 0 to 9 for each of 10 bands,
   *   and values are numbers indicating the new gain of the corresponding band.
   *   All elements of the object are optional, so setting less than 10 elements
   *   will leave unspecified bands in previous state.
   *
   * @return {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  setEq(bands) {
    const audio = Utility.audio;

    for (let i in bands) {
      if (bands.hasOwnProperty(i) && audio.filters[i]) {
        audio.filters[i].gain.value = bands[i];
      }
    }

    Utility.updateStorage('eq', this.getEq());

    return this;
  }

  /**
   * Gets the current band levels of the equalizer.
   *
   * @return {number[]}
   *   Array of 10 numbers.
   */
  getEq() {
    return Utility.audio.filters.map(filter => filter.gain.value);
  }

}


window.WebAudioPlayer = WebAudioPlayer;

})();
