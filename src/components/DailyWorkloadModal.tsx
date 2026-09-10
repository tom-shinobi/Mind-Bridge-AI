import React, { useState } from 'react';
import {
  X,
  HeartPulse,
  AlertCircle,
  Sparkles,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  CalendarCheck
} from 'lucide-react';
import type { WorkloadLevel, TimetableBlock, AdaptiveAuditEntry } from '../types';
import { adaptiveEngine } from '../services/adaptiveEngine';
import { sound } from '../services/soundService';
import { FaderSlider } from './hardware/FaderSlider';

interface DailyWorkloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleAdapted: (timetable: TimetableBlock[], audit: AdaptiveAuditEntry, message: string) => void;
}

export const DailyWorkloadModal: React.FC<DailyWorkloadModalProps> = ({
  isOpen,
  onClose,
  onScheduleAdapted
}) => {
  const [selectedLevel, setSelectedLevel] = useState<WorkloadLevel>('heavy');
  const [stressRating, setStressRating] = useState<number>(4);
  const [notes, setNotes] = useState<string>('Heavy assignment submission due tomorrow for Computer Networks.');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRecalibrate = () => {
    sound.playClick();
    setIsProcessing(true);

    setTimeout(() => {
      const res = adaptiveEngine.adaptForWorkload(selectedLevel, stressRating);
      setIsProcessing(false);
      setResultMessage(res.message);
      onScheduleAdapted(res.timetable, res.auditEntry, res.message);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div 
        className="apple-liquid-glass max-w-lg w-full relative p-6 sm:p-7 rounded-3xl border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0451E]/20 border border-[#F0451E]/40 flex items-center justify-center text-[#F0451E]">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight font-mono uppercase tracking-wider">
                Workload Attenuator // MK-II
              </h3>
              <p className="text-[11px] text-slate-400 font-mono leading-tight">
                Cognitive Pacing & Study Redistribution
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5 relative z-10">
          
          {/* Workload Level Rocker Matrix */}
          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2 font-mono">
              Academic Capacity State
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Light */}
              <button
                type="button"
                onClick={() => { sound.playClick(); setSelectedLevel('light'); }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedLevel === 'light'
                    ? 'liquid-glass-emerald border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                    : 'liquid-glass-block border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-emerald-400 uppercase">
                    <Smile className="w-3.5 h-3.5" /> Light Load
                  </div>
                  <span className="led-indicator led-emerald" />
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  High mental capacity. Peak energy for deep work.
                </p>
              </button>

              {/* Balanced */}
              <button
                type="button"
                onClick={() => { sound.playClick(); setSelectedLevel('balanced'); }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedLevel === 'balanced'
                    ? 'liquid-glass-adaptive border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                    : 'liquid-glass-block border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-purple-300 uppercase">
                    <Meh className="w-3.5 h-3.5" /> Balanced
                  </div>
                  <span className="led-indicator led-violet" />
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Standard college day. Maintain regular pacing.
                </p>
              </button>

              {/* Heavy */}
              <button
                type="button"
                onClick={() => { sound.playClick(); setSelectedLevel('heavy'); }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedLevel === 'heavy'
                    ? 'liquid-glass-amber border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'liquid-glass-block border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-amber-400 uppercase">
                    <Frown className="w-3.5 h-3.5" /> Heavy Load
                  </div>
                  <span className="led-indicator led-amber" />
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Deadlines or test today. Lighten non-critical blocks.
                </p>
              </button>

              {/* Overwhelmed */}
              <button
                type="button"
                onClick={() => { sound.playClick(); setSelectedLevel('overwhelmed'); }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedLevel === 'overwhelmed'
                    ? 'liquid-glass-danger border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                    : 'liquid-glass-block border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-rose-400 uppercase">
                    <AlertTriangle className="w-3.5 h-3.5" /> Overwhelmed
                  </div>
                  <span className="led-indicator led-rose" />
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Fatigued. Shift heavy tasks to weekend, keep light review.
                </p>
              </button>

            </div>
          </div>

          {/* Physical Fader Slider for Stress Rating */}
          <div className="p-4 rounded-2xl liquid-glass-block space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-300">
              <span className="font-bold uppercase tracking-widest text-[10px]">
                Cognitive Fatigue / Stress Potentiometer
              </span>
              <span className="text-[#F0451E] font-bold text-sm">
                LEVEL {stressRating} / 5
              </span>
            </div>
            <FaderSlider
              value={stressRating}
              min={1}
              max={5}
              step={1}
              width="100%"
              variant="dark"
              leftLabel="1 - Relaxed"
              rightLabel="5 - Exhausted"
              onChange={(val) => setStressRating(val)}
            />
          </div>

          {/* Context Note */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
              Academic Context / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lab report due, exams approaching..."
              className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Ethical Disclaimer Warning */}
          <div className="p-3.5 rounded-2xl liquid-glass-block flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#F0451E] flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-300 font-mono leading-relaxed">
              <strong className="text-white">Academic Study Planning Notice:</strong> Mind Bridge AI redistributes study blocks to prevent fatigue. This tool does not provide medical or psychological diagnosis.
            </p>
          </div>

          {/* Result Alert if adapted */}
          {resultMessage && (
            <div className="p-3.5 rounded-2xl liquid-glass-emerald border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5 animate-fade-in font-mono">
              <CalendarCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-emerald-300 uppercase">Timetable Recalibrated</p>
                <p className="text-[11px] text-emerald-200/80">{resultMessage}</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3 relative z-10">
          <button
            type="button"
            onClick={() => { sound.playClick(); onClose(); }}
            className="btn-apple-glass py-2 px-4 text-xs font-semibold"
          >
            {resultMessage ? 'Close' : 'Cancel'}
          </button>
          
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleRecalibrate}
            className="btn-apple-primary py-2 px-5 text-xs font-semibold flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Recalibrating...' : 'Apply Adaptation'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
