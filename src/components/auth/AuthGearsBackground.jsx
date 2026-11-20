import { useEffect, useState } from 'react';
import ElectricLogo from '../ElectricLogo';
import { AUTH_GEAR_CLUSTERS } from './BlueprintGearSvgs';

export default function AuthGearsBackground() {
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)').matches
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const media = window.matchMedia('(max-width: 767px)');
    const onChange = (event) => setIsCompact(event.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  return (
    <div className="risova-auth-backdrop" aria-hidden="true">
      {/* Blueprint technical dot grid and drafting guide lines */}
      <div className="risova-auth-blueprint-grid" />
      <svg
        className="risova-auth-blueprint-lines"
        viewBox="0 0 1440 1024"
        preserveAspectRatio="none"
        fill="none"
      >
        <line x1="0" y1="34" x2="1440" y2="34" stroke="#9ec5e8" strokeOpacity="0.22" strokeWidth="1" />
        <line x1="0" y1="48" x2="1440" y2="48" stroke="#9ec5e8" strokeOpacity="0.34" strokeWidth="1.2" />
        <line x1="0" y1="974" x2="1440" y2="974" stroke="#9ec5e8" strokeOpacity="0.26" strokeWidth="1" />
        <line x1="0" y1="988" x2="1440" y2="988" stroke="#9ec5e8" strokeOpacity="0.38" strokeWidth="1.2" />
        <polyline points="0,196 154,196 154,606" stroke="#9ec5e8" strokeOpacity="0.2" strokeWidth="1" />
        <polyline points="0,606 484,606 484,1024" stroke="#9ec5e8" strokeOpacity="0.2" strokeWidth="1" />
        <polyline points="1440,196 1286,196 1286,606" stroke="#9ec5e8" strokeOpacity="0.2" strokeWidth="1" />
        <polyline points="1440,606 956,606 956,1024" stroke="#9ec5e8" strokeOpacity="0.2" strokeWidth="1" />
      </svg>

      {/* Upper-left & upper-right side gear assemblies (hidden on compact mobile screens) */}
      {!isCompact && (
        <>
          <ElectricLogo
            src={AUTH_GEAR_CLUSTERS.leftUpper}
            className="risova-auth-gear risova-auth-gear--left-upper"
            color="#96d7ff"
            glowColor="#4aa3e8"
            speed={0.36}
            intensity={0.66}
            sparkFrequency={0.3}
            chaos={0.22}
            phaseOffset={0.4}
          />
          <ElectricLogo
            src={AUTH_GEAR_CLUSTERS.rightUpper}
            className="risova-auth-gear risova-auth-gear--right-upper"
            color="#96d7ff"
            glowColor="#4aa3e8"
            speed={0.38}
            intensity={0.66}
            sparkFrequency={0.3}
            chaos={0.22}
            phaseOffset={3.1}
          />
        </>
      )}

      {/* Bottom-left & bottom-right corner/edge gear assemblies */}
      <ElectricLogo
        src={AUTH_GEAR_CLUSTERS.leftBottom}
        className="risova-auth-gear risova-auth-gear--left-bottom"
        color="#96d7ff"
        glowColor="#4aa3e8"
        speed={0.34}
        intensity={0.7}
        sparkFrequency={0.32}
        chaos={0.24}
        phaseOffset={1.7}
      />
      <ElectricLogo
        src={AUTH_GEAR_CLUSTERS.rightBottom}
        className="risova-auth-gear risova-auth-gear--right-bottom"
        color="#96d7ff"
        glowColor="#4aa3e8"
        speed={0.35}
        intensity={0.7}
        sparkFrequency={0.32}
        chaos={0.24}
        phaseOffset={4.6}
      />
    </div>
  );
}
