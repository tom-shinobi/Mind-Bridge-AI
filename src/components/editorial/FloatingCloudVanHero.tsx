import React from 'react';

interface FloatingCloudVanHeroProps {
  onCtaClick?: () => void;
  ctaText?: string;
  title?: string;
  subtitle?: string;
}

export const FloatingCloudVanHero: React.FC<FloatingCloudVanHeroProps> = ({
  onCtaClick,
  ctaText = 'LAUNCH EXPEDITION // EXPLORE SYSTEM',
  title = 'SPACE',
  subtitle = 'Personal academic intelligence navigating the outer realms of human knowledge.'
}) => {
  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border-2 border-[#E2F952]/40 bg-gradient-to-b from-[#101b2b] via-[#142333] to-[#0a121c] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_45px_rgba(226,249,82,0.12)] my-6">
      {/* 1. Vintage Paper & Notebook Graph Grid Texture Overlay */}
      <div className="editorial-paper-grain absolute inset-0 pointer-events-none z-30 opacity-60" />
      <div className="bg-notebook-grid-subtle absolute inset-0 pointer-events-none z-10 opacity-30" />

      {/* 2. Masking Tape Corners */}
      <div className="masking-tape-corner-tl z-40" />
      <div className="masking-tape-corner-tr z-40" />

      {/* 3. Archival Zine Masthead Bar */}
      <div className="relative z-30 px-6 pt-4 pb-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs tracking-widest uppercase font-editorial-mono text-zinc-400 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E2F952] shadow-[0_0_8px_#E2F952] animate-pulse" />
          <span className="text-[#F7F4EB] font-bold">COGNITIVE ODYSSEY // MISSION 006</span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-[#E2F952]/90 font-mono">STATUS: LEVITATING</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="px-2 py-0.5 rounded border border-[#E2F952]/30 text-[#E2F952] font-semibold bg-[#E2F952]/10">
            ALT: 12,400 FT
          </span>
          <span className="hidden md:inline font-mono text-zinc-500">
            LOC: 46°30&apos;N 08°02&apos;E (ALPS)
          </span>
        </div>
      </div>

      {/* 4. The Surreal Cosmic Cloudscape Artwork (Image 1 Artwork Recreation) */}
      <div className="relative min-h-[420px] sm:min-h-[500px] md:min-h-[560px] flex flex-col items-center justify-between overflow-hidden px-6 py-8">
        
        {/* Sky Ambient Light & Distant Moon */}
        <div className="absolute top-6 left-12 pointer-events-none z-10 select-none">
          <svg className="w-14 h-14 sm:w-16 sm:h-16 opacity-70 drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]" viewBox="0 0 100 100" fill="none">
            <path
              d="M75 15 C55 25 45 45 45 65 C45 80 52 90 60 95 C30 95 10 75 10 45 C10 20 30 5 60 5 C65 5 70 8 75 15 Z"
              fill="#E2E8F0"
            />
            <circle cx="35" cy="35" r="4" fill="#CBD5E1" opacity="0.6" />
            <circle cx="48" cy="55" r="5" fill="#CBD5E1" opacity="0.5" />
            <circle cx="28" cy="62" r="3" fill="#CBD5E1" opacity="0.5" />
          </svg>
        </div>

        {/* Aerosol Spray Glow Behind Floating Van */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[500px] h-[300px] airbrush-spray-cyan opacity-40 animate-spray-pulse" />
          <div className="w-[350px] h-[250px] airbrush-spray-orange opacity-30" />
        </div>

        {/* Huge Monumental Woodblock Headline in Sky ("SPACE" + "NOT OUT OF THIS" + "though") */}
        <div className="relative z-15 w-full flex flex-col items-center text-center mt-2 pointer-events-none select-none">
          {/* Angled Stencil Eyebrow */}
          <div className="inline-block transform -rotate-6 translate-y-3 sm:translate-y-4 px-3 py-0.5 bg-[#E2F952] text-black font-woodblock tracking-widest text-xs sm:text-sm uppercase shadow-[3px_3px_0px_#000000]">
            NOT OUT OF THIS
          </div>

          {/* Monumental Condensed Headline */}
          <h1 className="font-woodblock text-7xl sm:text-9xl md:text-[140px] text-white/90 tracking-tighter uppercase leading-none drop-shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
            {title}
          </h1>

          {/* Elegant Cursive Script Suffix */}
          <div className="font-handwritten text-2xl sm:text-3xl md:text-4xl text-[#E2F952] transform translate-y-[-18px] sm:translate-y-[-28px] -rotate-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            though
          </div>
        </div>

        {/* Central Floating Retro Camper Van in Cloud Island */}
        <div className="relative z-20 w-full max-w-xl flex flex-col items-center -mt-6 sm:-mt-10 animate-float-bobbing">
          
          {/* Top Astronaut Perched on Van Roof */}
          <div className="relative z-25 -mb-5 sm:-mb-6 flex flex-col items-center">
            <svg
              className="w-14 h-20 sm:w-18 sm:h-24 drop-shadow-[0_6px_14px_rgba(0,0,0,0.9)]"
              viewBox="0 0 70 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* White Helmet with Golden Visor */}
              <circle cx="35" cy="22" r="14" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
              <ellipse cx="37" cy="22" rx="9" ry="8" fill="#F59E0B" opacity="0.9" />
              <ellipse cx="35" cy="20" rx="4" ry="3" fill="#FEF08A" opacity="0.8" />
              {/* Orange Astronaut Spacesuit Torso */}
              <path
                d="M24 36 L46 36 L48 58 L42 60 L40 76 L30 76 L28 60 L22 58 Z"
                fill="#EA580C"
                stroke="#C2410C"
                strokeWidth="1.5"
              />
              {/* Chest Control Box */}
              <rect x="30" y="42" width="10" height="9" rx="2" fill="#E2E8F0" />
              <circle cx="33" cy="45" r="1" fill="#3B82F6" />
              <circle cx="37" cy="45" r="1" fill="#10B981" />
              <rect x="32" y="48" width="6" height="1.5" fill="#EF4444" />
              {/* Legs Sitting Down on Edge */}
              <path d="M26 60 L20 74 L25 75 L30 63 Z" fill="#C2410C" />
              <path d="M44 60 L50 74 L45 75 L40 63 Z" fill="#C2410C" />
              {/* White Boots */}
              <rect x="18" y="74" width="8" height="5" rx="2" fill="#FFFFFF" />
              <rect x="44" y="74" width="8" height="5" rx="2" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Orange Retro Vintage Camper Van */}
          <div className="relative z-20 w-72 sm:w-96 drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)]">
            <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              {/* Van Body Main Chassis in Vintage Ochre Orange */}
              <path
                d="M40 140 L30 110 C25 80 45 40 90 35 L280 35 C320 35 340 60 340 100 L340 140 Z"
                fill="#EA580C"
                stroke="#9A3412"
                strokeWidth="3"
              />
              {/* Cream White Top Half Accent */}
              <path
                d="M45 85 L28 110 L340 110 L340 85 L280 35 L90 35 Z"
                fill="#FFFBEB"
                opacity="0.3"
              />
              {/* Front Windshield with Deep Tint */}
              <path
                d="M48 85 L85 45 L130 45 L130 85 Z"
                fill="#1E293B"
                stroke="#0F172A"
                strokeWidth="2"
              />
              <path d="M58 80 L88 50 L98 50 L68 80 Z" fill="#94A3B8" opacity="0.4" />
              {/* Side Passenger Windows */}
              <rect x="145" y="45" width="55" height="40" rx="6" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
              <rect x="215" y="45" width="55" height="40" rx="6" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
              <rect x="285" y="45" width="45" height="40" rx="6" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
              {/* Headlight (Glowing White Beam) */}
              <circle cx="34" cy="115" r="9" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
              <circle cx="34" cy="115" r="4" fill="#FFFFFF" />
              {/* Chrome Trim Line & Bumper */}
              <line x1="28" y1="125" x2="345" y2="125" stroke="#FFFFFF" strokeWidth="3" strokeOpacity="0.8" />
              <rect x="20" y="135" width="330" height="12" rx="4" fill="#475569" stroke="#1E293B" strokeWidth="2" />
            </svg>
          </div>

          {/* Cumulus Cloud Pillows Nesting the Floating Van */}
          <div className="relative -mt-16 sm:-mt-22 z-22 w-[340px] sm:w-[480px] animate-cloud-drift">
            <svg viewBox="0 0 500 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]">
              {/* Back Cloud Shadows */}
              <path
                d="M80 140 C50 140 30 110 50 80 C60 50 100 40 130 60 C160 20 230 20 260 55 C290 25 360 25 390 65 C420 50 460 70 460 105 C470 140 430 160 390 155 Z"
                fill="#94A3B8"
                opacity="0.3"
              />
              {/* Main Fluffy White Cumulus Billows */}
              <path
                d="M70 130 C40 130 20 100 40 70 C50 40 90 30 120 50 C150 10 220 10 250 45 C280 15 350 15 380 55 C410 40 450 60 450 95 C460 130 420 150 380 145 L70 130 Z"
                fill="#F8FAFC"
              />
              <circle cx="160" cy="70" r="50" fill="#FFFFFF" />
              <circle cx="240" cy="60" r="55" fill="#FFFFFF" />
              <circle cx="320" cy="65" r="50" fill="#FFFFFF" />
              <circle cx="95" cy="85" r="40" fill="#FFFFFF" />
              <circle cx="400" cy="95" r="45" fill="#FFFFFF" />
              {/* Under-Cloud Shading & Aerosol Mist Tint */}
              <ellipse cx="250" cy="135" rx="190" ry="25" fill="#E2E8F0" opacity="0.8" />
              <ellipse cx="230" cy="140" rx="140" ry="15" fill="#CBD5E1" opacity="0.6" />
            </svg>
          </div>

          {/* Suspended Wooden Rope Ladder Hanging Down Towards the Mountain Horizon */}
          <div className="relative -mt-6 sm:-mt-8 z-15 flex flex-col items-center">
            <svg width="40" height="130" viewBox="0 0 40 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              {/* Left & Right Ladder Ropes */}
              <line x1="10" y1="0" x2="10" y2="130" stroke="#78350F" strokeWidth="2.5" />
              <line x1="30" y1="0" x2="30" y2="130" stroke="#78350F" strokeWidth="2.5" />
              {/* Wooden Ladder Rungs */}
              {[15, 35, 55, 75, 95, 115].map((y) => (
                <rect key={y} x="6" y={y} width="28" height="4" rx="1" fill="#B45309" stroke="#451A03" strokeWidth="1" />
              ))}
            </svg>
          </div>
        </div>

        {/* Alpine Rolling Green Mountains Silhouette at Base */}
        <div className="absolute bottom-0 inset-x-0 pointer-events-none z-10 select-none">
          <svg viewBox="0 0 1000 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            {/* Distant Blue Mountains */}
            <path d="M0 160 L140 70 L280 120 L420 50 L560 110 L700 40 L840 90 L1000 60 L1000 160 Z" fill="#1E293B" opacity="0.8" />
            {/* Rolling Alpine Green Grass Meadow */}
            <path d="M0 160 C200 90 400 130 600 95 C800 60 900 110 1000 100 L1000 160 Z" fill="#14532D" />
            <path d="M0 160 C250 110 450 140 700 120 C850 110 950 130 1000 125 L1000 160 Z" fill="#166534" />
          </svg>
        </div>

        {/* Action Controls & Subtitle */}
        <div className="relative z-30 max-w-xl text-center flex flex-col items-center mt-6">
          <p className="font-editorial text-sm sm:text-base text-zinc-300 font-normal leading-relaxed max-w-md drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {subtitle}
          </p>

          {onCtaClick && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onCtaClick}
                className="editorial-btn-lime px-7 py-3 text-xs sm:text-sm font-woodblock tracking-widest uppercase flex items-center gap-2.5 cursor-pointer"
              >
                <span>{ctaText}</span>
                <span className="text-base leading-none">→</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 5. Archival Footer Coordinates Bar */}
      <div className="relative z-30 px-6 py-2.5 border-t border-white/10 bg-black/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-[11px] font-editorial-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="text-[#E2F952] font-semibold">FIG. 00-COSMIC</span>
          <span className="text-zinc-600">/</span>
          <span>SURREALIST CLOUD VEHICLE LEVITATION</span>
        </div>
        <div className="flex items-center gap-2 tracking-widest text-zinc-500 text-[10px]">
          <span>SPACE CODERS EXPEDITION</span>
          <span>© 2026</span>
        </div>
      </div>
    </div>
  );
};
