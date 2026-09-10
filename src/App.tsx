import { useState, useEffect } from 'react';
import type {
  StudentProfile,
  AcademicRecord,
  LearningGap,
  SyllabusTopic,
  TimetableBlock,
  Test,
  TestAttempt,
  Achievement,
  AdaptiveAuditEntry,
  AISettings
} from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DailyWorkloadModal } from './components/DailyWorkloadModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { AcademicHistory } from './pages/AcademicHistory';
import { LearningGaps } from './pages/LearningGaps';
import { PersonalizedSyllabus } from './pages/PersonalizedSyllabus';
import { SmartTimetable } from './pages/SmartTimetable';
import { AITutor } from './pages/AITutor';
import { PersonalizedTests } from './pages/PersonalizedTests';
import { AdaptiveLoop } from './pages/AdaptiveLoop';
import { ProgressGamification } from './pages/ProgressGamification';
import { SettingsProfile } from './pages/SettingsProfile';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [targetTopic, setTargetTopic] = useState<string | undefined>(undefined);
  const [isWorkloadModalOpen, setIsWorkloadModalOpen] = useState<boolean>(false);

  // Core App State
  const [profile, setProfile] = useState<StudentProfile>(() => storageService.getProfile());
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>(() =>
    storageService.getAcademicRecords()
  );
  const [gaps, setGaps] = useState<LearningGap[]>(() => storageService.getLearningGaps());
  const [syllabus, setSyllabus] = useState<SyllabusTopic[]>(() => storageService.getSyllabus());
  const [timetable, setTimetable] = useState<TimetableBlock[]>(() => storageService.getTimetable());
  const [tests, setTests] = useState<Test[]>(() => storageService.getTests());
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    storageService.getAchievements()
  );
  const [auditLog, setAuditLog] = useState<AdaptiveAuditEntry[]>(() =>
    storageService.getAuditLog()
  );
  const [aiSettings, setAISettings] = useState<AISettings>(() => storageService.getAISettings());

  // Refresh all state from storage helper
  const reloadStateFromStorage = () => {
    setProfile(storageService.getProfile());
    setAcademicRecords(storageService.getAcademicRecords());
    setGaps(storageService.getLearningGaps());
    setSyllabus(storageService.getSyllabus());
    setTimetable(storageService.getTimetable());
    setTests(storageService.getTests());
    setAchievements(storageService.getAchievements());
    setAuditLog(storageService.getAuditLog());
    setAISettings(storageService.getAISettings());
  };

  useEffect(() => {
    reloadStateFromStorage();
  }, []);

  const handleNavigate = (tab: string, extra?: { topic?: string }) => {
    setActiveTab(tab);
    if (extra?.topic) {
      setTargetTopic(extra.topic);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetDemo = () => {
    storageService.resetToDemo();
    reloadStateFromStorage();
    setActiveTab('dashboard');
  };

  const handleToggleBlockComplete = (blockId: string) => {
    const updated = timetable.map((b) => (b.id === blockId ? { ...b, completed: !b.completed } : b));
    setTimetable(updated);
    storageService.saveTimetable(updated);
  };

  const handleAddAcademicRecord = (record: AcademicRecord) => {
    const updated = [record, ...academicRecords];
    setAcademicRecords(updated);
    storageService.saveAcademicRecords(updated);
  };

  const handleScheduleAdapted = (
    newTimetable: TimetableBlock[],
    newAudit: AdaptiveAuditEntry
  ) => {
    setTimetable(newTimetable);
    setAuditLog([newAudit, ...auditLog]);
  };

  const handleTestComplete = (
    _attempt: TestAttempt,
    adaptationResult: any
  ) => {
    if (adaptationResult) {
      setProfile(adaptationResult.updatedProfile);
      setGaps(adaptationResult.updatedGaps);
      setSyllabus(adaptationResult.updatedSyllabus);
      setTimetable(adaptationResult.updatedTimetable);
      setAchievements(adaptationResult.updatedAchievements);
      setAuditLog([...adaptationResult.newAuditEntries, ...auditLog]);
    }
  };

  const handleUpdateProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    storageService.saveProfile(newProfile);
  };

  const handleUpdateAISettings = (newSettings: AISettings) => {
    setAISettings(newSettings);
    storageService.saveAISettings(newSettings);
  };

  const activeGapsCount = gaps.filter((g) => g.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-[#030712] text-[#F5F5F7] flex flex-col relative selection:bg-white/20 selection:text-white font-body">
      
      {/* Real Optical Chromatic Fluid Silk Ribbons Canvas (Matching Reference Image 2) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="chromatic-ribbon-purple -top-[140px] left-[10%] opacity-55" />
        <div className="chromatic-ribbon-magenta top-[30%] -right-[140px] opacity-45" />
        <div className="chromatic-ribbon-cyan -bottom-[120px] left-[15%] opacity-50" />
        <div className="chromatic-ribbon-amber top-[55%] left-[40%] opacity-35" />
        
        {/* Subtle Apple Ambient Grid / Starfield Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(3,7,18,0.7)_70%,rgba(3,7,18,0.95)_100%)] pointer-events-none" />
      </div>

      {/* Real Snell's Law SVG Displacement Map Filter */}
      <svg className="hidden">
        <defs>
          <filter id="liquid-glass-lens-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Top Navbar */}
      <Navbar
        profile={profile}
        gaps={gaps}
        aiSettings={aiSettings}
        onUpdateSettings={handleUpdateAISettings}
        onResetDemo={handleResetDemo}
        onNavigate={handleNavigate}
        activeTab={activeTab}
      />

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row relative z-10">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleNavigate}
          activeGapsCount={activeGapsCount}
          onOpenWorkloadModal={() => setIsWorkloadModalOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard
              profile={profile}
              gaps={gaps}
              syllabus={syllabus}
              timetable={timetable}
              achievements={achievements}
              onNavigate={handleNavigate}
              onOpenWorkloadModal={() => setIsWorkloadModalOpen(true)}
              onToggleBlockComplete={handleToggleBlockComplete}
            />
          )}

          {activeTab === 'history' && (
            <AcademicHistory
              records={academicRecords}
              profile={profile}
              onAddRecord={handleAddAcademicRecord}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'gaps' && (
            <LearningGaps gaps={gaps} onNavigate={handleNavigate} />
          )}

          {activeTab === 'syllabus' && (
            <PersonalizedSyllabus syllabus={syllabus} onNavigate={handleNavigate} />
          )}

          {activeTab === 'timetable' && (
            <SmartTimetable
              timetable={timetable}
              onToggleBlockComplete={handleToggleBlockComplete}
              onOpenWorkloadModal={() => setIsWorkloadModalOpen(true)}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'tutor' && (
            <AITutor
              initialTopic={targetTopic}
              gaps={gaps}
              syllabus={syllabus}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'tests' && (
            <PersonalizedTests
              tests={tests}
              gaps={gaps}
              profile={profile}
              initialTopic={targetTopic}
              onTestComplete={handleTestComplete}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'adaptive_loop' && (
            <AdaptiveLoop
              auditLog={auditLog}
              gaps={gaps}
              profile={profile}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressGamification
              profile={profile}
              achievements={achievements}
              syllabus={syllabus}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsProfile
              profile={profile}
              aiSettings={aiSettings}
              onUpdateProfile={handleUpdateProfile}
              onUpdateAISettings={handleUpdateAISettings}
            />
          )}
        </main>
      </div>

      {/* Daily Workload Modal */}
      <DailyWorkloadModal
        isOpen={isWorkloadModalOpen}
        onClose={() => setIsWorkloadModalOpen(false)}
        onScheduleAdapted={handleScheduleAdapted}
      />

    </div>
  );
}
export default App;
