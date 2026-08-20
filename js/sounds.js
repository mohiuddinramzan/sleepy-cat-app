/**
 * Simple Web Audio API sound synthesis for Sleepy Cat
 * No external files needed – works offline.
 */
const Sounds = {
  ctx: null,
  enabled: true,
  musicEnabled: false,
  musicOsc: null,
  musicGain: null,

  // Real audio files (loaded once, cloned on play so overlapping calls don't cut each other off)
  files: {
    meow: 'assets/sounds/meow.mp3',
    angry: 'assets/sounds/angry.mp3',
    snore: 'assets/sounds/snore.mp3'
  },
  buffers: {},

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio not supported');
    }
    this.preloadFiles();
  },

  preloadFiles() {
    Object.entries(this.files).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      this.buffers[key] = audio;
    });
  },

  // Play a preloaded real audio file. Clones the node so rapid repeat
  // triggers don't stop/restart each other.
  playFile(key, volume = 1) {
    if (!this.enabled) return false;
    const base = this.buffers[key];
    if (!base) return false;
    const node = base.cloneNode();
    node.volume = volume;
    node.play().catch(() => {}); // ignore autoplay-block errors
    return true;
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  setEnabled(val) {
    this.enabled = val;
    if (!val) this.stopMusic();
  },

  setMusic(val) {
    this.musicEnabled = val;
    if (val) this.startMusic();
    else this.stopMusic();
  },

  // Real meow sample
  meow() {
    if (this.playFile('meow', 0.9)) return;
    // Fallback: synthesized sweep if the file failed to load
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.25);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.4);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  },

  // Real purring/snore sample
  snore() {
    if (this.playFile('snore', 0.6)) return;
    // Fallback: synthesized drone if the file failed to load
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(90, t + 0.6);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.15);
    gain.gain.linearRampToValueAtTime(0.0001, t + 0.7);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.75);
  },

  // Sneeze
  sneeze() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    noise.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  },

  // Happy short chirp
  happy() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const notes = [523, 659, 784];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.15, t + i * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.1 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.25);
    });
  },

  // Eat nom nom
  eat() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 180 + i * 40;
      gain.gain.setValueAtTime(0.0001, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.12, t + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.12);
    }
  },

  // Soft tap / soft click
  tap() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  },

  // Soft pillow plop
  pillow() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  },

  // Real angry/hiss sample
  angry() {
    if (this.playFile('angry', 0.8)) return;
    // Fallback: synthesized growl if the file failed to load
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.3);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  },

  // Very soft ambient music (simple drone)
  startMusic() {
    if (!this.ctx || this.musicOsc) return;
    this.resume();
    this.musicOsc = this.ctx.createOscillator();
    this.musicGain = this.ctx.createGain();
    this.musicOsc.type = 'sine';
    this.musicOsc.frequency.value = 110;
    this.musicGain.gain.value = 0.03;
    this.musicOsc.connect(this.musicGain);
    this.musicGain.connect(this.ctx.destination);
    this.musicOsc.start();
  },

  stopMusic() {
    if (this.musicOsc) {
      try {
        this.musicOsc.stop();
      } catch (e) {}
      this.musicOsc = null;
      this.musicGain = null;
    }
  }
};
