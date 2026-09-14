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

export function resolveGeminiApiKey(): string {
  const env = (import.meta as any).env || {};
  return (
    env.VITE_GEMINI_API_KEY ||
    env.GEMINI_API_KEY ||
    env.VITE_GOOGLE_API_KEY ||
    env.GOOGLE_API_KEY ||
    env.VITE_GOOGLE_AI_KEY ||
    env.NEXT_PUBLIC_GEMINI_API_KEY ||
    env.NEXT_PUBLIC_GOOGLE_API_KEY ||
    ''
  ).trim();
}

export function resolveOpenRouterApiKey(): string {
  const env = (import.meta as any).env || {};
  return (env.VITE_OPENROUTER_API_KEY || '').trim();
}

export function resolveEnvApiKey(): string {
  const gemini = resolveGeminiApiKey();
  if (gemini) return gemini;
  return resolveOpenRouterApiKey();
}

class StorageService {
  public setCookie(name: string, value: string, days = 365): void {
    if (typeof document === 'undefined') return;
    try {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = '; expires=' + date.toUTCString();
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
    } catch (e) {
      console.warn('Could not set cookie:', e);
    }
  }

  public getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    try {
      const nameEQ = encodeURIComponent(name) + '=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
      return null;
    } catch {
      return null;
    }
  }

  public removeCookie(name: string): void {
    if (typeof document === 'undefined') return;
    try {
      document.cookie = `${encodeURIComponent(name)}=; Max-Age=-99999999; path=/; SameSite=Lax`;
    } catch {}
  }

  public setOnboardingCompleted(userIdOrEmail: string): void {
    if (!userIdOrEmail) return;
    const clean = userIdOrEmail.trim().toLowerCase();
    try {
      localStorage.setItem(`mba_onboarded_${clean}`, 'true');
      this.setCookie(`mba_onboarded_${clean}`, 'true');
      localStorage.setItem('mba_has_completed_onboarding', 'true');
      this.setCookie('mba_has_completed_onboarding', 'true');
    } catch {}
  }

  public isOnboardingCompleted(userId?: string, email?: string): boolean {
    try {
      if (userId && (localStorage.getItem(`mba_onboarded_${userId.trim().toLowerCase()}`) === 'true' || this.getCookie(`mba_onboarded_${userId.trim().toLowerCase()}`) === 'true')) {
        return true;
      }
      if (email && (localStorage.getItem(`mba_onboarded_${email.trim().toLowerCase()}`) === 'true' || this.getCookie(`mba_onboarded_${email.trim().toLowerCase()}`) === 'true')) {
        return true;
      }
      if (localStorage.getItem('mba_has_completed_onboarding') === 'true' || this.getCookie('mba_has_completed_onboarding') === 'true') {
        return true;
      }
    } catch {}
    return false;
  }

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
    const profile = this.load<StudentProfile>(STORAGE_KEYS.PROFILE, initialStudentProfile);
    if (!profile.onboardingCompleted && this.isOnboardingCompleted(profile.id, profile.email)) {
      profile.onboardingCompleted = true;
      profile.onboardingStep = 12;
    }
    return profile;
  }

  public saveProfile(profile: StudentProfile): void {
    if (profile.onboardingCompleted) {
      this.setOnboardingCompleted(profile.id);
      if (profile.email) this.setOnboardingCompleted(profile.email);
    }
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
    
    // Prioritize Gemini / OpenRouter environment key
    const envKey = resolveEnvApiKey();

    if (envKey) {
      if (!loaded.openRouterApiKey || (envKey.startsWith('AIzaSy') && !loaded.openRouterApiKey.startsWith('AIzaSy'))) {
        loaded.openRouterApiKey = envKey;
        loaded.provider = 'google';
        this.save(STORAGE_KEYS.AI_SETTINGS, loaded);
      }
    }

    // Force default model to gemini-3.8-flash (official Google AI Studio primary model)
    if (!loaded.model || loaded.model === 'gemini-2.0-flash' || loaded.model.includes('gemini-2.5') || loaded.model === 'default') {
      loaded.model = 'gemini-3.8-flash';
      this.save(STORAGE_KEYS.AI_SETTINGS, loaded);
    }

    if (!loaded.provider || (loaded.model.includes('gemini') && loaded.provider !== 'google')) {
      loaded.provider = 'google';
      this.save(STORAGE_KEYS.AI_SETTINGS, loaded);
    }

    // Default atmosphere theme to surrealist_editorial (migrate legacy dusk if present)
    if (!loaded.theme || loaded.theme === 'dusk') {
      loaded.theme = 'surrealist_editorial';
      this.save(STORAGE_KEYS.AI_SETTINGS, loaded);
    }
    return loaded;
  }

  public saveAISettings(settings: AISettings): void {
    this.save(STORAGE_KEYS.AI_SETTINGS, settings);
  }

  public clearApiKey(): void {
    const current = this.getAISettings();
    this.saveAISettings({
      ...current,
      openRouterApiKey: ''
    });
  }

  public getApiKey(): string {
    const geminiEnv = resolveGeminiApiKey();
    const settings = this.getAISettings();
    const isGemini = !settings.model || settings.model.includes('gemini');

    if (isGemini) {
      if (geminiEnv && geminiEnv.startsWith('AIzaSy')) {
        return geminiEnv;
      }
      if (settings.openRouterApiKey && settings.openRouterApiKey.startsWith('AIzaSy')) {
        return settings.openRouterApiKey.trim();
      }
      return geminiEnv || '';
    }

    // OpenRouter model
    const orEnv = resolveOpenRouterApiKey();
    return (settings.openRouterApiKey || orEnv || '').trim();
  }

  public getTodayStudySeconds(): number {
    return this.load<number>(STORAGE_KEYS.STUDY_SECONDS_TODAY, 2540); // Initial 42 mins studied
  }

  public saveTodayStudySeconds(seconds: number): void {
    this.save(STORAGE_KEYS.STUDY_SECONDS_TODAY, seconds);
  }

  public getDemoProfile(): StudentProfile {
    return { ...initialStudentProfile };
  }

  public getDemoAcademicRecords(): AcademicRecord[] {
    return JSON.parse(JSON.stringify(initialAcademicRecords));
  }

  public getDemoLearningGaps(): LearningGap[] {
    return JSON.parse(JSON.stringify(initialLearningGaps));
  }

  public getDemoSyllabus(): SyllabusTopic[] {
    return JSON.parse(JSON.stringify(initialSyllabusTopics));
  }

  public getDemoTimetable(): TimetableBlock[] {
    return JSON.parse(JSON.stringify(initialTimetableBlocks));
  }

  public getDemoTests(): Test[] {
    return JSON.parse(JSON.stringify(initialTests));
  }

  public getDemoAchievements(): Achievement[] {
    return JSON.parse(JSON.stringify(initialAchievements));
  }

  public getDemoAuditLog(): AdaptiveAuditEntry[] {
    return JSON.parse(JSON.stringify(initialAuditLog));
  }

  public resetToDemo(): void {
    const currentSettings = this.load<AISettings>(STORAGE_KEYS.AI_SETTINGS, initialAISettings);
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
    this.saveAISettings({
      ...initialAISettings,
      openRouterApiKey: currentSettings.openRouterApiKey || initialAISettings.openRouterApiKey
    });
    this.saveTodayStudySeconds(2540);
  }
}

export const storageService = new StorageService();
