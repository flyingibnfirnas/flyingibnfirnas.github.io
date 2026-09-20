/**
 * Procedural hangar ambience — no external audio files / licenses.
 * Soft drones + filtered air; morphs slightly per chapter.
 */

type ChapterMood = 'avionics' | 'robotics' | 'aerospace' | 'automotive' | 'amd' | 'default'

export class AmbientAudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private droneGain: GainNode | null = null
  private airGain: GainNode | null = null
  private filter: BiquadFilterNode | null = null
  private oscillators: OscillatorNode[] = []
  private noiseSrc: AudioBufferSourceNode | null = null
  private lfo: OscillatorNode | null = null
  private started = false
  private muted = true
  private targetMaster = 0.0

  get isStarted() {
    return this.started
  }

  get isMuted() {
    return this.muted
  }

  async ensureStarted() {
    if (this.started && this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume()
      return
    }

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new Ctx()

    this.master = this.ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(this.ctx.destination)

    this.droneGain = this.ctx.createGain()
    this.droneGain.gain.value = 0.22
    this.droneGain.connect(this.master)

    this.filter = this.ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.value = 420
    this.filter.Q.value = 0.7
    this.filter.connect(this.droneGain)

    // Layered low drones
    const freqs = [46, 69, 92, 138]
    for (const f of freqs) {
      const osc = this.ctx.createOscillator()
      osc.type = f < 80 ? 'sine' : 'triangle'
      osc.frequency.value = f
      const g = this.ctx.createGain()
      g.gain.value = f < 80 ? 0.35 : 0.12
      osc.connect(g)
      g.connect(this.filter)
      osc.start()
      this.oscillators.push(osc)
    }

    // Filtered air / hangar hiss
    this.airGain = this.ctx.createGain()
    this.airGain.gain.value = 0.045
    const airFilter = this.ctx.createBiquadFilter()
    airFilter.type = 'bandpass'
    airFilter.frequency.value = 900
    airFilter.Q.value = 0.6
    airFilter.connect(this.airGain)
    this.airGain.connect(this.master)

    const noiseBuffer = this.makeNoiseBuffer(2)
    this.noiseSrc = this.ctx.createBufferSource()
    this.noiseSrc.buffer = noiseBuffer
    this.noiseSrc.loop = true
    this.noiseSrc.connect(airFilter)
    this.noiseSrc.start()

    // Slow breath on the filter
    this.lfo = this.ctx.createOscillator()
    this.lfo.frequency.value = 0.07
    const lfoGain = this.ctx.createGain()
    lfoGain.gain.value = 90
    this.lfo.connect(lfoGain)
    lfoGain.connect(this.filter.frequency)
    this.lfo.start()

    this.started = true
    if (this.ctx.state === 'suspended') await this.ctx.resume()
  }

  setMuted(muted: boolean) {
    this.muted = muted
    this.targetMaster = muted ? 0 : 0.55
    this.rampMaster(this.targetMaster, 0.9)
  }

  setMood(mood: ChapterMood) {
    if (!this.ctx || !this.filter || !this.droneGain || !this.airGain) return
    const t = this.ctx.currentTime
    if (mood === 'avionics') {
      this.filter.frequency.linearRampToValueAtTime(520, t + 1.4)
      this.droneGain.gain.linearRampToValueAtTime(0.18, t + 1.2)
      this.airGain.gain.linearRampToValueAtTime(0.052, t + 1.2)
    } else if (mood === 'robotics') {
      this.filter.frequency.linearRampToValueAtTime(480, t + 1.4)
      this.droneGain.gain.linearRampToValueAtTime(0.2, t + 1.2)
      this.airGain.gain.linearRampToValueAtTime(0.048, t + 1.2)
    } else if (mood === 'aerospace') {
      this.filter.frequency.linearRampToValueAtTime(380, t + 1.4)
      this.droneGain.gain.linearRampToValueAtTime(0.24, t + 1.2)
      this.airGain.gain.linearRampToValueAtTime(0.04, t + 1.2)
    } else if (mood === 'automotive') {
      this.filter.frequency.linearRampToValueAtTime(560, t + 1.4)
      this.droneGain.gain.linearRampToValueAtTime(0.2, t + 1.2)
      this.airGain.gain.linearRampToValueAtTime(0.055, t + 1.2)
    } else if (mood === 'amd') {
      this.filter.frequency.linearRampToValueAtTime(610, t + 1.4)
      this.droneGain.gain.linearRampToValueAtTime(0.19, t + 1.2)
      this.airGain.gain.linearRampToValueAtTime(0.05, t + 1.2)
    } else {
      this.filter.frequency.linearRampToValueAtTime(450, t + 1.2)
    }
  }

  /** Soft whoosh on chapter handoff */
  playTransitionCue() {
    if (!this.ctx || !this.master || this.muted) return
    const t = this.ctx.currentTime
    const buf = this.makeNoiseBuffer(0.6)
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 280
    filter.Q.value = 1.2
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.08)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)
    filter.frequency.linearRampToValueAtTime(1200, t + 0.9)
    src.connect(filter)
    filter.connect(g)
    g.connect(this.master)
    src.start(t)
    src.stop(t + 1.15)
  }

  dispose() {
    try {
      this.oscillators.forEach((o) => o.stop())
      this.noiseSrc?.stop()
      this.lfo?.stop()
      void this.ctx?.close()
    } catch {
      // ignore
    }
    this.started = false
    this.ctx = null
  }

  private rampMaster(value: number, seconds: number) {
    if (!this.ctx || !this.master) return
    const t = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), t)
    this.master.gain.linearRampToValueAtTime(Math.max(0.0001, value), t + seconds)
    if (value <= 0.001) {
      this.master.gain.linearRampToValueAtTime(0, t + seconds + 0.05)
    }
  }

  private makeNoiseBuffer(seconds: number) {
    const ctx = this.ctx!
    const length = Math.floor(ctx.sampleRate * seconds)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
    return buffer
  }
}

export const ambientAudio = new AmbientAudioEngine()
