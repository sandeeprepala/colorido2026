import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * MorphSelect Component
 * Elegant morphing dropdown selector using the Transitions.dev spring curve
 * 
 * @param {Array<{value: string, label: string, icon?: React.ReactNode}>} options
 * @param {string} value
 * @param {Function} onChange
 * @param {string} placeholder
 */
export function MorphSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  width = 220,
  maxHeight = 240,
  className = "",
}) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value) || {
    label: placeholder,
    value: '',
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const targetHeight = Math.min(maxHeight, 44 + options.length * 38);

  const styleObj = {
    '--morph-target-w': typeof width === 'number' ? `${width}px` : width,
    '--morph-target-h': `${targetHeight}px`,
    '--morph-closed-w': '100%',
    '--morph-closed-h': '42px',
  };

  return (
    <div
      ref={ref}
      className={`t-morph relative border-2 border-[#121217] bg-white fest-shadow-sm select-none ${className} ${
        open ? 'z-50 fest-shadow-lg' : 'hover:bg-stone-50'
      }`}
      data-open={open ? 'true' : 'false'}
      style={styleObj}
    >
      {/* Expanded Options Menu */}
      <div className="t-morph-menu flex flex-col p-2 bg-white">
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-stone-200 mb-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-stone-500">
            {placeholder}
          </span>
          <span className="text-[10px] text-stone-400 font-bold">ESC to close</span>
        </div>
        <div className="overflow-y-auto space-y-1 flex-1 pr-1 custom-scrollbar">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all text-left ${
                  isSelected
                    ? 'bg-[#121217] text-white'
                    : 'text-stone-800 hover:bg-stone-100 hover:translate-x-0.5'
                }`}
              >
                <span className="truncate flex items-center gap-1.5">
                  {opt.icon}
                  {opt.label}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#FFD43B]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Closed State Trigger Button */}
      <button
        type="button"
        className="t-morph-plus w-full h-full px-3 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-800"
        aria-expanded={open ? 'true' : 'false'}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <span className="truncate flex items-center gap-1.5 pr-2">
          {selectedOption.icon}
          {selectedOption.label}
        </span>
        <div className="t-morph-icon flex-shrink-0 text-stone-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}

export default MorphSelect;
