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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="liquid-glass-card max-w-lg w-full p-6 sm:p-7 relative border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Daily Workload & Cognitive Pacing
              </h3>
              <p className="text-xs text-slate-400 leading-tight">
                Smart study reallocation based on your daily capacity
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5">
          
          {/* Workload Level Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 font-mono">
              Current Academic Load
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Light */}
              <button
                type="button"
                onClick={() => { sound.playClick(); setSelectedLevel('light'); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedLevel === 'light'
                    ? 'border-emerald-500/50 bg-emerald-500/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400">
                    <Smile className="w-4 h-4" /> Light Capacity
                  </div>
                  <span className="led-indicator led-emerald" />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Plenty of free time. Ready for intense focus sessions.
                </p>
              </button>

              {/* Balanced */}
              <button
                type="button"
                onClick={() => { sound.playClick(); setSelectedLevel('balanced'); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedLevel === 'balanced'
                    ? 'border-purple-500/50 bg-purple-500/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-purple-300">
                    <Meh className="w-4 h-4" /> Balanced Load
                  </div>
                  <span className="led-indicator led-violet" />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Standard college day. Maintain regular study pacing.
                </p>
              </button>

              {/* Heavy */}
              <button
                type="button"
                onClick={() => { sound.playClick(); setSelectedLevel('heavy'); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedLevel === 'heavy'
                    ? 'border-orange-500/50 bg-orange-500/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-orange-400">
                    <Frown className="w-4 h-4" /> Heavy Pressure
                  </div>
                  <span className="led-indicator led-amber" />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Deadlines or test today. Lighten non-critical blocks.
                </p>
              </button>

              {/* Overwhelmed */}
              <button
                type="button"
                onClick={() => { sound.playClick(); setSelectedLevel('overwhelmed'); }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedLevel === 'overwhelmed'
                    ? 'border-rose-500/50 bg-rose-500/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-400">
                    <AlertTriangle className="w-4 h-4" /> Overwhelmed
                  </div>
                  <span className="led-indicator led-rose" />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Fatigued. Shift heavy tasks to weekend, keep light review.
                </p>
              </button>

            </div>
          </div>

          {/* Stress Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Cognitive Fatigue / Stress Level: <span className="text-pink-400 font-bold">{stressRating} / 5</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {stressRating <= 2 ? 'Low Pressure' : stressRating === 3 ? 'Moderate' : 'High Load'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={stressRating}
              onChange={(e) => setStressRating(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>1 - Relaxed</span>
              <span>2</span>
              <span>3 - Average</span>
              <span>4</span>
              <span>5 - Exhausted</span>
            </div>
          </div>

          {/* Daily Context Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Academic Context (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lab report due, 3 back-to-back lectures..."
              className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Ethical Disclaimer Warning */}
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-purple-300 font-semibold">Academic Study Planning Notice:</strong> Mind Bridge AI redistributes study blocks to prevent fatigue and preserve retention. This tool does not provide medical or mental-health assessments.
            </p>
          </div>

          {/* Result Alert if adapted */}
          {resultMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5 animate-fade-in">
              <CalendarCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-300">Timetable Adapted Successfully!</p>
                <p className="text-[11px] text-emerald-200/80">{resultMessage}</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => { sound.playClick(); onClose(); }}
            className="btn-skeuo-glass px-4 py-2 text-xs"
          >
            {resultMessage ? 'Done' : 'Cancel'}
          </button>
          
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleRecalibrate}
            className="btn-skeuo-primary px-5 py-2 text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>{isProcessing ? 'Adapting Timetable...' : 'Apply Workload Adaptation'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
