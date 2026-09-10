import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Brain,
  Layers,
  Cpu,
  Database
} from 'lucide-react';
import type { TutorMessage, LearningGap, SyllabusTopic } from '../types';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { sound } from '../services/soundService';
import { RotaryKnob } from '../components/hardware/RotaryKnob';
import { FormattedContent } from '../components/FormattedContent';

interface AITutorProps {
  initialTopic?: string;
  gaps: LearningGap[];
  syllabus: SyllabusTopic[];
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
}

export const AITutor: React.FC<AITutorProps> = ({
  initialTopic,
  gaps,
  syllabus,
  onNavigate
}) => {
  const defaultTopic = initialTopic || gaps[0]?.topic || 'B-Trees & B+ Tree Indexing';
  const [selectedTopic, setSelectedTopic] = useState<string>(defaultTopic);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [masteryScore, setMasteryScore] = useState<number>(38); // Starts from initial gap score

  const profile = storageService.getProfile();
  const aiSettings = storageService.getAISettings();

  const quickPrompts = [
    { label: '🎯 Analyze My Gaps', prompt: 'Analyze my current learning gaps and tell me what my top priority is right now.' },
    { label: '📅 Today\'s Timetable', prompt: 'What is on my study schedule today and how should I prioritize my study blocks?' },
    { label: '💡 Explain B-Trees', prompt: 'Explain B-Trees and B+ Trees with an intuitive visual analogy.' },
    { label: '📈 Roadmap to 9.0 CGPA', prompt: 'Given my current 8.42 CGPA and exam marks, what is my optimal roadmap to reach 9.0 CGPA?' },
    { label: '🧪 Socratic Challenge', prompt: 'Give me a challenging conceptual problem on this topic to test my edge-case understanding.' }
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Initialize tutor for the selected topic
  useEffect(() => {
    const gap = gaps.find((g) => g.topic === selectedTopic);
    const initialMastery = gap ? gap.masteryScore : 40;
    setMasteryScore(initialMastery);

    setIsThinking(true);
    aiService
      .getTutorResponse(selectedTopic, [], 'Hello! Teach me this concept.')
      .then((res) => {
        setMessages([
          {
            id: `msg_${Date.now()}`,
            sender: 'ai',
            text: res.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            conceptCheck: res.conceptCheck
              ? {
                  question: res.conceptCheck.question,
                  options: res.conceptCheck.options,
                  correctAnswer: res.conceptCheck.correctAnswer,
                  explanation: res.conceptCheck.explanation
                }
              : undefined
          }
        ]);
        if (res.masteryDelta) {
          setMasteryScore((prev) => Math.min(100, prev + res.masteryDelta!));
        }
      })
      .finally(() => setIsThinking(false));
  }, [selectedTopic]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;

    sound.playClick();
    const userMsg: TutorMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'student',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputVal('');
    setIsThinking(true);

    try {
      const res = await aiService.getTutorResponse(selectedTopic, newHistory, text);
      const aiMsg: TutorMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: res.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        conceptCheck: res.conceptCheck
          ? {
              question: res.conceptCheck.question,
              options: res.conceptCheck.options,
              correctAnswer: res.conceptCheck.correctAnswer,
              explanation: res.conceptCheck.explanation
            }
          : undefined
      };
      setMessages([...newHistory, aiMsg]);
      if (res.masteryDelta) {
        setMasteryScore((prev) => Math.min(100, prev + res.masteryDelta!));
      }
    } catch {
      // Fallback
    } finally {
      setIsThinking(false);
    }
  };

  const handleOptionSelect = (msgId: string, selectedOption: string) => {
    sound.playClick();
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.conceptCheck) {
          const isCorrect = selectedOption === msg.conceptCheck.correctAnswer;
          if (isCorrect) {
            sound.playSuccess();
            setMasteryScore((m) => Math.min(100, m + 15));
          } else {
            sound.playError();
          }

          return {
            ...msg,
            conceptCheck: {
              ...msg.conceptCheck,
              studentAnswer: selectedOption,
              isCorrect
            }
          };
        }
        return msg;
      })
    );
  };

  const handleResetSession = () => {
    sound.playClick();
    setMessages([]);
    setIsThinking(true);
    aiService
      .getTutorResponse(selectedTopic, [], 'Hello! Start from the basics.')
      .then((res) => {
        setMessages([
          {
            id: `msg_${Date.now()}`,
            sender: 'ai',
            text: res.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            conceptCheck: res.conceptCheck
              ? {
                  question: res.conceptCheck.question,
                  options: res.conceptCheck.options,
                  correctAnswer: res.conceptCheck.correctAnswer,
                  explanation: res.conceptCheck.explanation
                }
              : undefined
          }
        ]);
        setMasteryScore(38);
      })
      .finally(() => setIsThinking(false));
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      
      {/* Top Header Card */}
      <div className="liquid-glass-card p-5 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white leading-tight">
                  Interactive AI Tutor Room
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Socratic Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-tight">
                Deep conceptual understanding through guided back-and-forth questioning
              </p>
            </div>
          </div>

          {/* Topic Selector & Reset */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={selectedTopic}
                onChange={(e) => {
                  sound.playClick();
                  setSelectedTopic(e.target.value);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-slate-200 focus:outline-none focus:border-purple-500/50"
              >
                <option value="General Academic Advisor & Learning Gaps">
                  🎓 General Academic Advisor (All Gaps & Records)
                </option>
                <optgroup label="Active Learning Gaps">
                  {gaps.map((g) => (
                    <option key={g.id} value={g.topic}>
                      {g.topic} ({g.severity.toUpperCase()} Gap)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other Curriculum Topics">
                  {syllabus
                    .filter((s) => !gaps.some((g) => g.topic === s.topic))
                    .map((s) => (
                      <option key={s.id} value={s.topic}>
                        {s.topic}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <button
              onClick={handleResetSession}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white"
              title="Restart tutor conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Hardware Status Banner: Live Model & Student Data Link */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3.5 pt-3 border-t border-white/[0.08] text-[11px] font-mono">
          <div className="flex items-center gap-2 bg-black/50 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-400 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider">
              AI Engine: {aiSettings.model || 'liquid/lfm-2.5-2.6b:free'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-black/50 border border-purple-500/30 px-3 py-1.5 rounded-lg text-purple-300 shadow-inner">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-medium">
              Student Context Synced: <strong className="text-white">{profile.name}</strong> • CGPA <strong className="text-pink-400">{profile.cgpa}</strong> • <strong className="text-amber-400">{gaps.length} Active Gaps</strong>
            </span>
          </div>
        </div>

        {/* Live Mastery Gauge & Hardware Deck */}
        <div className="mt-4 pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-6">
          
          <div className="flex items-center gap-6">
            <RotaryKnob
              value={masteryScore}
              min={0}
              max={100}
              size="md"
              variant="dark"
              label="UNDERSTANDING"
              subLabel={`${masteryScore}% Calibrated`}
              onChange={(val) => setMasteryScore(val)}
            />

            <div className="space-y-1 max-w-xs">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="font-bold uppercase tracking-wider">Concept Comprehension Gauge</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                Rises autonomously as you answer Socratic comprehension checks correctly.
              </p>
            </div>
          </div>

          {masteryScore >= 65 && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('tests', { topic: selectedTopic });
              }}
              className="btn-skeuo-orange py-2 px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
            >
              <span>Verify Retention in Test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Chat Conversation Scroll Area */}
      <div className="liquid-glass p-4 sm:p-6 min-h-[420px] max-h-[540px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0 mt-1 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 space-y-3 ${
                  isAi
                    ? 'liquid-glass-card border-white/15 text-slate-100 shadow-lg'
                    : 'bg-gradient-to-br from-purple-700 to-pink-600 text-white rounded-tr-none shadow-md font-medium text-sm'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono pb-1 border-b border-white/[0.06]">
                  <span className={isAi ? 'text-purple-300 font-bold' : 'text-white font-bold'}>
                    {isAi ? 'Mind Bridge AI Tutor' : 'You (Sanjay Aron)'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Body Text (Markdown & LaTeX Math Formatted) */}
                <FormattedContent content={msg.text} />

                {/* Embedded Socratic Concept Check Question */}
                {isAi && msg.conceptCheck && (
                  <div className="mt-3 p-4 rounded-xl bg-black/50 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Conceptual Understanding Check
                      </span>
                      {msg.conceptCheck.studentAnswer && (
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            msg.conceptCheck.isCorrect
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {msg.conceptCheck.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Correct (+15% Mastery)
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Conceptual Misconception
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <FormattedContent
                      content={msg.conceptCheck.question}
                      className="text-xs font-semibold text-white"
                    />

                    {/* Options */}
                    {msg.conceptCheck.options && (
                      <div className="space-y-1.5">
                        {msg.conceptCheck.options.map((opt, optIdx) => {
                          const isSelected = msg.conceptCheck?.studentAnswer === opt;
                          const isTheCorrectAnswer = opt === msg.conceptCheck?.correctAnswer;
                          const hasAnswered = !!msg.conceptCheck?.studentAnswer;

                          let btnStyle =
                            'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-slate-300';
                          if (hasAnswered) {
                            if (isTheCorrectAnswer) {
                              btnStyle =
                                'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-semibold';
                            } else if (isSelected && !msg.conceptCheck?.isCorrect) {
                              btnStyle =
                                'bg-rose-950/40 border-rose-500/50 text-rose-200 line-through';
                            } else {
                              btnStyle = 'bg-white/[0.02] border-white/5 opacity-50';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={hasAnswered}
                              onClick={() => handleOptionSelect(msg.id, opt)}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${btnStyle}`}
                            >
                              <span className="w-5 h-5 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 mt-0.5">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <FormattedContent content={opt} className="inline text-xs" />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation after answering */}
                    {msg.conceptCheck.studentAnswer && msg.conceptCheck.explanation && (
                      <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-slate-300 leading-relaxed">
                        <strong className="text-purple-300 font-mono">Why: </strong>
                        <FormattedContent content={msg.conceptCheck.explanation} className="inline text-[11px]" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1 shadow-md">
                  JA
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center gap-3 text-slate-400 text-xs font-mono animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
              <Bot className="w-4 h-4" />
            </div>
            <span>Mind Bridge AI is formulating Socratic question...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Interactive Prompt Chips */}
      <div className="flex flex-wrap gap-2 items-center px-1">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-pink-400" /> Quick Ask:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isThinking}
            onClick={() => handleSendMessage(qp.prompt)}
            className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] hover:border-purple-500/40 border border-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="liquid-glass-card p-2.5 flex items-center gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage(inputVal);
          }}
          placeholder={`Ask or explain your thought process regarding "${selectedTopic}"...`}
          className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
        />

        <button
          type="button"
          disabled={!inputVal.trim() || isThinking}
          onClick={() => handleSendMessage(inputVal)}
          className="btn-skeuo-primary px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
