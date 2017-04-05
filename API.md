## Classes

<dl>
<dt><a href="#Utility">Utility</a></dt>
<dd><p>Contains various utility methods.</p>
</dd>
<dt><a href="#EventTarget">EventTarget</a></dt>
<dd><p>Provides methods to work with events.</p>
<p>Meant to be extended by other classes.</p>
</dd>
<dt><a href="#Audio">Audio</a></dt>
<dd><p>Links to the internal AudioContext and related objects.</p>
</dd>
<dt><a href="#Track">Track</a> ⇐ <code><a href="#EventTarget">EventTarget</a></code></dt>
<dd><p>Provides audiotrack-specific methods.</p>
</dd>
<dt><a href="#Playlist">Playlist</a> ⇐ <code><a href="#EventTarget">EventTarget</a></code></dt>
<dd><p>Provides playlist-specific methods.</p>
</dd>
<dt><a href="#WebAudioPlayer">WebAudioPlayer</a> ⇐ <code><a href="#EventTarget">EventTarget</a></code></dt>
<dd><p>The main, public class, providing general methods.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#eventListener">eventListener</a> : <code>function</code></dt>
<dd><p>Callback to execute on events.</p>
<p>The callback context is the object on which the addEventListener() method was
called.</p>
</dd>
<dt><a href="#markerCallback">markerCallback</a> : <code>function</code></dt>
<dd><p>Callback to execute on time markers.</p>
</dd>
</dl>

<a name="Utility"></a>

## Utility
Contains various utility methods.

**Kind**: global class  

* [Utility](#Utility)
    * [.audio](#Utility.audio) ⇒ <code>[Audio](#Audio)</code>
    * [.player](#Utility.player)
    * [.player](#Utility.player) ⇒ <code>[WebAudioPlayer](#WebAudioPlayer)</code>
    * [.getArrayBuffer(url)](#Utility.getArrayBuffer) ⇒ <code>Promise.&lt;ArrayBuffer, Error&gt;</code>
    * [.loadUrl(urls)](#Utility.loadUrl) ⇒ <code>Promise.&lt;AudioBuffer, Error&gt;</code>
    * [.getUrlPromise(urls)](#Utility.getUrlPromise) ⇒ <code>Promise.&lt;AudioBuffer, Error&gt;</code> &#124; <code>undefined</code>
    * [.removeUrlPromise(urls)](#Utility.removeUrlPromise)
    * [.setUrlPromise(urls, promise)](#Utility.setUrlPromise)
    * [.readStorage(key)](#Utility.readStorage) ⇒ <code>\*</code> &#124; <code>null</code> &#124; <code>undefined</code>
    * [.updateStorage(key, value)](#Utility.updateStorage)

<a name="Utility.audio"></a>

### Utility.audio ⇒ <code>[Audio](#Audio)</code>
Returns the Audio object.

**Kind**: static property of <code>[Utility](#Utility)</code>  
**Returns**: <code>[Audio](#Audio)</code> - The Audio object.  
**Read only**: true  
<a name="Utility.player"></a>

### Utility.player
Saves the WebAudioPlayer instance to a statically cached variable.

**Kind**: static property of <code>[Utility](#Utility)</code>  
**Throws**:

- <code>TypeError</code> If provided parameter is not a WebAudioPlayer instance.


| Param | Type | Description |
| --- | --- | --- |
| player | <code>[WebAudioPlayer](#WebAudioPlayer)</code> | The WebAudioPlayer instance. |

<a name="Utility.player"></a>

### Utility.player ⇒ <code>[WebAudioPlayer](#WebAudioPlayer)</code>
Returns the WebAudioPlayer instance.

**Kind**: static property of <code>[Utility](#Utility)</code>  
**Returns**: <code>[WebAudioPlayer](#WebAudioPlayer)</code> - The WebAudioPlayer instance.  
<a name="Utility.getArrayBuffer"></a>

### Utility.getArrayBuffer(url) ⇒ <code>Promise.&lt;ArrayBuffer, Error&gt;</code>
Makes an XMLHttpRequest to url to get an array buffer.

**Kind**: static method of <code>[Utility](#Utility)</code>  
**Returns**: <code>Promise.&lt;ArrayBuffer, Error&gt;</code> - The Promise object.
  Fulfill callback arguments:
  - {ArrayBuffer} The ArrayBuffer object.
  Reject callback arguments:
  - {Error} The Error object.  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | URL to get. |

<a name="Utility.loadUrl"></a>

### Utility.loadUrl(urls) ⇒ <code>Promise.&lt;AudioBuffer, Error&gt;</code>
Loads the audio file by URL into buffer.

**Kind**: static method of <code>[Utility](#Utility)</code>  
**Returns**: <code>Promise.&lt;AudioBuffer, Error&gt;</code> - The Promise object.
  Fulfill callback arguments:
  - {AudioBuffer} The AudioBuffer object containing raw audio data.
  Reject callback arguments:
  - {Error} The Error object.  

| Param | Type | Description |
| --- | --- | --- |
| urls | <code>Array.&lt;string&gt;</code> | An array of mirror URLs. |

<a name="Utility.getUrlPromise"></a>

### Utility.getUrlPromise(urls) ⇒ <code>Promise.&lt;AudioBuffer, Error&gt;</code> &#124; <code>undefined</code>
Gets a promise about loading URLs.

**Kind**: static method of <code>[Utility](#Utility)</code>  
**Returns**: <code>Promise.&lt;AudioBuffer, Error&gt;</code> &#124; <code>undefined</code> - The Promise object if one exists at least for one of given URLs.
  Fulfill callback arguments:
  - {AudioBuffer} The AudioBuffer object containing raw audio data.
  Reject callback arguments:
  - {Error} The Error object.  

| Param | Type | Description |
| --- | --- | --- |
| urls | <code>Array.&lt;string&gt;</code> | An array of mirror URLs. |

<a name="Utility.removeUrlPromise"></a>

### Utility.removeUrlPromise(urls)
Removes promises about loading URLs.

**Kind**: static method of <code>[Utility](#Utility)</code>  

| Param | Type | Description |
| --- | --- | --- |
| urls | <code>Array.&lt;string&gt;</code> | An array of mirror URLs. |

<a name="Utility.setUrlPromise"></a>

### Utility.setUrlPromise(urls, promise)
Saves the promise about loading URLs in temporary static cache.

**Kind**: static method of <code>[Utility](#Utility)</code>  

| Param | Type | Description |
| --- | --- | --- |
| urls | <code>Array.&lt;string&gt;</code> | An array of mirror URLs. |
| promise | <code>Promise</code> | The Promise object. |

<a name="Utility.readStorage"></a>

### Utility.readStorage(key) ⇒ <code>\*</code> &#124; <code>null</code> &#124; <code>undefined</code>
Reads data from the storage.

**Kind**: static method of <code>[Utility](#Utility)</code>  
**Returns**: <code>\*</code> &#124; <code>null</code> &#124; <code>undefined</code> - Variable value if it exists in the storage, null if it doesn't, or
  undefined in case of undefined local storage.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Variable key. |

<a name="Utility.updateStorage"></a>

### Utility.updateStorage(key, value)
Updates data in the storage.

**Kind**: static method of <code>[Utility](#Utility)</code>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Variable key. |
| value | <code>\*</code> | Variable value. |

<a name="EventTarget"></a>

## EventTarget
Provides methods to work with events.

Meant to be extended by other classes.

**Kind**: global class  

* [EventTarget](#EventTarget)
    * [new EventTarget()](#new_EventTarget_new)
    * [.eventListeners](#EventTarget+eventListeners) : <code>object</code>
    * [.addEventListener(type, callback)](#EventTarget+addEventListener)
    * [.removeEventListener(type, callback)](#EventTarget+removeEventListener)
    * [.dispatchEvent(type, ...other_arguments)](#EventTarget+dispatchEvent)

<a name="new_EventTarget_new"></a>

### new EventTarget()
Constructs an EventTarget object.

<a name="EventTarget+eventListeners"></a>

### eventTarget.eventListeners : <code>object</code>
Contains event listeners.

Object keys are event types, and values are arrays of callbacks.

**Kind**: instance property of <code>[EventTarget](#EventTarget)</code>  
<a name="EventTarget+addEventListener"></a>

### eventTarget.addEventListener(type, callback)
Registers an event handler of a specific type.

**Kind**: instance method of <code>[EventTarget](#EventTarget)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Event type to listen for. |
| callback | <code>[eventListener](#eventListener)</code> | Event handler to call when event occurs. |

<a name="EventTarget+removeEventListener"></a>

### eventTarget.removeEventListener(type, callback)
Removes an event listener.

**Kind**: instance method of <code>[EventTarget](#EventTarget)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Event type. |
| callback | <code>[eventListener](#eventListener)</code> | Event handler to remove. |

<a name="EventTarget+dispatchEvent"></a>

### eventTarget.dispatchEvent(type, ...other_arguments)
Dispatches an event.

**Kind**: instance method of <code>[EventTarget](#EventTarget)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Event type to dispatch. |
| ...other_arguments | <code>\*</code> | Other arguments to supply to event listeners. |

<a name="Audio"></a>

## Audio
Links to the internal AudioContext and related objects.

**Kind**: global class  

* [Audio](#Audio)
    * [new Audio()](#new_Audio_new)
    * [.Context](#Audio+Context) : <code>AudioContext</code>
    * [.OfflineContext](#Audio+OfflineContext) : <code>OfflineAudioContext</code>
    * [.Analyser](#Audio+Analyser) : <code>AnalyserNode</code>
    * [.Gain](#Audio+Gain) : <code>GainNode</code>
    * [.ScriptProcessor](#Audio+ScriptProcessor) : <code>ScriptProcessorNode</code>
    * [.filters](#Audio+filters) : <code>Array.&lt;BiquadFilterNode&gt;</code>

<a name="new_Audio_new"></a>

### new Audio()
Constructs an Audio object.

<a name="Audio+Context"></a>

### audio.Context : <code>AudioContext</code>
The AudioContext object.

**Kind**: instance property of <code>[Audio](#Audio)</code>  
<a name="Audio+OfflineContext"></a>

### audio.OfflineContext : <code>OfflineAudioContext</code>
The OfflineAudioContext object.

**Kind**: instance property of <code>[Audio](#Audio)</code>  
<a name="Audio+Analyser"></a>

### audio.Analyser : <code>AnalyserNode</code>
The AnalyserNode object.

**Kind**: instance property of <code>[Audio](#Audio)</code>  
<a name="Audio+Gain"></a>

### audio.Gain : <code>GainNode</code>
The GainNode object.

**Kind**: instance property of <code>[Audio](#Audio)</code>  
<a name="Audio+ScriptProcessor"></a>

### audio.ScriptProcessor : <code>ScriptProcessorNode</code>
The ScriptProcessorNode object.

**Kind**: instance property of <code>[Audio](#Audio)</code>  
<a name="Audio+filters"></a>

### audio.filters : <code>Array.&lt;BiquadFilterNode&gt;</code>
Array of BiquadFilterNode objects.

**Kind**: instance property of <code>[Audio](#Audio)</code>  
<a name="Track"></a>

## Track ⇐ <code>[EventTarget](#EventTarget)</code>
Provides audiotrack-specific methods.

**Kind**: global class  
**Extends:** <code>[EventTarget](#EventTarget)</code>  

* [Track](#Track) ⇐ <code>[EventTarget](#EventTarget)</code>
    * [new Track(urls)](#new_Track_new)
    * [.data](#Track+data) : <code>object</code>
    * [.eventListeners](#EventTarget+eventListeners) : <code>object</code>
    * [.load()](#Track+load) ⇒ <code>Promise.&lt;Track, Error&gt;</code>
    * [.play()](#Track+play) ⇒ <code>[Track](#Track)</code>
    * [.stop()](#Track+stop) ⇒ <code>[Track](#Track)</code>
    * [.pause()](#Track+pause) ⇒ <code>[Track](#Track)</code>
    * [.seek(newOffset)](#Track+seek) ⇒ <code>[Track](#Track)</code>
    * [.when(marker, callback)](#Track+when) ⇒ <code>[Track](#Track)</code>
    * [.getCurrentTime()](#Track+getCurrentTime) ⇒ <code>number</code>
    * [.getPlayedTime()](#Track+getPlayedTime) ⇒ <code>number</code>
    * [.getDuration()](#Track+getDuration) ⇒ <code>number</code>
    * [.isPlaying()](#Track+isPlaying) ⇒ <code>boolean</code>
    * [.addEventListener(type, callback)](#EventTarget+addEventListener)
    * [.removeEventListener(type, callback)](#EventTarget+removeEventListener)
    * [.dispatchEvent(type, ...other_arguments)](#EventTarget+dispatchEvent)
    * ["playing"](#Track+event_playing)
    * ["finished"](#Track+event_finished)
    * ["play"](#Track+event_play)

<a name="new_Track_new"></a>

### new Track(urls)
Constructs a Track object.


| Param | Type | Description |
| --- | --- | --- |
| urls | <code>Array.&lt;string&gt;</code> | Track sources - an array of mirror URLs pointing to the same audio piece. |

<a name="Track+data"></a>

### track.data : <code>object</code>
Provides a common place for any custom data associated with the track.

For example, track title, artist, etc.

**Kind**: instance property of <code>[Track](#Track)</code>  
<a name="EventTarget+eventListeners"></a>

### track.eventListeners : <code>object</code>
Contains event listeners.

Object keys are event types, and values are arrays of callbacks.

**Kind**: instance property of <code>[Track](#Track)</code>  
<a name="Track+load"></a>

### track.load() ⇒ <code>Promise.&lt;Track, Error&gt;</code>
Loads the audio file into buffer.

Multiple calls to this method get the same Promise object.

**Kind**: instance method of <code>[Track](#Track)</code>  
**Returns**: <code>Promise.&lt;Track, Error&gt;</code> - The Promise object.
  Fulfill callback arguments:
  - {Track} This Track instance, loaded.
  Reject callback arguments:
  - {Error} The Error object.  
<a name="Track+play"></a>

### track.play() ⇒ <code>[Track](#Track)</code>
Plays the loaded audio file or resumes the playback from pause.

**Kind**: instance method of <code>[Track](#Track)</code>  
**Returns**: <code>[Track](#Track)</code> - The Track object.  
**Throws**:

- <code>Error</code> If track is not loaded.

**Emits**: <code>[play](#Track+event_play)</code>  
<a name="Track+stop"></a>

### track.stop() ⇒ <code>[Track](#Track)</code>
Stops the playback and resets the track state.

This method resets the current time position and the skipped time
counter, which impacts the played time in the way that next play() will
count it from 0.

**Kind**: instance method of <code>[Track](#Track)</code>  
**Returns**: <code>[Track](#Track)</code> - The Track object.  
<a name="Track+pause"></a>

### track.pause() ⇒ <code>[Track](#Track)</code>
Pauses the playback.

**Kind**: instance method of <code>[Track](#Track)</code>  
**Returns**: <code>[Track](#Track)</code> - The Track object.  
<a name="Track+seek"></a>

### track.seek(newOffset) ⇒ <code>[Track](#Track)</code>
Seeks on an audio track.

**Kind**: instance method of <code>[Track](#Track)</code>  
**Returns**: <code>[Track](#Track)</code> - The Track object.  
**Throws**:

- <code>TypeError</code> If provided offset is negative.


| Param | Type | Description |
| --- | --- | --- |
| newOffset | <code>number</code> | Seconds from the start of an audio file. |

<a name="Track+when"></a>

### track.when(marker, callback) ⇒ <code>[Track](#Track)</code>
Sets the callback to execute on a time marker.

This method uses the actual played time. It means that markers cannot be
accidentally skipped if a listener skips track parts.

**Kind**: instance method of <code>[Track](#Track)</code>  
**Returns**: <code>[Track](#Track)</code> - The Track object.  
**Throws**:

- <code>TypeError</code> If marker is negative.

**See**: [getPlayedTime](#Track+getPlayedTime)  

| Param | Type | Description |
| --- | --- | --- |
| marker | <code>number</code> | A time marker in seconds of actual playback. |
| callback | <code>[markerCallback](#markerCallback)</code> | A callback to execute when marker is reached. |

<a name="Track+getCurrentTime"></a>

### track.getCurrentTime() ⇒ <code>number</code>
Gets the current playback position.

**Kind**: instance method of <code>[Track](#Track)</code>  
**Returns**: <code>number</code> - Seconds from the start of an audio file.  
<a name="Track+getPlayedTime"></a>

### track.getPlayedTime() ⇒ <code>number</code>
Gets the time the track was actually played.

**Kind**: instance method of <code>[Track](#Track)</code>  
**Returns**: <code>number</code> - Seconds from the first play() of a track, excluding pauses and skips.  
<a name="Track+getDuration"></a>

### track.getDuration() ⇒ <code>number</code>
Gets the duration of a track.

**Kind**: instance method of <code>[Track](#Track)</code>  
**Returns**: <code>number</code> - The duration in seconds.  
**Throws**:

- <code>Error</code> If track is not loaded.

<a name="Track+isPlaying"></a>

### track.isPlaying() ⇒ <code>boolean</code>
Indicates whether a track is currently playing.

**Kind**: instance method of <code>[Track](#Track)</code>  
**Returns**: <code>boolean</code> - True if audio is playing, false otherwise.  
<a name="EventTarget+addEventListener"></a>

### track.addEventListener(type, callback)
Registers an event handler of a specific type.

**Kind**: instance method of <code>[Track](#Track)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Event type to listen for. |
| callback | <code>[eventListener](#eventListener)</code> | Event handler to call when event occurs. |

<a name="EventTarget+removeEventListener"></a>

### track.removeEventListener(type, callback)
Removes an event listener.

**Kind**: instance method of <code>[Track](#Track)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Event type. |
| callback | <code>[eventListener](#eventListener)</code> | Event handler to remove. |

<a name="EventTarget+dispatchEvent"></a>

### track.dispatchEvent(type, ...other_arguments)
Dispatches an event.

**Kind**: instance method of <code>[Track](#Track)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Event type to dispatch. |
| ...other_arguments | <code>\*</code> | Other arguments to supply to event listeners. |

<a name="Track+event_playing"></a>

### "playing"
Indicates that the track is playing.

Unlike the 'play' event, this one is fired constantly during
the playback of the Track.

**Kind**: event emitted by <code>[Track](#Track)</code>  
**See**: [play](#Track+event_play)  
<a name="Track+event_finished"></a>

### "finished"
Indicates that the track has finished playing.

**Kind**: event emitted by <code>[Track](#Track)</code>  
<a name="Track+event_play"></a>

### "play"
Indicates the playback beginning.

Unlike the 'playing' event, this one is fired only when the track
source has started playing, but not necessary from the start of
an audio track.

**Kind**: event emitted by <code>[Track](#Track)</code>  
**See**: [playing](#Track+event_playing)  
<a name="Playlist"></a>

## Playlist ⇐ <code>[EventTarget](#EventTarget)</code>
Provides playlist-specific methods.

**Kind**: global class  
**Extends:** <code>[EventTarget](#EventTarget)</code>  

* [Playlist](#Playlist) ⇐ <code>[EventTarget](#EventTarget)</code>
    * [new Playlist(list)](#new_Playlist_new)
    * [.list](#Playlist+list) : <code>[Array.&lt;Track&gt;](#Track)</code>
    * [.length](#Playlist+length) ⇒ <code>number</code>
    * [.eventListeners](#EventTarget+eventListeners) : <code>object</code>
    * [.setCurrentByIndex(index)](#Playlist+setCurrentByIndex) ⇒ <code>[Playlist](#Playlist)</code>
    * [.getCurrent()](#Playlist+getCurrent) ⇒ <code>[Track](#Track)</code> &#124; <code>null</code>
    * [.getCurrentIndex()](#Playlist+getCurrentIndex) ⇒ <code>number</code>
    * [.get(index)](#Playlist+get) ⇒ <code>[Track](#Track)</code> &#124; <code>null</code> &#124; <code>undefined</code>
    * [.load(index)](#Playlist+load) ⇒ <code>Promise.&lt;Track, Error&gt;</code>
    * [.play(index)](#Playlist+play) ⇒ <code>[Playlist](#Playlist)</code>
    * [.pause()](#Playlist+pause) ⇒ <code>[Playlist](#Playlist)</code>
    * [.previous()](#Playlist+previous) ⇒ <code>[Playlist](#Playlist)</code>
    * [.next()](#Playlist+next) ⇒ <code>[Playlist](#Playlist)</code>
    * [.isPlaying()](#Playlist+isPlaying) ⇒ <code>boolean</code>
    * [.push(...tracks)](#Playlist+push) ⇒ <code>[Playlist](#Playlist)</code>
    * [.addEventListener(type, callback)](#EventTarget+addEventListener)
    * [.removeEventListener(type, callback)](#EventTarget+removeEventListener)
    * [.dispatchEvent(type, ...other_arguments)](#EventTarget+dispatchEvent)
    * ["trackReady" (track)](#Playlist+event_trackReady)

<a name="new_Playlist_new"></a>

### new Playlist(list)
Constructs a Playlist object.


| Param | Type | Description |
| --- | --- | --- |
| list | <code>[Array.&lt;Track&gt;](#Track)</code> | (optional) Array of Track instances. |

<a name="Playlist+list"></a>

### playlist.list : <code>[Array.&lt;Track&gt;](#Track)</code>
List of tracks to play.

**Kind**: instance property of <code>[Playlist](#Playlist)</code>  
<a name="Playlist+length"></a>

### playlist.length ⇒ <code>number</code>
Returns the number of tracks in the list.

**Kind**: instance property of <code>[Playlist](#Playlist)</code>  
**Returns**: <code>number</code> - Number of tracks in the list.  
**Read only**: true  
<a name="EventTarget+eventListeners"></a>

### playlist.eventListeners : <code>object</code>
Contains event listeners.

Object keys are event types, and values are arrays of callbacks.

**Kind**: instance property of <code>[Playlist](#Playlist)</code>  
<a name="Playlist+setCurrentByIndex"></a>

### playlist.setCurrentByIndex(index) ⇒ <code>[Playlist](#Playlist)</code>
Sets current track by its list index.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  
**Returns**: <code>[Playlist](#Playlist)</code> - This Playlist instance.  
**Throws**:

- <code>Error</code> If current track is playing or if there's no track with given index in
  the list.


| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Index of a track in list. |

<a name="Playlist+getCurrent"></a>

### playlist.getCurrent() ⇒ <code>[Track](#Track)</code> &#124; <code>null</code>
Returns the current track.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  
**Returns**: <code>[Track](#Track)</code> &#124; <code>null</code> - The current track, or null in case of empty list.  
<a name="Playlist+getCurrentIndex"></a>

### playlist.getCurrentIndex() ⇒ <code>number</code>
Returns the list index of current track.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  
**Returns**: <code>number</code> - Current track's index, or -1 in case of empty list or if the current
  track was removed from the list.  
<a name="Playlist+get"></a>

### playlist.get(index) ⇒ <code>[Track](#Track)</code> &#124; <code>null</code> &#124; <code>undefined</code>
Returns the track by index or the current one.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  
**Returns**: <code>[Track](#Track)</code> &#124; <code>null</code> &#124; <code>undefined</code> - Either track corresponding to given index, or the current one. Null or
  undefined, if there's no corresponding track in the list.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| index | <code>number</code> &#124; <code>null</code> | <code></code> | (optional) The list index. If omitted, the current track will be   looked for. |

<a name="Playlist+load"></a>

### playlist.load(index) ⇒ <code>Promise.&lt;Track, Error&gt;</code>
Loads the track by index or the current one.

If track can't be loaded this method will try next tracks from the list
recursively.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  
**Returns**: <code>Promise.&lt;Track, Error&gt;</code> - The Promise object.
  Fulfill callback arguments:
  - {Track} The Track instance, loaded.
  Reject callback arguments:
  - {Error} The Error object.  
**Emits**: <code>[trackReady](#Playlist+event_trackReady)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| index | <code>number</code> &#124; <code>null</code> | <code></code> | (optional) The list index. If omitted, the current track will be loaded. |

<a name="Playlist+play"></a>

### playlist.play(index) ⇒ <code>[Playlist](#Playlist)</code>
Plays the loaded track by index or the current one.

If track is on pause this method will resume the playback from track's
current position. If track is finished it will play from the start.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  
**Returns**: <code>[Playlist](#Playlist)</code> - This Playlist instance.  
**Throws**:

- <code>Error</code> If there's no corresponding track in the list.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| index | <code>number</code> &#124; <code>null</code> | <code></code> | (optional) The list index. If omitted, the current track will be played. |

<a name="Playlist+pause"></a>

### playlist.pause() ⇒ <code>[Playlist](#Playlist)</code>
Pauses the playback of current track.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  
**Returns**: <code>[Playlist](#Playlist)</code> - This Playlist instance.  
<a name="Playlist+previous"></a>

### playlist.previous() ⇒ <code>[Playlist](#Playlist)</code>
Skips to the start of previous track in the list, if one exists.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  
**Returns**: <code>[Playlist](#Playlist)</code> - This Playlist instance.  
**Throws**:

- <code>Error</code> If list is empty or if the current track was removed from the list.

<a name="Playlist+next"></a>

### playlist.next() ⇒ <code>[Playlist](#Playlist)</code>
Skips to the start of next track in the list, if one exists.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  
**Returns**: <code>[Playlist](#Playlist)</code> - This Playlist instance.  
**Throws**:

- <code>Error</code> If list is empty or if the current track was removed from the list.

<a name="Playlist+isPlaying"></a>

### playlist.isPlaying() ⇒ <code>boolean</code>
Indicates whether a current track is currently playing.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  
**Returns**: <code>boolean</code> - True if audio is playing, false otherwise.  
<a name="Playlist+push"></a>

### playlist.push(...tracks) ⇒ <code>[Playlist](#Playlist)</code>
Adds one or more tracks to the end of the list.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  
**Returns**: <code>[Playlist](#Playlist)</code> - This Playlist instance.  

| Param | Type | Description |
| --- | --- | --- |
| ...tracks | <code>[Track](#Track)</code> | Track instances to add. |

<a name="EventTarget+addEventListener"></a>

### playlist.addEventListener(type, callback)
Registers an event handler of a specific type.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Event type to listen for. |
| callback | <code>[eventListener](#eventListener)</code> | Event handler to call when event occurs. |

<a name="EventTarget+removeEventListener"></a>

### playlist.removeEventListener(type, callback)
Removes an event listener.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Event type. |
| callback | <code>[eventListener](#eventListener)</code> | Event handler to remove. |

<a name="EventTarget+dispatchEvent"></a>

### playlist.dispatchEvent(type, ...other_arguments)
Dispatches an event.

**Kind**: instance method of <code>[Playlist](#Playlist)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Event type to dispatch. |
| ...other_arguments | <code>\*</code> | Other arguments to supply to event listeners. |

<a name="Playlist+event_trackReady"></a>

### "trackReady" (track)
Indicates that the track from the list is loaded.

**Kind**: event emitted by <code>[Playlist](#Playlist)</code>  

| Param | Type | Description |
| --- | --- | --- |
| track | <code>[Track](#Track)</code> | Instance of the loaded track. |

<a name="WebAudioPlayer"></a>

## WebAudioPlayer ⇐ <code>[EventTarget](#EventTarget)</code>
The main, public class, providing general methods.

**Kind**: global class  
**Extends:** <code>[EventTarget](#EventTarget)</code>  

* [WebAudioPlayer](#WebAudioPlayer) ⇐ <code>[EventTarget](#EventTarget)</code>
    * [new WebAudioPlayer()](#new_WebAudioPlayer_new)
    * [.eventListeners](#EventTarget+eventListeners) : <code>object</code>
    * [.getAudio()](#WebAudioPlayer+getAudio) ⇒ <code>[Audio](#Audio)</code>
    * [.createTrack(urls)](#WebAudioPlayer+createTrack) ⇒ <code>[Track](#Track)</code>
    * [.createPlaylist(list)](#WebAudioPlayer+createPlaylist) ⇒ <code>[Playlist](#Playlist)</code>
    * [.setVolume(gain)](#WebAudioPlayer+setVolume) ⇒ <code>[WebAudioPlayer](#WebAudioPlayer)</code>
    * [.getVolume()](#WebAudioPlayer+getVolume) ⇒ <code>number</code>
    * [.setEq(bands)](#WebAudioPlayer+setEq) ⇒ <code>[WebAudioPlayer](#WebAudioPlayer)</code>
    * [.getEq()](#WebAudioPlayer+getEq) ⇒ <code>Array.&lt;number&gt;</code>
    * [.addEventListener(type, callback)](#EventTarget+addEventListener)
    * [.removeEventListener(type, callback)](#EventTarget+removeEventListener)
    * [.dispatchEvent(type, ...other_arguments)](#EventTarget+dispatchEvent)
    * ["audioprocess"](#WebAudioPlayer+event_audioprocess)

<a name="new_WebAudioPlayer_new"></a>

### new WebAudioPlayer()
Constructs a WebAudioPlayer object.

<a name="EventTarget+eventListeners"></a>

### webAudioPlayer.eventListeners : <code>object</code>
Contains event listeners.

Object keys are event types, and values are arrays of callbacks.

**Kind**: instance property of <code>[WebAudioPlayer](#WebAudioPlayer)</code>  
<a name="WebAudioPlayer+getAudio"></a>

### webAudioPlayer.getAudio() ⇒ <code>[Audio](#Audio)</code>
Returns the Audio object.

**Kind**: instance method of <code>[WebAudioPlayer](#WebAudioPlayer)</code>  
**Returns**: <code>[Audio](#Audio)</code> - The Audio object.  
<a name="WebAudioPlayer+createTrack"></a>

### webAudioPlayer.createTrack(urls) ⇒ <code>[Track](#Track)</code>
Returns the new Track instance.

**Kind**: instance method of <code>[WebAudioPlayer](#WebAudioPlayer)</code>  
**Returns**: <code>[Track](#Track)</code> - The Track instance.  

| Param | Type | Description |
| --- | --- | --- |
| urls | <code>Array.&lt;string&gt;</code> | Track sources - an array of mirror URLs pointing to the same audio piece.   Only the first valid URL will be ultimately used. |

<a name="WebAudioPlayer+createPlaylist"></a>

### webAudioPlayer.createPlaylist(list) ⇒ <code>[Playlist](#Playlist)</code>
Returns the new Playlist instance.

**Kind**: instance method of <code>[WebAudioPlayer](#WebAudioPlayer)</code>  
**Returns**: <code>[Playlist](#Playlist)</code> - The Playlist instance.  

| Param | Type | Description |
| --- | --- | --- |
| list | <code>[Array.&lt;Track&gt;](#Track)</code> | (optional) Array of Track instances. |

<a name="WebAudioPlayer+setVolume"></a>

### webAudioPlayer.setVolume(gain) ⇒ <code>[WebAudioPlayer](#WebAudioPlayer)</code>
Sets the playback volume to new level.

**Kind**: instance method of <code>[WebAudioPlayer](#WebAudioPlayer)</code>  
**Returns**: <code>[WebAudioPlayer](#WebAudioPlayer)</code> - The WebAudioPlayer object.  

| Param | Type | Description |
| --- | --- | --- |
| gain | <code>number</code> | Number between 0 and 1. |

<a name="WebAudioPlayer+getVolume"></a>

### webAudioPlayer.getVolume() ⇒ <code>number</code>
Gets the current value of the playback volume level.

**Kind**: instance method of <code>[WebAudioPlayer](#WebAudioPlayer)</code>  
**Returns**: <code>number</code> - Previously set value.  
<a name="WebAudioPlayer+setEq"></a>

### webAudioPlayer.setEq(bands) ⇒ <code>[WebAudioPlayer](#WebAudioPlayer)</code>
Sets the equalizer bands to new levels.

**Kind**: instance method of <code>[WebAudioPlayer](#WebAudioPlayer)</code>  
**Returns**: <code>[WebAudioPlayer](#WebAudioPlayer)</code> - The WebAudioPlayer object.  

| Param | Type | Description |
| --- | --- | --- |
| bands | <code>Array.&lt;number&gt;</code> &#124; <code>object</code> | Array or object which keys are indexes from 0 to 9 for each of 10 bands,   and values are numbers indicating the new gain of the corresponding band.   All elements of the object are optional, so setting less than 10 elements   will leave unspecified bands in previous state. |

<a name="WebAudioPlayer+getEq"></a>

### webAudioPlayer.getEq() ⇒ <code>Array.&lt;number&gt;</code>
Gets the current band levels of the equalizer.

**Kind**: instance method of <code>[WebAudioPlayer](#WebAudioPlayer)</code>  
**Returns**: <code>Array.&lt;number&gt;</code> - Array of 10 numbers.  
<a name="EventTarget+addEventListener"></a>

### webAudioPlayer.addEventListener(type, callback)
Registers an event handler of a specific type.

**Kind**: instance method of <code>[WebAudioPlayer](#WebAudioPlayer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Event type to listen for. |
| callback | <code>[eventListener](#eventListener)</code> | Event handler to call when event occurs. |

<a name="EventTarget+removeEventListener"></a>

### webAudioPlayer.removeEventListener(type, callback)
Removes an event listener.

**Kind**: instance method of <code>[WebAudioPlayer](#WebAudioPlayer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Event type. |
| callback | <code>[eventListener](#eventListener)</code> | Event handler to remove. |

<a name="EventTarget+dispatchEvent"></a>

### webAudioPlayer.dispatchEvent(type, ...other_arguments)
Dispatches an event.

**Kind**: instance method of <code>[WebAudioPlayer](#WebAudioPlayer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Event type to dispatch. |
| ...other_arguments | <code>\*</code> | Other arguments to supply to event listeners. |

<a name="WebAudioPlayer+event_audioprocess"></a>

### "audioprocess"
Indicates that audio is processing.

This event is fired constantly during the life of an Audio object and
should not be generally listened for. Track objects use this event to
fire their own 'playing' event to indicate when the corresponding track
is actually playing.

**Kind**: event emitted by <code>[WebAudioPlayer](#WebAudioPlayer)</code>  
**See**: [playing](#Track+event_playing)  
<a name="eventListener"></a>

## eventListener : <code>function</code>
Callback to execute on events.

The callback context is the object on which the addEventListener() method was
called.

**Kind**: global typedef  
**this**: <code>[EventTarget](#EventTarget)</code>  
**See**: [dispatchEvent](#EventTarget+dispatchEvent)  

| Param | Type | Description |
| --- | --- | --- |
| ...arguments | <code>\*</code> | Any number of arguments supplied to the dispatchEvent() method (except its   first argument - event type). |

<a name="markerCallback"></a>

## markerCallback : <code>function</code>
Callback to execute on time markers.

**Kind**: global typedef  
**this**: <code>[Track](#Track)</code>  
**See**: [when](#Track+when)  
