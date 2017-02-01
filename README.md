# Oscilloscope Visualizer
An audio visualizer utilizing the Web Audio API

![visualizer image](http://i.imgur.com/LmPbhfn.png)

## Usage
Use a `<div>` with `id="visualizer"` and a child `<audio>` element to create the visualizer.
```html
<div id="visualizer">
  <audio src="some.mp3"></audio>
</div>
```
You may optionally give the audio element an id and control it with play(), pause() and other native methods. You may also give it the 'controls' attribute to show the browser's playback controls.
