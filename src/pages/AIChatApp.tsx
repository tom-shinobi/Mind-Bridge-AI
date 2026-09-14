import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Bot,
  Settings,
  Plus,
  Mic,
  MicOff,
  ArrowUp,
  Image as ImageIcon,
  Check,
  RefreshCw,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  HelpCircle,
  Layers,
  Sparkles,
  BookOpen,
  Key,
  Maximize2,
  Minimize2,
  AlertTriangle
} from 'lucide-react';
import type { TutorMessage, LearningGap, SyllabusTopic, StudentProfile } from '../types';
import { aiService, type ApiStatus } from '../services/aiService';
import { storageService, resolveGeminiApiKey, isGoogleApiKey } from '../services/storageService';
import { speechService } from '../services/speechService';
import { sound } from '../services/soundService';
import { FormattedContent } from '../components/FormattedContent';

interface AIChatAppProps {
  initialTopic?: string;
  gaps: LearningGap[];
  syllabus: SyllabusTopic[];
  profile?: StudentProfile;
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
}

// Sample educational diagrams for quick multimodal vision testing (matches reference Image 2)
const SAMPLE_DIAGRAMS = [
  {
    name: 'Binary Molecular Compounds Notes',
    description: 'Chemistry lesson notes with molecular formulas (S2Cl2, IF5) and bond diagrams',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%230f172a"><rect width="600" height="400" fill="%230f172a" rx="20"/><rect x="20" y="20" width="560" height="360" fill="%231e293b" rx="16" stroke="%2338bdf8" stroke-width="2"/><text x="40" y="60" fill="%2338bdf8" font-family="monospace" font-weight="bold" font-size="20">LESSON PLAN: BINARY MOLECULAR COMPOUNDS</text><text x="40" y="95" fill="%23e2e8f0" font-family="sans-serif" font-size="14">Prefix rules: 1=mono, 2=di, 3=tri, 4=tetra, 5=penta</text><circle cx="120" cy="180" r="32" fill="%23818cf8"/><text x="108" y="186" fill="white" font-weight="bold" font-size="16">S</text><line x1="152" y1="180" x2="200" y2="180" stroke="%23f43f5e" stroke-width="4"/><circle cx="232" cy="180" r="32" fill="%23818cf8"/><text x="220" y="186" fill="white" font-weight="bold" font-size="16">S</text><line x1="264" y1="180" x2="312" y2="150" stroke="%2310b981" stroke-width="3"/><circle cx="340" cy="140" r="26" fill="%2334d399"/><text x="330" y="146" fill="white" font-weight="bold" font-size="14">Cl</text><line x1="88" y1="180" x2="40" y2="210" stroke="%2310b981" stroke-width="3"/><circle cx="28" cy="226" r="26" fill="%2334d399"/><text x="18" y="232" fill="white" font-weight="bold" font-size="14">Cl</text><text x="40" y="285" fill="%23a7f3d0" font-family="monospace" font-size="16">Formula: Disulfur Dichloride (S2Cl2)</text><text x="40" y="325" fill="%23fbcfe8" font-family="monospace" font-size="16">Second Example: Iodine Pentafluoride (IF5)</text><text x="40" y="355" fill="%2394a3b8" font-family="sans-serif" font-size="12">Question: Why does the first element drop "mono-" if count is 1?</text></svg>'
  },
  {
    name: 'B-Tree Node Invariant Scratchpad',
    description: 'Data structures scratchpad diagram of 2-3-4 tree node split and key pointers',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380" fill="%230f172a"><rect width="600" height="380" fill="%23090d16" rx="20"/><rect x="20" y="20" width="560" height="340" fill="%23131b2e" rx="16" stroke="%23a855f7" stroke-width="2"/><text x="40" y="55" fill="%23c084fc" font-family="monospace" font-weight="bold" font-size="18">B-TREE NODE INVARIANT (Order M=4)</text><rect x="180" y="90" width="240" height="50" rx="8" fill="%233b82f6" stroke="white" stroke-width="1.5"/><text x="220" y="122" fill="white" font-weight="bold" font-size="18">K1: 20 | K2: 50</text><line x1="200" y1="140" x2="110" y2="210" stroke="%2360a5fa" stroke-width="3"/><line x1="300" y1="140" x2="300" y2="210" stroke="%2360a5fa" stroke-width="3"/><line x1="400" y1="140" x2="490" y2="210" stroke="%2360a5fa" stroke-width="3"/><rect x="40" y="210" width="140" height="46" rx="8" fill="%231e293b" stroke="%2393c5fd" stroke-width="1.5"/><text x="65" y="238" fill="%2393c5fd" font-size="15">Keys &lt; 20</text><rect x="230" y="210" width="140" height="46" rx="8" fill="%231e293b" stroke="%2393c5fd" stroke-width="1.5"/><text x="245" y="238" fill="%2393c5fd" font-size="15">20 &lt; K &lt; 50</text><rect x="420" y="210" width="140" height="46" rx="8" fill="%231e293b" stroke="%2393c5fd" stroke-width="1.5"/><text x="445" y="238" fill="%2393c5fd" font-size="15">Keys &gt; 50</text><text x="40" y="300" fill="%23f472b6" font-family="monospace" font-size="14">Root Split Rule: Median element promotes upward.</text><text x="40" y="330" fill="%2394a3b8" font-family="sans-serif" font-size="13">Search Time Complexity: O(log_M N) disk block accesses.</text></svg>'
  }
];

export const AIChatApp: React.FC<AIChatAppProps> = ({
  initialTopic,
  gaps,
  syllabus,
  profile = storageService.getProfile(),
  onNavigate
}) => {
  // Topic selection
  const defaultTopic =
    initialTopic || (gaps.length > 0 ? gaps[0].topic : 'General Academic Advisor & Learning Gaps');
  const [selectedTopic, setSelectedTopic] = useState<string>(defaultTopic);

  // Chat conversation state
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Multimodal image attachment
  const [attachedImage, setAttachedImage] = useState<{ base64: string; name: string; mimeType: string } | null>(null);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Speech-to-Text state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [sttError, setSttError] = useState<string | null>(null);

  // Audio response state
  const [isVoiceModeActive, setIsVoiceModeActive] = useState<boolean>(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Reaction picker state
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);

  // Streaming message state
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  // Settings & connection state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNoticeDismissed, setIsNoticeDismissed] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>(aiService.getApiStatus());
  const [keyInput, setKeyInput] = useState<string>('');
  const [modelInput, setModelInput] = useState<string>(() => {
    const m = storageService.getAISettings().model;
    return (m && m !== 'gemini-2.5-flash' && m !== 'gemini-2.0-flash' && m !== 'gemini-3.8-flash' && m !== 'gemini-3.6-flash') ? m : 'gemini-3.5-flash';
  });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number; testing?: boolean } | null>(null);

  // UI styling theme
  const [isImmersionMode, setIsImmersionMode] = useState<boolean>(false);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Keyboard shortcut to exit immersion mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImmersionMode) {
        setIsImmersionMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImmersionMode]);

  // Listen to AI service status updates
  useEffect(() => {
    const unsub = aiService.subscribe((status) => {
      setApiStatus(status);
    });
    return () => unsub();
  }, []);

  // Ping verification when settings modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      aiService.testConnection(undefined, modelInput);
    }
  }, [isSettingsOpen]);

  // Load conversation or set initial welcome message
  useEffect(() => {
    const storageKey = `mba_imessage_chat_${encodeURIComponent(selectedTopic)}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
        return;
      } catch {}
    }

    // Default welcome message in authentic iMessage style
    const initialMsg: TutorMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'ai',
      text: `Hey **${profile.name || 'there'}**! 👋 I'm **Horizon AI**, your personal academic tutor.\n\nWe're tuned into **${selectedTopic}** (CGPA: ${profile.cgpa || '8.4'} • ${gaps.length} active gaps).\n\nAsk me any concept question, tap **+** to send a photo of your handwritten notes or diagrams, or tap the **microphone** to voice-chat! 🚀`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initialMsg]);
  }, [selectedTopic, profile.name]);

  // Save conversation
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = `mba_imessage_chat_${encodeURIComponent(selectedTopic)}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch {}
    }
  }, [messages, selectedTopic]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isListening]);

  // Handle Speech-to-Text toggle
  const toggleSpeechRecognition = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      sound.playClick();
      return;
    }

    setSttError(null);
    sound.playClick();

    const started = speechService.startListening({
      onInterim: (text) => {
        setInputMessage(text);
      },
      onFinal: (text) => {
        setInputMessage(text);
        setIsListening(false);
      },
      onError: (errMsg) => {
        setSttError(errMsg);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (started) {
      setIsListening(true);
    }
  };

  // Handle file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAttachedImage({
        base64,
        name: file.name,
        mimeType: file.type
      });
      setIsActionSheetOpen(false);
      sound.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop image into window
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage({
          base64: reader.result as string,
          name: file.name,
          mimeType: file.type
        });
        sound.playSuccess();
      };
      reader.readAsDataURL(file);
    }
  };

  // Send message
  const handleSendMessage = async (customText?: string, asVoiceMemo = false) => {
    const textToSend = (customText ?? inputMessage).trim();
    if (!textToSend && !attachedImage) return;

    // Stop STT if active
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    }

    sound.playClick();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: TutorMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      text: textToSend || 'Examining attached notes/diagram...',
      timestamp,
      imageUrl: attachedImage?.base64,
      imageName: attachedImage?.name,
      isAudioVoiceNote: asVoiceMemo,
      audioDuration: asVoiceMemo ? '0:06' : undefined
    };

    const nextHistory = [...messages, userMessage];
    const aiMessageId = `ai-${Date.now()}`;
    const placeholderAiMsg: TutorMessage = {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...nextHistory, placeholderAiMsg]);
    setInputMessage('');
    const imagePayload = attachedImage ? { base64: attachedImage.base64, mimeType: attachedImage.mimeType } : undefined;
    setAttachedImage(null);
    setIsLoading(true);
    setStreamingMessageId(aiMessageId);

    try {
      const response = await aiService.streamTutorResponse(
        selectedTopic,
        nextHistory,
        textToSend,
        (_chunk, accumulatedClean) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId
                ? { ...m, text: accumulatedClean }
                : m
            )
          );
        },
        imagePayload
      );

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? {
                ...m,
                text: response.message,
                conceptCheck: response.conceptCheck || undefined
              }
            : m
        )
      );
      sound.playSuccess();

      // Read out aloud if voice mode is enabled
      if (isVoiceModeActive) {
        aiService.speak(response.message);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? {
                ...m,
                text: "I encountered a hiccup connecting to Google AI Studio. Operating in offline Socratic mode — please feel free to try again!"
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  // Concept check answer handler
  const handleAnswerConceptCheck = (messageId: string, option: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.conceptCheck) return msg;
        const isCorrect = option === msg.conceptCheck.correctAnswer;
        if (isCorrect) sound.playSuccess();
        else sound.playClick();
        return {
          ...msg,
          conceptCheck: {
            ...msg.conceptCheck,
            studentAnswer: option,
            isCorrect
          }
        };
      })
    );
  };

  // Tapback reaction handler
  const handleAddReaction = (messageId: string, emoji: string) => {
    sound.playClick();
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions || [];
        const already = existing.find((r) => r.emoji === emoji && r.by === 'student');
        const updated = already
          ? existing.filter((r) => !(r.emoji === emoji && r.by === 'student'))
          : [...existing, { emoji, by: 'student' as const }];
        return { ...m, reactions: updated };
      })
    );
    setActiveReactionMessageId(null);
  };

  // Clear conversation
  const handleClearChat = () => {
    if (confirm('Clear conversation history for this topic?')) {
      const storageKey = `mba_imessage_chat_${encodeURIComponent(selectedTopic)}`;
      localStorage.removeItem(storageKey);
      setMessages([]);
      setIsActionSheetOpen(false);
      sound.playClick();
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`${
        isImmersionMode
          ? 'fixed inset-0 z-50 bg-[#080c14]/95'
          : 'relative w-full h-full flex-1 min-h-0'
      } flex flex-col overflow-hidden font-sans text-slate-100 bg-transparent`}
    >
      {/* ========================================================================= */}
      {/* APPLE iMESSAGE TOP HEADER BAR */}
      {/* ========================================================================= */}
      <header className="flex-none relative z-20 backdrop-blur-2xl bg-black/70 border-b border-white/10 shadow-lg pt-[max(0.6rem,env(safe-area-inset-top,0px))]">
        {/* Row 1: Primary Navigation & Contact Bar (Symmetric on Mobile & Desktop) */}
        <div className="px-3 sm:px-6 md:px-8 py-2 md:py-2.5 flex items-center justify-between gap-2">
          
          {/* Left: Back Button & (on Desktop) Topic Selector */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                if (isImmersionMode) {
                  setIsImmersionMode(false);
                } else {
                  onNavigate('dashboard');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all font-mono text-xs font-semibold shadow-md active:scale-95 cursor-pointer touch-press"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Back</span>
            </button>

            {/* Topic Scope Capsule Picker (Desktop Inline md+) */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium backdrop-blur-md">
              <Layers className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <select
                value={selectedTopic}
                onChange={(e) => {
                  sound.playClick();
                  setSelectedTopic(e.target.value);
                }}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer max-w-[180px] lg:max-w-[240px] truncate"
              >
                <option value="General Academic Advisor & Learning Gaps" className="bg-slate-900 text-white">
                  🎓 General Advisor (All Gaps)
                </option>
                <optgroup label="Active Learning Gaps" className="bg-slate-900 text-white">
                  {gaps.map((g) => (
                    <option key={g.id} value={g.topic} className="bg-slate-900 text-white">
                      {g.topic} ({g.severity.toUpperCase()})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Syllabus Modules" className="bg-slate-900 text-white">
                  {syllabus
                    .filter((s) => !gaps.some((g) => g.topic === s.topic))
                    .map((s) => (
                      <option key={s.id} value={s.topic} className="bg-slate-900 text-white">
                        {s.topic}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Center: Contact Info (Horizon AI Tutor - Centered & Balanced) */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none py-0.5 px-2 rounded-full hover:bg-white/5 transition-colors"
            onClick={() => setIsSettingsOpen(true)}
            title="Horizon AI System Details & Key Settings"
          >
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[2px] shadow-[0_0_16px_rgba(56,189,248,0.45)]">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 animate-pulse" />
                </div>
              </div>
              {/* Online pulsing indicator */}
              <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-[0_0_8px_#10b981]" />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1 leading-none">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">Horizon AI</span>
                <span className="text-[10px] text-cyan-400 font-bold">›</span>
              </div>
              <span className="text-[9px] font-mono text-cyan-400/90 tracking-wide mt-0.5 truncate max-w-[120px] sm:max-w-[200px]">
                {apiStatus.isLive
                  ? `${apiStatus.model?.split('-').slice(0, 3).join('-') || 'gemini-flash'} • Live (${apiStatus.latencyMs || 180}ms)`
                  : 'Horizon Local AI'}
              </span>
            </div>
          </div>

          {/* Right: Actions (Voice Call, Fullscreen, AI Config) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Voice Speech Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                setIsVoiceModeActive(!isVoiceModeActive);
                if (!isVoiceModeActive && messages.length > 0) {
                  const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
                  if (lastAi) aiService.speak(lastAi.text);
                } else {
                  aiService.stopSpeaking();
                }
              }}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isVoiceModeActive
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_12px_rgba(0,122,255,0.4)]'
                  : 'bg-white/10 border-white/15 text-slate-300 hover:text-white'
              }`}
              title={isVoiceModeActive ? 'Voice Read-Aloud: ON (Click to mute)' : 'Turn Voice Read-Aloud ON'}
            >
              {isVoiceModeActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-70" />}
            </button>

            {/* Fullscreen / Immersion Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                setIsImmersionMode(!isImmersionMode);
              }}
              className={`hidden sm:flex p-2 rounded-full border transition-all cursor-pointer ${
                isImmersionMode
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                  : 'bg-white/10 border-white/15 text-slate-300 hover:text-white'
              }`}
              title={isImmersionMode ? 'Exit Borderless Fullscreen (Esc)' : 'Enter Borderless Fullscreen'}
            >
              {isImmersionMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* AI Settings / Model Diagnostics Modal Trigger */}
            <button
              onClick={() => {
                sound.playClick();
                setIsSettingsOpen(true);
              }}
              className="p-2 rounded-full bg-white/10 border border-white/15 text-slate-300 hover:text-white hover:border-purple-400 transition-all cursor-pointer"
              title="Google Gemini AI Studio & Model Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2 (Mobile only): Clean Full-Width Topic Context Strip */}
        <div className="md:hidden w-full px-3 py-1.5 bg-black/40 border-t border-white/5 flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium backdrop-blur-md w-full max-w-sm justify-center shadow-inner">
            <Layers className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex-shrink-0">Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => {
                sound.playClick();
                setSelectedTopic(e.target.value);
              }}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer flex-1 truncate text-center font-medium"
            >
              <option value="General Academic Advisor & Learning Gaps" className="bg-slate-900 text-white">
                🎓 General Advisor (All Gaps)
              </option>
              <optgroup label="Active Learning Gaps" className="bg-slate-900 text-white">
                {gaps.map((g) => (
                  <option key={g.id} value={g.topic} className="bg-slate-900 text-white">
                    {g.topic} ({g.severity.toUpperCase()})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Syllabus Modules" className="bg-slate-900 text-white">
                {syllabus
                  .filter((s) => !gaps.some((g) => g.topic === s.topic))
                  .map((s) => (
                    <option key={s.id} value={s.topic} className="bg-slate-900 text-white">
                      {s.topic}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2-COLUMN VIEWPORT: Left Chat Glass Panel + Right Motivation Sidebar */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col xl:flex-row gap-3 sm:gap-4 p-2 sm:p-3 md:p-4 max-w-7xl w-full mx-auto overflow-hidden">
        
        {/* Main Chat Panel */}
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl sm:rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl overflow-hidden">
          
          <div
            ref={chatScrollRef}
            className="relative z-10 flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 md:px-8 py-3 sm:py-4 space-y-4 custom-scrollbar"
          >
        {/* Date separator pill */}
        <div className="flex justify-center my-2">
          <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] font-mono text-slate-300 shadow-sm backdrop-blur-md">
            Today {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Notice Banner if AI provider has an active error */}
        {apiStatus.lastError && !isNoticeDismissed && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200 backdrop-blur-xl animate-fade-in shadow-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-amber-300">AI Notice: </span>
                <span className="text-slate-300">{apiStatus.statusMessage}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-[11px] font-medium transition-all"
              >
                Configure Key
              </button>
              <button
                type="button"
                onClick={() => setIsNoticeDismissed(true)}
                className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-300 hover:text-white transition-all"
                title="Dismiss notice"
                aria-label="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.sender === 'student';
          const isLast = index === messages.length - 1;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group relative transition-all animate-fade-in`}
            >
              {/* Message Bubble Container */}
              <div className="relative max-w-[85%] sm:max-w-[78%]">
                {/* User Bubble (Apple vibrant blue #007AFF) */}
                {isUser ? (
                  <div
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setActiveReactionMessageId(msg.id);
                    }}
                    className="relative bg-[#007AFF] hover:bg-[#0071E3] text-white px-4 py-3 rounded-[22px] rounded-br-[4px] shadow-md transition-all space-y-2 leading-relaxed text-sm font-normal"
                  >
                    {/* Attached Image inside User Bubble (MMS style) */}
                    {msg.imageUrl && (
                      <div className="rounded-xl overflow-hidden border border-white/25 bg-black/30 shadow-inner max-w-sm cursor-pointer">
                        <img
                          src={msg.imageUrl}
                          alt={msg.imageName || 'Attached Homework / Notes'}
                          onClick={() => setExpandedImageUrl(msg.imageUrl || null)}
                          className="w-full max-h-64 object-contain hover:scale-105 transition-transform"
                        />
                        {msg.imageName && (
                          <div className="p-1.5 text-[11px] font-mono text-blue-100 bg-black/40 truncate">
                            📷 {msg.imageName}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audio Voice Note Bubble (Image 1 Phone 3 style) */}
                    {msg.isAudioVoiceNote ? (
                      <div className="flex items-center gap-3 py-1 min-w-[200px]">
                        <button
                          type="button"
                          onClick={() => {
                            if (playingVoiceId === msg.id) {
                              aiService.stopSpeaking();
                              setPlayingVoiceId(null);
                            } else {
                              aiService.speak(msg.text);
                              setPlayingVoiceId(msg.id);
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-white text-[#007AFF] flex items-center justify-center shadow-md flex-shrink-0"
                        >
                          {playingVoiceId === msg.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>
                        {/* Audio Waveform visualization */}
                        <div className="flex-1 flex items-center gap-[3px] h-6 overflow-hidden">
                          {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 30, 85, 60, 40].map((h, idx) => (
                            <span
                              key={idx}
                              style={{ height: `${h}%` }}
                              className={`w-[3px] rounded-full ${playingVoiceId === msg.id ? 'bg-white animate-pulse' : 'bg-white/70'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-mono opacity-80">{msg.audioDuration || '0:06'}</span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                ) : (
                  /* AI Tutor Bubble (Apple frosted liquid glass #26252a) */
                  <div
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setActiveReactionMessageId(msg.id);
                    }}
                    className="relative bg-black/60 dark:bg-[#20222a]/90 backdrop-blur-2xl border border-white/15 text-slate-100 px-4 py-3.5 rounded-[22px] rounded-bl-[4px] shadow-xl transition-all space-y-3 leading-relaxed text-sm"
                  >
                    {/* Header badge inside AI bubble */}
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 text-[11px] font-mono text-cyan-300">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span className="font-semibold">Horizon AI</span>
                      </div>
                      <button
                        onClick={() => aiService.speak(msg.text)}
                        className="text-slate-400 hover:text-white p-0.5 transition-colors"
                        title="Listen to Horizon AI read this answer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Formatted Markdown & KaTeX Math Content */}
                    {msg.text ? (
                      <div className="relative">
                        <FormattedContent content={msg.text} className="text-slate-200 text-sm leading-relaxed" />
                        {streamingMessageId === msg.id && (
                          <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle rounded-sm shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-cyan-300/80 text-xs font-mono py-1 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        <span>Horizon AI is thinking and formulating response...</span>
                        <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse align-middle rounded-sm shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      </div>
                    )}

                    {/* Interactive Concept Check Card */}
                    {msg.conceptCheck && (
                      <div className="mt-3 p-3.5 rounded-xl bg-white/[0.06] border border-purple-500/30 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
                          <HelpCircle className="w-4 h-4 text-purple-400" />
                          <span>Concept Check</span>
                        </div>
                        <FormattedContent content={msg.conceptCheck.question} className="text-xs text-white font-medium" />

                        <div className="grid grid-cols-1 gap-1.5 pt-1">
                          {msg.conceptCheck.options?.map((opt, oIdx) => {
                            const isSelected = msg.conceptCheck?.studentAnswer === opt;
                            const isCorrectAnswer = opt === msg.conceptCheck?.correctAnswer;
                            const hasAnswered = Boolean(msg.conceptCheck?.studentAnswer);

                            let btnStyle = 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10';
                            if (hasAnswered) {
                              if (isCorrectAnswer) {
                                btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold';
                              } else if (isSelected) {
                                btnStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300';
                              } else {
                                btnStyle = 'bg-white/5 border-white/5 text-slate-500 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={hasAnswered}
                                onClick={() => handleAnswerConceptCheck(msg.id, opt)}
                                className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                              >
                                <FormattedContent inline content={opt} className="text-xs font-medium flex-1 break-words" />
                                {hasAnswered && isCorrectAnswer && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {msg.conceptCheck.studentAnswer && msg.conceptCheck.explanation && (
                          <div className="text-[11px] font-mono text-purple-200/90 pt-1 border-t border-white/10 flex items-start gap-1.5">
                            <span className="flex-shrink-0">💡</span>
                            <FormattedContent inline content={msg.conceptCheck.explanation} className="text-[11px]" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Tapback Reactions Display */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div
                    className={`absolute -top-3 ${
                      isUser ? '-left-2' : '-right-2'
                    } flex items-center gap-0.5 bg-slate-900/90 border border-white/20 px-2 py-0.5 rounded-full shadow-lg text-xs`}
                  >
                    {msg.reactions.map((r, rIdx) => (
                      <span key={rIdx} className="scale-110">
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                )}

                {/* Tapback Reaction Picker Overlay */}
                {activeReactionMessageId === msg.id && (
                  <div
                    className={`absolute -top-10 ${
                      isUser ? 'right-0' : 'left-0'
                    } z-30 flex items-center gap-2 bg-slate-900/95 border border-white/25 px-3 py-1 rounded-full shadow-2xl animate-fade-in backdrop-blur-xl`}
                  >
                    {['❤️', '👍', '👎', '😂', '‼️', '❓'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleAddReaction(msg.id, emoji)}
                        className="hover:scale-125 transition-transform text-sm p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setActiveReactionMessageId(null)}
                      className="text-slate-400 hover:text-white text-xs pl-1"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Timestamp & "Delivered" sub-label */}
              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                {isUser && isLast && (
                  <span className="text-[10px] text-slate-400 font-sans ml-1">Delivered</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator (Authentic Apple 3-bubble bounce) */}
        {isLoading && (
          <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 px-4 py-3 rounded-[20px] rounded-bl-[4px] w-fit shadow-md animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* FLOATING ATTACHMENT ACTION SHEET (Apple + Menu) */}
      {/* ========================================================================= */}
      {isActionSheetOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-3">
          <div className="apple-liquid-glass max-w-sm w-full p-4 rounded-3xl border border-white/20 shadow-2xl space-y-2.5 animate-fade-in text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-300">
                iMessage Add-Ins & Vision
              </h4>
              <button
                type="button"
                onClick={() => setIsActionSheetOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Upload Custom Image / Notes */}
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Upload Homework / Notes Photo</p>
                <p className="text-[11px] text-slate-400">Attach chemistry formulas, math scratchpad or slides</p>
              </div>
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />

            {/* 2. Sample Chemistry Notes (Matches Image 2) */}
            <button
              type="button"
              onClick={() => {
                setAttachedImage({
                  base64: SAMPLE_DIAGRAMS[0].dataUrl,
                  name: SAMPLE_DIAGRAMS[0].name,
                  mimeType: 'image/svg+xml'
                });
                setInputMessage('Can you inspect my notes on Binary Molecular Compounds and explain the bond ratios?');
                setIsActionSheetOpen(false);
                sound.playSuccess();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Sample Chemistry Notes (S2Cl2, IF5)</p>
                <p className="text-[11px] text-slate-400">Load sample handwritten molecular diagram from Image 2</p>
              </div>
            </button>

            {/* 3. Sample B-Tree Diagram */}
            <button
              type="button"
              onClick={() => {
                setAttachedImage({
                  base64: SAMPLE_DIAGRAMS[1].dataUrl,
                  name: SAMPLE_DIAGRAMS[1].name,
                  mimeType: 'image/svg+xml'
                });
                setInputMessage('Please check this B-Tree split invariant diagram and verify the time complexity.');
                setIsActionSheetOpen(false);
                sound.playSuccess();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Sample B-Tree Split Diagram</p>
                <p className="text-[11px] text-slate-400">Load sample tree split scratchpad for visual reasoning</p>
              </div>
            </button>

            {/* 4. Clear Chat */}
            <button
              type="button"
              onClick={handleClearChat}
              className="w-full flex items-center gap-3 p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 transition-all text-left text-xs"
            >
              <X className="w-4 h-4 ml-1" />
              <span>Clear Conversation History</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* APPLE CAPSULE BOTTOM INPUT DOCK */}
      {/* ========================================================================= */}
      <footer className="flex-none relative z-20 backdrop-blur-3xl bg-black/75 border-t border-white/10 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <div className="max-w-5xl mx-auto space-y-2.5">
          {/* Quick Concept Prompt Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 mr-1 select-none">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" /> Prompts:
            </span>
            {[
              'Explain B-Trees from first principles',
              'Check my active learning gaps & CGPA',
              'Analyze sample Binary Molecular Compounds notes (S2Cl2)',
              'Quiz me with a concept check'
            ].map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setInputMessage(prompt);
                }}
                className="px-2.5 py-1 rounded-full text-xs bg-white/[0.06] hover:bg-white/[0.14] border border-white/15 text-slate-200 hover:text-white transition-all whitespace-nowrap flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Image Attachment Preview Pill */}
          {attachedImage && (
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white/10 border border-blue-400/40 backdrop-blur-xl animate-fade-in">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={attachedImage.base64}
                  alt={attachedImage.name}
                  className="w-10 h-10 object-cover rounded-xl border border-white/20 flex-shrink-0"
                />
                <div className="truncate text-xs">
                  <p className="font-semibold text-white truncate">{attachedImage.name}</p>
                  <p className="text-[10px] text-cyan-300 font-mono">Image Context Attached for Gemini Vision</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white ml-2 flex-shrink-0"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Speech-to-Text Live Recording Banner */}
          {isListening && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-mono animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>Listening to your voice... Speak your question</span>
              </div>
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className="text-[11px] underline text-white font-semibold"
              >
                Done
              </button>
            </div>
          )}

          {sttError && (
            <div className="text-[11px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-xl">
              ⚠️ {sttError}
            </div>
          )}

          {/* iMessage Pill Input Dock */}
          <div className="flex items-center gap-2">
            {/* Plus Button (Action Sheet) */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsActionSheetOpen(true);
              }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-slate-200 hover:text-white transition-all flex-shrink-0 shadow-sm active:scale-95"
              title="Add photos, diagrams or notes"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Capsule Input Field */}
            <div className="flex-1 flex items-center rounded-full bg-black/50 border border-white/20 focus-within:border-[#007AFF] transition-all px-4 py-1.5 shadow-inner backdrop-blur-xl">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Message Horizon AI... (Press Enter to send)"
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />

              {/* Microphone / Speech-to-Text Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-1.5 rounded-full transition-all ml-1 ${
                  isListening
                    ? 'text-rose-400 animate-pulse bg-rose-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={isListening ? 'Stop Dictation' : 'Speech-to-Text (Voice Typing)'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Apple Blue Send Button */}
            <button
              type="button"
              disabled={isLoading || (!inputMessage.trim() && !attachedImage)}
              onClick={() => handleSendMessage()}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-md ${
                inputMessage.trim() || attachedImage
                  ? 'bg-[#007AFF] hover:bg-[#0071E3] text-white active:scale-95 shadow-[0_0_12px_rgba(0,122,255,0.4)]'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
              }`}
              title="Send Message"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </footer>
    </div>

    {/* Right Column: Motivational Quote Card & Academic Context (Desktop Image 3) */}
    <div className="hidden xl:flex flex-col gap-3 w-80 shrink-0 min-h-0 overflow-y-auto custom-scrollbar">
      {/* Motivational Quote Card matching Image 3 */}
      <div className="rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/15 p-5 shadow-2xl space-y-3 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-wider uppercase text-[#E2F952] font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E2F952]" />
            DAILY MOTIVATION
          </span>
          <span className="text-xs text-[#E2F952]">✦</span>
        </div>
        <blockquote className="text-base font-medium text-white italic leading-snug font-serif">
          &ldquo;Study so hard that you never have to introduce yourself.&rdquo;
        </blockquote>
        <p className="text-[11px] font-mono text-slate-400">
          Deep Work • Continuous Momentum
        </p>
      </div>

      {/* Active Academic Context Card */}
      <div className="rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/15 p-5 shadow-2xl space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-300 font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
              ACADEMIC CONTEXT
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
              Sem {profile.semester}
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Active Topic
            </label>
            <div className="text-xs font-semibold text-white bg-white/[0.06] border border-white/10 p-2.5 rounded-xl truncate">
              {selectedTopic}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Prerequisite Deficits
            </label>
            <div className="text-xs text-slate-300 flex items-center justify-between bg-white/[0.06] border border-white/10 p-2.5 rounded-xl">
              <span>Active Gaps:</span>
              <span className="font-mono font-bold text-rose-300 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30">
                {gaps.length} detected
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => onNavigate('gaps')}
            className="w-full py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-200 text-xs font-medium transition-all text-center cursor-pointer"
          >
            Inspect Gap Diagnostic
          </button>
          <button
            type="button"
            onClick={() => onNavigate('syllabus')}
            className="w-full py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 text-xs font-medium transition-all text-center cursor-pointer"
          >
            Open Dynamic Syllabus
          </button>
        </div>
      </div>
    </div>
  </div>

      {/* ========================================================================= */}
      {/* EXPANDED IMAGE MODAL */}
      {/* ========================================================================= */}
      {expandedImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setExpandedImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl">
            <button
              type="button"
              onClick={() => setExpandedImageUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={expandedImageUrl}
              alt="Expanded Diagram"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SETTINGS & CONNECTION DIAGNOSTIC MODAL */}
      {/* ========================================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="apple-liquid-glass max-w-lg w-full p-6 space-y-5 rounded-3xl border border-white/20 shadow-2xl animate-fade-in text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Google Gemini AI Configuration</h3>
                  <p className="text-xs text-slate-400">Google AI Studio inference & multimodal vision ping</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Indicator */}
            <div
              className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center justify-between transition-all ${
                apiStatus.isLive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : apiStatus.isRateLimited
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-white/[0.04] border-white/15 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    apiStatus.isLive
                      ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]'
                      : apiStatus.isRateLimited
                      ? 'bg-amber-400'
                      : 'bg-cyan-400'
                  }`}
                />
                <span className="font-semibold tracking-tight">{apiStatus.statusMessage}</span>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  apiStatus.isLive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : apiStatus.isRateLimited
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-white/10 text-slate-400 border border-white/10'
                }`}
              >
                {apiStatus.isLive
                  ? apiStatus.latencyMs
                    ? `${apiStatus.latencyMs}ms latency`
                    : 'Connected & Active'
                  : apiStatus.isRateLimited
                  ? 'Rate Limited (429)'
                  : 'Local Socratic AI'}
              </span>
            </div>

            {/* Model Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Active Model
              </label>
              <select
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-slate-100 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="gemini-3.5-flash">Google Gemini 3.5 Flash (Recommended • High Quota • Fast)</option>
                <option value="gemini-3.7-flash">Google Gemini 3.7 Flash (Next-Gen Reasoning • High Quota)</option>
                <option value="gemini-3.5-flash-lite">Google Gemini 3.5 Flash-Lite (Ultra Fast)</option>
                <option value="gemini-flash-lite-latest">Google Gemini Flash-Lite Latest</option>
                <option value="gemini-3.8-flash">Google Gemini 3.8 Flash (Experimental)</option>
                <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (Experimental)</option>
                <option value="liquid/lfm-2.5-2.6b:free">LiquidAI: LFM 2.5 2.6B (Free Socratic Heuristic)</option>
              </select>
            </div>

            {/* API Key Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Google Gemini API Key</span>
                {resolveGeminiApiKey() ? (
                  <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25">
                    ✓ Active from Hosting
                  </span>
                ) : isGoogleApiKey(storageService.getApiKey()) ? (
                  <span className="text-[10px] text-cyan-400 font-medium px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/25">
                    ✓ Saved in Browser
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                    Optional (Local AI Active)
                  </span>
                )}
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Paste Google AI Studio key (starts with AIzaSy... or AQ...)"
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <div className="flex items-center justify-between pt-0.5">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Get your free Google Gemini API key from{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-300 hover:text-purple-200 underline font-medium"
                  >
                    Google AI Studio ↗
                  </a>
                </p>
                {storageService.getAISettings().openRouterApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      storageService.clearApiKey();
                      setKeyInput('');
                      setTestResult({
                        success: true,
                        message: 'Cleared saved key from browser. MindBridge is now using its built-in local Socratic engine.'
                      });
                      aiService.testConnection('', modelInput);
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline font-mono"
                  >
                    Clear Browser Key
                  </button>
                )}
              </div>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed animate-fade-in font-mono ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : testResult.testing
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 animate-pulse'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.message}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                type="button"
                disabled={testResult?.testing}
                onClick={async () => {
                  setTestResult({ success: false, testing: true, message: 'Pinging Google AI Studio...' });
                  const res = await aiService.testConnection(keyInput || undefined, modelInput);
                  setTestResult(res);
                }}
                className="btn-apple-glass py-2 px-4 text-xs flex items-center gap-1.5 text-slate-300 hover:text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testResult?.testing ? 'animate-spin' : ''}`} />
                <span>{testResult?.testing ? 'Pinging...' : 'Verify / Test Key'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  const current = storageService.getAISettings();
                  const newKey = keyInput.trim();
                  const targetModel = modelInput.trim() || 'gemini-3.5-flash';
                  const provider = targetModel.includes('gemini') ? 'google' : 'openrouter';

                  storageService.saveAISettings({
                    ...current,
                    ...(newKey ? { openRouterApiKey: newKey } : {}),
                    model: targetModel,
                    provider
                  });
                  setModelInput(targetModel);
                  setIsSettingsOpen(false);
                  setKeyInput('');
                  setTestResult(null);
                }}
                className="btn-apple-primary py-2 px-5 text-xs font-semibold"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatApp;
