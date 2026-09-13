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
import { PageHeaderZine } from '../components/editorial/PageHeaderZine';

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
      
      {/* Editorial Zine Header */}
      <PageHeaderZine
        editionTag="FEEDBACK LOG // TELEMETRY 009"
        badgeText="AUTONOMOUS FEEDBACK"
        title="CONTINUOUS ADAPTIVE LOOP"
        subtitle="The core neural loop: every test mistake, tutoring question, and workload change streams through 11 real-time feedback gates to keep your learning path perpetually calibrated."
        sticker="smiley"
        sprayColor="lime"
      />

      {/* Action Strip & Philosophy Card */}
      <div className="zine-card p-5 rounded-3xl relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="bg-notebook-grid-subtle absolute inset-0 pointer-events-none opacity-20" />
        
        <div className="flex items-center gap-3 relative z-10">
          <span className="w-3 h-3 rounded-full bg-lime-400 animate-ping" />
          <p className="text-xs text-slate-200 font-mono">
            <strong className="text-lime-400 uppercase">Core Law:</strong> Diagnose Gaps → Restructure Sequence → Calibrate Agenda → Measure Delta → Evolve.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onNavigate('tests', { topic: gaps[0]?.topic || 'B-Trees & B+ Tree Indexing' });
          }}
          className="editorial-btn-lime py-2 px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 relative z-10"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>Trigger Diagnostic Loop</span>
        </button>
      </div>

      {/* Visual 11-Step Interactive Pipeline Flow */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
            <span>The 11-Step Adaptive Workflow Pipeline</span>
          </h3>
          <span className="text-[11px] text-lime-400 font-mono font-bold uppercase">Click Any Node to Navigate</span>
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
                className="zine-card p-4 space-y-2 relative overflow-hidden rounded-2xl cursor-pointer transition-all hover:border-lime-400/60 hover:scale-[1.02] group"
              >
                <div className="masking-tape-corner-tr z-10" />
                <div className="bg-notebook-grid-subtle absolute inset-0 pointer-events-none z-0 opacity-20" />

                <div className="flex items-center justify-between text-[11px] font-mono relative z-10">
                  <span className="text-lime-400 font-black text-sm">{step.num}</span>
                  <span className="w-2 h-2 rounded-full bg-lime-400" />
                </div>

                <div className="flex items-center gap-2.5 pt-1 relative z-10">
                  <div className="p-2 rounded-xl bg-lime-400 text-black font-bold group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug group-hover:text-lime-300">
                      {step.title}
                    </h4>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug relative z-10">
                  {step.desc}
                </p>

                <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-lime-400 border-t border-white/[0.08] relative z-10 font-bold">
                  <span>Phase {idx + 1} of 11</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Adaptive Audit Log */}
      <div className="zine-card p-6 space-y-4 rounded-3xl relative overflow-hidden">
        <div className="masking-tape-corner-tr z-10" />
        <div className="bg-notebook-grid-subtle absolute inset-0 pointer-events-none z-0 opacity-20" />
        
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-lime-400" />
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
