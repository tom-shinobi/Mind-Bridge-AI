import React, { useState, useEffect, useRef } from 'react';
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
  Minimize2
} from 'lucide-react';
import { sound } from '../../services/soundService';

export interface MusicStation {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  icon: React.ElementType;
  theme: 'amber' | 'cyan' | 'purple' | 'lime';
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
    tagline: 'Warm Rhodes chords & cozy ambient coffee shop vibe',
    emoji: '☕',
    icon: Coffee,
    theme: 'amber',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    synthNotes: [220, 277.18, 329.63, 415.3], // A major 7th chord
    accentColor: '#F59E0B',
    borderClass: 'border-amber-500/40 hover:border-amber-400',
    glowClass: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    bgGradient: 'from-amber-950/40 via-black/80 to-stone-900/60'
  },
  {
    id: 'cosmic_focus',
    name: 'Cosmic Neon Focus',
    tagline: '432Hz binaural synth drone & deep cognitive flow',
    emoji: '🌌',
    icon: Moon,
    theme: 'cyan',
    streamUrl: 'https://stream.zeno.fm/0r0xa792kwzuv',
    synthNotes: [216, 324, 432, 648], // 432Hz harmonic series
    accentColor: '#06B6D4',
    borderClass: 'border-cyan-500/40 hover:border-cyan-400',
    glowClass: 'shadow-[0_0_25px_rgba(6,182,212,0.25)]',
    bgGradient: 'from-cyan-950/40 via-black/80 to-blue-950/60'
  },
  {
    id: 'tokyo_rain',
    name: 'Tokyo Rain & Chillhop',
    tagline: 'Mellow rainy night tape loops & soothing vinyl warmth',
    emoji: '🌧️',
    icon: CloudRain,
    theme: 'purple',
    streamUrl: 'https://stream.zeno.fm/4e4g6hqw52zuv',
    synthNotes: [174.61, 220, 261.63, 329.63], // F major 7th
    accentColor: '#A855F7',
    borderClass: 'border-purple-500/40 hover:border-purple-400',
    glowClass: 'shadow-[0_0_25px_rgba(168,85,247,0.25)]',
    bgGradient: 'from-purple-950/40 via-black/80 to-pink-950/60'
  },
  {
    id: 'zen_garden',
    name: 'Zen Garden Alpha',
    tagline: 'Acoustic bamboo stillness & 10Hz calming brainwaves',
    emoji: '🌿',
    icon: Leaf,
    theme: 'lime',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    synthNotes: [196, 246.94, 293.66, 392], // G major pentatonic
    accentColor: '#A3E635',
    borderClass: 'border-lime-400/40 hover:border-lime-300',
    glowClass: 'shadow-[0_0_25px_rgba(163,230,53,0.25)]',
    bgGradient: 'from-lime-950/40 via-black/80 to-emerald-950/60'
  }
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

  const currentStation = STATIONS[currentStationIndex];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

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
          className={`w-80 rounded-3xl p-5 border-2 transition-all duration-300 backdrop-blur-2xl bg-gradient-to-br ${currentStation.bgGradient} ${currentStation.borderClass} ${currentStation.glowClass}`}
        >
          {/* Masking Tape Decor */}
          <div className="masking-tape-corner-tr z-10" />

          {/* Player Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all"
                style={{
                  backgroundColor: `${currentStation.accentColor}20`,
                  borderColor: `${currentStation.accentColor}50`,
                  color: currentStation.accentColor
                }}
              >
                <Radio className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
              </div>
              <div>
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
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Minimize player"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Vibe description & Animated visualizer */}
          <div className="py-3 space-y-2">
            <p className="text-[11px] text-slate-300 leading-snug font-sans">
              {currentStation.tagline}
            </p>

            {/* Visualizer bars */}
            <div className="flex items-center gap-1 h-6 pt-1">
              {[0.4, 0.9, 0.6, 1, 0.7, 0.85, 0.5, 0.75].map((scale, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: currentStation.accentColor,
                    height: isPlaying ? `${scale * 100}%` : '20%',
                    opacity: isPlaying ? 0.85 : 0.3,
                    animation: isPlaying
                      ? `pulse ${0.8 + (i % 3) * 0.3}s ease-in-out infinite alternate`
                      : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Station Switcher (Changes Theme & Vibe!) */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Study Moods ({STATIONS.length})
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {STATIONS.map((station, idx) => {
                const isSelected = idx === currentStationIndex;
                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => handleStationChange(idx)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'border-white bg-white/15 text-white font-bold shadow-md'
                        : 'border-white/10 bg-black/40 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-sm">{station.emoji}</span>
                    <span className="text-[10px] truncate leading-tight">{station.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls: Volume Slider & Play/Pause */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-white/10 mt-3">
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
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

            <button
              onClick={togglePlay}
              className="py-2 px-4 rounded-xl font-bold uppercase text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
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
                  <span>Listen</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* MINIMIZED FLOATING PILL */
        <div
          className={`rounded-full p-1.5 pl-3.5 border-2 transition-all duration-300 backdrop-blur-2xl bg-black/85 flex items-center gap-3 shadow-2xl ${currentStation.borderClass} ${currentStation.glowClass}`}
        >
          {/* Station Indicator */}
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-base">{currentStation.emoji}</span>
            <div className="hidden sm:block">
              <p className="text-[10px] text-slate-400 leading-none">LOFI RADIO</p>
              <p className="text-xs font-bold text-white leading-tight">
                {currentStation.name.split(' ')[0]}
              </p>
            </div>
          </div>

          {/* Mini Waveform */}
          {isPlaying && (
            <div className="flex items-center gap-0.5 h-3 px-1">
              {[0.4, 1, 0.6, 0.9].map((s, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full animate-pulse"
                  style={{
                    backgroundColor: currentStation.accentColor,
                    height: `${s * 100}%`
                  }}
                />
              ))}
            </div>
          )}

          {/* Quick Play/Pause button */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
            style={{
              backgroundColor: currentStation.accentColor,
              color: '#000000'
            }}
            title={isPlaying ? 'Pause music' : 'Play Lo-Fi study beats'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-black" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
            )}
          </button>

          {/* Expand toggle */}
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Open music player settings"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
