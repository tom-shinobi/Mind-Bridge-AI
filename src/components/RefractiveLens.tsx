import React, { useState, useRef } from 'react';

interface RefractiveLensProps {
  children?: React.ReactNode;
  size?: number;
  className?: string;
  label?: string;
  badge?: string;
  onClick?: () => void;
}

export const RefractiveLens: React.FC<RefractiveLensProps> = ({
  children,
  size = 180,
  className = '',
  label,
  badge,
  onClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 25, y: 25 });
  const [isHovered, setIsHovered] = useState(false);

  const updateInteraction = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Calculate normalized -1 to +1
    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;

    // Subtle 3D tilt
    setRotateY(normX * 14);
    setRotateX(-normY * 14);

    // Shift glare point towards pointer position
    setGlarePos({
      x: 20 + (x / rect.width) * 25,
      y: 18 + (y / rect.height) * 25
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateInteraction(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsHovered(true);
    if (e.touches.length > 0) {
      updateInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      updateInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    handleMouseLeave();
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 25, y: 25 });
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center cursor-pointer select-none group touch-press ${className}`}
      style={{ perspective: 1000 }}
    >
      {/* 3D Tilting Liquid Glass Lens Sphere */}
      <div
        className="liquid-glass-lens flex items-center justify-center relative transition-transform duration-200 ease-out"
        style={{
          width: size,
          height: size,
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.05 : 1})`,
        }}
      >
        {/* Real Snell's Law Magnified / Refracted Content Layer */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 transition-transform duration-200"
          style={{
            transform: `translate(${rotateY * 0.4}px, ${-rotateX * 0.4}px) scale(${isHovered ? 1.08 : 1})`,
          }}
        >
          {children ? (
            children
          ) : (
            <div className="space-y-1">
              {badge && (
                <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/30 backdrop-blur-md shadow-sm inline-block">
                  {badge}
                </span>
              )}
              {label && (
                <p className="text-sm sm:text-base font-bold text-white tracking-tight drop-shadow-md leading-tight">
                  {label}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Primary Specular Glare (Moves with incident light) */}
        <div
          className="liquid-glass-lens-glare transition-all duration-150 ease-out pointer-events-none"
          style={{
            top: `${glarePos.y}%`,
            left: `${glarePos.x}%`,
            opacity: isHovered ? 1 : 0.85
          }}
        />

        {/* Secondary Caustic Bottom Reflection */}
        <div className="liquid-glass-lens-caustic pointer-events-none opacity-75" />

        {/* Outer Chromatic Dispersion Ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
          style={{
            boxShadow: isHovered
              ? 'inset 0 0 12px rgba(244, 114, 182, 0.4), inset 0 0 20px rgba(56, 189, 248, 0.4)'
              : 'inset 0 0 8px rgba(255, 255, 255, 0.25)'
          }}
        />
      </div>
    </div>
  );
};
