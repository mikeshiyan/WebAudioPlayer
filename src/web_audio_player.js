'use strict';

/**
 * The main, public class, providing general methods.
 *
 * @namespace
 */
class WebAudioPlayer extends EventTarget {

  /**
   * Constructs a WebAudioPlayer object.
   *
   * @constructor
   */
  constructor() {
    super();

    /**
     * The Audio object.
     *
     * @type {Audio}
     */
    let audio = new Audio();

    /**
     * Contains this WebAudioPlayer object.
     *
     * @type {WebAudioPlayer}
     */
    let player = this;

    /**
     * Returns the Audio object.
     *
     * @return {Audio}
     *   The Audio object.
     */
    this.getAudio = function () {
      return audio;
    };

    /**
     * Runs code while audio is processing.
     *
     * @fires audioprocess
     */
    audio.ScriptProcessor.onaudioprocess = function () {

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
      player.dispatchEvent('audioprocess');
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
   * Loads the audio file by URL into buffer.
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
   * @return {Promise}
   *   The Promise object.
   *   Fulfill callback arguments:
   *   - {Track} The Track object.
   *   Reject callback arguments:
   *   - {Error} The Error object.
   */
  loadUrl(urls) {
    let player = this;
    let promise = Utility.getUrlPromise(urls);

    if (!promise) {
      promise = urls.reduce(function (sequence, url) {
        return sequence.catch(function () {
          return Utility.getArrayBuffer(url).then(function (data) {
            return player.getAudio().OfflineContext.decodeAudioData(data);
          });
        });
      }, Promise.reject())
        .then(function (data) {
          Utility.removeUrlPromise(urls);
          return new Track(data, player);
        })
        .catch(function () {
          throw new Error('No valid audio URLs provided.');
        });

      Utility.setUrlPromise(urls, promise);
    }

    return promise;
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
    this.getAudio().Gain.gain.value = gain;

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
    return this.getAudio().Gain.gain.value;
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
    for (let i in bands) {
      if (bands.hasOwnProperty(i) && this.getAudio().filters[i]) {
        this.getAudio().filters[i].gain.value = bands[i];
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
    let bands = [];

    this.getAudio().filters.forEach(function (filter) {
      bands.push(filter.gain.value);
    });

    return bands;
  }

}
