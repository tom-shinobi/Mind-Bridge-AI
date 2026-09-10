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
      
      {/* Header */}
      <div className="liquid-glass-card p-6 relative overflow-hidden">
        <div className="glow-purple -top-24 -right-24 opacity-25" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-mono mb-2">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>DYNAMIC COGNITIVE SCHEDULER</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI-Generated Study Timetable
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Standard college schedules are static. Mind Bridge AI continuously optimizes your study blocks, reserving peak energy slots for your highest-severity gaps and dynamically adapting when workload surges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onOpenWorkloadModal();
              }}
              className="btn-skeuo-orange py-2.5 px-4 text-xs font-semibold flex items-center gap-2"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Simulate Workload Shift</span>
            </button>
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/[0.08]">
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
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'btn-skeuo-primary text-white shadow-lg'
                    : 'bg-white/[0.03] text-slate-400 border border-white/10 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>{day}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/40 text-slate-300">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Adaptive Summary Banner */}
      <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>
            Currently displaying <strong className="text-white">{selectedDay}'s</strong> schedule. Total adaptive blocks in system: <strong className="text-purple-300 font-mono">{adaptiveBlocksCount}</strong>.
          </span>
        </div>
        <span className="text-[11px] text-purple-400 font-mono">
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
              className={`liquid-glass-card p-5 transition-all ${
                block.completed
                  ? 'border-white/5 bg-white/[0.02] opacity-60'
                  : block.isAdaptive
                  ? 'border-purple-500/40 bg-purple-950/20 shadow-[0_4px_24px_rgba(168,85,247,0.12)]'
                  : 'border-white/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => {
                      sound.playClick();
                      onToggleBlockComplete(block.id);
                    }}
                    className="mt-1 text-slate-400 hover:text-purple-300 transition-colors"
                  >
                    {block.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {block.startTime} - {block.endTime}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          block.blockType === 'deep_work'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : block.blockType === 'test'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : block.blockType === 'tutor'
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                            : 'bg-slate-700/40 text-slate-300'
                        }`}
                      >
                        {block.blockType.replace('_', ' ')}
                      </span>

                      {block.isAdaptive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <RotateCw className="w-2.5 h-2.5" />
                          Adaptive Block
                        </span>
                      )}
                    </div>

                    <h4 className={`text-base font-bold ${block.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                      {block.topic}
                    </h4>
                    <p className="text-xs text-purple-300/80 font-mono mt-0.5">{block.subject}</p>

                    {block.adaptiveReason && (
                      <div className="mt-2.5 p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] text-slate-300 leading-relaxed max-w-xl">
                        <span className="text-amber-400 font-semibold font-mono">System Justification: </span>
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
                    className="btn-skeuo-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center"
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
