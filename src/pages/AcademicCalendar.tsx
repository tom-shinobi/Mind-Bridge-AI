import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ListTodo,
  CalendarDays,
  Zap,
  Bot
} from 'lucide-react';
import { calendarService } from '../services/calendarService';
import { sound } from '../services/soundService';
import type { CalendarEvent, CalendarTask, EventType, StudentProfile } from '../types';

interface AcademicCalendarProps {
  profile: StudentProfile;
  onNavigate?: (tab: string, extra?: any) => void;
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({
  profile,
  onNavigate
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // New Event Modal State
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Computer Networks');
  const [newEventType, setNewEventType] = useState<EventType>('exam');
  const [newStartDate, setNewStartDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [newEndDate, setNewEndDate] = useState(
    new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // New Task Inline State
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('Operating Systems');
  const [taskPriority, setTaskPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('high');
  const [taskDueDate, setTaskDueDate] = useState(
    new Date(Date.now() + 3 * 86400 * 1000).toISOString().split('T')[0]
  );
  const [taskEstimatedMins, setTaskEstimatedMins] = useState(45);

  // AI Sync Feedback
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setEvents(calendarService.getEvents());
    setTasks(calendarService.getTasks());
  };

  // ==========================================
  // EVENT ACTIONS
  // ==========================================
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    sound.playLevelUp();
    const colors: Record<EventType, string> = {
      exam: '#ef4444',
      deadline: '#f59e0b',
      study_squad: '#8b5cf6',
      lecture: '#10b981',
      milestone: '#06b6d4'
    };

    calendarService.addEvent({
      userId: profile.id,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      subject: newSubject.trim(),
      eventType: newEventType,
      startDate: newStartDate,
      endDate: newEndDate,
      location: newLocation.trim() || undefined,
      color: colors[newEventType] || '#6366f1',
      syncedWithAI: true
    });

    setIsAddEventOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewLocation('');
    refreshData();
  };

  const handleDeleteEvent = (id: string) => {
    sound.playClick();
    calendarService.deleteEvent(id);
    refreshData();
  };

  // ==========================================
  // TASK ACTIONS
  // ==========================================
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    sound.playClick();
    calendarService.addTask({
      userId: profile.id,
      title: taskTitle.trim(),
      subject: taskSubject.trim(),
      priority: taskPriority,
      dueDate: taskDueDate,
      completed: false,
      estimatedMinutes: Number(taskEstimatedMins) || 30
    });

    setIsAddTaskOpen(false);
    setTaskTitle('');
    refreshData();
  };

  const handleToggleTask = (id: string) => {
    sound.playSuccess();
    calendarService.toggleTaskCompletion(id);
    refreshData();
  };

  const handleDeleteTask = (id: string) => {
    sound.playClick();
    calendarService.deleteTask(id);
    refreshData();
  };

  // ==========================================
  // AI SYNC
  // ==========================================
  const handleSyncWithAI = () => {
    sound.playLevelUp();
    const result = calendarService.syncWithAIAssistant();
    setSyncNotice(result.message);
    refreshData();
    setTimeout(() => setSyncNotice(null), 8000);
  };

  // ==========================================
  // CALENDAR GRID COMPUTATION
  // ==========================================
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    sound.playClick();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    sound.playClick();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter events for selected day
  const selectedDayEvents = events.filter((e) => {
    const eventDay = e.startDate.split('T')[0];
    return eventDay === selectedDateStr;
  });

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Assisted Academic Schedule</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Academic Calendar & Tasks
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Track university exams, deadlines, and study squads with automatic Socratic AI Tutor schedule synchronization.
            </p>
          </div>

          {/* Sync with AI Assistant Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleSyncWithAI}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Sync with Socratic AI</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsAddEventOpen(true);
              }}
              className="px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Live AI Sync Notification Alert */}
        {syncNotice && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="leading-relaxed">{syncNotice}</span>
          </div>
        )}

        {/* Stats Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Upcoming Exams</span>
            <p className="text-xl font-bold text-red-400 mt-1">
              {events.filter((e) => e.eventType === 'exam').length}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Assignments & Deadlines</span>
            <p className="text-xl font-bold text-amber-400 mt-1">
              {events.filter((e) => e.eventType === 'deadline').length}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Study Squad Sessions</span>
            <p className="text-xl font-bold text-purple-400 mt-1">
              {events.filter((e) => e.eventType === 'study_squad').length}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Pending Tasks</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              {pendingTasks.length} left
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout: Calendar Grid (Col 1) & Tasks + Agenda (Col 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid View (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-5">
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">
                  {monthNames[month]} {year}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Names */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-slate-500 font-semibold uppercase">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days 7x5/6 Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Empty leading days */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="h-20 sm:h-24 rounded-2xl bg-slate-950/20 border border-slate-900"
                />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                  dayNum
                ).padStart(2, '0')}`;
                const isSelected = selectedDateStr === dateKey;
                const isToday =
                  new Date().toISOString().split('T')[0] === dateKey;

                // Find events for this day
                const dayEvents = events.filter(
                  (e) => e.startDate.split('T')[0] === dateKey
                );

                return (
                  <div
                    key={dateKey}
                    onClick={() => {
                      sound.playClick();
                      setSelectedDateStr(dateKey);
                    }}
                    className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-500/20'
                        : isToday
                        ? 'bg-slate-800/80 border-slate-600'
                        : 'bg-slate-950/40 border-slate-800/70 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold font-mono rounded-full w-6 h-6 flex items-center justify-center ${
                          isToday
                            ? 'bg-indigo-600 text-white'
                            : isSelected
                            ? 'text-indigo-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Mini event tags */}
                    <div className="space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((evt) => (
                        <div
                          key={evt.id}
                          style={{ borderColor: evt.color }}
                          className="px-1 py-0.5 rounded text-[9px] truncate bg-slate-900 border-l-2 font-medium text-slate-200"
                        >
                          {evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] text-slate-500 font-mono">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Event Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Exams</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Deadlines</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Study Squads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Lectures</span>
              </div>
            </div>
          </div>

          {/* Selected Date Agenda Details */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Schedule for {new Date(selectedDateStr).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {selectedDayEvents.length} Events
              </span>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
                <p className="text-xs text-slate-400">
                  No academic events scheduled for this day.
                </p>
                <button
                  onClick={() => setIsAddEventOpen(true)}
                  className="mt-2 text-xs text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add an event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1 shrink-0"
                        style={{ backgroundColor: evt.color }}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white">{evt.title}</h4>
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase"
                            style={{
                              backgroundColor: `${evt.color}20`,
                              color: evt.color
                            }}
                          >
                            {evt.eventType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {evt.subject} • {new Date(evt.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(evt.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {evt.description && (
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                        {evt.location && (
                          <p className="text-[11px] text-slate-500">📍 {evt.location}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tasks Checklist Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Revision & Study Tasks</h3>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsAddTaskOpen(!isAddTaskOpen);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Add Task Inline Form */}
            {isAddTaskOpen && (
              <form
                onSubmit={handleCreateTask}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fade-in"
              >
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title (e.g. Master Sliding Window derivations)..."
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Subject</label>
                    <input
                      type="text"
                      value={taskSubject}
                      onChange={(e) => setTaskSubject(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Est. Minutes</label>
                    <input
                      type="number"
                      value={taskEstimatedMins}
                      onChange={(e) => setTaskEstimatedMins(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddTaskOpen(false)}
                    className="px-3 py-1.5 text-xs rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            )}

            {/* Pending Tasks List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto">
              {pendingTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  🎉 No pending tasks! You are completely caught up.
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3 group hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="mt-0.5 text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                      <div>
                        <p className="text-xs font-semibold text-white leading-tight">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                              task.priority === 'urgent'
                                ? 'bg-red-500/20 text-red-300'
                                : task.priority === 'high'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {task.subject}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Due: {task.dueDate} (~{task.estimatedMinutes}m)
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Completed Tasks Accordion */}
            {completedTasks.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                  Completed ({completedTasks.length})
                </p>
                <div className="space-y-1.5">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-xl bg-slate-950/30 border border-slate-900 flex items-center justify-between gap-2 text-xs opacity-60"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className="text-emerald-400 cursor-pointer"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                        </button>
                        <span className="line-through text-slate-400">{task.title}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-600 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ask AI Tutor to Schedule Revision Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/20 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Socratic Assistant Integration</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your AI Tutor reads these upcoming events to generate personalized spaced-repetition slots in the Smart Timetable.
            </p>
            <button
              onClick={() => onNavigate && onNavigate('tutor', { topic: 'exam revision planning' })}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Ask AI Tutor to Plan Week</span>
              <Bot className="w-3.5 h-3.5 text-purple-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-indigo-400" />
                Add Academic Calendar Event
              </h3>
              <button
                onClick={() => setIsAddEventOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Event Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Exam, Project Deadline..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Event Type</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="exam">Exam</option>
                    <option value="deadline">Assignment / Deadline</option>
                    <option value="study_squad">Study Squad Session</option>
                    <option value="lecture">Lecture</option>
                    <option value="milestone">Milestone</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Location / Discord Room</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Exam Hall 3B or Discord #doubts-voice"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description & Scope</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="Topics covered, allowed references, squad agenda..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/25"
                >
                  Save Academic Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
