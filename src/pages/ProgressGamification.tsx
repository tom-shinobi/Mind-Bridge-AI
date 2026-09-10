import React from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  ShieldCheck,
  Award,
  Sparkles,
  Lock,
  Clock,
  Compass,
  MessageSquareCheck
} from 'lucide-react';
import type { StudentProfile, Achievement, SyllabusTopic } from '../types';
import { sound } from '../services/soundService';

interface ProgressGamificationProps {
  profile: StudentProfile;
  achievements: Achievement[];
  syllabus: SyllabusTopic[];
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
}

export const ProgressGamification: React.FC<ProgressGamificationProps> = ({
  profile,
  achievements,
  syllabus
}) => {
  const currentLevelXp = profile.totalXp % 1000;
  const xpForNextLevel = 1000 - currentLevelXp;
  const levelProgressPct = Math.round((currentLevelXp / 1000) * 100);

  const triggerConfetti = () => {
    sound.playFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'MessageSquareCheck':
        return <MessageSquareCheck className="w-5 h-5" />;
      case 'Compass':
        return <Compass className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Banner */}
      <div className="liquid-glass-card p-6 relative overflow-hidden">
        <div className="glow-purple -top-24 -right-24 opacity-25" />
        <div className="glow-pink -bottom-24 -left-24 opacity-20" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>ACADEMIC MERIT & RETENTION ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Progress & Academic Achievements
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Mind Bridge AI rewards meaningful academic mastery—crushing learning gaps, maintaining study consistency, and acing diagnostic assessments.
            </p>
          </div>

          <button
            onClick={triggerConfetti}
            className="btn-skeuo-orange py-2.5 px-4 text-xs font-semibold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Celebrate Progress</span>
          </button>
        </div>

        {/* Level Progression Bar */}
        <div className="mt-6 p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-extrabold text-sm text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                {profile.level}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  Level {profile.level} — Algorithm Adept
                </h4>
                <p className="text-xs text-purple-300 font-mono">
                  {profile.totalXp.toLocaleString()} Total Academic XP
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-slate-400">
              <span className="text-white font-bold">{currentLevelXp}</span> / 1000 XP (
              <strong className="text-pink-400">{xpForNextLevel} XP</strong> to Level {profile.level + 1})
            </div>
          </div>

          <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 transition-all duration-700 shadow-[0_0_12px_rgba(236,72,153,0.6)]"
              style={{ width: `${levelProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Award className="w-4 h-4 text-pink-400" />
            <span>Academic Badges & Honors ({achievements.filter(a => !!a.unlockedAt).length} of {achievements.length} Unlocked)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;

            return (
              <div
                key={ach.id}
                className={`liquid-glass-card p-5 space-y-3 transition-all ${
                  isUnlocked
                    ? 'border-purple-500/30 bg-purple-950/15 shadow-[0_4px_20px_rgba(168,85,247,0.15)]'
                    : 'border-white/5 bg-white/[0.02] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-purple-600 to-pink-500 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                          : 'bg-black/40 border-white/10 text-slate-500'
                      }`}
                    >
                      {getIcon(ach.iconName)}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">{ach.title}</h4>
                      <span className="text-[10px] font-mono text-purple-300 uppercase block">
                        +{ach.xpReward} XP Reward
                      </span>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <span className="led-indicator led-emerald" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>

                {/* Progress bar */}
                <div className="space-y-1 pt-1 border-t border-white/[0.04]">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>{isUnlocked ? 'Unlocked' : 'Criteria Progress'}</span>
                    <span>
                      {ach.progress} / {ach.target}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isUnlocked ? 'bg-emerald-400' : 'bg-purple-500'
                      }`}
                      style={{ width: `${Math.min(100, (ach.progress / ach.target) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Curriculum Mastery Distribution */}
      <div className="liquid-glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>Curriculum Mastery & Time Invested</span>
        </h3>

        <div className="space-y-3">
          {syllabus.map((item) => (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{item.topic}</span>
                <span className="font-mono text-purple-300 font-bold">
                  {item.masteryPercentage}% Mastery • {item.completedHours}h logged
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.masteryPercentage >= 80
                      ? 'bg-emerald-500'
                      : item.masteryPercentage >= 60
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-orange-500'
                  }`}
                  style={{ width: `${item.masteryPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
