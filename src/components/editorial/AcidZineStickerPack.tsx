import React from 'react';

/**
 * 3D Glossy Yellow Smiley Balloon (Image 2 Prima Chat Motif)
 */
export const SmileyBalloonSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = ''
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer sticker-diecut animate-balloon-sway ${className}`}
      title="MindBridge Happiness Index"
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
        {/* Balloon Shadow and Outer Yellow Glow */}
        <circle cx="50" cy="50" r="46" fill="#FACC15" stroke="#000000" strokeWidth="3" />
        
        {/* 3D Gloss Highlight Curvature */}
        <ellipse cx="36" cy="30" rx="18" ry="10" fill="#FEF08A" opacity="0.8" transform="rotate(-25 36 30)" />
        <ellipse cx="32" cy="26" rx="6" ry="3" fill="#FFFFFF" opacity="0.9" transform="rotate(-25 32 26)" />

        {/* Happy Oval Eyes */}
        <ellipse cx="37" cy="46" rx="4.5" ry="7" fill="#000000" />
        <ellipse cx="63" cy="46" rx="4.5" ry="7" fill="#000000" />

        {/* Friendly Curved Smile */}
        <path
          d="M32 60 C36 76 64 76 68 60"
          stroke="#000000"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cheek Blushes */}
        <ellipse cx="28" cy="62" rx="4" ry="2.5" fill="#F87171" opacity="0.6" />
        <ellipse cx="72" cy="62" rx="4" ry="2.5" fill="#F87171" opacity="0.6" />
      </svg>
    </div>
  );
};

/**
 * Pink Clay Flower Sticker (Image 2 Motif)
 */
export const ClayFlowerSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = ''
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer sticker-diecut ${className}`}
      title="Bloom of Cognitive Growth"
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]">
        {/* 5 Organic Soft Clay Petals */}
        <circle cx="50" cy="24" r="19" fill="#F472B6" stroke="#000000" strokeWidth="2.5" />
        <circle cx="75" cy="42" r="19" fill="#F472B6" stroke="#000000" strokeWidth="2.5" />
        <circle cx="65" cy="74" r="19" fill="#F472B6" stroke="#000000" strokeWidth="2.5" />
        <circle cx="35" cy="74" r="19" fill="#F472B6" stroke="#000000" strokeWidth="2.5" />
        <circle cx="25" cy="42" r="19" fill="#F472B6" stroke="#000000" strokeWidth="2.5" />
        
        {/* Clay Flower Center Dome */}
        <circle cx="50" cy="50" r="18" fill="#FDE047" stroke="#000000" strokeWidth="2.5" />
        <ellipse cx="45" cy="44" rx="6" ry="3" fill="#FFFFFF" opacity="0.8" />
      </svg>
    </div>
  );
};

/**
 * Retro 8-Bit Pixel Cursor Arrow (Image 2 Motif)
 */
export const PixelCursorSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 38,
  className = ''
}) => {
  return (
    <div
      style={{ width: size, height: size * 1.35 }}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer sticker-diecut ${className}`}
      title="Active Interactive Pointer"
    >
      <svg viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
        {/* Black Outer Pixel Border */}
        <path
          d="M0 0 L0 32 L8 24 L14 38 L20 35 L14 21 L24 21 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinejoin="miter"
        />
        {/* White Inner Body with Classic Grid Hash */}
        <path
          d="M3 4 L3 27 L9 22 L15 35 L18 33 L12 20 L20 20 Z"
          fill="#FFFFFF"
        />
        <line x1="6" y1="10" x2="16" y2="20" stroke="#000000" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
      </svg>
    </div>
  );
};

/**
 * Hand-Drawn Spiral / Star Doodle Sticker (Image 2 Motif)
 */
export const DoodleSpiralSticker: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = ''
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}
    >
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Hand-Drawn Spiral Scribble */}
        <path
          d="M30 30 C32 27 35 32 30 35 C24 38 23 27 30 23 C38 18 43 32 37 40 C28 49 16 38 20 24 C25 10 46 12 50 28"
          stroke="#F7F4EB"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
      </svg>
    </div>
  );
};

/**
 * Hand-Drawn 5-Point Star Doodle
 */
export const DoodleStarSticker: React.FC<{ size?: number; color?: string; className?: string }> = ({
  size = 30,
  color = '#E2F952',
  className = ''
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}
    >
      <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          d="M25 4 L30 18 L45 18 L33 28 L38 42 L25 33 L12 42 L17 28 L5 18 L20 18 Z"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

/**
 * Airbrush Spray Splatter Accent (Cyan / Magenta / Lime)
 */
export const AirbrushSprayGlow: React.FC<{
  variant?: 'cyan' | 'magenta' | 'lime' | 'orange';
  size?: number;
  className?: string;
}> = ({
  variant = 'cyan',
  size = 200,
  className = ''
}) => {
  const variantClass =
    variant === 'magenta'
      ? 'airbrush-spray-magenta'
      : variant === 'lime'
      ? 'airbrush-spray-lime'
      : variant === 'orange'
      ? 'airbrush-spray-orange'
      : 'airbrush-spray-cyan';

  return (
    <div
      style={{ width: size, height: size }}
      className={`absolute rounded-full pointer-events-none z-0 opacity-70 animate-spray-pulse ${variantClass} ${className}`}
    />
  );
};
