import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * MorphSelect Component
 * Neo-brutalist styled select dropdown with floating options list and smooth interactions
 * 
 * @param {Array<{value: string, label: string, icon?: React.ReactNode}>} options
 * @param {string} value
 * @param {Function} onChange
 * @param {string} placeholder
 * @param {string} className
 * @param {boolean} disabled
 */
export function MorphSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
}) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value) || (value ? { label: value, value } : null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className={`relative w-full select-none ${open ? 'z-40' : 'z-10'} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full h-[42px] px-3.5 bg-stone-50 hover:bg-white border-2 border-[#121217] rounded-xl text-sm font-semibold flex items-center justify-between text-left transition-all cursor-pointer ${
          open ? 'bg-white ring-2 ring-[#8E44FF]/25 border-[#8E44FF] fest-shadow-sm' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={`truncate flex items-center gap-1.5 ${selectedOption ? 'text-[#121217] font-bold' : 'text-stone-400'}`}>
          {selectedOption ? (
            <>
              {selectedOption.icon}
              {selectedOption.label}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-stone-500 shrink-0 ml-2 transition-transform duration-200 ${
            open ? 'rotate-180 text-[#8E44FF]' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-white border-2 border-[#121217] rounded-xl fest-shadow-lg overflow-hidden py-1.5 animate-in fade-in-0 zoom-in-95 duration-100 max-h-56 overflow-y-auto custom-scrollbar"
        >
          <div className="px-3 py-1 flex items-center justify-between border-b border-stone-100 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
              {placeholder}
            </span>
            <span className="text-[9px] text-stone-400 font-bold uppercase">ESC to close</span>
          </div>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm font-bold transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#121217] text-white'
                    : 'text-stone-700 hover:bg-purple-50 hover:text-[#8E44FF]'
                }`}
              >
                <span className="truncate flex items-center gap-2">
                  {opt.icon}
                  {opt.label}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#FFD43B] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MorphSelect;
