/**
 * AUDIO.JS - Procedural Sound Engine & Ambient Synthwave BGM using Native Web Audio API
 * No external audio files required. All sounds and music synthesized in real-time.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.isMuted = localStorage.getItem('cyber_xo_muted') === 'true';
    this.isBgmActive = localStorage.getItem('cyber_xo_bgm') === 'true';
    
    // BGM State
    this.bgmInterval = null;
    this.bgmOscillators = [];
    this.arpStep = 0;
  }

  /**
   * Initializes or resumes the AudioContext on user interaction
   */
  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      if (this.isBgmActive) {
        this.startBgm();
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Toggles sound on/off and persists setting in localStorage
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('cyber_xo_muted', this.isMuted.toString());

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  /**
   * Toggles procedural BGM and persists setting
   */
  toggleBgm() {
    this.initContext();
    this.isBgmActive = !this.isBgmActive;
    localStorage.setItem('cyber_xo_bgm', this.isBgmActive.toString());

    if (this.isBgmActive) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
    return this.isBgmActive;
  }

  getBgmActive() {
    return this.isBgmActive;
  }

  /**
   * Starts procedural cyberpunk drone pad & synthwave arpeggio loop
   */
  startBgm() {
    if (!this.ctx || !this.bgmGain) return;
    this.stopBgm(); // Clean previous if any

    const t = this.ctx.currentTime;
    this.bgmGain.gain.cancelScheduledValues(t);
    this.bgmGain.gain.setValueAtTime(0, t);
    this.bgmGain.gain.linearRampToValueAtTime(0.18, t + 1.5);

    // 1. Deep Sub Drone (Root + Fifth: A1 55Hz & E2 82.4Hz)
    const drone1 = this.ctx.createOscillator();
    const drone2 = this.ctx.createOscillator();
    const droneFilter = this.ctx.createBiquadFilter();

    drone1.type = 'sawtooth';
    drone1.frequency.setValueAtTime(55, t);

    drone2.type = 'triangle';
    drone2.frequency.setValueAtTime(82.4, t);

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(180, t);

    drone1.connect(droneFilter);
    drone2.connect(droneFilter);
    droneFilter.connect(this.bgmGain);

    drone1.start(t);
    drone2.start(t);
    this.bgmOscillators.push(drone1, drone2);

    // 2. Cyberpunk Pentatonic Arpeggiator Loop
    // Scale: A minor pentatonic (A2, C3, D3, E3, G3, A3)
    const arpScale = [110, 130.81, 146.83, 164.81, 196.00, 220, 196.00, 164.81];
    this.arpStep = 0;

    this.bgmInterval = setInterval(() => {
      if (!this.ctx || !this.isBgmActive || this.isMuted) return;

      const now = this.ctx.currentTime;
      const freq = arpScale[this.arpStep % arpScale.length];
      this.arpStep++;

      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      const arpFilter = this.ctx.createBiquadFilter();

      arpOsc.type = 'triangle';
      arpOsc.frequency.setValueAtTime(freq, now);

      arpFilter.type = 'bandpass';
      arpFilter.frequency.setValueAtTime(freq * 1.5, now);
      arpFilter.Q.setValueAtTime(2.5, now);

      arpGain.gain.setValueAtTime(0, now);
      arpGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      arpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      arpOsc.connect(arpFilter);
      arpFilter.connect(arpGain);
      arpGain.connect(this.bgmGain);

      arpOsc.start(now);
      arpOsc.stop(now + 0.28);
    }, 280);
  }

  /**
   * Smoothly stops procedural BGM
   */
  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }

    if (this.bgmGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(t);
      this.bgmGain.gain.linearRampToValueAtTime(0, t + 0.6);
    }

    setTimeout(() => {
      this.bgmOscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      this.bgmOscillators = [];
    }, 650);
  }

  /**
   * High-tech laser whistle for Player X move
   */
  playMoveX() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.18);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + 0.18);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  /**
   * Deep plasma resonating tone for Player O move
   */
  playMoveO() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(150, t);
    osc1.frequency.exponentialRampToValueAtTime(65, t + 0.28);

    osc2.frequency.setValueAtTime(300, t);
    osc2.frequency.exponentialRampToValueAtTime(130, t + 0.28);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.28);
    osc2.stop(t + 0.28);
  }

  /**
   * Soft futuristic high-tech click
   */
  playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  /**
   * Ascending major cyber arpeggio fanfare for Victory
   */
  playWin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    const startTime = this.ctx.currentTime + 0.05;

    notes.forEach((freq, index) => {
      const noteTime = startTime + index * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      const duration = index === notes.length - 1 ? 0.6 : 0.25;

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.4, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + duration);
    });
  }

  /**
   * Futuristic descending sigh for Draw/Tie
   */
  playDraw() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.45);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  /**
   * Shimmering dematerialization sound when a ghost mark dissolves
   */
  playDissolve() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.28);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.28);
  }

  /**
   * Subtle rhythmic click/tick for blitz timer
   */
  playTimerTick(isUrgent = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const freq = isUrgent ? 880 : 440;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq / 2, t + 0.03);

    const vol = isUrgent ? 0.25 : 0.12;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.03);
  }

  /**
   * Glitch alarm when Blitz timer expires
   */
  playTimerAlarm() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.setValueAtTime(150, t + 0.1);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }
}

export const sound = new SoundEngine();
