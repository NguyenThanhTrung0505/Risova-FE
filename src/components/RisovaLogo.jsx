
export default function RisovaLogo({ size = 'md', isDarkBg = false, showTagline = true, iconOnly = false }) {
  // size: sm, md, lg
  const dimensions = {
    sm: { circle: 'w-8 h-8', icon: 'w-4 h-4', title: 'text-base', sub: 'text-[10px]' },
    md: { circle: 'w-10 h-10', icon: 'w-6 h-6', title: 'text-lg', sub: 'text-[11px]' },
    lg: { circle: 'w-16 h-16', icon: 'w-9 h-9', title: 'text-2xl', sub: 'text-xs' }
  }[size] || { circle: 'w-10 h-10', icon: 'w-6 h-6', title: 'text-lg', sub: 'text-[11px]' };

  return (
    <div className="risova-brand flex items-center gap-3" role={iconOnly ? 'img' : undefined} aria-label={iconOnly ? 'Risova' : undefined}>
      <div className={`${dimensions.circle} risova-brand-mark rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-100`}>
        <img className="risova-brand-icon" src="/favicon.svg" alt="" aria-hidden="true" width="48" height="48" />
      </div>

      {!iconOnly && <div>
        <div className={`font-bold tracking-tight leading-none ${dimensions.title} ${isDarkBg ? 'text-white' : 'text-[#112D4E]'}`}>
          Ri<span className="text-[#00AAFC]">sova</span>
        </div>
        {showTagline && (
          <div className={`font-normal mt-1 ${dimensions.sub} ${isDarkBg ? 'text-[#DBE2EF]' : 'text-slate-500'}`}>
            Enterprise CMMS
          </div>
        )}
      </div>}
    </div>
  );
}

