import { getSupabaseClient } from './supabaseClient';
import type {
  StudentProfile,
  SyllabusTopic,
  LearningGap,
  AcademicRecord,
  TimetableBlock,
  TestAttempt,
  MemorySummary,
  OnboardingAnswers
} from '../types';

class SupabaseDataService {
  /**
   * Fetch student profile from Supabase
   */
  public async getProfile(userId: string): Promise<StudentProfile | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name || 'Scholar',
        email: data.email || '',
        college: data.college || '',
        course: data.course || '',
        department: data.department || '',
        specialization: data.specialization || '',
        degree: data.course || data.degree || 'B.Tech Computer Science',
        semester: data.semester || 1,
        cgpa: parseFloat(data.cgpa) || 0.0,
        targetCgpa: parseFloat(data.target_cgpa) || 9.0,
        streakDays: data.streak_days || 1,
        totalXp: data.total_xp || 100,
        level: data.level || 1,
        avatarUrl: data.avatar_url,
        joinedDate: data.created_at ? data.created_at.slice(0, 10) : '2026-09-10',
        onboardingCompleted: Boolean(data.onboarding_completed),
        onboardingStep: data.onboarding_step || 0,
        memorySummary: data.memory_summary as MemorySummary,
        biometricEnabled: Boolean(data.biometric_enabled)
      };
    } catch (err) {
      console.warn('Error fetching profile from Supabase:', err);
      return null;
    }
  }

  /**
   * Save or update student profile
   */
  public async saveProfile(profile: StudentProfile): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client
        .from('profiles')
        .upsert({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          college: profile.college || '',
          course: profile.course || profile.degree,
          department: profile.department || '',
          specialization: profile.specialization || '',
          semester: profile.semester,
          cgpa: profile.cgpa,
          target_cgpa: profile.targetCgpa,
          streak_days: profile.streakDays,
          total_xp: profile.totalXp,
          level: profile.level,
          avatar_url: profile.avatarUrl,
          onboarding_completed: profile.onboardingCompleted,
          onboarding_step: profile.onboardingStep,
          memory_summary: profile.memorySummary,
          biometric_enabled: profile.biometricEnabled,
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch (err) {
      console.warn('Error saving profile to Supabase:', err);
      return false;
    }
  }

  /**
   * Autosave individual onboarding step answers immediately
   */
  public async saveOnboardingStep(
    userId: string,
    stepIndex: number,
    answers: Partial<OnboardingAnswers>
  ): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const updatePayload: Record<string, unknown> = {
        id: userId,
        onboarding_step: stepIndex,
        updated_at: new Date().toISOString()
      };

      if (answers.name) updatePayload.name = answers.name;
      if (answers.college) updatePayload.college = answers.college;
      if (answers.course) updatePayload.course = answers.course;
      if (answers.specialization) updatePayload.specialization = answers.specialization;
      if (answers.semester) updatePayload.semester = answers.semester;
      if (answers.cgpa !== undefined) updatePayload.cgpa = answers.cgpa;
      if (answers.targetCgpa !== undefined) updatePayload.target_cgpa = answers.targetCgpa;
      if (answers.dailyStudyHours !== undefined) updatePayload.daily_study_hours = answers.dailyStudyHours;
      if (answers.preferredStudyTime) updatePayload.study_time_preference = answers.preferredStudyTime;
      if (answers.explanationStyle) updatePayload.explanation_style = answers.explanationStyle;
      if (answers.difficultTopics) updatePayload.difficult_topics = answers.difficultTopics;
      if (answers.subjects) updatePayload.subjects = answers.subjects;

      const { error } = await client.from('profiles').upsert(updatePayload);
      return !error;
    } catch (err) {
      console.warn('Error autosaving onboarding step:', err);
      return false;
    }
  }

  /**
   * Finalize conversational onboarding
   */
  public async completeOnboarding(
    userId: string,
    answers: OnboardingAnswers,
    memorySummary: MemorySummary
  ): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client
        .from('profiles')
        .upsert({
          id: userId,
          name: answers.name,
          college: answers.college,
          course: answers.course,
          specialization: answers.specialization,
          department: answers.course,
          semester: answers.semester,
          cgpa: answers.cgpa,
          target_cgpa: answers.targetCgpa,
          daily_study_hours: answers.dailyStudyHours,
          study_time_preference: answers.preferredStudyTime,
          explanation_style: answers.explanationStyle,
          difficult_topics: answers.difficultTopics,
          subjects: answers.subjects,
          onboarding_completed: true,
          onboarding_step: 12,
          memory_summary: memorySummary,
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch (err) {
      console.warn('Error completing onboarding:', err);
      return false;
    }
  }

  /**
   * Fetch syllabus topics
   */
  public async getSyllabusTopics(userId: string): Promise<SyllabusTopic[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('syllabus_topics')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true });

      if (error || !data) return [];

      return data.map((d) => ({
        id: d.id,
        subject: d.subject,
        moduleName: d.module_name,
        topic: d.topic,
        priority: d.priority as 'high' | 'medium' | 'low',
        status: d.status as 'pending' | 'in_progress' | 'mastered',
        estimatedHours: parseFloat(d.estimated_hours) || 2.0,
        completedHours: parseFloat(d.completed_hours) || 0.0,
        masteryPercentage: parseFloat(d.mastery_percentage) || 0.0,
        isGapRemediation: Boolean(d.is_gap_remediation),
        orderIndex: d.order_index || 0
      }));
    } catch (err) {
      console.warn('Error fetching syllabus topics:', err);
      return [];
    }
  }

  /**
   * Save or replace syllabus topics
   */
  public async saveSyllabusTopics(userId: string, topics: SyllabusTopic[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      // Clear old topics and insert fresh list
      await client.from('syllabus_topics').delete().eq('user_id', userId);

      const rows = topics.map((t, idx) => ({
        id: t.id && t.id.includes('-') ? t.id : undefined,
        user_id: userId,
        subject: t.subject,
        module_name: t.moduleName,
        topic: t.topic,
        priority: t.priority,
        status: t.status,
        estimated_hours: t.estimatedHours,
        completed_hours: t.completedHours,
        mastery_percentage: t.masteryPercentage,
        is_gap_remediation: t.isGapRemediation,
        order_index: idx
      }));

      const { error } = await client.from('syllabus_topics').insert(rows);
      return !error;
    } catch (err) {
      console.warn('Error saving syllabus topics:', err);
      return false;
    }
  }

  /**
   * Fetch learning gaps
   */
  public async getLearningGaps(userId: string): Promise<LearningGap[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('learning_gaps')
        .select('*')
        .eq('user_id', userId)
        .order('mastery_score', { ascending: true });

      if (error || !data) return [];

      return data.map((d) => ({
        id: d.id,
        subject: d.subject,
        topic: d.topic,
        module: d.module,
        severity: d.severity as 'critical' | 'high' | 'medium' | 'low',
        masteryScore: parseFloat(d.mastery_score) || 35.0,
        identifiedFrom: d.identified_from || 'Diagnostic Analysis',
        rootCause: d.root_cause || 'Needs foundational review',
        recommendedHours: parseFloat(d.recommended_hours) || 3.0,
        status: d.status as 'active' | 'in_remediation' | 'resolved',
        lastEvaluated: d.last_evaluated ? d.last_evaluated.slice(0, 10) : new Date().toISOString().slice(0, 10)
      }));
    } catch (err) {
      console.warn('Error fetching learning gaps:', err);
      return [];
    }
  }

  /**
   * Save learning gaps
   */
  public async saveLearningGaps(userId: string, gaps: LearningGap[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      await client.from('learning_gaps').delete().eq('user_id', userId);

      const rows = gaps.map((g) => ({
        id: g.id && g.id.includes('-') ? g.id : undefined,
        user_id: userId,
        subject: g.subject,
        topic: g.topic,
        module: g.module,
        severity: g.severity,
        mastery_score: g.masteryScore,
        identified_from: g.identifiedFrom,
        root_cause: g.rootCause,
        recommended_hours: g.recommendedHours,
        status: g.status,
        last_evaluated: new Date().toISOString()
      }));

      const { error } = await client.from('learning_gaps').insert(rows);
      return !error;
    } catch (err) {
      console.warn('Error saving learning gaps:', err);
      return false;
    }
  }

  /**
   * Fetch academic records
   */
  public async getAcademicRecords(userId: string): Promise<AcademicRecord[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('academic_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error || !data) return [];

      return data.map((d) => ({
        id: d.id,
        subjectCode: d.subject_code || '',
        subjectName: d.subject_name,
        semester: d.semester,
        examType: d.exam_type as AcademicRecord['examType'],
        score: parseFloat(d.score),
        totalMarks: parseFloat(d.total_marks),
        percentage: parseFloat(d.percentage),
        grade: d.grade,
        date: d.date || '',
        topicsEvaluated: d.topics_evaluated || []
      }));
    } catch (err) {
      console.warn('Error fetching academic records:', err);
      return [];
    }
  }

  /**
   * Save new academic record
   */
  public async saveAcademicRecord(userId: string, record: AcademicRecord): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('academic_records').insert({
        user_id: userId,
        subject_code: record.subjectCode,
        subject_name: record.subjectName,
        semester: record.semester,
        exam_type: record.examType,
        score: record.score,
        total_marks: record.totalMarks,
        percentage: record.percentage,
        grade: record.grade,
        date: record.date || new Date().toISOString().slice(0, 10),
        topics_evaluated: record.topicsEvaluated
      });
      return !error;
    } catch (err) {
      console.warn('Error saving academic record:', err);
      return false;
    }
  }

  /**
   * Fetch timetable blocks
   */
  public async getTimetable(userId: string): Promise<TimetableBlock[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('timetable_blocks')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) return [];

      return data.map((d) => ({
        id: d.id,
        dayOfWeek: d.day_of_week as TimetableBlock['dayOfWeek'],
        startTime: d.start_time,
        endTime: d.end_time,
        subject: d.subject,
        topic: d.topic,
        blockType: d.block_type as TimetableBlock['blockType'],
        isAdaptive: Boolean(d.is_adaptive),
        adaptiveReason: d.adaptive_reason,
        completed: Boolean(d.completed),
        dateString: d.date_string
      }));
    } catch (err) {
      console.warn('Error fetching timetable:', err);
      return [];
    }
  }

  /**
   * Save timetable blocks
   */
  public async saveTimetable(userId: string, blocks: TimetableBlock[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      await client.from('timetable_blocks').delete().eq('user_id', userId);

      const rows = blocks.map((b) => ({
        id: b.id && b.id.includes('-') ? b.id : undefined,
        user_id: userId,
        day_of_week: b.dayOfWeek,
        start_time: b.startTime,
        end_time: b.endTime,
        subject: b.subject,
        topic: b.topic,
        block_type: b.blockType,
        is_adaptive: b.isAdaptive,
        adaptive_reason: b.adaptiveReason,
        completed: b.completed,
        date_string: b.dateString
      }));

      const { error } = await client.from('timetable_blocks').insert(rows);
      return !error;
    } catch (err) {
      console.warn('Error saving timetable:', err);
      return false;
    }
  }

  /**
   * Save test attempt
   */
  public async saveTestAttempt(userId: string, attempt: TestAttempt): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client.from('test_attempts').insert({
        user_id: userId,
        test_id: attempt.testId,
        test_title: attempt.testTitle,
        subject: attempt.subject,
        topic: attempt.topic,
        score: attempt.score,
        total_questions: attempt.totalQuestions,
        percentage: attempt.percentage,
        user_answers: attempt.userAnswers,
        time_spent_seconds: attempt.timeSpentSeconds,
        feedback: attempt.feedback,
        previous_mastery: attempt.previousMastery,
        new_mastery: attempt.newMastery,
        gap_id: attempt.gapId,
        status: attempt.status
      });
      return !error;
    } catch (err) {
      console.warn('Error saving test attempt:', err);
      return false;
    }
  }

  /**
   * Fetch memory summary
   */
  public async getMemorySummary(userId: string): Promise<MemorySummary | null> {
    const profile = await this.getProfile(userId);
    return profile?.memorySummary || null;
  }

  /**
   * Save memory summary
   */
  public async saveMemorySummary(userId: string, memory: MemorySummary): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client
        .from('profiles')
        .update({
          memory_summary: memory,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      return !error;
    } catch (err) {
      console.warn('Error saving memory summary:', err);
      return false;
    }
  }
}

export const supabaseDataService = new SupabaseDataService();
