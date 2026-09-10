import React, { useState, useRef } from 'react';
import { sound } from '../../services/soundService';

interface RotaryKnobProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  subLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'chalk' | 'vermilion' | 'dark';
  onChange?: (val: number) => void;
  indicatorBead?: boolean;
}

export const RotaryKnob: React.FC<RotaryKnobProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  label,
  subLabel,
  size = 'md',
  variant = 'chalk',
  onChange,
  indicatorBead = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number>(0);
  const startValRef = useRef<number>(value);

  // Normalize value to 0..1
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  // Map 0..1 to -135deg .. +135deg (270 degree sweep)
  const angle = -135 + pct * 270;

  const sizePx = size === 'xl' ? 140 : size === 'lg' ? 110 : size === 'md' ? 84 : 64;
  const outerGaugePx = sizePx + 44;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValRef.current = value;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !onChange) return;
    const deltaY = startYRef.current - e.clientY; // upward drag increases
    const range = max - min;
    const change = (deltaY / 150) * range;
    let nextVal = Math.round((startValRef.current + change) / step) * step;
    nextVal = Math.max(min, Math.min(max, nextVal));
    if (nextVal !== value) {
      sound.playClick();
      onChange(nextVal);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // Generate ticks around circular arc
  const totalTicks = 19;
  const ticks = Array.from({ length: totalTicks }).map((_, i) => {
    const tickAngle = -135 + (i / (totalTicks - 1)) * 270;
    const rad = (tickAngle - 90) * (Math.PI / 180);
    const r = outerGaugePx / 2 - 12;
    const x = Math.cos(rad) * r;
    const y = Math.sin(rad) * r;
    const isActive = tickAngle <= angle;
    return { x, y, isActive, tickAngle };
  });

  const isLight = variant === 'chalk';

  return (
    <div className="flex flex-col items-center select-none text-center">
      
      {/* Knob + Outer Gauge Container */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: outerGaugePx, height: outerGaugePx }}
      >
        {/* Arc Background Track */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${outerGaugePx} ${outerGaugePx}`}
        >
          {/* Base Inactive Arc */}
          <circle
            cx={outerGaugePx / 2}
            cy={outerGaugePx / 2}
            r={outerGaugePx / 2 - 4}
            fill="none"
            stroke={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.18)'}
            strokeWidth="2.5"
            strokeDasharray="470"
            strokeDashoffset="120"
            strokeLinecap="round"
            transform={`rotate(135 ${outerGaugePx / 2} ${outerGaugePx / 2})`}
          />
          {/* Active Arc Progress */}
          <circle
            cx={outerGaugePx / 2}
            cy={outerGaugePx / 2}
            r={outerGaugePx / 2 - 4}
            fill="none"
            stroke={isLight ? '#1A1A1E' : '#FFFFFF'}
            strokeWidth="3"
            strokeDasharray="470"
            strokeDashoffset={470 - pct * 350}
            strokeLinecap="round"
            transform={`rotate(135 ${outerGaugePx / 2} ${outerGaugePx / 2})`}
          />
        </svg>

        {/* Concentric Dot Ticks */}
        {ticks.map((t, idx) => (
          <div
            key={idx}
            className={`absolute rounded-full transition-opacity pointer-events-none ${
              t.isActive ? 'opacity-100' : 'opacity-30'
            }`}
            style={{
              width: 3,
              height: 3,
              backgroundColor: isLight ? '#1A1A1E' : '#FFFFFF',
              transform: `translate(${t.x}px, ${t.y}px)`
            }}
          />
        ))}

        {/* Outer Pointer Bead on the Arc */}
        {indicatorBead && (
          <div
            className="absolute rounded-full pointer-events-none transition-transform duration-75 shadow-md"
            style={{
              width: 10,
              height: 10,
              backgroundColor: isLight ? '#383A40' : '#FFFFFF',
              border: `2px solid ${isLight ? '#ECEAE6' : '#F0451E'}`,
              transform: `rotate(${angle}deg) translate(0px, -${outerGaugePx / 2 - 4}px)`
            }}
          />
        )}

        {/* 3D Rotary Knob Body */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="knob-body flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{
            width: sizePx,
            height: sizePx,
            transform: `rotate(${angle}deg)`
          }}
          title={`Click or drag to calibrate ${label}: ${value}`}
        >
          {/* Inset Inner Ridge */}
          <div
            className="knob-inner-ridge flex items-center justify-center relative"
            style={{ width: sizePx * 0.72, height: sizePx * 0.72 }}
          >
            {/* Top Pointer Indicator Dot */}
            <div
              className="absolute knob-pointer-dot"
              style={{
                top: 7,
                backgroundColor: isLight ? '#FFFFFF' : '#FFFFFF'
              }}
            />
          </div>
        </div>
      </div>

      {/* Label and Value */}
      <div className="mt-2.5 space-y-0.5">
        <h4 className={`hw-label ${isLight ? 'hw-label-light' : 'hw-label-dark'}`}>
          {label}
        </h4>
        {subLabel && (
          <p className="text-[10px] font-mono opacity-60 uppercase tracking-wider">
            {subLabel}
          </p>
        )}
      </div>

    </div>
  );
};
