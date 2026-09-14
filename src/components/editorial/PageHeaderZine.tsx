import React from 'react';
import { SmileyBalloonSticker, ClayFlowerSticker, PixelCursorSticker, DoodleStarSticker } from './AcidZineStickerPack';

interface PageHeaderZineProps {
  editionTag?: string;
  badgeText?: string;
  title: string;
  subtitle: string;
  sticker?: 'smiley' | 'flower' | 'cursor' | 'none';
  sprayColor?: 'cyan' | 'magenta' | 'lime' | 'orange';
  rightElement?: React.ReactNode;
}

export const PageHeaderZine: React.FC<PageHeaderZineProps> = ({
  editionTag = 'VOL. IV // ARCHIVE 2026',
  badgeText,
  title,
  subtitle,
  sticker = 'smiley',
  sprayColor = 'cyan',
  rightElement
}) => {
  const sprayClass = `airbrush-spray-${sprayColor}`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/20 p-6 sm:p-8 shadow-2xl mb-6">

      {/* 2. Authentic Paper Grain & Notebook Graph Grid Background */}
      <div className="editorial-paper-grain absolute inset-0 pointer-events-none z-0 opacity-40" />
      <div className="bg-notebook-grid-subtle absolute inset-0 pointer-events-none z-0 opacity-25" />

      {/* 3. Airbrush Spray Halos */}
      <div className={`absolute -top-12 -left-12 w-64 h-64 ${sprayClass} opacity-25 pointer-events-none`} />
      <div className="absolute -bottom-16 -right-16 w-72 h-72 airbrush-spray-lime opacity-20 pointer-events-none" />

      {/* 4. Content */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-3xl">
          {/* Edition Tag & Optional Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded bg-black/60 border border-[#E2F952]/40 text-[#E2F952] font-editorial-mono text-[10px] uppercase tracking-widest backdrop-blur-sm">
              {editionTag}
            </span>
            {badgeText && (
              <span className="px-2.5 py-0.5 rounded bg-[#E2F952] text-black font-woodblock text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_#000000]">
                {badgeText}
              </span>
            )}
          </div>

          {/* Monumental Woodblock Title with Acid Lime Asterisk */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-woodblock tracking-wider uppercase text-white leading-tight">
            {title}
            <span className="text-[#E2F952]">*</span>
          </h1>

          {/* High Editorial Subtitle */}
          <p className="text-xs sm:text-sm font-editorial-mono text-zinc-400 mt-2 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Right Section: Optional Action/Telemetry + Floating 3D Sticker */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {rightElement}

          {sticker === 'smiley' && (
            <div className="hidden sm:block">
              <SmileyBalloonSticker size={54} />
            </div>
          )}

          {sticker === 'flower' && (
            <div className="hidden sm:block">
              <ClayFlowerSticker size={48} />
            </div>
          )}

          {sticker === 'cursor' && (
            <div className="hidden sm:block">
              <PixelCursorSticker size={38} />
            </div>
          )}

          <div className="hidden lg:block">
            <DoodleStarSticker size={26} color="#E2F952" />
          </div>
        </div>
      </div>
    </div>
  );
};
