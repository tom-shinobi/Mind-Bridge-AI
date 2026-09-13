import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  ArrowUpDown,
  Filter,
  Bot
} from 'lucide-react';
import type { SyllabusTopic } from '../types';
import { sound } from '../services/soundService';
import { PageHeaderZine } from '../components/editorial/PageHeaderZine';

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

  const completionPct = Math.round(
    (syllabus.filter((s) => s.status === 'mastered').length / Math.max(1, syllabus.length)) * 100
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Editorial Zine Header */}
      <PageHeaderZine
        editionTag="CURRICULUM SPEC // VOLUME 003"
        badgeText="DYNAMIC SYLLABUS"
        title="AUTONOMOUS SYLLABUS ENGINE"
        subtitle="Unlike static university syllabi that treat all scholars identically, Mind Bridge AI dynamically restructures your curriculum sequence based on verified test deficiencies and retention models."
        sticker="cursor"
        sprayColor="cyan"
      />

      {/* Filter & Telemetry Controls */}
      <div className="zine-card p-4 rounded-2xl relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="bg-notebook-grid-subtle absolute inset-0 pointer-events-none opacity-20" />
        
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="flex items-center gap-1.5 text-xs text-lime-400 font-mono font-bold uppercase">
            <Filter className="w-3.5 h-3.5" />
            <span>Subject:</span>
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="liquid-glass-input text-xs px-3.5 py-1.5 rounded-xl font-mono text-white bg-black/70 border-white/20 focus:border-lime-400"
          >
            <option value="all">All Subjects ({syllabus.length} topics)</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-lime-400 font-mono font-bold uppercase ml-2">
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="liquid-glass-input text-xs px-3.5 py-1.5 rounded-xl font-mono text-white bg-black/70 border-white/20 focus:border-lime-400"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="mastered">Mastered</option>
          </select>
        </div>

        <div className="flex items-center gap-4 relative z-10 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-lime-400" />
            <span>AI Urgency Sorted</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-lime-400/10 border border-lime-400/30 text-lime-300">
            Completion: <strong className="text-white font-bold">{completionPct}%</strong>
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
              className={`zine-card p-5 relative overflow-hidden transition-all rounded-2xl ${
                isMastered
                  ? 'border-emerald-500/50 bg-emerald-950/20'
                  : isRemediation
                  ? 'border-pink-500/50 bg-pink-950/15 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
                  : 'bg-black/60 border-white/10'
              }`}
            >
              <div className="masking-tape-corner-tr z-10" />
              <div className="bg-notebook-grid-subtle absolute inset-0 pointer-events-none z-0 opacity-20" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                
                {/* Topic Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-lime-400 text-black border border-lime-300 font-mono font-black text-xs flex flex-col items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-black/70">CH.</span>
                    <span className="text-sm leading-tight">{String(index + 1).padStart(2, '0')}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono font-bold text-lime-400">
                        {topic.subject}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">• {topic.moduleName}</span>

                      {isRemediation && !isMastered && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Adaptive Priority
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          topic.status === 'mastered'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : topic.status === 'in_progress'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'bg-white/10 text-slate-300 border border-white/15'
                        }`}
                      >
                        {topic.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug tracking-tight">{topic.topic}</h4>

                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-lime-400" />
                        {topic.completedHours}h / {topic.estimatedHours}h Estimated
                      </span>
                      <span>•</span>
                      <span>Mastery: <strong className="text-lime-300 font-bold">{topic.masteryPercentage}%</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions & Progress Bar */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 flex-shrink-0">
                  <div className="w-36 hidden sm:block">
                    <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-1">
                      <span className="uppercase text-slate-400 font-bold">Retention</span>
                      <span className="font-bold text-white">{topic.masteryPercentage}%</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/15 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isMastered ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)]'
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
                    className={`py-2 px-4 text-xs font-bold font-mono flex items-center gap-1.5 whitespace-nowrap uppercase tracking-wider ${
                      isMastered ? 'btn-apple-glass text-white' : 'editorial-btn-lime'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{isMastered ? 'Review with AI' : 'Launch AI Tutor'}</span>
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
