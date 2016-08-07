/**
 * @file
 * Audio player using Web Audio API.
 */

(function () {

  'use strict';

  /**
   * Contains various operational data.
   *
   * @type {object}
   */
  var State = {};

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
   *
   * @type {number}
   */
  State.offset = 0;

  /**
   * Indicates the most recent moment when the playback was started.
   *
   * This variable contains a number of seconds on the AudioContext time line.
   *
   * @type {number}
   */
  State.playStartedAt = 0;

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
    var audio = this;

    State.isPlaying = true;

    this.BufferSource = this.Context.createBufferSource();
    this.BufferSource.connect(this.Analyser);
    this.BufferSource.buffer = buffer;

    this.BufferSource.onended = function () {
      this.finished = true;

      // Check if the actual source object is finished, but the state is still
      // 'playing'. This means that no new source was started.
      if (audio.BufferSource.finished && State.isPlaying) {
        State.isPlaying = false;
        State.offset = audio.BufferSource.buffer.duration;
      }
    };

    var offset = Math.max(State.offset, 0);
    var duration = Math.max(this.BufferSource.buffer.duration - offset, 0);

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
   * Contains a public reference to the Audio object.
   *
   * @type {Audio}
   */
  WebAudioPlayer.audio = Audio.create();

  /**
   * Contains raw audio data.
   *
   * @type {AudioBuffer}
   */
  WebAudioPlayer.buffer = null;

  /**
   * Loads the audio file by URL into buffer.
   *
   * @param {string} url
   *   URL of the file.
   *
   * @returns {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  WebAudioPlayer.loadUrl = function (url) {
    var player = this;
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';

    xhr.addEventListener('load', function () {
      if (xhr.status == 200 || xhr.status == 206) {
        player.audio.OfflineContext.decodeAudioData(xhr.response).then(function (data) {
          player.buffer = data;
        });
      }
    });

    xhr.send();

    return this;
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
      this.audio.start(this.buffer);
    }

    return this;
  };

  /**
   * Stops the playback and sets the position to the start.
   *
   * @returns {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  WebAudioPlayer.stop = function () {
    State.offset = 0;
    this.audio.stop();

    return this;
  };

  /**
   * Pauses the playback.
   *
   * @returns {WebAudioPlayer}
   *   The WebAudioPlayer object.
   */
  WebAudioPlayer.pause = function () {
    if (State.isPlaying) {
      State.offset += this.audio.Context.currentTime - State.playStartedAt;
    }

    this.audio.stop();

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

    State.offset = offset;

    if (State.isPlaying) {
      this.audio.stop();
      this.play();
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
    var position = State.offset;

    if (State.isPlaying) {
      position += this.audio.Context.currentTime - State.playStartedAt;
    }

    return position;
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
    this.audio.Gain.gain.value = gain;

    return this;
  };

  /**
   * Gets the current value of the playback volume level.
   *
   * @returns {number}
   *   Previously set value.
   */
  WebAudioPlayer.getVolume = function () {
    return this.audio.Gain.gain.value;
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
      if (bands.hasOwnProperty(i) && this.audio.filters[i]) {
        this.audio.filters[i].gain.value = bands[i];
      }
    }

    return this;
  };

  /**
   * Gets the current band levels of the equalizer.
   *
   * @returns {number[]}
   *   Array of 10 numbers.
   */
  WebAudioPlayer.getEq = function () {
    var bands = [];

    this.audio.filters.forEach(function (filter) {
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

  window.WebAudioPlayer = WebAudioPlayer;

})();
