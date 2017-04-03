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
