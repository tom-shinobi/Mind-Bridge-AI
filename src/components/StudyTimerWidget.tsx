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
    <div className="liquid-glass-card p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Live Focus Engine
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
          <span className={`led-indicator ${isActive ? 'led-emerald animate-pulse' : 'led-amber'}`} />
          <span>{isActive ? 'LOGGING ACTIVE' : 'STANDBY'}</span>
        </div>
      </div>

      {/* Skeuomorphic LCD Digital Display */}
      <div className="skeuo-lcd py-3 px-4 text-center my-3 relative overflow-hidden border border-purple-500/20 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
        <div className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
          {formatTime(seconds)}
        </div>
        <div className="text-[10px] text-purple-300/60 font-mono uppercase tracking-widest mt-1">
          Target: 4.5 hrs • {Math.round((seconds / 3600) * 10) / 10} hrs logged today
        </div>
      </div>

      {/* Target Focus Subject Tag */}
      <div className="mb-3">
        <label className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-1 block">
          Current Focus Block
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-slate-200 focus:outline-none focus:border-purple-500/40"
        >
          <option value="B-Trees & Indexing (DBMS)">B-Trees & Indexing (DBMS Gap #1)</option>
          <option value="Dynamic Programming (DSA)">Dynamic Programming (DSA Gap #2)</option>
          <option value="Virtual Memory & Paging (OS)">Virtual Memory & Paging (OS Gap #3)</option>
          <option value="General Revision">General Revision & Problem Solving</option>
        </select>
      </div>

      {/* Tactile Timer Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={toggleTimer}
          className={`py-2 px-3 text-xs flex items-center justify-center gap-1.5 ${
            isActive ? 'btn-skeuo-orange' : 'btn-skeuo-primary'
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
          className="btn-skeuo-glass py-2 px-3 text-xs flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Earns +25 XP / 30m
        </span>
        <span className="text-purple-300">Space Coders Timer</span>
      </div>
    </div>
  );
};
