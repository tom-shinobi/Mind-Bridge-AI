import React from 'react';

interface HorizonChairHeroProps {
  onReflectClick?: () => void;
  actionText?: string;
  quoteSubtitle?: string;
}

export const HorizonChairHero: React.FC<HorizonChairHeroProps> = ({
  onReflectClick,
  actionText = 'ENGAGE DEEP SOCRATIC DIALOGUE',
  quoteSubtitle = "YOU don't HAVE FOREVER TO live."
}) => {
  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border-2 border-white/20 bg-gradient-to-b from-[#e5e9ec] via-[#ecefe9] to-[#d6dcce] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(255,255,255,0.15)] my-6 text-[#1A2621]">
      {/* 1. Vintage Paper & Notebook Graph Grid Overlay */}
      <div className="editorial-paper-grain absolute inset-0 pointer-events-none z-30 opacity-70" />
      <div className="bg-notebook-grid-subtle absolute inset-0 pointer-events-none z-10 opacity-20" />

      {/* 2. Masking Tape Corners */}
      <div className="masking-tape-corner-tl z-40" />
      <div className="masking-tape-corner-tr z-40" />

      {/* 3. Ghosted Typographic Watermark in Sky ("TOO LATE // NOW IS THE TIME") */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5 select-none overflow-hidden">
        <span className="font-woodblock text-[120px] sm:text-[180px] md:text-[230px] text-black/[0.04] tracking-tighter uppercase leading-none transform -rotate-3">
          TOO LATE
        </span>
      </div>

      {/* 4. Main Artwork & Calligraphic Typography (Image 3 Artwork Recreation) */}
      <div className="relative min-h-[440px] sm:min-h-[520px] md:min-h-[580px] flex flex-col items-center justify-between px-6 pt-12 pb-6 z-20">
        
        {/* Archival Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/10 border border-black/15 rounded-full font-editorial-mono text-[11px] text-[#2C3E35] uppercase tracking-widest backdrop-blur-sm mb-4">
          <span>PHILOSOPHICAL MEMORANDUM // VOL. IV</span>
        </div>

        {/* Exquisite High-Contrast Editorial Headline (Matching Reference 3 Typography) */}
        <div className="text-center max-w-3xl flex flex-col items-center select-none">
          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#24332C] tracking-tight leading-[1.05] drop-shadow-sm">
            <span className="font-normal font-serif tracking-normal">DO </span>
            <span className="italic font-light text-[#1F4332] font-swash">What </span>
            <span className="font-normal font-serif tracking-normal">YOU </span>
            <span className="italic font-light text-[#1F4332] font-swash">Want </span>
            <span className="font-normal font-serif tracking-normal">TO DO.</span>
          </h1>

          <p className="font-editorial text-lg sm:text-2xl md:text-3xl text-[#3A4D43] italic font-light tracking-wide mt-3 sm:mt-5 drop-shadow-sm">
            {quoteSubtitle}
          </p>

          <div className="mt-3 px-3 py-0.5 bg-[#E2F952] text-black font-woodblock text-xs uppercase tracking-widest shadow-[2px_2px_0px_#000000] rotate-1">
            EST. 2026 // SOCRATIC CONTEMPLATION
          </div>
        </div>

        {/* Mid-Century Armchair, Table & Coffee Cup atop Grassy Knoll Silhouette */}
        <div className="relative w-full max-w-md mt-6 flex flex-col items-center">
          
          {/* Solitary Mid-Century Lounge Chair & Side Table with Coffee Cup */}
          <div className="relative z-25 -mb-7 sm:-mb-9">
            <svg
              className="w-56 sm:w-72 drop-shadow-[0_12px_20px_rgba(0,0,0,0.45)]"
              viewBox="0 0 280 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Wooden Chair Leg Shadows on Grass */}
              <ellipse cx="110" cy="172" rx="45" ry="6" fill="#14311F" opacity="0.6" />
              <ellipse cx="195" cy="172" rx="20" ry="4" fill="#14311F" opacity="0.6" />

              {/* Side Table with Coffee Cup */}
              <path d="M195 125 L195 170" stroke="#3D2B1F" strokeWidth="4" strokeLinecap="round" />
              <path d="M185 170 L205 170" stroke="#3D2B1F" strokeWidth="3" />
              {/* Table Top Surface */}
              <ellipse cx="195" cy="125" rx="22" ry="6" fill="#5C4033" stroke="#2E1C12" strokeWidth="1.5" />
              {/* Porcelain White Coffee Cup & Saucer */}
              <ellipse cx="195" cy="122" rx="8" ry="2.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <path d="M190 121 C190 115 200 115 200 121 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
              <path d="M200 117 C203 117 203 120 200 120" stroke="#94A3B8" strokeWidth="1" fill="none" />
              {/* Gentle Coffee Steam */}
              <path d="M195 113 C193 108 197 104 195 99" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

              {/* Mid-Century Modern Armchair (Hans Wegner / Pierre Jeanneret Style) */}
              {/* Back Legs (Dark Walnut Wood) */}
              <path d="M75 170 L95 105" stroke="#3D2B1F" strokeWidth="5" strokeLinecap="round" />
              <path d="M145 170 L135 115" stroke="#3D2B1F" strokeWidth="5" strokeLinecap="round" />
              {/* Front Legs */}
              <path d="M65 170 L80 110" stroke="#4A3525" strokeWidth="6" strokeLinecap="round" />
              <path d="M135 170 L145 110" stroke="#4A3525" strokeWidth="6" strokeLinecap="round" />
              {/* Wooden Armrest Beams */}
              <path d="M65 105 L125 90 L150 115" stroke="#4A3525" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
              <path d="M80 110 L140 95" stroke="#2E1C12" strokeWidth="3" />
              {/* Cream Linen Cushioned Seat */}
              <path
                d="M80 125 L145 115 L148 135 L85 142 Z"
                fill="#F4F1EA"
                stroke="#D6CEBE"
                strokeWidth="2"
              />
              {/* Cream Linen Reclined Back Cushion */}
              <path
                d="M110 70 L148 115 L138 122 L100 78 Z"
                fill="#F4F1EA"
                stroke="#D6CEBE"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Grassy Knoll Mound (Lush green alpine grass hill) */}
          <div className="relative w-full z-20">
            <svg viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              {/* Grass mound contour */}
              <path
                d="M0 100 C80 40 180 20 280 40 C340 55 380 75 400 100 Z"
                fill="#274A32"
              />
              <path
                d="M0 100 C90 55 190 35 270 50 C330 62 370 80 400 100 Z"
                fill="#1C3825"
                opacity="0.7"
              />
              {/* Grass blade strokes along ridge */}
              {[40, 70, 100, 130, 160, 190, 220, 250, 280, 310, 340].map((x, i) => (
                <path
                  key={i}
                  d={`M${x} ${35 + (i % 3) * 4} L${x + 2} ${28 + (i % 3) * 4}`}
                  stroke="#3D6B4C"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </div>

        </div>

        {/* Action Button Trigger */}
        {onReflectClick && (
          <div className="relative z-30 mt-4">
            <button
              type="button"
              onClick={onReflectClick}
              className="editorial-btn-dark px-8 py-3 text-xs sm:text-sm font-woodblock tracking-widest uppercase flex items-center gap-3 cursor-pointer shadow-[3px_3px_0px_#000000]"
            >
              <span>{actionText}</span>
              <span className="text-base leading-none text-[#E2F952]">→</span>
            </button>
          </div>
        )}

      </div>

      {/* 5. Bottom Archival Coordinates Bar */}
      <div className="relative z-30 px-6 py-3 border-t border-black/10 bg-black/10 backdrop-blur-sm flex flex-wrap items-center justify-between gap-2 text-[11px] font-editorial-mono text-[#3D5246]">
        <div className="flex items-center gap-2 font-semibold">
          <span>FIG. 03 // CONTEMPLATION HORIZON</span>
          <span>•</span>
          <span>SOLITARY SCHOLAR RETREAT</span>
        </div>
        <div className="tracking-widest text-[10px] uppercase font-mono text-[#526B5D]">
          MIND-BRIDGE METAPHYSICAL SUITE © 2026
        </div>
      </div>
    </div>
  );
};
