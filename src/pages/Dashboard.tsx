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

  // Adaptive Command Deck State
  const [leftMasteryKnob, setLeftMasteryKnob] = useState<number>(criticalGap?.masteryScore || 38);
  const [rightHoursKnob, setRightHoursKnob] = useState<number>(45); // 4.5 hrs
  const [deckMode, setDeckMode] = useState<'AUTO_LOOP' | 'PRECISION' | 'CALIBRATE'>('AUTO_LOOP');

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

        {/* Apple Keynote CTA Pill Buttons */}
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

        {/* Real 3D Optical Liquid Glass Refraction Sphere */}
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
          APPLE LIQUID GLASS ADAPTIVE COMMAND DECK
          Sleek frosted glass deck with bilateral symmetry and dual rotary controllers
          ========================================================================== */}
      <div className="apple-liquid-glass p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-3xl">
        
        {/* Command Deck Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#38BDF8] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-wider font-mono text-white uppercase">
                  Adaptive Intelligence Deck
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-mono">
                  AUTONOMOUS
                </span>
              </div>
              <p className="text-xs text-[#A1A1A6] font-mono">
                Dual-Channel Real-Time Academic Calibration Engine
              </p>
            </div>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
            {(['AUTO_LOOP', 'PRECISION', 'CALIBRATE'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  sound.playClick();
                  setDeckMode(mode);
                }}
                className={`px-3.5 py-1 rounded-full text-[11px] font-mono font-medium transition-all cursor-pointer ${
                  deckMode === mode
                    ? 'bg-white/20 text-white shadow-sm border border-white/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'AUTO_LOOP' ? 'AUTO LOOP' : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Channel Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Channel 1: Gap Diagnostics & Mastery */}
          <div className="liquid-glass-block p-6 rounded-2xl border border-white/10 flex flex-col justify-between items-center text-center space-y-5 hover:border-white/25 transition-all">
            <div className="w-full flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-300 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                CH-1 • Gap Diagnostics
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 font-bold">
                SCORE: {leftMasteryKnob}%
              </span>
            </div>

            <div className="py-2 flex flex-col items-center">
              <RotaryKnob
                value={leftMasteryKnob}
                min={0}
                max={100}
                size="lg"
                variant="ocean"
                label="GAP MASTERY"
                subLabel={criticalGap?.topic || 'B-Trees & Indexing'}
                onChange={(val) => setLeftMasteryKnob(val)}
              />
              <p className="text-xs text-[#A1A1A6] mt-3 max-w-xs leading-relaxed">
                Calibrate baseline proficiency. The Socratic Tutor adapts question depth according to this score.
              </p>
            </div>

            <button
              onClick={handleSyncGaps}
              className="btn-apple-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Launch Socratic Session</span>
            </button>
          </div>

          {/* Channel 2: Adaptive Study Load */}
          <div className="liquid-glass-block p-6 rounded-2xl border border-white/10 flex flex-col justify-between items-center text-center space-y-5 hover:border-white/25 transition-all">
            <div className="w-full flex items-center justify-between text-xs font-mono">
              <span className="text-pink-300 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pink-400" />
                CH-2 • Study Pacing
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-200 border border-pink-400/30 font-bold">
                TARGET: {(rightHoursKnob / 10).toFixed(1)} HRS
              </span>
            </div>

            <div className="py-2 flex flex-col items-center">
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
              <p className="text-xs text-[#A1A1A6] mt-3 max-w-xs leading-relaxed">
                Dynamically weighted across active exam gaps with automated cognitive fatigue balancing.
              </p>
            </div>

            <button
              onClick={handleSyncTimetable}
              className="btn-apple-glass w-full py-2.5 text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <FileCheck className="w-3.5 h-3.5 text-white/90" />
              <span>Sync Diagnostic Quiz</span>
            </button>
          </div>
        </div>

        {/* Command Deck Bottom Telemetry Bar */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#A1A1A6]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399] animate-pulse" />
              Continuous Feedback Loop: Active & Optimal
            </span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="text-white/70 hidden sm:inline">Mode: {deckMode}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { sound.playClick(); onOpenWorkloadModal(); }}
              className="hover:text-pink-300 flex items-center gap-1.5 text-xs transition-colors text-pink-400 cursor-pointer"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Workload Check-in</span>
            </button>
            <span className="text-white/20">•</span>
            <button
              onClick={() => { sound.playClick(); onNavigate('adaptive_loop'); }}
              className="hover:text-cyan-300 flex items-center gap-1.5 text-xs transition-colors text-cyan-400 cursor-pointer"
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
                className={`p-4 rounded-2xl transition-all ${
                  block.completed
                    ? 'liquid-glass-block opacity-40 border-white/5'
                    : block.isAdaptive
                    ? 'liquid-glass-adaptive shadow-[0_6px_22px_rgba(168,85,247,0.2)]'
                    : 'liquid-glass-block'
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
                <div key={gap.id} className="p-3 rounded-2xl liquid-glass-block space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#F5F5F7] truncate pr-2">{gap.topic}</span>
                    <span className="font-mono text-[10px] font-bold text-pink-400">{gap.masteryScore}%</span>
                  </div>
                  <div className="w-full bg-white/[0.08] rounded-full h-1.5 overflow-hidden border border-white/15">
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
