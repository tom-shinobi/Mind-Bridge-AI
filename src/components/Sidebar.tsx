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
  BrainCircuit
} from 'lucide-react';
import { sound } from '../services/soundService';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  description: string;
}

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  activeGapsCount: number;
  onOpenWorkloadModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeGapsCount,
  onOpenWorkloadModal
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: "Today's personalized focus"
    },
    {
      id: 'history',
      label: 'Academic History',
      icon: GraduationCap,
      description: 'Records, marks & trends'
    },
    {
      id: 'gaps',
      label: 'Learning Gaps',
      icon: Target,
      badge: activeGapsCount > 0 ? activeGapsCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description: 'Strengths & weaknesses'
    },
    {
      id: 'syllabus',
      label: 'Personalized Syllabus',
      icon: BookOpen,
      description: 'Dynamic priority hierarchy'
    },
    {
      id: 'timetable',
      label: 'Smart Timetable',
      icon: CalendarClock,
      description: 'Adaptive daily schedule'
    },
    {
      id: 'tutor',
      label: 'AI Tutor Room',
      icon: Bot,
      badge: 'Socratic',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Back-and-forth learning'
    },
    {
      id: 'tests',
      label: 'Personalized Tests',
      icon: FileCheck2,
      description: 'Diagnostic assessments'
    },
    {
      id: 'adaptive_loop',
      label: 'Adaptive Feedback Loop',
      icon: RotateCw,
      badge: 'Core',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Continuous improvement'
    },
    {
      id: 'progress',
      label: 'Progress & Rewards',
      icon: Trophy,
      description: 'XP, badges & analytics'
    },
    {
      id: 'settings',
      label: 'Settings & Boundaries',
      icon: Settings,
      description: 'AI model & profile'
    }
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col justify-between py-6 px-4 lg:min-h-[calc(100vh-4.5rem)] border-r border-white/[0.06] bg-[#08090E]/60 backdrop-blur-xl">
      
      {/* Navigation Links */}
      <div className="space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
          <span>Main Navigation</span>
          <span className="flex items-center gap-1 text-[10px] text-purple-400">
            <BrainCircuit className="w-3 h-3 animate-pulse" />
            Active
          </span>
        </div>

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
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-purple-900/40 via-purple-800/20 to-transparent text-white border border-purple-500/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_16px_rgba(168,85,247,0.15)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {/* Active neon highlight stripe */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-gradient-to-b from-purple-400 to-pink-500 shadow-[0_0_8px_#A855F7]" />
              )}

              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                      : 'text-slate-400 group-hover:text-purple-300 bg-white/[0.02]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold leading-tight">{item.label}</p>
                  <p className="text-[10px] text-slate-400 leading-tight truncate hidden sm:block">
                    {item.description}
                  </p>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                    item.badgeColor || 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Tactile Workload & Stress Card */}
      <div className="mt-6 pt-4 border-t border-white/[0.08]">
        <div className="liquid-glass p-3.5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-pink-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">Workload Check</span>
            </div>
            <span className="led-indicator led-emerald" />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Feeling overwhelmed today? Tap to auto-balance your timetable and reduce fatigue.
          </p>
          <button
            onClick={() => {
              sound.playClick();
              onOpenWorkloadModal();
            }}
            className="w-full btn-skeuo-glass py-2 px-3 text-xs flex items-center justify-center gap-2"
          >
            <HeartPulse className="w-3.5 h-3.5 text-pink-400" />
            <span>Check & Rebalance</span>
          </button>
        </div>
      </div>

    </aside>
  );
};
