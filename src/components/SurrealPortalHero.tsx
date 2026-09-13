import React from 'react';

interface SurrealPortalHeroProps {
  onCtaClick?: () => void;
  ctaText?: string;
}

export const SurrealPortalHero: React.FC<SurrealPortalHeroProps> = ({
  onCtaClick,
  ctaText = 'ENTER THE PORTAL'
}) => {
  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border-2 border-[#E2F952]/40 bg-[#07090E] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(226,249,82,0.15)] my-6">
      {/* 1. Newsprint / Paper Grain Texture Layer */}
      <div className="editorial-paper-grain absolute inset-0 pointer-events-none z-30 opacity-70" />

      {/* 2. Tyler-Style Masking Tape Corners */}
      <div className="masking-tape-corner-tl z-40" />
      <div className="masking-tape-corner-tr z-40" />

      {/* 3. Top Archival Bar with Passport & Zine Metadata */}
      <div className="relative z-30 px-6 pt-5 pb-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs tracking-widest uppercase font-editorial-mono text-zinc-400 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E2F952] shadow-[0_0_8px_#E2F952] animate-pulse" />
          <span className="text-[#F7F4EB] font-bold">EXPEDITION SPECIFICATION // VOL. IV</span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-[#E2F952]/90 font-mono">FILE: 004-SURREAL-ECHO</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="hidden md:inline px-2 py-0.5 rounded border border-[#E2F952]/30 text-[#E2F952] font-semibold bg-[#E2F952]/5">
            MIND-BRIDGE ARCHIVE © 2026
          </span>
          <span className="tracking-tighter font-mono text-zinc-500">
            LOC: 37°46&apos;N 122°25&apos;W
          </span>
        </div>
      </div>

      {/* 4. The Metaphysical Celestial Light Portal (Image 1 Artwork Recreation) */}
      <div className="relative min-h-[380px] sm:min-h-[460px] md:min-h-[520px] flex items-center justify-center overflow-hidden px-6 py-12">
        {/* Radiating Volumetric Sunburst Light Rays */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-[800px] h-[800px] sm:w-[1050px] sm:h-[1050px] rounded-full surreal-rays-flow opacity-65 mix-blend-screen bg-[conic-gradient(from_0deg_at_50%_50%,rgba(226,249,82,0.45)_0deg,transparent_20deg,rgba(255,230,150,0.5)_40deg,transparent_60deg,rgba(244,63,94,0.4)_90deg,transparent_115deg,rgba(226,249,82,0.6)_145deg,transparent_175deg,rgba(255,255,240,0.55)_210deg,transparent_240deg,rgba(244,63,94,0.35)_280deg,transparent_310deg,rgba(226,249,82,0.45)_360deg)]" />
        </div>

        {/* Central Luminous Radiant Vortex Aperture */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          {/* Outer Atmospheric Aura */}
          <div className="w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] rounded-full surreal-portal-pulse bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(226,249,82,0.85)_25%,rgba(244,63,94,0.4)_50%,transparent_75%)] blur-2xl opacity-80" />
          {/* Intense Inner Core of White-Gold Light */}
          <div className="w-[140px] h-[140px] sm:w-[220px] sm:h-[220px] rounded-full bg-white shadow-[0_0_120px_60px_rgba(226,249,82,0.8),0_0_240px_100px_rgba(255,255,255,0.7)] blur-md" />
        </div>

        {/* Botanical Silhouette Vignette (Lush woodland leaves framing metaphysical doorway) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-85 select-none"
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left Foliage Branches & Leaves */}
          <path
            d="M-20 600 C60 480 80 340 10 200 C80 240 140 320 120 420 C180 340 170 210 100 120 C180 160 220 270 200 380 C260 260 220 110 140 0 L-20 0 Z"
            fill="#05070B"
          />
          <path
            d="M30 180 C90 140 150 160 180 210 C140 220 90 200 30 180 Z"
            fill="#080C12"
          />
          <path
            d="M90 290 C160 260 210 300 230 360 C170 360 130 320 90 290 Z"
            fill="#0A0E17"
          />
          {/* Right Foliage Silhouette */}
          <path
            d="M1020 600 C940 470 910 320 990 180 C920 220 860 310 890 410 C820 320 830 200 900 100 C820 150 780 260 810 370 C740 250 790 100 870 0 L1020 0 Z"
            fill="#05070B"
          />
          <path
            d="M960 160 C900 130 840 150 820 200 C860 210 920 190 960 160 Z"
            fill="#080C12"
          />
          <path
            d="M900 270 C830 250 780 290 770 350 C830 350 870 310 900 270 Z"
            fill="#0A0E17"
          />
          {/* Ancient Threshold / Stone Dais at Bottom */}
          <path
            d="M260 600 L380 470 L620 470 L740 600 Z"
            fill="#05070A"
          />
          <line x1="380" y1="470" x2="620" y2="470" stroke="#E2F952" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="340" y1="510" x2="660" y2="510" stroke="#F7F4EB" strokeWidth="1" strokeOpacity="0.2" />
        </svg>

        {/* The Metaphysical Traveler Silhouette (Standing at threshold gazing into the light) */}
        <div className="absolute bottom-10 sm:bottom-14 left-1/2 -translate-x-1/2 pointer-events-none z-25 flex flex-col items-center select-none">
          <svg
            className="w-16 h-28 sm:w-20 sm:h-36 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
            viewBox="0 0 80 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Traveler's Head / Cap */}
            <circle cx="40" cy="24" r="9" fill="#040609" />
            <path d="M32 20 C36 15 48 15 52 21 C48 21 40 20 32 20 Z" fill="#020305" />
            {/* Neck & Torso in Classic Overcoat */}
            <path
              d="M36 33 L44 33 L52 50 L56 82 L46 84 L44 118 L36 118 L34 84 L24 82 L28 50 Z"
              fill="#040609"
            />
            {/* Scholar Satchel Strap across shoulder */}
            <path d="M32 38 L54 68" stroke="#E2F952" strokeWidth="1.5" strokeOpacity="0.6" />
            {/* Legs standing together on the stone threshold */}
            <path d="M36 118 L34 138 L39 138 L40 118 Z" fill="#020305" />
            <path d="M41 118 L41 138 L46 138 L44 118 Z" fill="#020305" />
            {/* Feet Cast Shadows */}
            <ellipse cx="40" cy="139" rx="14" ry="2.5" fill="#000000" opacity="0.9" />
          </svg>
        </div>

        {/* Floating Typography & Editorial Annotations (Foreground, z-30) */}
        <div className="relative z-30 max-w-2xl text-center flex flex-col items-center pt-2 pb-8 sm:pb-12">
          {/* Highlighter Neon Tape Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E2F952] text-black font-woodblock tracking-widest text-xs uppercase shadow-[3px_3px_0px_#000000] rotate-[-1.5deg] hover:rotate-0 transition-transform mb-4 cursor-default">
            <span>★</span>
            <span>AUTONOMOUS SOCRATIC MATRIX // EDITION 2026</span>
            <span>★</span>
          </div>

          {/* Luxury High-Contrast Editorial Serif Headline (Image 1 Reference) */}
          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-normal text-[#F7F4EB] tracking-tight leading-[1.05] drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] select-none">
            Chase your <span className="italic font-light text-[#E2F952] drop-shadow-[0_0_20px_rgba(226,249,82,0.7)]">curiosity</span>
          </h1>

          {/* Tyler Woodblock Grotesque Subtitle */}
          <p className="font-woodblock text-sm sm:text-lg md:text-xl text-[#F7F4EB]/90 tracking-wider uppercase mt-4 max-w-xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            A COGNITIVE PORTAL DESIGNED FOR THE RELENTLESS SCHOLAR
          </p>

          {/* Tyler Cursive Handwritten Annotation Tape */}
          <div className="mt-3 inline-block px-3 py-0.5 bg-black/70 border border-[#E2F952]/40 rounded backdrop-blur-sm rotate-[1.5deg]">
            <span className="font-handwritten text-lg sm:text-xl text-[#E2F952] font-normal">
              “never stop questioning the architecture of thought...”
            </span>
          </div>

          {/* Action CTA with Tactile Brutalist Shadow */}
          {onCtaClick && (
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={onCtaClick}
                className="editorial-btn-lime px-8 py-3.5 text-xs sm:text-sm font-woodblock tracking-widest uppercase flex items-center gap-3 cursor-pointer"
              >
                <span>{ctaText}</span>
                <span className="text-base leading-none">→</span>
              </button>
            </div>
          )}
        </div>

        {/* Hand-Drawn Editorial Sticker 1: Circled Marker (Top-Right) */}
        <div className="absolute top-8 right-6 hidden sm:flex flex-col items-center pointer-events-none z-30 rotate-[6deg]">
          <div className="highlighter-circle-marker w-20 h-20 flex flex-col items-center justify-center text-center p-1 bg-black/60 backdrop-blur-sm">
            <span className="font-woodblock text-[10px] text-[#E2F952] uppercase leading-none">
              SOCRATIC
            </span>
            <span className="font-woodblock text-sm text-[#F7F4EB] leading-none my-0.5">
              100%
            </span>
            <span className="font-editorial-mono text-[8px] text-zinc-400 leading-none">
              COGNITION
            </span>
          </div>
        </div>

        {/* Hand-Drawn Editorial Sticker 2: Boarding Stamp (Bottom-Left) */}
        <div className="absolute bottom-8 left-6 hidden md:flex items-center gap-2 pointer-events-none z-30 rotate-[-3deg]">
          <div className="editorial-stamp-badge flex flex-col gap-0.5 bg-black/70 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[9px] font-bold text-[#E2F952]">
              <span>PASS PERMIT</span>
              <span>№ 849-G</span>
            </div>
            <div className="text-[8px] tracking-tighter text-zinc-400 font-mono">
              ||| | |||| | || | |||||
            </div>
            <div className="text-[8px] text-[#F7F4EB] tracking-wider uppercase">
              APPROVED FOR FLIGHT
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Stamp & Legal Bar */}
      <div className="relative z-30 px-6 py-3 border-t border-white/10 bg-black/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-[11px] font-editorial-mono text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="text-[#E2F952] font-semibold">GOLF LE FLEUR* INFLUENCE</span>
          <span className="text-zinc-600">/</span>
          <span>HIGH SURREALISM EDITORIAL</span>
        </div>
        <div className="flex items-center gap-3 tracking-widest text-zinc-500 text-[10px]">
          <span>© 2026 MINDBRIDGE LABS</span>
          <span>ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </div>
  );
};
