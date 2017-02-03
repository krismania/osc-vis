window.addEventListener('load', function() {

	var fps = true; // show the FPS counter

	// find/create DOM nodes
	var
		container = document.getElementById('visualizer'), 
		audioElement = container.getElementsByTagName("audio")[0],
		oscTop = document.createElement('canvas'),
		oscBot = document.createElement('canvas');

	// append canvases to the container
	container.insertBefore(oscBot, audioElement); container.insertBefore(oscTop, audioElement);

	// get data attributes (or set defaults if they aren't specified)
	var
		colorPrimary = container.dataset.colorPrimary || 'rgb(255,87,34)',
		colorSecondary = container.dataset.colorSecondary || 'rgb(42,42,42)',
		colorBg = container.dataset.colorBg || 'rgb(255,255,255)';

	// styles for the container and subnodes
	var
		containerStyle = { 'position': 'relative', 'background-color': colorBg, 'overflow': 'hidden' },
		audioElementStyle = { 'width': '100%', 'position': 'absolute', 'bottom': 0, 'left': 0 },
		oscStyle = { 'position': 'absolute', 'width': '100%', 'height': '100%', 'left': 0 };

	// apply styles
	style(container, containerStyle);
	style(audioElement, audioElementStyle);
	style(oscTop, oscStyle);
	style(oscBot, oscStyle);

	// create the audio context & analyser
	var audioCtx = new window.AudioContext();
	var analyser = audioCtx.createAnalyser();
	analyser.fftSize = 2048; // developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize

	// create array to store frequency data
	var bins = analyser.frequencyBinCount;
	var data = new Uint8Array(bins);

	// create a source from the audio element & connect it all up
	audioCtx.createMediaElementSource(audioElement).connect(analyser);
	analyser.connect(audioCtx.destination);

	// get canvas contexts and draw
	var
		oscTopCtx = oscTop.getContext('2d'),
		oscBotCtx = oscBot.getContext('2d'),
		lastFrame, thisFrame, delta;

	lastFrame = thisFrame = delta = 0;

	draw();

	function draw() {
		// get delta to last frame
		thisFrame = Date.now();
		delta = (thisFrame - lastFrame)/1000;
		lastFrame = thisFrame;

		// refresh analyser data
		analyser.getByteTimeDomainData(data);

		// update canvas sizes if they've changed
		var width = container.clientWidth, height = container.clientHeight;
		if (oscTop.height !== height || oscTop.width !== width) {
			// only checks top canvas, as they always have the same value
			oscTop.height = oscBot.height = height;
			oscTop.width = oscBot.width = width;
		}

		// prepare frame
		oscTopCtx.strokeStyle = colorPrimary;
		oscTopCtx.clearRect(0, 0, width, height);
		oscBotCtx.globalCompositeOperation = 'overlay';
		oscBotCtx.globalAlpha = 0.07; // transparency gives ghosting effect
		oscBotCtx.fillStyle = colorBg;
		oscBotCtx.fillRect(0, 0, width, height);

		// set style for the bg osc
		oscBotCtx.globalCompositeOperation = 'source-over';
		oscBotCtx.globalAlpha = 1;
		oscBotCtx.fillStyle = colorSecondary;

		if (fps) { // draw the framerate if enabled
			oscTopCtx.font = '10px sans-serif';
			oscTopCtx.fillStyle = colorPrimary;
			oscTopCtx.fillText(Math.round(1/delta) + ' fps', 5, 15);
		}

		// draw scope path
		oscTopCtx.beginPath(); oscBotCtx.beginPath();
		
		// reference: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
		var sliceWidth = width * 1.0 / bins;
		var x = 0;
		for (var i = 0; i < bins; i++) {
			var v = data[i] / 128.0;
			var y = v * height/2;

			if (i === 0) {
				oscTopCtx.moveTo(x, y);
				oscBotCtx.moveTo(x, y);
			} else {
				oscTopCtx.lineTo(x, y);
				oscBotCtx.lineTo(x, y);
			}
			x += sliceWidth;
		}

		oscBotCtx.lineTo(width, height/2);
		oscBotCtx.lineTo(0, height/2);
		oscBotCtx.closePath();
		
		oscTopCtx.stroke();
		oscBotCtx.fill();

		requestAnimationFrame(draw);
	}

	function style(element, cssObject) {
		for (var prop in cssObject) {
			element.style[prop] = cssObject[prop];
		}
	}
});
