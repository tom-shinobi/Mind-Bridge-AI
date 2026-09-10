import React from 'react';
import {
  RotateCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Target,
  BookOpen,
  CalendarClock,
  Bot,
  FileCheck2,
  Trophy,
  HeartPulse,
  CheckCircle2,
  Clock
} from 'lucide-react';
import type { AdaptiveAuditEntry, LearningGap, StudentProfile } from '../types';
import { sound } from '../services/soundService';

interface AdaptiveLoopProps {
  auditLog: AdaptiveAuditEntry[];
  gaps: LearningGap[];
  profile: StudentProfile;
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
}

export const AdaptiveLoop: React.FC<AdaptiveLoopProps> = ({
  auditLog,
  gaps,
  onNavigate
}) => {
  const steps = [
    {
      num: '01',
      title: 'Student Academic History',
      desc: 'Ingests grades, test records & semester marks',
      icon: GraduationCap,
      status: 'active',
      targetTab: 'history'
    },
    {
      num: '02',
      title: 'Performance Analysis',
      desc: 'Calculates mastery benchmarks across subjects',
      icon: Target,
      status: 'active',
      targetTab: 'history'
    },
    {
      num: '03',
      title: 'Identify Learning Gaps',
      desc: 'Isolates weak concepts & assigns severity ratings',
      icon: ShieldAlert,
      status: 'active',
      targetTab: 'gaps'
    },
    {
      num: '04',
      title: 'Personalized Syllabus',
      desc: 'Dynamically re-ranks curriculum putting gaps first',
      icon: BookOpen,
      status: 'active',
      targetTab: 'syllabus'
    },
    {
      num: '05',
      title: 'AI Study Timetable',
      desc: 'Allocates prime study hours to critical topics',
      icon: CalendarClock,
      status: 'active',
      targetTab: 'timetable'
    },
    {
      num: '06',
      title: 'Interactive AI Learning',
      desc: 'Socratic dialogue & concept understanding checks',
      icon: Bot,
      status: 'active',
      targetTab: 'tutor'
    },
    {
      num: '07',
      title: 'Personalized Tests',
      desc: 'Synthesizes diagnostics focused on weak points',
      icon: FileCheck2,
      status: 'active',
      targetTab: 'tests'
    },
    {
      num: '08',
      title: 'Performance Evaluation',
      desc: 'Measures delta and confirms true retention',
      icon: CheckCircle2,
      status: 'active',
      targetTab: 'tests'
    },
    {
      num: '09',
      title: 'Adaptive Plan Update',
      desc: 'Decommissions resolved gaps, elevates next topics',
      icon: RotateCw,
      status: 'active',
      targetTab: 'adaptive_loop'
    },
    {
      num: '10',
      title: 'Gamification & Rewards',
      desc: 'Awards XP, levels up, and unlocks badges',
      icon: Trophy,
      status: 'active',
      targetTab: 'progress'
    },
    {
      num: '11',
      title: 'Workload/Stress Balancing',
      desc: 'Checks fatigue and redistributes daily load',
      icon: HeartPulse,
      status: 'active',
      targetTab: 'dashboard'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="apple-liquid-glass p-6 sm:p-8 relative overflow-hidden">
        <div className="glow-purple -top-24 -right-24 opacity-25" />
        <div className="glow-orange -bottom-24 -left-24 opacity-20" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
              <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>THE CONTINUOUS FEEDBACK LOOP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Mind Bridge AI Adaptive Engine
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              The core differentiator: every test submission, tutoring session, and workload check-in feeds directly into our closed loop, keeping your academic trajectory perpetually optimized.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('tests', { topic: gaps[0]?.topic || 'B-Trees & B+ Tree Indexing' });
              }}
              className="btn-apple-primary py-2.5 px-4 text-xs font-semibold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Test Loop with Diagnostic</span>
            </button>
          </div>
        </div>

        {/* Central Concept Callout */}
        <div className="mt-6 p-4 rounded-2xl liquid-glass-adaptive flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="led-indicator led-emerald" />
            <p className="text-xs text-slate-200">
              <strong>Core Philosophy:</strong> Understand the student → Identify the gap → Personalize the learning → Measure the result → Adapt the plan.
            </p>
          </div>
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/40">
            100% Autonomous Feedback
          </span>
        </div>
      </div>

      {/* Visual 11-Step Interactive Pipeline Flow */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
            <span>The 11-Step Adaptive Workflow Pipeline</span>
          </h3>
          <span className="text-[11px] text-purple-400 font-mono">Interactive Nodes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <div
                key={step.num}
                onClick={() => {
                  sound.playClick();
                  onNavigate(step.targetTab);
                }}
                className="liquid-glass-block p-4 space-y-2 border-white/15 hover:border-purple-500/50 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-purple-400 font-bold">{step.num}</span>
                  <span className="led-indicator led-emerald" />
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug group-hover:text-purple-200">
                      {step.title}
                    </h4>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  {step.desc}
                </p>

                <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-purple-300 border-t border-white/[0.04]">
                  <span>Step {idx + 1} of 11</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Adaptive Audit Log */}
      <div className="apple-liquid-glass p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Live Adaptive Engine Audit Trail
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Chronological system decisions ({auditLog.length} events logged)
          </span>
        </div>

        <div className="space-y-3">
          {auditLog.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl liquid-glass-block space-y-2 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      log.category === 'gap_detected'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : log.category === 'gap_resolved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : log.category === 'workload_relief'
                        ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {log.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold text-white">{log.triggerEvent}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{log.timestamp}</span>
              </div>

              <p className="text-xs text-purple-200 font-mono leading-relaxed pl-2 border-l-2 border-purple-500">
                {log.actionTaken}
              </p>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Curriculum Impact: </strong>
                {log.impactDescription}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
