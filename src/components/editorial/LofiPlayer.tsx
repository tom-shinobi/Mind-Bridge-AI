import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Radio,
  Sparkles,
  Coffee,
  CloudRain,
  Moon,
  Leaf,
  ChevronUp,
  Minimize2,
  SkipBack,
  SkipForward,
  Search,
  Cpu,
  Scroll,
  Disc,
  Waves,
  Gamepad2,
  TreePine,
  Music,
  BookOpen,
  Zap,
  Headphones,
  X
} from 'lucide-react';
import { sound } from '../../services/soundService';

export type StationCategory = 'all' | 'lofi' | 'ambient' | 'classical' | 'jazz' | 'synth' | 'nature';

export interface MusicStation {
  id: string;
  name: string;
  category: 'lofi' | 'ambient' | 'classical' | 'jazz' | 'synth' | 'nature';
  tagline: string;
  emoji: string;
  icon: React.ElementType;
  theme: 'amber' | 'cyan' | 'purple' | 'lime' | 'emerald' | 'orange' | 'indigo' | 'rose' | 'yellow' | 'blue';
  streamUrl: string;
  synthNotes: number[]; // Frequencies in Hz for Web Audio synthesis fallback
  accentColor: string;
  borderClass: string;
  glowClass: string;
  bgGradient: string;
}

export const STATIONS: MusicStation[] = [
  {
    id: 'midnight_cafe',
    name: 'Midnight Study Cafe',
    category: 'lofi',
    tagline: 'Warm Rhodes chords & cozy ambient coffee shop vibe',
    emoji: '☕',
    icon: Coffee,
    theme: 'amber',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    synthNotes: [220, 277.18, 329.63, 415.3], // A major 7th chord
    accentColor: '#F59E0B',
    borderClass: 'border-amber-500/40 hover:border-amber-400',
    glowClass: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    bgGradient: 'from-amber-950/40 via-black/85 to-stone-900/60'
  },
  {
    id: 'cosmic_focus',
    name: 'Cosmic Neon Focus',
    category: 'ambient',
    tagline: '432Hz binaural synth drone & deep cognitive flow',
    emoji: '🌌',
    icon: Moon,
    theme: 'cyan',
    streamUrl: 'https://stream.zeno.fm/0r0xa792kwzuv',
    synthNotes: [216, 324, 432, 648], // 432Hz harmonic series
    accentColor: '#06B6D4',
    borderClass: 'border-cyan-500/40 hover:border-cyan-400',
    glowClass: 'shadow-[0_0_25px_rgba(6,182,212,0.25)]',
    bgGradient: 'from-cyan-950/40 via-black/85 to-blue-950/60'
  },
  {
    id: 'tokyo_rain',
    name: 'Tokyo Rain & Chillhop',
    category: 'lofi',
    tagline: 'Mellow rainy night tape loops & soothing vinyl warmth',
    emoji: '🌧️',
    icon: CloudRain,
    theme: 'purple',
    streamUrl: 'https://stream.zeno.fm/4e4g6hqw52zuv',
    synthNotes: [174.61, 220, 261.63, 329.63], // F major 7th
    accentColor: '#A855F7',
    borderClass: 'border-purple-500/40 hover:border-purple-400',
    glowClass: 'shadow-[0_0_25px_rgba(168,85,247,0.25)]',
    bgGradient: 'from-purple-950/40 via-black/85 to-pink-950/60'
  },
  {
    id: 'zen_garden',
    name: 'Zen Garden Alpha',
    category: 'nature',
    tagline: 'Acoustic bamboo stillness & 10Hz calming alpha brainwaves',
    emoji: '🌿',
    icon: Leaf,
    theme: 'lime',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    synthNotes: [196, 246.94, 293.66, 392], // G major pentatonic
    accentColor: '#A3E635',
    borderClass: 'border-lime-400/40 hover:border-lime-300',
    glowClass: 'shadow-[0_0_25px_rgba(163,230,53,0.25)]',
    bgGradient: 'from-lime-950/40 via-black/85 to-emerald-950/60'
  },
  {
    id: 'cyberpunk_grid',
    name: 'Cyberpunk Coding Grid',
    category: 'synth',
    tagline: 'DEF CON hacker arpeggios & high-throughput coding flow',
    emoji: '⚡',
    icon: Cpu,
    theme: 'emerald',
    streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
    synthNotes: [146.83, 220, 293.66, 440], // D minor arpeggio
    accentColor: '#10B981',
    borderClass: 'border-emerald-500/40 hover:border-emerald-400',
    glowClass: 'shadow-[0_0_25px_rgba(16,185,129,0.25)]',
    bgGradient: 'from-emerald-950/40 via-black/85 to-teal-950/60'
  },
  {
    id: 'baroque_focus',
    name: 'Baroque Deep Focus',
    category: 'classical',
    tagline: 'Swiss chamber strings, Bach & Vivaldi polyphony for memory',
    emoji: '🎻',
    icon: Scroll,
    theme: 'amber',
    streamUrl: 'https://stream.srg-ssr.ch/m/rsc_de/mp3_128',
    synthNotes: [146.83, 220, 293.66, 369.99], // D major baroque chord
    accentColor: '#F59E0B',
    borderClass: 'border-amber-500/40 hover:border-amber-400',
    glowClass: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    bgGradient: 'from-amber-950/40 via-black/85 to-orange-950/60'
  },
  {
    id: 'smoky_jazz',
    name: 'Smoky Jazz Bar & Piano',
    category: 'jazz',
    tagline: 'Vintage upright piano, brushed snares & midnight Swiss jazz',
    emoji: '🎷',
    icon: Disc,
    theme: 'orange',
    streamUrl: 'https://stream.srg-ssr.ch/m/rsj/mp3_128',
    synthNotes: [130.81, 196, 233.08, 293.66], // C minor 9th jazz voicing
    accentColor: '#FB923C',
    borderClass: 'border-orange-500/40 hover:border-orange-400',
    glowClass: 'shadow-[0_0_25px_rgba(251,146,60,0.25)]',
    bgGradient: 'from-orange-950/40 via-black/85 to-stone-950/60'
  },
  {
    id: 'drone_zone',
    name: 'SomaFM Drone Zone',
    category: 'ambient',
    tagline: 'Atmospheric cosmic soundscapes & deep subterranean pads',
    emoji: '🪐',
    icon: Waves,
    theme: 'indigo',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    synthNotes: [55, 110, 165, 220], // Sub-bass celestial 5th
    accentColor: '#6366F1',
    borderClass: 'border-indigo-500/40 hover:border-indigo-400',
    glowClass: 'shadow-[0_0_25px_rgba(99,102,241,0.25)]',
    bgGradient: 'from-indigo-950/40 via-black/85 to-slate-950/60'
  },
  {
    id: 'nightwave_plaza',
    name: 'Nightwave Plaza Vapor',
    category: 'synth',
    tagline: '80s mall nostalgia, slowed funk reverb & aesthetic vapor vibes',
    emoji: '🌴',
    icon: Sparkles,
    theme: 'rose',
    streamUrl: 'https://radio.plaza.one/mp3',
    synthNotes: [155.56, 196, 233.08, 293.66], // Eb major 7th vapor chord
    accentColor: '#F43F5E',
    borderClass: 'border-rose-500/40 hover:border-rose-400',
    glowClass: 'shadow-[0_0_25px_rgba(244,63,94,0.25)]',
    bgGradient: 'from-rose-950/40 via-black/85 to-purple-950/60'
  },
  {
    id: 'chiptune_quest',
    name: '8-Bit Chiptune Quest',
    category: 'synth',
    tagline: 'Nostalgic RPG village chip melodies & pixelated focus energy',
    emoji: '👾',
    icon: Gamepad2,
    theme: 'yellow',
    streamUrl: 'https://ice1.somafm.com/cliqhop-128-mp3',
    synthNotes: [261.63, 329.63, 392, 523.25], // C major arpeggiated arcade
    accentColor: '#EAB308',
    borderClass: 'border-yellow-400/40 hover:border-yellow-300',
    glowClass: 'shadow-[0_0_25px_rgba(234,179,8,0.25)]',
    bgGradient: 'from-yellow-950/40 via-black/85 to-stone-900/60'
  },
  {
    id: 'deep_forest',
    name: 'Deep Forest Brook',
    category: 'nature',
    tagline: 'Pristine mountain stream, gentle woodland wind & pine needles',
    emoji: '🌲',
    icon: TreePine,
    theme: 'emerald',
    streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
    synthNotes: [164.81, 246.94, 329.63, 493.88], // E major 9th acoustic
    accentColor: '#34D399',
    borderClass: 'border-emerald-400/40 hover:border-emerald-300',
    glowClass: 'shadow-[0_0_25px_rgba(52,211,153,0.25)]',
    bgGradient: 'from-emerald-950/40 via-black/85 to-teal-950/60'
  },
  {
    id: 'secret_agent',
    name: 'Secret Agent Lounge',
    category: 'jazz',
    tagline: 'Spy vintage jazz, cinematic surf noir & 60s bossa nova',
    emoji: '🍸',
    icon: Music,
    theme: 'amber',
    streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
    synthNotes: [116.54, 174.61, 233.08, 349.23], // Bb minor mystery chord
    accentColor: '#D97706',
    borderClass: 'border-amber-600/40 hover:border-amber-500',
    glowClass: 'shadow-[0_0_25px_rgba(217,119,6,0.25)]',
    bgGradient: 'from-amber-950/40 via-black/85 to-stone-950/60'
  },
  {
    id: 'dark_academia',
    name: 'Dark Academia Chamber',
    category: 'classical',
    tagline: 'Rainy gothic library, solemn cello suites & deep thesis focus',
    emoji: '📜',
    icon: BookOpen,
    theme: 'purple',
    streamUrl: 'https://stream.srg-ssr.ch/m/rsc_de/mp3_128',
    synthNotes: [110, 164.81, 220, 329.63], // A minor cello resonance
    accentColor: '#C084FC',
    borderClass: 'border-purple-400/40 hover:border-purple-300',
    glowClass: 'shadow-[0_0_25px_rgba(192,132,252,0.25)]',
    bgGradient: 'from-purple-950/40 via-black/85 to-indigo-950/60'
  },
  {
    id: 'space_station',
    name: 'SomaFM Space Station',
    category: 'ambient',
    tagline: 'Mid-tempo electronic space music & orbital telemetry',
    emoji: '🚀',
    icon: Zap,
    theme: 'blue',
    streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
    synthNotes: [174.61, 261.63, 349.23, 523.25], // F resonant overtone
    accentColor: '#3B82F6',
    borderClass: 'border-blue-500/40 hover:border-blue-400',
    glowClass: 'shadow-[0_0_25px_rgba(59,130,246,0.25)]',
    bgGradient: 'from-blue-950/40 via-black/85 to-slate-950/60'
  },
  {
    id: 'solfeggio_clarity',
    name: 'Solfeggio 528Hz Clarity',
    category: 'ambient',
    tagline: 'Pure transformative healing resonance & anxiety-relief bells',
    emoji: '✨',
    icon: Sparkles,
    theme: 'lime',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    synthNotes: [132, 264, 396, 528], // 528Hz Solfeggio series
    accentColor: '#E2F952',
    borderClass: 'border-[#E2F952]/40 hover:border-[#E2F952]',
    glowClass: 'shadow-[0_0_25px_rgba(226,249,82,0.3)]',
    bgGradient: 'from-stone-950/40 via-black/85 to-emerald-950/60'
  },
  {
    id: 'adhd_brown_noise',
    name: 'ADHD Brown Noise Shield',
    category: 'nature',
    tagline: 'Deep acoustic masking, waterfall frequency & total distraction shield',
    emoji: '🎧',
    icon: Headphones,
    theme: 'cyan',
    streamUrl: 'https://stream.zeno.fm/0r0xa792kwzuv',
    synthNotes: [65.41, 98.00, 130.81, 196.00], // Sub-low acoustic warmth
    accentColor: '#38BDF8',
    borderClass: 'border-sky-500/40 hover:border-sky-400',
    glowClass: 'shadow-[0_0_25px_rgba(56,189,248,0.25)]',
    bgGradient: 'from-sky-950/40 via-black/85 to-slate-950/60'
  }
];

const CATEGORIES: { id: StationCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '📻' },
  { id: 'lofi', label: 'Lo-Fi', icon: '☕' },
  { id: 'ambient', label: 'Ambient', icon: '🌌' },
  { id: 'classical', label: 'Classical', icon: '🎻' },
  { id: 'jazz', label: 'Jazz', icon: '🎷' },
  { id: 'synth', label: 'Synth', icon: '⚡' },
  { id: 'nature', label: 'Nature', icon: '🌲' }
];

interface LofiPlayerProps {
  activeTab?: string;
}

export const LofiPlayer: React.FC<LofiPlayerProps> = ({ activeTab }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [volume, setVolume] = useState(0.65);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<StationCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentStation = STATIONS[currentStationIndex];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Filter stations by active category and search term
  const filteredStations = useMemo(() => {
    return STATIONS.map((station, originalIndex) => ({ station, originalIndex })).filter(
      ({ station }) => {
        const matchesCategory =
          selectedCategory === 'all' || station.category === selectedCategory;
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !query ||
          station.name.toLowerCase().includes(query) ||
          station.tagline.toLowerCase().includes(query) ||
          station.category.toLowerCase().includes(query);
        return matchesCategory && matchesQuery;
      }
    );
  }, [selectedCategory, searchQuery]);

  // Initialize Web Audio Fallback Synthesizer
  const startSynth = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }

      if (!audioCtxRef.current) return;
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      stopSynth();

      const ctx = audioCtxRef.current;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.12, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const oscs: OscillatorNode[] = [];
      currentStation.synthNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Subtle gentle detune for lush chorus feel
        osc.detune.setValueAtTime(idx * 4 - 6, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.25, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });

      oscillatorsRef.current = oscs;
    } catch (e) {
      console.warn('Web Audio synthesis fallback:', e);
    }
  };

  const stopSynth = () => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    oscillatorsRef.current = [];
  };

  // Playback Control
  const togglePlay = () => {
    sound.playClick();
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      stopSynth();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = currentStation.streamUrl;
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current
          .play()
          .catch(() => {
            // Stream blocked or offline -> start synthetic ambient chord pad!
            startSynth();
          });
      } else {
        startSynth();
      }
    }
  };

  const handleStationChange = (index: number) => {
    sound.playClick();
    setCurrentStationIndex(index);
    const station = STATIONS[index];

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.src = station.streamUrl;
        audioRef.current
          .play()
          .catch(() => {
            startSynth();
          });
      }
    }
  };

  const handlePrevStation = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const prevIndex = (currentStationIndex - 1 + STATIONS.length) % STATIONS.length;
    handleStationChange(prevIndex);
  };

  const handleNextStation = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextIndex = (currentStationIndex + 1) % STATIONS.length;
    handleStationChange(nextIndex);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0 && isMuted) setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : val;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : val * 0.12, audioCtxRef.current.currentTime);
    }
  };

  const toggleMute = () => {
    sound.playClick();
    const next = !isMuted;
    setIsMuted(next);
    if (audioRef.current) {
      audioRef.current.volume = next ? 0 : volume;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(next ? 0 : volume * 0.12, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      stopSynth();
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  return (
    <div
      className={`fixed z-40 font-mono text-xs select-none transition-all duration-300 ${
        activeTab === 'chat'
          ? 'hidden md:block md:bottom-5 md:right-5'
          : 'bottom-20 right-3.5 md:bottom-5 md:right-5'
      }`}
    >
      {/* Hidden native audio tag */}
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => startSynth()}
        onError={() => startSynth()}
      />

      {/* EXPANDED PLAYER DRAWER */}
      {isExpanded ? (
        <div
          className={`w-84 sm:w-92 max-w-[calc(100vw-1.5rem)] max-h-[85vh] flex flex-col rounded-3xl p-4 sm:p-5 border-2 transition-all duration-300 backdrop-blur-2xl bg-gradient-to-br ${currentStation.bgGradient} ${currentStation.borderClass} ${currentStation.glowClass}`}
        >
          {/* Masking Tape Decor */}
          <div className="masking-tape-corner-tr z-10" />

          {/* Player Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all shrink-0"
                style={{
                  backgroundColor: `${currentStation.accentColor}20`,
                  borderColor: `${currentStation.accentColor}50`,
                  color: currentStation.accentColor
                }}
              >
                <Radio className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-lime-400" />
                  LO-FI STUDY BEATS
                </span>
                <p className="text-xs font-bold text-white leading-tight truncate">
                  {currentStation.name}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
              title="Minimize player"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Vibe description & Animated visualizer */}
          <div className="py-2.5 space-y-2 shrink-0">
            <p className="text-[11px] text-slate-300 leading-snug font-sans">
              {currentStation.tagline}
            </p>

            {/* Visualizer bars */}
            <div className="flex items-center gap-1 h-5 pt-0.5">
              {[0.4, 0.9, 0.6, 1, 0.7, 0.85, 0.5, 0.75, 0.6, 0.95].map((scale, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: currentStation.accentColor,
                    height: isPlaying ? `${scale * 100}%` : '20%',
                    opacity: isPlaying ? 0.85 : 0.3,
                    animation: isPlaying
                      ? `pulse ${0.7 + (i % 4) * 0.25}s ease-in-out infinite alternate`
                      : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-2 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stations or genres..."
              className="w-full pl-8 pr-7 py-1.5 bg-black/40 border border-white/10 rounded-xl text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none shrink-0">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'bg-white text-black shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Station Directory List */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col pt-1">
            <div className="flex items-center justify-between pb-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Stations</span>
              <span>{filteredStations.length} available</span>
            </div>

            <div className="overflow-y-auto max-h-44 pr-1 space-y-1 custom-scrollbar">
              {filteredStations.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs font-sans">
                  No stations found matching "{searchQuery}"
                </div>
              ) : (
                filteredStations.map(({ station, originalIndex }) => {
                  const isSelected = originalIndex === currentStationIndex;
                  return (
                    <button
                      key={station.id}
                      type="button"
                      onClick={() => handleStationChange(originalIndex)}
                      className={`w-full p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-white bg-white/20 text-white font-bold shadow-md'
                          : 'border-white/5 bg-black/40 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0">{station.emoji}</span>
                        <div className="min-w-0 text-left">
                          <p className="text-[11px] font-semibold truncate leading-tight">
                            {station.name}
                          </p>
                          <p className="text-[9px] text-slate-400 truncate capitalize">
                            {station.category} • {station.tagline.split(',')[0]}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 shrink-0">
                          {isPlaying ? (
                            <span
                              className="w-2 h-2 rounded-full animate-ping"
                              style={{ backgroundColor: currentStation.accentColor }}
                            />
                          ) : (
                            <span className="text-[9px] uppercase tracking-wider font-mono text-emerald-400">
                              Active
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Controls: Volume Slider, Skips & Play/Pause */}
          <div className="pt-3 flex items-center justify-between gap-2 border-t border-white/10 mt-2 shrink-0">
            {/* Volume control */}
            <div className="flex items-center gap-1.5 w-24">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Playback Transport Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevStation}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                title="Previous station"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={togglePlay}
                className="py-2 px-3.5 rounded-xl font-bold uppercase text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                style={{
                  backgroundColor: currentStation.accentColor,
                  color: '#000000',
                  boxShadow: `0 0 15px ${currentStation.accentColor}50`
                }}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-black" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Play</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextStation}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                title="Next station"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MINIMIZED FLOATING PILL */
        <div
          className={`rounded-full p-1.5 pl-3 border-2 transition-all duration-300 backdrop-blur-2xl bg-black/90 flex items-center gap-2 sm:gap-2.5 shadow-2xl ${currentStation.borderClass} ${currentStation.glowClass}`}
        >
          {/* Station Indicator */}
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 cursor-pointer group pr-1"
          >
            <span className="text-base">{currentStation.emoji}</span>
            <div className="hidden sm:block text-left">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider leading-none">
                {currentStation.category}
              </p>
              <p className="text-xs font-bold text-white leading-tight max-w-[110px] truncate">
                {currentStation.name}
              </p>
            </div>
          </div>

          {/* Mini Waveform */}
          {isPlaying && (
            <div className="flex items-center gap-0.5 h-3 px-0.5">
              {[0.4, 1, 0.6, 0.9].map((s, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: currentStation.accentColor,
                    height: `${s * 100}%`
                  }}
                />
              ))}
            </div>
          )}

          {/* Quick Skip Back */}
          <button
            onClick={handlePrevStation}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Previous station"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Quick Play/Pause button */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-md"
            style={{
              backgroundColor: currentStation.accentColor,
              color: '#000000'
            }}
            title={isPlaying ? 'Pause music' : 'Play study music'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-black" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
            )}
          </button>

          {/* Quick Skip Forward */}
          <button
            onClick={handleNextStation}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Next station"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Expand toggle */}
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer ml-0.5"
            title="Open music player settings"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
