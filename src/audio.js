'use strict';

/**
 * Constructs an Audio object.
 *
 * @constructor
 */
var Audio = function () {
  this.Context = new (window.AudioContext || window.webkitAudioContext)();
  this.OfflineContext = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 2, this.Context.sampleRate);

  this.Analyser = this.Context.createAnalyser();
  this.Gain = this.Context.createGain();
  this.ScriptProcessor = this.Context.createScriptProcessor();

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
};

/**
 * The AnalyserNode object.
 *
 * @type {AnalyserNode}
 */
Audio.prototype.Analyser = null;

/**
 * The AudioContext object.
 *
 * @type {AudioContext}
 */
Audio.prototype.Context = null;

/**
 * The GainNode object.
 *
 * @type {GainNode}
 */
Audio.prototype.Gain = null;

/**
 * The OfflineAudioContext object.
 *
 * @type {OfflineAudioContext}
 */
Audio.prototype.OfflineContext = null;

/**
 * The ScriptProcessorNode object.
 *
 * @type {ScriptProcessorNode}
 */
Audio.prototype.ScriptProcessor = null;

/**
 * Array of BiquadFilterNode objects.
 *
 * @type {BiquadFilterNode[]}
 */
Audio.prototype.filters = [];
