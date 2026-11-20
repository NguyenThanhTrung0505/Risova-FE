import { getSharedAudioContext, unlockIntroAudio } from './risovaIntroAudio';

let loginNoiseBuffer = null;

function getLoginNoiseBuffer(ctx) {
  if (loginNoiseBuffer && loginNoiseBuffer.sampleRate === ctx.sampleRate) {
    return loginNoiseBuffer;
  }
  const length = Math.floor(ctx.sampleRate * 1.5);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  loginNoiseBuffer = buffer;
  return buffer;
}

function createSessionOutput(ctx, volume = 0.72) {
  const sessionGain = ctx.createGain();
  sessionGain.gain.setValueAtTime(volume, ctx.currentTime);

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-14, ctx.currentTime);
  compressor.knee.setValueAtTime(16, ctx.currentTime);
  compressor.ratio.setValueAtTime(4, ctx.currentTime);
  compressor.attack.setValueAtTime(0.005, ctx.currentTime);
  compressor.release.setValueAtTime(0.18, ctx.currentTime);

  sessionGain.connect(compressor);
  compressor.connect(ctx.destination);
  return { sessionGain, compressor };
}

/**
 * Start subtle interlocking mechanical gear spin audio during verification.
 */
export function startGearSpinSound() {
  const ctx = unlockIntroAudio() || getSharedAudioContext();
  if (!ctx || ctx.state !== 'running') {
    return { stop() {} };
  }

  const { sessionGain, compressor } = createSessionOutput(ctx, 0.72);
  const now = ctx.currentTime;
  const maxDuration = 2.25;

  const envelopeGain = ctx.createGain();
  envelopeGain.gain.setValueAtTime(0.0001, now);
  envelopeGain.gain.exponentialRampToValueAtTime(1.0, now + 0.18);
  envelopeGain.gain.setValueAtTime(1.0, now + 1.9);
  envelopeGain.gain.exponentialRampToValueAtTime(0.0001, now + maxDuration);
  envelopeGain.connect(sessionGain);

  const sources = [];

  // Warm low mechanical gear hum
  const hum = ctx.createOscillator();
  hum.type = 'triangle';
  hum.frequency.setValueAtTime(92, now);

  const humFilter = ctx.createBiquadFilter();
  humFilter.type = 'lowpass';
  humFilter.frequency.setValueAtTime(320, now);

  const humGain = ctx.createGain();
  humGain.gain.setValueAtTime(0.08, now);

  hum.connect(humFilter);
  humFilter.connect(humGain);
  humGain.connect(envelopeGain);
  hum.start(now);
  hum.stop(now + maxDuration + 0.04);
  sources.push(hum);

  // Rhythmic meshing noise pulse (LFO modulated bandpass air whir)
  const noise = ctx.createBufferSource();
  noise.buffer = getLoginNoiseBuffer(ctx);
  noise.loop = true;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(420, now);
  noiseFilter.Q.setValueAtTime(1.4, now);

  const pulseGain = ctx.createGain();
  pulseGain.gain.setValueAtTime(0.06, now);

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(6, now);

  const lfoDepth = ctx.createGain();
  lfoDepth.gain.setValueAtTime(0.022, now);
  lfo.connect(lfoDepth);
  lfoDepth.connect(pulseGain.gain);

  noise.connect(noiseFilter);
  noiseFilter.connect(pulseGain);
  pulseGain.connect(envelopeGain);

  noise.start(now);
  noise.stop(now + maxDuration + 0.04);
  lfo.start(now);
  lfo.stop(now + maxDuration + 0.04);
  sources.push(noise, lfo);

  let stopped = false;

  return {
    stop() {
      if (stopped) return;
      stopped = true;
      try {
        sessionGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.015);
      } catch {
        // Ignore teardown context errors
      }
      window.setTimeout(() => {
        sources.forEach((source) => {
          try {
            source.stop();
          } catch {
            // Already stopped
          }
          try {
            source.disconnect();
          } catch {
            // Already disconnected
          }
        });
        sources.length = 0;
        try {
          envelopeGain.disconnect();
          sessionGain.disconnect();
          compressor.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      }, 75);
    },
  };
}

/**
 * Play crisp mechanical brake clunk + low descending error tone when login fails.
 */
export function playLoginErrorSound() {
  const ctx = getSharedAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const { sessionGain } = createSessionOutput(ctx, 0.72);
  const now = ctx.currentTime;

  // Mechanical brake clunk (filtered noise burst + thud)
  const clunkNoise = ctx.createBufferSource();
  clunkNoise.buffer = getLoginNoiseBuffer(ctx);

  const clunkFilter = ctx.createBiquadFilter();
  clunkFilter.type = 'bandpass';
  clunkFilter.frequency.setValueAtTime(750, now);
  clunkFilter.Q.setValueAtTime(2.0, now);

  const clunkGain = ctx.createGain();
  clunkGain.gain.setValueAtTime(0.0001, now);
  clunkGain.gain.exponentialRampToValueAtTime(0.18, now + 0.006);
  clunkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

  clunkNoise.connect(clunkFilter);
  clunkFilter.connect(clunkGain);
  clunkGain.connect(sessionGain);
  clunkNoise.start(now, 0, 0.11);
  clunkNoise.stop(now + 0.11);

  const thud = ctx.createOscillator();
  thud.type = 'sine';
  thud.frequency.setValueAtTime(150, now);
  thud.frequency.exponentialRampToValueAtTime(52, now + 0.15);

  const thudGain = ctx.createGain();
  thudGain.gain.setValueAtTime(0.0001, now);
  thudGain.gain.exponentialRampToValueAtTime(0.28, now + 0.008);
  thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);

  thud.connect(thudGain);
  thudGain.connect(sessionGain);
  thud.start(now);
  thud.stop(now + 0.19);

  // Descending double error tone (clear, non-harsh)
  const toneFilter = ctx.createBiquadFilter();
  toneFilter.type = 'lowpass';
  toneFilter.frequency.setValueAtTime(900, now);
  toneFilter.connect(sessionGain);

  [
    { start: 0.04, freq: 310, dur: 0.14 },
    { start: 0.17, freq: 215, dur: 0.22 },
  ].forEach(({ start, freq, dur }) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + start);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now + start);
    g.gain.exponentialRampToValueAtTime(0.16, now + start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

    osc.connect(g);
    g.connect(toneFilter);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.02);
  });
}

/**
 * Play clean emerald lock-in click + ascending confirmation pair when gears turn green.
 */
export function playLoginGreenLockSound() {
  const ctx = getSharedAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const { sessionGain } = createSessionOutput(ctx, 0.7);
  const now = ctx.currentTime;

  const click = ctx.createOscillator();
  click.type = 'sine';
  click.frequency.setValueAtTime(1100, now);

  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.0001, now);
  clickGain.gain.exponentialRampToValueAtTime(0.09, now + 0.004);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

  click.connect(clickGain);
  clickGain.connect(sessionGain);
  click.start(now);
  click.stop(now + 0.035);

  [
    { start: 0, freq: 523.25 },
    { start: 0.08, freq: 659.25 },
  ].forEach(({ start, freq }) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + start);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now + start);
    g.gain.exponentialRampToValueAtTime(0.11, now + start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + start + 0.24);

    osc.connect(g);
    g.connect(sessionGain);
    osc.start(now + start);
    osc.stop(now + start + 0.26);
  });
}

/**
 * Play sparkling "tinh!" chime as the green checkmark appears.
 */
export function playLoginSuccessChime() {
  const ctx = getSharedAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const { sessionGain } = createSessionOutput(ctx, 0.78);
  const now = ctx.currentTime;

  const notes = [
    { start: 0, freq: 880.0, peak: 0.16, decay: 0.82 },
    { start: 0, freq: 1760.0, peak: 0.045, decay: 0.55 },
    { start: 0.035, freq: 1318.51, peak: 0.15, decay: 0.85 },
    { start: 0.035, freq: 2637.02, peak: 0.018, decay: 0.45 },
  ];

  notes.forEach(({ start, freq, peak, decay }) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + start);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now + start);
    g.gain.exponentialRampToValueAtTime(peak, now + start + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, now + start + decay);

    osc.connect(g);
    g.connect(sessionGain);
    osc.start(now + start);
    osc.stop(now + start + decay + 0.03);
  });
}
