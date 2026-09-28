import React, { useEffect, useState, useMemo, useRef } from 'react';

/**
 * PerspectiveGrid — Interactive 3D Perspective Grid Component for Hero Section
 * 
 * Features:
 * - 3D rotated perspective matrix with interactive tile hover trails
 * - Vivid COLORIDO festival color glows (pink, orange, cyan, purple, yellow, green)
 * - Dynamic mouse parallax tilt (reacts organically to mouse movement)
 * - Seamless radial fade overlay tailored to festival canvas background (#FAF8F5)
 */
export function PerspectiveGrid({
  className = '',
  gridSize = 32,
  showOverlay = true,
  fadeRadius = 78,
}) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener('mousemove', handleMouseMove, { passive: true });
    }
    return () => {
      if (node) {
        node.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Festival palette for interactive hover glow
  const colorThemes = [
    'hover:bg-[#E91E63]/30 hover:border-[#E91E63] hover:shadow-[0_0_15px_#E91E63]',
    'hover:bg-[#8E44FF]/30 hover:border-[#8E44FF] hover:shadow-[0_0_15px_#8E44FF]',
    'hover:bg-[#19CFE8]/30 hover:border-[#19CFE8] hover:shadow-[0_0_15px_#19CFE8]',
    'hover:bg-[#FF7A00]/30 hover:border-[#FF7A00] hover:shadow-[0_0_15px_#FF7A00]',
    'hover:bg-[#FFD43B]/35 hover:border-[#FFD43B] hover:shadow-[0_0_15px_#FFD43B]',
    'hover:bg-[#16A34A]/30 hover:border-[#16A34A] hover:shadow-[0_0_15px_#16A34A]',
  ];

  // Memoize tiles array with assigned festival color styles to avoid re-renders
  const tiles = useMemo(() => {
    return Array.from({ length: gridSize * gridSize }, (_, i) => ({
      id: i,
      colorClass: colorThemes[(i + Math.floor(i / gridSize)) % colorThemes.length],
    }));
  }, [gridSize]);

  // Dynamic subtle 3D parallax tilt based on mouse position
  const tiltX = 35 + mousePos.y * 10;
  const tiltY = -8 + mousePos.x * 10;
  const tiltZ = 18 - mousePos.x * 5;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-auto ${className}`}
      style={{
        perspective: '1800px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 3D Rotated Perspective Floor Grid */}
      <div
        className="absolute w-[80rem] aspect-square grid origin-center transition-transform duration-300 ease-out will-change-transform"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${tiltZ}deg) scale(1.65)`,
          transformStyle: 'preserve-3d',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {/* Interactive Tiles */}
        {mounted &&
          tiles.map((tile) => (
            <div
              key={tile.id}
              className={`tile min-h-[1px] min-w-[1px] border border-stone-300/50 bg-transparent transition-all duration-[1400ms] hover:duration-0 cursor-crosshair ${tile.colorClass}`}
            />
          ))}
      </div>

      {/* Radial Gradient Mask (fading seamlessly into festival background #FAF8F5) */}
      {showOverlay && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(ellipse at 50% 45%, transparent 22%, #FAF8F5 ${fadeRadius}%)`,
          }}
        />
      )}
    </div>
  );
}

export default PerspectiveGrid;
