import { useEffect, useRef, useState } from 'react';
import {
  playLoginErrorSound,
  playLoginGreenLockSound,
  playLoginSuccessChime,
  startGearSpinSound,
} from './risovaLoginAudio';
import './LoginAuthTransition.css';

function buildInterlockingGearPath(teeth, outerR, rootR, phaseRad = 0) {
  const step = (Math.PI * 2) / teeth;
  const points = [];

  for (let i = 0; i < teeth; i++) {
    const center = phaseRad + i * step;
    const rootStart = center - step * 0.34;
    const tipStart = center - step * 0.16;
    const tipEnd = center + step * 0.16;
    const rootEnd = center + step * 0.34;

    points.push([
      rootR * Math.cos(rootStart),
      rootR * Math.sin(rootStart),
    ]);
    points.push([
      outerR * Math.cos(tipStart),
      outerR * Math.sin(tipStart),
    ]);
    points.push([
      outerR * Math.cos(tipEnd),
      outerR * Math.sin(tipEnd),
    ]);
    points.push([
      rootR * Math.cos(rootEnd),
      rootR * Math.sin(rootEnd),
    ]);
  }

  return (
    points
      .map(([x, y], idx) => `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(' ') + ' Z'
  );
}

function computeMeshedPhase(primaryCenter, followerCenter, primaryTeeth, primaryPhase, followerTeeth) {
  const theta12 = Math.atan2(
    followerCenter.cy - primaryCenter.cy,
    followerCenter.cx - primaryCenter.cx
  );
  const theta21 = theta12 + Math.PI;
  const primaryPitchAngle = (Math.PI * 2) / primaryTeeth;
  const followerPitchAngle = (Math.PI * 2) / followerTeeth;
  const u1 = (theta12 - primaryPhase) / primaryPitchAngle;
  const u2 = 0.5 - u1;
  return theta21 - u2 * followerPitchAngle;
}

const GEAR_1_SPEC = { id: 1, teeth: 12, outerR: 49.2, rootR: 39.6, cx: 90.3, cy: 124.0, phase: 0 };
const GEAR_2_SPEC = { id: 2, teeth: 10, outerR: 41.8, rootR: 32.2, cx: 157.1, cy: 75.5 };
const GEAR_3_SPEC = { id: 3, teeth: 8, outerR: 34.4, rootR: 24.8, cx: 151.1, cy: 168.2 };

const MESHED_GEARS = [
  GEAR_1_SPEC,
  {
    ...GEAR_2_SPEC,
    phase: computeMeshedPhase(GEAR_1_SPEC, GEAR_2_SPEC, 12, GEAR_1_SPEC.phase, 10),
  },
  {
    ...GEAR_3_SPEC,
    phase: computeMeshedPhase(GEAR_1_SPEC, GEAR_3_SPEC, 12, GEAR_1_SPEC.phase, 8),
  },
].map((gear) => {
  const spokeCount = gear.teeth >= 12 ? 4 : 3;
  const innerR = gear.rootR * 0.72;
  const hubR = gear.rootR * 0.34;
  const pinR = Math.max(3, gear.rootR * 0.12);
  const spokes = Array.from({ length: spokeCount }, (_, idx) => {
    const angle = gear.phase + (idx * Math.PI * 2) / spokeCount;
    return {
      x1: (hubR * Math.cos(angle)).toFixed(2),
      y1: (hubR * Math.sin(angle)).toFixed(2),
      x2: (innerR * Math.cos(angle)).toFixed(2),
      y2: (innerR * Math.sin(angle)).toFixed(2),
    };
  });

  return {
    ...gear,
    innerR,
    hubR,
    pinR,
    spokes,
    path: buildInterlockingGearPath(gear.teeth, gear.outerR, gear.rootR, gear.phase),
  };
});

export default function LoginAuthTransition({
  outcome,
  userName,
  errorMessage,
  onComplete,
}) {
  const [phase, setPhase] = useState('spinning');
  const [isExiting, setIsExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timers = [];
    const spinAudio = startGearSpinSound();

    timers.push(window.setTimeout(() => setPhase('spinning-sync'), 1000));

    if (outcome === 'error') {
      timers.push(
        window.setTimeout(() => {
          spinAudio.stop();
          playLoginErrorSound();
          setPhase('error');
        }, 2000)
      );
      timers.push(window.setTimeout(() => setIsExiting(true), 3000));
      timers.push(window.setTimeout(() => onCompleteRef.current?.(), 3340));
    } else {
      timers.push(
        window.setTimeout(() => {
          spinAudio.stop();
          playLoginGreenLockSound();
          setPhase('gears-green');
        }, 2000)
      );
      timers.push(
        window.setTimeout(() => {
          playLoginSuccessChime();
          setPhase('checkmark');
        }, 2550)
      );
      timers.push(window.setTimeout(() => setIsExiting(true), 3650));
      timers.push(window.setTimeout(() => onCompleteRef.current?.(), 4030));
    }

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      spinAudio.stop();
    };
  }, [outcome]);

  const copyByPhase = {
    spinning: {
      title: 'Đang xác thực hệ thống',
      subtitle: 'Đang kiểm tra thông tin tài khoản Risova...',
    },
    'spinning-sync': {
      title: 'Đang xác thực hệ thống',
      subtitle: 'Đang đồng bộ quyền truy cập...',
    },
    error: {
      title: 'Đăng nhập thất bại',
      subtitle: errorMessage || 'Email hoặc mật khẩu không chính xác.',
    },
    'gears-green': {
      title: 'Xác thực hợp lệ',
      subtitle: 'Đang mở không gian làm việc Risova...',
    },
    checkmark: {
      title: 'Đăng nhập thành công',
      subtitle: userName ? `Chào mừng trở lại, ${userName}` : 'Chào mừng trở lại Risova',
    },
  }[phase];

  const overlayStateClass =
    phase === 'error'
      ? ' is-error'
      : phase === 'gears-green'
        ? ' is-gears-green'
        : phase === 'checkmark'
          ? ' is-checkmark'
          : '';

  return (
    <div
      className={`risova-login-tx-overlay${overlayStateClass}${isExiting ? ' is-exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={copyByPhase.title}
    >
      <div className="risova-login-tx-portal">
        <svg
          className="risova-tx-gears-svg"
          viewBox="20 18 200 200"
          fill="none"
          aria-hidden="true"
        >
          {MESHED_GEARS.map((gear) => (
            <g key={gear.id} transform={`translate(${gear.cx}, ${gear.cy})`}>
              <g className={`risova-tx-gear-spin risova-tx-gear-spin--${gear.id}`}>
                <circle cx="0" cy="0" r={gear.outerR + 1} fill="transparent" />
                <path className="risova-tx-gear-body" d={gear.path} />
                <circle className="risova-tx-gear-ring" cx="0" cy="0" r={gear.innerR} />
                {gear.spokes.map((spoke, idx) => (
                  <line
                    key={idx}
                    className="risova-tx-gear-spoke"
                    x1={spoke.x1}
                    y1={spoke.y1}
                    x2={spoke.x2}
                    y2={spoke.y2}
                  />
                ))}
                <circle className="risova-tx-gear-hub" cx="0" cy="0" r={gear.hubR} />
                <circle className="risova-tx-gear-pin" cx="0" cy="0" r={gear.pinR} />
              </g>
            </g>
          ))}
        </svg>

        {phase === 'checkmark' && (
          <div className="risova-tx-check-wrap" aria-hidden="true">
            <span className="risova-tx-check-ripple" />
            <span className="risova-tx-spark risova-tx-spark--1" />
            <span className="risova-tx-spark risova-tx-spark--2" />
            <span className="risova-tx-spark risova-tx-spark--3" />
            <span className="risova-tx-spark risova-tx-spark--4" />
            <span className="risova-tx-spark risova-tx-spark--5" />
            <span className="risova-tx-spark risova-tx-spark--6" />
            <div className="risova-tx-check-circle">
              <svg className="risova-tx-check-svg" viewBox="0 0 64 64" fill="none">
                <path
                  className="risova-tx-check-path"
                  pathLength="100"
                  d="M 16 33 L 28 45 L 49 21"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div key={phase === 'spinning' ? 'spinning' : phase} className="risova-login-tx-copy">
        <h2>{copyByPhase.title}</h2>
        <p>{copyByPhase.subtitle}</p>
      </div>
    </div>
  );
}
