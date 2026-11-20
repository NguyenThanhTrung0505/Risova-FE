import { useEffect, useState } from 'react';
import { getSharedAudioContext, unlockIntroAudio } from './auth/risovaIntroAudio';
import './SidebarThemeBulb.css';

const LAMP_RAYS = [162, 186, 220, 252, 288, 320, 354, 18].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  const cx = 32;
  const cy = 25;
  const rInner = 20.5;
  const rOuter = 26;
  return {
    x1: (cx + rInner * Math.cos(rad)).toFixed(2),
    y1: (cy + rInner * Math.sin(rad)).toFixed(2),
    x2: (cx + rOuter * Math.cos(rad)).toFixed(2),
    y2: (cy + rOuter * Math.sin(rad)).toFixed(2),
  };
});

function scheduleLampTone(ctx, turningOn) {
  try {
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.65, now);
    master.connect(ctx.destination);

    // Subtle mechanical lamp switch click
    const click = ctx.createOscillator();
    click.type = 'triangle';
    click.frequency.setValueAtTime(turningOn ? 1850 : 1280, now);
    click.frequency.exponentialRampToValueAtTime(turningOn ? 920 : 480, now + 0.022);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.0001, now);
    clickGain.gain.exponentialRampToValueAtTime(0.11, now + 0.003);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    click.connect(clickGain);
    clickGain.connect(master);
    click.start(now);
    click.stop(now + 0.035);

    // Delicate warm glass ping when turning ON
    if (turningOn) {
      const ping = ctx.createOscillator();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(1046.5, now + 0.015);

      const pingGain = ctx.createGain();
      pingGain.gain.setValueAtTime(0.0001, now + 0.015);
      pingGain.gain.exponentialRampToValueAtTime(0.055, now + 0.024);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.21);

      ping.connect(pingGain);
      pingGain.connect(master);
      ping.start(now + 0.015);
      ping.stop(now + 0.24);
    }
  } catch {
    // Ignore audio playback errors
  }
}

function playLampSwitchSound(turningOn) {
  const ctx = unlockIntroAudio() || getSharedAudioContext();
  if (!ctx) return;
  if (ctx.state === 'running') {
    scheduleLampTone(ctx, turningOn);
  } else if (ctx.state === 'suspended') {
    ctx
      .resume()
      .then(() => {
        if (ctx.state === 'running') {
          scheduleLampTone(ctx, turningOn);
        }
      })
      .catch(() => {});
  }
}

export default function SidebarThemeBulb({ isDark, onToggle }) {
  const [wave, setWave] = useState(null);
  const [waveSeq, setWaveSeq] = useState(0);
  const isLit = !isDark;

  useEffect(() => {
    if (!wave) return undefined;
    const timer = window.setTimeout(() => setWave(null), 740);
    return () => window.clearTimeout(timer);
  }, [wave]);

  const handleClick = () => {
    const turningOn = isDark;
    playLampSwitchSound(turningOn);
    const nextId = waveSeq + 1;
    setWaveSeq(nextId);
    setWave({ id: nextId, mode: turningOn ? 'lighting' : 'dimming' });
    onToggle();
  };

  return (
    <>
      <div className="risova-sidebar-lamp-slot">
        <button
          type="button"
          className={`risova-lamp-switch ${isLit ? 'is-on' : 'is-off'}${wave?.mode === 'lighting' ? ' is-bursting' : ''}`}
          onClick={handleClick}
          aria-pressed={isLit}
          aria-label={isDark ? 'Bật đèn để chuyển sang nền sáng' : 'Tắt đèn để chuyển sang nền tối'}
          title={isDark ? 'Bật đèn (nền trắng sáng)' : 'Tắt đèn (nền tối)'}
        >
          <span className="risova-lamp-icon-wrap" aria-hidden="true">
            <span className="risova-lamp-aura" />
            {wave?.mode === 'lighting' && (
              <span key={`ring-${wave.id}`} className="risova-lamp-flash-ring" />
            )}

            <svg className="risova-lamp-svg" viewBox="0 0 64 64" fill="none">
              <defs>
                <radialGradient id="risova-sidebar-bulb-lit-grad" cx="50%" cy="42%" r="55%">
                  <stop offset="0%" stopColor="#fef9c3" />
                  <stop offset="48%" stopColor="#fde047" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </radialGradient>
              </defs>

              <g className="risova-lamp-rays">
                {LAMP_RAYS.map((ray, idx) => (
                  <line key={idx} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} />
                ))}
              </g>

              <path
                className="risova-lamp-glass"
                fill={isLit ? 'url(#risova-sidebar-bulb-lit-grad)' : 'rgba(148, 163, 184, 0.14)'}
                d="M 32 10 C 22.6 10 16 16.6 16 25 C 16 30.8 19.3 34.9 22 38.2 C 23.2 39.7 23.8 41.3 24 43 L 40 43 C 40.2 41.3 40.8 39.7 42 38.2 C 44.7 34.9 48 30.8 48 25 C 48 16.6 41.4 10 32 10 Z"
              />

              <path
                className="risova-lamp-filament"
                d="M 27.5 41 L 27.5 29.5 L 30 27 L 32 29.5 L 34 27 L 36.5 29.5 L 36.5 41"
              />

              <path
                className="risova-lamp-gloss"
                d="M 21 24 C 21 18.8 24.8 14.8 29.8 14.2"
              />

              <rect className="risova-lamp-base" x="24" y="45" width="16" height="3.2" rx="1.6" />
              <rect className="risova-lamp-base" x="25" y="49.5" width="14" height="3.2" rx="1.6" />
              <path
                className="risova-lamp-base"
                d="M 27.5 54 L 36.5 54 C 36 56.2 34.2 57.5 32 57.5 C 29.8 57.5 28 56.2 27.5 54 Z"
              />
            </svg>
          </span>

          <span className="risova-lamp-copy">
            <strong>{isLit ? 'Chế độ sáng' : 'Chế độ tối'}</strong>
            <small>{isLit ? 'Đang bật đèn · Nhấn để tắt' : 'Đang tắt đèn · Nhấn để bật'}</small>
          </span>

          <span className="risova-lamp-dot" aria-hidden="true" />
        </button>
      </div>

      {wave && (
        <div
          key={wave.id}
          className={`risova-theme-wave is-${wave.mode}`}
          aria-hidden="true"
        />
      )}
    </>
  );
}
