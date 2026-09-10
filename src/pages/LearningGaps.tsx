import React, { useState } from 'react';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Brain
} from 'lucide-react';
import type { LearningGap } from '../types';
import { sound } from '../services/soundService';

interface LearningGapsProps {
  gaps: LearningGap[];
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
}

export const LearningGaps: React.FC<LearningGapsProps> = ({ gaps, onNavigate }) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'resolved'>('all');

  const strongTopics = [
    {
      subject: 'Database Management Systems',
      topic: 'Relational Algebra & Normalization (1NF, 2NF, 3NF, BCNF)',
      mastery: 94,
      provenBy: 'Midterm Q1 & Q2 (15/15 Marks)'
    },
    {
      subject: 'Data Structures & Algorithms',
      topic: 'Graph Traversals (BFS, DFS & Dijkstra Shortest Path)',
      mastery: 92,
      provenBy: 'End-Sem CS201 (98/100 Marks)'
    },
    {
      subject: 'Computer Networks',
      topic: 'TCP/IP 3-Way Handshake & Flow Control',
      mastery: 89,
      provenBy: 'Networking Lab Exam (44/50 Marks)'
    },
    {
      subject: 'Machine Learning',
      topic: 'Loss Functions & Gradient Descent Optimization',
      mastery: 95,
      provenBy: 'ML Assignment (46/50 Marks)'
    }
  ];

  const filteredGaps = gaps.filter((g) => {
    if (filter === 'all') return true;
    if (filter === 'resolved') return g.status === 'resolved';
    return g.severity === filter && g.status !== 'resolved';
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Banner */}
      <div className="apple-liquid-glass p-6 sm:p-8 relative overflow-hidden">
        <div className="glow-orange -top-24 -right-24 opacity-20" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>COGNITIVE GAP DIAGNOSTICS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Learning Gap Identification
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Mind Bridge AI analyzes prior test mistakes and conceptual check-ins to isolate the exact micro-concepts holding your performance back, categorizing each by severity.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md text-slate-200">
              Active: <strong className="text-rose-400 font-bold">{gaps.filter(g => g.status !== 'resolved').length}</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md text-slate-200">
              Resolved: <strong className="text-emerald-400 font-bold">{gaps.filter(g => g.status === 'resolved').length}</strong>
            </span>
          </div>
        </div>

        {/* Severity Legend */}
        <div className="flex flex-wrap gap-2.5 mt-5 pt-4 border-t border-white/[0.08]">
          <span className="text-xs text-slate-300 font-mono self-center mr-2">Severity Filter:</span>
          {(['all', 'critical', 'high', 'medium', 'resolved'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => { sound.playClick(); setFilter(lvl); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium uppercase transition-all ${
                filter === lvl
                  ? 'bg-white/[0.18] text-white border border-white/40 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_8px_20px_rgba(0,0,0,0.3)]'
                  : 'bg-white/[0.04] text-[#A1A1A6] border border-white/10 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two Column Grid: Weak Gaps vs Strong Mastered Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Identified Learning Gaps */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
                Identified Learning Deficiencies ({filteredGaps.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Ranked by Urgency</span>
          </div>

          <div className="space-y-3.5">
            {filteredGaps.map((gap) => {
              const isCritical = gap.severity === 'critical';
              const isResolved = gap.status === 'resolved';

              return (
                <div
                  key={gap.id}
                  className={`p-5 space-y-3 transition-all ${
                    isResolved
                      ? 'liquid-glass-success'
                      : isCritical
                      ? 'liquid-glass-danger'
                      : 'liquid-glass-block'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            isResolved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isCritical
                              ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse'
                              : gap.severity === 'high'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}
                        >
                          {isResolved ? 'RESOLVED' : `${gap.severity} Severity`}
                        </span>

                        <span className="text-xs font-mono text-purple-300 font-semibold">
                          {gap.subject}
                        </span>

                        <span className="text-[10px] text-slate-500 font-mono">• {gap.module}</span>
                      </div>

                      <h4 className="text-base font-bold text-white tracking-tight">{gap.topic}</h4>
                    </div>

                    {/* Mastery Score Gauge */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-extrabold font-mono text-white">
                        {gap.masteryScore}%
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">Mastery Score</span>
                    </div>
                  </div>

                  {/* Root Cause Diagnosis Box */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 font-mono">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                      <span>Root Cause Analysis & Diagnostic Context:</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{gap.rootCause}</p>
                    <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-white/[0.04] flex items-center justify-between">
                      <span>Detected From: <strong className="text-purple-300">{gap.identifiedFrom}</strong></span>
                      <span>Target Rem. Time: <strong className="text-orange-300">{gap.recommendedHours} hrs</strong></span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Zap className="w-3.5 h-3.5 text-pink-400" />
                      <span>Prioritized in Syllabus #1</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          sound.playClick();
                          onNavigate('tutor', { topic: gap.topic });
                        }}
                        className="btn-apple-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>AI Tutor Drill</span>
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          onNavigate('tests', { topic: gap.topic });
                        }}
                        className="btn-apple-glass py-1.5 px-3 text-xs flex items-center gap-1.5"
                      >
                        <span>Verify with Test</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white/90" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Mastered Strengths (Validation) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
              Mastered Concepts ({strongTopics.length})
            </h3>
          </div>

          <div className="space-y-3">
            {strongTopics.map((strong, idx) => (
              <div
                key={idx}
                className="liquid-glass-success p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-emerald-300 block mb-0.5">
                      {strong.subject}
                    </span>
                    <h5 className="text-xs font-bold text-white leading-snug">{strong.topic}</h5>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {strong.mastery}%
                  </span>
                </div>

                <p className="text-[10px] text-slate-300 font-mono bg-white/[0.05] p-2 rounded-xl border border-white/10">
                  Verified: {strong.provenBy}
                </p>

                <div className="flex items-center gap-1 text-[10px] text-emerald-400/90 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Placed in low-frequency spaced repetition</span>
                </div>
              </div>
            ))}
          </div>

          <div className="liquid-glass-block p-4 rounded-2xl space-y-2 text-xs text-slate-300">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-400" />
              How Gaps Drive Your Schedule
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Weak topics are automatically allocated 75% of your weekly deep work slots. Mastered topics receive short 15-minute maintenance check-ins.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
