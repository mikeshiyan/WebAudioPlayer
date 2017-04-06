/**
 * @file
 * Audio player using Web Audio API.
 *
 * @version 3.0.0-beta.2
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
     *
     * @readonly
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
   * @param {string[]} urls
   *   Track sources - an array of mirror URLs pointing to the same audio piece.
   */
  function Track(urls) {
    _classCallCheck(this, Track);

    /**
     * Provides a common place for any custom data associated with the track.
     *
     * For example, track title, artist, etc.
     *
     * @type {object}
     */
    var _this = _possibleConstructorReturn(this, (Track.__proto__ || Object.getPrototypeOf(Track)).call(this));

    _this.data = {};

    /**
     * The AudioBuffer object containing raw audio data.
     *
     * @type {AudioBuffer}
     */
    var buffer = null;

    /**
     * Indicates whether an audio is currently playing.
     *
     * @type {boolean}
     */
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
     * The promise of a loaded track.
     *
     * @type {Promise}
     */
    var promise = null;

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
         * Unlike the 'play' event, this one is fired constantly during
         * the playback of the Track.
         *
         * @event Track#playing
         *
         * @see {@link Track#event:play}
         */
        _this.dispatchEvent('playing');
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
    _this.load = function () {
      var _this2 = this;

      if (!promise) {
        promise = Utility.loadUrl(urls).then(function (newBuffer) {
          buffer = newBuffer;
          return _this2;
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
     * @fires Track#play
     */
    _this.play = function () {
      if (!buffer) {
        throw new Error('Track is not loaded.');
      }

      if (!isPlaying && offset < buffer.duration) {
        var audio = Utility.audio;
        var player = Utility.player;
        var track = this;

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

        /**
         * Indicates the playback beginning.
         *
         * Unlike the 'playing' event, this one is fired only when the track
         * source has started playing, but not necessary from the start of
         * an audio track.
         *
         * @event Track#play
         *
         * @see {@link Track#event:playing}
         */
        this.dispatchEvent('play');
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
     *
     * @throws {Error}
     *   If track is not loaded.
     */
    _this.getDuration = function () {
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
    _this.isPlaying = function () {
      return isPlaying;
    };
    return _this;
  }

  return Track;
}(EventTarget);

'use strict';

/**
 * Provides playlist-specific methods.
 *
 * @extends EventTarget
 */

var Playlist = function (_EventTarget2) {
  _inherits(Playlist, _EventTarget2);

  /**
   * Constructs a Playlist object.
   *
   * @param {Track[]} list
   *   (optional) Array of Track instances.
   */
  function Playlist() {
    var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    _classCallCheck(this, Playlist);

    /**
     * List of tracks to play.
     *
     * @type {Track[]}
     */
    var _this3 = _possibleConstructorReturn(this, (Playlist.__proto__ || Object.getPrototypeOf(Playlist)).call(this));

    _this3.list = list;

    /**
     * Indicates whether the list is on repeat.
     *
     * @type {boolean}
     */
    _this3.repeat = false;

    /**
     * The current track.
     *
     * @type {Track|null}
     */
    var current = null;

    /**
     * Sets current track by its list index.
     *
     * @param {number} index
     *   Index of a track in list.
     *
     * @return {Playlist}
     *   This Playlist instance.
     *
     * @throws {Error}
     *   If current track is playing or if there's no track with given index in
     *   the list.
     */
    _this3.setCurrentByIndex = function (index) {
      // Prevent changing the current track while it's playing. Otherwise it'd
      // be impossible to pause the playing track when another one starts.
      if (current && current.isPlaying()) {
        throw new Error('Cannot change the current track while playing.');
      }
      if (!this.list[index]) {
        throw new Error('Index not found.');
      }

      current = this.list[index];

      return this;
    };

    /**
     * Returns the current track.
     *
     * @return {Track|null}
     *   The current track, or null in case of empty list.
     */
    _this3.getCurrent = function () {
      if (!current && this.length) {
        current = this.list[0];
      }

      return current;
    };

    /**
     * Sets the track as current.
     *
     * This also pauses 'previously current' track in case it's still playing.
     *
     * @listens Track#event:play
     *
     * @this Track
     */
    var setAsCurrent = function setAsCurrent() {
      if (current && current !== this) {
        current.pause();
      }

      current = this;
    };

    /**
     * Loads the next track in the list.
     */
    var loadNext = function loadNext() {
      var index = _this3.getCurrentIndex();

      if (index >= 0 && _this3.get(index + 1)) {
        _this3.load(index + 1);
      }
    };

    /**
     * Adds track event listeners.
     *
     * @listens Playlist#event:trackReady
     */
    _this3.addEventListener('trackReady', function (track) {
      track.addEventListener('play', setAsCurrent);
      track.when(0, loadNext);

      /**
       * Skips to the start of next track in the list, if one exists.
       *
       * @listens Track#event:finished
       */
      track.addEventListener('finished', function () {
        return _this3.next();
      });
    });
    return _this3;
  }

  /**
   * Returns the list index of current track.
   *
   * @return {number}
   *   Current track's index, or -1 in case of empty list or if the current
   *   track was removed from the list.
   */


  _createClass(Playlist, [{
    key: 'getCurrentIndex',
    value: function getCurrentIndex() {
      var track = this.getCurrent();

      if (track) {
        return this.list.indexOf(track);
      }

      return -1;
    }

    /**
     * Returns the track by index or the current one.
     *
     * @param {number|null} index
     *   (optional) The list index. If omitted, the current track will be
     *   looked for. If specified, and playlist is on repeat, then it will be
     *   adjusted to the range.
     *
     * @return {Track|null|undefined}
     *   Either track corresponding to given index, or the current one. Null or
     *   undefined, if there's no corresponding track in the list.
     */

  }, {
    key: 'get',
    value: function get() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      var track = void 0;

      if (index === null) {
        track = this.getCurrent();
      } else {
        track = this.list[index];

        if (!track && this.repeat) {
          var length = this.length;

          if (index >= length) {
            track = this.list[index - length];
          } else if (index < 0) {
            track = this.list[index + length];
          }
        }
      }

      return track;
    }

    /**
     * Returns the number of tracks in the list.
     *
     * @return {number}
     *   Number of tracks in the list.
     *
     * @readonly
     */

  }, {
    key: 'load',


    /**
     * Loads the track by index or the current one.
     *
     * If track can't be loaded this method will try next tracks from the list
     * recursively.
     *
     * @param {number|null} index
     *   (optional) The list index. If omitted, the current track will be loaded.
     *
     * @return {Promise.<Track, Error>}
     *   The Promise object.
     *   Fulfill callback arguments:
     *   - {Track} The Track instance, loaded.
     *   Reject callback arguments:
     *   - {Error} The Error object.
     *
     * @fires Playlist#trackReady
     */
    value: function load() {
      var _this4 = this;

      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      var track = this.get(index);

      if (!track) {
        return Promise.reject(new Error('Attempt to load nonexistent item.'));
      }

      if (!track._playlistPromise) {

        /**
         * Contains playlist-specific promise of a loaded track.
         *
         * @type {Promise}
         */
        track._playlistPromise = track.load().then(function (track) {

          /**
           * Indicates that the track from the list is loaded.
           *
           * @event Playlist#trackReady
           *
           * @param {Track} track
           *   Instance of the loaded track.
           */
          _this4.dispatchEvent('trackReady', track);
          return track;
        });
      }

      return track._playlistPromise.catch(function (error) {
        // Failed to load this track's URLs, try the next one. The list could've
        // changed by this time, search for actual index.
        index = _this4.list.indexOf(track);

        if (index < 0) {
          throw new Error('Cannot define the next track.');
        }

        // If track is the playlist's current track, set the next one as current.
        if (track === _this4.getCurrent() && _this4.get(index + 1)) {
          // This also has a positive side effect: if playlist is full of invalid
          // tracks and is on repeat, this call saves from infinite load()
          // recursion, by throwing error.
          _this4.setCurrentByIndex(index + 1);
        }

        if (_this4.get(index + 1)) {
          return _this4.load(index + 1);
        }

        // The list's last track, if unable to load, can cause some troubles.
        // If this catch() rejects the promise, there will be 'uncaught's
        // in multiple places. It also can't resolve the promise, because callers
        // expect for loaded track as a fulfillment callback argument. So it just
        // returns an always-pending promise.
        return new Promise(function () {});
      });
    }

    /**
     * Plays the loaded track by index or the current one.
     *
     * If track is on pause this method will resume the playback from track's
     * current position. If track is finished it will play from the start.
     *
     * @param {number|null} index
     *   (optional) The list index. If omitted, the current track will be played.
     *
     * @return {Playlist}
     *   This Playlist instance.
     *
     * @throws {Error}
     *   If there's no corresponding track in the list.
     */

  }, {
    key: 'play',
    value: function play() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      var track = this.get(index);

      if (!track) {
        throw new Error('Attempt to play nonexistent item.');
      }

      // Reset the track to the start in case it was played earlier and is
      // finished by now or in case it was mistakenly sought out of its duration.
      if (track.getCurrentTime() >= track.getDuration()) {
        track.stop();
      }

      track.play();

      return this;
    }

    /**
     * Pauses the playback of current track.
     *
     * @return {Playlist}
     *   This Playlist instance.
     */

  }, {
    key: 'pause',
    value: function pause() {
      var track = this.getCurrent();

      if (track) {
        track.pause();
      }

      return this;
    }

    /**
     * Skips to the start of previous track in the list, if one exists.
     *
     * @return {Playlist}
     *   This Playlist instance.
     *
     * @throws {Error}
     *   If list is empty or if the current track was removed from the list.
     */

  }, {
    key: 'previous',
    value: function previous() {
      var index = this.getCurrentIndex();

      if (index < 0) {
        throw new Error('Cannot define the previous track.');
      }

      if (this.get(index - 1)) {
        // Reset the previous track to the start.
        this.load(index - 1).then(function (track) {
          return track.stop().play();
        });
      }

      return this;
    }

    /**
     * Skips to the start of next track in the list, if one exists.
     *
     * @return {Playlist}
     *   This Playlist instance.
     *
     * @throws {Error}
     *   If list is empty or if the current track was removed from the list.
     */

  }, {
    key: 'next',
    value: function next() {
      var index = this.getCurrentIndex();

      if (index < 0) {
        throw new Error('Cannot define the next track.');
      }

      if (this.get(index + 1)) {
        // Reset the next track to the start in case it was played earlier.
        this.load(index + 1).then(function (track) {
          return track.stop().play();
        });
      }

      return this;
    }

    /**
     * Indicates whether a current track is currently playing.
     *
     * @return {boolean}
     *   True if audio is playing, false otherwise.
     */

  }, {
    key: 'isPlaying',
    value: function isPlaying() {
      var track = this.getCurrent();

      return track && track.isPlaying();
    }

    /**
     * Shuffles the list.
     *
     * @return {Playlist}
     *   This Playlist instance.
     */

  }, {
    key: 'shuffle',
    value: function shuffle() {
      var i = this.length;
      var tmp = void 0;
      var rnd = void 0;

      while (i) {
        rnd = Math.floor(Math.random() * i);
        --i;
        tmp = this.list[i];
        this.list[i] = this.list[rnd];
        this.list[rnd] = tmp;
      }

      return this;
    }

    /**
     * Adds one or more tracks to the end of the list.
     *
     * @param {...Track} tracks
     *   Track instances to add.
     *
     * @return {Playlist}
     *   This Playlist instance.
     */

  }, {
    key: 'push',
    value: function push() {
      var _list;

      (_list = this.list).push.apply(_list, arguments);

      return this;
    }
  }, {
    key: 'length',
    get: function get() {
      return this.list.length;
    }
  }]);

  return Playlist;
}(EventTarget);

'use strict';

/**
 * The main, public class, providing general methods.
 *
 * @extends EventTarget
 * @global
 */

var WebAudioPlayer = function (_EventTarget3) {
  _inherits(WebAudioPlayer, _EventTarget3);

  /**
   * Constructs a WebAudioPlayer object.
   */
  function WebAudioPlayer() {
    _classCallCheck(this, WebAudioPlayer);

    var _this5 = _possibleConstructorReturn(this, (WebAudioPlayer.__proto__ || Object.getPrototypeOf(WebAudioPlayer)).call(this));

    Utility.player = _this5;

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
      _this5.dispatchEvent('audioprocess');
    };

    var eq = Utility.readStorage('eq');
    var vol = Utility.readStorage('vol');

    if (eq) {
      _this5.setEq(eq);
    }
    if (vol) {
      _this5.setVolume(vol);
    }
    return _this5;
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
     * Returns the new Track instance.
     *
     * @param {string[]} urls
     *   Track sources - an array of mirror URLs pointing to the same audio piece.
     *   Only the first valid URL will be ultimately used.
     *
     * @return {Track}
     *   The Track instance.
     */

  }, {
    key: 'createTrack',
    value: function createTrack(urls) {
      return new Track(urls);
    }

    /**
     * Returns the new Playlist instance.
     *
     * @param {Track[]} list
     *   (optional) Array of Track instances.
     *
     * @return {Playlist}
     *   The Playlist instance.
     */

  }, {
    key: 'createPlaylist',
    value: function createPlaylist() {
      var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      return new Playlist(list);
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
