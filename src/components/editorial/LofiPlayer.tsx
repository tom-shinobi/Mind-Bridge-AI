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
  X,
  Mic,
  Flame
} from 'lucide-react';
import { sound } from '../../services/soundService';

export type StationCategory = 'all' | 'pop' | 'lofi' | 'ambient' | 'classical' | 'jazz' | 'synth' | 'nature';

export interface MusicStation {
  id: string;
  name: string;
  category: 'pop' | 'lofi' | 'ambient' | 'classical' | 'jazz' | 'synth' | 'nature';
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
    id: 'power_181_top40',
    name: 'Power 181 (Top 40 Pop)',
    category: 'pop',
    tagline: 'Justin Bieber, Taylor Swift, Dua Lipa, Ariana Grande & Billboard Hot 100',
    emoji: '🔥',
    icon: Flame,
    theme: 'rose',
    streamUrl: 'https://listen.181fm.com/181-power_128k.mp3',
    synthNotes: [261.63, 329.63, 392.00, 523.25], // C major bright pop chord
    accentColor: '#FB7185',
    borderClass: 'border-rose-500/40 hover:border-rose-400',
    glowClass: 'shadow-[0_0_25px_rgba(251,113,133,0.3)]',
    bgGradient: 'from-rose-950/40 via-black/85 to-pink-950/60'
  },
  {
    id: 'pure_pop_radio',
    name: 'Pure Pop Central',
    category: 'pop',
    tagline: 'Non-stop Justin Bieber, Ed Sheeran, Shawn Mendes & modern pop anthems',
    emoji: '🎤',
    icon: Mic,
    theme: 'cyan',
    streamUrl: 'https://0n-pop.radionetz.de/0n-pop.mp3',
    synthNotes: [174.61, 220.00, 261.63, 349.23], // F major chords
    accentColor: '#38BDF8',
    borderClass: 'border-sky-400/40 hover:border-sky-300',
    glowClass: 'shadow-[0_0_25px_rgba(56,189,248,0.3)]',
    bgGradient: 'from-sky-950/40 via-black/85 to-blue-950/60'
  },
  {
    id: 'top40_mega_hits',
    name: 'Top 40 Mega Hits',
    category: 'pop',
    tagline: 'Global #1 Billboard & UK Chart hits, commercial pop bangers non-stop',
    emoji: '⭐',
    icon: Sparkles,
    theme: 'yellow',
    streamUrl: 'https://0n-top40.radionetz.de/0n-top40.mp3',
    synthNotes: [220.00, 277.18, 329.63, 440.00], // A major pop chords
    accentColor: '#FBBF24',
    borderClass: 'border-amber-400/40 hover:border-amber-300',
    glowClass: 'shadow-[0_0_25px_rgba(251,191,36,0.3)]',
    bgGradient: 'from-amber-950/40 via-black/85 to-orange-950/60'
  },
  {
    id: 'the_beat_rnb_hits',
    name: 'The Beat (Hip-Hop & R&B)',
    category: 'pop',
    tagline: 'Drake, Post Malone, The Weeknd, Justin Bieber collabs & modern R&B',
    emoji: '🎧',
    icon: Headphones,
    theme: 'purple',
    streamUrl: 'https://listen.181fm.com/181-beat_128k.mp3',
    synthNotes: [146.83, 174.61, 220.00, 293.66], // D minor groove
    accentColor: '#C084FC',
    borderClass: 'border-purple-500/40 hover:border-purple-400',
    glowClass: 'shadow-[0_0_25px_rgba(192,132,252,0.3)]',
    bgGradient: 'from-purple-950/40 via-black/85 to-indigo-950/60'
  },
  {
    id: 'party_181_dance',
    name: 'Party 181 Dance Pop',
    category: 'pop',
    tagline: 'High-octane club remixes, dance-pop anthems & party chart bangers',
    emoji: '🎉',
    icon: Zap,
    theme: 'lime',
    streamUrl: 'https://listen.181fm.com/181-party_128k.mp3',
    synthNotes: [130.81, 196.00, 261.63, 329.63], // C major dance chords
    accentColor: '#A3E635',
    borderClass: 'border-lime-500/40 hover:border-lime-400',
    glowClass: 'shadow-[0_0_25px_rgba(163,230,53,0.3)]',
    bgGradient: 'from-lime-950/40 via-black/85 to-emerald-950/60'
  },
  {
    id: 'the_vibe_urban',
    name: 'The Vibe Urban Hits',
    category: 'pop',
    tagline: 'Smooth modern pop, Bieber acoustic cuts, SZA & soulful radio gems',
    emoji: '✨',
    icon: Disc,
    theme: 'indigo',
    streamUrl: 'https://listen.181fm.com/181-vibe_128k.mp3',
    synthNotes: [196.00, 246.94, 293.66, 392.00], // G major smooth chords
    accentColor: '#818CF8',
    borderClass: 'border-indigo-500/40 hover:border-indigo-400',
    glowClass: 'shadow-[0_0_25px_rgba(129,140,248,0.3)]',
    bgGradient: 'from-indigo-950/40 via-black/85 to-violet-950/60'
  },
  {
    id: 'somafm_poptron',
    name: 'SomaFM PopTron',
    category: 'pop',
    tagline: 'Electropop and indie dance rock with infectious vocal hooks',
    emoji: '⚡',
    icon: Radio,
    theme: 'orange',
    streamUrl: 'https://ice1.somafm.com/poptron-128-mp3',
    synthNotes: [220.00, 277.18, 329.63, 440.00],
    accentColor: '#FB923C',
    borderClass: 'border-orange-500/40 hover:border-orange-400',
    glowClass: 'shadow-[0_0_25px_rgba(251,146,60,0.3)]',
    bgGradient: 'from-orange-950/40 via-black/85 to-amber-950/60'
  },
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
  { id: 'pop', label: 'Pop & Hits', icon: '🎤' },
  { id: 'lofi', label: 'Lo-Fi', icon: '☕' },
  { id: 'ambient', label: 'Ambient', icon: '🌌' },
  { id: 'classical', label: 'Classical', icon: '🎻' },
  { id: 'jazz', label: 'Jazz', icon: '🎷' },
  { id: 'synth', label: 'Synth', icon: '⚡' },
  { id: 'nature', label: 'Nature', icon: '🌲' }
];

export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  youtubeId: string;
  category: 'bieber' | 'pop';
  emoji: string;
  badge?: string;
}

export const CURATED_TRACKS: SongTrack[] = [
  // Justin Bieber Hits (Full Official Songs)
  {
    id: 'bieber_ghost',
    title: 'Ghost',
    artist: 'Justin Bieber',
    duration: '3:25',
    youtubeId: 'Fp8msa5ctsM',
    category: 'bieber',
    emoji: '👻',
    badge: 'Hot 100'
  },
  {
    id: 'bieber_peaches',
    title: 'Peaches',
    artist: 'Justin Bieber ft. Daniel Caesar & Giveon',
    duration: '3:18',
    youtubeId: 'tQ0yjYUFKAE',
    category: 'bieber',
    emoji: '🍑',
    badge: 'Billboard #1'
  },
  {
    id: 'bieber_stay',
    title: 'Stay',
    artist: 'The Kid LAROI & Justin Bieber',
    duration: '2:21',
    youtubeId: 'kTJczUoc26U',
    category: 'bieber',
    emoji: '🚀',
    badge: 'Global #1'
  },
  {
    id: 'bieber_sorry',
    title: 'Sorry',
    artist: 'Justin Bieber',
    duration: '3:20',
    youtubeId: 'fRh_vgS2dFE',
    category: 'bieber',
    emoji: '💃',
    badge: 'Diamond'
  },
  {
    id: 'bieber_love_yourself',
    title: 'Love Yourself',
    artist: 'Justin Bieber',
    duration: '3:53',
    youtubeId: 'oyEuk8j8imI',
    category: 'bieber',
    emoji: '🎸',
    badge: 'Acoustic'
  },
  {
    id: 'bieber_baby',
    title: 'Baby',
    artist: 'Justin Bieber ft. Ludacris',
    duration: '3:34',
    youtubeId: 'kffacxfA7G4',
    category: 'bieber',
    emoji: '👶',
    badge: 'Classic'
  },
  {
    id: 'bieber_what_do_you_mean',
    title: 'What Do You Mean?',
    artist: 'Justin Bieber',
    duration: '3:26',
    youtubeId: 'DK_0jXPuIr0',
    category: 'bieber',
    emoji: '⏰',
    badge: 'Hit'
  },
  {
    id: 'bieber_intentions',
    title: 'Intentions',
    artist: 'Justin Bieber ft. Quavo',
    duration: '3:33',
    youtubeId: '3AyMjyHu1bA',
    category: 'bieber',
    emoji: '✨',
    badge: 'Groove'
  },
  {
    id: 'bieber_hold_on',
    title: 'Hold On',
    artist: 'Justin Bieber',
    duration: '2:51',
    youtubeId: 'LWeiydKl0mU',
    category: 'bieber',
    emoji: '🏍️',
    badge: 'Soul'
  },
  {
    id: 'bieber_holy',
    title: 'Holy',
    artist: 'Justin Bieber ft. Chance The Rapper',
    duration: '3:32',
    youtubeId: 'pvPsJFRGleA',
    category: 'bieber',
    emoji: '🙏',
    badge: 'Warm'
  },
  {
    id: 'bieber_yummy',
    title: 'Yummy',
    artist: 'Justin Bieber',
    duration: '3:28',
    youtubeId: '8EJ3zbKTWQ8',
    category: 'bieber',
    emoji: '🍭',
    badge: 'Trap-Pop'
  },
  {
    id: 'bieber_company',
    title: 'Company',
    artist: 'Justin Bieber',
    duration: '3:28',
    youtubeId: 'gdx7gN1UyX0',
    category: 'bieber',
    emoji: '🌴',
    badge: 'Chill'
  },
  {
    id: 'bieber_boyfriend',
    title: 'Boyfriend',
    artist: 'Justin Bieber',
    duration: '2:51',
    youtubeId: '4GuqB1BQVr4',
    category: 'bieber',
    emoji: '🕶️',
    badge: 'R&B'
  },
  {
    id: 'bieber_as_long_as_you_love_me',
    title: 'As Long As You Love Me',
    artist: 'Justin Bieber ft. Big Sean',
    duration: '3:49',
    youtubeId: 'R4em3LKQCAQ',
    category: 'bieber',
    emoji: '⚡',
    badge: 'Anthem'
  },
  {
    id: 'bieber_lonely',
    title: 'Lonely',
    artist: 'Justin Bieber & benny blanco',
    duration: '2:29',
    youtubeId: 'xQOO2xGQ1Pc',
    category: 'bieber',
    emoji: '🎭',
    badge: 'Piano'
  },
  {
    id: 'bieber_despacito',
    title: 'Despacito (Remix)',
    artist: 'Luis Fonsi, Daddy Yankee, Justin Bieber',
    duration: '3:48',
    youtubeId: '72UO0v5ESUo',
    category: 'bieber',
    emoji: '🔥',
    badge: 'Latin Pop'
  },
  // Global Pop Hits (Full Songs)
  {
    id: 'weeknd_blinding_lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    duration: '3:20',
    youtubeId: '4NRXx6U8ABQ',
    category: 'pop',
    emoji: '🌃',
    badge: 'Global #1'
  },
  {
    id: 'dualipa_levitating',
    title: 'Levitating',
    artist: 'Dua Lipa',
    duration: '3:23',
    youtubeId: 'TUVcZfQe-Kw',
    category: 'pop',
    emoji: '🌌',
    badge: 'Dance'
  },
  {
    id: 'harry_as_it_was',
    title: 'As It Was',
    artist: 'Harry Styles',
    duration: '2:47',
    youtubeId: 'H5v3kku4y6Q',
    category: 'pop',
    emoji: '💫',
    badge: 'Indie Pop'
  },
  {
    id: 'taylor_cruel_summer',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    duration: '2:58',
    youtubeId: 'ic8j13piAhQ',
    category: 'pop',
    emoji: '☀️',
    badge: 'Hot 100'
  },
  {
    id: 'bruno_thats_what_i_like',
    title: "That's What I Like",
    artist: 'Bruno Mars',
    duration: '3:26',
    youtubeId: 'PMivT7MJ41M',
    category: 'pop',
    emoji: '🕺',
    badge: 'Funk Pop'
  },
  {
    id: 'post_circles',
    title: 'Circles',
    artist: 'Post Malone',
    duration: '3:35',
    youtubeId: 'wXhTHyIgQ_U',
    category: 'pop',
    emoji: '⭕',
    badge: 'Acoustic'
  }
];

interface LofiPlayerProps {
  activeTab?: string;
}

export const LofiPlayer: React.FC<LofiPlayerProps> = ({ activeTab }) => {
  // Mode: 'songs' (Built-in YouTube Full Song Player) vs 'radio' (Live Streams)
  const [activeMode, setActiveMode] = useState<'songs' | 'radio'>('songs');

  // Song Player State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [songFilter, setSongFilter] = useState<'all' | 'bieber' | 'pop'>('bieber');
  const [activeCustomSearch, setActiveCustomSearch] = useState<string | null>(null);
  const [customInputText, setCustomInputText] = useState('');

  // Radio Player State
  const [isPlayingRadio, setIsPlayingRadio] = useState(false);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [selectedRadioCategory, setSelectedRadioCategory] = useState<StationCategory>('all');
  const [radioSearchQuery, setRadioSearchQuery] = useState('');

  // Common UI State
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentTrack = CURATED_TRACKS[currentTrackIndex] || CURATED_TRACKS[0];
  const currentStation = STATIONS[currentStationIndex] || STATIONS[0];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Filter curated songs in real time by category and search text
  const filteredTracks = useMemo(() => {
    return CURATED_TRACKS.map((track, originalIndex) => ({ track, originalIndex })).filter(
      ({ track }) => {
        const matchesCategory =
          songFilter === 'all' || track.category === songFilter;
        const q = customInputText.trim().toLowerCase();
        const matchesQuery =
          !q ||
          track.title.toLowerCase().includes(q) ||
          track.artist.toLowerCase().includes(q);
        return matchesCategory && matchesQuery;
      }
    );
  }, [songFilter, customInputText]);

  // Filter radio stations
  const filteredStations = useMemo(() => {
    return STATIONS.map((station, originalIndex) => ({ station, originalIndex })).filter(
      ({ station }) => {
        const matchesCategory =
          selectedRadioCategory === 'all' || station.category === selectedRadioCategory;
        const q = radioSearchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          station.name.toLowerCase().includes(q) ||
          station.tagline.toLowerCase().includes(q) ||
          station.category.toLowerCase().includes(q);
        return matchesCategory && matchesQuery;
      }
    );
  }, [selectedRadioCategory, radioSearchQuery]);

  // PostMessage control to the persistent YouTube iframe
  const postMessageToPlayer = (func: string, args: any = '') => {
    try {
      if (ytIframeRef.current && ytIframeRef.current.contentWindow) {
        ytIframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: func,
            args: args ? [args] : []
          }),
          '*'
        );
      }
    } catch (e) {
      console.warn('YouTube postMessage error:', e);
    }
  };

  // Song Controls
  const handleSelectTrack = (index: number) => {
    sound.playClick();
    if (isPlayingRadio) {
      if (audioRef.current) audioRef.current.pause();
      stopSynth();
      setIsPlayingRadio(false);
    }
    setActiveCustomSearch(null);
    setCurrentTrackIndex(index);
    setIsPlayingSong(true);
  };

  const toggleSongPlay = () => {
    sound.playClick();
    if (isPlayingRadio) {
      if (audioRef.current) audioRef.current.pause();
      stopSynth();
      setIsPlayingRadio(false);
    }
    if (isPlayingSong) {
      postMessageToPlayer('pauseVideo');
      setIsPlayingSong(false);
    } else {
      postMessageToPlayer('playVideo');
      setIsPlayingSong(true);
    }
  };

  const handleNextTrack = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();
    setActiveCustomSearch(null);
    const next = (currentTrackIndex + 1) % CURATED_TRACKS.length;
    setCurrentTrackIndex(next);
    setIsPlayingSong(true);
  };

  const handlePrevTrack = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();
    setActiveCustomSearch(null);
    const prev = (currentTrackIndex - 1 + CURATED_TRACKS.length) % CURATED_TRACKS.length;
    setCurrentTrackIndex(prev);
    setIsPlayingSong(true);
  };

  const handlePlayCustomSong = (query: string) => {
    if (!query.trim()) return;
    sound.playClick();
    if (isPlayingRadio) {
      if (audioRef.current) audioRef.current.pause();
      stopSynth();
      setIsPlayingRadio(false);
    }
    // Check if query matches a curated track
    const matchIdx = CURATED_TRACKS.findIndex(
      (t) =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.artist.toLowerCase().includes(query.toLowerCase())
    );
    if (matchIdx !== -1) {
      handleSelectTrack(matchIdx);
    } else {
      setActiveCustomSearch(query.trim());
      setIsPlayingSong(true);
    }
    setCustomInputText('');
  };

  // Listen to YouTube Player state changes for auto-advance
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.event === 'onStateChange') {
          // 1 = playing, 2 = paused, 0 = ended
          if (data.info === 1) setIsPlayingSong(true);
          if (data.info === 2) setIsPlayingSong(false);
          if (data.info === 0) {
            handleNextTrack();
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentTrackIndex]);

  // Web Audio Fallback Synthesizer for Radio
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

  // Radio Playback Controls
  const toggleRadioPlay = () => {
    sound.playClick();
    if (isPlayingSong) {
      postMessageToPlayer('pauseVideo');
      setIsPlayingSong(false);
    }
    if (isPlayingRadio) {
      if (audioRef.current) audioRef.current.pause();
      stopSynth();
      setIsPlayingRadio(false);
    } else {
      setIsPlayingRadio(true);
      if (audioRef.current) {
        audioRef.current.src = currentStation.streamUrl;
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current
          .play()
          .catch(() => {
            startSynth();
          });
      } else {
        startSynth();
      }
    }
  };

  const handleStationChange = (index: number) => {
    sound.playClick();
    if (isPlayingSong) {
      postMessageToPlayer('pauseVideo');
      setIsPlayingSong(false);
    }
    setCurrentStationIndex(index);
    const station = STATIONS[index];

    if (isPlayingRadio) {
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
    postMessageToPlayer('setVolume', Math.round(val * 100));
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
    if (next) {
      postMessageToPlayer('mute');
    } else {
      postMessageToPlayer('unMute');
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
      {/* Hidden native radio audio tag */}
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => startSynth()}
        onError={() => startSynth()}
      />

      {/* PERSISTENT BUILT-IN YOUTUBE IFRAME - NEVER UNMOUNTS WHEN MINIMIZED */}
      <div
        className={`transition-all duration-300 ${
          isExpanded && activeMode === 'songs'
            ? 'w-full h-44 rounded-2xl overflow-hidden my-2 border border-white/15 bg-black shadow-2xl relative block shrink-0'
            : 'fixed -bottom-96 -right-96 w-1 h-1 opacity-0 pointer-events-none'
        }`}
      >
        <iframe
          ref={ytIframeRef}
          key={
            activeCustomSearch
              ? `custom_${activeCustomSearch}`
              : currentTrack.youtubeId
          }
          src={
            activeCustomSearch
              ? `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(
                  activeCustomSearch
                )}&enablejsapi=1&autoplay=1`
              : `https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?enablejsapi=1&autoplay=1`
          }
          width="100%"
          height="100%"
          allow="autoplay; encrypted-media; picture-in-picture"
          className="w-full h-full border-0"
          title="Built-in Song Player"
        />
      </div>

      {/* EXPANDED PLAYER DRAWER */}
      {isExpanded ? (
        <div
          className={`w-84 sm:w-92 max-w-[calc(100vw-1.5rem)] max-h-[85vh] flex flex-col rounded-3xl p-4 sm:p-5 border-2 transition-all duration-300 backdrop-blur-2xl bg-gradient-to-br ${
            activeMode === 'songs'
              ? 'from-purple-950/50 via-black/90 to-indigo-950/60 border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.25)]'
              : `${currentStation.bgGradient} ${currentStation.borderClass} ${currentStation.glowClass}`
          }`}
        >
          {/* Masking Tape Decor */}
          <div className="masking-tape-corner-tr z-10" />

          {/* Player Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all shrink-0"
                style={{
                  backgroundColor:
                    activeMode === 'songs'
                      ? '#A855F720'
                      : `${currentStation.accentColor}20`,
                  borderColor:
                    activeMode === 'songs'
                      ? '#A855F750'
                      : `${currentStation.accentColor}50`,
                  color: activeMode === 'songs' ? '#C084FC' : currentStation.accentColor
                }}
              >
                {activeMode === 'songs' ? (
                  <Music className={`w-4 h-4 ${isPlayingSong ? 'animate-pulse' : ''}`} />
                ) : (
                  <Radio className={`w-4 h-4 ${isPlayingRadio ? 'animate-pulse' : ''}`} />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                  {activeMode === 'songs' ? 'FULL SONG PLAYER' : 'HORIZON RADIO'}
                </span>
                <p className="text-xs font-bold text-white leading-tight truncate">
                  {activeMode === 'songs'
                    ? activeCustomSearch || currentTrack.title
                    : currentStation.name}
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

          {/* Mode Switcher: Built-in Full Songs vs Live Radio */}
          <div className="grid grid-cols-2 gap-1 bg-black/60 p-1 rounded-xl border border-white/10 my-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveMode('songs');
              }}
              className={`py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'songs'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-3 h-3" />
              <span>Full Songs (Bieber)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveMode('radio');
              }}
              className={`py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'radio'
                  ? 'bg-white text-black shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Live Radio ({STATIONS.length})</span>
            </button>
          </div>

          {/* MODE 1: FULL SONGS (JUSTIN BIEBER & POP HITS) */}
          {activeMode === 'songs' ? (
            <div className="flex-1 flex flex-col min-h-0 space-y-2 pt-0.5">
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none shrink-0">
                {[
                  { id: 'bieber', label: 'Justin Bieber', icon: '👑' },
                  { id: 'pop', label: 'Global Hits', icon: '🔥' },
                  { id: 'all', label: 'All Songs', icon: '🎵' }
                ].map((tab) => {
                  const isActive = songFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSongFilter(tab.id as any);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? 'bg-purple-500 text-white shadow-sm font-extrabold'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Play Any Song Search Bar */}
              <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded-xl p-1 shrink-0">
                <Search className="w-3.5 h-3.5 text-purple-400 ml-1.5 shrink-0" />
                <input
                  type="text"
                  value={customInputText}
                  onChange={(e) => setCustomInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePlayCustomSong(customInputText);
                  }}
                  placeholder="Play any song (e.g. Bieber - Never Say Never)..."
                  className="w-full bg-transparent px-1.5 py-0.5 text-[10px] text-white placeholder-slate-500 focus:outline-none font-sans"
                />
                <button
                  type="button"
                  onClick={() => handlePlayCustomSong(customInputText)}
                  disabled={!customInputText.trim()}
                  className="px-2 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 rounded-lg text-[9px] font-bold text-white transition-all cursor-pointer shrink-0"
                >
                  Play
                </button>
              </div>

              {/* Now Playing Mini Card (when custom search or song is active) */}
              <div className="px-2.5 py-1.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-slate-300 font-sans leading-snug shrink-0">
                <div className="flex items-center justify-between font-semibold text-purple-300">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="text-sm">
                      {activeCustomSearch ? '🔍' : currentTrack.emoji}
                    </span>
                    <span className="truncate">
                      {activeCustomSearch
                        ? `Custom: ${activeCustomSearch}`
                        : `${currentTrack.title} — ${currentTrack.artist}`}
                    </span>
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded shrink-0 ml-1">
                    {activeCustomSearch ? 'Full Audio' : currentTrack.duration}
                  </span>
                </div>
              </div>

              {/* Curated Tracklist Directory */}
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col pt-0.5">
                <div className="flex items-center justify-between pb-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Full Tracks ({filteredTracks.length})</span>
                  <span className="text-purple-400 font-sans normal-case text-[10px]">
                    Plays in background
                  </span>
                </div>

                <div className="overflow-y-auto max-h-40 pr-1 space-y-1 custom-scrollbar">
                  {filteredTracks.map(({ track, originalIndex }) => {
                    const isSelected =
                      !activeCustomSearch && originalIndex === currentTrackIndex;
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => handleSelectTrack(originalIndex)}
                        className={`w-full p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'border-purple-400 bg-purple-600/30 text-white font-bold shadow-md'
                            : 'border-white/5 bg-black/40 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{track.emoji}</span>
                          <div className="min-w-0 text-left">
                            <p className="text-[11px] font-semibold truncate leading-tight">
                              {track.title}
                            </p>
                            <p className="text-[9px] text-slate-400 truncate">
                              {track.artist}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected ? (
                            <div className="flex items-center gap-1">
                              {isPlayingSong ? (
                                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                              ) : (
                                <span className="text-[9px] uppercase tracking-wider font-mono text-purple-300">
                                  Paused
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[9px] text-slate-500 font-mono">
                              {track.duration}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Transport Controls: Volume & Play/Pause */}
              <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-white/10 mt-1 shrink-0">
                {/* Volume */}
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

                {/* Song Transport Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevTrack}
                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                    title="Previous song"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={toggleSongPlay}
                    className="py-2 px-3.5 rounded-xl font-bold uppercase text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                    style={{
                      boxShadow: '0 0 15px rgba(168,85,247,0.5)'
                    }}
                  >
                    {isPlayingSong ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-white" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Play</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleNextTrack}
                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                    title="Next song"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* MODE 2: LIVE RADIO STATIONS */
            <>
              {/* Vibe description & Animated visualizer */}
              <div className="py-2 space-y-1.5 shrink-0">
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
                        height: isPlayingRadio ? `${scale * 100}%` : '20%',
                        opacity: isPlayingRadio ? 0.85 : 0.3,
                        animation: isPlayingRadio
                          ? `pulse ${0.7 + (i % 4) * 0.25}s ease-in-out infinite alternate`
                          : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Radio Search Bar */}
              <div className="relative mb-2 shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={radioSearchQuery}
                  onChange={(e) => setRadioSearchQuery(e.target.value)}
                  placeholder="Search 23 radio stations..."
                  className="w-full pl-8 pr-7 py-1.5 bg-black/40 border border-white/10 rounded-xl text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-all font-sans"
                />
                {radioSearchQuery && (
                  <button
                    onClick={() => setRadioSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none shrink-0">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedRadioCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedRadioCategory(cat.id);
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

                <div className="overflow-y-auto max-h-40 pr-1 space-y-1 custom-scrollbar">
                  {filteredStations.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs font-sans">
                      No stations found matching "{radioSearchQuery}"
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
                              {isPlayingRadio ? (
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

              {/* Radio Controls */}
              <div className="pt-3 flex items-center justify-between gap-2 border-t border-white/10 mt-2 shrink-0">
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

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevStation}
                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                    title="Previous station"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={toggleRadioPlay}
                    className="py-2 px-3.5 rounded-xl font-bold uppercase text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                    style={{
                      backgroundColor: currentStation.accentColor,
                      color: '#000000',
                      boxShadow: `0 0 15px ${currentStation.accentColor}50`
                    }}
                  >
                    {isPlayingRadio ? (
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
            </>
          )}
        </div>
      ) : (
        /* MINIMIZED FLOATING PILL - KEEPS PLAYING AUDIO CONTINUOUSLY */
        <div
          className={`rounded-full p-1.5 pl-3 border-2 transition-all duration-300 backdrop-blur-2xl bg-black/90 flex items-center gap-2 sm:gap-2.5 shadow-2xl ${
            activeMode === 'songs'
              ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.35)]'
              : `${currentStation.borderClass} ${currentStation.glowClass}`
          }`}
        >
          {/* Track / Station Indicator */}
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 cursor-pointer group pr-1"
          >
            <span className="text-base">
              {activeMode === 'songs'
                ? activeCustomSearch
                  ? '🔍'
                  : currentTrack.emoji
                : currentStation.emoji}
            </span>
            <div className="hidden sm:block text-left">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider leading-none truncate max-w-[120px]">
                {activeMode === 'songs'
                  ? activeCustomSearch
                    ? 'CUSTOM SONG'
                    : currentTrack.artist
                  : currentStation.category}
              </p>
              <p className="text-xs font-bold text-white leading-tight max-w-[120px] truncate">
                {activeMode === 'songs'
                  ? activeCustomSearch || currentTrack.title
                  : currentStation.name}
              </p>
            </div>
          </div>

          {/* Mini Waveform (when song or radio is playing) */}
          {((activeMode === 'songs' && isPlayingSong) ||
            (activeMode === 'radio' && isPlayingRadio)) && (
            <div className="flex items-center gap-0.5 h-3 px-0.5">
              {[0.4, 1, 0.6, 0.9].map((s, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor:
                      activeMode === 'songs' ? '#C084FC' : currentStation.accentColor,
                    height: `${s * 100}%`
                  }}
                />
              ))}
            </div>
          )}

          {/* Quick Skip Back */}
          <button
            onClick={activeMode === 'songs' ? handlePrevTrack : handlePrevStation}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Previous track"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Quick Play/Pause button */}
          <button
            onClick={activeMode === 'songs' ? toggleSongPlay : toggleRadioPlay}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-md"
            style={{
              backgroundColor:
                activeMode === 'songs' ? '#C084FC' : currentStation.accentColor,
              color: '#000000'
            }}
            title={
              (activeMode === 'songs' ? isPlayingSong : isPlayingRadio)
                ? 'Pause'
                : 'Play'
            }
          >
            {(activeMode === 'songs' ? isPlayingSong : isPlayingRadio) ? (
              <Pause className="w-3.5 h-3.5 fill-black" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
            )}
          </button>

          {/* Quick Skip Forward */}
          <button
            onClick={activeMode === 'songs' ? handleNextTrack : handleNextStation}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Next track"
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
