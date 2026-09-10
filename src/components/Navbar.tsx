import React from 'react';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  ShieldAlert
} from 'lucide-react';
import type { StudentProfile, LearningGap, AISettings } from '../types';
import { sound } from '../services/soundService';

interface NavbarProps {
  profile: StudentProfile;
  gaps: LearningGap[];
  aiSettings: AISettings;
  onUpdateSettings: (settings: AISettings) => void;
  onResetDemo: () => void;
  onNavigate: (tab: string) => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  gaps,
  aiSettings,
  onUpdateSettings,
  onResetDemo,
  onNavigate
}) => {
  const activeGapsCount = gaps.filter((g) => g.status !== 'resolved').length;

  const toggleSound = () => {
    const newVal = !aiSettings.soundFxEnabled;
    sound.setEnabled(newVal);
    onUpdateSettings({ ...aiSettings, soundFxEnabled: newVal });
    if (newVal) sound.playClick();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#000000]/65 backdrop-blur-3xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Apple-Style Brand & Project Identity */}
        <div 
          onClick={() => { sound.playClick(); onNavigate('dashboard'); }}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Frosted Liquid Glass Brand Icon */}
          <div className="relative w-9 h-9 rounded-2xl bg-white/[0.08] border border-white/30 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_8px_20px_rgba(0,0,0,0.4)] flex items-center justify-center transition-transform group-hover:scale-105">
            <Sparkles className="w-4 h-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-1.5 font-heading">
                <span>MindBridge</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/90 font-mono font-medium border border-white/20 backdrop-blur-md">
                  AI
                </span>
              </h1>
            </div>
            <p className="text-[10px] tracking-wider text-[#A1A1A6] font-medium hidden sm:block">
              Personalized Academic Intelligence
            </p>
          </div>
        </div>

        {/* Real-time Apple Liquid Glass Telemetry Pills */}
        <div className="hidden md:flex items-center gap-2.5">
          
          {/* Streak Badge (Tangerine Flame) */}
          <div 
            onClick={() => { sound.playClick(); onNavigate('progress'); }}
            className="apple-liquid-pill px-3.5 py-1.5 flex items-center gap-2 cursor-pointer border-white/20 hover:border-orange-400/50 transition-all group"
            title="Consistent learning streak"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse group-hover:scale-110 transition-transform drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
            <span className="text-xs font-medium text-[#F5F5F7]">{profile.streakDays} Day Streak</span>
          </div>

          {/* Academic XP & Level (Solar Gold) */}
          <div 
            onClick={() => { sound.playClick(); onNavigate('progress'); }}
            className="apple-liquid-pill px-3.5 py-1.5 flex items-center gap-2 cursor-pointer border-white/20 hover:border-amber-400/50 transition-all group"
            title={`Level ${profile.level} Scholar (${profile.totalXp} XP)`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span className="text-amber-300 font-semibold">
                Lvl {profile.level}
              </span>
              <span className="text-[#A1A1A6] font-mono text-[11px]">({profile.totalXp.toLocaleString()} XP)</span>
            </div>
          </div>

          {/* Active Learning Gaps Indicator (Rose) */}
          <div 
            onClick={() => { sound.playClick(); onNavigate('gaps'); }}
            className={`apple-liquid-pill px-3.5 py-1.5 flex items-center gap-2 cursor-pointer transition-all ${
              activeGapsCount > 0
                ? 'border-pink-500/30 text-pink-200 hover:border-pink-400/60'
                : 'border-emerald-500/30 text-emerald-200'
            }`}
            title="Identified learning gaps needing remediation"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-pink-400 drop-shadow-[0_0_6px_rgba(244,114,182,0.6)]" />
            <span className="text-xs font-medium">
              {activeGapsCount} Active {activeGapsCount === 1 ? 'Gap' : 'Gaps'}
            </span>
          </div>

        </div>

        {/* Controls & Student Profile Capsule */}
        <div className="flex items-center gap-2">
          
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-full text-[#A1A1A6] hover:text-white bg-white/[0.05] border border-white/15 hover:border-white/30 backdrop-blur-xl transition-all"
            title={aiSettings.soundFxEnabled ? "Mute sound effects" : "Enable tactile sound effects"}
          >
            {aiSettings.soundFxEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-white" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#86868B]" />
            )}
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={() => {
              if (confirm('Reset Mind Bridge AI demo state to original presentation baseline?')) {
                sound.playClick();
                onResetDemo();
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#A1A1A6] hover:text-white bg-white/[0.05] border border-white/15 hover:border-white/30 backdrop-blur-xl transition-all"
            title="Reset to fresh demo state"
          >
            <RotateCcw className="w-3 h-3 text-white/80" />
            <span>Reset Demo</span>
          </button>

          {/* Student Profile Avatar Capsule */}
          <div 
            onClick={() => { sound.playClick(); onNavigate('settings'); }}
            className="flex items-center gap-2 pl-1.5 py-1 pr-3 rounded-full bg-white/[0.06] border border-white/20 hover:border-white/40 backdrop-blur-2xl cursor-pointer transition-all shadow-sm"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-white/25 via-white/15 to-white/5 border border-white/40 flex items-center justify-center font-semibold text-[11px] text-white shadow-inner">
              JA
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-medium text-[#F5F5F7] leading-tight">{profile.name}</p>
              <p className="text-[10px] text-[#A1A1A6] leading-tight font-mono">Sem {profile.semester} • CGPA {profile.cgpa}</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
