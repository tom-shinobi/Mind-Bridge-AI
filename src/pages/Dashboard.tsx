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
  ChevronRight,
  BookOpen,
  Trophy,
  ShieldCheck,
  Zap
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
          SEA-BLUE CONSOLE MK-V HARDWARE SYNTHESIZER
          Modern skeuomorphic console: Soft Sea-Mist Cream + Electric Anime Sea-Azure
          Dual-Channel Academic Adaptation Engine with rotary dials and central faders
          ========================================================================== */}
      <div className="hardware-chassis relative select-none">
        
        {/* Hardware Corner Screws */}
        <ScrewRivet className="absolute top-4 left-4 z-20" angle={30} />
        <ScrewRivet className="absolute top-4 right-4 z-20" angle={120} />
        <ScrewRivet className="absolute bottom-4 left-4 z-20" angle={75} />
        <ScrewRivet className="absolute bottom-4 right-4 z-20" angle={15} />

        {/* Console Top Header Control Bar */}
        <div className="relative z-10 px-6 sm:px-8 pt-5 pb-3 flex flex-wrap items-center justify-between border-b border-cyan-500/20 bg-gradient-to-b from-[#051322]/80 to-transparent">
          
          {/* Top-Left Hardware Fastener + Brand */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border border-cyan-400/40 bg-[#06182c] flex items-center justify-center shadow-inner">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38BDF8] animate-pulse" />
            </div>
            <div>
              <span className="font-mono font-extrabold text-xs tracking-widest text-cyan-200 uppercase flex items-center gap-2">
                <span>MIND BRIDGE AI // CONSOLE MK-V</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-400/30">
                  AUTONOMOUS
                </span>
              </span>
              <p className="text-[9px] font-mono text-cyan-400/70 tracking-wider uppercase">
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
                  ? 'bg-cyan-400 text-cyan-950 shadow-[0_0_10px_#38BDF8]'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              LINK
            </button>
            <button
              onClick={() => { sound.playClick(); setConsoleMode('AUTO_LOOP'); }}
              className={`px-3 py-1 text-[10px] font-mono font-bold tracking-wider rounded uppercase transition-all ${
                consoleMode === 'AUTO_LOOP'
                  ? 'bg-[#0284C7] text-white shadow-[0_0_10px_#0284C7]'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              AUTO LOOP
            </button>
            <button
              onClick={() => { sound.playClick(); setConsoleMode('MANUAL'); }}
              className={`px-3 py-1 text-[10px] font-mono font-bold tracking-wider rounded uppercase transition-all ${
                consoleMode === 'MANUAL'
                  ? 'bg-pink-500 text-white shadow-[0_0_10px_#F472B6]'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              MANUAL
            </button>
          </div>

          {/* Top-Right Circular Navigation Buttons (<, >) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { sound.playClick(); onNavigate('history'); }}
              className="w-7 h-7 rounded-full bg-[#0a233d] border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 flex items-center justify-center shadow-inner hover:shadow-[0_0_8px_rgba(6,182,212,0.3)] transition-all"
              title="Previous Channel: Academic History"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { sound.playClick(); onNavigate('timetable'); }}
              className="w-7 h-7 rounded-full bg-[#0a233d] border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 flex items-center justify-center shadow-inner hover:shadow-[0_0_8px_rgba(6,182,212,0.3)] transition-all"
              title="Next Channel: Timetable Engine"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Dual-Tone Main Deck (Split 50/50 down the middle) */}
        <div className="grid grid-cols-1 md:grid-cols-2 relative">
          
          {/* ==============================================================
              LEFT CHANNEL (Soft Sea-Mist Cream Chassis)
              Dedicated to Academic Grounding, Gaps & Socratic Diagnostics
              ============================================================== */}
          <div className="chassis-panel-left p-6 sm:p-10 flex flex-col justify-between min-h-[380px] border-b md:border-b-0">
            
            {/* Channel Subheader */}
            <div className="flex items-center justify-between">
              <span className="hw-label hw-label-light text-cyan-900 font-bold opacity-80">
                CH-1 // GAP DIAGNOSTICS
              </span>
              <span className="text-[10px] font-mono font-bold text-cyan-950 bg-cyan-200/80 px-2 py-0.5 rounded shadow-sm border border-cyan-300">
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
                variant="ocean"
                label="GAP MASTERY"
                subLabel={`${criticalGap?.topic || 'B-Trees & Indexing'}`}
                onChange={(val) => setLeftMasteryKnob(val)}
              />
              <p className="text-[11px] font-mono text-cyan-950/80 mt-2 max-w-xs text-center leading-tight">
                Deficiency identified in Midterm Exam. Calibrate knob to test Socratic response curve.
              </p>
            </div>

            {/* Bottom Push Button: SYNC */}
            <div className="flex justify-center pt-2">
              <HardwareButton
                label="SYNC SOCRATIC TUTOR"
                variant="light"
                onClick={handleSyncGaps}
                className="px-6 py-2 shadow-md border-cyan-300"
              />
            </div>

          </div>

          {/* ==============================================================
              RIGHT CHANNEL (Vibrant Anime Sea-Azure Chassis)
              Dedicated to Adaptive Engine, Timetable & Study Pacing
              ============================================================== */}
          <div className="chassis-panel-right p-6 sm:p-10 flex flex-col justify-between min-h-[380px]">
            
            {/* Channel Subheader */}
            <div className="flex items-center justify-between">
              <span className="hw-label hw-label-dark text-white opacity-95">
                CH-2 // ADAPTIVE ENGINE
              </span>
              <span className="text-[10px] font-mono font-bold text-white bg-black/30 px-2 py-0.5 rounded border border-white/20">
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
                variant="sakura"
                label="STUDY LOAD"
                subLabel="Adaptive Hours / Day"
                onChange={(val) => setRightHoursKnob(val)}
              />
              <p className="text-[11px] font-mono text-cyan-100/90 mt-2 max-w-xs text-center leading-tight">
                Dynamically weighted for weak topics with auto-rebalancing across the week.
              </p>
            </div>

            {/* Bottom Push Button: SYNC */}
            <div className="flex justify-center pt-2">
              <HardwareButton
                label="SYNC DIAGNOSTIC TEST"
                variant="dark"
                onClick={handleSyncTimetable}
                className="px-6 py-2 shadow-md border-white/30"
              />
            </div>

          </div>

          {/* ==============================================================
              CENTER CONTROL STRIP (Faders: GAIN, MIX, LPASS / HPASS)
              Sleek dark oceanic glass console over the seam
              ============================================================== */}
          <div className="md:absolute left-1/2 top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-20 p-4 rounded-2xl bg-[#06182c]/95 border-2 border-cyan-400/30 shadow-[0_12px_32px_rgba(2,10,24,0.85)] flex flex-col gap-4 my-4 md:my-0 mx-4 md:mx-0 backdrop-blur-xl">
            
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
            <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between gap-2">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono text-cyan-300 font-bold uppercase">
                  LPASS
                </span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={filterLow}
                  onChange={(e) => setFilterLow(Number(e.target.value))}
                  className="w-16 h-1.5 bg-[#030d17] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[8px] font-mono text-slate-400 mt-0.5">0 Hz</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono text-pink-400 font-bold uppercase">
                  HPASS
                </span>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={filterHigh}
                  onChange={(e) => setFilterHigh(Number(e.target.value))}
                  className="w-16 h-1.5 bg-[#030d17] rounded-lg appearance-none cursor-pointer accent-pink-400"
                />
                <span className="text-[8px] font-mono text-slate-400 mt-0.5">20 kHz</span>
              </div>
            </div>

          </div>

        </div>

        {/* Console Bottom Telemetry Bar */}
        <div className="bg-[#051322] border-t border-cyan-500/20 px-6 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-cyan-200">
              <span className="led-indicator led-emerald" />
              SYSTEM STATUS: AUTONOMOUS & OPTIMAL
            </span>
            <span className="text-cyan-600">•</span>
            <span className="text-amber-300 font-bold">XP MULTIPLIER: {gainFader}%</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { sound.playClick(); onOpenWorkloadModal(); }}
              className="hover:text-pink-300 flex items-center gap-1.5 text-[11px] uppercase transition-colors text-pink-400"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Workload Check-in</span>
            </button>
            <span className="text-cyan-600">•</span>
            <button
              onClick={() => { sound.playClick(); onNavigate('adaptive_loop'); }}
              className="hover:text-cyan-200 flex items-center gap-1.5 text-[11px] uppercase transition-colors text-cyan-400"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Inspect Closed Loop</span>
            </button>
          </div>
        </div>

      </div>

      {/* ==========================================================================
          ACADEMIC MISSION STATUS & REASONING:
          "What should I study today, and why?"
          ========================================================================== */}
      <div className="sea-glass-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <span>Today's Prescribed Study Mission</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-semibold">
                Autonomous
              </span>
            </h3>
          </div>
          <span className="text-xs text-cyan-300/80 font-mono">
            Tailored Prescription for {profile.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
              Focus Subject: <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-pink-400">{criticalGap?.topic}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-cyan-200">Why this was chosen: </strong>
              {criticalGap?.rootCause || 'Detected 38% mastery deficiency in Midterm Exam. Remediating this now unlocks upcoming relational query optimization.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#38BDF8]" />
                1. Socratic Explanation
              </span>
              <ArrowRight className="w-3 h-3 text-cyan-600" />
              <span className="flex items-center gap-1.5 text-pink-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_6px_#F472B6]" />
                2. Concept Checks
              </span>
              <ArrowRight className="w-3 h-3 text-cyan-600" />
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
                3. Auto-Adapt Schedule
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => { sound.playClick(); onNavigate('tutor', { topic: criticalGap?.topic }); }}
              className="btn-skeuo-sea w-full py-3 px-4 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Launch AI Tutor Session</span>
            </button>

            <button
              onClick={() => { sound.playClick(); onNavigate('tests', { topic: criticalGap?.topic }); }}
              className="btn-skeuo-sakura w-full py-3 px-4 text-xs font-bold flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-pink-200" />
              <span>Take Diagnostic Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================================================
          METRICS & LIVE STOPWATCH HARDWARE DECK (2-Column Organized Workspace)
          ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Adaptive Schedule */}
        <div className="lg:col-span-2 sea-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Today's Adaptive Academic Timetable
              </h3>
            </div>
            <button
              onClick={() => { sound.playClick(); onNavigate('timetable'); }}
              className="text-xs text-cyan-300 hover:text-white font-mono flex items-center gap-1 transition-colors"
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
                    ? 'bg-[#06182c]/40 border-cyan-500/10 opacity-55'
                    : block.isAdaptive
                    ? 'bg-[#0a2747]/80 border-cyan-400/40 shadow-[0_4px_16px_rgba(6,182,212,0.15)]'
                    : 'bg-[#071d34]/60 border-cyan-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onToggleBlockComplete(block.id);
                      }}
                      className="mt-0.5 text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      {block.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-cyan-400/60 hover:text-cyan-300" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-cyan-200">
                          {block.startTime} - {block.endTime}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#06182c] text-slate-300 border border-cyan-500/30">
                          {block.blockType.replace('_', ' ')}
                        </span>
                        {block.isAdaptive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-pink-500/20 text-pink-300 border border-pink-400/30">
                            Adaptive Block
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-semibold ${block.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {block.topic}
                      </p>
                      <p className="text-xs text-cyan-300/80 font-mono">{block.subject}</p>
                    </div>
                  </div>

                  {!block.completed && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onNavigate('tutor', { topic: block.topic });
                      }}
                      className="btn-skeuo-glass py-1.5 px-3 text-[11px] whitespace-nowrap text-cyan-200 border-cyan-500/30 hover:border-cyan-400"
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

          <div className="sea-glass-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-pink-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Identified Gaps ({gaps.length})
                </h4>
              </div>
              <button
                onClick={() => { sound.playClick(); onNavigate('gaps'); }}
                className="text-[10px] font-mono text-cyan-300 hover:text-white"
              >
                View Diagnostics
              </button>
            </div>

            <div className="space-y-2.5">
              {gaps.slice(0, 3).map((gap) => (
                <div key={gap.id} className="p-2.5 rounded-xl bg-[#06182c]/80 border border-cyan-500/20 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate pr-2">{gap.topic}</span>
                    <span className="font-mono text-[10px] font-bold text-pink-400">{gap.masteryScore}%</span>
                  </div>
                  <div className="w-full bg-[#030e1a] rounded-full h-1.5 overflow-hidden border border-cyan-500/10">
                    <div
                      className={`h-full rounded-full ${
                        gap.masteryScore < 45
                          ? 'bg-gradient-to-r from-pink-500 to-rose-400'
                          : gap.masteryScore < 70
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                      }`}
                      style={{ width: `${gap.masteryScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ==========================================================================
          DECLUTTERED TELEMETRY INSIGHT PODS (Bottom 3-Pod Dock)
          ========================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Pod 1: Curriculum Mastery */}
        <div className="sea-glass-card p-5 space-y-2.5 border border-cyan-500/20 hover:border-cyan-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Syllabus Intel
            </span>
            <span className="text-[10px] font-mono text-cyan-300 font-bold">71% Verified</span>
          </div>
          <h4 className="text-sm font-bold text-white">Semester Core Syllabus</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            10 of 14 core modules master-verified. Next target: DBMS Relational Query Optimization.
          </p>
          <div className="w-full bg-[#06182c] rounded-full h-2 overflow-hidden border border-cyan-500/20 mt-2">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: '71%' }} />
          </div>
        </div>

        {/* Pod 2: Cognitive Load Shield */}
        <div className="sea-glass-card p-5 space-y-2.5 border border-emerald-500/20 hover:border-emerald-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Adaptive Bio-Guard
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Optimal
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">Cognitive Load Balance</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Fatigue shield active. 4.5h scheduled today with 3 Pomodoro recovery intervals.
          </p>
          <button
            onClick={() => { sound.playClick(); onOpenWorkloadModal(); }}
            className="text-[10px] font-mono text-emerald-300 hover:text-white flex items-center gap-1 pt-1"
          >
            <span>Adjust Workload Parameters →</span>
          </button>
        </div>

        {/* Pod 3: Active Anime Quest */}
        <div className="sea-glass-card p-5 space-y-2.5 border border-pink-500/20 hover:border-pink-400/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              Anime Scholar Quest
            </span>
            <span className="text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-300" />
              +150 XP
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">B-Tree Conqueror</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Complete 1 Socratic tutor dialogue and score &gt;75% on B-Tree quiz to earn Silver Scholar badge.
          </p>
          <button
            onClick={() => { sound.playClick(); onNavigate('progress'); }}
            className="text-[10px] font-mono text-pink-300 hover:text-white flex items-center gap-1 pt-1"
          >
            <span>View All Quests & XP Tree →</span>
          </button>
        </div>

      </div>

    </div>
  );
};
