# Oscilloscope Visualizer
An audio visualizer utilizing the Web Audio API

![visualizer image](http://i.imgur.com/LmPbhfn.png)

## Usage
Use a `<div>` with `id="visualizer"` and a child `<audio>` element to create the visualizer.
Use the data attributes `data-color-primary`, `data-color-secondary` and `data-color-bg` to customize the visualizer's colors.
```html
<div>
  <audio src="some.mp3"></audio>
</div>
```
You may optionally give the audio element an id and control it with play(), pause() and other native methods. You may also give it the 'controls' attribute to show the browser's playback controls.

### Color
Use the data attributes `data-color-primary`, `data-color-secondary` and `data-color-bg` to customize the visualizer's colors.
```html
<div
  id="visualizer"
  data-color-primary="rgb(255,87,34)"
  data-color-secondary="rgb(42,42,42)"
  data-color-bg="rgb(255,255,255)"
>
  <audio src="some.mp3"></audio>
</div>
```
