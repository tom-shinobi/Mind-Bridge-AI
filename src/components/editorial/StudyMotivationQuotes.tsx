import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  X,
  Pin,
  Flame,
  Award
} from 'lucide-react';
import { sound } from '../../services/soundService';

export interface MotivationQuoteItem {
  id: string;
  quote: string;
  author?: string;
  category: 'vision' | 'grit' | 'focus' | 'time' | 'future' | 'resilience' | 'checklist' | 'affirmation' | 'progress';
  source: 'poster' | 'grid' | 'planner';
  noteNumber?: number;
  highlightText?: string;
  themeColor: 'lime' | 'pink' | 'cyan' | 'amber' | 'cream' | 'slate';
  rotationClass?: string;
}

export const ALL_STUDY_QUOTES: MotivationQuoteItem[] = [
  // ==========================================
  // Image 2: Bold Editorial Typographic Poster
  // ==========================================
  {
    id: 'poster-1',
    quote: 'Study so hard that you never have to introduce yourself.',
    category: 'focus',
    source: 'poster',
    highlightText: 'never have to introduce yourself',
    themeColor: 'lime',
    rotationClass: '-rotate-1'
  },

  // ==========================================
  // Image 3: Editorial Quote Collage Tiles
  // ==========================================
  {
    id: 'grid-1',
    quote: "studying doesn't suck as much as failing.",
    category: 'grit',
    source: 'grid',
    themeColor: 'pink',
    rotationClass: 'rotate-1'
  },
  {
    id: 'grid-2',
    quote: "YOU'RE NOT JUST STUDYING FOR GRADES — YOU'RE STUDYING FOR THE LIFE YOU WANT",
    category: 'vision',
    source: 'grid',
    highlightText: 'THE LIFE YOU WANT',
    themeColor: 'slate',
    rotationClass: '-rotate-1.5'
  },
  {
    id: 'grid-3',
    quote: 'Every study session takes you one step closer to your dreams.',
    category: 'progress',
    source: 'grid',
    themeColor: 'cyan',
    rotationClass: 'rotate-2'
  },
  {
    id: 'grid-4',
    quote: 'Study now be proud later.',
    category: 'vision',
    source: 'grid',
    themeColor: 'amber',
    rotationClass: '-rotate-1'
  },
  {
    id: 'grid-5',
    quote: 'SCHOOL IS TOUGH, BUT SO ARE YOU.',
    category: 'resilience',
    source: 'grid',
    highlightText: 'SO ARE YOU',
    themeColor: 'pink',
    rotationClass: 'rotate-1.5'
  },
  {
    id: 'grid-6',
    quote: 'Study because you need to show them what are u capable of',
    category: 'grit',
    source: 'grid',
    themeColor: 'slate',
    rotationClass: '-rotate-2'
  },
  {
    id: 'grid-7',
    quote: 'do it for your future self',
    category: 'future',
    source: 'grid',
    themeColor: 'lime',
    rotationClass: 'rotate-1'
  },
  {
    id: 'grid-8',
    quote: 'Dream big, study hard, shine bright.',
    category: 'vision',
    source: 'grid',
    themeColor: 'cyan',
    rotationClass: '-rotate-1'
  },
  {
    id: 'grid-9',
    quote: "It's not about being the smartest. It's about NOT GIVING UP.",
    category: 'grit',
    source: 'grid',
    highlightText: 'NOT GIVING UP',
    themeColor: 'amber',
    rotationClass: 'rotate-2'
  },
  {
    id: 'grid-10',
    quote: 'Studying now is better then leaving the exam room wishing you studied more',
    category: 'focus',
    source: 'grid',
    themeColor: 'cream',
    rotationClass: '-rotate-1.5'
  },
  {
    id: 'grid-11',
    quote: 'Study. You still have a chance.',
    category: 'resilience',
    source: 'grid',
    highlightText: 'You still have a chance',
    themeColor: 'pink',
    rotationClass: 'rotate-1'
  },
  {
    id: 'grid-12',
    quote: 'I never said it would be easy, I only said it would be worth it.',
    author: 'Mae West',
    category: 'grit',
    source: 'grid',
    themeColor: 'slate',
    rotationClass: '-rotate-1'
  },

  // ==========================================
  // Image 4: Illustrated Study Planner Sticky Notes 1-10
  // ==========================================
  {
    id: 'planner-note-1',
    noteNumber: 1,
    quote: 'Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.',
    category: 'resilience',
    source: 'planner',
    highlightText: 'Believe in yourself',
    themeColor: 'lime',
    rotationClass: '-rotate-1.5'
  },
  {
    id: 'planner-note-2',
    noteNumber: 2,
    quote: "Excuses will always be there for you, Opportunity won't.",
    category: 'grit',
    source: 'planner',
    highlightText: 'No Excuses',
    themeColor: 'pink',
    rotationClass: 'rotate-1'
  },
  {
    id: 'planner-note-3',
    noteNumber: 3,
    quote: 'Success is the sum of small efforts repeated day in and day out.',
    category: 'focus',
    source: 'planner',
    highlightText: 'Consistency',
    themeColor: 'cyan',
    rotationClass: '-rotate-2'
  },
  {
    id: 'planner-note-4',
    noteNumber: 4,
    quote: "Focus on your goal. Don't look in any direction but ahead.",
    category: 'focus',
    source: 'planner',
    highlightText: 'Focus',
    themeColor: 'amber',
    rotationClass: 'rotate-2'
  },
  {
    id: 'planner-note-5',
    noteNumber: 5,
    quote: 'There is no substitute for hard work.',
    category: 'grit',
    source: 'planner',
    highlightText: 'Hard Work',
    themeColor: 'cream',
    rotationClass: '-rotate-1'
  },
  {
    id: 'planner-note-6',
    noteNumber: 6,
    quote: "It always seems impossible until it's done.",
    category: 'resilience',
    source: 'planner',
    highlightText: 'Never Give Up',
    themeColor: 'pink',
    rotationClass: 'rotate-1.5'
  },
  {
    id: 'planner-note-7',
    noteNumber: 7,
    quote: "Don't watch the clock; do what it does. Keep going.",
    category: 'time',
    source: 'planner',
    highlightText: 'Time',
    themeColor: 'cyan',
    rotationClass: '-rotate-1.5'
  },
  {
    id: 'planner-note-8',
    noteNumber: 8,
    quote: 'Your future is created by what you do today, not tomorrow.',
    category: 'future',
    source: 'planner',
    highlightText: 'Your Future',
    themeColor: 'lime',
    rotationClass: 'rotate-1'
  },
  {
    id: 'planner-note-9',
    noteNumber: 9,
    quote: 'Positive mind. Positive vibes. Positive life.',
    category: 'affirmation',
    source: 'planner',
    highlightText: 'Stay Positive',
    themeColor: 'amber',
    rotationClass: '-rotate-2'
  },
  {
    id: 'planner-note-10',
    noteNumber: 10,
    quote: 'Patience today, Power tomorrow.',
    category: 'time',
    source: 'planner',
    highlightText: 'Patience',
    themeColor: 'cream',
    rotationClass: 'rotate-1.5'
  },

  // Image 4: Center notebook card & Note to self
  {
    id: 'planner-center',
    quote: 'Today a Student, Tomorrow a Leader. Keep Studying, Keep Growing!',
    category: 'vision',
    source: 'planner',
    highlightText: 'Today a Student, Tomorrow a Leader',
    themeColor: 'lime',
    rotationClass: 'rotate-0'
  },
  {
    id: 'planner-note-to-self',
    quote: 'Note to Self: I am Focused, I am Determined, I am Disciplined, I can do it! I will succeed!',
    category: 'affirmation',
    source: 'planner',
    highlightText: 'Note to Self',
    themeColor: 'pink',
    rotationClass: 'rotate-2'
  },
  {
    id: 'planner-done-banner',
    quote: "Don't stop when you are tired, stop when you are DONE.",
    category: 'grit',
    source: 'planner',
    highlightText: 'stop when you are DONE',
    themeColor: 'lime',
    rotationClass: '-rotate-1'
  }
];

const THEME_STYLES = {
  lime: {
    bg: 'bg-[#E2F952] text-black border-black',
    tape: 'bg-[#FFE600] text-black',
    tag: 'bg-black text-[#E2F952]',
    accent: '#E2F952'
  },
  pink: {
    bg: 'bg-[#FF85A1] text-black border-black',
    tape: 'bg-[#FFE4E8] text-black',
    tag: 'bg-black text-[#FF85A1]',
    accent: '#FF85A1'
  },
  cyan: {
    bg: 'bg-[#7DD3FC] text-black border-black',
    tape: 'bg-[#E0F2FE] text-black',
    tag: 'bg-black text-[#38BDF8]',
    accent: '#38BDF8'
  },
  amber: {
    bg: 'bg-[#FDE047] text-black border-black',
    tape: 'bg-[#FEF08A] text-black',
    tag: 'bg-black text-[#FACC15]',
    accent: '#FACC15'
  },
  cream: {
    bg: 'bg-[#F7F4EB] text-black border-black',
    tape: 'bg-[#E2F952] text-black',
    tag: 'bg-black text-[#F7F4EB]',
    accent: '#F7F4EB'
  },
  slate: {
    bg: 'bg-[#151B28] text-[#F7F4EB] border-[#E2F952]/40',
    tape: 'bg-[#E2F952] text-black',
    tag: 'bg-[#E2F952] text-black',
    accent: '#E2F952'
  }
};

/**
 * 1. STUDY MOTIVATION MARQUEE TICKER (Streams across the entire site)
 */
export const StudyMotivationTicker: React.FC<{
  onOpenBoard?: () => void;
  className?: string;
}> = ({ onOpenBoard, className = '' }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    sound.playClick();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tickerQuotes = [
    { text: 'Study so hard that you never have to introduce yourself.', tag: 'FOCUS' },
    { text: "Don't stop when you are tired, stop when you are DONE.", tag: 'GRIT' },
    { text: 'Today a Student, Tomorrow a Leader. Keep Studying, Keep Growing!', tag: 'VISION' },
    { text: "YOU'RE NOT JUST STUDYING FOR GRADES — YOU'RE STUDYING FOR THE LIFE YOU WANT", tag: 'FUTURE' },
    { text: "studying doesn't suck as much as failing.", tag: 'REALITY' },
    { text: 'Success is the sum of small efforts repeated day in and day out.', tag: 'CONSISTENCY' },
    { text: 'SCHOOL IS TOUGH, BUT SO ARE YOU.', tag: 'RESILIENCE' },
    { text: "Don't watch the clock; do what it does. Keep going.", tag: 'TIME' },
    { text: 'do it for your future self', tag: 'DETERMINATION' },
    { text: "It's not about being the smartest. It's about NOT GIVING UP.", tag: 'PERSISTENCE' },
    { text: 'Studying now is better than leaving the exam room wishing you studied more', tag: 'EXAM PREP' }
  ];

  return (
    <div className={`relative w-full z-20 overflow-hidden mb-4 select-none ${className}`}>
      <div className="relative flex items-center bg-[#0D111A]/95 border-2 border-[#E2F952]/40 shadow-[3px_3px_0px_#000000] rounded-xl px-2 py-1.5 backdrop-blur-md overflow-hidden">
        
        <div className="flex-shrink-0 flex items-center gap-1.5 mr-3 px-2.5 py-0.5 rounded bg-[#E2F952] text-black font-woodblock tracking-widest text-[10px] uppercase shadow-[1px_1px_0px_#000000] rotate-[-1deg]">
          <Flame className="w-3 h-3 fill-black text-black animate-pulse" />
          <span className="font-bold">STUDY FUEL</span>
          <span className="opacity-70 text-[8px]">✦ VOL. IV</span>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center gap-8 whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
            {tickerQuotes.concat(tickerQuotes).map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleCopy(`ticker-${idx}`, item.text)}
                className="inline-flex items-center gap-2 cursor-pointer group transition-colors hover:text-[#E2F952]"
                title="Click to copy quote"
              >
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-[#E2F952] font-woodblock font-semibold tracking-wider uppercase border border-white/10 group-hover:bg-[#E2F952] group-hover:text-black transition-colors">
                  {item.tag}
                </span>
                <span className="text-xs font-woodblock tracking-wide uppercase text-[#F7F4EB]/90 group-hover:text-[#E2F952]">
                  {item.text}
                </span>
                {copiedId === `ticker-${idx}` ? (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold px-1 rounded bg-emerald-950/60">
                    COPIED!
                  </span>
                ) : (
                  <span className="text-[#E2F952] text-xs opacity-70">✦</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {onOpenBoard && (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onOpenBoard();
            }}
            className="flex-shrink-0 ml-3 px-2.5 py-1 rounded-lg bg-black hover:bg-[#E2F952] hover:text-black text-[#E2F952] border border-[#E2F952]/50 font-woodblock text-[10px] tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_#000000] touch-press"
            title="Open Interactive Study Motivation Board"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">VIEW ALL QUOTES</span>
            <span className="sm:hidden">BOARD</span>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * 2. TACTILE STUDY MOTIVATION STICKY NOTE CARD (From Images 3 & 4)
 */
export const StudyMotivationStickyCard: React.FC<{
  quoteItem: MotivationQuoteItem;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showCopy?: boolean;
}> = ({ quoteItem, size = 'md', className = '', showCopy = true }) => {
  const [copied, setCopied] = useState(false);
  const style = THEME_STYLES[quoteItem.themeColor] || THEME_STYLES.lime;

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard?.writeText(quoteItem.quote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeClasses = {
    sm: 'p-3 text-xs min-h-[110px]',
    md: 'p-4 text-xs sm:text-sm min-h-[140px]',
    lg: 'p-6 text-sm sm:text-base min-h-[180px]'
  };

  return (
    <div
      className={`relative rounded-xl border-2 shadow-[4px_4px_0px_#000000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000000] select-none group ${style.bg} ${quoteItem.rotationClass || ''} ${sizeClasses[size]} ${className}`}
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-white/75 backdrop-blur-sm border border-black/20 shadow-[1px_1px_2px_rgba(0,0,0,0.3)] rotate-[-1deg] flex items-center justify-center pointer-events-none">
        <span className="text-[8px] font-mono tracking-widest text-black/60 uppercase">★ NOTE ★</span>
      </div>

      {quoteItem.noteNumber && (
        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black text-white font-woodblock text-[9px] tracking-wider uppercase mb-2 shadow-[1px_1px_0px_#000000]">
          <span>#{quoteItem.noteNumber}</span>
          {quoteItem.highlightText && (
            <span className="text-[#E2F952]">• {quoteItem.highlightText}</span>
          )}
        </div>
      )}

      <p className="font-woodblock tracking-wide uppercase leading-snug mt-1">
        "{quoteItem.quote}"
      </p>

      {quoteItem.author && (
        <p className="text-[11px] font-mono tracking-tight text-black/80 font-bold mt-2">
          — {quoteItem.author}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/15">
        <span className="text-[9px] font-woodblock tracking-widest uppercase opacity-75">
          ✦ {quoteItem.category}
        </span>

        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded bg-black/10 hover:bg-black hover:text-white transition-colors cursor-pointer text-black"
            title="Copy quote"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * 3. DEDICATED HIGH-EDITORIAL POSTER HERO (Image 2)
 */
export const MotivationalPosterHero: React.FC<{
  className?: string;
  onExplore?: () => void;
}> = ({ className = '', onExplore }) => {
  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border-2 border-[#E2F952]/50 bg-[#0B0E17] shadow-[6px_6px_0px_#000000] p-6 sm:p-8 md:p-10 mb-6 select-none bg-notebook-grid ${className}`}>
      <div className="masking-tape-corner-tr" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[350px] airbrush-spray-lime opacity-35 pointer-events-none" />
      <div className="absolute -top-12 -left-12 w-[280px] h-[280px] airbrush-spray-cyan opacity-30 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E2F952] text-black font-woodblock tracking-widest text-xs uppercase shadow-[2px_2px_0px_#000000] mb-3 rotate-[-1deg]">
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>EDITORIAL MANIFESTO ✦ VOL. IV</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-woodblock tracking-wider uppercase text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            STUDY SO HARD THAT YOU{' '}
            <span className="text-[#E2F952] underline decoration-[#E2F952]/60 underline-offset-4">
              NEVER HAVE TO INTRODUCE
            </span>{' '}
            YOURSELF.
          </h2>

          <p className="text-xs sm:text-sm font-mono text-[#F7F4EB]/80 uppercase tracking-widest mt-3 flex items-center gap-2">
            <span>✦ DREAM BIG</span>
            <span>•</span>
            <span>STUDY HARD</span>
            <span>•</span>
            <span>SHINE BRIGHT ✦</span>
          </p>
        </div>

        <div className="w-full md:w-auto flex-shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
          <div className="p-3.5 rounded-xl bg-[#FFE4E8] text-black border-2 border-black shadow-[3px_3px_0px_#000000] rotate-1 max-w-xs">
            <p className="text-xs font-woodblock tracking-wider uppercase">
              "YOU'RE NOT JUST STUDYING FOR GRADES — YOU'RE STUDYING FOR THE LIFE YOU WANT"
            </p>
            <span className="text-[9px] font-mono font-bold uppercase text-black/70 mt-1 block">
              ✦ Note to Self
            </span>
          </div>

          {onExplore && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onExplore();
              }}
              className="editorial-btn-lime py-2.5 px-4 text-xs font-woodblock tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000000]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXPLORE MOTIVATION BOARD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 4. ILLUSTRATED STUDY PLANNER ZINE BOARD (Image 4)
 */
export const StudyPlannerZineBoard: React.FC<{
  className?: string;
  onClose?: () => void;
}> = ({ className = '', onClose }) => {
  const [checklist, setChecklist] = useState([
    { id: '1', text: 'Start where you are.', checked: true },
    { id: '2', text: 'Use what you have.', checked: true },
    { id: '3', text: 'Do what you can.', checked: true },
    { id: '4', text: 'Stay consistent.', checked: false },
    { id: '5', text: 'Trust the process.', checked: false }
  ]);

  const toggleCheck = (id: string) => {
    sound.playClick();
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const plannerNotes = ALL_STUDY_QUOTES.filter((q) => q.noteNumber !== undefined).sort(
    (a, b) => (a.noteNumber || 0) - (b.noteNumber || 0)
  );

  return (
    <div className={`relative w-full bg-[#0B0E17] border-2 border-[#E2F952]/40 rounded-2xl shadow-[6px_6px_0px_#000000] p-4 sm:p-6 md:p-8 bg-notebook-grid ${className}`}>
      <div className="masking-tape-corner-tr" />
      <div className="masking-tape-corner-tl" />

      <div className="text-center mb-8 relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-0 p-1.5 rounded-lg bg-black/60 hover:bg-[#E2F952] hover:text-black text-white border border-white/20 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded bg-[#E2F952] text-black font-woodblock tracking-widest text-[11px] uppercase shadow-[2px_2px_0px_#000000] mb-2 rotate-[-1deg]">
          <span>✦ DAILY STUDY MOTIVATION PLANNER ✦</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-woodblock tracking-wider uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          STUDY MOTIVATION QUOTES
        </h2>

        <p className="text-xs sm:text-sm font-mono text-[#E2F952] tracking-widest uppercase mt-1">
          DREAM ✦ PLAN ✦ FOCUS ✦ WORK ✦ SUCCEED
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-[#E2F952] text-black border-2 border-black shadow-[4px_4px_0px_#000000] rotate-[-1deg] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-black/70 mb-2">
              <Award className="w-4 h-4 text-black" />
              <span>CORE ANCHOR</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-woodblock tracking-wider uppercase leading-tight">
              TODAY A STUDENT, TOMORROW A LEADER.
            </h3>
            <p className="text-xs font-mono font-bold uppercase tracking-widest mt-2 text-black/80">
              KEEP STUDYING, KEEP GROWING!
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-black/20 text-[9px] font-mono uppercase tracking-widest">
            ✦ MindBridge Academic Council
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#FF85A1] text-black border-2 border-black shadow-[4px_4px_0px_#000000] rotate-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-black/70 mb-2">
              <Pin className="w-4 h-4 text-black" />
              <span>NOTE TO SELF</span>
            </div>
            <p className="text-sm sm:text-base font-woodblock tracking-wide uppercase leading-relaxed">
              "I AM FOCUSED, I AM DETERMINED, I AM DISCIPLINED, I CAN DO IT! I WILL SUCCEED!"
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-black/20 text-[9px] font-mono uppercase tracking-widest">
            ✦ Repeat Before Every Study Sprint
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#7DD3FC] text-black border-2 border-black shadow-[4px_4px_0px_#000000] rotate-[-1.5deg]">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-black/70 mb-2">
            <CheckCircle2 className="w-4 h-4 text-black" />
            <span>REMEMBER THIS</span>
          </div>
          <div className="space-y-1.5 mt-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className="flex items-center gap-2 cursor-pointer group"
              >
                {item.checked ? (
                  <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-black/60 flex-shrink-0 group-hover:text-black" />
                )}
                <span
                  className={`text-xs font-woodblock tracking-wide uppercase ${
                    item.checked ? 'line-through opacity-70' : ''
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-woodblock tracking-widest uppercase text-[#F7F4EB] flex items-center gap-2">
            <span>THE 10 PILLARS OF SCHOLAR MASTERY</span>
            <span className="text-[10px] px-2 py-0.2 rounded bg-[#E2F952] text-black">10 NOTES</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {plannerNotes.map((note) => (
            <StudyMotivationStickyCard key={note.id} quoteItem={note} size="sm" />
          ))}
        </div>
      </div>

      <div className="relative p-4 rounded-xl bg-[#E2F952] text-black border-2 border-black shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left rotate-[-0.5deg]">
        <div className="flex items-center gap-2.5">
          <Flame className="w-5 h-5 fill-black flex-shrink-0" />
          <p className="text-base sm:text-lg font-woodblock tracking-wider uppercase leading-none">
            "DON'T STOP WHEN YOU ARE TIRED, STOP WHEN YOU ARE DONE."
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-1 bg-black text-[#E2F952] rounded">
          GOLDEN RULE
        </span>
      </div>
    </div>
  );
};

/**
 * 5. INTERACTIVE STUDY MOTIVATION MODAL
 */
export const StudyMotivationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<'all' | 'grit' | 'focus' | 'vision' | 'planner'>('all');

  if (!isOpen) return null;

  const filteredQuotes = ALL_STUDY_QUOTES.filter((q) => {
    if (filter === 'all') return true;
    if (filter === 'planner') return q.source === 'planner';
    return q.category === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in pointer-events-auto">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity cursor-pointer"
      />

      <div className="relative z-10 w-full max-w-5xl max-h-[90dvh] bg-[#0A0D15] border-2 border-[#E2F952]/60 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),4px_4px_0px_#000000] p-4 sm:p-6 overflow-hidden flex flex-col bg-notebook-grid">
        <div className="masking-tape-corner-tr" />

        <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-4 flex-shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#E2F952] text-black font-woodblock text-[10px] tracking-widest uppercase mb-1">
              <Sparkles className="w-3 h-3 fill-black" />
              <span>MOTIVATION ARCHIVE ✦ VOL. IV</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-woodblock tracking-wider uppercase text-white">
              STUDY MOTIVATION GALLERY
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-black hover:bg-[#E2F952] hover:text-black text-white border border-white/20 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-4 flex-shrink-0">
          {[
            { id: 'all', label: 'All Quotes (25)' },
            { id: 'planner', label: 'Planner 10 Notes' },
            { id: 'grit', label: 'Grit & No Excuses' },
            { id: 'focus', label: 'Laser Focus' },
            { id: 'vision', label: 'Vision & Future' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setFilter(tab.id as typeof filter);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-woodblock tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#E2F952] text-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-6">
          {filter === 'planner' ? (
            <StudyPlannerZineBoard />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuotes.map((q) => (
                <StudyMotivationStickyCard key={q.id} quoteItem={q} size="md" />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-mono text-slate-400 flex-shrink-0">
          <span>Click any card's copy icon to save quote to clipboard</span>
          <span className="text-[#E2F952] font-woodblock">✦ NEVER GIVE UP ✦</span>
        </div>
      </div>
    </div>
  );
};
