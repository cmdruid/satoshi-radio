import { visualize }   from './visualizer.js'
import { ToneEmitter } from './tone.js'

globalThis.globalStream = null

if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };

  const onSuccess = (stream) => {
    globalThis.globalStream = stream
    visualize(stream)

    const emitter = new ToneEmitter(stream)

    emitter.on('*', (value) => console.log('emit:', value))

    emitter.listen()
  }

  const onError = (err) => {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
   console.log('getUserMedia not supported on your browser!');
}

