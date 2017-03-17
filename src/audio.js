'use strict';

/**
 * Links to the internal AudioContext and related objects.
 *
 * @namespace
 */
class Audio {

  /**
   * Constructs an Audio object.
   *
   * @constructor
   */
  constructor() {

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

    const frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

    for (let i = 0; i < 10; i++) {
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
  }

}
