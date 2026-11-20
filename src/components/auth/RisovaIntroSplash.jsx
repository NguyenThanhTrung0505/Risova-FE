import { useCallback, useEffect, useRef, useState } from 'react';
import {
  isIntroAudioRunning,
  playRisovaIntroSound,
  unlockIntroAudio,
} from './risovaIntroAudio';
import './RisovaIntroSplash.css';

export default function RisovaIntroSplash({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);
  const finishedRef = useRef(false);
  const skipTimerRef = useRef(null);
  const mountTimeRef = useRef(0);
  const audioSessionRef = useRef(null);

  const stopAudio = useCallback(() => {
    if (audioSessionRef.current) {
      audioSessionRef.current.stop();
      audioSessionRef.current = null;
    }
  }, []);

  const finishIntro = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    stopAudio();
    onComplete?.();
  }, [onComplete, stopAudio]);

  const handleSkip = useCallback(
    (event) => {
      event?.stopPropagation();
      if (finishedRef.current) return;
      stopAudio();
      setIsExiting(true);
      if (skipTimerRef.current) window.clearTimeout(skipTimerRef.current);
      skipTimerRef.current = window.setTimeout(finishIntro, 320);
    },
    [finishIntro, stopAudio]
  );

  useEffect(() => {
    mountTimeRef.current = performance.now();
    let cancelled = false;

    const startSyncedAudio = () => {
      if (cancelled || finishedRef.current || audioSessionRef.current || !isIntroAudioRunning()) {
        return;
      }
      const elapsedSec = Math.max(0, (performance.now() - mountTimeRef.current) / 1000);
      audioSessionRef.current = playRisovaIntroSound({ offsetSec: elapsedSec });
    };

    const tryUnlockAndPlay = () => {
      if (cancelled || finishedRef.current || audioSessionRef.current) return;
      const ctx = unlockIntroAudio();
      if (!ctx) return;
      if (ctx.state === 'running') {
        startSyncedAudio();
      } else {
        ctx
          .resume()
          .then(() => {
            if (!cancelled && ctx.state === 'running') {
              startSyncedAudio();
            }
          })
          .catch(() => {});
      }
    };

    tryUnlockAndPlay();

    const exitTimer = window.setTimeout(() => setIsExiting(true), 5100);
    const doneTimer = window.setTimeout(finishIntro, 5650);

    const onPointerDown = (event) => {
      if (event.target?.closest?.('.risova-intro-skip')) return;
      tryUnlockAndPlay();
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleSkip();
        return;
      }
      tryUnlockAndPlay();
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      cancelled = true;
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      if (skipTimerRef.current) window.clearTimeout(skipTimerRef.current);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
      stopAudio();
    };
  }, [finishIntro, handleSkip, stopAudio]);

  return (
    <div
      className={`risova-intro-overlay${isExiting ? ' is-exiting' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Hiệu ứng mở đầu Risova"
    >
      <button
        type="button"
        className="risova-intro-skip"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={handleSkip}
      >
        Bỏ qua
      </button>

      {/* Stage 1 (0.00s -> 1.50s): Horizontal white beam traveling from left edge into bulb */}
      <div className="risova-intro-beam-wrap" aria-hidden="true">
        <div className="risova-intro-beam-absorb">
          <div className="risova-intro-beam-line" />
          <div className="risova-intro-beam-head-rail">
            <span className="risova-intro-beam-spark" />
          </div>
        </div>
      </div>

      {/* Centered Logo Anchor */}
      <div className="risova-intro-center-anchor">
        <div className="risova-intro-ambient-glow" aria-hidden="true" />

        <div className="risova-intro-logo-scaler">
          {/* Stage 2 (1.50s -> 2.75s): Vector Lightbulb + ECG Heartbeat Animation */}
          <svg
            className="risova-intro-svg"
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <filter
                id="risova-intro-glow"
                filterUnits="userSpaceOnUse"
                x="-40"
                y="-40"
                width="280"
                height="280"
              >
                <feGaussianBlur stdDeviation="3.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Subtle waiting bulb silhouette on pure black background */}
            <path
              className="risova-intro-bulb-ghost-outline"
              d="M 97.9 28.3 L 47.9 57.5 L 47.9 117.5 L 77.1 137.5 L 77.1 150.8 L 118.8 150.8 L 118.8 137.5 L 147.9 117.5 L 147.9 57.5 Z"
            />
            <rect className="risova-intro-bulb-ghost-bar" x="75" y="159" width="46" height="7.5" rx="3.75" />
            <rect className="risova-intro-bulb-ghost-bar" x="75" y="171" width="46" height="7.5" rx="3.75" />
            <rect className="risova-intro-bulb-ghost-bar" x="83.5" y="182.5" width="29" height="6.5" rx="3.25" />

            {/* Impact flash where beam pierces left bulb wall (47.9, 93.8) */}
            <circle
              className="risova-intro-impact-ring"
              cx="47.9"
              cy="93.8"
              r="11"
              filter="url(#risova-intro-glow)"
            />
            <circle
              className="risova-intro-impact-dot"
              cx="47.9"
              cy="93.8"
              r="5"
              filter="url(#risova-intro-glow)"
            />

            {/* Illuminated hexagonal bulb outline tracing upper and lower arcs */}
            <path
              className="risova-intro-bulb-arc"
              pathLength="100"
              filter="url(#risova-intro-glow)"
              d="M 47.9 93.8 L 47.9 57.5 L 97.9 28.3 L 147.9 57.5 L 147.9 93.8"
            />
            <path
              className="risova-intro-bulb-arc"
              pathLength="100"
              filter="url(#risova-intro-glow)"
              d="M 47.9 93.8 L 47.9 117.5 L 77.1 137.5 L 77.1 150.8 L 118.8 150.8 L 118.8 137.5 L 147.9 117.5 L 147.9 93.8"
            />

            {/* Screw base bars illuminating cleanly */}
            <rect className="risova-intro-base-bar risova-intro-base-bar--1" x="75" y="159" width="46" height="7.5" rx="3.75" />
            <rect className="risova-intro-base-bar risova-intro-base-bar--2" x="75" y="171" width="46" height="7.5" rx="3.75" />
            <rect className="risova-intro-base-bar risova-intro-base-bar--3" x="83.5" y="182.5" width="29" height="6.5" rx="3.25" />

            {/* Oscillating ECG heartbeat line inside the bulb */}
            <g className="risova-intro-ecg-group">
              <path
                className="risova-intro-ecg-path"
                pathLength="100"
                filter="url(#risova-intro-glow)"
                d="M 47.9 93.8 L 74.5 93.8 L 81.5 80.5 L 90.2 108.0 L 98.2 72.5 L 106.2 103.5 L 114.8 93.8 L 136.5 93.8"
              />
              <path
                className="risova-intro-ecg-spark-trace"
                pathLength="100"
                filter="url(#risova-intro-glow)"
                d="M 47.9 93.8 L 74.5 93.8 L 81.5 80.5 L 90.2 108.0 L 98.2 72.5 L 106.2 103.5 L 114.8 93.8 L 136.5 93.8"
              />
            </g>
          </svg>

          {/* Stage 3a (2.75s): Official Risova logo card reveal */}
          <div className="risova-intro-logo-badge">
            <img src="/favicon.svg" alt="Risova" width="180" height="180" />
          </div>
        </div>
      </div>

      {/* Stage 3b (3.68s -> 4.45s): Bold RISOVA wordmark appearing below shrunken logo */}
      <p className="risova-intro-wordmark" aria-label="RISOVA">
        <span>RI</span>
        <span className="is-accent">SOVA</span>
      </p>
    </div>
  );
}
