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
    // Active by default unless user explicitly turned it off
    this.isBgmActive = localStorage.getItem('cyber_xo_bgm') !== 'false';
    
    // BGM State
    this.bgmInterval = null;
    this.bgmOscillators = [];
    this.stopBgmTimeout = null;
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
      this.ctx.resume().then(() => {
        if (this.isBgmActive && !this.bgmInterval) {
          this.startBgm();
        }
      });
    } else if (this.isBgmActive && !this.bgmInterval) {
      this.startBgm();
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
   * Starts procedural cyberpunk synthwave soundtrack:
   * Analog Sub-Bass + Atmospheric Cyber Pad + Neon Arpeggio + Sub Pulse
   */
  startBgm() {
    if (!this.ctx || !this.bgmGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Clear previous interval and scheduled stops immediately
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.stopBgmTimeout) {
      clearTimeout(this.stopBgmTimeout);
      this.stopBgmTimeout = null;
    }

    // Clean any running oscillators
    this.bgmOscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
    });
    this.bgmOscillators = [];

    const t = this.ctx.currentTime;
    this.bgmGain.gain.cancelScheduledValues(t);
    this.bgmGain.gain.setValueAtTime(0.001, t);
    this.bgmGain.gain.linearRampToValueAtTime(0.24, t + 1.2);

    // 1. Deep Analog Sub-Bass Drone (A1 55Hz with slight detune)
    const bass1 = this.ctx.createOscillator();
    const bass2 = this.ctx.createOscillator();
    const bassFilter = this.ctx.createBiquadFilter();

    bass1.type = 'sawtooth';
    bass1.frequency.setValueAtTime(55, t); // A1

    bass2.type = 'triangle';
    bass2.frequency.setValueAtTime(55.3, t); // slight analog detune

    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(160, t);

    bass1.connect(bassFilter);
    bass2.connect(bassFilter);
    bassFilter.connect(this.bgmGain);

    bass1.start(t);
    bass2.start(t);
    this.bgmOscillators.push(bass1, bass2);

    // 2. Atmospheric Cyber Pad (A3 220Hz & E4 329.63Hz with breathing filter)
    const pad1 = this.ctx.createOscillator();
    const pad2 = this.ctx.createOscillator();
    const padFilter = this.ctx.createBiquadFilter();
    const padGain = this.ctx.createGain();

    pad1.type = 'triangle';
    pad1.frequency.setValueAtTime(220, t); // A3

    pad2.type = 'sine';
    pad2.frequency.setValueAtTime(329.63, t); // E4

    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(450, t);

    padGain.gain.setValueAtTime(0.12, t);

    pad1.connect(padFilter);
    pad2.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(this.bgmGain);

    pad1.start(t);
    pad2.start(t);
    this.bgmOscillators.push(pad1, pad2);

    // 3. Synthwave 16th-note Arpeggiator & Rhythmic Cyber Pulse
    // A-minor progression: [A2, E3, A3, C4, E4, C4, A3, E3, F2, C3, F3, A3, C4, A3, F3, C3]
    const arpNotes = [
      110.00, 164.81, 220.00, 261.63, 329.63, 261.63, 220.00, 164.81,
      87.31,  130.81, 174.61, 220.00, 261.63, 220.00, 174.61, 130.81
    ];
    this.arpStep = 0;

    this.bgmInterval = setInterval(() => {
      if (!this.ctx || !this.isBgmActive || this.isMuted) return;

      const now = this.ctx.currentTime;
      const step = this.arpStep % arpNotes.length;
      const freq = arpNotes[step];
      this.arpStep++;

      // Synth Pluck
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      const arpFilter = this.ctx.createBiquadFilter();

      arpOsc.type = 'sawtooth';
      arpOsc.frequency.setValueAtTime(freq, now);

      arpFilter.type = 'lowpass';
      arpFilter.frequency.setValueAtTime(freq * 3.5, now);
      arpFilter.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.18);
      arpFilter.Q.setValueAtTime(3, now);

      arpGain.gain.setValueAtTime(0, now);
      arpGain.gain.linearRampToValueAtTime(0.06, now + 0.015);
      arpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      arpOsc.connect(arpFilter);
      arpFilter.connect(arpGain);
      arpGain.connect(this.bgmGain);

      arpOsc.start(now);
      arpOsc.stop(now + 0.22);

      // Subtle Cyber Kick Pulse on beats 0, 4, 8, 12
      if (step % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();

        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(95, now);
        kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.09);

        kickGain.gain.setValueAtTime(0.12, now);
        kickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain);

        kickOsc.start(now);
        kickOsc.stop(now + 0.1);
      }
    }, 220);
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
      this.bgmGain.gain.linearRampToValueAtTime(0.0001, t + 0.4);
    }

    if (this.stopBgmTimeout) {
      clearTimeout(this.stopBgmTimeout);
    }
    this.stopBgmTimeout = setTimeout(() => {
      this.bgmOscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      this.bgmOscillators = [];
      this.stopBgmTimeout = null;
    }, 450);
  }

  /**
   * High-tech laser whistle for Player X move
   */
  playMoveX() {
    this.vibrateTap();
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
    this.vibrateTap();
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
    this.vibrate(8);
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
    this.vibrateVictory();
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
    this.vibrate([30, 40, 30]);
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
    this.vibrate(15);
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
    if (isUrgent) this.vibrateWarning();
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
   * Haptic Feedback for Touch Devices
   */
  vibrate(pattern = 15) {
    if ('vibrate' in navigator && !this.isMuted) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  vibrateTap() {
    this.vibrate(12);
  }

  vibrateWarning() {
    this.vibrate([20, 30, 20]);
  }

  vibrateVictory() {
    this.vibrate([40, 50, 70, 40, 100]);
  }

  vibrateGlitch() {
    this.vibrate([25, 20, 25]);
  }

  vibrateDefeat() {
    this.vibrate([60, 40, 60]);
  }

  /**
   * Hologram Reaction chirp sound for P2P multiplayer
   */
  playReaction() {
    this.vibrate(18);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.exponentialRampToValueAtTime(1320, t + 0.12);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  /**
   * Achievement Unlocked cyber fanfare (Ascending crystal chime)
   */
  playAchievement() {
    this.vibrate([30, 50, 50, 40, 80]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
    const startTime = this.ctx.currentTime + 0.02;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + i * 0.08);

      gain.gain.setValueAtTime(0, startTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.3, startTime + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + i * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime + i * 0.08);
      osc.stop(startTime + i * 0.08 + 0.35);
    });
  }

  /**
   * Glitch alarm when Blitz timer expires
   */
  playTimerAlarm() {
    this.vibrateDefeat();
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
