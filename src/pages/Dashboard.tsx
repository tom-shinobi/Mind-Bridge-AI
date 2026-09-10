import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Target,
  Clock,
  FileCheck,
  RotateCw,
  CheckCircle2,
  Circle,
  HeartPulse,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type {
  StudentProfile,
  LearningGap,
  SyllabusTopic,
  TimetableBlock,
  Achievement
} from '../types';
import { RotaryKnob } from '../components/hardware/RotaryKnob';
import { FaderSlider } from '../components/hardware/FaderSlider';
import { HardwareButton } from '../components/hardware/HardwareButton';
import { ScrewRivet } from '../components/hardware/ScrewRivet';
import { StudyTimerWidget } from '../components/StudyTimerWidget';
import { sound } from '../services/soundService';

interface DashboardProps {
  profile: StudentProfile;
  gaps: LearningGap[];
  syllabus?: SyllabusTopic[];
  timetable: TimetableBlock[];
  achievements?: Achievement[];
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
  onOpenWorkloadModal: () => void;
  onToggleBlockComplete: (blockId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  gaps,
  timetable,
  onNavigate,
  onOpenWorkloadModal,
  onToggleBlockComplete
}) => {
  const criticalGap = gaps.find((g) => g.severity === 'critical') || gaps[0];

  // Hardware Console States
  const [leftMasteryKnob, setLeftMasteryKnob] = useState<number>(criticalGap?.masteryScore || 38);
  const [rightHoursKnob, setRightHoursKnob] = useState<number>(45); // 4.5 hrs
  const [gainFader, setGainFader] = useState<number>(75);
  const [mixFader, setMixFader] = useState<number>(50);
  const [filterLow, setFilterLow] = useState<number>(25);
  const [filterHigh, setFilterHigh] = useState<number>(75);
  const [consoleMode, setConsoleMode] = useState<'LINK' | 'AUTO_LOOP' | 'MANUAL'>('AUTO_LOOP');

  // Today's blocks (Monday for demo)
  const todayBlocks = timetable.filter((b) => b.dayOfWeek === 'Monday');

  const handleSyncGaps = () => {
    sound.playSuccess();
    onNavigate('tutor', { topic: criticalGap?.topic });
  };

  const handleSyncTimetable = () => {
    sound.playSuccess();
    onNavigate('tests', { topic: criticalGap?.topic });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-6xl mx-auto">
      
      {/* ==========================================================================
          ICONIC TEENAGE ENGINEERING / ANALOG HARDWARE SYNTHESIZER CONSOLE
          Matches the reference image: Dual-Tone split chalk & vermilion chassis,
          rotary potentiometers, central faders, and tactile rocker buttons.
          ========================================================================== */}
      <div className="hardware-chassis relative">
        
        {/* Hardware Corner Screws */}
        <ScrewRivet className="absolute top-4 left-4 z-20" angle={30} />
        <ScrewRivet className="absolute top-4 right-4 z-20" angle={120} />
        <ScrewRivet className="absolute bottom-4 left-4 z-20" angle={75} />
        <ScrewRivet className="absolute bottom-4 right-4 z-20" angle={15} />

        {/* Console Top Header Control Bar */}
        <div className="relative z-10 px-6 sm:px-8 pt-5 pb-3 flex flex-wrap items-center justify-between border-b border-black/20 bg-gradient-to-b from-black/40 to-transparent">
          
          {/* Top-Left Hardware Fastener + Brand */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border border-white/20 bg-black/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
            </div>
            <div>
              <span className="font-mono font-extrabold text-xs tracking-widest text-white uppercase">
                MIND BRIDGE AI // CONSOLE MK-IV
              </span>
              <p className="text-[9px] font-mono text-slate-400 tracking-wider uppercase">
                Dual-Channel Academic Adaptation Engine
              </p>
            </div>
          </div>

          {/* Segmented Rocker Well: LINK, AUTO_LOOP, MANUAL */}
          <div className="segmented-well my-1">
            <button
              onClick={() => { sound.playClick(); setConsoleMode('LINK'); }}
              className={`px-3 py-1 text-[10px] font-mono font-bold tracking-wider rounded uppercase transition-all ${
                consoleMode === 'LINK'
                  ? 'bg-[#ECEAE6] text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LINK
            </button>
            <button
              onClick={() => { sound.playClick(); setConsoleMode('AUTO_LOOP'); }}
              className={`px-3 py-1 text-[10px] font-mono font-bold tracking-wider rounded uppercase transition-all ${
                consoleMode === 'AUTO_LOOP'
                  ? 'bg-[#F0451E] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AUTO LOOP
            </button>
            <button
              onClick={() => { sound.playClick(); setConsoleMode('MANUAL'); }}
              className={`px-3 py-1 text-[10px] font-mono font-bold tracking-wider rounded uppercase transition-all ${
                consoleMode === 'MANUAL'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MANUAL
            </button>
          </div>

          {/* Top-Right Circular Navigation Buttons (<, >) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { sound.playClick(); onNavigate('history'); }}
              className="w-7 h-7 rounded-full bg-[#1C1D22] border border-white/10 hover:border-white/30 text-white flex items-center justify-center shadow-inner"
              title="Previous Channel: Academic History"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { sound.playClick(); onNavigate('timetable'); }}
              className="w-7 h-7 rounded-full bg-[#1C1D22] border border-white/10 hover:border-white/30 text-white flex items-center justify-center shadow-inner"
              title="Next Channel: Timetable Engine"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Dual-Tone Main Deck (Split 50/50 down the middle) */}
        <div className="grid grid-cols-1 md:grid-cols-2 relative">
          
          {/* ==============================================================
              LEFT CHANNEL (Industrial Matte Chalk Cream)
              Dedicated to Academic Grounding, Gaps & Socratic Diagnostics
              ============================================================== */}
          <div className="chassis-panel-left p-6 sm:p-10 flex flex-col justify-between min-h-[380px] border-b md:border-b-0">
            
            {/* Channel Subheader */}
            <div className="flex items-center justify-between">
              <span className="hw-label hw-label-light opacity-70">
                CH-1 // GAP DIAGNOSTICS
              </span>
              <span className="text-[10px] font-mono font-bold text-black bg-black/10 px-2 py-0.5 rounded">
                CRITICAL GAP: {criticalGap?.masteryScore}%
              </span>
            </div>

            {/* Rotary Potentiometer for Gap Mastery */}
            <div className="my-6 flex flex-col items-center justify-center">
              <RotaryKnob
                value={leftMasteryKnob}
                min={0}
                max={100}
                size="lg"
                variant="chalk"
                label="LEFT"
                subLabel={`${criticalGap?.topic || 'B-Trees & Indexing'}`}
                onChange={(val) => setLeftMasteryKnob(val)}
              />
              <p className="text-[11px] font-mono text-slate-700 mt-2 max-w-xs text-center leading-tight">
                Identified deficiency in Midterm Exam. Calibrate knob to test response curve.
              </p>
            </div>

            {/* Bottom Push Button: SYNC */}
            <div className="flex justify-center pt-2">
              <HardwareButton
                label="SYNC TUTOR"
                variant="light"
                onClick={handleSyncGaps}
                className="px-6 py-2 shadow-md"
              />
            </div>

          </div>

          {/* ==============================================================
              RIGHT CHANNEL (Vibrant Vermilion Orange-Red)
              Dedicated to Adaptive Engine, Timetable & Study Pacing
              ============================================================== */}
          <div className="chassis-panel-right p-6 sm:p-10 flex flex-col justify-between min-h-[380px]">
            
            {/* Channel Subheader */}
            <div className="flex items-center justify-between">
              <span className="hw-label hw-label-dark opacity-90">
                CH-2 // ADAPTIVE ENGINE
              </span>
              <span className="text-[10px] font-mono font-bold text-white bg-black/20 px-2 py-0.5 rounded">
                LOAD TARGET: {(rightHoursKnob / 10).toFixed(1)} HRS
              </span>
            </div>

            {/* Rotary Potentiometer for Adaptive Hours */}
            <div className="my-6 flex flex-col items-center justify-center">
              <RotaryKnob
                value={rightHoursKnob}
                min={10}
                max={80}
                step={5}
                size="lg"
                variant="vermilion"
                label="RIGHT"
                subLabel="Adaptive Study Load (Hours/Day)"
                onChange={(val) => setRightHoursKnob(val)}
              />
              <p className="text-[11px] font-mono text-white/80 mt-2 max-w-xs text-center leading-tight">
                Dynamically weighted for weak topics with auto-rebalancing across the week.
              </p>
            </div>

            {/* Bottom Push Button: SYNC */}
            <div className="flex justify-center pt-2">
              <HardwareButton
                label="SYNC TEST"
                variant="dark"
                onClick={handleSyncTimetable}
                className="px-6 py-2 shadow-md"
              />
            </div>

          </div>

          {/* ==============================================================
              CENTER CONTROL STRIP (Faders: GAIN, MIX, LPASS / HPASS)
              Positioned over the seam between left & right panels
              ============================================================== */}
          <div className="md:absolute left-1/2 top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-20 p-4 rounded-2xl bg-[#141519]/95 border-2 border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.85)] flex flex-col gap-4 my-4 md:my-0 mx-4 md:mx-0">
            
            {/* Gain Fader */}
            <FaderSlider
              value={gainFader}
              min={0}
              max={100}
              label="GAIN"
              width={160}
              variant="dark"
              onChange={(val) => setGainFader(val)}
            />

            {/* Mix Fader */}
            <FaderSlider
              value={mixFader}
              min={0}
              max={100}
              label="MIX"
              width={160}
              variant="dark"
              onChange={(val) => setMixFader(val)}
            />

            {/* Filter Module (LPASS / HPASS) */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                  LPASS
                </span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={filterLow}
                  onChange={(e) => setFilterLow(Number(e.target.value))}
                  className="w-16 h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-slate-300"
                />
                <span className="text-[8px] font-mono text-slate-500 mt-0.5">0 Hz</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                  HPASS
                </span>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={filterHigh}
                  onChange={(e) => setFilterHigh(Number(e.target.value))}
                  className="w-16 h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-[#F0451E]"
                />
                <span className="text-[8px] font-mono text-slate-500 mt-0.5">20 kHz</span>
              </div>
            </div>

          </div>

        </div>

        {/* Console Bottom Telemetry Bar */}
        <div className="bg-[#0B0C0E] border-t border-white/10 px-6 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="led-indicator led-emerald" />
              SYSTEM STATUS: CALIBRATED
            </span>
            <span>•</span>
            <span>XP MULTIPLIER: {gainFader}%</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { sound.playClick(); onOpenWorkloadModal(); }}
              className="hover:text-white flex items-center gap-1.5 text-[11px] uppercase transition-colors"
            >
              <HeartPulse className="w-3.5 h-3.5 text-pink-400" />
              <span>Workload Check-in</span>
            </button>
            <span>•</span>
            <button
              onClick={() => { sound.playClick(); onNavigate('adaptive_loop'); }}
              className="hover:text-white flex items-center gap-1.5 text-[11px] uppercase transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-purple-400" />
              <span>Inspect Closed Loop</span>
            </button>
          </div>
        </div>

      </div>

      {/* ==========================================================================
          ACADEMIC MISSION STATUS & REASONING:
          "What should I study today, and why?"
          ========================================================================== */}
      <div className="liquid-glass-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Today's Prescribed Study Mission
            </h3>
          </div>
          <span className="text-xs text-purple-300 font-mono">
            Autonomous Prescription for {profile.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
              Focus Subject: <span className="text-[#F0451E]">{criticalGap?.topic}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Why this was chosen: </strong>
              {criticalGap?.rootCause || 'Detected 38% mastery deficiency in Midterm Exam. Remediating this now unlocks upcoming relational query optimization.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-200">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                1. Socratic Explanation
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="flex items-center gap-1.5 text-[#F0451E]">
                <span className="w-2 h-2 rounded-full bg-[#F0451E]" />
                2. Concept Checks
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                3. Auto-Adapt Schedule
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => { sound.playClick(); onNavigate('tutor', { topic: criticalGap?.topic }); }}
              className="btn-skeuo-primary w-full py-3 px-4 text-xs font-bold"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Tutor Session</span>
            </button>

            <button
              onClick={() => { sound.playClick(); onNavigate('tests', { topic: criticalGap?.topic }); }}
              className="btn-skeuo-orange w-full py-3 px-4 text-xs font-bold"
            >
              <FileCheck className="w-4 h-4" />
              <span>Take Diagnostic Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================================================
          METRICS & LIVE STOPWATCH HARDWARE DECK
          ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Adaptive Schedule */}
        <div className="lg:col-span-2 liquid-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Today's Adaptive Academic Timetable
              </h3>
            </div>
            <button
              onClick={() => { sound.playClick(); onNavigate('timetable'); }}
              className="text-xs text-purple-300 hover:text-white font-mono flex items-center gap-1"
            >
              <span>Full Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayBlocks.map((block) => (
              <div
                key={block.id}
                className={`p-4 rounded-xl border transition-all ${
                  block.completed
                    ? 'bg-white/[0.02] border-white/5 opacity-55'
                    : block.isAdaptive
                    ? 'bg-[#181A22] border-[#F0451E]/40 shadow-md'
                    : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onToggleBlockComplete(block.id);
                      }}
                      className="mt-0.5 text-slate-400 hover:text-purple-300"
                    >
                      {block.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {block.startTime} - {block.endTime}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/40 text-slate-300 border border-white/10">
                          {block.blockType.replace('_', ' ')}
                        </span>
                        {block.isAdaptive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#F0451E]/20 text-[#FF6340] border border-[#F0451E]/30">
                            Adaptive Block
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-semibold ${block.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {block.topic}
                      </p>
                      <p className="text-xs text-purple-300/80 font-mono">{block.subject}</p>
                    </div>
                  </div>

                  {!block.completed && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onNavigate('tutor', { topic: block.topic });
                      }}
                      className="btn-skeuo-glass py-1.5 px-3 text-[11px] whitespace-nowrap"
                    >
                      Start
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Focus Stopwatch & Active Gaps */}
        <div className="space-y-6">
          <StudyTimerWidget />

          <div className="liquid-glass-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Identified Gaps ({gaps.length})
                </h4>
              </div>
              <button
                onClick={() => { sound.playClick(); onNavigate('gaps'); }}
                className="text-[10px] font-mono text-purple-300 hover:text-white"
              >
                View Diagnostics
              </button>
            </div>

            <div className="space-y-2.5">
              {gaps.slice(0, 3).map((gap) => (
                <div key={gap.id} className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate pr-2">{gap.topic}</span>
                    <span className="font-mono text-[10px] font-bold text-rose-400">{gap.masteryScore}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${gap.masteryScore < 50 ? 'bg-rose-500' : 'bg-orange-500'}`}
                      style={{ width: `${gap.masteryScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
