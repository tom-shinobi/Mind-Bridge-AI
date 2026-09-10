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
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#08090E]/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand & Project Identity */}
        <div 
          onClick={() => { sound.playClick(); onNavigate('dashboard'); }}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-[1.5px] shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#0D0E15] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-300 group-hover:rotate-12 transition-transform" />
            </div>
            {/* Glowing hardware LED */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Mind<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">Bridge</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-medium border border-purple-500/30">
                  AI
                </span>
              </h1>
            </div>
            <p className="text-[10px] tracking-wider text-slate-400 uppercase font-medium flex items-center gap-1">
              <span>Space Coders</span>
              <span className="text-purple-500">•</span>
              <span>B.Tech CSE Assistant</span>
            </p>
          </div>
        </div>

        {/* Real-time Status Badges & Quick Indicators */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Streak Badge */}
          <div 
            onClick={() => { sound.playClick(); onNavigate('progress'); }}
            className="liquid-glass-pill px-3.5 py-1.5 flex items-center gap-2 cursor-pointer hover:border-orange-500/40 transition-colors group"
            title="Consistent learning streak"
          >
            <Flame className="w-4 h-4 text-orange-400 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-200">{profile.streakDays} Day Streak</span>
          </div>

          {/* Academic XP & Level */}
          <div 
            onClick={() => { sound.playClick(); onNavigate('progress'); }}
            className="liquid-glass-pill px-3.5 py-1.5 flex items-center gap-2 cursor-pointer hover:border-purple-500/40 transition-colors group"
            title={`Level ${profile.level} Scholar (${profile.totalXp} XP)`}
          >
            <Zap className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                Lvl {profile.level}
              </span>
              <span className="text-slate-400 font-mono">({profile.totalXp.toLocaleString()} XP)</span>
            </div>
          </div>

          {/* Active Learning Gaps Indicator */}
          <div 
            onClick={() => { sound.playClick(); onNavigate('gaps'); }}
            className={`liquid-glass-pill px-3.5 py-1.5 flex items-center gap-2 cursor-pointer transition-colors ${
              activeGapsCount > 0
                ? 'border-rose-500/30 text-rose-300 hover:border-rose-500/50'
                : 'border-emerald-500/30 text-emerald-300'
            }`}
            title="Identified learning gaps needing remediation"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-medium">
              {activeGapsCount} Active {activeGapsCount === 1 ? 'Gap' : 'Gaps'}
            </span>
          </div>

        </div>

        {/* Controls & Student Profile capsule */}
        <div className="flex items-center gap-2.5">
          
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
            title={aiSettings.soundFxEnabled ? "Mute sound effects" : "Enable tactile sound effects"}
          >
            {aiSettings.soundFxEnabled ? (
              <Volume2 className="w-4 h-4 text-purple-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
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
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
            title="Reset to fresh demo state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          {/* Student Profile avatar capsule */}
          <div 
            onClick={() => { sound.playClick(); onNavigate('settings'); }}
            className="flex items-center gap-2.5 pl-2 py-1 pr-3 rounded-full bg-white/[0.04] border border-white/[0.1] hover:border-purple-500/40 cursor-pointer transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-xs text-white shadow-inner">
              JA
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{profile.name}</p>
              <p className="text-[10px] text-slate-400 leading-tight">Sem {profile.semester} • CGPA {profile.cgpa}</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
