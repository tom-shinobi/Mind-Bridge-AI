import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Clock,
  ArrowUpDown,
  Filter,
  Bot
} from 'lucide-react';
import type { SyllabusTopic } from '../types';
import { sound } from '../services/soundService';

interface PersonalizedSyllabusProps {
  syllabus: SyllabusTopic[];
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
}

export const PersonalizedSyllabus: React.FC<PersonalizedSyllabusProps> = ({
  syllabus,
  onNavigate
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const subjects = Array.from(new Set(syllabus.map((s) => s.subject)));

  const filteredTopics = syllabus.filter((topic) => {
    if (selectedSubject !== 'all' && topic.subject !== selectedSubject) return false;
    if (selectedStatus !== 'all' && topic.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="liquid-glass-card p-6 relative overflow-hidden">
        <div className="glow-purple -top-24 -right-24 opacity-25" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>DYNAMIC CURRICULUM ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Personalized Syllabus
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Unlike a fixed university syllabus that treats all students identically, Mind Bridge AI dynamically re-orders topics to tackle your verified performance gaps first.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono block">Curriculum Completion</span>
              <span className="text-xl font-bold font-mono text-purple-300">
                {Math.round(
                  (syllabus.filter((s) => s.status === 'mastered').length / syllabus.length) * 100
                )}%
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-white/[0.08]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Filter className="w-3.5 h-3.5" />
              <span>Subject:</span>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All Subjects ({syllabus.length} topics)</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono ml-2">
              <span>Status:</span>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="mastered">Mastered</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
            <span>Sorted by AI Urgency Index</span>
          </div>
        </div>
      </div>

      {/* Syllabus Topics List */}
      <div className="space-y-3">
        {filteredTopics.map((topic, index) => {
          const isRemediation = topic.isGapRemediation;
          const isMastered = topic.status === 'mastered';

          return (
            <div
              key={topic.id}
              className={`liquid-glass-card p-4 sm:p-5 transition-all ${
                isMastered
                  ? 'border-emerald-500/20 bg-emerald-950/5'
                  : isRemediation
                  ? 'border-purple-500/30 bg-purple-950/15'
                  : 'border-white/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Topic Info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-purple-300 flex-shrink-0 mt-0.5">
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono font-semibold text-purple-300">
                        {topic.subject}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">• {topic.moduleName}</span>

                      {isRemediation && !isMastered && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Adaptive Priority
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          topic.status === 'mastered'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : topic.status === 'in_progress'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'bg-slate-700/40 text-slate-300'
                        }`}
                      >
                        {topic.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug">{topic.topic}</h4>

                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {topic.completedHours}h / {topic.estimatedHours}h Estimated
                      </span>
                      <span>•</span>
                      <span>Mastery: <strong className="text-white">{topic.masteryPercentage}%</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions & Progress Bar */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 flex-shrink-0">
                  <div className="w-32 hidden sm:block">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{topic.masteryPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isMastered ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}
                        style={{ width: `${topic.masteryPercentage}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onNavigate('tutor', { topic: topic.topic });
                    }}
                    className={`py-1.5 px-3.5 text-xs flex items-center gap-1.5 whitespace-nowrap ${
                      isMastered ? 'btn-skeuo-glass' : 'btn-skeuo-primary'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{isMastered ? 'Review with AI' : 'Learn with AI Tutor'}</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
