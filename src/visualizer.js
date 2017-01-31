var visualizer = {
	attach: function (container) {
		// style the container
		container.style.position = 'relative';
		container.style.backgroundColor = '#ffffff';

		// get and style audio element
		var audioElement = container.firstElementChild;
		if (audioElement.nodeName !== 'AUDIO') {
			// the element in the container is not a video or audio element
			throw 'Error: visualizer element should contain only an audio element';
		}
		audioElement.style.width = '100%';
		audioElement.style.position = 'absolute';
		audioElement.style.bottom = '0';

		// build canvases
		var oscTop = document.createElement('canvas');
		var oscBot = document.createElement('canvas');

		// style the canvases
		oscTop.style.position = oscBot.style.position = 'absolute';
		oscTop.style.width = oscBot.style.width = '100%';
		oscTop.style.height = oscBot.style.height = '100%';

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

		draw();

		function draw() {
			// refresh analyser data
			analyser.getByteTimeDomainData(data);
			// console.log(data.toString());

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
			oscTopCtx.strokeStyle = 'rgb(255,87,34)';
			oscTopCtx.clearRect(0, 0, width, height);

			oscBotCtx.globalCompositeOperation = 'lighter';
			oscBotCtx.fillStyle = 'rgba(255,255,255, 0.01)';
			oscBotCtx.fillRect(0, 0, width, height);

			oscBotCtx.globalCompositeOperation = 'source-over';
			oscBotCtx.fillStyle = 'rgb(42,42,42)';

			// draw scope path
			oscTopCtx.beginPath();
			oscBotCtx.beginPath();
			
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
	}
}

window.addEventListener('load', function() {
	visualizer.attach(document.getElementById('visualizer'));
});
