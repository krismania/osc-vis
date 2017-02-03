window.addEventListener('load', function() {

	fps = true; // show the FPS counter

	container = document.getElementById('visualizer');

	// get data attributes (or set defaults if they aren't specified)
	var	colorPrimary = container.dataset.colorPrimary || 'rgb(255,87,34)',
		colorSecondary = container.dataset.colorSecondary || 'rgb(42,42,42)',
		colorBg = container.dataset.colorBg || 'rgb(255,255,255)';

	// style the container
	container.style.position = 'relative';
	container.style.backgroundColor = colorBg;
	container.style.overflow = 'hidden';

	// get and style audio element
	var audioElement = container.getElementsByTagName("audio")[0];

	audioElement.style.width = '100%';
	audioElement.style.position = 'absolute';
	audioElement.style.bottom = '0';
	audioElement.style.left = '0';

	// build canvases
	var oscTop = document.createElement('canvas');
	var oscBot = document.createElement('canvas');

	// style the canvases
	oscTop.style.position = oscBot.style.position = 'absolute';
	oscTop.style.width = oscBot.style.width = '100%';
	oscTop.style.height = oscBot.style.height = '100%';
	oscTop.style.left = oscBot.style.left = '0';

	// append canvases to the container
	container.insertBefore(oscBot, audioElement);
	container.insertBefore(oscTop, audioElement);
	
	// create the audio context & analyser
	audioCtx = new window.AudioContext();
	analyser = audioCtx.createAnalyser();
	analyser.fftSize = 1024; // developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize

	// create a source from the audio element & connect it all up
	src = audioCtx.createMediaElementSource(audioElement);
	src.connect(analyser);
	analyser.connect(audioCtx.destination);

	// create array to store frequency data
	var bins = analyser.frequencyBinCount;
	var data = new Uint8Array(bins);

	// begin drawing
	var oscTopCtx = oscTop.getContext('2d');
	var oscBotCtx = oscBot.getContext('2d');

	var lastFrame = thisFrame = delta = 0;

	draw();

	function draw() {
		// get delta to last frame
		thisFrame = Date.now();
		delta = (thisFrame - lastFrame)/1000;
		lastFrame = thisFrame;

		// refresh analyser data
		analyser.getByteTimeDomainData(data);

		// update canvas sizes if they've changed
		var width = container.clientWidth;
		var height = container.clientHeight;

		if (oscTop.height !== height || oscTop.width !== width) {
			// only checks the top canvas, as they should always both
			// have the same value
			oscTop.height = oscBot.height = height;
			oscTop.width = oscBot.width = width;
		}

		// prepare for frame
		oscTopCtx.strokeStyle = colorPrimary;
		oscTopCtx.clearRect(0, 0, width, height);

		// draw the framerate
		if (fps) {
			oscTopCtx.font = '10px sans-serif';
			oscTop.fillStyle = colorPrimary;
			oscTopCtx.fillText(Math.round(1/delta) + ' fps', 5, 15);
		}

		// draw the background over transparently
		oscBotCtx.globalCompositeOperation = 'overlay';
		oscBotCtx.globalAlpha = 0.07;
		oscBotCtx.fillStyle = colorBg;
		oscBotCtx.fillRect(0, 0, width, height);

		// set style for the bg osc
		oscBotCtx.globalCompositeOperation = 'source-over';
		oscBotCtx.globalAlpha = 1;
		oscBotCtx.fillStyle = colorSecondary;

		// draw scope path
		oscTopCtx.beginPath();
		oscBotCtx.beginPath();
		
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
});
