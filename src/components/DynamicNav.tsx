import React from 'react';
import {
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
  Users,
  CalendarDays
} from 'lucide-react';
import { sound } from '../services/soundService';

export interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  badge?: number;
}

interface DynamicNavProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  activeGapsCount: number;
  onOpenWorkloadModal: () => void;
}

export const DynamicNav: React.FC<DynamicNavProps> = ({
  activeTab,
  onSelectTab,
  activeGapsCount,
  onOpenWorkloadModal
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'tutor',
      label: 'AI Tutor',
      icon: Bot
    },
    {
      id: 'tests',
      label: 'Tests',
      icon: FileCheck2
    },
    {
      id: 'gaps',
      label: 'Gaps',
      icon: Target,
      badge: activeGapsCount > 0 ? activeGapsCount : undefined
    },
    {
      id: 'syllabus',
      label: 'Syllabus',
      icon: BookOpen
    },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: CalendarClock
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarDays
    },
    {
      id: 'community',
      label: 'Community',
      icon: Users
    },
    {
      id: 'history',
      label: 'History',
      icon: GraduationCap
    },
    {
      id: 'adaptive_loop',
      label: 'Adaptive Loop',
      shortLabel: 'Loop',
      icon: RotateCw
    },
    {
      id: 'progress',
      label: 'Quests',
      icon: Trophy
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <nav className="sticky top-16 z-30 w-full py-2.5 px-4 flex justify-center items-center pointer-events-none">
      <div className="pointer-events-auto apple-liquid-glass rounded-full p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.6)] border border-white/25 backdrop-blur-3xl flex items-center gap-1 max-w-full overflow-x-auto no-scrollbar select-none animate-fade-in">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onSelectTab(item.id);
              }}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs flex items-center gap-2 transition-all duration-200 flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-white/[0.22] via-white/[0.14] to-white/[0.08] text-white border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_16px_rgba(0,0,0,0.35)] font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.08] border border-transparent'
              }`}
              title={item.label}
            >
              <Icon className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white scale-110' : 'text-slate-400'}`} />
              <span className="hidden sm:inline-block tracking-tight text-[11px] sm:text-xs">
                {item.label}
              </span>
              <span className="inline-block sm:hidden text-[11px]">
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

        {/* Separator */}
        <div className="h-4 w-px bg-white/20 mx-1 flex-shrink-0 hidden md:block" />

        {/* Quick Workload Rebalance Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenWorkloadModal();
          }}
          className="hidden md:flex px-3 py-1.5 rounded-full text-xs font-medium items-center gap-1.5 transition-all bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 hover:border-pink-500/50 text-pink-300 hover:text-white flex-shrink-0 cursor-pointer shadow-sm"
          title="Cognitive Pacing & Workload Rebalance"
        >
          <HeartPulse className="w-3.5 h-3.5 text-pink-400 animate-pulse flex-shrink-0" />
          <span className="text-[11px] font-medium">Rebalance</span>
        </button>
      </div>
    </nav>
  );
};
