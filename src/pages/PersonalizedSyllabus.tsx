import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Clock,
  ArrowUpDown,
  Filter,
  Bot,
  Plus,
  Wand2,
  CheckCircle2,
  ChevronRight,
  X,
  Loader2
} from 'lucide-react';
import type { SyllabusTopic, ExtractedSyllabus } from '../types';
import { sound } from '../services/soundService';
import { syllabusService } from '../services/syllabusService';
import { PageHeaderZine } from '../components/editorial/PageHeaderZine';

interface PersonalizedSyllabusProps {
  syllabus: SyllabusTopic[];
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
  onAddTopics?: (newTopics: SyllabusTopic[]) => void;
}

export const PersonalizedSyllabus: React.FC<PersonalizedSyllabusProps> = ({
  syllabus,
  onNavigate,
  onAddTopics
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Topic Adder AI Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [rawText, setRawText] = useState('');
  const [inputSubject, setInputSubject] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ExtractedSyllabus | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const subjects = Array.from(new Set(syllabus.map((s) => s.subject)));

  const filteredTopics = syllabus.filter((topic) => {
    if (selectedSubject !== 'all' && topic.subject !== selectedSubject) return false;
    if (selectedStatus !== 'all' && topic.status !== selectedStatus) return false;
    return true;
  });

  const completionPct = Math.round(
    (syllabus.filter((s) => s.status === 'mastered').length / Math.max(1, syllabus.length)) * 100
  );

  // AI SUGGESTED NEXT CHAPTER COMPUTATION
  const nextChapterRecommendation = useMemo(() => {
    if (!syllabus || syllabus.length === 0) return null;

    const gapTopic = syllabus.find((t) => t.isGapRemediation && t.status !== 'mastered');
    if (gapTopic) {
      return {
        topic: gapTopic,
        badge: 'Gap Remediation Priority',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        reason: 'Flagged as high-urgency deficit in diagnostic assessment. Mastering this prerequisite unblocks subsequent exam modules.'
      };
    }

    const inProgressTopic = syllabus.find((t) => t.status === 'in_progress');
    if (inProgressTopic) {
      return {
        topic: inProgressTopic,
        badge: 'In Progress Revision',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        reason: 'Currently active in your smart timetable schedule. Complete remaining practice hours to reach mastery.'
      };
    }

    const pendingTopics = syllabus.filter((t) => t.status !== 'mastered');
    if (pendingTopics.length > 0) {
      const sorted = [...pendingTopics].sort((a, b) => a.masteryPercentage - b.masteryPercentage);
      return {
        topic: sorted[0],
        badge: 'Retention Bottleneck',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        reason: `Lowest current retention score (${sorted[0].masteryPercentage}%) among pending course units.`
      };
    }

    return {
      topic: syllabus[0],
      badge: 'Spaced Repetition',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      reason: '100% curriculum completion achieved! Scheduled for memory consolidation review.'
    };
  }, [syllabus]);

  // TOPIC ADDER AI HANDLERS
  const handleParseRawSyllabus = async () => {
    if (!rawText.trim() || rawText.trim().length < 15) {
      alert('Please paste at least a few lines of syllabus or chapter outline text.');
      return;
    }

    setIsParsing(true);
    sound.playClick();

    try {
      const parsed = await syllabusService.parseRawSyllabusText(
        rawText,
        inputSubject.trim() || subjects[0] || 'Computer Science'
      );
      setParsedResult(parsed);
      sound.playLevelUp();
    } catch (e) {
      console.warn('Error parsing raw syllabus:', e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmAddTopics = () => {
    if (!parsedResult) return;
    sound.playSuccess();

    const newSyllabusTopics = syllabusService.convertToSyllabusTopics(parsedResult);
    if (onAddTopics) {
      onAddTopics(newSyllabusTopics);
    }

    setStatusNotice(`🎉 Added ${newSyllabusTopics.length} new syllabus chapters to "${parsedResult.subject}"!`);
    setIsImportModalOpen(false);
    setRawText('');
    setParsedResult(null);

    setTimeout(() => setStatusNotice(null), 6000);
  };

  const handleLoadSampleOutline = () => {
    sound.playClick();
    setInputSubject('Distributed Systems & Cloud Computing');
    setRawText(`Module 1: Distributed Foundations
- Lamport Timestamps and Vector Clocks (3 hours)
- Distributed Consensus: Paxos and Raft (4.5 hours)
- CAP Theorem, PACELC, and Eventual Consistency (2.5 hours)

Module 2: Cloud Fault Tolerance & Replication
- Byzantine Fault Tolerance and PBFT (4 hours)
- Gossip Protocols and Failure Detectors (3 hours)
- Distributed Transactions and Two-Phase Commit (3.5 hours)`);
  };

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
        rightElement={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => {
                sound.playLevelUp();
                setIsImportModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-full bg-[#E2F952] text-black font-mono font-bold text-xs uppercase tracking-wide shadow-[0_0_15px_rgba(226,249,82,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Study Path</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setIsImportModalOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom Course</span>
            </button>
          </div>
        }
      />

      {/* Success Notification Alert */}
      {statusNotice && (
        <div className="p-4 rounded-2xl zine-card border-lime-400/50 bg-lime-950/30 text-lime-300 text-xs flex items-center gap-3 animate-fade-in font-mono shadow-[0_0_20px_rgba(163,230,53,0.2)]">
          <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" />
          <span className="leading-relaxed font-bold">{statusNotice}</span>
        </div>
      )}

      {/* AI SUGGESTED NEXT CHAPTER CARD */}
      {nextChapterRecommendation && (
        <div className="zine-card p-6 rounded-3xl relative overflow-hidden bg-gradient-to-r from-lime-950/40 via-black/80 to-emerald-950/30 border-lime-400/40 shadow-[0_0_30px_rgba(163,230,53,0.15)]">
          <div className="masking-tape-corner-tr z-10" />
          <div className="bg-notebook-grid-subtle absolute inset-0 pointer-events-none z-0 opacity-25" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-lime-400 text-black shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  AI Suggested Next Chapter
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${nextChapterRecommendation.badgeColor}`}
                >
                  {nextChapterRecommendation.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {nextChapterRecommendation.topic.subject} • {nextChapterRecommendation.topic.moduleName}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {nextChapterRecommendation.topic.topic}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {nextChapterRecommendation.reason}
              </p>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-lime-300">
                  <Clock className="w-3.5 h-3.5" />
                  Estimated: {nextChapterRecommendation.topic.estimatedHours} Hours
                </span>
                <span>•</span>
                <span>
                  Current Retention:{' '}
                  <strong className="text-white font-bold">
                    {nextChapterRecommendation.topic.masteryPercentage}%
                  </strong>
                </span>
              </div>
            </div>

            {/* Launch AI Tutor CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3 lg:self-center shrink-0">
              <button
                onClick={() => {
                  sound.playLevelUp();
                  onNavigate('tutor', { topic: nextChapterRecommendation.topic.topic });
                }}
                className="w-full sm:w-auto editorial-btn-lime py-3.5 px-6 text-xs flex items-center justify-center gap-2.5 uppercase font-mono font-bold tracking-wider cursor-pointer shadow-[0_0_20px_rgba(163,230,53,0.4)]"
              >
                <Bot className="w-4 h-4 text-black" />
                <span>Study Now with AI Tutor</span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}

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
              <option key={sub} value={sub}>
                {sub}
              </option>
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

        <div className="flex items-center gap-3 relative z-10 font-mono text-xs flex-wrap">
          {/* Topic Adder AI Trigger Button */}
          <button
            onClick={() => {
              sound.playClick();
              setIsImportModalOpen(true);
            }}
            className="btn-apple-glass py-2 px-3.5 rounded-xl text-xs flex items-center gap-2 text-cyan-300 hover:text-white border-cyan-500/30 hover:border-cyan-400 cursor-pointer font-bold"
          >
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Topics with AI</span>
          </button>

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

      {/* ========================================================================= */}
      {/* TOPIC ADDER AI: MODAL FOR PARSING RAW SYLLABUS TEXT */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono uppercase">
                    Topic Adder AI — Raw Text Parser
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Paste raw course outlines or syllabus text; AI converts them into chapters and study hours.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold uppercase tracking-wider">
                  Target Subject Name
                </label>
                <button
                  type="button"
                  onClick={handleLoadSampleOutline}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Load Sample Outline
                </button>
              </div>

              <input
                type="text"
                value={inputSubject}
                onChange={(e) => setInputSubject(e.target.value)}
                placeholder="e.g. Distributed Systems & Cloud Computing"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-sans"
              />

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Paste Raw Course Outline / Syllabus Text
                </label>
                <textarea
                  rows={7}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Paste chapters or course topics here. For example:\n\nModule 1: Distributed Algorithms\n- Lamport Vector Clocks and Total Ordering (3 hours)\n- Paxos & Raft Consensus (4 hours)\n- Byzantine Generals Problem (3.5 hours)`}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400 resize-none font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Action Button: Parse */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500">
                  Powered by Socratic Academic AI & Heuristic Parser
                </span>
                <button
                  type="button"
                  disabled={isParsing || !rawText.trim()}
                  onClick={handleParseRawSyllabus}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Parsing Chapters...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Parse with AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Parsed Preview Section */}
              {parsedResult && (
                <div className="mt-4 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-cyan-200">
                        Parsed Structure: {parsedResult.subject}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                      {parsedResult.modules.reduce((sum, m) => sum + m.topics.length, 0)} Chapters Extracted
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {parsedResult.modules.map((mod, mIdx) => (
                      <div key={mIdx} className="space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-300">{mod.moduleName}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {mod.topics.map((top, tIdx) => (
                            <div
                              key={tIdx}
                              className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]"
                            >
                              <span className="truncate text-white font-medium">{top.topic}</span>
                              <span className="text-[10px] text-cyan-400 shrink-0 ml-2 font-mono">
                                ~{top.estimatedHours}h
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-cyan-500/20">
                    <button
                      type="button"
                      onClick={() => setParsedResult(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAddTopics}
                      className="editorial-btn-lime py-2 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-black" />
                      <span>Add to My Dynamic Syllabus</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
