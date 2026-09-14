import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Trash2,
  Edit3,
  Bot,
  Brain,
  Video,
  Image as ImageIcon,
  Check,
  X,
  ArrowRight,
  Upload
} from 'lucide-react';
import type { DreamNote, StudentProfile, SyllabusTopic } from '../types';
import { noteService } from '../services/noteService';
import { sound } from '../services/soundService';
import { FormattedContent } from '../components/FormattedContent';

interface DreamNotesProps {
  profile: StudentProfile;
  syllabus: SyllabusTopic[];
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
}

const THEME_STYLES: Record<
  DreamNote['colorTheme'],
  { border: string; bg: string; badge: string; glow: string; text: string }
> = {
  cyan: {
    border: 'border-cyan-500/40 hover:border-cyan-400',
    bg: 'from-cyan-950/30 via-slate-900/60 to-cyan-900/20',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.2)]',
    text: 'text-cyan-300'
  },
  purple: {
    border: 'border-purple-500/40 hover:border-purple-400',
    bg: 'from-purple-950/30 via-slate-900/60 to-pink-950/20',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    text: 'text-purple-300'
  },
  amber: {
    border: 'border-amber-500/40 hover:border-amber-400',
    bg: 'from-amber-950/30 via-slate-900/60 to-orange-950/20',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    text: 'text-amber-300'
  },
  emerald: {
    border: 'border-emerald-500/40 hover:border-emerald-400',
    bg: 'from-emerald-950/30 via-slate-900/60 to-teal-950/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    text: 'text-emerald-300'
  },
  pink: {
    border: 'border-pink-500/40 hover:border-pink-400',
    bg: 'from-pink-950/30 via-slate-900/60 to-rose-950/20',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]',
    text: 'text-pink-300'
  },
  acid: {
    border: 'border-lime-400/50 hover:border-lime-300',
    bg: 'from-lime-950/30 via-slate-900/70 to-emerald-950/20',
    badge: 'bg-lime-400/20 text-lime-300 border-lime-400/40',
    glow: 'shadow-[0_0_25px_rgba(163,230,53,0.25)]',
    text: 'text-lime-300'
  },
  lime: {
    border: 'border-lime-400/50 hover:border-lime-300',
    bg: 'from-lime-950/30 via-slate-900/70 to-emerald-950/20',
    badge: 'bg-lime-400/20 text-lime-300 border-lime-400/40',
    glow: 'shadow-[0_0_25px_rgba(163,230,53,0.25)]',
    text: 'text-lime-300'
  },
  lavender: {
    border: 'border-purple-400/40 hover:border-purple-300',
    bg: 'from-purple-950/30 via-slate-900/60 to-indigo-950/20',
    badge: 'bg-purple-400/20 text-purple-200 border-purple-400/30',
    glow: 'shadow-[0_0_20px_rgba(192,132,252,0.2)]',
    text: 'text-purple-200'
  }
};

const STICKERS = ['✨', '🧠', '⚡', '🪐', '🔮', '🧬', '🚀', '📚', '🎨', '💡', '🏆', '🎯'];

export const DreamNotes: React.FC<DreamNotesProps> = ({ profile, syllabus, onNavigate }) => {
  const [notes, setNotes] = useState<DreamNote[]>(() => noteService.getNotes());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<DreamNote> | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [inAIMemory, setInAIMemory] = useState(true);
  const [colorTheme, setColorTheme] = useState<DreamNote['colorTheme']>('purple');
  const [sticker, setSticker] = useState('✨');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Core']);

  // Extract distinct subjects from notes & syllabus
  const allSubjects = Array.from(
    new Set([
      ...notes.map((n) => n.subject),
      ...syllabus.map((s) => s.subject),
      'General Study'
    ])
  ).filter(Boolean);

  const filteredNotes = notes.filter((n) => {
    const matchesSubject = selectedSubject === 'all' || n.subject === selectedSubject;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.topic.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q));
    return matchesSubject && matchesSearch;
  });

  const handleOpenEditor = (noteToEdit?: DreamNote) => {
    sound.playClick();
    if (noteToEdit) {
      setEditingNote(noteToEdit);
      setTitle(noteToEdit.title);
      setSubject(noteToEdit.subject);
      setTopic(noteToEdit.topic);
      setContent(noteToEdit.content);
      setImageUrl(noteToEdit.imageUrl || '');
      setYoutubeUrl(noteToEdit.youtubeUrl || '');
      setInAIMemory(noteToEdit.inAIMemory);
      setColorTheme(noteToEdit.colorTheme);
      setSticker(noteToEdit.sticker || '✨');
      setTags(noteToEdit.tags || []);
    } else {
      setEditingNote(null);
      setTitle('');
      setSubject(allSubjects[0] || 'Database Management Systems');
      setTopic('');
      setContent('');
      setImageUrl('');
      setYoutubeUrl('');
      setInAIMemory(true);
      setColorTheme('purple');
      setSticker('✨');
      setTags(['StudyNote']);
    }
    setIsEditorOpen(true);
  };

  const handleSaveNote = () => {
    if (!title.trim() || !content.trim()) return;
    sound.playSuccess();

    noteService.saveNote({
      userId: profile.id,
      ...(editingNote?.id ? { id: editingNote.id } : {}),
      title: title.trim(),
      subject: subject.trim() || 'General Study',
      topic: topic.trim() || 'Key Concepts',
      content,
      imageUrl: imageUrl.trim() || undefined,
      youtubeUrl: youtubeUrl.trim() || undefined,
      inAIMemory,
      colorTheme,
      sticker,
      tags
    });

    setNotes(noteService.getNotes());
    setIsEditorOpen(false);
  };

  const handleDelete = (id: string) => {
    sound.playClick();
    noteService.deleteNote(id);
    setNotes(noteService.getNotes());
  };

  const handleToggleAIMemory = (id: string) => {
    sound.playClick();
    noteService.toggleAIMemory(id);
    setNotes(noteService.getNotes());
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, '');
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Hero Header Section */}
      <div className="relative apple-liquid-glass p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl overflow-hidden backdrop-blur-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-cyan-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Editorial Acid Zine Notebook
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                AI Memory Sync Active 🧠
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight font-heading">
              DreamNotes & Concept Vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Curate high-density academic notes, link YouTube lectures, attach diagrams, and sync key
              takeaways directly into your <strong className="text-white">MindBridge AI Tutor's Memory</strong> for contextual Socratic tutoring.
            </p>
          </div>

          <button
            onClick={() => handleOpenEditor()}
            className="btn-apple-primary py-3 px-6 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-[0_0_25px_rgba(217,70,239,0.4)] flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Dream Note</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <span className="text-slate-400 block text-[10px]">TOTAL VAULT NOTES</span>
            <span className="text-xl font-bold text-white font-heading">{notes.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <span className="text-slate-400 block text-[10px]">AI MEMORY INDEXED</span>
            <span className="text-xl font-bold text-purple-300 font-heading">
              {notes.filter((n) => n.inAIMemory).length}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <span className="text-slate-400 block text-[10px]">LECTURE VIDEOS LINKED</span>
            <span className="text-xl font-bold text-cyan-300 font-heading">
              {notes.filter((n) => n.youtubeVideoId).length}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <span className="text-slate-400 block text-[10px]">SUBJECTS LOGGED</span>
            <span className="text-xl font-bold text-amber-300 font-heading">
              {new Set(notes.map((n) => n.subject)).size}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="apple-liquid-glass p-4 rounded-2xl border border-white/15 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar flex-1">
          <button
            onClick={() => {
              sound.playClick();
              setSelectedSubject('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
              selectedSubject === 'all'
                ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] font-bold'
                : 'bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            All Subjects ({notes.length})
          </button>
          {allSubjects.map((sub) => {
            const count = notes.filter((n) => n.subject === sub).length;
            const isSelected = selectedSubject === sub;
            return (
              <button
                key={sub}
                onClick={() => {
                  sound.playClick();
                  setSelectedSubject(sub);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] font-bold'
                    : 'bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {sub} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, formulas, tags..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-all"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="apple-liquid-glass p-12 rounded-3xl border border-white/15 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mx-auto text-3xl">
            🔮
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No Dream Notes Found</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {searchQuery
                ? `No notes match "${searchQuery}". Try refining your search query or subject filter.`
                : 'Start documenting your concepts, formulas, and YouTube lecture breakdowns in DreamNotes.'}
            </p>
          </div>
          <button
            onClick={() => handleOpenEditor()}
            className="btn-apple-primary py-2.5 px-5 text-xs font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const theme = THEME_STYLES[note.colorTheme] || THEME_STYLES.purple;
            return (
              <div
                key={note.id}
                className={`relative rounded-3xl border bg-gradient-to-b ${theme.bg} ${theme.border} p-5 space-y-4 shadow-xl backdrop-blur-xl transition-all hover:scale-[1.01] flex flex-col justify-between overflow-hidden group`}
              >
                {/* Card Top Header */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl flex-shrink-0">{note.sticker || '✨'}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${theme.badge}`}>
                        {note.subject}
                      </span>
                    </div>

                    {/* AI Memory Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleAIMemory(note.id)}
                      title={
                        note.inAIMemory
                          ? 'Indexed in AI Memory. Click to disable.'
                          : 'Not indexed in AI Memory. Click to enable.'
                      }
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        note.inAIMemory
                          ? 'bg-purple-500/30 border border-purple-400/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                          : 'bg-white/[0.05] border border-white/15 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Brain className="w-3 h-3" />
                      <span>{note.inAIMemory ? 'In AI Memory 🧠' : 'Add to AI'}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-purple-200 transition-colors">
                      {note.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Topic: <span className="text-slate-200 font-semibold">{note.topic}</span>
                    </p>
                  </div>
                </div>

                {/* Embedded Media (YouTube Video or Image) */}
                {note.youtubeVideoId && (
                  <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-lg relative aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${note.youtubeVideoId}?rel=0`}
                      title={note.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                )}

                {note.imageUrl && !note.youtubeVideoId && (
                  <div className="rounded-2xl overflow-hidden border border-white/15 max-h-48 shadow-lg">
                    <img
                      src={note.imageUrl}
                      alt={note.title}
                      className="w-full h-44 object-cover hover:scale-105 transition-all duration-500"
                    />
                  </div>
                )}

                {/* Note Content */}
                <div className="text-xs text-slate-200 leading-relaxed max-h-56 overflow-y-auto custom-scrollbar p-3 rounded-2xl bg-black/20 border border-white/10">
                  <FormattedContent content={note.content} className="break-words space-y-2" />
                </div>

                {/* Tags & Action Bar */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  {/* Tag Chips */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {note.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/10"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onNavigate('tutor', { topic: note.topic });
                      }}
                      className="text-[11px] font-mono text-purple-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                      title="Open AI Tutor with this note's topic"
                    >
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                      <span>Ask AI Tutor</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditor(note)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Edit Note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(note.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal / Drawer */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="apple-liquid-glass max-w-2xl w-full p-6 sm:p-8 space-y-5 rounded-3xl border border-white/20 shadow-2xl animate-fade-in text-slate-100 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl shadow-lg">
                  {sticker}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingNote?.id ? 'Edit Dream Note' : 'Draft New Dream Note'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Organize your syllabus insights with media & AI memory
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Note Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. B-Trees vs B+ Trees Node Invariants & Formulas"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm font-medium"
                />
              </div>

              {/* Subject & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Subject / Course
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Database Management Systems"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Topic / Subunit
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. B-Trees & B+ Tree Indexing"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Theme & Sticker Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Zine Color Palette
                  </label>
                  <div className="flex items-center gap-2">
                    {(['cyan', 'purple', 'amber', 'emerald', 'pink', 'acid'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setColorTheme(t)}
                        className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                          colorTheme === t ? 'scale-125 border-white ring-2 ring-purple-400' : 'border-transparent opacity-70 hover:opacity-100'
                        } ${
                          t === 'cyan'
                            ? 'bg-cyan-500'
                            : t === 'purple'
                            ? 'bg-purple-500'
                            : t === 'amber'
                            ? 'bg-amber-500'
                            : t === 'emerald'
                            ? 'bg-emerald-500'
                            : t === 'pink'
                            ? 'bg-pink-500'
                            : 'bg-lime-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Aesthetic Sticker
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                    {STICKERS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSticker(s)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                          sticker === s ? 'bg-purple-500/30 border border-purple-400 scale-110' : 'hover:bg-white/10'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* YouTube Video URL */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  <span>YouTube Lecture / Breakdown Link (Optional)</span>
                </label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono text-xs"
                />
              </div>

              {/* Image Upload or URL */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Diagram Image (URL or Upload)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono text-xs"
                  />
                  <label className="btn-apple-glass px-3 py-2 text-xs flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Content Markdown Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Notes & Formulations *
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Supports Markdown & LaTeX ($math$)</span>
                </div>
                <textarea
                  rows={7}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your personal notes, theorem derivations, exam pitfalls, code snippets, or analogies..."
                  className="w-full p-4 rounded-2xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Tag Chips Input */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Tags & Flashcard Anchors
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="e.g. Formula, ExamQ, Theorem..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn-apple-glass px-3.5 text-xs"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sync with AI Memory Switch */}
              <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Add Note to AI Tutor Memory</span>
                    <span className="text-[10px] text-purple-200/80">
                      The AI Socratic tutor will actively study and reference this note during your tutoring chats!
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInAIMemory(!inAIMemory)}
                  className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 cursor-pointer ${
                    inAIMemory ? 'bg-purple-600' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      inAIMemory ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="btn-apple-glass py-2.5 px-4 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!title.trim() || !content.trim()}
                onClick={handleSaveNote}
                className="btn-apple-primary py-2.5 px-6 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Dream Note</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
