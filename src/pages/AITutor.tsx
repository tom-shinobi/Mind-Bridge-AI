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
  Database,
  Maximize2,
  Minimize2
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const profile = storageService.getProfile();
  const aiSettings = storageService.getAISettings();

  const quickPrompts = [
    { label: '🎯 Analyze My Gaps', prompt: 'Analyze my current learning gaps and tell me what my top priority is right now.' },
    { label: '📅 Today\'s Timetable', prompt: 'What is on my study schedule today and how should I prioritize my study blocks?' },
    { label: '💡 Explain B-Trees', prompt: 'Explain B-Trees and B+ Trees with an intuitive visual analogy.' },
    { label: '📈 Roadmap to 9.0 CGPA', prompt: 'Given my current 8.42 CGPA and exam marks, what is my optimal roadmap to reach 9.0 CGPA?' },
    { label: '🧪 Socratic Challenge', prompt: 'Give me a challenging conceptual problem on this topic to test my edge-case understanding.' }
  ];

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll directly inside the chat window container
  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, isFullscreen]);

  // Handle Escape key to close Fullscreen mode smoothly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

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

  // Shared Message List Component
  const renderMessagesList = () => (
    <div className="space-y-4">
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
              className={`rounded-2xl p-4 sm:p-5 space-y-3 transition-all ${
                isAi
                  ? 'apple-liquid-glass border-white/20 text-slate-100 shadow-xl max-w-3xl lg:max-w-4xl w-full'
                  : 'bg-gradient-to-br from-purple-700 to-pink-600 text-white rounded-tr-none shadow-md font-medium text-sm ml-auto max-w-xl'
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono pb-1 border-b border-white/[0.06]">
                <span className={isAi ? 'text-purple-300 font-bold' : 'text-white font-bold'}>
                  {isAi ? 'Mind Bridge AI Tutor' : 'You (Sanjay Aron)'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Body Text (Markdown & LaTeX Math Formatted with Word-Break & Overflow auto) */}
              <FormattedContent
                content={msg.text}
                className="break-words max-w-full leading-relaxed"
              />

              {/* Embedded Socratic Concept Check Question */}
              {isAi && msg.conceptCheck && (
                <div className="mt-3 p-4 rounded-xl bg-black/50 border border-purple-500/30 space-y-3 shadow-inner">
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
                    className="text-xs sm:text-sm font-semibold text-white break-words"
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
                            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 break-words ${btnStyle}`}
                          >
                            <span className="w-5 h-5 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 mt-0.5">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <FormattedContent content={opt} className="inline text-xs sm:text-sm break-words" />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation after answering */}
                  {msg.conceptCheck.studentAnswer && msg.conceptCheck.explanation && (
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-slate-300 leading-relaxed break-words">
                      <strong className="text-purple-300 font-mono">Why: </strong>
                      <FormattedContent content={msg.conceptCheck.explanation} className="inline text-xs" />
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
        <div className="flex items-center gap-3 text-slate-400 text-xs font-mono animate-pulse p-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
            <Bot className="w-4 h-4" />
          </div>
          <span>Mind Bridge AI is formulating Socratic response...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );

  // Shared Bottom Controls Component
  const renderBottomControls = () => (
    <div className="space-y-2.5">
      {/* Quick Interactive Prompt Chips */}
      <div className="flex flex-wrap gap-2 items-center px-1">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Ask:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isThinking}
            onClick={() => handleSendMessage(qp.prompt)}
            className="text-[11px] font-mono px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] hover:border-white/20 border border-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Apple Spotlight / Liquid Glass Input Bar */}
      <div className="apple-liquid-glass p-2 flex items-center gap-2 rounded-full border border-white/25 pl-4 pr-2 shadow-2xl">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage(inputVal);
          }}
          placeholder={`Ask or explain your thought process regarding "${selectedTopic}"...`}
          className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
        />

        <button
          type="button"
          disabled={!inputVal.trim() || isThinking}
          onClick={() => handleSendMessage(inputVal)}
          className="btn-apple-primary px-5 py-2 text-xs font-medium flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  // 1. Fullscreen Overlay Mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#030712]/95 backdrop-blur-3xl flex flex-col p-3 sm:p-5 overflow-hidden animate-fade-in font-body">
        {/* Optical Chromatic Fluid Silk Ribbons Canvas */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
          <div className="chromatic-ribbon-purple -top-[120px] left-[15%]" />
          <div className="chromatic-ribbon-cyan bottom-[5%] right-[10%]" />
          <div className="chromatic-ribbon-magenta top-[40%] right-[30%]" />
        </div>

        {/* Minimalist Apple Liquid Glass Top Bar */}
        <div className="apple-liquid-glass p-3 sm:p-4 relative z-10 flex flex-wrap items-center justify-between gap-3 mb-3 flex-shrink-0 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Mind Bridge AI Tutor Room
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Socratic Mode
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Fullscreen
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Full-viewport dialogue • Press Esc to exit fullscreen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Topic Switcher */}
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={selectedTopic}
                onChange={(e) => {
                  sound.playClick();
                  setSelectedTopic(e.target.value);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-slate-200 focus:outline-none focus:border-purple-500/50"
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

            {/* Comprehension Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-purple-500/30 text-xs font-mono text-purple-300">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>{masteryScore}% Calibrated</span>
            </div>

            {/* Verify Retention CTA */}
            {masteryScore >= 65 && (
              <button
                onClick={() => {
                  sound.playClick();
                  setIsFullscreen(false);
                  onNavigate('tests', { topic: selectedTopic });
                }}
                className="btn-apple-primary py-1.5 px-3 text-xs font-mono flex items-center gap-1.5"
              >
                <span>Verify in Test</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {/* Reset */}
            <button
              onClick={handleResetSession}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white transition-all"
              title="Restart tutor conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Exit Fullscreen */}
            <button
              onClick={() => {
                sound.playClick();
                setIsFullscreen(false);
              }}
              className="btn-apple-glass py-1.5 px-3 text-xs flex items-center gap-1.5 text-slate-200 hover:text-white"
              title="Exit Fullscreen (Esc)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Fullscreen Chat Console Frame with Dedicated Scrollable Messages Area */}
        <div className="apple-liquid-glass flex-1 min-h-0 flex flex-col max-w-5xl w-full mx-auto relative overflow-hidden shadow-2xl">
          {/* Scrollable Messages Container */}
          <div
            ref={chatScrollRef}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4 custom-scrollbar"
          >
            {renderMessagesList()}
          </div>

          {/* Fullscreen Bottom Input Dock Pinned Inside Console Card */}
          <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-black/40 backdrop-blur-xl flex-shrink-0">
            {renderBottomControls()}
          </div>
        </div>
      </div>
    );
  }

  // 2. Standard Embedded Viewport
  return (
    <div className="space-y-4 animate-fade-in pb-12 flex flex-col">
      
      {/* Top Header Card */}
      <div className="apple-liquid-glass p-5 relative overflow-hidden">
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

          {/* Topic Selector, Reset & Fullscreen Toggle */}
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

            {/* Expand Fullscreen Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsFullscreen(true);
              }}
              className="btn-apple-glass py-1.5 px-3 text-xs flex items-center gap-1.5 text-cyan-300 hover:text-white border-cyan-500/30 hover:border-cyan-400/50"
              title="Open Fullscreen Chat"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen</span>
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
              className="btn-apple-primary py-2 px-4 text-xs font-mono font-medium tracking-wider flex items-center gap-2"
            >
              <span>Verify Retention in Test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Embedded Chat Console Card with Fixed Viewport Height & Independent Internal Scrolling */}
      <div className="apple-liquid-glass h-[680px] lg:h-[750px] flex flex-col relative overflow-hidden shadow-2xl">
        {/* Console Header Bar */}
        <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0 bg-black/25 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono text-slate-300">
              Topic Scope: <strong className="text-white font-bold">{selectedTopic}</strong>
            </span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setIsFullscreen(true);
            }}
            className="btn-apple-glass py-1 px-3 text-[11px] flex items-center gap-1.5 text-cyan-300 hover:text-white"
            title="Open Fullscreen (Esc to exit)"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Fullscreen Mode</span>
          </button>
        </div>

        {/* Scrollable Messages Container */}
        <div
          ref={chatScrollRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4 custom-scrollbar"
        >
          {renderMessagesList()}
        </div>

        {/* Pinned Bottom Controls inside the Console Card */}
        <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-black/40 backdrop-blur-xl flex-shrink-0 space-y-2.5">
          {renderBottomControls()}
        </div>
      </div>

    </div>
  );
};
