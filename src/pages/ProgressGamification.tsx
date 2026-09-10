import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  ShieldCheck,
  Award,
  Sparkles,
  Lock,
  Clock,
  Compass,
  MessageSquareCheck,
  Gamepad2,
  RotateCcw,
  CheckCircle2,
  Timer,
  Zap,
  Play
} from 'lucide-react';
import type { StudentProfile, Achievement, SyllabusTopic } from '../types';
import { sound } from '../services/soundService';

interface ProgressGamificationProps {
  profile: StudentProfile;
  achievements: Achievement[];
  syllabus: SyllabusTopic[];
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
  onUpdateProfile?: (profile: StudentProfile) => void;
}

interface MemoryCard {
  id: string;
  pairId: string;
  title: string;
  type: 'concept' | 'definition';
}

interface BlitzQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const MEMORY_PAIRS: { pairId: string; concept: string; definition: string }[] = [
  {
    pairId: 'p1',
    concept: 'B+ Tree Indexing',
    definition: 'Logarithmic multiway search with leaves linked for rapid sequential range queries.'
  },
  {
    pairId: 'p2',
    concept: 'ACID Guarantees',
    definition: 'Atomicity, Consistency, Isolation, and Durability in relational transaction blocks.'
  },
  {
    pairId: 'p3',
    concept: 'LRU Eviction Policy',
    definition: 'Doubly linked list paired with hash table for O(1) page access and least-recent eviction.'
  },
  {
    pairId: 'p4',
    concept: 'Dijkstra Routing',
    definition: 'Greedy single-source shortest path traversal using a min-priority heap.'
  }
];

const BLITZ_QUESTIONS: BlitzQuestion[] = [
  {
    id: 'q1',
    question: 'What is the worst-case time complexity of standard QuickSort with poor pivot choices?',
    options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
    correctIndex: 1,
    explanation: 'Unbalanced partitioning results in O(n²) worst-case performance.'
  },
  {
    id: 'q2',
    question: 'Which database normal form eliminates partial functional dependencies on composite keys?',
    options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'BCNF'],
    correctIndex: 1,
    explanation: '2NF requires 1NF and guarantees non-prime attributes depend fully on the primary key.'
  },
  {
    id: 'q3',
    question: 'Which CPU scheduling strategy prevents starvation of low-priority processes by aging them over time?',
    options: ['FCFS', 'Shortest Job First', 'Round Robin', 'Multilevel Feedback Queue'],
    correctIndex: 3,
    explanation: 'MLFQ dynamically promotes processes that wait too long, eliminating starvation.'
  },
  {
    id: 'q4',
    question: 'In a B-Tree of order m, what is the maximum number of children any internal node can hold?',
    options: ['m - 1', 'm', '2m', 'm / 2'],
    correctIndex: 1,
    explanation: 'By definition of order m, each node contains at most m child pointers.'
  },
  {
    id: 'q5',
    question: 'Which data structure offers optimal O(log n) insertion and extract-minimum operations for priority queues?',
    options: ['Binary Min-Heap', 'Circular Queue', 'Hash Table', 'Linked Stack'],
    correctIndex: 0,
    explanation: 'A binary min-heap maintains heap-order with logarithmic push and pop operations.'
  }
];

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const ProgressGamification: React.FC<ProgressGamificationProps> = ({
  profile,
  achievements,
  syllabus,
  onUpdateProfile
}) => {
  const currentLevelXp = profile.totalXp % 1000;
  const xpForNextLevel = 1000 - currentLevelXp;
  const levelProgressPct = Math.round((currentLevelXp / 1000) * 100);

  // Arcade State
  const [activeGame, setActiveGame] = useState<'MEMORY' | 'BLITZ'>('MEMORY');
  const [sessionXpEarned, setSessionXpEarned] = useState<number>(0);

  // Memory Game State
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [memoryMoves, setMemoryMoves] = useState<number>(0);
  const [memoryWon, setMemoryWon] = useState<boolean>(false);

  // Blitz Game State
  const [blitzStarted, setBlitzStarted] = useState<boolean>(false);
  const [blitzCurrentIdx, setBlitzCurrentIdx] = useState<number>(0);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState<number>(30);
  const [blitzScore, setBlitzScore] = useState<number>(0);
  const [blitzStreak, setBlitzStreak] = useState<number>(0);
  const [blitzFinished, setBlitzFinished] = useState<boolean>(false);
  const [blitzSelectedOption, setBlitzSelectedOption] = useState<number | null>(null);

  // Initialize Memory Game
  const initMemoryGame = () => {
    const deck: MemoryCard[] = [];
    MEMORY_PAIRS.forEach((p) => {
      deck.push({ id: `${p.pairId}_c`, pairId: p.pairId, title: p.concept, type: 'concept' });
      deck.push({ id: `${p.pairId}_d`, pairId: p.pairId, title: p.definition, type: 'definition' });
    });
    setCards(shuffleArray(deck));
    setFlippedIds([]);
    setMatchedPairIds([]);
    setMemoryMoves(0);
    setMemoryWon(false);
  };

  useEffect(() => {
    initMemoryGame();
  }, []);

  // Award XP helper
  const awardGameXp = (amount: number, _reason: string) => {
    sound.playFanfare();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    setSessionXpEarned((prev) => prev + amount);

    if (onUpdateProfile) {
      const newTotal = profile.totalXp + amount;
      const newLvl = Math.floor(newTotal / 1000) + 1;
      onUpdateProfile({
        ...profile,
        totalXp: newTotal,
        level: newLvl
      });
    }
  };

  // Memory Card Click Handler
  const handleCardClick = (card: MemoryCard) => {
    if (flippedIds.length === 2 || flippedIds.includes(card.id) || matchedPairIds.includes(card.pairId)) {
      return;
    }
    sound.playClick();
    const newFlipped = [...flippedIds, card.id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const first = cards.find((c) => c.id === newFlipped[0]);
      const second = cards.find((c) => c.id === newFlipped[1]);

      if (first && second && first.pairId === second.pairId) {
        // Match found!
        sound.playSuccess();
        const updatedMatches = [...matchedPairIds, first.pairId];
        setMatchedPairIds(updatedMatches);
        setFlippedIds([]);

        if (updatedMatches.length === MEMORY_PAIRS.length) {
          // Player won!
          setMemoryWon(true);
          awardGameXp(50, 'Mastered Concept Memory Match');
        }
      } else {
        // Not a match - flip back
        setTimeout(() => {
          setFlippedIds([]);
        }, 900);
      }
    }
  };

  // Blitz Timer Effect
  useEffect(() => {
    if (!blitzStarted || blitzFinished) return;
    const timer = setInterval(() => {
      setBlitzTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          finishBlitzGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [blitzStarted, blitzFinished]);

  const startBlitzGame = () => {
    sound.playClick();
    setBlitzStarted(true);
    setBlitzCurrentIdx(0);
    setBlitzTimeLeft(30);
    setBlitzScore(0);
    setBlitzStreak(0);
    setBlitzFinished(false);
    setBlitzSelectedOption(null);
  };

  const finishBlitzGame = () => {
    setBlitzFinished(true);
    awardGameXp(100, 'Speed Recall Blitz Completed');
  };

  const handleBlitzAnswer = (optionIdx: number) => {
    if (blitzSelectedOption !== null || blitzFinished) return;
    setBlitzSelectedOption(optionIdx);
    const q = BLITZ_QUESTIONS[blitzCurrentIdx];
    const isCorrect = optionIdx === q.correctIndex;

    if (isCorrect) {
      sound.playSuccess();
      setBlitzScore((s) => s + 20 * (blitzStreak + 1));
      setBlitzStreak((st) => st + 1);
    } else {
      sound.playError();
      setBlitzStreak(0);
    }

    setTimeout(() => {
      if (blitzCurrentIdx < BLITZ_QUESTIONS.length - 1) {
        setBlitzCurrentIdx((idx) => idx + 1);
        setBlitzSelectedOption(null);
      } else {
        finishBlitzGame();
      }
    }, 600);
  };

  const triggerConfetti = () => {
    sound.playFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'MessageSquareCheck':
        return <MessageSquareCheck className="w-5 h-5" />;
      case 'Compass':
        return <Compass className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-6xl mx-auto">
      
      {/* Top Banner & Level Progress */}
      <div className="apple-liquid-glass p-6 sm:p-8 relative overflow-hidden border border-white/20 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>ACADEMIC MERIT & RETENTION ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
              Progress & Academic Achievements
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1A6] mt-1 max-w-2xl leading-relaxed">
              Mind Bridge AI rewards meaningful academic mastery—crushing learning gaps, maintaining study consistency, and playing academic memory games.
            </p>
          </div>

          <button
            onClick={triggerConfetti}
            className="btn-apple-glass py-2.5 px-5 text-xs font-semibold flex items-center gap-2 text-white shadow-xl cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Celebrate Progress</span>
          </button>
        </div>

        {/* Level Progression Bar */}
        <div className="mt-6 p-5 rounded-2xl liquid-glass-block space-y-3 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center font-extrabold text-base text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                {profile.level}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  Level {profile.level} — Algorithm Adept
                </h4>
                <p className="text-xs text-purple-300 font-mono flex items-center gap-1.5 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{profile.totalXp.toLocaleString()} Total Academic XP</span>
                  {sessionXpEarned > 0 && (
                    <span className="text-emerald-300 font-bold">(+{sessionXpEarned} XP this session)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-[#A1A1A6]">
              <span className="text-white font-bold">{currentLevelXp}</span> / 1000 XP (
              <strong className="text-pink-400 font-semibold">{xpForNextLevel} XP</strong> to Level {profile.level + 1})
            </div>
          </div>

          <div className="w-full bg-white/[0.08] rounded-full h-2.5 overflow-hidden p-0.5 border border-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 transition-all duration-700 shadow-[0_0_12px_rgba(236,72,153,0.6)]"
              style={{ width: `${levelProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ==========================================================================
          ACADEMIC BRAIN ARCADE & MINI-GAMES SECTION
          Interactive educational games to reinforce memory and earn real XP
          ========================================================================== */}
      <div className="apple-liquid-glass p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6">
        
        {/* Arcade Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight font-heading">
                  Brain Arcade // Academic Games
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold">
                  PLAY & EARN XP
                </span>
              </div>
              <p className="text-xs text-[#A1A1A6] leading-relaxed">
                Sharpen conceptual recall with interactive card matching and rapid-fire trivia.
              </p>
            </div>
          </div>

          {/* Game Switcher Tabs */}
          <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
            <button
              onClick={() => { sound.playClick(); setActiveGame('MEMORY'); }}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                activeGame === 'MEMORY'
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Memory Flip (+50 XP)
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveGame('BLITZ'); }}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                activeGame === 'BLITZ'
                  ? 'bg-pink-500/30 text-pink-200 border border-pink-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Speed Blitz (+100 XP)
            </button>
          </div>
        </div>

        {/* GAME 1: MEMORY CONCEPT MATCHER */}
        {activeGame === 'MEMORY' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
              <div className="flex items-center gap-4 text-[#A1A1A6]">
                <span>Moves: <strong className="text-white">{memoryMoves}</strong></span>
                <span>Pairs Matched: <strong className="text-emerald-400">{matchedPairIds.length} / 4</strong></span>
              </div>
              <button
                onClick={initMemoryGame}
                className="btn-apple-glass py-1.5 px-3 text-xs flex items-center gap-1.5 text-slate-300 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Cards</span>
              </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {cards.map((card) => {
                const isFlipped = flippedIds.includes(card.id) || matchedPairIds.includes(card.pairId);
                const isMatched = matchedPairIds.includes(card.pairId);

                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    className={`min-h-[115px] p-4 rounded-2xl flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 select-none ${
                      isMatched
                        ? 'bg-emerald-500/20 border-2 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : isFlipped
                        ? 'bg-white/[0.14] border border-white/40 shadow-xl'
                        : 'bg-white/[0.04] border border-white/10 hover:border-white/30 hover:bg-white/[0.08]'
                    }`}
                  >
                    {isFlipped ? (
                      <>
                        <span className={`text-[10px] font-mono font-bold uppercase ${isMatched ? 'text-emerald-300' : 'text-purple-300'}`}>
                          {card.type === 'concept' ? '📌 Concept' : '💡 Architecture'}
                        </span>
                        <p className={`text-xs font-semibold leading-snug my-auto ${isMatched ? 'text-emerald-100' : 'text-white'}`}>
                          {card.title}
                        </p>
                        {isMatched ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 animate-pulse" />
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full my-auto space-y-1.5">
                        <Sparkles className="w-5 h-5 text-white/30" />
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                          MindBridge
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {memoryWon && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex flex-wrap items-center justify-between gap-3 text-emerald-200 animate-fade-in">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Mastery Verified! Concept Match Complete!</h4>
                    <p className="text-xs text-emerald-200/90 font-mono">
                      Solved in {memoryMoves} moves • +50 Academic XP Awarded to your profile!
                    </p>
                  </div>
                </div>
                <button
                  onClick={initMemoryGame}
                  className="btn-apple-primary py-2 px-4 text-xs font-semibold"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* GAME 2: SPEED RECALL BLITZ */}
        {activeGame === 'BLITZ' && (
          <div className="space-y-4">
            {!blitzStarted ? (
              <div className="p-8 rounded-2xl liquid-glass-block text-center space-y-4 border border-white/10">
                <div className="w-14 h-14 rounded-3xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-300 mx-auto shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                  <Timer className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white font-heading">
                    Speed Recall Blitz Challenge
                  </h4>
                  <p className="text-xs text-[#A1A1A6] max-w-md mx-auto mt-1 leading-relaxed">
                    Answer 5 rapid-fire academic questions in 30 seconds. Maintain consecutive correct streaks for combo point multipliers!
                  </p>
                </div>
                <button
                  onClick={startBlitzGame}
                  className="btn-apple-primary px-8 py-3 text-sm flex items-center gap-2 mx-auto shadow-xl"
                >
                  <Play className="w-4 h-4 text-white fill-white" />
                  <span>Start 30-Second Blitz</span>
                </button>
              </div>
            ) : blitzFinished ? (
              <div className="p-8 rounded-2xl liquid-glass-block text-center space-y-4 border border-white/10 animate-fade-in">
                <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white font-heading">
                    Blitz Round Finished!
                  </h4>
                  <p className="text-sm font-mono text-purple-300 mt-1">
                    Final Score: <strong className="text-white text-lg">{blitzScore}</strong> Blitz Points • +100 Academic XP Awarded!
                  </p>
                </div>
                <button
                  onClick={startBlitzGame}
                  className="btn-apple-primary px-6 py-2.5 text-xs flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-white" />
                  <span>Try Another Blitz Round</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* HUD: Timer + Streak + Progress */}
                <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">
                      Question {blitzCurrentIdx + 1} of {BLITZ_QUESTIONS.length}
                    </span>
                    {blitzStreak > 1 && (
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        {blitzStreak}x Combo!
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Timer className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                    <span className="font-bold text-white text-sm">{blitzTimeLeft}s</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-1000"
                    style={{ width: `${(blitzTimeLeft / 30) * 100}%` }}
                  />
                </div>

                {/* Question */}
                <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed pt-2">
                  {BLITZ_QUESTIONS[blitzCurrentIdx].question}
                </h4>

                {/* Options (Aligned with Test MCQ color system) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {BLITZ_QUESTIONS[blitzCurrentIdx].options.map((opt, oIdx) => {
                    const isSelected = blitzSelectedOption === oIdx;
                    const isCorrect = oIdx === BLITZ_QUESTIONS[blitzCurrentIdx].correctIndex;

                    let optStyle = 'border-white/15 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:border-white/30';
                    if (blitzSelectedOption !== null) {
                      if (isCorrect) {
                        optStyle = 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.2)]';
                      } else if (isSelected) {
                        optStyle = 'bg-rose-500/20 border-rose-400/50 text-rose-100 line-through';
                      } else {
                        optStyle = 'opacity-40 border-white/5';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={blitzSelectedOption !== null}
                        onClick={() => handleBlitzAnswer(oIdx)}
                        className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-center gap-3 backdrop-blur-xl cursor-pointer ${optStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-xl border flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                          blitzSelectedOption !== null && isCorrect
                            ? 'border-emerald-400 bg-emerald-500/40 text-emerald-200'
                            : isSelected && !isCorrect
                            ? 'border-rose-400 bg-rose-500/40 text-rose-200'
                            : 'border-white/20 bg-white/[0.08] text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Badges Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
            <Award className="w-4 h-4 text-pink-400" />
            <span>Academic Badges & Honors ({achievements.filter((a) => !!a.unlockedAt).length} of {achievements.length} Unlocked)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;

            return (
              <div
                key={ach.id}
                className={`p-5 space-y-3 transition-all ${
                  isUnlocked
                    ? 'liquid-glass-adaptive shadow-[0_6px_25px_rgba(168,85,247,0.2)]'
                    : 'liquid-glass-block opacity-50 border-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-purple-600 to-pink-500 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                          : 'bg-black/40 border-white/10 text-slate-500'
                      }`}
                    >
                      {getIcon(ach.iconName)}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">{ach.title}</h4>
                      <span className="text-[10px] font-mono text-purple-300 uppercase block">
                        +{ach.xpReward} XP Reward
                      </span>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <span className="led-indicator led-emerald" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>

                {/* Progress bar */}
                <div className="space-y-1 pt-1 border-t border-white/[0.04]">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>{isUnlocked ? 'Unlocked' : 'Criteria Progress'}</span>
                    <span>
                      {ach.progress} / {ach.target}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isUnlocked ? 'bg-emerald-400' : 'bg-purple-500'
                      }`}
                      style={{ width: `${Math.min(100, (ach.progress / ach.target) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Curriculum Mastery Distribution */}
      <div className="apple-liquid-glass p-6 sm:p-8 space-y-4 border border-white/20 shadow-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>Curriculum Mastery & Time Invested</span>
        </h3>

        <div className="space-y-3">
          {syllabus.map((item) => (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{item.topic}</span>
                <span className="font-mono text-purple-300 font-bold">
                  {item.masteryPercentage}% Mastery • {item.completedHours}h logged
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.masteryPercentage >= 80
                      ? 'bg-emerald-500'
                      : item.masteryPercentage >= 60
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-orange-500'
                  }`}
                  style={{ width: `${item.masteryPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
