import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Ticket, User, LogOut, X, ShieldCheck, Camera, QrCode } from 'lucide-react';

const PROFILE_MORPH_STYLES = `
:root {
  --profile-open-dur: 350ms;
  --profile-close-dur: 250ms;
  --profile-ease: cubic-bezier(0.34, 1.25, 0.64, 1);
  --profile-close-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --profile-r-closed: 9999px;
  --profile-r-open: 20px;
  --profile-fade-dur: 200ms;
  --profile-slide: 30px;
  --profile-scale: 0.96;
  --profile-blur: 2px;
}

/* Closed state: pill shape. Open state: expanded rounded card */
.profile-morph {
  position: relative;
  width: 140px;
  height: 42px;
  border-radius: var(--profile-r-closed);
  overflow: hidden;
  box-sizing: border-box;
  background: #ffffff;
  border: 2px solid #121217;
  box-shadow: 2px 2px 0px #121217;
  transition:
    width var(--profile-close-dur) var(--profile-close-ease),
    height var(--profile-close-dur) var(--profile-close-ease),
    border-radius var(--profile-close-dur) var(--profile-close-ease),
    box-shadow var(--profile-close-dur) var(--profile-close-ease);
}

.profile-morph[data-open="true"] {
  width: 240px;
  height: 240px;
  border-radius: var(--profile-r-open);
  box-shadow: 5px 5px 0px #121217;
  transition:
    width var(--profile-open-dur) var(--profile-ease),
    height var(--profile-open-dur) var(--profile-ease),
    border-radius var(--profile-open-dur) var(--profile-ease),
    box-shadow var(--profile-open-dur) var(--profile-ease);
}

/* Trigger pill content: fades, slides left, blurs when open */
.profile-morph-trigger {
  position: absolute;
  inset: 0;
  width: 140px;
  height: 42px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: transparent;
  border: 0;
  cursor: pointer;
  z-index: 2;
  transition:
    opacity var(--profile-fade-dur) var(--profile-close-ease),
    transform var(--profile-open-dur) var(--profile-close-ease),
    filter var(--profile-fade-dur) var(--profile-close-ease);
}

.profile-morph[data-open="true"] .profile-morph-trigger {
  opacity: 0;
  transform: translateX(calc(-1 * var(--profile-slide)));
  filter: blur(var(--profile-blur));
  pointer-events: none;
}

/* Menu contents: slid right + scaled + blurred; reveals on open */
.profile-morph-content {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: translateX(var(--profile-slide)) scale(var(--profile-scale));
  filter: blur(var(--profile-blur));
  pointer-events: none;
  overflow: hidden;
  z-index: 3;
  display: flex;
  flex-direction: column;
  transition:
    opacity var(--profile-fade-dur) var(--profile-close-ease),
    transform var(--profile-open-dur) var(--profile-close-ease),
    filter var(--profile-fade-dur) var(--profile-close-ease);
}

.profile-morph[data-open="true"] .profile-morph-content {
  opacity: 1;
  transform: translateX(0) scale(1);
  filter: blur(0);
  pointer-events: auto;
}

@media (prefers-reduced-motion: reduce) {
  .profile-morph, .profile-morph-trigger, .profile-morph-content {
    transition: none !important;
  }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('transitions-profile-morph')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'transitions-profile-morph';
  styleEl.textContent = PROFILE_MORPH_STYLES;
  document.head.appendChild(styleEl);
}

export default function ProfileMorphMenu({ user, isAdmin, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
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

  return (
    // Outer slot maintains position in the flexbox without causing layout shift
    <div className="relative w-[140px] h-[42px]" style={{ zIndex: open ? 50 : 10 }}>
      <div className="absolute right-0 top-0 origin-top-right">
        <div
          ref={ref}
          className="profile-morph"
          data-open={open ? 'true' : 'false'}
        >
          {/* 1. Closed Pill Button */}
          <button
            type="button"
            className="profile-morph-trigger"
            aria-expanded={open ? 'true' : 'false'}
            aria-label="User profile menu"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 ${
                user?.role === 'admin'
                  ? 'bg-[#8E44FF]'
                  : user?.role === 'volunteer'
                  ? 'bg-[#19CFE8] text-[#121217]'
                  : 'bg-[#E91E63]'
              }`}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="font-bold text-sm text-[#121217] max-w-[70px] truncate">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />
          </button>

          {/* 2. Expanded Morphing Menu Content */}
          <div className="profile-morph-content p-3.5 flex flex-col justify-between h-full bg-white">
            {/* Header with Close X */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-2">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-stone-500 font-black uppercase tracking-wider block">
                  {user?.role === 'admin'
                    ? 'Admin Access'
                    : user?.role === 'volunteer'
                    ? 'Volunteer Access'
                    : 'Student Account'}
                </span>
                <p className="font-bold text-xs text-[#121217] truncate">{user?.name}</p>
                <p className="text-[10px] text-stone-400 truncate">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="p-1 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Links */}
            <div className="py-1.5 space-y-1">
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#8E44FF]" />
                  Admin Console
                </Link>
              )}

              {user?.role === 'volunteer' && (
                <Link
                  to="/volunteer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#8E44FF]" />
                  Volunteer Portal
                </Link>
              )}

              {(user?.role === 'admin' || user?.role === 'volunteer') && (
                <Link
                  to="/scanner"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  <Camera className="w-4 h-4 text-[#7ED957]" />
                  Live Gate Scanner
                </Link>
              )}

              {user?.role !== 'admin' && (
                <Link
                  to="/my-festival"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  <Ticket className="w-4 h-4 text-[#E91E63]" />
                  My Festival &amp; Pass
                </Link>
              )}

              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-stone-500" />
                My Profile
              </Link>
            </div>

            {/* Sign Out Button */}
            <div className="pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                  navigate('/');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
