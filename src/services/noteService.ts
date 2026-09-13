import type { DreamNote } from '../types';

const NOTES_STORAGE_KEY = 'mba_dream_notes';

export const INITIAL_DREAM_NOTES: DreamNote[] = [
  {
    id: 'note-btree-vis',
    title: 'B-Tree & B+ Tree Node Splitting Invariants',
    subject: 'Database Management Systems',
    topic: 'B-Trees & B+ Tree Indexing',
    content: `### 🌲 Key Invariants of B+ Trees

1. **Root Node**: Has between $2$ and $M$ children (unless it is a leaf).
2. **Internal Nodes**: Store up to $M - 1$ keys and act strictly as search router indices. They contain **no raw data pointers**.
3. **Leaf Nodes**:
   - Reside strictly at uniform depth $h = \\lceil \\log_t \\frac{n+1}{2} \\rceil$.
   - Linked horizontally in a doubly-linked list ($L_1 \\leftrightarrow L_2 \\leftrightarrow L_3$) for $O(1)$ sequential range scans.

> **Rule of Thumb for Splitting**: When an insertion causes keys $> 2t - 1$, split into two nodes of size $t - 1$ and promote the median key to the parent node.`,
    imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    youtubeUrl: 'https://www.youtube.com/watch?v=aZjYr87r1b8',
    youtubeVideoId: 'aZjYr87r1b8',
    inAIMemory: true,
    colorTheme: 'cyan',
    sticker: '🧠',
    tags: ['DBMS', 'Indexing', 'DataStructures', 'ExamCheatSheet'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'note-virtual-memory',
    title: 'Page Replacement Algorithms: FIFO vs LRU vs Clock',
    subject: 'Operating Systems',
    topic: 'Virtual Memory & Paging',
    content: `### ⚙️ Comparison of Page Replacement Policies

- **FIFO (First In First Out)**: Suffers from **Belady\'s Anomaly** where adding more frames can cause *more* page faults!
- **LRU (Least Recently Used)**: Optimal approximation, stacks counter timestamps or doubly-linked hash map. Heavy hardware overhead.
- **Clock / Second-Chance Algorithm**:
  - Uses 1 reference bit per frame.
  - Clock hand sweeps: if bit == 1, reset to 0; if bit == 0, victim chosen!

$$EAT = (1 - p) \\times m + p \\times (\\text{fault service time})$$`,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    youtubeUrl: 'https://www.youtube.com/watch?v=qcBI5379bNk',
    youtubeVideoId: 'qcBI5379bNk',
    inAIMemory: true,
    colorTheme: 'purple',
    sticker: '⚡',
    tags: ['OS', 'VirtualMemory', 'Algorithms', 'Paging'],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'note-dynamic-programming',
    title: '0/1 Knapsack & Subset Sum State Formulation',
    subject: 'Data Structures & Algorithms',
    topic: 'Dynamic Programming',
    content: `### 🎯 DP State Definition & Recurrence

State: $DP[i][w]$ represents the maximum profit using a subset of first $i$ items with weight capacity $w$.

$$DP[i][w] = \\max(DP[i-1][w], \\text{val}[i] + DP[i-1][w - \\text{wt}[i]])$$

**Space Optimization**:
We only ever need the previous row, so we can optimize space to a 1D array $DP[w]$ by traversing backwards from $W$ down to $\\text{wt}[i]$!`,
    youtubeUrl: 'https://www.youtube.com/watch?v=8LusJS5-AGo',
    youtubeVideoId: '8LusJS5-AGo',
    inAIMemory: true,
    colorTheme: 'acid',
    sticker: '🪐',
    tags: ['DSA', 'DP', 'Algorithms', 'Optimization'],
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

class NoteService {
  public extractYouTubeId(url?: string): string | null {
    if (!url) return null;
    const trimmed = url.trim();
    // Handles youtu.be/xxx, youtube.com/watch?v=xxx, youtube.com/embed/xxx, youtube.com/shorts/xxx
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
    const match = trimmed.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  }

  public getNotes(): DreamNote[] {
    try {
      const raw = localStorage.getItem(NOTES_STORAGE_KEY);
      if (!raw) {
        this.saveAll(INITIAL_DREAM_NOTES);
        return INITIAL_DREAM_NOTES;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_DREAM_NOTES;
    }
  }

  public saveAll(notes: DreamNote[]): void {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to save notes to localStorage:', e);
    }
  }

  public getNoteById(id: string): DreamNote | undefined {
    return this.getNotes().find((n) => n.id === id);
  }

  public saveNote(noteData: Partial<DreamNote>): DreamNote {
    const notes = this.getNotes();
    const existingIndex = notes.findIndex((n) => n.id === noteData.id);
    const now = new Date().toISOString();

    const ytVideoId = noteData.youtubeUrl ? this.extractYouTubeId(noteData.youtubeUrl) || undefined : undefined;

    if (existingIndex >= 0) {
      const updated: DreamNote = {
        ...notes[existingIndex],
        ...noteData,
        youtubeVideoId: ytVideoId || notes[existingIndex].youtubeVideoId,
        updatedAt: now
      };
      notes[existingIndex] = updated;
      this.saveAll(notes);
      return updated;
    } else {
      const created: DreamNote = {
        id: noteData.id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: noteData.title?.trim() || 'Untitled Dream Note',
        subject: noteData.subject || 'General Study',
        topic: noteData.topic || 'Core Concept',
        content: noteData.content || '',
        imageUrl: noteData.imageUrl,
        youtubeUrl: noteData.youtubeUrl,
        youtubeVideoId: ytVideoId,
        inAIMemory: noteData.inAIMemory ?? true,
        colorTheme: noteData.colorTheme || 'purple',
        sticker: noteData.sticker || '✨',
        tags: noteData.tags && noteData.tags.length > 0 ? noteData.tags : ['Note'],
        createdAt: now,
        updatedAt: now
      };
      notes.unshift(created);
      this.saveAll(notes);
      return created;
    }
  }

  public deleteNote(id: string): void {
    const notes = this.getNotes().filter((n) => n.id !== id);
    this.saveAll(notes);
  }

  public toggleAIMemory(id: string): boolean {
    const notes = this.getNotes();
    const note = notes.find((n) => n.id === id);
    if (note) {
      note.inAIMemory = !note.inAIMemory;
      note.updatedAt = new Date().toISOString();
      this.saveAll(notes);
      return note.inAIMemory;
    }
    return false;
  }

  public getNotesForAIMemory(): DreamNote[] {
    return this.getNotes().filter((n) => n.inAIMemory);
  }
}

export const noteService = new NoteService();
