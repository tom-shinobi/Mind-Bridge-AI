import type { CalendarEvent, CalendarTask } from '../types';

const STORAGE_KEYS = {
  EVENTS: 'mba_calendar_events',
  TASKS: 'mba_calendar_tasks'
};

const getFutureDate = (daysAhead: number, timeStr = '10:00'): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${timeStr}`;
};

const getFutureDateOnly = (daysAhead: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt_cn_midterm',
    userId: 'usr_current',
    title: 'Computer Networks Mid-Term Exam',
    description: 'Covers Layers 1-4: OSI, TCP/IP, Sliding Window Protocol, Congestion Control.',
    subject: 'Computer Networks',
    eventType: 'exam',
    startDate: getFutureDate(3, '09:00'),
    endDate: getFutureDate(3, '12:00'),
    location: 'Exam Hall 3B',
    color: '#ef4444',
    syncedWithAI: true
  },
  {
    id: 'evt_os_project',
    userId: 'usr_current',
    title: 'OS Kernel & Concurrency Submission',
    description: 'Final submission for Producer-Consumer simulation and deadlock detection algorithms.',
    subject: 'Operating Systems',
    eventType: 'deadline',
    startDate: getFutureDate(5, '23:59'),
    endDate: getFutureDate(5, '23:59'),
    color: '#f59e0b',
    syncedWithAI: true
  },
  {
    id: 'evt_squad_study',
    userId: 'usr_current',
    title: 'Discrete Math Proofs Study Squad',
    description: 'Peer collaborative problem-solving on Induction, Graph Theory & Trees.',
    subject: 'Discrete Mathematics',
    eventType: 'study_squad',
    startDate: getFutureDate(1, '16:00'),
    endDate: getFutureDate(1, '18:00'),
    location: 'Discord #doubts-voice & Library Room 4',
    color: '#8b5cf6',
    syncedWithAI: true
  },
  {
    id: 'evt_db_quiz',
    userId: 'usr_current',
    title: 'DBMS Indexing & Normalization Quiz',
    description: 'B+ Trees, 3NF/BCNF Decomposition, and ACID properties assessment.',
    subject: 'Database Systems',
    eventType: 'exam',
    startDate: getFutureDate(8, '11:00'),
    endDate: getFutureDate(8, '12:30'),
    color: '#06b6d4',
    syncedWithAI: true
  },
  {
    id: 'evt_ai_lecture',
    userId: 'usr_current',
    title: 'Guest Lecture: Transformers & LLM Architectures',
    description: 'Deep dive into Attention mechanisms with Dr. Eleanor Vance.',
    subject: 'Artificial Intelligence',
    eventType: 'lecture',
    startDate: getFutureDate(2, '14:00'),
    endDate: getFutureDate(2, '16:00'),
    location: 'Main Auditorium',
    color: '#10b981',
    syncedWithAI: true
  }
];

const INITIAL_TASKS: CalendarTask[] = [
  {
    id: 'tsk_1',
    userId: 'usr_current',
    title: 'Revise Sliding Window & Go-Back-N protocol derivations',
    subject: 'Computer Networks',
    priority: 'urgent',
    dueDate: getFutureDateOnly(2),
    completed: false,
    estimatedMinutes: 45,
    relatedGapId: 'gap_cn_window'
  },
  {
    id: 'tsk_2',
    userId: 'usr_current',
    title: 'Code Semaphore simulation for Reader-Writer problem',
    subject: 'Operating Systems',
    priority: 'high',
    dueDate: getFutureDateOnly(4),
    completed: false,
    estimatedMinutes: 60,
    relatedGapId: 'gap_os_semaphore'
  },
  {
    id: 'tsk_3',
    userId: 'usr_current',
    title: 'Complete 10 SQL practice queries on nested subqueries & JOINs',
    subject: 'Database Systems',
    priority: 'high',
    dueDate: getFutureDateOnly(6),
    completed: true,
    estimatedMinutes: 40
  },
  {
    id: 'tsk_4',
    userId: 'usr_current',
    title: 'Summarize Attention is All You Need paper notes',
    subject: 'Artificial Intelligence',
    priority: 'medium',
    dueDate: getFutureDateOnly(7),
    completed: false,
    estimatedMinutes: 50
  },
  {
    id: 'tsk_5',
    userId: 'usr_current',
    title: 'Solve practice induction proofs for Discrete Math squad',
    subject: 'Discrete Mathematics',
    priority: 'low',
    dueDate: getFutureDateOnly(1),
    completed: false,
    estimatedMinutes: 30
  }
];

class CalendarService {
  private load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  // ==========================================
  // EVENTS
  // ==========================================
  public getEvents(): CalendarEvent[] {
    return this.load<CalendarEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  }

  public saveEvents(events: CalendarEvent[]): void {
    this.save(STORAGE_KEYS.EVENTS, events);
  }

  public addEvent(eventData: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const events = this.getEvents();
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    events.unshift(newEvent);
    this.saveEvents(events);
    return newEvent;
  }

  public updateEvent(updatedEvent: CalendarEvent): void {
    const events = this.getEvents().map(e => e.id === updatedEvent.id ? updatedEvent : e);
    this.saveEvents(events);
  }

  public deleteEvent(id: string): void {
    const events = this.getEvents().filter(e => e.id !== id);
    this.saveEvents(events);
  }

  // ==========================================
  // TASKS
  // ==========================================
  public getTasks(): CalendarTask[] {
    return this.load<CalendarTask[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  }

  public saveTasks(tasks: CalendarTask[]): void {
    this.save(STORAGE_KEYS.TASKS, tasks);
  }

  public addTask(taskData: Omit<CalendarTask, 'id'>): CalendarTask {
    const tasks = this.getTasks();
    const newTask: CalendarTask = {
      ...taskData,
      id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  public updateTask(updatedTask: CalendarTask): void {
    const tasks = this.getTasks().map(t => t.id === updatedTask.id ? updatedTask : t);
    this.saveTasks(tasks);
  }

  public toggleTaskCompletion(id: string): CalendarTask | null {
    const tasks = this.getTasks();
    let updated: CalendarTask | null = null;
    const mapped = tasks.map(t => {
      if (t.id === id) {
        updated = { ...t, completed: !t.completed };
        return updated;
      }
      return t;
    });
    this.saveTasks(mapped);
    return updated;
  }

  public deleteTask(id: string): void {
    const tasks = this.getTasks().filter(t => t.id !== id);
    this.saveTasks(tasks);
  }

  // ==========================================
  // AI SYNC & CONTEXT EXTRACTOR
  // ==========================================
  public syncWithAIAssistant(): { success: boolean; message: string; syncedCount: number } {
    const events = this.getEvents().map(e => ({ ...e, syncedWithAI: true }));
    this.saveEvents(events);

    const pendingTasks = this.getTasks().filter(t => !t.completed);
    const upcomingExams = events.filter(e => e.eventType === 'exam');

    return {
      success: true,
      message: `Successfully synchronized ${events.length} academic events & ${pendingTasks.length} pending revision tasks with Socratic AI Tutor. Adaptive timetable rebalanced around ${upcomingExams.length} upcoming exams.`,
      syncedCount: events.length
    };
  }

  public getCalendarAIContext(): string {
    const events = this.getEvents();
    const tasks = this.getTasks().filter(t => !t.completed);

    // Format events chronologically
    const sortedEvents = [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const eventSummary = sortedEvents.slice(0, 5).map(e => 
      `• [${e.eventType.toUpperCase()}] "${e.title}" (${e.subject || 'General'}) on ${new Date(e.startDate).toLocaleDateString()} ${new Date(e.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${e.location ? ` at ${e.location}` : ''}`
    ).join('\n');

    const taskSummary = tasks.slice(0, 5).map(t => 
      `• [${t.priority.toUpperCase()}] "${t.title}" (${t.subject || 'General'}) - Due: ${t.dueDate} (~${t.estimatedMinutes}m est.)`
    ).join('\n');

    return `
### STUDENT ACADEMIC CALENDAR & UPCOMING DEADLINES:
${eventSummary || 'No upcoming scheduled events.'}

### PENDING ACADEMIC REVISION TASKS:
${taskSummary || 'All study tasks are completed!'}
`;
  }
}

export const calendarService = new CalendarService();
