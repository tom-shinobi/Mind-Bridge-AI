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
  HeartPulse
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

export interface NavSection {
  title: string;
  badge?: string;
  items: NavItem[];
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
  const sections: NavSection[] = [
    {
      title: '01 // MISSION CONTROL',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          description: "Today's personalized focus"
        },
        {
          id: 'tutor',
          label: 'AI Tutor Room',
          icon: Bot,
          badge: 'Socratic',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
          description: 'Back-and-forth Socratic learning'
        },
        {
          id: 'tests',
          label: 'Personalized Tests',
          icon: FileCheck2,
          badge: 'Quiz',
          badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-400/30',
          description: 'Diagnostic assessments'
        }
      ]
    },
    {
      title: '02 // ACADEMIC INTEL',
      items: [
        {
          id: 'gaps',
          label: 'Learning Gaps',
          icon: Target,
          badge: activeGapsCount > 0 ? `${activeGapsCount} Active` : undefined,
          badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-[0_0_8px_rgba(244,114,182,0.3)]',
          description: 'Strengths & critical weaknesses'
        },
        {
          id: 'syllabus',
          label: 'Personalized Syllabus',
          icon: BookOpen,
          badge: 'Dynamic',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
          description: 'Dynamic priority hierarchy'
        },
        {
          id: 'history',
          label: 'Academic History',
          icon: GraduationCap,
          description: 'Records, marks & trends'
        }
      ]
    },
    {
      title: '03 // ADAPTIVE & REWARDS',
      items: [
        {
          id: 'timetable',
          label: 'Smart Timetable',
          icon: CalendarClock,
          badge: 'Adaptive',
          badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
          description: 'Adaptive daily schedule'
        },
        {
          id: 'adaptive_loop',
          label: 'Adaptive Loop',
          icon: RotateCw,
          badge: 'Core',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
          description: 'Continuous feedback cycle'
        },
        {
          id: 'progress',
          label: 'Quests & XP',
          icon: Trophy,
          badge: 'Rewards',
          badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
          description: 'XP, badges & anime quests'
        }
      ]
    },
    {
      title: '04 // CONFIGURATION',
      items: [
        {
          id: 'settings',
          label: 'Settings & Boundaries',
          icon: Settings,
          description: 'AI model & profile'
        }
      ]
    }
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col justify-between py-6 px-3.5 lg:min-h-[calc(100vh-4rem)] border-r border-white/[0.08] bg-[#030712]/50 backdrop-blur-3xl select-none">
      
      {/* Categorized Navigation Modules */}
      <div className="space-y-5">
        {/* Workspace Brand Capsule */}
        <div className="px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center justify-between text-[11px] font-mono">
          <span className="flex items-center gap-2 text-white/95 font-medium tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#38BDF8]" />
            </span>
            <span>Workspace Modules</span>
          </span>
          <span className="text-[10px] text-[#A1A1A6] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10">
            4 Sectors
          </span>
        </div>

        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {/* Module Category Header */}
            <div className="px-2 pt-1 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold tracking-wider text-[#86868B] uppercase flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-white/40" />
                {section.title}
              </span>
              {section.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-white/80 border border-white/15">
                  {section.badge}
                </span>
              )}
            </div>

            {/* Module Items */}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-white/[0.16] via-white/[0.10] to-white/[0.04] text-white border border-white/30 border-t-white/60 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_8px_24px_rgba(0,0,0,0.35)]'
                      : 'text-[#A1A1A6] hover:text-white hover:bg-white/[0.06] hover:border-white/15 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-2 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-br from-white/30 to-white/10 text-white border border-white/40 shadow-[0_0_14px_rgba(255,255,255,0.35)]'
                          : 'text-[#86868B] group-hover:text-white bg-white/[0.04] group-hover:bg-white/10 border border-transparent group-hover:border-white/15'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold leading-tight">{item.label}</p>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38BDF8] animate-pulse flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#86868B] leading-tight truncate hidden sm:block mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                        item.badgeColor || 'bg-white/10 text-white/90 border-white/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Apple Liquid Glass Workload & Health Card */}
      <div className="mt-5 pt-3 border-t border-white/[0.08]">
        <div className="liquid-glass-block p-4 relative overflow-hidden group border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-pink-400 animate-pulse drop-shadow-[0_0_6px_rgba(244,114,182,0.6)]" />
              <span className="text-xs font-semibold text-[#F5F5F7]">Workload Balance</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
          </div>
          <p className="text-[11px] text-[#A1A1A6] leading-relaxed mb-3">
            Intelligent schedule auto-pacing. Protects recovery time and prevents academic fatigue.
          </p>
          <button
            onClick={() => {
              sound.playClick();
              onOpenWorkloadModal();
            }}
            className="w-full btn-apple-glass py-2 px-3 text-xs flex items-center justify-center gap-2 font-medium"
          >
            <HeartPulse className="w-3.5 h-3.5 text-pink-300" />
            <span>Check & Rebalance</span>
          </button>
        </div>
      </div>

    </aside>
  );
};
