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
  AISettings,
  AtmosphereTheme,
  AuthUser,
  OnboardingAnswers,
  MemorySummary
} from './types';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { supabaseDataService } from './services/supabaseDataService';
import { isSupabaseConfigured } from './services/supabaseClient';
import { sound } from './services/soundService';

import { UnifiedNavbar } from './components/UnifiedNavbar';
import { ParticleBackground } from './components/ParticleBackground';
import { DailyWorkloadModal } from './components/DailyWorkloadModal';
import { AuthPortal } from './components/auth/AuthPortal';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { SyllabusUploadView } from './components/onboarding/SyllabusUploadView';

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
import { CommunityHub } from './pages/CommunityHub';
import { AcademicCalendar } from './pages/AcademicCalendar';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [targetTopic, setTargetTopic] = useState<string | undefined>(undefined);
  const [isWorkloadModalOpen, setIsWorkloadModalOpen] = useState<boolean>(false);

  // Authentication & Mode State
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const savedDemo = localStorage.getItem('mba_demo_mode');
    if (savedDemo !== null) return savedDemo === 'true';
    return !isSupabaseConfigured();
  });
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [needsSyllabusUpload, setNeedsSyllabusUpload] = useState<boolean>(false);

  // Core App State (Strictly isolate demo mode from logged-in user profile)
  const isInitialDemo = localStorage.getItem('mba_demo_mode') === 'true' || !isSupabaseConfigured();
  const [profile, setProfile] = useState<StudentProfile>(() =>
    isInitialDemo ? storageService.getDemoProfile() : storageService.getProfile()
  );
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>(() =>
    isInitialDemo ? storageService.getDemoAcademicRecords() : storageService.getAcademicRecords()
  );
  const [gaps, setGaps] = useState<LearningGap[]>(() =>
    isInitialDemo ? storageService.getDemoLearningGaps() : storageService.getLearningGaps()
  );
  const [syllabus, setSyllabus] = useState<SyllabusTopic[]>(() =>
    isInitialDemo ? storageService.getDemoSyllabus() : storageService.getSyllabus()
  );
  const [timetable, setTimetable] = useState<TimetableBlock[]>(() =>
    isInitialDemo ? storageService.getDemoTimetable() : storageService.getTimetable()
  );
  const [tests, setTests] = useState<Test[]>(() =>
    isInitialDemo ? storageService.getDemoTests() : storageService.getTests()
  );
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    isInitialDemo ? storageService.getDemoAchievements() : storageService.getAchievements()
  );
  const [auditLog, setAuditLog] = useState<AdaptiveAuditEntry[]>(() =>
    isInitialDemo ? storageService.getDemoAuditLog() : storageService.getAuditLog()
  );
  const [aiSettings, setAISettings] = useState<AISettings>(() => storageService.getAISettings());



  // Synchronize authenticated user data from Supabase
  const loadUserData = async (userId: string) => {
    try {
      let p = await supabaseDataService.getProfile(userId);
      if (!p) {
        // Brand new user without a profile in Supabase:
        // Initialize fresh profile with onboardingCompleted: false so they go through onboarding!
        const initialNewProfile: StudentProfile = {
          id: userId,
          name: authUser?.name || 'Scholar',
          email: authUser?.email || '',
          degree: 'B.Tech Computer Science',
          department: 'Computer Science',
          semester: 1,
          cgpa: 0.0,
          targetCgpa: 9.0,
          streakDays: 1,
          totalXp: 0,
          level: 1,
          joinedDate: new Date().toISOString().slice(0, 10),
          onboardingCompleted: false, // Brand new user!
          onboardingStep: 1,
          syllabusUploaded: false
        };
        await supabaseDataService.saveProfile(initialNewProfile);
        p = initialNewProfile;
      }

      setProfile(p);
      storageService.saveProfile(p);

      // If user has not completed onboarding, halt here so they are routed to OnboardingFlow!
      if (!p.onboardingCompleted) {
        setSyllabus([]);
        setGaps([]);
        setAcademicRecords([]);
        setTimetable([]);
        setTests([]);
        storageService.saveSyllabus([]);
        storageService.saveLearningGaps([]);
        storageService.saveAcademicRecords([]);
        storageService.saveTimetable([]);
        storageService.saveTests([]);
        setNeedsSyllabusUpload(false);
        return;
      }

      // Fetch user specific academic data for returning onboarded user
      const [userSyllabus, userGaps, userRecords, userTimetable] = await Promise.all([
        supabaseDataService.getSyllabusTopics(userId),
        supabaseDataService.getLearningGaps(userId),
        supabaseDataService.getAcademicRecords(userId),
        supabaseDataService.getTimetable(userId)
      ]);

      if (userSyllabus.length > 0) {
        setSyllabus(userSyllabus);
        storageService.saveSyllabus(userSyllabus);
        setNeedsSyllabusUpload(false);
      } else {
        const localSyl = storageService.getSyllabus();
        if (localSyl && localSyl.length > 0) {
          setSyllabus(localSyl);
        }
        // Do not force syllabus upload on routine load; allow user to enter dashboard
        setNeedsSyllabusUpload(false);
      }

      if (userGaps.length > 0) {
        setGaps(userGaps);
        storageService.saveLearningGaps(userGaps);
      }

      if (userRecords.length > 0) {
        setAcademicRecords(userRecords);
        storageService.saveAcademicRecords(userRecords);
      }

      if (userTimetable.length > 0) {
        setTimetable(userTimetable);
        storageService.saveTimetable(userTimetable);
      }
    } catch (e) {
      console.warn('Error syncing real Supabase user data:', e);
    }
  };

  // Auth Lifecycle listener
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const session = await authService.getSession();
        const savedDemo = localStorage.getItem('mba_demo_mode');
        if (savedDemo === 'true') {
          setIsDemoMode(true);
          setAuthUser(null);
          return;
        }
        if (session?.user && mounted) {
          const u: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email
          };
          setAuthUser(u);
          setIsDemoMode(false);
          await loadUserData(u.id);
        }
      } catch (e) {
        console.warn('Auth check error:', e);
      } finally {
        if (mounted) setAuthChecking(false);
      }
    };

    checkSession();

    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (!mounted) return;
      const currentDemo = localStorage.getItem('mba_demo_mode');
      if (currentDemo === 'true') {
        // In demo mode - do not switch to authenticated user automatically
        return;
      }
      if (user) {
        setAuthUser(user);
        setIsDemoMode(false);
        localStorage.setItem('mba_demo_mode', 'false');
        await loadUserData(user.id);
      } else {
        setAuthUser(null);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleAuthSuccess = async (user: AuthUser) => {
    setAuthUser(user);
    setIsDemoMode(false);
    localStorage.setItem('mba_demo_mode', 'false');
    setNeedsSyllabusUpload(false);

    const existing = await supabaseDataService.getProfile(user.id);
    const localProfile = storageService.getProfile();
    // Only trust localProfile if it specifically belongs to this authenticated user
    const matchingLocal = localProfile && (localProfile.id === user.id || localProfile.email === user.email) ? localProfile : null;

    let p: StudentProfile;

    if (existing) {
      // Returning user from Supabase database
      p = existing;
    } else if (matchingLocal) {
      // Local profile matching this specific user
      p = matchingLocal;
    } else {
      // Brand new user!
      p = {
        id: user.id,
        name: user.name || 'Scholar',
        email: user.email,
        degree: 'B.Tech Computer Science',
        department: 'Computer Science',
        semester: 1,
        cgpa: 0.0,
        targetCgpa: 9.0,
        streakDays: 1,
        totalXp: 0,
        level: 1,
        joinedDate: new Date().toISOString().slice(0, 10),
        onboardingCompleted: false, // Brand new user must go through onboarding!
        onboardingStep: 1,
        syllabusUploaded: false
      };
      await supabaseDataService.saveProfile(p);
      setSyllabus([]);
      setGaps([]);
      setAcademicRecords([]);
      setTimetable([]);
      setTests([]);
      storageService.saveSyllabus([]);
      storageService.saveLearningGaps([]);
      storageService.saveAcademicRecords([]);
      storageService.saveTimetable([]);
      storageService.saveTests([]);
    }

    setProfile(p);
    storageService.saveProfile(p);

    if (p.onboardingCompleted) {
      await loadUserData(user.id);
    }
  };

  const handleOnboardingComplete = async (
    answers: OnboardingAnswers,
    memorySummary: MemorySummary
  ) => {
    if (!authUser) return;
    sound.playSuccess();

    const updatedProfile: StudentProfile = {
      ...profile,
      name: answers.name || profile.name,
      college: answers.college,
      course: answers.course,
      degree: answers.course,
      department: answers.course,
      specialization: answers.specialization,
      semester: answers.semester,
      cgpa: answers.cgpa,
      targetCgpa: answers.targetCgpa,
      onboardingCompleted: true,
      onboardingStep: 12,
      memorySummary
    };

    setProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);

    await supabaseDataService.completeOnboarding(authUser.id, answers, memorySummary);

    // After conversational Q&A, transition directly to syllabus upload/review
    setNeedsSyllabusUpload(true);
  };

  const handleSyllabusComplete = async (
    topics: SyllabusTopic[],
    newGaps: LearningGap[]
  ) => {
    sound.playSuccess();
    setSyllabus(topics);
    setGaps(newGaps);
    storageService.saveSyllabus(topics);
    storageService.saveLearningGaps(newGaps);

    const updatedProfile: StudentProfile = {
      ...profile,
      syllabusUploaded: true
    };
    setProfile(updatedProfile);
    storageService.saveProfile(updatedProfile);

    if (authUser) {
      await supabaseDataService.saveSyllabusTopics(authUser.id, topics);
      await supabaseDataService.saveLearningGaps(authUser.id, newGaps);
      await supabaseDataService.saveProfile(updatedProfile);
    }

    setNeedsSyllabusUpload(false);
    setActiveTab('dashboard');
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setAuthUser(null);
    setIsDemoMode(false);
    localStorage.removeItem('mba_demo_mode');
    localStorage.removeItem('mba_student_profile');
    sound.playClick();
  };

  const handleContinueDemo = () => {
    setIsDemoMode(true);
    localStorage.setItem('mba_demo_mode', 'true');
    setAuthUser(null);
    setProfile(storageService.getDemoProfile());
    setAcademicRecords(storageService.getDemoAcademicRecords());
    setGaps(storageService.getDemoLearningGaps());
    setSyllabus(storageService.getDemoSyllabus());
    setTimetable(storageService.getDemoTimetable());
    setTests(storageService.getDemoTests());
    setAchievements(storageService.getDemoAchievements());
    setAuditLog(storageService.getDemoAuditLog());
    sound.playClick();
  };

  const handleNavigate = (tab: string, extra?: { topic?: string }) => {
    setActiveTab(tab);
    if (extra?.topic) {
      setTargetTopic(extra.topic);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetDemo = () => {
    storageService.resetToDemo();
    setProfile(storageService.getDemoProfile());
    setAcademicRecords(storageService.getDemoAcademicRecords());
    setGaps(storageService.getDemoLearningGaps());
    setSyllabus(storageService.getDemoSyllabus());
    setTimetable(storageService.getDemoTimetable());
    setTests(storageService.getDemoTests());
    setAchievements(storageService.getDemoAchievements());
    setAuditLog(storageService.getDemoAuditLog());
    setActiveTab('dashboard');
  };

  const handleToggleBlockComplete = (blockId: string) => {
    const updated = timetable.map((b) => (b.id === blockId ? { ...b, completed: !b.completed } : b));
    setTimetable(updated);
    storageService.saveTimetable(updated);
    if (authUser) {
      supabaseDataService.saveTimetable(authUser.id, updated);
    }
  };

  const handleAddAcademicRecord = (record: AcademicRecord) => {
    const updated = [record, ...academicRecords];
    setAcademicRecords(updated);
    storageService.saveAcademicRecords(updated);
    if (authUser) {
      supabaseDataService.saveAcademicRecord(authUser.id, record);
    }
  };

  const handleScheduleAdapted = (
    newTimetable: TimetableBlock[],
    newAudit: AdaptiveAuditEntry
  ) => {
    setTimetable(newTimetable);
    setAuditLog([newAudit, ...auditLog]);
    storageService.saveTimetable(newTimetable);
    if (authUser) {
      supabaseDataService.saveTimetable(authUser.id, newTimetable);
    }
  };

  const handleTestComplete = (
    attempt: TestAttempt,
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
    if (authUser) {
      supabaseDataService.saveTestAttempt(authUser.id, attempt);
    }
  };

  const handleUpdateProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    storageService.saveProfile(newProfile);
    if (authUser) {
      supabaseDataService.saveProfile(newProfile);
    }
  };

  const handleUpdateAISettings = (newSettings: AISettings) => {
    setAISettings(newSettings);
    storageService.saveAISettings(newSettings);
  };

  // 1. Initial Authentication Check Loader
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center font-body">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/20 flex items-center justify-center animate-pulse">
            <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
          </div>
          <p className="text-xs font-mono text-slate-400">Initializing MindBridge Intelligence Engine...</p>
        </div>
      </div>
    );
  }

  const currentTheme: AtmosphereTheme = aiSettings.theme || 'dusk';

  // Shared Dynamic Atmospheric Background Component for Auth, Onboarding, Upload & Workspace
  const renderAtmosphereBackground = () => {
    const renderThemeOrbs = () => {
      switch (currentTheme) {
        case 'nebula':
          return (
            <>
              <div className="dynamic-chromatic-mesh absolute inset-0 opacity-80 pointer-events-none" />
              <div className="aurora-orb-violet -top-[140px] left-[5%] opacity-75" />
              <div className="aurora-orb-cyan top-[20%] -right-[120px] opacity-75" />
              <div className="aurora-orb-magenta -bottom-[120px] left-[15%] opacity-70" />
              <div className="aurora-orb-emerald top-[48%] left-[28%] opacity-65" />
              <div className="aurora-orb-amber -top-[80px] right-[18%] opacity-65" />
            </>
          );
        case 'cyberpunk':
          return (
            <>
              <div className="cyberpunk-chromatic-mesh absolute inset-0 opacity-85 pointer-events-none" />
              <div className="cyberpunk-orb-emerald -top-[130px] left-[8%] opacity-80" />
              <div className="cyberpunk-orb-lime top-[22%] -right-[100px] opacity-75" />
              <div className="cyberpunk-orb-cyan -bottom-[120px] left-[15%] opacity-70" />
              <div className="cyberpunk-orb-acid top-[48%] left-[26%] opacity-65" />
            </>
          );
        case 'supernova':
          return (
            <>
              <div className="supernova-chromatic-mesh absolute inset-0 opacity-85 pointer-events-none" />
              <div className="supernova-orb-crimson -top-[130px] left-[10%] opacity-85" />
              <div className="supernova-orb-ruby top-[20%] -right-[100px] opacity-80" />
              <div className="supernova-orb-orange -bottom-[120px] left-[15%] opacity-75" />
              <div className="supernova-orb-gold top-[46%] left-[25%] opacity-70" />
            </>
          );
        case 'ocean_abyss':
          return (
            <>
              <div className="ocean-chromatic-mesh absolute inset-0 opacity-85 pointer-events-none" />
              <div className="ocean-orb-aqua -top-[130px] left-[8%] opacity-80" />
              <div className="ocean-orb-sapphire top-[22%] -right-[100px] opacity-75" />
              <div className="ocean-orb-teal -bottom-[120px] left-[15%] opacity-70" />
              <div className="ocean-orb-cyan top-[48%] left-[26%] opacity-65" />
            </>
          );
        case 'cherry_blossom':
          return (
            <>
              <div className="sakura-chromatic-mesh absolute inset-0 opacity-85 pointer-events-none" />
              <div className="sakura-orb-rose -top-[130px] left-[10%] opacity-85" />
              <div className="sakura-orb-pink top-[20%] -right-[100px] opacity-80" />
              <div className="sakura-orb-peach -bottom-[120px] left-[15%] opacity-75" />
              <div className="sakura-orb-lilac top-[46%] left-[25%] opacity-70" />
            </>
          );
        case 'aurora_borealis':
          return (
            <>
              <div className="arctic-chromatic-mesh absolute inset-0 opacity-85 pointer-events-none" />
              <div className="arctic-orb-mint -top-[130px] left-[8%] opacity-80" />
              <div className="arctic-orb-teal top-[22%] -right-[100px] opacity-75" />
              <div className="arctic-orb-cyan -bottom-[120px] left-[15%] opacity-70" />
              <div className="arctic-orb-jade top-[48%] left-[26%] opacity-65" />
            </>
          );
        case 'royal_amethyst':
          return (
            <>
              <div className="amethyst-chromatic-mesh absolute inset-0 opacity-85 pointer-events-none" />
              <div className="amethyst-orb-velvet -top-[130px] left-[10%] opacity-85" />
              <div className="amethyst-orb-lavender top-[20%] -right-[100px] opacity-80" />
              <div className="amethyst-orb-plum -bottom-[120px] left-[15%] opacity-75" />
              <div className="amethyst-orb-indigo top-[46%] left-[25%] opacity-70" />
            </>
          );
        case 'electric_amber':
          return (
            <>
              <div className="amber-chromatic-mesh absolute inset-0 opacity-85 pointer-events-none" />
              <div className="amber-orb-honey -top-[130px] left-[10%] opacity-85" />
              <div className="amber-orb-gold top-[20%] -right-[100px] opacity-80" />
              <div className="amber-orb-sunburst -bottom-[120px] left-[15%] opacity-75" />
              <div className="amber-orb-copper top-[46%] left-[25%] opacity-70" />
            </>
          );
        case 'midnight_synthwave':
          return (
            <>
              <div className="synthwave-chromatic-mesh absolute inset-0 opacity-85 pointer-events-none" />
              <div className="synthwave-orb-fuchsia -top-[130px] left-[10%] opacity-85" />
              <div className="synthwave-orb-blue top-[20%] -right-[100px] opacity-80" />
              <div className="synthwave-orb-violet -bottom-[120px] left-[15%] opacity-75" />
              <div className="synthwave-orb-coral top-[46%] left-[25%] opacity-70" />
            </>
          );
        case 'dusk':
        default:
          return (
            <>
              {/* Dusk Flowing Chromatic Mesh: Sunset Sky merging into Cosmic Twilight */}
              <div className="dusk-chromatic-mesh absolute inset-0 opacity-85 pointer-events-none" />
              <div className="dusk-sun-orb -top-[120px] left-[10%] opacity-80" />
              <div className="dusk-horizon-rose top-[18%] -right-[100px] opacity-75" />
              <div className="dusk-nebula-violet -bottom-[120px] left-[15%] opacity-70" />
              <div className="dusk-solar-gold top-[45%] left-[25%] opacity-65" />
              <div className="dusk-cosmic-indigo -top-[80px] right-[20%] opacity-65" />
            </>
          );
      }
    };

    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-700">
        {renderThemeOrbs()}

        {/* Atmospheric Contrast Vignette (Preserves Deep Contrast for Razor-Sharp Text while letting bright colors glow) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,4,9,0.30)_75%,rgba(2,4,9,0.72)_100%)] pointer-events-none" />

        {/* Luminous Interactive Dynamic Particles with Matching Theme Palette Floating On Top */}
        <ParticleBackground theme={currentTheme} />
      </div>
    );
  };

  // 2. Unauthenticated and Not in Demo Mode -> Render Real Auth Portal
  if (!isDemoMode && !authUser) {
    return (
      <div className="min-h-screen bg-[#020409] text-[#F5F5F7] relative flex flex-col font-body selection:bg-purple-500/30 selection:text-white">
        {renderAtmosphereBackground()}
        <AuthPortal
          theme={currentTheme}
          onSelectTheme={(newTheme) => handleUpdateAISettings({ ...aiSettings, theme: newTheme })}
          onSuccess={handleAuthSuccess}
          onContinueDemo={handleContinueDemo}
        />
      </div>
    );
  }

  // 3. Authenticated New User -> Render Conversational Onboarding Flow
  if (authUser && !profile.onboardingCompleted) {
    return (
      <div className="min-h-screen bg-[#020409] text-[#F5F5F7] relative flex flex-col font-body selection:bg-purple-500/30 selection:text-white">
        {renderAtmosphereBackground()}
        <div className="relative z-10 flex-1 flex flex-col w-full">
          <OnboardingFlow
            userId={authUser.id}
            theme={currentTheme}
            initialAnswers={{
              name: profile.name && profile.name !== 'Scholar' ? profile.name : (authUser.name && authUser.name !== authUser.email ? authUser.name : ''),
              college: profile.college,
              course: profile.course || profile.degree,
              specialization: profile.specialization,
              semester: profile.semester || 1,
              cgpa: profile.cgpa || 0,
              targetCgpa: profile.targetCgpa || 9.0
            }}
            initialStep={profile.onboardingStep && profile.onboardingStep < 12 ? profile.onboardingStep : 1}
            onComplete={handleOnboardingComplete}
          />
        </div>
      </div>
    );
  }

  // 4. Authenticated User without Syllabus -> Render Document Upload & Extraction View
  if (authUser && needsSyllabusUpload) {
    return (
      <div className="min-h-screen bg-[#020409] text-[#F5F5F7] relative flex flex-col font-body selection:bg-purple-500/30 selection:text-white">
        {renderAtmosphereBackground()}
        <div className="relative z-10 flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          <SyllabusUploadView
            userId={authUser.id}
            onboardingAnswers={{
              name: profile.name,
              college: profile.college || 'University',
              course: profile.course || profile.degree,
              specialization: profile.specialization || 'Computer Science',
              semester: profile.semester || 1,
              cgpa: profile.cgpa || 0,
              targetCgpa: profile.targetCgpa || 9.0,
              subjects: [profile.degree || 'Database Management Systems'],
              dailyStudyHours: 3,
              preferredStudyTime: 'Morning',
              difficultTopics: profile.memorySummary?.difficultTopics || [],
              explanationStyle: profile.memorySummary?.learningStyle || 'Conceptual'
            }}
            onComplete={handleSyllabusComplete}
            onSkip={() => {
              setNeedsSyllabusUpload(false);
              setActiveTab('dashboard');
            }}
          />
        </div>
      </div>
    );
  }

  // 5. Main Dashboard & Workspace (Preserves all 10 pages and current layout)
  return (
    <div className="min-h-screen bg-[#020409] text-[#F5F5F7] flex flex-col relative selection:bg-white/20 selection:text-white font-body">
      
      {/* Dynamic Moving Particles & Glowing Chromatic Canvas (Sunlight Dusk vs Cosmic Nebula) */}
      {renderAtmosphereBackground()}

      {/* Real Snell's Law SVG Displacement Map Filter */}
      <svg className="hidden">
        <defs>
          <filter id="liquid-glass-lens-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Unified Floating Apple Liquid Glass Dynamic Header */}
      <UnifiedNavbar
        profile={profile}
        gaps={gaps}
        aiSettings={aiSettings}
        activeTab={activeTab}
        isDemoMode={isDemoMode}
        onNavigate={handleNavigate}
        onUpdateSettings={handleUpdateAISettings}
        onResetDemo={handleResetDemo}
        onOpenWorkloadModal={() => setIsWorkloadModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenAuth={() => setIsDemoMode(false)}
      />

      {/* Symmetrical Centered Viewport Container (Phone-Friendly Spacing) */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 pb-[calc(env(safe-area-inset-bottom,0px)+6.5rem)] md:pb-16">
        <main className="w-full">
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

          {activeTab === 'calendar' && (
            <AcademicCalendar
              profile={profile}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'community' && (
            <CommunityHub
              profile={profile}
              gaps={gaps}
              onNavigate={handleNavigate}
              onUpdateProfile={handleUpdateProfile}
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
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsProfile
              profile={profile}
              aiSettings={aiSettings}
              onUpdateProfile={handleUpdateProfile}
              onUpdateAISettings={handleUpdateAISettings}
              onSignOut={handleSignOut}
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
