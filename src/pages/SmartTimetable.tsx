import React, { useState } from 'react';
import {
  CalendarClock,
  RotateCw,
  CheckCircle2,
  Circle,
  Play,
  HeartPulse,
  Info
} from 'lucide-react';
import type { TimetableBlock } from '../types';
import { sound } from '../services/soundService';
import { PageHeaderZine } from '../components/editorial/PageHeaderZine';

interface SmartTimetableProps {
  timetable: TimetableBlock[];
  onToggleBlockComplete: (blockId: string) => void;
  onOpenWorkloadModal: () => void;
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
}

const DAYS: Array<TimetableBlock['dayOfWeek']> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const SmartTimetable: React.FC<SmartTimetableProps> = ({
  timetable,
  onToggleBlockComplete,
  onOpenWorkloadModal,
  onNavigate
}) => {
  const [selectedDay, setSelectedDay] = useState<TimetableBlock['dayOfWeek']>('Monday');

  const dayBlocks = timetable.filter((b) => b.dayOfWeek === selectedDay);
  const adaptiveBlocksCount = timetable.filter((b) => b.isAdaptive).length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Editorial Zine Header */}
      <PageHeaderZine
        editionTag="SCHEDULE PROTOCOL // KINETIC 005"
        badgeText="COGNITIVE DISPATCH"
        title="DYNAMIC CHRONO-TIMETABLE"
        subtitle="Standard college timetables are fixed and unresponsive. Mind Bridge AI continuously optimizes study blocks, reserving high-focus energy windows for critical gaps and adapting to sudden workload spikes."
        sticker="smiley"
        sprayColor="lime"
      />

      {/* Day Selector & Action Strip */}
      <div className="zine-card p-4 sm:p-5 rounded-2xl relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="bg-notebook-grid-subtle absolute inset-0 pointer-events-none opacity-20" />
        
        {/* Day Buttons */}
        <div className="flex flex-wrap gap-2 relative z-10">
          {DAYS.map((day) => {
            const count = timetable.filter((b) => b.dayOfWeek === day).length;
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => {
                  sound.playClick();
                  setSelectedDay(day);
                }}
                className={`py-2 px-3.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-lime-400 text-black shadow-[0_0_15px_rgba(163,230,53,0.4)] scale-105'
                    : 'bg-white/[0.05] text-slate-300 border border-white/10 hover:text-white hover:border-lime-400/40 hover:bg-white/[0.08]'
                }`}
              >
                <span>{day}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-black text-lime-400 font-bold' : 'bg-white/10 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Workload Simulation CTA */}
        <div className="relative z-10">
          <button
            onClick={() => {
              sound.playClick();
              onOpenWorkloadModal();
            }}
            className="editorial-btn-lime py-2 px-4 text-xs flex items-center gap-2"
          >
            <HeartPulse className="w-4 h-4 text-black animate-pulse" />
            <span>Simulate Workload Surge</span>
          </button>
        </div>
      </div>

      {/* Adaptive Summary Banner */}
      <div className="zine-card p-4 rounded-2xl border-lime-400/30 bg-lime-950/15 flex flex-wrap items-center justify-between gap-3 text-xs relative overflow-hidden">
        <div className="bg-notebook-grid-subtle absolute inset-0 pointer-events-none opacity-20" />
        <div className="flex items-center gap-2 text-slate-200 relative z-10 font-mono">
          <Info className="w-4 h-4 text-lime-400 flex-shrink-0" />
          <span>
            Active Day: <strong className="text-lime-400 font-bold">{selectedDay}</strong> | Adaptive Blocks in System: <strong className="text-white font-bold">{adaptiveBlocksCount}</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono relative z-10">
          Auto-recalibrates upon test submission or workload checks
        </span>
      </div>

      {/* Timetable Blocks for Selected Day */}
      <div className="space-y-3">
        {dayBlocks.length === 0 ? (
          <div className="liquid-glass-card p-12 text-center space-y-3">
            <CalendarClock className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-300">No Study Sessions Scheduled for {selectedDay}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You have dedicated rest/recovery or open revision hours on this day.
            </p>
          </div>
        ) : (
          dayBlocks.map((block) => (
            <div
              key={block.id}
              className={`zine-card p-5 relative overflow-hidden transition-all rounded-2xl ${
                block.completed
                  ? 'opacity-50 border-white/10 bg-black/40'
                  : block.isAdaptive
                  ? 'border-lime-400/50 bg-lime-950/20 shadow-[0_0_25px_rgba(163,230,53,0.15)]'
                  : 'bg-black/60 border-white/10'
              }`}
            >
              <div className="masking-tape-corner-tr z-10" />
              <div className="bg-notebook-grid-subtle absolute inset-0 pointer-events-none z-0 opacity-20" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => {
                      sound.playClick();
                      onToggleBlockComplete(block.id);
                    }}
                    className="mt-1 text-slate-400 hover:text-lime-400 transition-colors"
                  >
                    {block.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-lime-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-white/40 hover:text-lime-400" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-black text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-md border border-lime-400/20">
                        {block.startTime} - {block.endTime}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          block.blockType === 'deep_work'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : block.blockType === 'test'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : block.blockType === 'tutor'
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                            : 'bg-white/10 text-slate-300 border border-white/15'
                        }`}
                      >
                        {block.blockType.replace('_', ' ')}
                      </span>

                      {block.isAdaptive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-lime-400/20 text-lime-300 border border-lime-400/40 flex items-center gap-1">
                          <RotateCw className="w-2.5 h-2.5" />
                          Adaptive Block
                        </span>
                      )}
                    </div>

                    <h4 className={`text-base font-bold tracking-tight ${block.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                      {block.topic}
                    </h4>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">{block.subject}</p>

                    {block.adaptiveReason && (
                      <div className="mt-2.5 p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] text-slate-200 leading-relaxed max-w-xl">
                        <span className="text-lime-400 font-bold font-mono">System Justification: </span>
                        {block.adaptiveReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action */}
                {!block.completed && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (block.blockType === 'tutor') {
                        onNavigate('tutor', { topic: block.topic });
                      } else if (block.blockType === 'test') {
                        onNavigate('tests', { topic: block.topic });
                      } else {
                        onNavigate('tutor', { topic: block.topic });
                      }
                    }}
                    className="editorial-btn-lime py-2 px-4 text-xs flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center font-mono uppercase tracking-wider"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Session</span>
                  </button>
                )}

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
