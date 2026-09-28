"use client";

import React, { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// Festival color palette matching COLORIDO '26 (Hot Pink, Orange, Yellow, Cyan, Purple, Green)
const FESTIVAL_COLORS = [
  "#E91E63", // Pink
  "#FF7A00", // Orange
  "#FFD43B", // Yellow
  "#19CFE8", // Cyan
  "#8E44FF", // Purple
  "#7ED957", // Lime Green
  "#0ea5e9", // Electric Blue
  "#f43f5e", // Rose
];

export function PerspectiveGrid({
  className,
  gridSize = 32,
  showOverlay = true,
  fadeRadius = 80,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize tiles array to prevent unnecessary re-renders
  const tiles = useMemo(() => Array.from({ length: gridSize * gridSize }), [gridSize]);

  // Handler for mouse enter: instantly light up tile with random festival color
  const handleMouseEnter = (e) => {
    const randomColor = FESTIVAL_COLORS[Math.floor(Math.random() * FESTIVAL_COLORS.length)];
    const el = e.currentTarget;
    el.style.transition = "none";
    el.style.backgroundColor = randomColor;
    el.style.borderColor = randomColor;
    el.style.boxShadow = `0 0 16px ${randomColor}99`;
    el.style.zIndex = "2";
  };

  // Handler for mouse leave: smoothly fade out over 1.6s
  const handleMouseLeave = (e) => {
    const el = e.currentTarget;
    el.style.transition = "background-color 1600ms cubic-bezier(0.4, 0, 0.2, 1), border-color 1600ms ease, box-shadow 1600ms ease";
    el.style.backgroundColor = "transparent";
    el.style.borderColor = "rgba(18, 18, 23, 0.07)";
    el.style.boxShadow = "none";
    el.style.zIndex = "1";
  };

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden bg-transparent pointer-events-auto",
        className
      )}
      style={{
        perspective: "2000px",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="absolute w-[85rem] aspect-square grid origin-center select-none"
        style={{
          left: "50%",
          top: "50%",
          transform:
            "translate(-50%, -50%) rotateX(32deg) rotateY(-5deg) rotateZ(18deg) scale(1.65)",
          transformStyle: "preserve-3d",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {/* Tiles */}
        {mounted &&
          tiles.map((_, i) => (
            <div
              key={i}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="tile min-h-[1px] min-w-[1px] border border-[#121217]/8 bg-transparent cursor-pointer"
            />
          ))}
      </div>

      {/* Radial Gradient Mask (Overlay that fades gently into fest cream background #FAF8F5) */}
      {showOverlay && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 22%, #FAF8F5 ${fadeRadius}%)`,
          }}
        />
      )}
    </div>
  );
}

export default PerspectiveGrid;
