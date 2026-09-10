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
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#07192c]/85 backdrop-blur-2xl shadow-[0_4px_24px_rgba(2,10,24,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand & Project Identity */}
        <div 
          onClick={() => { sound.playClick(); onNavigate('dashboard'); }}
          className="flex items-center gap-3.5 cursor-pointer group select-none"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-pink-500 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#06182c] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform" />
            </div>
            {/* Glowing Anime LED */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 shadow-[0_0_8px_#38BDF8]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-heading">
                Mind<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-pink-400">Bridge</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono font-bold border border-cyan-400/30 shadow-[0_0_8px_rgba(6,182,212,0.25)]">
                  AI
                </span>
              </h1>
            </div>
            <p className="text-[10px] tracking-wider text-slate-400 uppercase font-medium flex items-center gap-1 font-mono">
              <span className="text-cyan-400 font-semibold">Space Coders</span>
              <span className="text-pink-400">•</span>
              <span>B.Tech CSE Assistant</span>
            </p>
          </div>
        </div>

        {/* Real-time Status Badges & Anime Telemetry Pills */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Streak Badge (Sunset Tangerine Flame) */}
          <div 
            onClick={() => { sound.playClick(); onNavigate('progress'); }}
            className="sea-glass-pill px-3.5 py-1.5 flex items-center gap-2 cursor-pointer border-orange-500/30 hover:border-orange-400/60 transition-all group"
            title="Consistent learning streak"
          >
            <Flame className="w-4 h-4 text-orange-400 animate-pulse group-hover:scale-110 transition-transform drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
            <span className="text-xs font-semibold text-slate-200">{profile.streakDays} Day Streak</span>
          </div>

          {/* Academic XP & Level (Solar Gold & Sakura) */}
          <div 
            onClick={() => { sound.playClick(); onNavigate('progress'); }}
            className="sea-glass-pill px-3.5 py-1.5 flex items-center gap-2 cursor-pointer border-amber-400/30 hover:border-amber-400/60 transition-all group"
            title={`Level ${profile.level} Scholar (${profile.totalXp} XP)`}
          >
            <Zap className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-cyan-300">
                Lvl {profile.level}
              </span>
              <span className="text-slate-300 font-mono text-[11px]">({profile.totalXp.toLocaleString()} XP)</span>
            </div>
          </div>

          {/* Active Learning Gaps Indicator (Sakura / Rose) */}
          <div 
            onClick={() => { sound.playClick(); onNavigate('gaps'); }}
            className={`sea-glass-pill px-3.5 py-1.5 flex items-center gap-2 cursor-pointer transition-all ${
              activeGapsCount > 0
                ? 'border-pink-500/40 text-pink-300 hover:border-pink-400/70 shadow-[0_0_12px_rgba(244,114,182,0.15)]'
                : 'border-emerald-500/40 text-emerald-300'
            }`}
            title="Identified learning gaps needing remediation"
          >
            <ShieldAlert className="w-4 h-4 text-pink-400 drop-shadow-[0_0_6px_rgba(244,114,182,0.6)]" />
            <span className="text-xs font-semibold">
              {activeGapsCount} Active {activeGapsCount === 1 ? 'Gap' : 'Gaps'}
            </span>
          </div>

        </div>

        {/* Controls & Student Profile Capsule */}
        <div className="flex items-center gap-2.5">
          
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl text-slate-300 hover:text-cyan-200 bg-[#0c2b4c]/70 border border-cyan-500/25 hover:border-cyan-400/50 shadow-sm hover:shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all"
            title={aiSettings.soundFxEnabled ? "Mute sound effects" : "Enable tactile sound effects"}
          >
            {aiSettings.soundFxEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
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
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0c2b4c]/70 border border-cyan-500/25 hover:border-cyan-400/50 transition-all shadow-sm"
            title="Reset to fresh demo state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Demo</span>
          </button>

          {/* Student Profile Avatar Capsule */}
          <div 
            onClick={() => { sound.playClick(); onNavigate('settings'); }}
            className="flex items-center gap-2.5 pl-2 py-1 pr-3 rounded-full bg-[#0a2644]/80 border border-cyan-500/30 hover:border-pink-400/50 cursor-pointer transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-pink-500 flex items-center justify-center font-bold text-xs text-white shadow-inner">
              JA
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-semibold text-slate-100 leading-tight">{profile.name}</p>
              <p className="text-[10px] text-cyan-300/80 leading-tight font-mono">Sem {profile.semester} • CGPA {profile.cgpa}</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
