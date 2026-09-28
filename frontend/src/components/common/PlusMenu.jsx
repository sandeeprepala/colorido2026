// Transitions.dev — Plus to menu morph (React, self-contained)
// Drop into any React project — no extra CSS file needed.

import React, { useEffect, useRef, useState } from "react";

// ── Styles ──────────────────────────────────────────────
// Auto-injected on first import. Idempotent (guarded by
// the element id) and SSR-safe (no-ops without document).
const __TRANSITION_STYLES = `
:root {
  --morph-open-dur: 350ms;
  --morph-close-dur: 250ms;
  --morph-ease: cubic-bezier(0.34, 1.25, 0.64, 1);
  --morph-close-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --morph-r-closed: 40px;
  --morph-r-open: 20px;
  --morph-fade-dur: 200ms;
  --morph-slide: 40px;
  --morph-rotate: 45deg;
  --morph-scale: 0.97;
  --morph-blur: 2px;
}

/* Closed: a small circular button. Open: a rounded panel.
   Width/height/border-radius animate; the open state uses a
   bouncier ease than the close. */
.t-morph {
  position: relative;
  width: var(--morph-closed-w, 40px);
  height: var(--morph-closed-h, 40px);
  border-radius: var(--morph-r-closed);
  overflow: hidden;
  box-sizing: border-box;
  transition:
    width var(--morph-close-dur) var(--morph-close-ease),
    height var(--morph-close-dur) var(--morph-close-ease),
    border-radius var(--morph-close-dur) var(--morph-close-ease),
    box-shadow var(--morph-close-dur) var(--morph-close-ease);
}
.t-morph[data-open="true"] {
  width: var(--morph-target-w, 183px);
  height: var(--morph-target-h, 172px);
  border-radius: var(--morph-r-open);
  transition:
    width var(--morph-open-dur) var(--morph-ease),
    height var(--morph-open-dur) var(--morph-ease),
    border-radius var(--morph-open-dur) var(--morph-ease),
    box-shadow var(--morph-open-dur) var(--morph-ease);
}

/* Plus fades + slides out and the icon rotates into an ×. */
.t-morph-plus {
  position: absolute;
  inset: auto 0 0 auto;
  width: var(--morph-closed-w, 40px);
  height: var(--morph-closed-h, 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  cursor: pointer;
  z-index: 2;
  transition:
    opacity var(--morph-fade-dur) var(--morph-close-ease),
    transform var(--morph-open-dur) var(--morph-close-ease),
    filter var(--morph-fade-dur) var(--morph-close-ease);
}
.t-morph-plus svg, .t-morph-plus .t-morph-icon {
  transition: transform var(--morph-open-dur) var(--morph-close-ease);
}
.t-morph[data-open="true"] .t-morph-plus {
  opacity: 0;
  transform: translateX(calc(-1 * var(--morph-slide)));
  filter: blur(var(--morph-blur));
  pointer-events: none;
}
.t-morph[data-open="true"] .t-morph-plus svg,
.t-morph[data-open="true"] .t-morph-plus .t-morph-icon {
  transform: scale(var(--morph-scale)) rotate(var(--morph-rotate));
}

/* Menu starts slid in + scaled + blurred; reveals on open. */
.t-morph-menu {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: translateX(var(--morph-slide)) scale(var(--morph-scale));
  filter: blur(var(--morph-blur));
  pointer-events: none;
  overflow: auto;
  z-index: 1;
  transition:
    opacity var(--morph-fade-dur) var(--morph-close-ease),
    transform var(--morph-open-dur) var(--morph-close-ease),
    filter var(--morph-fade-dur) var(--morph-close-ease);
}
.t-morph[data-open="true"] .t-morph-menu {
  opacity: 1;
  transform: translateX(0) scale(1);
  filter: blur(0);
  pointer-events: auto;
}

@media (prefers-reduced-motion: reduce) {
  .t-morph, .t-morph-plus, .t-morph-menu { transition: none !important; }
}
`;

if (typeof document !== "undefined" && !document.getElementById("transitions-p20")) {
  const __style = document.createElement("style");
  __style.id = "transitions-p20";
  __style.textContent = __TRANSITION_STYLES;
  document.head.appendChild(__style);
}

/**
 * PlusMenu Component
 * Self-contained plus-to-menu morph from Transitions.dev
 * Enhanced with responsive props, custom sizes, anchor alignment, and festival theme styling
 */
export function PlusMenu({
  children,
  width = 200,
  height = 200,
  closedWidth = 40,
  closedHeight = 40,
  align = "right", // "right" | "left" | "none"
  className = "",
  buttonClassName = "",
  triggerContent = null,
  isOpen = null,
  onOpenChange = null,
  title = "Open menu",
}) {
  const ref = useRef(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== null ? isOpen : internalOpen;

  const setOpen = (val) => {
    const nextVal = typeof val === "function" ? val(open) : val;
    if (onOpenChange) onOpenChange(nextVal);
    else setInternalOpen(nextVal);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Style overrides for dynamic morph targets
  const styleObj = {
    "--morph-target-w": typeof width === "number" ? `${width}px` : width,
    "--morph-target-h": typeof height === "number" ? `${height}px` : height,
    "--morph-closed-w": typeof closedWidth === "number" ? `${closedWidth}px` : closedWidth,
    "--morph-closed-h": typeof closedHeight === "number" ? `${closedHeight}px` : closedHeight,
  };

  const morphElement = (
    <div
      ref={ref}
      className={`t-morph border-2 border-[#121217] bg-white ${
        open ? "z-50 fest-shadow-xl" : "fest-shadow-sm hover:fest-shadow"
      } ${className}`}
      data-open={open ? "true" : "false"}
      style={styleObj}
    >
      <div className="t-morph-menu" role="menu">
        {typeof children === "function" ? children({ close: () => setOpen(false) }) : children}
      </div>
      <button
        type="button"
        className={`t-morph-plus ${buttonClassName}`}
        aria-expanded={open ? "true" : "false"}
        aria-label={title}
        title={title}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {triggerContent || (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4V16M4 10H16"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </div>
  );

  // If align is right or left, wrap in a fixed-size anchor slot so the navbar flex flow doesn't shift
  if (align === "right" || align === "left") {
    return (
      <div
        className="relative"
        style={{
          width: typeof closedWidth === "number" ? `${closedWidth}px` : closedWidth,
          height: typeof closedHeight === "number" ? `${closedHeight}px` : closedHeight,
          zIndex: open ? 50 : 10,
        }}
      >
        <div
          className={`absolute top-0 ${
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          }`}
        >
          {morphElement}
        </div>
      </div>
    );
  }

  return morphElement;
}

export default PlusMenu;
