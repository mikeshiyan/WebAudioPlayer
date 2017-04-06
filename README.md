# Web Audio Player
JS audio player, using
[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

## Synopsis
The player uses native JavaScript features. No flash, no HTML5 audio elements.

Features:
* **No UI**. Yeap, it's a feature. You can create any markup you wish, style it
  as you wish, and just use JS methods and events to control the playback.
* 10-bands **equalizer**.
* **Rememberable** settings using localStorage.
* **Playlists**.
* URL **mirrors**. Instead of one URL you can supply an array of them. The first
  one that resolves will be decoded.
* Easy **events** subscription.
* Time **markers**. These are callbacks that are executed after specified amount
  of playback time.
* Also the volume control, repeatable lists, play / stop / pause / seek / next /
  previous / shuffle methods, various time getters, and many more.

To submit bug reports and feature suggestions, or to track changes:
https://github.com/mikeshiyan/WebAudioPlayer/issues

## Installation and requirements
This library has no dependencies on other libraries. But it depends on native
JavaScript features, like Web Audio API. So make sure your browser supports
them.

There are multiple ways to download the library to your project.

* With [NPM](https://www.npmjs.com/package/web_audio_player/tutorial):

      npm install --save web_audio_player

* With [Bower](https://bower.io/#install-packages):

      bower install --save web_audio_player

* With [JSPM](http://jspm.io/docs/installing-packages.html):

      jspm install web_audio_player=github:mikeshiyan/WebAudioPlayer

* Downloading or cloning the library directly from
  [GitHub](https://github.com/mikeshiyan/WebAudioPlayer/releases).

Whichever way you choose to install, you'll get a 'dist' directory with multiple
JS files. Each of them is the full library with the same functionality, just in
different format. So only one of them needs to be included in your project:

* **web_audio_player.es6.js** is the most "human-readable" one. Uses strict
  [ECMAScript 2015](http://www.ecma-international.org/ecma-262/6.0/) language
  syntax. Defines the global `WebAudioPlayer` class.

* **web_audio_player.js** is the transpiled version of the above for browsers
  that do not support ECMAScript 2015 syntax yet. Again the `WebAudioPlayer`
  class is available in the global scope.

* **web_audio_player.min.js** is the minified version of the above to load less
  bytes by browsers. The `WebAudioPlayer` class is still available as the global
  one.

* **web_audio_player.common.js** is the
  [CommonJS](http://wiki.commonjs.org/wiki/CommonJS) module. Based on the
  transpiled but not minified version above. To get the `WebAudioPlayer` class
  in your code:

      var WebAudioPlayer = require('web_audio_player');

## Usage
Whichever distributable file you choose to include, you get a `WebAudioPlayer`
class, which you can instantiate like so:

    var player = new WebAudioPlayer();

Let this instance be a single for your project - store the variable somewhere
your code will be able to get it, to not instantiate a new object.

Now you may use public methods of the library to load audio files, control the
playback, etc. See [demo](demo/demo.html) and the [API](API.md#WebAudioPlayer).
