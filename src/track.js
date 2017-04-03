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
