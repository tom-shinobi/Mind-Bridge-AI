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
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col justify-between py-5 px-3.5 lg:min-h-[calc(100vh-4.5rem)] border-r border-cyan-500/20 bg-[#07192c]/80 backdrop-blur-2xl select-none">
      
      {/* Categorized Navigation Modules */}
      <div className="space-y-4">
        <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center justify-between border-b border-cyan-500/20">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#38BDF8] animate-pulse" />
            Operational Console
          </span>
          <span className="text-[10px] text-pink-400 font-mono">
            4 Modules
          </span>
        </div>

        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {/* Module Category Header */}
            <div className="px-2 pt-1.5 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400/80 uppercase">
                {section.title}
              </span>
              {section.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-900/50 via-sky-900/30 to-transparent text-white border border-cyan-400/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_4px_16px_rgba(6,182,212,0.25)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  {/* Active anime neon highlight stripe */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-gradient-to-b from-cyan-400 via-sky-300 to-pink-500 shadow-[0_0_10px_#38BDF8]" />
                  )}

                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                          : 'text-slate-400 group-hover:text-cyan-300 bg-[#0c2847]/40 group-hover:bg-cyan-500/10'
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
                      className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        item.badgeColor || 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
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

      {/* Bottom Tactile Workload & Stress Card */}
      <div className="mt-5 pt-3 border-t border-cyan-500/20">
        <div className="sea-glass-card p-3 relative overflow-hidden group border border-cyan-500/30">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-pink-400 animate-pulse drop-shadow-[0_0_6px_rgba(244,114,182,0.6)]" />
              <span className="text-xs font-bold text-slate-100">Workload Check</span>
            </div>
            <span className="led-indicator led-emerald" />
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
            Auto-balance your weekly study load to eliminate burnout and protect recovery time.
          </p>
          <button
            onClick={() => {
              sound.playClick();
              onOpenWorkloadModal();
            }}
            className="w-full btn-skeuo-mint py-1.5 px-3 text-xs flex items-center justify-center gap-2 font-bold"
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-950" />
            <span>Check & Rebalance</span>
          </button>
        </div>
      </div>

    </aside>
  );
};
