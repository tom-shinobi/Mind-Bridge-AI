import React from 'react';
import {
  Sparkles,
  Flame,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  User,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  Target,
  BookOpen,
  CalendarClock,
  Bot,
  FileCheck2,
  RotateCw,
  Trophy,
  Settings,
  HeartPulse
} from 'lucide-react';
import type { StudentProfile, LearningGap, AISettings } from '../types';
import { sound } from '../services/soundService';

export interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  badge?: number;
}

interface UnifiedNavbarProps {
  profile: StudentProfile;
  gaps: LearningGap[];
  aiSettings: AISettings;
  activeTab: string;
  isDemoMode: boolean;
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
  onUpdateSettings: (settings: AISettings) => void;
  onResetDemo: () => void;
  onOpenWorkloadModal: () => void;
  onSignOut?: () => void;
  onOpenAuth?: () => void;
}

export const UnifiedNavbar: React.FC<UnifiedNavbarProps> = ({
  profile,
  gaps,
  aiSettings,
  activeTab,
  isDemoMode,
  onNavigate,
  onUpdateSettings,
  onResetDemo,
  onOpenWorkloadModal,
  onSignOut,
  onOpenAuth
}) => {
  const activeGapsCount = gaps.filter((g) => g.status !== 'resolved').length;

  const toggleSound = () => {
    const newVal = !aiSettings.soundFxEnabled;
    sound.setEnabled(newVal);
    onUpdateSettings({ ...aiSettings, soundFxEnabled: newVal });
    if (newVal) sound.playClick();
  };

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tutor', label: 'AI Tutor', icon: Bot },
    { id: 'tests', label: 'Tests', icon: FileCheck2 },
    { id: 'gaps', label: 'Gaps', icon: Target, badge: activeGapsCount > 0 ? activeGapsCount : undefined },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'timetable', label: 'Timetable', icon: CalendarClock },
    { id: 'history', label: 'History', icon: GraduationCap },
    { id: 'adaptive_loop', label: 'Adaptive Loop', shortLabel: 'Loop', icon: RotateCw },
    { id: 'progress', label: 'Quests', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header className="sticky top-2.5 z-40 w-full px-3 sm:px-5 pointer-events-none mb-4">
      <div className="pointer-events-auto apple-liquid-glass max-w-7xl mx-auto rounded-3xl md:rounded-full px-3.5 sm:px-5 py-2 shadow-[0_20px_60px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.7)] border border-white/25 backdrop-blur-3xl flex flex-col xl:flex-row items-center justify-between gap-2.5 select-none animate-fade-in">
        
        {/* Row 1 for mobile / Left for desktop: Brand Identity */}
        <div className="w-full xl:w-auto flex items-center justify-between xl:justify-start gap-3">
          <div
            onClick={() => { sound.playClick(); onNavigate('dashboard'); }}
            className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="relative w-8 h-8 rounded-xl bg-white/[0.08] border border-white/30 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_8px_20px_rgba(0,0,0,0.4)] flex items-center justify-center transition-transform group-hover:scale-105">
              <Sparkles className="w-4 h-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
            </div>

            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-1.5 font-heading">
                <span>MindBridge</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/90 font-mono font-medium border border-white/20">
                  AI
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Mobile Status Pills (Visible only on compact screens) */}
          <div className="flex xl:hidden items-center gap-1.5">
            <div
              onClick={() => { sound.playClick(); onNavigate('progress'); }}
              className="px-2 py-1 rounded-full bg-white/[0.06] border border-white/15 text-[11px] font-mono flex items-center gap-1 text-orange-300 cursor-pointer"
            >
              <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
              <span>{profile.streakDays}d</span>
            </div>
            <div
              onClick={() => { sound.playClick(); onNavigate('progress'); }}
              className="px-2 py-1 rounded-full bg-white/[0.06] border border-white/15 text-[11px] font-mono flex items-center gap-1 text-amber-300 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Lvl {profile.level}</span>
            </div>
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-full text-slate-300 hover:text-white bg-white/[0.06] border border-white/15"
              title="Toggle Sound"
            >
              {aiSettings.soundFxEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3 text-slate-500" />}
            </button>
            <div
              onClick={() => { sound.playClick(); onNavigate('settings'); }}
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500/40 via-cyan-500/30 to-pink-500/40 border border-white/40 flex items-center justify-center font-semibold text-[10px] text-white cursor-pointer"
            >
              {(() => {
                const parts = (profile.name || 'Scholar').trim().split(/\s+/);
                return parts.length === 1
                  ? parts[0].slice(0, 2).toUpperCase()
                  : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
              })()}
            </div>
          </div>
        </div>

        {/* Center: 10 Destination Navigation Capsules */}
        <nav className="w-full xl:w-auto flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 justify-start xl:justify-center flex-1 max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onNavigate(item.id);
                }}
                className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all duration-200 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-white/[0.24] via-white/[0.15] to-white/[0.08] text-white border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_16px_rgba(0,0,0,0.35)] font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.08] border border-transparent'
                }`}
                title={item.label}
              >
                <Icon className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white scale-110' : 'text-slate-400'}`} />
                <span className="tracking-tight text-[11px] whitespace-nowrap">
                  {item.shortLabel || item.label}
                </span>

                {item.badge !== undefined && (
                  <span className="w-4 h-4 rounded-full bg-pink-500/30 text-pink-300 border border-pink-400/40 text-[9px] font-mono font-bold flex items-center justify-center flex-shrink-0">
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38BDF8] animate-pulse flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Telemetry, Workload Rebalance & Student Profile (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 flex-shrink-0">
          
          {/* Streak Pill */}
          <div
            onClick={() => { sound.playClick(); onNavigate('progress'); }}
            className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/15 hover:border-orange-400/40 text-[11px] font-medium flex items-center gap-1.5 text-slate-200 cursor-pointer transition-all"
            title="Consistent learning streak"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
            <span>{profile.streakDays}d</span>
          </div>

          {/* Level / XP Pill */}
          <div
            onClick={() => { sound.playClick(); onNavigate('progress'); }}
            className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/15 hover:border-amber-400/40 text-[11px] font-medium flex items-center gap-1.5 text-amber-300 cursor-pointer transition-all"
            title={`Level ${profile.level} Scholar (${profile.totalXp.toLocaleString()} XP)`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Lvl {profile.level}</span>
          </div>

          {/* Quick Workload Rebalance Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenWorkloadModal();
            }}
            className="px-2.5 py-1 rounded-full bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-[11px] font-medium text-pink-200 flex items-center gap-1.5 cursor-pointer transition-all"
            title="Calibrate Daily Academic Workload"
          >
            <HeartPulse className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>Rebalance</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-full text-[#A1A1A6] hover:text-white bg-white/[0.05] border border-white/15 hover:border-white/30 transition-all cursor-pointer"
            title={aiSettings.soundFxEnabled ? "Mute sound effects" : "Enable tactile sound effects"}
          >
            {aiSettings.soundFxEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-white" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#86868B]" />
            )}
          </button>

          {/* Reset Demo / Real Auth Button */}
          {isDemoMode ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (confirm('Reset MindBridge AI demo state to pristine baseline?')) {
                    sound.playClick();
                    onResetDemo();
                  }
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-300 hover:text-white bg-white/[0.05] border border-white/15 hover:border-white/30 transition-all cursor-pointer flex items-center gap-1"
                title="Reset to fresh demo state"
              >
                <RotateCcw className="w-3 h-3 text-white/80" />
                <span>Reset Demo</span>
              </button>

              {onOpenAuth && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenAuth();
                  }}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-purple-200 hover:text-white bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/40 transition-all cursor-pointer flex items-center gap-1"
                  title="Switch to Real Authenticated Account"
                >
                  <User className="w-3 h-3 text-purple-300" />
                  <span>Real Auth</span>
                </button>
              )}
            </div>
          ) : (
            onSignOut && (
              <button
                onClick={() => {
                  if (confirm('Sign out of MindBridge AI?')) {
                    sound.playClick();
                    onSignOut();
                  }
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-300 bg-white/[0.05] border border-white/15 hover:border-rose-500/30 transition-all cursor-pointer"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )
          )}

          {/* Profile Avatar Capsule */}
          <div
            onClick={() => { sound.playClick(); onNavigate('settings'); }}
            className="flex items-center gap-2 pl-1 py-0.5 pr-2.5 rounded-full bg-white/[0.06] border border-white/20 hover:border-white/40 cursor-pointer transition-all"
            title={`${profile.name} • Sem ${profile.semester} • CGPA ${profile.cgpa}`}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500/40 via-cyan-500/30 to-pink-500/40 border border-white/40 flex items-center justify-center font-semibold text-[10px] text-white shadow-inner">
              {(() => {
                const parts = (profile.name || 'Scholar').trim().split(/\s+/);
                return parts.length === 1
                  ? parts[0].slice(0, 2).toUpperCase()
                  : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
              })()}
            </div>
            <div className="text-left hidden 2xl:block">
              <p className="text-[11px] font-medium text-white leading-tight truncate max-w-[90px]">{profile.name}</p>
              <p className="text-[9px] text-[#A1A1A6] leading-tight font-mono">Sem {profile.semester}</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
