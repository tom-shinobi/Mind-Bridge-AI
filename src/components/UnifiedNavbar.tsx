import React, { useState, useEffect, useRef } from 'react';
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
  HeartPulse,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import type { StudentProfile, LearningGap, AISettings } from '../types';
import { THEME_CONFIGS } from '../types';
import { sound } from '../services/soundService';

export interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const currentTheme = aiSettings.theme || 'dusk';
  const activeThemeConfig = THEME_CONFIGS.find((c) => c.id === currentTheme) || THEME_CONFIGS[0];

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  const toggleSound = () => {
    const newVal = !aiSettings.soundFxEnabled;
    sound.setEnabled(newVal);
    onUpdateSettings({ ...aiSettings, soundFxEnabled: newVal });
    if (newVal) sound.playClick();
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      shortLabel: 'Home',
      description: 'Command Deck & Overview',
      icon: LayoutDashboard,
      gradient: 'from-blue-500/30 to-indigo-500/20'
    },
    {
      id: 'tutor',
      label: 'AI Tutor',
      shortLabel: 'Tutor',
      description: 'Socratic Concept Deep-Dive',
      icon: Bot,
      gradient: 'from-purple-500/30 to-pink-500/20'
    },
    {
      id: 'tests',
      label: 'Tests',
      shortLabel: 'Tests',
      description: 'Adaptive Diagnostic Exams',
      icon: FileCheck2,
      gradient: 'from-cyan-500/30 to-blue-500/20'
    },
    {
      id: 'gaps',
      label: 'Gaps',
      shortLabel: 'Gaps',
      description: 'Prerequisite Remediation',
      icon: Target,
      gradient: 'from-rose-500/30 to-pink-500/20',
      badge: activeGapsCount > 0 ? activeGapsCount : undefined
    },
    {
      id: 'syllabus',
      label: 'Syllabus',
      shortLabel: 'Syllabus',
      description: 'Curriculum & Modules',
      icon: BookOpen,
      gradient: 'from-emerald-500/30 to-teal-500/20'
    },
    {
      id: 'timetable',
      label: 'Timetable',
      shortLabel: 'Schedule',
      description: 'Smart Daily Study Planner',
      icon: CalendarClock,
      gradient: 'from-amber-500/30 to-orange-500/20'
    },
    {
      id: 'history',
      label: 'History',
      shortLabel: 'History',
      description: 'Academic Record & Analytics',
      icon: GraduationCap,
      gradient: 'from-violet-500/30 to-purple-500/20'
    },
    {
      id: 'adaptive_loop',
      label: 'Adaptive Loop',
      shortLabel: 'Loop',
      description: 'Real-time Cognitive Audit',
      icon: RotateCw,
      gradient: 'from-sky-500/30 to-cyan-500/20'
    },
    {
      id: 'progress',
      label: 'Quests',
      shortLabel: 'Arcade',
      description: 'Brain Arcade & XP Rewards',
      icon: Trophy,
      gradient: 'from-yellow-500/30 to-amber-500/20'
    },
    {
      id: 'settings',
      label: 'Settings',
      shortLabel: 'Settings',
      description: 'Profile & Space Coders Team',
      icon: Settings,
      gradient: 'from-slate-500/30 to-zinc-500/20'
    }
  ];

  // Check overflow and scroll indicators
  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  // Smoothly center active tab whenever it changes
  useEffect(() => {
    if (activeItemRef.current && scrollContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
      setTimeout(checkScroll, 350);
    }
  }, [activeTab]);

  const handleScroll = (direction: 'left' | 'right') => {
    sound.playClick();
    if (!scrollContainerRef.current) return;
    const scrollAmount = 220;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkScroll, 250);
  };

  const handleSelectTab = (tabId: string) => {
    sound.playClick();
    onNavigate(tabId);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* =========================================================================
          1. TOP NAVIGATION BAR (Liquid Glass Island)
          ========================================================================= */}
      <header className="sticky top-2 z-40 w-full px-2.5 sm:px-4 md:px-6 pointer-events-none mb-3 pt-[max(0.25rem,env(safe-area-inset-top,0px))]">
        <div className="pointer-events-auto apple-liquid-glass max-w-7xl mx-auto rounded-full px-3 sm:px-4 py-2 shadow-[0_16px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.7)] border border-white/20 backdrop-blur-3xl flex items-center justify-between gap-2 sm:gap-3 select-none transition-all">
          
          {/* Brand Logo & Name */}
          <div
            onClick={() => handleSelectTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer group select-none flex-shrink-0 touch-press"
          >
            <div className="relative w-8 h-8 rounded-xl bg-white/[0.08] border border-white/30 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_16px_rgba(0,0,0,0.4)] flex items-center justify-center transition-transform group-hover:scale-105">
              <Sparkles className="w-4 h-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-semibold tracking-tight text-white font-heading">
                MindBridge
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/90 font-mono font-medium border border-white/20">
                AI
              </span>
            </div>
          </div>

          {/* Desktop Navigation Strip with Auto-Centering & Scroll Chevrons */}
          <div className="hidden md:flex items-center relative flex-1 max-w-3xl mx-2 overflow-hidden">
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="absolute left-0 z-10 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center shadow-lg backdrop-blur-md transition-transform hover:scale-110 cursor-pointer"
                title="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-1 scroll-smooth w-full justify-start lg:justify-center"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    ref={isActive ? activeItemRef : null}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all duration-200 flex-shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-white/[0.24] via-white/[0.16] to-white/[0.08] text-white border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_16px_rgba(0,0,0,0.35)] font-semibold scale-[1.02]'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.08] border border-transparent'
                    }`}
                    title={item.description}
                  >
                    <Icon className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white scale-110' : 'text-slate-400'}`} />
                    <span className="tracking-tight text-[11px] whitespace-nowrap">
                      {item.shortLabel || item.label}
                    </span>

                    {item.badge !== undefined && (
                      <span className="w-4 h-4 rounded-full bg-pink-500/40 text-pink-200 border border-pink-400/50 text-[9px] font-mono font-bold flex items-center justify-center flex-shrink-0">
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38BDF8] animate-pulse flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="absolute right-0 z-10 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center shadow-lg backdrop-blur-md transition-transform hover:scale-110 cursor-pointer"
                title="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Controls: Desktop Telemetry & Mobile Action Capsule */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            
            {/* Streak Indicator (Always visible on mobile & desktop) */}
            <div
              onClick={() => handleSelectTab('progress')}
              className="px-2 sm:px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/15 hover:border-orange-400/40 text-[10px] sm:text-[11px] font-medium flex items-center gap-1 text-slate-200 cursor-pointer transition-all touch-press"
              title="Consistent learning streak"
            >
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400 animate-pulse drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
              <span>{profile.streakDays}d</span>
            </div>

            {/* Level / XP Indicator (Desktop & Tablet) */}
            <div
              onClick={() => handleSelectTab('progress')}
              className="hidden sm:flex px-2 sm:px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/15 hover:border-amber-400/40 text-[10px] sm:text-[11px] font-medium items-center gap-1 text-amber-300 cursor-pointer transition-all touch-press"
              title={`Level ${profile.level} Scholar (${profile.totalXp.toLocaleString()} XP)`}
            >
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
              <span>Lvl {profile.level}</span>
            </div>

            {/* Rebalance Workload Button (Desktop Large) */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenWorkloadModal();
              }}
              className="hidden lg:flex px-2.5 py-1 rounded-full bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-[11px] font-medium text-pink-200 items-center gap-1.5 cursor-pointer transition-all"
              title="Calibrate Daily Academic Workload"
            >
              <HeartPulse className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>Rebalance</span>
            </button>

            {/* Atmosphere Theme Switcher (10 Live Themes) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsThemeMenuOpen(!isThemeMenuOpen);
                }}
                className="px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-white/[0.06] hover:bg-white/[0.14] border border-white/15 hover:border-white/30 transition-all cursor-pointer flex items-center gap-1.5 text-slate-200 touch-press"
                title={`Theme: ${activeThemeConfig.name} (Click to change)`}
              >
                <span className="text-xs sm:text-sm leading-none">{activeThemeConfig.emoji}</span>
                <span className="hidden sm:inline">{activeThemeConfig.shortName}</span>
                <span className="text-[9px] opacity-60">▾</span>
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto custom-scrollbar p-2 rounded-2xl apple-liquid-glass border border-white/25 shadow-2xl z-50 animate-fade-in space-y-1">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/10 flex items-center justify-between">
                    <span>Atmosphere Theme</span>
                    <span className="text-cyan-300">10 Themes</span>
                  </div>
                  {THEME_CONFIGS.map((cfg) => {
                    const isSelected = cfg.id === currentTheme;
                    return (
                      <button
                        key={cfg.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          onUpdateSettings({ ...aiSettings, theme: cfg.id });
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full p-2 rounded-xl text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white/20 border border-white/30 text-white shadow-sm'
                            : 'hover:bg-white/10 text-slate-300 border border-transparent'
                        }`}
                      >
                        <span className="text-base flex-shrink-0">{cfg.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium flex items-center justify-between">
                            <span className="truncate">{cfg.name}</span>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                          </div>
                          <div className={`h-1 w-full rounded-full bg-gradient-to-r ${cfg.swatchGradient} mt-1 opacity-80`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sound FX Toggle (Desktop & Tablet) */}
            <button
              type="button"
              onClick={toggleSound}
              className="hidden sm:flex p-1.5 rounded-full text-[#A1A1A6] hover:text-white bg-white/[0.05] border border-white/15 hover:border-white/30 transition-all cursor-pointer"
              title={aiSettings.soundFxEnabled ? "Mute sound effects" : "Enable sound effects"}
            >
              {aiSettings.soundFxEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-white" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-[#86868B]" />
              )}
            </button>

            {/* Demo Reset / Real Auth Button (Desktop Wide) */}
            <div className="hidden xl:flex items-center gap-1.5">
              {isDemoMode ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Reset MindBridge AI demo state to pristine baseline?')) {
                        sound.playClick();
                        onResetDemo();
                      }
                    }}
                    className="px-2 py-1 rounded-full text-[10px] font-medium text-slate-300 hover:text-white bg-white/[0.05] border border-white/15 transition-all cursor-pointer flex items-center gap-1"
                    title="Reset to fresh demo state"
                  >
                    <RotateCcw className="w-3 h-3 text-white/80" />
                    <span>Demo</span>
                  </button>

                  {onOpenAuth && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onOpenAuth();
                      }}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-purple-200 hover:text-white bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 transition-all cursor-pointer flex items-center gap-1"
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
                    type="button"
                    onClick={() => {
                      if (confirm('Sign out of MindBridge AI?')) {
                        sound.playClick();
                        onSignOut();
                      }
                    }}
                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-300 bg-white/[0.05] border border-white/15 hover:border-rose-500/30 transition-all cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>

            {/* All Apps / Menu Grid Button (Desktop Only — on mobile, bottom dock handles this) */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsDrawerOpen(true);
              }}
              className="hidden md:flex p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/25 text-white items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Open Academic Command Center (All Destinations)"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-[11px] font-medium">All Apps</span>
              {activeGapsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            {/* Profile Avatar Capsule */}
            <div
              onClick={() => handleSelectTab('settings')}
              className="flex items-center gap-1.5 pl-0.5 py-0.5 pr-2 rounded-full bg-white/[0.06] border border-white/20 hover:border-white/40 cursor-pointer transition-all touch-press"
              title={`${profile.name} • Sem ${profile.semester}`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500/50 via-cyan-500/40 to-pink-500/50 border border-white/40 flex items-center justify-center font-bold text-[10px] text-white shadow-inner">
                {(() => {
                  const parts = (profile.name || 'Scholar').trim().split(/\s+/);
                  return parts.length === 1
                    ? parts[0].slice(0, 2).toUpperCase()
                    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                })()}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* =========================================================================
          2. MOBILE FLOATING BOTTOM DOCK (iOS Dynamic Style — Adapts Like Butter)
          ========================================================================= */}
      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] inset-x-3 z-40 max-w-md mx-auto md:hidden pointer-events-auto">
        <nav className="apple-liquid-glass rounded-full px-2 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-white/20 backdrop-blur-3xl flex items-center justify-around select-none">
          
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => handleSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center min-h-[46px] min-w-[46px] py-1 px-3 rounded-2xl transition-all touch-press active:scale-95 ${
              activeTab === 'dashboard'
                ? 'text-white bg-white/[0.18] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_0_14px_rgba(56,189,248,0.25)] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-cyan-300 drop-shadow-[0_0_8px_#38BDF8]' : ''}`} />
            <span className="text-[9px] mt-0.5 tracking-tight font-medium">Home</span>
          </button>

          {/* 2. AI Tutor */}
          <button
            type="button"
            onClick={() => handleSelectTab('tutor')}
            className={`flex flex-col items-center justify-center min-h-[46px] min-w-[46px] py-1 px-3 rounded-2xl transition-all touch-press active:scale-95 ${
              activeTab === 'tutor'
                ? 'text-white bg-white/[0.18] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_0_14px_rgba(168,85,247,0.25)] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className={`w-4 h-4 ${activeTab === 'tutor' ? 'text-purple-300 drop-shadow-[0_0_8px_#C084FC]' : ''}`} />
            <span className="text-[9px] mt-0.5 tracking-tight font-medium">Tutor</span>
          </button>

          {/* 3. Tests */}
          <button
            type="button"
            onClick={() => handleSelectTab('tests')}
            className={`flex flex-col items-center justify-center min-h-[46px] min-w-[46px] py-1 px-3 rounded-2xl transition-all touch-press active:scale-95 ${
              activeTab === 'tests'
                ? 'text-white bg-white/[0.18] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_0_14px_rgba(96,165,250,0.25)] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className={`w-4 h-4 ${activeTab === 'tests' ? 'text-blue-300 drop-shadow-[0_0_8px_#60A5FA]' : ''}`} />
            <span className="text-[9px] mt-0.5 tracking-tight font-medium">Tests</span>
          </button>

          {/* 4. Syllabus */}
          <button
            type="button"
            onClick={() => handleSelectTab('syllabus')}
            className={`flex flex-col items-center justify-center min-h-[46px] min-w-[46px] py-1 px-3 rounded-2xl transition-all touch-press active:scale-95 ${
              activeTab === 'syllabus'
                ? 'text-white bg-white/[0.18] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_0_14px_rgba(52,211,153,0.25)] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'syllabus' ? 'text-emerald-300 drop-shadow-[0_0_8px_#34D399]' : ''}`} />
            <span className="text-[9px] mt-0.5 tracking-tight font-medium">Syllabus</span>
          </button>

          {/* 5. All Apps / More Drawer */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsDrawerOpen(true);
            }}
            className="relative flex flex-col items-center justify-center min-h-[46px] min-w-[46px] py-1 px-3 rounded-2xl text-slate-400 hover:text-white transition-all cursor-pointer touch-press active:scale-95"
          >
            <div className="relative">
              <LayoutGrid className="w-4 h-4 text-pink-300 drop-shadow-[0_0_8px_#F472B6]" />
              {activeGapsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_6px_#EC4899]" />
              )}
            </div>
            <span className="text-[9px] mt-0.5 text-pink-300 font-semibold tracking-tight">More ✦</span>
          </button>

        </nav>
      </div>

      {/* =========================================================================
          3. FULL DESTINATIONS SLIDE-UP SHEET (Zero Hidden Options)
          ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-auto animate-fade-in">
          {/* Dimmed Blur Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
          />

          {/* Liquid Glass Bottom Sheet */}
          <div className="relative z-10 w-full max-w-2xl mx-auto apple-liquid-glass rounded-t-[32px] sm:rounded-3xl border-t sm:border border-white/25 p-5 sm:p-6 pb-[max(2.5rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] shadow-[0_-20px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.7)] backdrop-blur-3xl max-h-[85dvh] overscroll-contain overflow-y-auto">
            
            {/* Top Drag Pill */}
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-4" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <span>Academic Command Center</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/90 font-mono font-medium border border-white/20">
                    10 Modules
                  </span>
                </h2>
                <p className="text-xs text-[#A1A1A6] mt-0.5">
                  Select any workspace destination. Zero hidden menus.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer touch-press"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 10 Destinations in a Responsive 2-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`p-3 rounded-2xl text-left border flex items-center gap-3 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-white/[0.22] to-white/[0.08] border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.8)]'
                        : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} border border-white/25 flex items-center justify-center flex-shrink-0 shadow-inner`}>
                      <Icon className="w-5 h-5 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                          {item.label}
                        </span>
                        {item.badge !== undefined && (
                          <span className="px-1.5 py-0.2 rounded-full bg-pink-500/30 text-pink-300 border border-pink-400/40 text-[10px] font-mono font-bold">
                            {item.badge} gaps
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A1A1A6] truncate">
                        {item.description}
                      </p>
                    </div>

                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#38BDF8] flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile 10 Atmosphere Themes Quick Strip */}
            <div className="mb-4 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
                <span className="uppercase tracking-wider">Atmosphere Theme</span>
                <span className="text-cyan-300 font-sans font-medium">{activeThemeConfig.name}</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
                {THEME_CONFIGS.map((cfg) => {
                  const isSelected = cfg.id === currentTheme;
                  return (
                    <button
                      key={cfg.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onUpdateSettings({ ...aiSettings, theme: cfg.id });
                      }}
                      className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer touch-press ${
                        isSelected
                          ? 'bg-white/20 border-white/40 text-white shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                          : 'bg-white/[0.05] border-white/10 text-slate-300 hover:border-white/25'
                      }`}
                    >
                      <span className="text-sm">{cfg.emoji}</span>
                      <span>{cfg.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsDrawerOpen(false);
                    onOpenWorkloadModal();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-200 font-medium flex items-center gap-1.5 transition-all cursor-pointer touch-press"
                >
                  <HeartPulse className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                  <span>Calibrate Workload</span>
                </button>

                <button
                  type="button"
                  onClick={toggleSound}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-300 font-medium flex items-center gap-1.5 transition-all cursor-pointer touch-press"
                >
                  {aiSettings.soundFxEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-white" />
                      <span>Sound On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                      <span>Sound Off</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mode indicator */}
              <div className="flex items-center gap-2">
                {isDemoMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Reset MindBridge AI demo state?')) {
                          sound.playClick();
                          setIsDrawerOpen(false);
                          onResetDemo();
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] border border-white/10 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Demo</span>
                    </button>

                    {onOpenAuth && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setIsDrawerOpen(false);
                          onOpenAuth();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/45 border border-purple-500/40 text-purple-200 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </button>
                    )}
                  </>
                ) : (
                  onSignOut && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Sign out?')) {
                          sound.playClick();
                          setIsDrawerOpen(false);
                          onSignOut();
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
