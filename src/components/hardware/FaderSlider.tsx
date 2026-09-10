import React, { useRef } from 'react';
import { sound } from '../../services/soundService';

interface FaderSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  width?: number | string;
  showTicks?: boolean;
  variant?: 'chalk' | 'vermilion' | 'dark';
  onChange: (val: number) => void;
}

export const FaderSlider: React.FC<FaderSliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  label,
  leftLabel,
  rightLabel,
  width = 160,
  showTicks = true,
  variant = 'chalk',
  onChange
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const pct = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));

  const handlePointerDown = (e: React.PointerEvent) => {
    updateFromPointer(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 1) {
      updateFromPointer(e.clientX);
    }
  };

  const updateFromPointer = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const range = max - min;
    const rawVal = min + ratio * range;
    const stepped = Math.round(rawVal / step) * step;
    const clamped = Math.max(min, Math.min(max, stepped));
    if (clamped !== value) {
      sound.playClick();
      onChange(clamped);
    }
  };

  const isLight = variant === 'chalk';

  return (
    <div className="flex flex-col items-center select-none" style={{ width }}>
      
      {/* Top Label and Optional Dot Ticks */}
      {label && (
        <div className="flex items-center justify-between w-full mb-1 px-1">
          <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
            isLight ? 'text-slate-800' : 'text-white'
          }`}>
            {label}
          </span>
          <span className="text-[10px] font-mono opacity-70">
            {value}
          </span>
        </div>
      )}

      {/* Dotted Scale Line Above Groove */}
      {showTicks && (
        <div className="flex justify-between w-full px-2 mb-1.5 opacity-40">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className={`w-1 h-1 rounded-full ${
                isLight ? 'bg-black' : 'bg-white'
              }`}
            />
          ))}
        </div>
      )}

      {/* Recessed Groove & Thumb */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="fader-groove relative h-2 w-full cursor-pointer flex items-center"
      >
        {/* Active fill track */}
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct * 100}%`,
            backgroundColor: isLight ? '#1C1D21' : '#FFFFFF',
            opacity: 0.85
          }}
        />

        {/* Fader Thumb Cap */}
        <div
          className="fader-thumb absolute -top-1.5 transition-transform duration-75"
          style={{
            left: `calc(${pct * 100}% - 14px)`
          }}
        />
      </div>

      {/* Left and Right Sub-labels (e.g. 0 Hz, 20 kHz) */}
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between w-full text-[9px] font-mono uppercase tracking-wider opacity-60 mt-1 px-0.5">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}

    </div>
  );
};
