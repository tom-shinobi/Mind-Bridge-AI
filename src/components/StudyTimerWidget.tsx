import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { sound } from '../services/soundService';

interface StudyTimerWidgetProps {
  initialSeconds?: number;
  onSessionComplete?: (minutes: number) => void;
}

export const StudyTimerWidget: React.FC<StudyTimerWidgetProps> = ({
  initialSeconds = 2540,
  onSessionComplete
}) => {
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('B-Trees & Indexing (DBMS)');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = () => {
    sound.playClick();
    setIsActive(!isActive);
    if (!isActive && onSessionComplete) {
      // Periodic trigger
    }
  };

  const resetTimer = () => {
    sound.playClick();
    setIsActive(false);
    setSeconds(0);
  };

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="apple-liquid-glass p-5 relative overflow-hidden border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/90" />
          <span className="text-xs font-semibold tracking-wider text-[#F5F5F7] font-mono uppercase">
            Focus Timer
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_#34D399] animate-pulse' : 'bg-white/40'}`} />
          <span className="text-white/80">{isActive ? 'SESSION ACTIVE' : 'STANDBY'}</span>
        </div>
      </div>

      {/* Apple Watch Liquid Glass Digital Display */}
      <div className="py-4 px-4 text-center my-3 relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/20 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_24px_rgba(0,0,0,0.3)]">
        <div className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
          {formatTime(seconds)}
        </div>
        <div className="text-[10px] text-[#A1A1A6] font-mono uppercase tracking-wider mt-1.5">
          Target: 4.5 hrs • {Math.round((seconds / 3600) * 10) / 10} hrs logged today
        </div>
      </div>

      {/* Target Focus Subject Tag */}
      <div className="mb-3.5">
        <label className="text-[10px] uppercase font-mono text-[#86868B] font-semibold mb-1 block">
          Current Focus Block
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full text-xs px-3 py-2 rounded-xl bg-white/[0.06] border border-white/20 text-white focus:outline-none focus:border-white/50 backdrop-blur-xl"
        >
          <option value="B-Trees & Indexing (DBMS)" className="bg-[#0b0f19] text-white">B-Trees & Indexing (DBMS Gap #1)</option>
          <option value="Dynamic Programming (DSA)" className="bg-[#0b0f19] text-white">Dynamic Programming (DSA Gap #2)</option>
          <option value="Virtual Memory & Paging (OS)" className="bg-[#0b0f19] text-white">Virtual Memory & Paging (OS Gap #3)</option>
          <option value="General Revision" className="bg-[#0b0f19] text-white">General Revision & Problem Solving</option>
        </select>
      </div>

      {/* Apple Pill Timer Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={toggleTimer}
          className={`py-2 px-3 text-xs flex items-center justify-center gap-1.5 font-medium ${
            isActive ? 'btn-apple-primary text-white border-white/30' : 'btn-apple-white'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Session</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          className="btn-apple-glass py-2 px-3 text-xs flex items-center justify-center gap-1.5 font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-[#86868B] font-mono">
        <span className="flex items-center gap-1 text-white/70">
          <Sparkles className="w-3 h-3 text-amber-300" />
          Earns +25 XP / 30m
        </span>
        <span className="text-[#A1A1A6]">MindBridge Live</span>
      </div>
    </div>
  );
};
