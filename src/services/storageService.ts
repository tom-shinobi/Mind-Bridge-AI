import type {
  StudentProfile,
  AcademicRecord,
  LearningGap,
  SyllabusTopic,
  TimetableBlock,
  Test,
  TestAttempt,
  DailyCheckIn,
  Achievement,
  AdaptiveAuditEntry,
  AISettings
} from '../types';
import {
  initialStudentProfile,
  initialAcademicRecords,
  initialLearningGaps,
  initialSyllabusTopics,
  initialTimetableBlocks,
  initialTests,
  initialAchievements,
  initialAuditLog,
  initialAISettings
} from './mockData';

const STORAGE_KEYS = {
  PROFILE: 'mba_student_profile',
  ACADEMIC_RECORDS: 'mba_academic_records',
  LEARNING_GAPS: 'mba_learning_gaps',
  SYLLABUS: 'mba_syllabus',
  TIMETABLE: 'mba_timetable',
  TESTS: 'mba_tests',
  TEST_ATTEMPTS: 'mba_test_attempts',
  DAILY_CHECKINS: 'mba_daily_checkins',
  ACHIEVEMENTS: 'mba_achievements',
  AUDIT_LOG: 'mba_audit_log',
  AI_SETTINGS: 'mba_ai_settings',
  STUDY_SECONDS_TODAY: 'mba_study_seconds_today'
};

class StorageService {
  private load<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  public getProfile(): StudentProfile {
    return this.load<StudentProfile>(STORAGE_KEYS.PROFILE, initialStudentProfile);
  }

  public saveProfile(profile: StudentProfile): void {
    this.save(STORAGE_KEYS.PROFILE, profile);
  }

  public getAcademicRecords(): AcademicRecord[] {
    return this.load<AcademicRecord[]>(STORAGE_KEYS.ACADEMIC_RECORDS, initialAcademicRecords);
  }

  public saveAcademicRecords(records: AcademicRecord[]): void {
    this.save(STORAGE_KEYS.ACADEMIC_RECORDS, records);
  }

  public getLearningGaps(): LearningGap[] {
    return this.load<LearningGap[]>(STORAGE_KEYS.LEARNING_GAPS, initialLearningGaps);
  }

  public saveLearningGaps(gaps: LearningGap[]): void {
    this.save(STORAGE_KEYS.LEARNING_GAPS, gaps);
  }

  public getSyllabus(): SyllabusTopic[] {
    return this.load<SyllabusTopic[]>(STORAGE_KEYS.SYLLABUS, initialSyllabusTopics);
  }

  public saveSyllabus(syllabus: SyllabusTopic[]): void {
    this.save(STORAGE_KEYS.SYLLABUS, syllabus);
  }

  public getTimetable(): TimetableBlock[] {
    return this.load<TimetableBlock[]>(STORAGE_KEYS.TIMETABLE, initialTimetableBlocks);
  }

  public saveTimetable(timetable: TimetableBlock[]): void {
    this.save(STORAGE_KEYS.TIMETABLE, timetable);
  }

  public getTests(): Test[] {
    return this.load<Test[]>(STORAGE_KEYS.TESTS, initialTests);
  }

  public saveTests(tests: Test[]): void {
    this.save(STORAGE_KEYS.TESTS, tests);
  }

  public getTestAttempts(): TestAttempt[] {
    return this.load<TestAttempt[]>(STORAGE_KEYS.TEST_ATTEMPTS, []);
  }

  public saveTestAttempts(attempts: TestAttempt[]): void {
    this.save(STORAGE_KEYS.TEST_ATTEMPTS, attempts);
  }

  public getDailyCheckIns(): DailyCheckIn[] {
    return this.load<DailyCheckIn[]>(STORAGE_KEYS.DAILY_CHECKINS, []);
  }

  public saveDailyCheckIns(checkIns: DailyCheckIn[]): void {
    this.save(STORAGE_KEYS.DAILY_CHECKINS, checkIns);
  }

  public getAchievements(): Achievement[] {
    return this.load<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, initialAchievements);
  }

  public saveAchievements(achievements: Achievement[]): void {
    this.save(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }

  public getAuditLog(): AdaptiveAuditEntry[] {
    return this.load<AdaptiveAuditEntry[]>(STORAGE_KEYS.AUDIT_LOG, initialAuditLog);
  }

  public saveAuditLog(log: AdaptiveAuditEntry[]): void {
    this.save(STORAGE_KEYS.AUDIT_LOG, log);
  }

  public getAISettings(): AISettings {
    const loaded = this.load<AISettings>(STORAGE_KEYS.AI_SETTINGS, initialAISettings);
    // Ensure model defaults to liquid/lfm-2.5-2.6b:free if set to older default
    if (!loaded.model || loaded.model.includes('gemini') || loaded.model === 'default') {
      loaded.model = 'liquid/lfm-2.5-2.6b:free';
    }
    const envKey = (import.meta as unknown as { env?: { VITE_OPENROUTER_API_KEY?: string } }).env?.VITE_OPENROUTER_API_KEY;
    if (!loaded.openRouterApiKey && envKey) {
      loaded.openRouterApiKey = envKey;
    }
    return loaded;
  }

  public saveAISettings(settings: AISettings): void {
    this.save(STORAGE_KEYS.AI_SETTINGS, settings);
  }

  public getTodayStudySeconds(): number {
    return this.load<number>(STORAGE_KEYS.STUDY_SECONDS_TODAY, 2540); // Initial 42 mins studied
  }

  public saveTodayStudySeconds(seconds: number): void {
    this.save(STORAGE_KEYS.STUDY_SECONDS_TODAY, seconds);
  }

  public resetToDemo(): void {
    localStorage.clear();
    this.saveProfile(initialStudentProfile);
    this.saveAcademicRecords(initialAcademicRecords);
    this.saveLearningGaps(initialLearningGaps);
    this.saveSyllabus(initialSyllabusTopics);
    this.saveTimetable(initialTimetableBlocks);
    this.saveTests(initialTests);
    this.saveTestAttempts([]);
    this.saveDailyCheckIns([]);
    this.saveAchievements(initialAchievements);
    this.saveAuditLog(initialAuditLog);
    this.saveAISettings(initialAISettings);
    this.saveTodayStudySeconds(2540);
  }
}

export const storageService = new StorageService();
