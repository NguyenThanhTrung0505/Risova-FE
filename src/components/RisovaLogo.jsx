import React from 'react';

export default function RisovaLogo({ size = 'md', isDarkBg = false, showTagline = true }) {
  // size: sm, md, lg
  const dimensions = {
    sm: { circle: 'w-8 h-8', icon: 'w-4 h-4', title: 'text-base', sub: 'text-[10px]' },
    md: { circle: 'w-10 h-10', icon: 'w-6 h-6', title: 'text-lg', sub: 'text-[11px]' },
    lg: { circle: 'w-16 h-16', icon: 'w-9 h-9', title: 'text-2xl', sub: 'text-xs' }
  }[size] || { circle: 'w-10 h-10', icon: 'w-6 h-6', title: 'text-lg', sub: 'text-[11px]' };

  return (
    <div className="flex items-center gap-3">
      {/* Circle Icon Badge */}
      <div className={`${dimensions.circle} rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 border border-slate-100`}>
        <svg
          className={`${dimensions.icon} text-[#3F72AF]`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Lightbulb outline */}
          <path d="M9 18h6" />
          <path d="M10 21h4" />
          <path d="M12 2a6 6 0 0 0-6 6c0 2.2 1.2 4.1 3 5.1V16a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.9c1.8-1 3-2.9 3-5.1a6 6 0 0 0-6-6z" stroke="#3F72AF" />
          {/* Heartbeat pulse inside lightbulb */}
          <path d="M8.5 8h1.8l1.2-2.5 1.5 5 1.2-2.5h1.3" stroke="#0284C7" strokeWidth="2" />
        </svg>
      </div>

      <div>
        <div className={`font-bold tracking-tight leading-none ${dimensions.title} ${isDarkBg ? 'text-white' : 'text-[#112D4E]'}`}>
          Ris<span className="text-[#3F72AF]">ova</span>
        </div>
        {showTagline && (
          <div className={`font-medium tracking-wider uppercase mt-0.5 ${dimensions.sub} ${isDarkBg ? 'text-[#7F96B0]' : 'text-slate-500'}`}>
            Enterprise CMMS
          </div>
        )}
      </div>
    </div>
  );
}

