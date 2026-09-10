import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Target,
  Clock,
  BookOpen,
  FileCheck,
  RotateCw,
  Flame,
  Zap,
  CheckCircle2,
  Circle,
  HelpCircle,
  Compass,
  HeartPulse
} from 'lucide-react';
import type {
  StudentProfile,
  LearningGap,
  SyllabusTopic,
  TimetableBlock,
  Achievement
} from '../types';
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
  // Today's blocks (Monday by default for demo)
  const todayBlocks = timetable.filter((b) => b.dayOfWeek === 'Monday');
  const criticalGap = gaps.find((g) => g.severity === 'critical') || gaps[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Intelligent Command Banner: "What should I study today, and why?" */}
      <div className="relative overflow-hidden rounded-2xl border border-white/15 p-6 sm:p-8 bg-gradient-to-br from-purple-950/60 via-[#101222] to-[#0A0C14] shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
        
        {/* Ambient background glows */}
        <div className="glow-purple -top-20 -right-20 opacity-30" />
        <div className="glow-orange -bottom-20 -left-20 opacity-20" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>AI ADAPTIVE RECOMMENDATION ENGINE</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Student ID: {profile.id}</span>
              <span className="led-indicator led-emerald" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Good afternoon, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300">{profile.name}</span>.
              </h2>
              
              {/* "What should I study today, and why?" section */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-400 font-mono uppercase tracking-wider">
                  <Compass className="w-4 h-4" />
                  <span>Today's Highest-Yield Focus</span>
                </div>
                
                <p className="text-base sm:text-lg font-semibold text-slate-100">
                  {criticalGap?.topic || 'B-Trees & B+ Tree Indexing'} <span className="text-sm font-normal text-purple-300 font-mono">({criticalGap?.subject || 'DBMS'})</span>
                </p>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Why recommended: </strong> 
                  {criticalGap?.rootCause || 'Detected 38% mastery deficiency in Midterm Exam. Remediating this now unlocks 2 upcoming modules in Query Optimization.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 border-t border-white/[0.06]">
                  <span className="flex items-center gap-1.5 text-purple-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Step 1: Socratic AI Tutor
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="flex items-center gap-1.5 text-pink-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    Step 2: Diagnostic Quiz
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Step 3: Auto-Adapt Syllabus
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action CTA Card */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onNavigate('tutor', { topic: criticalGap?.topic || 'B-Trees & B+ Tree Indexing' });
                }}
                className="btn-skeuo-primary w-full py-3.5 px-4 text-sm font-bold shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Socratic AI Tutor</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onNavigate('tests', { topic: criticalGap?.topic || 'B-Trees & B+ Tree Indexing' });
                }}
                className="btn-skeuo-orange w-full py-3 px-4 text-xs font-semibold"
              >
                <FileCheck className="w-4 h-4" />
                <span>Take Diagnostic Quiz</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenWorkloadModal();
                }}
                className="btn-skeuo-glass w-full py-2.5 px-3 text-xs flex items-center justify-center gap-2"
              >
                <HeartPulse className="w-3.5 h-3.5 text-pink-400" />
                <span>Workload Check-in</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Key Academic Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak */}
        <div className="liquid-glass-card p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>STUDY STREAK</span>
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {profile.streakDays} <span className="text-xs font-normal text-slate-400">Days Active</span>
          </div>
          <p className="text-[11px] text-orange-300/80 mt-1">Consistency multiplier +15% XP</p>
        </div>

        {/* Academic XP & Level */}
        <div className="liquid-glass-card p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>ACADEMIC XP</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {profile.totalXp.toLocaleString()} <span className="text-xs font-normal text-purple-300">Level {profile.level}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all"
              style={{ width: `${(profile.totalXp % 1000) / 10}%` }}
            />
          </div>
        </div>

        {/* Active Learning Gaps */}
        <div 
          onClick={() => { sound.playClick(); onNavigate('gaps'); }}
          className="liquid-glass-card p-4 cursor-pointer hover:border-rose-500/40 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>ACTIVE GAPS</span>
            <Target className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">
            {gaps.filter((g) => g.status !== 'resolved').length} <span className="text-xs font-normal text-slate-400">Needing Focus</span>
          </div>
          <p className="text-[11px] text-rose-300/80 mt-1 flex items-center gap-1">
            <span>1 Critical</span> • <span>1 High</span> • <span>1 Med</span>
          </p>
        </div>

        {/* Target vs Current CGPA */}
        <div 
          onClick={() => { sound.playClick(); onNavigate('history'); }}
          className="liquid-glass-card p-4 cursor-pointer hover:border-purple-500/40 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>ACADEMIC STANDING</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {profile.cgpa} <span className="text-xs font-normal text-emerald-400">/ {profile.targetCgpa} Target</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sem {profile.semester} • CSE Dept</p>
        </div>

      </div>

      {/* 3. Main Dashboard Grid: Today's Adaptive Schedule & Live Study Focus Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Adaptive Timetable */}
        <div className="lg:col-span-2 liquid-glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  Today's Adaptive Academic Timetable
                </h3>
                <p className="text-xs text-slate-400 leading-tight">
                  Dynamically weighted for weak topics with auto-rebalancing
                </p>
              </div>
            </div>

            <button
              onClick={() => { sound.playClick(); onNavigate('timetable'); }}
              className="text-xs text-purple-300 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <span>Full Week</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeline Blocks */}
          <div className="space-y-3">
            {todayBlocks.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-black/20 rounded-xl border border-white/5">
                No blocks scheduled for today. Rest or check future days!
              </div>
            ) : (
              todayBlocks.map((block) => (
                <div
                  key={block.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    block.completed
                      ? 'bg-white/[0.02] border-white/5 opacity-65'
                      : block.isAdaptive
                      ? 'bg-purple-950/25 border-purple-500/30 shadow-[0_4px_16px_rgba(168,85,247,0.1)]'
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
                        className="mt-0.5 text-slate-400 hover:text-purple-300 transition-colors"
                        title={block.completed ? 'Mark incomplete' : 'Mark completed'}
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

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                              block.blockType === 'deep_work'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : block.blockType === 'test'
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                : block.blockType === 'tutor'
                                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                                : 'bg-slate-700/40 text-slate-300'
                            }`}
                          >
                            {block.blockType.replace('_', ' ')}
                          </span>

                          {block.isAdaptive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <RotateCw className="w-2.5 h-2.5" />
                              Adaptive
                            </span>
                          )}
                        </div>

                        <p className={`text-sm font-semibold ${block.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          {block.topic}
                        </p>
                        <p className="text-xs text-purple-300/80 font-mono">{block.subject}</p>

                        {block.adaptiveReason && (
                          <p className="text-[11px] text-slate-400 mt-1.5 bg-black/30 p-2 rounded-lg border border-white/5 leading-tight">
                            <span className="text-amber-400 font-semibold font-mono">Reason: </span>
                            {block.adaptiveReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons inside timetable */}
                    {!block.completed && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          if (block.blockType === 'tutor') {
                            onNavigate('tutor', { topic: block.topic });
                          } else if (block.blockType === 'test') {
                            onNavigate('tests', { topic: block.topic });
                          } else {
                            onNavigate('tutor', { topic: block.topic });
                          }
                        }}
                        className="btn-skeuo-glass py-1.5 px-2.5 text-[11px] whitespace-nowrap flex-shrink-0"
                      >
                        Start Now
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Live Focus Engine Widget & Priority Gaps */}
        <div className="space-y-6">
          
          {/* Live Study Stopwatch Widget */}
          <StudyTimerWidget />

          {/* Critical Learning Gaps Card */}
          <div className="liquid-glass-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Identified Gaps
                </span>
              </div>
              <button
                onClick={() => { sound.playClick(); onNavigate('gaps'); }}
                className="text-[11px] text-purple-300 hover:text-white font-mono"
              >
                View All ({gaps.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {gaps.slice(0, 3).map((gap) => (
                <div
                  key={gap.id}
                  className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-1.5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 truncate pr-2">
                      {gap.topic}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        gap.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : gap.severity === 'high'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      }`}
                    >
                      {gap.severity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Mastery: <strong className="text-white">{gap.masteryScore}%</strong></span>
                    <span>Rec. Hours: <strong className="text-white">{gap.recommendedHours}h</strong></span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        gap.masteryScore < 50 ? 'bg-rose-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${gap.masteryScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { sound.playClick(); onNavigate('gaps'); }}
              className="w-full btn-skeuo-glass py-2 px-3 text-xs flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Diagnose Root Causes</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
