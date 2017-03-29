/**
 * @file
 * Audio player using Web Audio API.
 *
 * @version 2.0.1
 */

'use strict';

/**
 * The Audio object.
 *
 * @type {Audio}
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _audio = void 0;

/**
 * The WebAudioPlayer instance.
 *
 * @type {WebAudioPlayer}
 */
var _player = void 0;

/**
 * Contains promises about loading URLs.
 *
 * Object keys are URLs, and values are Promise objects.
 *
 * @type {object}
 */
var _urlPromises = {};

/**
 * Contains various utility methods.
 */

var Utility = function () {
  function Utility() {
    _classCallCheck(this, Utility);
  }

  _createClass(Utility, null, [{
    key: 'getArrayBuffer',


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
    value: function getArrayBuffer(url) {
      return new Promise(function (ok, fail) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function () {
          if (xhr.status === 200 || xhr.status === 206) {
            ok(xhr.response);
          } else {
            fail(new Error(xhr.statusText));
          }
        };

        xhr.onerror = function () {
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

  }, {
    key: 'loadUrl',
    value: function loadUrl(urls) {
      var promise = Utility.getUrlPromise(urls);

      if (!promise) {
        var callback = function callback(sequence, url) {
          return sequence.catch(function () {
            return Utility.getArrayBuffer(url).then(function (data) {
              return Utility.audio.OfflineContext.decodeAudioData(data);
            });
          });
        };

        promise = urls.reduce(callback, Promise.reject()).then(function (buffer) {
          Utility.removeUrlPromise(urls);
          return buffer;
        }).catch(function () {
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

  }, {
    key: 'getUrlPromise',
    value: function getUrlPromise(urls) {
      for (var i in urls) {
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

  }, {
    key: 'removeUrlPromise',
    value: function removeUrlPromise(urls) {
      urls.forEach(function (url) {
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

  }, {
    key: 'setUrlPromise',
    value: function setUrlPromise(urls, promise) {
      urls.forEach(function (url) {
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

  }, {
    key: 'readStorage',
    value: function readStorage(key) {
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

  }, {
    key: 'updateStorage',
    value: function updateStorage(key, value) {
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

  }, {
    key: 'audio',
    get: function get() {
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

  }, {
    key: 'player',
    set: function set(player) {
      if (player instanceof WebAudioPlayer) {
        _player = player;
      } else {
        throw new TypeError('Player parameter accepts the WebAudioPlayer instance only.');
      }
    }

    /**
     * Returns the WebAudioPlayer instance.
     *
     * @return {WebAudioPlayer}
     *   The WebAudioPlayer instance.
     */
    ,
    get: function get() {
      return _player;
    }
  }]);

  return Utility;
}();

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

var EventTarget = function () {

  /**
   * Constructs an EventTarget object.
   */
  function EventTarget() {
    _classCallCheck(this, EventTarget);

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


  _createClass(EventTarget, [{
    key: 'addEventListener',
    value: function addEventListener(type, callback) {
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
    }

    /**
     * Removes an event listener.
     *
     * @param {string} type
     *   Event type.
     * @param {eventListener} callback
     *   Event handler to remove.
     */

  }, {
    key: 'removeEventListener',
    value: function removeEventListener(type, callback) {
      if (type in this.eventListeners) {
        var stack = this.eventListeners[type];

        for (var i = 0, l = stack.length; i < l; i++) {
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

  }, {
    key: 'dispatchEvent',
    value: function dispatchEvent(type) {
      if (type in this.eventListeners) {
        var stack = this.eventListeners[type];
        var args = Array.prototype.slice.call(arguments, 1);

        for (var i = 0, l = stack.length; i < l; i++) {
          stack[i].apply(this, args);
        }
      }
    }
  }]);

  return EventTarget;
}();

'use strict';

/**
 * Links to the internal AudioContext and related objects.
 */

var Audio =

/**
 * Constructs an Audio object.
 */
function Audio() {
  _classCallCheck(this, Audio);

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

  var frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

  for (var i = 0; i < 10; i++) {
    this.filters[i] = this.Context.createBiquadFilter();
    this.filters[i].frequency.value = frequencies[i];

    if (i === 0) {
      this.filters[0].type = 'lowshelf';
    } else if (i === 9) {
      this.filters[9].type = 'highshelf';
    } else {
      this.filters[i].type = 'peaking';
    }

    if (i > 0) {
      this.filters[i - 1].connect(this.filters[i]);
    }
  }

  this.Analyser.connect(this.filters[0]);
  this.filters[9].connect(this.Gain).connect(this.Context.destination);

  this.ScriptProcessor.connect(this.Context.destination);
};

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

var Track = function (_EventTarget) {
  _inherits(Track, _EventTarget);

  /**
   * Constructs a Track object.
   *
   * @param {AudioBuffer} buffer
   *   The AudioBuffer object containing raw audio data.
   */
  function Track(buffer) {
    _classCallCheck(this, Track);

    /**
     * Indicates whether an audio is currently playing.
     *
     * @type {boolean}
     */
    var _this = _possibleConstructorReturn(this, (Track.__proto__ || Object.getPrototypeOf(Track)).call(this));

    var isPlaying = false;

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
    var markers = [];

    /**
     * Contains markers and corresponding callbacks to fire during playback.
     *
     * @type {object[]}
     *
     * @see {@link markers}
     */
    var markersToFire = [];

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
    var offset = 0;

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
    var playedTime = 0;

    /**
     * Indicates the most recent moment when the playback was started.
     *
     * This variable contains a number of seconds on the AudioContext time line.
     *
     * @type {number}
     */
    var playStartedAt = 0;

    /**
     * Contains the total time skipped when changing playback positions.
     *
     * This variable contains a sum of time jumps in seconds. The number can be
     * negative in case of backward jumps.
     *
     * @type {number}
     */
    var skipped = 0;

    /**
     * Contains an AudioBufferSourceNode object.
     *
     * @type {AudioBufferSourceNode}
     */
    var source = null;

    /**
     * Contains this Track object.
     *
     * @type {Track}
     */
    var track = _this;

    /**
     * Fires marker callbacks if corresponding marker is reached.
     */
    var fireMarkers = function fireMarkers() {
      for (var i in markersToFire) {
        if (markersToFire[i].m <= playedTime) {
          setTimeout(markersToFire[i].fn.bind(_this), 0);

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
    var audioprocess = function audioprocess() {
      if (isPlaying) {
        // Played time is only being increased while playing. When not playing
        // it remains with the same value, not minding of actual value of
        // the 'skipped' var.
        playedTime = _this.getCurrentTime() - skipped;

        fireMarkers();

        /**
         * Indicates that the track is playing.
         *
         * @event Track#playing
         */
        _this.dispatchEvent('playing');
      }
    };

    /**
     * Plays the loaded audio file or resumes the playback from pause.
     *
     * @return {Track}
     *   The Track object.
     */
    _this.play = function () {
      if (!isPlaying && offset < buffer.duration) {
        var audio = Utility.audio;
        var player = Utility.player;
        isPlaying = true;
        offset = Math.max(offset, 0);
        var duration = Math.max(buffer.duration - offset, 0);

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
    _this.stop = function () {
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
    _this.pause = function () {
      var wasPlaying = isPlaying;
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
    _this.seek = function (newOffset) {
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
      } else {
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
    _this.when = function (marker, callback) {
      if (marker < 0) {
        throw new TypeError('Marker parameter accepts non-negative numbers only.');
      }

      var item = { m: marker, fn: callback };
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
    _this.getCurrentTime = function () {
      return isPlaying ? Utility.audio.Context.currentTime - playStartedAt + offset : offset;
    };

    /**
     * Gets the time the track was actually played.
     *
     * @return {number}
     *   Seconds from the first play() of a track, excluding pauses and skips.
     */
    _this.getPlayedTime = function () {
      return playedTime;
    };

    /**
     * Gets the duration of a track.
     *
     * @return {number}
     *   The duration in seconds.
     */
    _this.getDuration = function () {
      return buffer.duration;
    };

    /**
     * Indicates whether a track is currently playing.
     *
     * @return {boolean}
     *   True if audio is playing, false otherwise.
     */
    _this.isPlaying = function () {
      return isPlaying;
    };
    return _this;
  }

  return Track;
}(EventTarget);

'use strict';

/**
 * The main, public class, providing general methods.
 *
 * @extends EventTarget
 * @global
 */

var WebAudioPlayer = function (_EventTarget2) {
  _inherits(WebAudioPlayer, _EventTarget2);

  /**
   * Constructs a WebAudioPlayer object.
   */
  function WebAudioPlayer() {
    _classCallCheck(this, WebAudioPlayer);

    var _this2 = _possibleConstructorReturn(this, (WebAudioPlayer.__proto__ || Object.getPrototypeOf(WebAudioPlayer)).call(this));

    Utility.player = _this2;

    /**
     * Runs code while audio is processing.
     *
     * @fires WebAudioPlayer#audioprocess
     */
    Utility.audio.ScriptProcessor.onaudioprocess = function () {

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
      _this2.dispatchEvent('audioprocess');
    };

    var eq = Utility.readStorage('eq');
    var vol = Utility.readStorage('vol');

    if (eq) {
      _this2.setEq(eq);
    }
    if (vol) {
      _this2.setVolume(vol);
    }
    return _this2;
  }

  /**
   * Returns the Audio object.
   *
   * @return {Audio}
   *   The Audio object.
   */


  _createClass(WebAudioPlayer, [{
    key: 'getAudio',
    value: function getAudio() {
      return Utility.audio;
    }

    /**
     * Loads the audio file into the Track object.
     *
     * This method takes an array of URLs (presumably pointing to the same audio
     * file) as the only argument, and will stop and fulfill the promise after
     * the first valid audio URL found.
     *
     * Multiple simultaneous calls to this method providing the same (or
     * intersecting) URL sets will receive the same Promise object, which when
     * fulfilled will return the same Track object for all callers.
     *
     * @param {string[]} urls
     *   An array of mirror URLs.
     *
     * @return {Promise.<Track, Error>}
     *   The Promise object.
     *   Fulfill callback arguments:
     *   - {Track} The Track object.
     *   Reject callback arguments:
     *   - {Error} The Error object.
     */

  }, {
    key: 'loadUrl',
    value: function loadUrl(urls) {
      return Utility.loadUrl(urls).then(function (buffer) {
        return new Track(buffer);
      });
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

  }, {
    key: 'setVolume',
    value: function setVolume(gain) {
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

  }, {
    key: 'getVolume',
    value: function getVolume() {
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

  }, {
    key: 'setEq',
    value: function setEq(bands) {
      var audio = Utility.audio;

      for (var i in bands) {
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

  }, {
    key: 'getEq',
    value: function getEq() {
      return Utility.audio.filters.map(function (filter) {
        return filter.gain.value;
      });
    }
  }]);

  return WebAudioPlayer;
}(EventTarget);

module.exports = WebAudioPlayer;
