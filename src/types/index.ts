export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';
export type TopicStatus = 'pending' | 'in_progress' | 'mastered';
export type BlockType = 'deep_work' | 'revision' | 'test' | 'break' | 'tutor';
export type WorkloadLevel = 'light' | 'balanced' | 'heavy' | 'overwhelmed';

export interface MemorySummary {
  learningStyle: string;
  currentFocus: string;
  academicGoal: string;
  studyPreferences: string;
  difficultTopics: string[];
  strengths: string[];
  notes?: string;
  lastUpdated: string;
}

export interface OnboardingAnswers {
  name: string;
  college: string;
  course: string;
  specialization: string;
  semester: number;
  cgpa: number;
  targetCgpa: number;
  subjects: string[];
  dailyStudyHours: number;
  preferredStudyTime: string;
  difficultTopics: string[];
  explanationStyle: string;
}

export interface ExtractedTopic {
  topic: string;
  priority?: 'high' | 'medium' | 'low';
  estimatedHours?: number;
  subtopics?: string[];
}

export interface ExtractedModule {
  moduleName: string;
  topics: ExtractedTopic[];
}

export interface ExtractedSyllabus {
  subject: string;
  modules: ExtractedModule[];
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  degree: string;
  department: string;
  college?: string;
  course?: string;
  specialization?: string;
  semester: number;
  cgpa: number;
  targetCgpa: number;
  streakDays: number;
  totalXp: number;
  level: number;
  avatarUrl?: string;
  joinedDate: string;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  onboardingAnswers?: OnboardingAnswers;
  syllabusUploaded?: boolean;
  memorySummary?: MemorySummary;
  biometricEnabled?: boolean;
  faceUnlockEnabled?: boolean;
  faceBiometricDescriptor?: string;
  isPrivateAccount?: boolean;
  followersCount?: number;
  followingCount?: number;
  bio?: string;
}

export interface AcademicRecord {
  id: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  examType: 'Midterm' | 'End Semester' | 'Quiz' | 'Assignment' | 'Lab Test';
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  date: string;
  topicsEvaluated: string[];
}

export interface LearningGap {
  id: string;
  subject: string;
  topic: string;
  module: string;
  severity: GapSeverity;
  masteryScore: number; // 0 - 100
  identifiedFrom: string;
  rootCause: string;
  recommendedHours: number;
  status: 'active' | 'in_remediation' | 'resolved';
  lastEvaluated: string;
}

export interface SyllabusTopic {
  id: string;
  subject: string;
  moduleName: string;
  topic: string;
  priority: 'high' | 'medium' | 'low';
  status: TopicStatus;
  estimatedHours: number;
  completedHours: number;
  masteryPercentage: number;
  isGapRemediation: boolean;
  orderIndex: number;
}

export interface TimetableBlock {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // '09:00'
  endTime: string;   // '10:30'
  subject: string;
  topic: string;
  blockType: BlockType;
  isAdaptive: boolean;
  adaptiveReason?: string;
  completed: boolean;
  dateString?: string;
}

export interface Question {
  id: string;
  questionText: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTested: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitMinutes: number;
  questions: Question[];
  targetedGapId?: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  subject: string;
  topic: string;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  userAnswers: Record<number, number>; // questionIndex -> selectedIndex
  timeSpentSeconds: number;
  feedback: string;
  previousMastery: number;
  newMastery: number;
  gapId?: string;
  status: 'passed' | 'review_needed';
}

export interface TutorMessage {
  id: string;
  sender: 'ai' | 'student';
  text: string;
  timestamp: string;
  conceptCheck?: {
    question: string;
    options?: string[];
    correctAnswer?: string;
    studentAnswer?: string;
    isCorrect?: boolean;
    explanation?: string;
  };
}

export interface DailyCheckIn {
  id: string;
  date: string;
  workloadLevel: WorkloadLevel;
  stressRating: number; // 1 to 5
  notes?: string;
  adjustedDailyHours: number;
  reallocationsCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'mastery' | 'streak' | 'gap_buster' | 'workload';
  unlockedAt?: string;
  xpReward: number;
  progress: number;
  target: number;
}

export interface AdaptiveAuditEntry {
  id: string;
  timestamp: string;
  triggerEvent: string;
  actionTaken: string;
  category: 'syllabus' | 'timetable' | 'gap_detected' | 'gap_resolved' | 'workload_relief';
  impactDescription: string;
}

export type AtmosphereTheme =
  | 'dusk'
  | 'nebula'
  | 'cyberpunk'
  | 'supernova'
  | 'ocean_abyss'
  | 'cherry_blossom'
  | 'aurora_borealis'
  | 'royal_amethyst'
  | 'electric_amber'
  | 'midnight_synthwave';

export interface AISettings {
  provider: 'openrouter' | 'local_intelligent';
  openRouterApiKey: string;
  model: string;
  speechEnabled: boolean;
  soundFxEnabled: boolean;
  theme?: AtmosphereTheme;
}

export interface ThemeInfo {
  id: AtmosphereTheme;
  name: string;
  shortName: string;
  emoji: string;
  description: string;
  swatchGradient: string;
  accentColor: string;
}

export const THEME_CONFIGS: ThemeInfo[] = [
  {
    id: 'dusk',
    name: 'Sunlight Dusk',
    shortName: 'Dusk',
    emoji: '🌅',
    description: 'Golden hour solar amber merging into cosmic twilight',
    swatchGradient: 'from-amber-400 via-orange-500 to-rose-500',
    accentColor: '#f59e0b'
  },
  {
    id: 'nebula',
    name: 'Cosmic Nebula',
    shortName: 'Nebula',
    emoji: '🌌',
    description: 'Deep interstellar neon violet, electric cyan and starlight',
    swatchGradient: 'from-cyan-400 via-purple-500 to-pink-500',
    accentColor: '#a855f7'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Matrix',
    shortName: 'Cyber',
    emoji: '⚡',
    description: 'High-velocity electric emerald, toxic lime and cyber cyan',
    swatchGradient: 'from-emerald-400 via-lime-400 to-cyan-400',
    accentColor: '#10b981'
  },
  {
    id: 'supernova',
    name: 'Solar Supernova',
    shortName: 'Nova',
    emoji: '🔥',
    description: 'Blazing stellar crimson, molten lava orange and flare gold',
    swatchGradient: 'from-red-500 via-orange-500 to-amber-400',
    accentColor: '#ef4444'
  },
  {
    id: 'ocean_abyss',
    name: 'Ocean Abyss',
    shortName: 'Ocean',
    emoji: '🌊',
    description: 'Bioluminescent deep aqua, marine turquoise and sapphire',
    swatchGradient: 'from-cyan-400 via-teal-400 to-blue-500',
    accentColor: '#06b6d4'
  },
  {
    id: 'cherry_blossom',
    name: 'Sakura Blossom',
    shortName: 'Sakura',
    emoji: '🌸',
    description: 'Tokyo spring twilight, radiant rose quartz and neon lilac',
    swatchGradient: 'from-pink-400 via-rose-400 to-purple-400',
    accentColor: '#ec4899'
  },
  {
    id: 'aurora_borealis',
    name: 'Arctic Aurora',
    shortName: 'Arctic',
    emoji: '❄️',
    description: 'Polar dancing waves, glacial teal and emerald frost',
    swatchGradient: 'from-teal-300 via-emerald-400 to-cyan-400',
    accentColor: '#34d399'
  },
  {
    id: 'royal_amethyst',
    name: 'Royal Amethyst',
    shortName: 'Amethyst',
    emoji: '👑',
    description: 'Imperial velvet plum, electric lavender and crystalline purple',
    swatchGradient: 'from-purple-400 via-violet-500 to-indigo-500',
    accentColor: '#8b5cf6'
  },
  {
    id: 'electric_amber',
    name: 'Electric Amber',
    shortName: 'Amber',
    emoji: '🍯',
    description: 'Warm morning honey, sunburst yellow and molten copper',
    swatchGradient: 'from-amber-300 via-yellow-400 to-orange-500',
    accentColor: '#f59e0b'
  },
  {
    id: 'midnight_synthwave',
    name: 'Retro Synthwave',
    shortName: 'Synth',
    emoji: '🌆',
    description: '80s laser grid, hot fuchsia, electric blue and retro sunset',
    swatchGradient: 'from-fuchsia-500 via-purple-500 to-blue-500',
    accentColor: '#d946ef'
  }
];

// ============================================================================
// COMMUNITY, SOCIAL PULSE & REAL-TIME DISCORD CHAT INFRASTRUCTURE
// ============================================================================

export type PostMediaType = 'image' | 'code' | 'none';

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorCollege?: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorCollege?: string;
  authorCourse?: string;
  authorLevel?: number;
  content: string;
  mediaType: PostMediaType;
  mediaUrl?: string; // image url or base64 data
  codeSnippet?: string;
  codeLanguage?: string;
  visibility: 'public' | 'private';
  likesCount: number;
  likedBy: string[];
  commentsCount: number;
  comments: PostComment[];
  repostsCount: number;
  repostedBy: string[];
  bookmarkedBy: string[];
  tags: string[];
  createdAt: string;
  isFlagged?: boolean;
  flagReason?: string;
}

export type ChannelCategory = 'academic' | 'doubts' | 'collab' | 'general' | 'voice';

export interface CommunityChannel {
  id: string;
  serverId: string;
  name: string;
  topic: string;
  category: ChannelCategory;
  isPrivate?: boolean;
  unreadCount?: number;
}

export interface CommunityServer {
  id: string;
  name: string;
  icon: string;
  description: string;
  channels: CommunityChannel[];
  memberCount: number;
  category: string;
}

export interface ChatMessage {
  id: string;
  serverId: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: 'Professor' | 'Polymath' | 'Scholar' | 'Apprentice' | 'Admin';
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'code' | 'none';
  codeSnippet?: string;
  codeLanguage?: string;
  createdAt: string;
  reactions: Record<string, string[]>; // emoji -> array of userIds
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  read: boolean;
}

export interface DMConversation {
  id: string;
  participantIds: string[];
  peerProfile: {
    id: string;
    name: string;
    email: string;
    college?: string;
    course?: string;
    avatarUrl?: string;
    online?: boolean;
    level?: number;
  };
  lastMessage?: DirectMessage;
  unreadCount: number;
}

export interface FriendSuggestion {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  college?: string;
  course?: string;
  semester?: number;
  level: number;
  cgpa?: number;
  matchScore: number; // 0-100%
  matchReasons: string[];
  mutualSubjects: string[];
  commonLearningGaps: string[];
  isFollowing?: boolean;
  isPrivate?: boolean;
}

// ============================================================================
// ACADEMIC CALENDAR, EVENTS & TASKS (AI-ASSISTANT SYNCED)
// ============================================================================

export type EventType = 'exam' | 'deadline' | 'lecture' | 'study_squad' | 'milestone';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subject?: string;
  eventType: EventType;
  startDate: string; // ISO String or YYYY-MM-DDTHH:mm
  endDate: string;   // ISO String or YYYY-MM-DDTHH:mm
  allDay?: boolean;
  location?: string;
  color: string;
  syncedWithAI: boolean;
}

export interface CalendarTask {
  id: string;
  userId: string;
  title: string;
  subject?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueDate: string; // ISO String or YYYY-MM-DD
  completed: boolean;
  estimatedMinutes: number;
  relatedGapId?: string;
}

// ============================================================================
// ADMIN SECURITY & CONTENT MODERATION (2FA VERIFIED)
// ============================================================================

export interface AdminSession {
  isAuthenticated: boolean;
  role: 'superadmin' | 'moderator';
  twoFactorVerified: boolean;
  adminEmail?: string;
  token?: string;
  sessionExpiresAt?: string;
}

