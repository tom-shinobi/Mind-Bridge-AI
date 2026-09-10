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
import { RefractiveLens } from '../components/RefractiveLens';
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
    <div className="space-y-10 animate-fade-in pb-20 max-w-6xl mx-auto">
      
      {/* ==========================================================================
          APPLE WEBSITE KEYNOTE HERO PRESENTATION (Matching iPhone Duo Reference)
          Clean Apple typography, crisp pill action buttons, and 3D Refractive Liquid Glass
          ========================================================================== */}
      <div className="py-8 sm:py-12 flex flex-col items-center text-center space-y-4 max-w-4xl mx-auto">
        
        <span className="text-[11px] uppercase font-mono font-medium tracking-widest text-[#A1A1A6] px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md shadow-sm">
          MindBridge Pro // Generation 6
        </span>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white font-heading leading-tight">
          Personal learning.<br className="hidden sm:inline" /> Mastered.
        </h1>

        <p className="text-base sm:text-xl text-[#A1A1A6] max-w-2xl mx-auto font-normal leading-relaxed">
          The most advanced academic intelligence ever built. Autonomous, adaptive, diagnostic.<br className="hidden sm:inline" /> Featuring real-time academic intelligence for ultimate mastery.
        </p>

        <p className="text-xs text-[#86868B] font-mono tracking-wider">
          B.Tech Computer Science & Engineering • Target CGPA 9.0 • Semester 6
        </p>

        {/* Apple Keynote CTA Pill Buttons (Matching iPhone Duo "Learn more" & "View pricing") */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
          <button
            onClick={() => { sound.playClick(); onNavigate('tutor', { topic: criticalGap?.topic }); }}
            className="btn-apple-primary px-8 py-3.5 text-sm flex items-center gap-2 group shadow-xl"
          >
            <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            <span>Launch AI Tutor</span>
          </button>

          <button
            onClick={() => { sound.playClick(); onNavigate('tests', { topic: criticalGap?.topic }); }}
            className="btn-apple-glass px-8 py-3.5 text-sm flex items-center gap-2 shadow-xl"
          >
            <FileCheck className="w-4 h-4 text-white/90" />
            <span>Take Diagnostic Quiz</span>
          </button>
        </div>

        {/* Real 3D Optical Liquid Glass Refraction Sphere (Matching Reference Image 2) */}
        <div className="pt-8 relative flex flex-col items-center">
          <RefractiveLens
            size={200}
            badge="Top Priority Gap"
            label={criticalGap?.topic || 'B-Trees & Indexing'}
            onClick={() => { sound.playClick(); onNavigate('tutor', { topic: criticalGap?.topic }); }}
          />
          <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-[#A1A1A6] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38BDF8] animate-pulse" />
            <span>Real Optical Liquid Glass Lens • Tap to engage Socratic Dialogue</span>
          </div>
        </div>

      </div>
      
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
          ACADEMIC MISSION STATUS & REASONING (Apple Keynote Feature Presentation)
          ========================================================================== */}
      <div className="apple-liquid-glass p-6 sm:p-8 space-y-5 border border-white/20">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <span>Today's Prescribed Study Mission</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono border border-white/20">
                Autonomous
              </span>
            </h3>
          </div>
          <span className="text-xs text-[#A1A1A6] font-mono">
            Prescription for {profile.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-tight font-heading">
              Focus Subject: <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">{criticalGap?.topic}</span>
            </h4>
            <p className="text-sm text-[#A1A1A6] leading-relaxed">
              <strong className="text-white">Why this was chosen: </strong>
              {criticalGap?.rootCause || 'Detected 38% mastery deficiency in Midterm Exam. Remediating this now unlocks upcoming relational query optimization.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-[#A1A1A6]">
              <span className="flex items-center gap-1.5 text-white font-medium">
                <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                1. Socratic Explanation
              </span>
              <ArrowRight className="w-3 h-3 text-[#86868B]" />
              <span className="flex items-center gap-1.5 text-pink-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_6px_#F472B6]" />
                2. Concept Checks
              </span>
              <ArrowRight className="w-3 h-3 text-[#86868B]" />
              <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
                3. Auto-Adapt Schedule
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { sound.playClick(); onNavigate('tutor', { topic: criticalGap?.topic }); }}
              className="btn-apple-primary w-full py-3 px-5 text-xs font-medium flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Launch AI Tutor Session</span>
            </button>

            <button
              onClick={() => { sound.playClick(); onNavigate('tests', { topic: criticalGap?.topic }); }}
              className="btn-apple-glass w-full py-3 px-5 text-xs font-medium flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-white/90" />
              <span>Take Diagnostic Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================================================
          METRICS & LIVE STOPWATCH HARDWARE DECK (2-Column Apple-Clean Workspace)
          ========================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Adaptive Schedule */}
        <div className="lg:col-span-2 apple-liquid-glass p-6 sm:p-8 space-y-4 border border-white/20">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/90" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white font-mono">
                Today's Adaptive Academic Timetable
              </h3>
            </div>
            <button
              onClick={() => { sound.playClick(); onNavigate('timetable'); }}
              className="text-xs text-[#A1A1A6] hover:text-white font-mono flex items-center gap-1 transition-colors"
            >
              <span>Full Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayBlocks.map((block) => (
              <div
                key={block.id}
                className={`p-4 rounded-2xl border transition-all ${
                  block.completed
                    ? 'bg-white/[0.02] border-white/5 opacity-40'
                    : block.isAdaptive
                    ? 'bg-white/[0.08] border-white/30 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
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
                      className="mt-0.5 text-[#86868B] hover:text-white transition-colors"
                    >
                      {block.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-white/50 hover:text-white" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-semibold text-white">
                          {block.startTime} - {block.endTime}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-white/10 text-white/80 border border-white/15">
                          {block.blockType.replace('_', ' ')}
                        </span>
                        {block.isAdaptive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-pink-500/20 text-pink-300 border border-pink-400/30">
                            Adaptive Block
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-semibold ${block.completed ? 'line-through text-[#86868B]' : 'text-white'}`}>
                        {block.topic}
                      </p>
                      <p className="text-xs text-[#A1A1A6] font-mono mt-0.5">{block.subject}</p>
                    </div>
                  </div>

                  {!block.completed && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onNavigate('tutor', { topic: block.topic });
                      }}
                      className="btn-apple-glass py-1.5 px-3.5 text-xs whitespace-nowrap"
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

          <div className="apple-liquid-glass p-5 space-y-3.5 border border-white/20">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-pink-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F5F7] font-mono">
                  Identified Gaps ({gaps.length})
                </h4>
              </div>
              <button
                onClick={() => { sound.playClick(); onNavigate('gaps'); }}
                className="text-[10px] font-mono text-[#A1A1A6] hover:text-white"
              >
                View Diagnostics
              </button>
            </div>

            <div className="space-y-2.5">
              {gaps.slice(0, 3).map((gap) => (
                <div key={gap.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#F5F5F7] truncate pr-2">{gap.topic}</span>
                    <span className="font-mono text-[10px] font-bold text-pink-400">{gap.masteryScore}%</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/10">
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
          APPLE BENTO GRID PODS (3-Pod Feature Dock)
          ========================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Bento 1: Curriculum Mastery */}
        <div className="apple-liquid-glass p-6 space-y-3 border border-white/20 hover:border-white/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-[#A1A1A6] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Syllabus Intel
            </span>
            <span className="text-[10px] font-mono text-white font-semibold">71% Verified</span>
          </div>
          <h4 className="text-base font-semibold text-white font-heading">Semester Core Syllabus</h4>
          <p className="text-xs text-[#A1A1A6] leading-relaxed">
            10 of 14 core modules master-verified. Next target: DBMS Relational Query Optimization.
          </p>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mt-3">
            <div className="h-full rounded-full bg-white" style={{ width: '71%' }} />
          </div>
        </div>

        {/* Bento 2: Cognitive Load Shield */}
        <div className="apple-liquid-glass p-6 space-y-3 border border-white/20 hover:border-white/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-[#A1A1A6] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Adaptive Bio-Guard
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Optimal
            </span>
          </div>
          <h4 className="text-base font-semibold text-white font-heading">Cognitive Load Balance</h4>
          <p className="text-xs text-[#A1A1A6] leading-relaxed">
            Fatigue shield active. 4.5h scheduled today with 3 Pomodoro recovery intervals.
          </p>
          <button
            onClick={() => { sound.playClick(); onOpenWorkloadModal(); }}
            className="text-[11px] font-mono text-white/80 hover:text-white flex items-center gap-1 pt-1"
          >
            <span>Adjust Parameters →</span>
          </button>
        </div>

        {/* Bento 3: Active Quest */}
        <div className="apple-liquid-glass p-6 space-y-3 border border-white/20 hover:border-white/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold text-[#A1A1A6] uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              Scholar Quest
            </span>
            <span className="text-[10px] font-mono text-amber-300 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-300" />
              +150 XP
            </span>
          </div>
          <h4 className="text-base font-semibold text-white font-heading">B-Tree Conqueror</h4>
          <p className="text-xs text-[#A1A1A6] leading-relaxed">
            Complete 1 Socratic tutor dialogue and score &gt;75% on B-Tree quiz to earn Silver Scholar badge.
          </p>
          <button
            onClick={() => { sound.playClick(); onNavigate('progress'); }}
            className="text-[11px] font-mono text-white/80 hover:text-white flex items-center gap-1 pt-1"
          >
            <span>View All Quests & XP Tree →</span>
          </button>
        </div>

      </div>

    </div>
  );
};
