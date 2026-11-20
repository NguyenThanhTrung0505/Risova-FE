let sharedCtx = null;
let cachedNoiseBuffer = null;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function getSharedAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedCtx || sharedCtx.state === 'closed') {
    try {
      sharedCtx = new AudioCtx();
      cachedNoiseBuffer = null;
    } catch {
      return null;
    }
  }
  return sharedCtx;
}

export function unlockIntroAudio() {
  const ctx = getSharedAudioContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function isIntroAudioRunning() {
  return Boolean(sharedCtx && sharedCtx.state === 'running');
}

function getNoiseBuffer(ctx) {
  if (cachedNoiseBuffer && cachedNoiseBuffer.sampleRate === ctx.sampleRate) {
    return cachedNoiseBuffer;
  }
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  cachedNoiseBuffer = buffer;
  return buffer;
}

function connectWithOptionalPan(ctx, node, dest, startPan, endPan, startTime, endTime) {
  if (typeof ctx.createStereoPanner === 'function') {
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(startPan, startTime);
    if (endTime > startTime && startPan !== endPan) {
      panner.pan.linearRampToValueAtTime(endPan, endTime);
    }
    node.connect(panner);
    panner.connect(dest);
    return;
  }
  node.connect(dest);
}

/**
 * Play synchronized Web Audio procedural sound effects for RisovaIntroSplash.
 * Timeline:
 *  - 0.00s -> 1.50s: Luminous energy whoosh + sub-hum sweeping left -> center
 *  - 1.50s: Crisp impact punch + crystalline ping + micro electric crackle
 *  - 1.50s -> 2.75s: Filament hum + 3 synced ECG heartbeat thumps & monitor pings
 *  - 2.75s: Warm Cmaj9 Risova brand chord bloom
 *  - 3.20s: Soft downward air swish during logo shrink
 *  - 3.68s: 3 rising bell harmonics as RISOVA wordmark appears
 */
export function playRisovaIntroSound({ offsetSec = 0 } = {}) {
  const ctx = getSharedAudioContext();
  if (!ctx || ctx.state !== 'running') return null;

  const sessionGain = ctx.createGain();
  sessionGain.gain.setValueAtTime(0.72, ctx.currentTime);

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-14, ctx.currentTime);
  compressor.knee.setValueAtTime(16, ctx.currentTime);
  compressor.ratio.setValueAtTime(4, ctx.currentTime);
  compressor.attack.setValueAtTime(0.005, ctx.currentTime);
  compressor.release.setValueAtTime(0.18, ctx.currentTime);

  sessionGain.connect(compressor);
  compressor.connect(ctx.destination);

  const sources = [];
  const registerSource = (source) => {
    sources.push(source);
    return source;
  };

  const now = ctx.currentTime;
  const baseTime = now - Math.max(0, offsetSec);
  const noiseBuffer = getNoiseBuffer(ctx);

  // --------------------------------------------------------------------------
  // 1. Stage 1 (0.00s -> 1.50s): White horizontal beam traveling left -> bulb
  // --------------------------------------------------------------------------
  const beamEnd = baseTime + 1.5;
  if (beamEnd > now + 0.05) {
    const start = Math.max(now + 0.005, baseTime);
    const p = Math.max(0, Math.min(1, (start - baseTime) / 1.5));

    // Filtered white-noise air beam
    const noise = registerSource(ctx.createBufferSource());
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.2, start);
    filter.frequency.setValueAtTime(lerp(220, 1800, p), start);
    filter.frequency.exponentialRampToValueAtTime(1800, beamEnd);

    const fadeInEnd = Math.min(start + 0.26, start + (beamEnd - start) * 0.45);
    const fadeOutStart = Math.max(fadeInEnd + 0.005, beamEnd - 0.06);
    const beamGain = ctx.createGain();
    beamGain.gain.setValueAtTime(0.0001, start);
    beamGain.gain.exponentialRampToValueAtTime(0.16, fadeInEnd);
    beamGain.gain.setValueAtTime(0.16, fadeOutStart);
    beamGain.gain.exponentialRampToValueAtTime(0.0001, beamEnd + 0.04);

    noise.connect(filter);
    filter.connect(beamGain);
    connectWithOptionalPan(ctx, beamGain, sessionGain, lerp(-0.85, 0, p), 0, start, beamEnd);

    noise.start(start);
    noise.stop(beamEnd + 0.06);

    // Rising low-end energy hum
    const hum = registerSource(ctx.createOscillator());
    hum.type = 'sine';
    hum.frequency.setValueAtTime(lerp(75, 155, p), start);
    hum.frequency.exponentialRampToValueAtTime(155, beamEnd);

    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0.0001, start);
    humGain.gain.exponentialRampToValueAtTime(0.13, Math.min(beamEnd - 0.02, start + 0.35));
    humGain.gain.exponentialRampToValueAtTime(0.0001, beamEnd + 0.03);

    hum.connect(humGain);
    connectWithOptionalPan(ctx, humGain, sessionGain, lerp(-0.85, 0, p), 0, start, beamEnd);

    hum.start(start);
    hum.stop(beamEnd + 0.05);
  }

  // --------------------------------------------------------------------------
  // 2. Stage 2a (1.50s): Beam pierces left wall of the lightbulb
  // --------------------------------------------------------------------------
  const impactTime = baseTime + 1.5;
  if (impactTime >= now - 0.04) {
    const s = Math.max(now + 0.005, impactTime);

    // Sub-punch
    const punch = registerSource(ctx.createOscillator());
    punch.type = 'sine';
    punch.frequency.setValueAtTime(165, s);
    punch.frequency.exponentialRampToValueAtTime(42, s + 0.24);

    const punchGain = ctx.createGain();
    punchGain.gain.setValueAtTime(0.0001, s);
    punchGain.gain.exponentialRampToValueAtTime(0.42, s + 0.008);
    punchGain.gain.exponentialRampToValueAtTime(0.0001, s + 0.28);

    punch.connect(punchGain);
    punchGain.connect(sessionGain);
    punch.start(s);
    punch.stop(s + 0.3);

    // Crystalline glass ping harmonics
    [
      [1318.5, 0.13],
      [1975.5, 0.07],
    ].forEach(([freq, peak]) => {
      const ping = registerSource(ctx.createOscillator());
      ping.type = 'sine';
      ping.frequency.setValueAtTime(freq, s);

      const pingGain = ctx.createGain();
      pingGain.gain.setValueAtTime(0.0001, s);
      pingGain.gain.exponentialRampToValueAtTime(peak, s + 0.006);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, s + 0.55);

      ping.connect(pingGain);
      pingGain.connect(sessionGain);
      ping.start(s);
      ping.stop(s + 0.57);
    });

    // Micro electric crackle burst
    const crackle = registerSource(ctx.createBufferSource());
    crackle.buffer = noiseBuffer;

    const crackleFilter = ctx.createBiquadFilter();
    crackleFilter.type = 'bandpass';
    crackleFilter.frequency.setValueAtTime(4200, s);
    crackleFilter.Q.setValueAtTime(2.4, s);

    const crackleGain = ctx.createGain();
    crackleGain.gain.setValueAtTime(0.0001, s);
    crackleGain.gain.exponentialRampToValueAtTime(0.22, s + 0.004);
    crackleGain.gain.exponentialRampToValueAtTime(0.0001, s + 0.045);

    crackle.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(sessionGain);
    crackle.start(s, 0, 0.06);
    crackle.stop(s + 0.06);
  }

  // --------------------------------------------------------------------------
  // 3. Stage 2b (1.50s -> 2.75s): Filament ignition hum + 3 ECG heartbeats
  // --------------------------------------------------------------------------
  const filamentStart = baseTime + 1.5;
  const filamentEnd = baseTime + 2.75;
  if (filamentEnd > now + 0.05) {
    const start = Math.max(now + 0.005, filamentStart);
    const p = Math.max(0, Math.min(1, (start - filamentStart) / 1.25));

    const filament = registerSource(ctx.createOscillator());
    filament.type = 'triangle';
    filament.frequency.setValueAtTime(lerp(220, 330, p), start);
    filament.frequency.exponentialRampToValueAtTime(330, filamentEnd);

    const filamentFilter = ctx.createBiquadFilter();
    filamentFilter.type = 'lowpass';
    filamentFilter.frequency.setValueAtTime(900, start);

    const filamentGain = ctx.createGain();
    filamentGain.gain.setValueAtTime(0.0001, start);
    filamentGain.gain.exponentialRampToValueAtTime(0.065, Math.min(filamentEnd - 0.04, start + 0.25));
    filamentGain.gain.exponentialRampToValueAtTime(0.0001, filamentEnd + 0.06);

    filament.connect(filamentFilter);
    filamentFilter.connect(filamentGain);
    filamentGain.connect(sessionGain);
    filament.start(start);
    filament.stop(filamentEnd + 0.08);
  }

  const ecgPulses = [
    { offset: 1.74, thumpStart: 74, thumpEnd: 38, thumpPeak: 0.22, pingFreq: 1046.5, pingPeak: 0.055 },
    { offset: 2.02, thumpStart: 80, thumpEnd: 38, thumpPeak: 0.3, pingFreq: 1174.66, pingPeak: 0.075 },
    { offset: 2.36, thumpStart: 64, thumpEnd: 34, thumpPeak: 0.24, pingFreq: 1318.51, pingPeak: 0.08 },
  ];

  ecgPulses.forEach((pulse) => {
    const pulseTime = baseTime + pulse.offset;
    if (pulseTime < now - 0.04) return;
    const s = Math.max(now + 0.005, pulseTime);

    const thump = registerSource(ctx.createOscillator());
    thump.type = 'sine';
    thump.frequency.setValueAtTime(pulse.thumpStart, s);
    thump.frequency.exponentialRampToValueAtTime(pulse.thumpEnd, s + 0.19);

    const thumpGain = ctx.createGain();
    thumpGain.gain.setValueAtTime(0.0001, s);
    thumpGain.gain.exponentialRampToValueAtTime(pulse.thumpPeak, s + 0.014);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, s + 0.22);

    thump.connect(thumpGain);
    thumpGain.connect(sessionGain);
    thump.start(s);
    thump.stop(s + 0.24);

    const ping = registerSource(ctx.createOscillator());
    ping.type = 'sine';
    ping.frequency.setValueAtTime(pulse.pingFreq, s);

    const pingGain = ctx.createGain();
    pingGain.gain.setValueAtTime(0.0001, s);
    pingGain.gain.exponentialRampToValueAtTime(pulse.pingPeak, s + 0.008);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, s + 0.16);

    ping.connect(pingGain);
    pingGain.connect(sessionGain);
    ping.start(s);
    ping.stop(s + 0.18);
  });

  // --------------------------------------------------------------------------
  // 4. Stage 3a (2.75s): Official Risova logo reveal — Warm Cmaj9 chord bloom
  // --------------------------------------------------------------------------
  const bloomTime = baseTime + 2.75;
  if (bloomTime >= now - 0.06) {
    const s = Math.max(now + 0.005, bloomTime);

    const chordFilter = ctx.createBiquadFilter();
    chordFilter.type = 'lowpass';
    chordFilter.frequency.setValueAtTime(900, s);
    chordFilter.frequency.exponentialRampToValueAtTime(3400, s + 0.18);
    chordFilter.frequency.exponentialRampToValueAtTime(1300, s + 1.45);
    chordFilter.connect(sessionGain);

    const chordFreqs = [261.63, 392.0, 493.88, 587.33, 659.25];
    chordFreqs.forEach((freq, idx) => {
      const osc = registerSource(ctx.createOscillator());
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, s);
      osc.detune.setValueAtTime((idx - 2) * 3.5, s);

      const voiceGain = ctx.createGain();
      voiceGain.gain.setValueAtTime(0.0001, s);
      voiceGain.gain.exponentialRampToValueAtTime(idx === 0 ? 0.075 : 0.052, s + 0.08);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, s + 1.45);

      osc.connect(voiceGain);
      voiceGain.connect(chordFilter);
      osc.start(s);
      osc.stop(s + 1.48);
    });
  }

  // --------------------------------------------------------------------------
  // 5. Stage 3b (3.20s): Logo shrinks — Soft downward air swish
  // --------------------------------------------------------------------------
  const swishTime = baseTime + 3.2;
  if (swishTime >= now - 0.04) {
    const s = Math.max(now + 0.005, swishTime);

    const swish = registerSource(ctx.createBufferSource());
    swish.buffer = noiseBuffer;
    swish.loop = true;

    const swishFilter = ctx.createBiquadFilter();
    swishFilter.type = 'bandpass';
    swishFilter.Q.setValueAtTime(1.6, s);
    swishFilter.frequency.setValueAtTime(950, s);
    swishFilter.frequency.exponentialRampToValueAtTime(300, s + 0.42);

    const swishGain = ctx.createGain();
    swishGain.gain.setValueAtTime(0.0001, s);
    swishGain.gain.exponentialRampToValueAtTime(0.095, s + 0.09);
    swishGain.gain.exponentialRampToValueAtTime(0.0001, s + 0.42);

    swish.connect(swishFilter);
    swishFilter.connect(swishGain);
    swishGain.connect(sessionGain);
    swish.start(s, 0.25);
    swish.stop(s + 0.44);
  }

  // --------------------------------------------------------------------------
  // 6. Stage 3c (3.68s): RISOVA wordmark — 3 rising crystalline bell harmonics
  // --------------------------------------------------------------------------
  const chimes = [
    { offset: 3.68, freq: 783.99 },
    { offset: 3.75, freq: 987.77 },
    { offset: 3.82, freq: 1174.66 },
  ];

  chimes.forEach(({ offset, freq }) => {
    const chimeTime = baseTime + offset;
    if (chimeTime < now - 0.04) return;
    const s = Math.max(now + 0.005, chimeTime);

    [
      [freq, 0.075, 0.75],
      [freq * 2, 0.015, 0.42],
    ].forEach(([toneFreq, peak, decay]) => {
      const bell = registerSource(ctx.createOscillator());
      bell.type = 'sine';
      bell.frequency.setValueAtTime(toneFreq, s);

      const bellGain = ctx.createGain();
      bellGain.gain.setValueAtTime(0.0001, s);
      bellGain.gain.exponentialRampToValueAtTime(peak, s + 0.008);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, s + decay);

      bell.connect(bellGain);
      bellGain.connect(sessionGain);
      bell.start(s);
      bell.stop(s + decay + 0.02);
    });
  });

  let stopped = false;
  let cleanupTimerId = null;

  return {
    stop() {
      if (stopped) return;
      stopped = true;
      try {
        sessionGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.015);
      } catch {
        // Ignore context state errors on teardown
      }
      cleanupTimerId = window.setTimeout(() => {
        sources.forEach((source) => {
          try {
            source.stop();
          } catch {
            // Source already finished
          }
          try {
            source.disconnect();
          } catch {
            // Ignore disconnect failures
          }
        });
        sources.length = 0;
        try {
          sessionGain.disconnect();
          compressor.disconnect();
        } catch {
          // Ignore disconnect failures
        }
        cleanupTimerId = null;
      }, 70);
    },
    get isCleanupPending() {
      return cleanupTimerId !== null;
    },
  };
}

