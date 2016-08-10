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

    this.eventListeners[type].push(callback);
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
   * @returns {Promise}
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
        if (xhr.status == 200 || xhr.status == 206) {
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
        }
      }
    }
  };

  /**
   * Contains various operational data.
   *
   * @type {object}
   */
  var State = {};

  /**
   * Indicates the current playback position.
   *
   * This variable contains a number of seconds from the start of an audio file.
   *
   * @type {number}
   */
  State.currentTime = 0;

  /**
   * Indicates whether an audio is currently playing.
   *
   * @type {boolean}
   */
  State.isPlaying = false;

  /**
   * Indicates the offset with which the most recent playback was started.
   *
   * This variable contains a number of seconds from the start of an audio file.
   * Offset must be changed only when !State.isPlaying, because other variables
   * (for example, currentTime) are calculated based on it and current playback
   * state.
   *
   * @type {number}
   */
  State.offset = 0;

  /**
   * Indicates the time the track was actually played.
   *
   * This variable contains a number of seconds from the first play() of current
   * track until its finish or explicit stop(), excluding pauses and skips. It
   * means that this variable only evenly increases when playing and never jumps
   * back or forward.
   *
   * @type {number}
   */
  State.playedTime = 0;

  /**
   * Indicates the most recent moment when the playback was started.
   *
   * This variable contains a number of seconds on the AudioContext time line.
   *
   * @type {number}
   */
  State.playStartedAt = 0;

  /**
   * Contains the total amount of time skipped when changing playback positions.
   *
   * This variable contains a sum of time jumps in seconds. The number can be
   * negative in case of backward jumps.
   *
   * @type {number}
   */
  State.skipped = 0;

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
   * The AudioBufferSourceNode object.
   *
   * @type {AudioBufferSourceNode}
   */
  Audio.BufferSource = null;

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
   * @returns {Audio}
   *   The Audio object.
   */
  Audio.create = function () {
    this.Context = new (window.AudioContext || window.webkitAudioContext);
    this.OfflineContext = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 2, this.Context.sampleRate);

    this.Analyser = this.Context.createAnalyser();
    this.Gain = this.Context.createGain();
    this.ScriptProcessor = this.Context.createScriptProcessor();

    this.ScriptProcessor.onaudioprocess = function () {
      if (State.isPlaying) {
        State.currentTime = State.offset + Audio.Context.currentTime - State.playStartedAt;
        // Played time is only being increased while playing.
        State.playedTime = State.currentTime - State.skipped;

        Utility.dispatchEvent('playing', State.playedTime, State.currentTime);
      }
      else {
        // Current time needs to reflect the offset while not playing.
        State.currentTime = State.offset;
      }
    };

    this.filters = [];
    var frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

    for (var i in frequencies) {
      this.filters[i] = this.Context.createBiquadFilter();
      this.filters[i].frequency.value = frequencies[i];
      this.filters[i].type = i == 0 ? 'lowshelf' : i == 9 ? 'highshelf' : 'peaking';

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
   * Starts playing audio from buffer.
   *
   * This method creates new audio source, connects it, and starts playback
   * immediately. Offset and duration parameters are taken in real time from
   * the State object.
   *
   * This method also updates the State object with actual values.
   *
   * @param {AudioBuffer} buffer
   *   The AudioBuffer object.
   */
  Audio.start = function (buffer) {
    var offset = Math.max(State.offset, 0);
    var duration = Math.max(buffer.duration - offset, 0);

    State.isPlaying = true;

    // Reset some state variables if it's another audio file.
    if (this.BufferSource && this.BufferSource.buffer != buffer) {
      State.skipped = offset;
    }

    this.BufferSource = this.Context.createBufferSource();
    this.BufferSource.connect(this.Analyser);
    this.BufferSource.buffer = buffer;

    this.BufferSource.onended = function () {
      this.finished = true;

      // Check if the actual source object is finished, but the state is still
      // 'playing'. This means that no new source was started.
      if (Audio.BufferSource.finished && State.isPlaying) {
        State.isPlaying = false;
        State.skipped = State.offset = Audio.BufferSource.buffer.duration;

        Utility.dispatchEvent('finished');
      }
    };

    State.playStartedAt = this.Context.currentTime;
    this.BufferSource.start(0, offset, duration);
  };

  /**
   * Stops playing audio.
   *
   * This method also updates the State object with actual values.
   */
  Audio.stop = function () {
    State.isPlaying = false;

    if (this.BufferSource) {
      this.BufferSource.stop();
    }
  };

  /**
   * Provides an audio player.
   *
   * @type {object}
   */
  var WebAudioPlayer = {};

  /**
   * Contains raw audio data.
   *
   * @type {AudioBuffer}
   */
  WebAudioPlayer.buffer = null;

  /**
   * Creates WebAudioPlayer object.
   *
   * @returns {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  WebAudioPlayer.create = function () {
    Audio.create();

    var data;
    if (data = this.readStorage('eq')) {
      this.setEq(data);
    }
    if (data = this.readStorage('vol')) {
      this.setVolume(data);
    }

    return this;
  };

  /**
   * Returns the Audio object.
   *
   * @returns {Audio}
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
   * @returns {Promise}
   *   The Promise object.
   *   Fulfill callback won't receive arguments.
   *   Reject callback arguments:
   *   - {Error} The Error object.
   */
  WebAudioPlayer.loadUrl = function (urls) {
    var player = this;

    return urls.reduce(function (sequence, url) {
      return sequence.catch(function () {
        return Utility.getArrayBuffer(url).then(function (data) {
          return Audio.OfflineContext.decodeAudioData(data);
        });
      });
    }, Promise.reject())
      .then(function (data) {
        player.buffer = data;
      })
      .catch(function () {
        throw new Error('No valid audio URLs provided.');
      });
  };

  /**
   * Plays the loaded audio file or resumes the playback from pause.
   *
   * @returns {WebAudioPlayer}
   *   The WebAudioPlayer object.
   *
   * @throws {Error}
   *   If audio file is not loaded prior to call this method.
   */
  WebAudioPlayer.play = function () {
    if (!this.buffer) {
      throw new Error('Audio file is not loaded.');
    }

    if (!State.isPlaying) {
      Audio.start(this.buffer);
    }

    return this;
  };

  /**
   * Stops the playback and resets the track state.
   *
   * This method resets the current time position and the skipped time counter,
   * which impacts the played time in the way that next play() will count it
   * from 0.
   *
   * @returns {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  WebAudioPlayer.stop = function () {
    Audio.stop();
    State.skipped = State.offset = 0;

    return this;
  };

  /**
   * Pauses the playback.
   *
   * @returns {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  WebAudioPlayer.pause = function () {
    var wasPlaying = State.isPlaying;
    Audio.stop();

    if (wasPlaying) {
      // Do not use State.currentTime directly, because it's calculated
      // asynchronously and based on offset.
      State.offset += Audio.Context.currentTime - State.playStartedAt;
    }

    return this;
  };

  /**
   * Sets the playback position.
   *
   * @param {number} offset
   *   Seconds from the start of an audio file.
   *
   * @returns {WebAudioPlayer}
   *   The WebAudioPlayer object.
   *
   * @throws {TypeError}
   *   If offset is negative.
   */
  WebAudioPlayer.setPosition = function (offset) {
    if (offset < 0) {
      throw new TypeError('Offset parameter accepts non-negative numbers only.');
    }

    State.skipped += offset - State.currentTime;

    if (State.isPlaying) {
      Audio.stop();
      State.offset = offset;
      this.play();
    }
    else {
      State.offset = offset;
    }

    return this;
  };

  /**
   * Gets the current playback position.
   *
   * @returns {number}
   *   Seconds from the start of an audio file.
   */
  WebAudioPlayer.getPosition = function () {
    return State.currentTime;
  };

  /**
   * Gets the time the track was actually played.
   *
   * @returns {number}
   *   Seconds from the first play() of current track, excluding pauses and
   *   skips.
   */
  WebAudioPlayer.getPlayedTime = function () {
    return State.playedTime;
  };

  /**
   * Gets the duration of current audio source.
   *
   * @returns {number|undefined}
   *   The duration in seconds, or undefined if there's no audio source.
   */
  WebAudioPlayer.getDuration = function () {
    if (Audio.BufferSource) {
      return Audio.BufferSource.buffer.duration;
    }
  };

  /**
   * Sets the playback volume to new level.
   *
   * @param {number} gain
   *   Number between 0 and 1.
   *
   * @returns {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  WebAudioPlayer.setVolume = function (gain) {
    Audio.Gain.gain.value = gain;

    return this.updateStorage('vol', gain);
  };

  /**
   * Gets the current value of the playback volume level.
   *
   * @returns {number}
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
   * @returns {WebAudioPlayer}
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
   * @returns {number[]}
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
   * Indicates whether an audio is currently playing.
   *
   * @returns {boolean}
   *   True if audio is playing, false otherwise.
   */
  WebAudioPlayer.isPlaying = function () {
    return State.isPlaying;
  };

  /**
   * Updates data in the storage.
   *
   * @param {string} key
   *   Variable key.
   * @param {*} value
   *   Variable value.
   *
   * @returns {WebAudioPlayer}
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
   * @returns {*|null|undefined}
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
   * @returns {WebAudioPlayer}
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
   * @returns {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  WebAudioPlayer.removeEventListener = function (type, callback) {
    Utility.removeEventListener(type, callback);

    return this;
  };

  window.WebAudioPlayer = WebAudioPlayer.create();

})();
