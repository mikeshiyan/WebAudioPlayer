'use strict';

/**
 * Provides playlist-specific methods.
 *
 * @extends EventTarget
 */
class Playlist extends EventTarget {

  /**
   * Constructs a Playlist object.
   *
   * @param {Track[]} list
   *   (optional) Array of Track instances.
   */
  constructor(list = []) {
    super();

    /**
     * List of tracks to play.
     *
     * @type {Track[]}
     */
    this.list = list;

    /**
     * The current track.
     *
     * @type {Track|null}
     */
    let current = null;

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
    this.setCurrentByIndex = function (index) {
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
    this.getCurrent = function () {
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
    const setAsCurrent = function () {
      if (current && current !== this) {
        current.pause();
      }

      current = this;
    };

    /**
     * Loads the next track in the list.
     */
    const loadNext = () => {
      const index = this.getCurrentIndex();

      if (index >= 0 && this.get(index + 1)) {
        this.load(index + 1);
      }
    };

    /**
     * Adds track event listeners.
     *
     * @listens Playlist#event:trackReady
     */
    this.addEventListener('trackReady', track => {
      track.addEventListener('play', setAsCurrent);
      track.when(0, loadNext);

      /**
       * Skips to the start of next track in the list, if one exists.
       *
       * @listens Track#event:finished
       */
      track.addEventListener('finished', () => this.next());
    });
  }

  /**
   * Returns the list index of current track.
   *
   * @return {number}
   *   Current track's index, or -1 in case of empty list or if the current
   *   track was removed from the list.
   */
  getCurrentIndex() {
    const track = this.getCurrent();

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
   *   looked for.
   *
   * @return {Track|null|undefined}
   *   Either track corresponding to given index, or the current one. Null or
   *   undefined, if there's no corresponding track in the list.
   */
  get(index = null) {
    return index === null ? this.getCurrent() : this.list[index];
  }

  /**
   * Returns the number of tracks in the list.
   *
   * @return {number}
   *   Number of tracks in the list.
   *
   * @readonly
   */
  get length() {
    return this.list.length;
  }

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
  load(index = null) {
    const track = this.get(index);

    if (!track) {
      return Promise.reject(new Error('Attempt to load nonexistent item.'));
    }

    if (!track._playlistPromise) {

      /**
       * Contains playlist-specific promise of a loaded track.
       *
       * @type {Promise}
       */
      track._playlistPromise = track.load().then(track => {

        /**
         * Indicates that the track from the list is loaded.
         *
         * @event Playlist#trackReady
         *
         * @param {Track} track
         *   Instance of the loaded track.
         */
        this.dispatchEvent('trackReady', track);
        return track;
      });
    }

    return track._playlistPromise.catch(error => {
      // Failed to load this track's URLs, try the next one. The list could've
      // changed by this time, search for actual index.
      index = this.list.indexOf(track);

      if (index < 0) {
        throw new Error('Cannot define the next track.');
      }

      // If track is the playlist's current track, set the next one as current.
      if (track === this.getCurrent() && this.get(index + 1)) {
        this.setCurrentByIndex(index + 1);
      }

      if (this.get(index + 1)) {
        return this.load(index + 1);
      }

      // The list's last track, if unable to load, can cause some troubles.
      // If this catch() rejects the promise, there will be 'uncaught's
      // in multiple places. It also can't resolve the promise, because callers
      // expect for loaded track as a fulfillment callback argument. So it just
      // returns an always-pending promise.
      return new Promise(() => {});
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
  play(index = null) {
    const track = this.get(index);

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
  pause() {
    const track = this.getCurrent();

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
  previous() {
    const index = this.getCurrentIndex();

    if (index < 0) {
      throw new Error('Cannot define the previous track.');
    }

    if (this.get(index - 1)) {
      // Reset the previous track to the start.
      this.load(index - 1)
        .then(track => track.stop().play());
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
  next() {
    const index = this.getCurrentIndex();

    if (index < 0) {
      throw new Error('Cannot define the next track.');
    }

    if (this.get(index + 1)) {
      // Reset the next track to the start in case it was played earlier.
      this.load(index + 1)
        .then(track => track.stop().play());
    }

    return this;
  }

  /**
   * Indicates whether a current track is currently playing.
   *
   * @return {boolean}
   *   True if audio is playing, false otherwise.
   */
  isPlaying() {
    const track = this.getCurrent();

    return track && track.isPlaying();
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
  push(...tracks) {
    this.list.push(...tracks);

    return this;
  }

}
