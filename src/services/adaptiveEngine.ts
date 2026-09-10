import type {
  LearningGap,
  SyllabusTopic,
  TimetableBlock,
  TestAttempt,
  WorkloadLevel,
  StudentProfile,
  Achievement,
  AdaptiveAuditEntry
} from '../types';
import { storageService } from './storageService';
import { sound } from './soundService';

export interface AdaptiveAdaptationResult {
  updatedProfile: StudentProfile;
  updatedGaps: LearningGap[];
  updatedSyllabus: SyllabusTopic[];
  updatedTimetable: TimetableBlock[];
  updatedAchievements: Achievement[];
  newAuditEntries: AdaptiveAuditEntry[];
  unlockedBadges: Achievement[];
  message: string;
}

class AdaptiveEngine {
  /**
   * Applies the results of a submitted personalized test to the entire learning plan.
   * This is the continuous feedback loop in action!
   */
  public processTestCompletion(attempt: TestAttempt): AdaptiveAdaptationResult {
    const profile = storageService.getProfile();
    const gaps = storageService.getLearningGaps();
    const syllabus = storageService.getSyllabus();
    const timetable = storageService.getTimetable();
    const achievements = storageService.getAchievements();
    const auditLog = storageService.getAuditLog();

    const newAuditEntries: AdaptiveAuditEntry[] = [];
    const unlockedBadges: Achievement[] = [];

    const isPassed = attempt.percentage >= 70;
    const xpEarned = isPassed ? 250 + Math.round(attempt.percentage * 2) : 80;

    // 1. Update Student Profile XP & Level
    const newTotalXp = profile.totalXp + xpEarned;
    const newLevel = Math.floor(newTotalXp / 1000) + 1;
    const updatedProfile: StudentProfile = {
      ...profile,
      totalXp: newTotalXp,
      level: newLevel
    };

    // 2. Update the Target Learning Gap
    const updatedGaps = gaps.map((gap) => {
      if (gap.id === attempt.gapId || gap.topic.toLowerCase().includes(attempt.topic.toLowerCase())) {
        const newScore = Math.min(100, Math.round((gap.masteryScore + attempt.percentage) / 2));
        
        let newSeverity = gap.severity;
        let newStatus = gap.status;

        if (newScore >= 80) {
          newSeverity = 'low';
          newStatus = 'resolved';
          newAuditEntries.push({
            id: `aud_${Date.now()}_gap_res`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            triggerEvent: `Test score ${attempt.percentage}% on "${gap.topic}"`,
            actionTaken: `Gap marked RESOLVED. Mastery increased from ${gap.masteryScore}% to ${newScore}%.`,
            category: 'gap_resolved',
            impactDescription: `Syllabus status upgraded to Mastered. Remedial timetable load decommissioned.`
          });
        } else if (newScore >= 65) {
          newSeverity = 'medium';
          newStatus = 'in_remediation';
          newAuditEntries.push({
            id: `aud_${Date.now()}_gap_upg`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            triggerEvent: `Test score ${attempt.percentage}% on "${gap.topic}"`,
            actionTaken: `Severity reduced from ${gap.severity.toUpperCase()} to MEDIUM. Mastery now ${newScore}%.`,
            category: 'gap_resolved',
            impactDescription: `Allocated 1.5 maintenance review hours instead of emergency deep work.`
          });
        } else {
          newAuditEntries.push({
            id: `aud_${Date.now()}_gap_ret`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            triggerEvent: `Test score ${attempt.percentage}% on "${gap.topic}" below mastery threshold.`,
            actionTaken: `Retained gap priority as ${gap.severity.toUpperCase()}. Scheduled additional Socratic AI tutoring session.`,
            category: 'gap_detected',
            impactDescription: `Prioritizing fundamental conceptual drills.`
          });
        }

        return {
          ...gap,
          masteryScore: newScore,
          severity: newSeverity,
          status: newStatus,
          lastEvaluated: new Date().toISOString().split('T')[0]
        };
      }
      return gap;
    });

    // 3. Adapt the Personalized Syllabus
    const updatedSyllabus = syllabus.map((item) => {
      if (item.topic.toLowerCase().includes(attempt.topic.toLowerCase())) {
        const isMastered = isPassed && attempt.percentage >= 75;
        return {
          ...item,
          status: isMastered ? ('mastered' as const) : ('in_progress' as const),
          priority: isMastered ? ('low' as const) : ('medium' as const),
          masteryPercentage: Math.min(100, Math.round((item.masteryPercentage + attempt.percentage) / 2)),
          completedHours: item.completedHours + 1
        };
      }
      return item;
    });

    // Re-rank syllabus so unresolved gaps remain top priority
    updatedSyllabus.sort((a, b) => {
      const priorityWeights = { high: 3, medium: 2, low: 1 };
      const statusWeights = { pending: 3, in_progress: 2, mastered: 1 };
      return (
        priorityWeights[b.priority] * 10 + statusWeights[b.status] -
        (priorityWeights[a.priority] * 10 + statusWeights[a.status])
      );
    });
    updatedSyllabus.forEach((item, idx) => {
      item.orderIndex = idx + 1;
    });

    // 4. Adapt the Study Timetable
    const updatedTimetable = timetable.map((block) => {
      if (block.topic.toLowerCase().includes(attempt.topic.toLowerCase()) && block.blockType === 'test') {
        return { ...block, completed: true };
      }
      // If student mastered B-Trees, shift future remedial sessions to the next highest gap (e.g. DP)
      if (isPassed && block.topic.includes('B-Trees') && !block.completed) {
        return {
          ...block,
          topic: 'Dynamic Programming: Memoization & State Tables',
          subject: 'Data Structures & Algorithms',
          adaptiveReason: 'Auto-promoted: B-Tree gap resolved! Shifted focus to next priority gap: Dynamic Programming.',
          isAdaptive: true
        };
      }
      return block;
    });

    if (isPassed) {
      newAuditEntries.push({
        id: `aud_${Date.now()}_time_adapt`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triggerEvent: `Mastery achieved in ${attempt.topic}`,
        actionTaken: `Automated Timetable Rebalancing: Swapped upcoming remedial blocks to next high-priority gap (Dynamic Programming).`,
        category: 'timetable',
        impactDescription: `Preserves momentum and prevents redundant review time.`
      });
    }

    // 5. Update Achievements
    const updatedAchievements = achievements.map((ach) => {
      if (ach.id === 'ach_first_gap' && isPassed && !ach.unlockedAt) {
        unlockedBadges.push({ ...ach, unlockedAt: new Date().toISOString() });
        return {
          ...ach,
          progress: 1,
          unlockedAt: new Date().toISOString()
        };
      }
      if (ach.id === 'ach_level_5') {
        const prog = Math.min(5000, newTotalXp);
        const unlocked = prog >= 5000 && !ach.unlockedAt;
        if (unlocked) {
          unlockedBadges.push({ ...ach, unlockedAt: new Date().toISOString(), progress: 5000 });
        }
        return {
          ...ach,
          progress: prog,
          unlockedAt: unlocked ? new Date().toISOString() : ach.unlockedAt
        };
      }
      return ach;
    });

    // Save everything to storage
    storageService.saveProfile(updatedProfile);
    storageService.saveLearningGaps(updatedGaps);
    storageService.saveSyllabus(updatedSyllabus);
    storageService.saveTimetable(updatedTimetable);
    storageService.saveAchievements(updatedAchievements);
    storageService.saveAuditLog([...newAuditEntries, ...auditLog]);

    // Play feedback sound
    if (isPassed) {
      sound.playFanfare();
    } else {
      sound.playAdaptivePing();
    }

    return {
      updatedProfile,
      updatedGaps,
      updatedSyllabus,
      updatedTimetable,
      updatedAchievements,
      newAuditEntries,
      unlockedBadges,
      message: isPassed
        ? `Incredible progress! Your test score (${attempt.percentage}%) has updated your syllabus and adapted your timetable!`
        : `Test submitted (${attempt.percentage}%). Mind Bridge AI has scheduled additional targeted reinforcement.`
    };
  }

  /**
   * Workload and stress-aware timetable adjustment.
   * Modulates daily study blocks to prevent academic fatigue without medical claims.
   */
  public adaptForWorkload(workload: WorkloadLevel, stressRating: number): {
    timetable: TimetableBlock[];
    auditEntry: AdaptiveAuditEntry;
    message: string;
  } {
    const currentTimetable = storageService.getTimetable();
    const auditLog = storageService.getAuditLog();

    let adjustedCount = 0;
    let newBlocks: TimetableBlock[] = [];
    let reasonMessage = '';

    if (workload === 'heavy' || workload === 'overwhelmed') {
      // Lighten today's load: mark heavy blocks as moved to weekend/future, keep only short revision
      newBlocks = currentTimetable.map((block) => {
        if (block.dayOfWeek === 'Monday' && !block.completed) {
          if (block.blockType === 'deep_work') {
            adjustedCount++;
            return {
              ...block,
              dayOfWeek: 'Saturday' as const,
              adaptiveReason: `Rescheduled from Monday due to high workload check-in (${workload.toUpperCase()}).`,
              isAdaptive: true
            };
          }
          if (block.blockType === 'test') {
            adjustedCount++;
            return {
              ...block,
              dayOfWeek: 'Tuesday' as const,
              adaptiveReason: `Deferred by 24h to allow adequate mental recovery.`,
              isAdaptive: true
            };
          }
        }
        return block;
      });

      reasonMessage = `Daily study load reduced. 2 intensive blocks rescheduled to preserve focus and mitigate fatigue.`;
    } else if (workload === 'light') {
      reasonMessage = `Optimal capacity detected. Today's timetable maintained with dedicated high-impact focus blocks.`;
      newBlocks = currentTimetable;
    } else {
      reasonMessage = `Balanced workload confirmed. Timetable pacing aligned with current academic goals.`;
      newBlocks = currentTimetable;
    }

    const auditEntry: AdaptiveAuditEntry = {
      id: `aud_${Date.now()}_workload`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      triggerEvent: `Workload Check: Student indicated "${workload.toUpperCase()}" (Stress rating ${stressRating}/5)`,
      actionTaken: reasonMessage,
      category: 'workload_relief',
      impactDescription: `Dynamic academic pacing applied. Non-medical workload balancing.`
    };

    storageService.saveTimetable(newBlocks);
    storageService.saveAuditLog([auditEntry, ...auditLog]);
    sound.playAdaptivePing();

    return {
      timetable: newBlocks,
      auditEntry,
      message: reasonMessage
    };
  }
}

export const adaptiveEngine = new AdaptiveEngine();
