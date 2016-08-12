/**
 * @file
 * Audio player using Web Audio API.
 */

(function () {

  'use strict';

  /**
   * Contains various utility methods.
   *
   * @type {object}
   */
  var Utility = {};

  /**
   * Contains event listeners.
   *
   * Object keys are event types, and values are arrays of callbacks.
   *
   * @type {object}
   */
  Utility.eventListeners = {};

  /**
   * Registers an event handler of a specific type.
   *
   * @param {string} type
   *   Event type to listen for.
   * @param {function} callback
   *   Event handler to call.
   */
  Utility.addEventListener = function (type, callback) {
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
   * Dispatches an event.
   *
   * @param {string} type
   *   Event type to dispatch.
   */
  Utility.dispatchEvent = function (type) {
    if (type in this.eventListeners) {
      var stack = this.eventListeners[type];
      var args = Array.prototype.slice.call(arguments, 1);

      for (var i = 0, l = stack.length; i < l; i++) {
        stack[i].apply(null, args);
      }
    }
  };

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
   * Removes an event listener.
   *
   * @param {string} type
   *   Event type to remove.
   * @param {function} callback
   *   Event handler to remove.
   */
  Utility.removeEventListener = function (type, callback) {
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
   * Holds various Audio objects created from AudioContext.
   *
   * @type {object}
   */
  var Audio = {};

  /**
   * The AnalyserNode object.
   *
   * @type {AnalyserNode}
   */
  Audio.Analyser = null;

  /**
   * The AudioContext object.
   *
   * @type {AudioContext}
   */
  Audio.Context = null;

  /**
   * The GainNode object.
   *
   * @type {GainNode}
   */
  Audio.Gain = null;

  /**
   * The OfflineAudioContext object.
   *
   * @type {OfflineAudioContext}
   */
  Audio.OfflineContext = null;

  /**
   * The ScriptProcessorNode object.
   *
   * @type {ScriptProcessorNode}
   */
  Audio.ScriptProcessor = null;

  /**
   * Array of BiquadFilterNode objects.
   *
   * @type {BiquadFilterNode[]}
   */
  Audio.filters = [];

  /**
   * Creates Audio object.
   *
   * @return {Audio}
   *   The Audio object.
   */
  Audio.create = function () {
    this.Context = new (window.AudioContext || window.webkitAudioContext);
    this.OfflineContext = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 2, this.Context.sampleRate);

    this.Analyser = this.Context.createAnalyser();
    this.Gain = this.Context.createGain();
    this.ScriptProcessor = this.Context.createScriptProcessor();

    /**
     * Runs code while audio is processing.
     *
     * @fires audioprocess
     */
    this.ScriptProcessor.onaudioprocess = function () {

      /**
       * Indicates that audio is processing.
       *
       * This event is fired constantly during the life of an Audio object and
       * should not be generally listened for. Track objects use this event to
       * fire their own 'playing' event to indicate when the corresponding track
       * is actually playing.
       *
       * @event audioprocess
       */
      Utility.dispatchEvent('audioprocess');
    };

    this.filters = [];
    var frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

    for (var i = 0; i < 10; i++) {
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

    return this;
  };

  /**
   * Constructs a Track object.
   *
   * @constructor
   *
   * @param {AudioBuffer} buffer
   *   The AudioBuffer object containing raw audio data.
   */
  var Track = function (buffer) {

    /**
     * Indicates whether an audio is currently playing.
     *
     * @type {boolean}
     */
    var isPlaying = false;

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
    var track = this;

    /**
     * Makes the routine work while track is playing.
     *
     * @fires playing
     */
    var audioprocess = function () {
      if (isPlaying) {
        // Played time is only being increased while playing. When not playing
        // it remains with the same value, not minding of actual value of
        // the 'skipped' var.
        playedTime = track.getCurrentTime() - skipped;

        /**
         * Indicates that the track is playing.
         *
         * @param {Track} track
         *   The Track object.
         *
         * @event playing
         */
        Utility.dispatchEvent('playing', track);
      }
    };

    /**
     * Plays the loaded audio file or resumes the playback from pause.
     *
     * @return {Track}
     *   The Track object.
     */
    this.play = function () {
      if (!isPlaying) {
        isPlaying = true;
        offset = Math.max(offset, 0);
        var duration = Math.max(buffer.duration - offset, 0);

        Utility.addEventListener('audioprocess', audioprocess);

        source = Audio.Context.createBufferSource();
        source.connect(Audio.Analyser);
        source.buffer = buffer;

        /**
         * Runs code in response to the audio track finishing playback.
         *
         * @fires finished
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
             * @param {Track} track
             *   The Track object.
             *
             * @event finished
             */
            Utility.dispatchEvent('finished', track);
            Utility.removeEventListener('audioprocess', audioprocess);
          }
        };

        playStartedAt = Audio.Context.currentTime;
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
      Utility.removeEventListener('audioprocess', audioprocess);

      return this;
    };

    /**
     * Pauses the playback.
     *
     * @return {Track}
     *   The Track object.
     */
    this.pause = function () {
      var wasPlaying = isPlaying;
      isPlaying = false;

      if (source) {
        source.stop();
      }

      if (wasPlaying) {
        offset += Audio.Context.currentTime - playStartedAt;
      }

      Utility.removeEventListener('audioprocess', audioprocess);

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
     * Gets the current playback position.
     *
     * @return {number}
     *   Seconds from the start of an audio file.
     */
    this.getCurrentTime = function () {
      return isPlaying ? Audio.Context.currentTime - playStartedAt + offset : offset;
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
     */
    this.getDuration = function () {
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

  };

  /**
   * Provides an audio player.
   *
   * @type {object}
   */
  var WebAudioPlayer = {};

  /**
   * Creates WebAudioPlayer object.
   *
   * @return {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  WebAudioPlayer.create = function () {
    Audio.create();

    var eq = this.readStorage('eq');
    var vol = this.readStorage('vol');

    if (eq) {
      this.setEq(eq);
    }
    if (vol) {
      this.setVolume(vol);
    }

    return this;
  };

  /**
   * Returns the Audio object.
   *
   * @return {Audio}
   *   The Audio object.
   */
  WebAudioPlayer.getAudio = function () {
    return Audio;
  };

  /**
   * Loads the audio file by URL into buffer.
   *
   * This method takes an array of URLs (presumably pointing to the same audio
   * file) as the only argument, and will stop and fulfill the promise after
   * the first valid audio URL found.
   *
   * @param {string[]} urls
   *   An array of mirror URLs.
   *
   * @return {Promise}
   *   The Promise object.
   *   Fulfill callback arguments:
   *   - {Track} The Track object.
   *   Reject callback arguments:
   *   - {Error} The Error object.
   */
  WebAudioPlayer.loadUrl = function (urls) {
    return urls.reduce(function (sequence, url) {
      return sequence.catch(function () {
        return Utility.getArrayBuffer(url).then(function (data) {
          return Audio.OfflineContext.decodeAudioData(data);
        });
      });
    }, Promise.reject())
      .then(function (data) {
        return new Track(data);
      })
      .catch(function () {
        throw new Error('No valid audio URLs provided.');
      });
  };

  /**
   * Sets the playback volume to new level.
   *
   * @param {number} gain
   *   Number between 0 and 1.
   *
   * @return {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  WebAudioPlayer.setVolume = function (gain) {
    Audio.Gain.gain.value = gain;

    return this.updateStorage('vol', gain);
  };

  /**
   * Gets the current value of the playback volume level.
   *
   * @return {number}
   *   Previously set value.
   */
  WebAudioPlayer.getVolume = function () {
    return Audio.Gain.gain.value;
  };

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
  WebAudioPlayer.setEq = function (bands) {
    for (var i in bands) {
      if (bands.hasOwnProperty(i) && Audio.filters[i]) {
        Audio.filters[i].gain.value = bands[i];
      }
    }

    return this.updateStorage('eq', this.getEq());
  };

  /**
   * Gets the current band levels of the equalizer.
   *
   * @return {number[]}
   *   Array of 10 numbers.
   */
  WebAudioPlayer.getEq = function () {
    var bands = [];

    Audio.filters.forEach(function (filter) {
      bands.push(filter.gain.value);
    });

    return bands;
  };

  /**
   * Updates data in the storage.
   *
   * @param {string} key
   *   Variable key.
   * @param {*} value
   *   Variable value.
   *
   * @return {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  WebAudioPlayer.updateStorage = function (key, value) {
    if (typeof localStorage != 'undefined') {
      localStorage.setItem('WebAudioPlayer.' + key, JSON.stringify(value));
    }

    return this;
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
  WebAudioPlayer.readStorage = function (key) {
    if (typeof localStorage != 'undefined') {
      return JSON.parse(localStorage.getItem('WebAudioPlayer.' + key));
    }
  };

  /**
   * Registers an event handler of a specific type.
   *
   * @param {string} type
   *   Event type to listen for.
   * @param {function} callback
   *   Event handler to call.
   *
   * @return {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  WebAudioPlayer.addEventListener = function (type, callback) {
    Utility.addEventListener(type, callback);

    return this;
  };

  /**
   * Removes an event listener.
   *
   * @param {string} type
   *   Event type to remove.
   * @param {function} callback
   *   Event handler to remove.
   *
   * @return {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  WebAudioPlayer.removeEventListener = function (type, callback) {
    Utility.removeEventListener(type, callback);

    return this;
  };

  window.WebAudioPlayer = WebAudioPlayer.create();

})();
