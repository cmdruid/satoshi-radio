import EventEmitter from './emitter.js'
import { DTMF }     from './goertzel/index.js'

const DEFAULT_CONFIG = {
  // sample rate of the audio buffer being given to the dtmf object.
  sampleRate: 48000,
  // filters out "bad" energy peaks. Can be any number between 1 and infinity.
  peakFilterSensitivity: 1.4,
  //
  energyThreshold: 0.0001,
  // Requires that a DTMF character be repeated enough times across buffers to be considered a valid DTMF tone.
  repeatMin: 6,
  // decides how much the buffers are downsampled(by skipping every Nth sample).
  downsampleRate: 1,
  // gets passed to the goertzel object that gets created by the dtmf object. This is the noise threshold value.
  threshold: 0.005
}

export class ToneEmitter extends EventEmitter {

  constructor (stream, config = DEFAULT_CONFIG) {
    super()
    this.ctx      = new AudioContext()
    this.source   = this.ctx.createMediaStreamSource(stream)
    this.analyzer = this.ctx.createAnalyser()
    // analyser.fftSize = 4096;
    this.dtmf     = new DTMF(config)
    this.buffer   = new Uint8Array(this.buffSize)
    this.source.connect(this.analyzer)
    this.interval = null

    this.dtmf.on('decode', (value) => {
      if (value === null) return
      if (value.length === 1) {
        this.emit('char', value)
        return
      }
      this.emit(value, this)
      return
    })
  }

  get buffSize () {
    return this.analyzer.frequencyBinCount
  }

  listen() {
    if (this.interval !== null) {
      clearInterval(this.interval)
    }
    this.interval = setInterval(() => {
      this.analyzer.getByteTimeDomainData(this.buffer)
      this.dtmf.processBuffer(this.buffer)
    })
  }

  cancel() {
    clearInterval(this.interval)
  }
}
