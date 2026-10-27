/**
 * مشغل الموسيقى الرومانسية الهادئة لدعوة الخطوبة
 * يدعم توليد نغمات بيانو/هارب رومانسية نقية (Canon in D) عبر Web Audio API
 * دون الحاجة لتحميل ملفات صوتية ضخمة، مع دعم تشغيل ملف mp3 مخصص عند توفره.
 */

class RomanticWeddingAudio {
  constructor() {
    this.isPlaying = false;
    this.audioCtx = null;
    this.timerId = null;
    this.step = 0;
    this.volume = 0.25;
    this.customAudio = null;
    this.btn = null;
    this.hasCustomFile = false;

    // سلم النغمات الرومانسية الهادئة (D Major - Canon in D chords)
    // D - A - Bm - F#m - G - D - G - A
    this.chords = [
      [146.83, 220.00, 293.66, 369.99, 440.00, 587.33], // D maj
      [110.00, 164.81, 220.00, 277.18, 329.63, 440.00], // A maj
      [123.47, 185.00, 246.94, 293.66, 369.99, 493.88], // B min
      [92.50,  146.83, 185.00, 220.00, 277.18, 369.99], // F# min
      [98.00,  146.83, 196.00, 246.94, 293.66, 392.00], // G maj
      [146.83, 220.00, 293.66, 369.99, 440.00, 587.33], // D maj
      [98.00,  146.83, 196.00, 246.94, 293.66, 392.00], // G maj
      [110.00, 164.81, 220.00, 277.18, 329.63, 440.00]  // A maj
    ];

    this.init();
  }

  init() {
    this.btn = document.getElementById('musicToggleBtn');
    if (!this.btn) return;

    this.btn.addEventListener('click', () => {
      this.toggle();
    });

    // Check if custom mp3 exists
    const audioEl = document.getElementById('weddingBgAudio');
    if (audioEl && audioEl.src) {
      this.customAudio = audioEl;
      this.customAudio.volume = this.volume;
      this.hasCustomFile = true;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.hasCustomFile && this.customAudio) {
      this.customAudio.play().then(() => {
        this.isPlaying = true;
        this.updateUI(true);
      }).catch(() => {
        // Fallback to synth if custom audio failed
        this.playSynthesized();
      });
      return;
    }

    this.playSynthesized();
  }

  playSynthesized() {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.isPlaying = true;
      this.updateUI(true);
      this.scheduleArpeggio();
    } catch (e) {
      console.warn('Audio context init error:', e);
    }
  }

  scheduleArpeggio() {
    if (!this.isPlaying) return;

    const chordIndex = Math.floor(this.step / 8) % this.chords.length;
    const chord = this.chords[chordIndex];
    const notePattern = [0, 2, 1, 3, 2, 4, 3, 5];
    const noteIndex = notePattern[this.step % 8];
    const freq = chord[noteIndex % chord.length];

    this.playHarpNote(freq, 0.9);

    this.step++;
    this.timerId = setTimeout(() => this.scheduleArpeggio(), 280);
  }

  playHarpNote(frequency, duration) {
    if (!this.audioCtx || !this.isPlaying) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // Soft sine with a touch of triangle for warm acoustic harp feel
    osc.type = (this.step % 4 === 0) ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    // Filter to soften high frequencies
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    // Natural harp decay envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(this.volume * 0.45, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  }

  pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
    this.updateUI(false);
  }

  updateUI(playing) {
    if (!this.btn) return;
    const icon = this.btn.querySelector('.music-icon');
    const label = this.btn.querySelector('.music-label');

    if (playing) {
      this.btn.classList.add('playing');
      if (icon) icon.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      `;
      if (label) label.textContent = 'إيقاف الموسيقى';
    } else {
      this.btn.classList.remove('playing');
      if (icon) icon.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      `;
      if (label) label.textContent = 'موسيقى هادئة';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.weddingAudio = new RomanticWeddingAudio();
});
