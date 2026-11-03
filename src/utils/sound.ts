// Procedural Web Audio API Sound System for Hexacore

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private lastHoverTime: number = 0;
  private scaleIndex: number = 0;
  private listeners: Set<(muted: boolean) => void> = new Set();

  // Pentatonic scale (C5, D5, E5, G5, A5, C6) for harmonious sequential hovers
  private pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hexacore_sfx_muted');
      // Default to muted (sound is OFF until user manually turns it ON)
      this.isMuted = saved !== 'false';

      // Resume context on first user gesture
      const unlock = () => {
        this.initContext();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };

      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  public get muted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hexacore_sfx_muted', String(this.isMuted));
    }
    if (!this.isMuted) {
      const ctx = this.initContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      this.playToggle(true);
    }
    this.listeners.forEach((cb) => cb(this.isMuted));
    return this.isMuted;
  }

  public subscribe(cb: (muted: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  /**
   * Ultra-clean, subtle futuristic hover tick / harmonic blip
   */
  public playHover(type: 'default' | 'card' | 'subtle' = 'default') {
    if (this.isMuted) return;
    const now = performance.now();
    // Throttle to prevent audio clutter on rapid sweeps
    if (now - this.lastHoverTime < 32) return;
    this.lastHoverTime = now;

    const ctx = this.initContext();
    if (!ctx || ctx.state !== 'running') return;

    const t = ctx.currentTime;

    if (type === 'card') {
      // Deeper, resonant glass chime for cards & project rows
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      const baseFreq = 220; // A3
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, t);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 2.01, t); // Octave + tiny detune

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.12);

      gain.gain.setValueAtTime(0.045, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.15);
      osc2.stop(t + 0.15);
      return;
    }

    // Melodic ascending/descending pentatonic tick
    const freq = this.pentatonic[this.scaleIndex % this.pentatonic.length];
    this.scaleIndex = (this.scaleIndex + 1) % this.pentatonic.length;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.05, t + 0.045);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, t);

    // Very quiet, tactile, silky
    const vol = type === 'subtle' ? 0.025 : 0.04;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.055);
  }

  /**
   * Dedicated musical note for each letter of HEXACORE (8 letters)
   */
  public playLetterNote(index: number) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || ctx.state !== 'running') return;

    // Harmonic scale across the 8 letters (C4, D4, E4, G4, A4, C5, D5, E5)
    const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    const freq = notes[index % notes.length];
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + 0.22);

    gain.gain.setValueAtTime(0.065, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

    osc.connect(filter);
    oscHarmonic.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    oscHarmonic.start(t);
    osc.stop(t + 0.26);
    oscHarmonic.stop(t + 0.26);
  }

  /**
   * Tactile precision click / haptic tap
   */
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || ctx.state !== 'running') return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.035);

    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.045);
  }

  /**
   * Rising or falling chime for toggle
   */
  public playToggle(on: boolean) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || ctx.state !== 'running') return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = on ? 440 : 660;
    const endFreq = on ? 880 : 330;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.08);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.11);
  }
}

export const sound = new SoundSystem();
