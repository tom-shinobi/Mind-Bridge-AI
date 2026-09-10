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

export interface AISettings {
  provider: 'openrouter' | 'local_intelligent';
  openRouterApiKey: string;
  model: string;
  speechEnabled: boolean;
  soundFxEnabled: boolean;
}
