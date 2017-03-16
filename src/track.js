'use strict';

/**
 * Constructs a Track object.
 *
 * @constructor
 *
 * @param {AudioBuffer} buffer
 *   The AudioBuffer object containing raw audio data.
 * @param {WebAudioPlayer} player
 *   The WebAudioPlayer object.
 */
var Track = function (buffer, player) {
  EventTarget.call(this);

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
   * @see when
   */
  var markers = [];

  /**
   * Contains markers and corresponding callbacks to fire during playback.
   *
   * @type {object[]}
   *
   * @see markers
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
  var track = this;

  /**
   * Fires marker callbacks if corresponding marker is reached.
   */
  var fireMarkers = function () {
    for (var i in markersToFire) {
      if (markersToFire[i].m <= playedTime) {
        setTimeout(markersToFire[i].fn.bind(track), 0);

        // One thing at a time. Remove the marker and break the loop.
        markersToFire.splice(i, 1);
        break;
      }
    }
  };

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

      fireMarkers();

      /**
       * Indicates that the track is playing.
       *
       * @event playing
       */
      track.dispatchEvent('playing');
    }
  };

  /**
   * Plays the loaded audio file or resumes the playback from pause.
   *
   * @return {Track}
   *   The Track object.
   */
  this.play = function () {
    if (!isPlaying && offset < buffer.duration) {
      isPlaying = true;
      offset = Math.max(offset, 0);
      var duration = Math.max(buffer.duration - offset, 0);

      player.addEventListener('audioprocess', audioprocess);

      source = player.getAudio().Context.createBufferSource();
      source.connect(player.getAudio().Analyser);
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
           * @event finished
           */
          track.dispatchEvent('finished');
          player.removeEventListener('audioprocess', audioprocess);

          // Set all markers back to array.
          markersToFire = markers.slice(0);
        }
      };

      playStartedAt = player.getAudio().Context.currentTime;
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
    player.removeEventListener('audioprocess', audioprocess);
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
    var wasPlaying = isPlaying;
    isPlaying = false;

    if (source) {
      source.stop();
    }

    if (wasPlaying) {
      offset += player.getAudio().Context.currentTime - playStartedAt;
    }

    player.removeEventListener('audioprocess', audioprocess);

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
   * @param {function} callback
   *   A callback to execute when marker is reached.
   *
   * @return {Track}
   *   The Track object.
   *
   * @throws {TypeError}
   *   If marker is negative.
   *
   * @see getPlayedTime
   */
  this.when = function (marker, callback) {
    if (marker < 0) {
      throw new TypeError('Marker parameter accepts non-negative numbers only.');
    }

    var item = {m: marker, fn: callback};
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
    return isPlaying ? player.getAudio().Context.currentTime - playStartedAt + offset : offset;
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

Track.prototype = Object.create(EventTarget.prototype);
Track.prototype.constructor = Track;
