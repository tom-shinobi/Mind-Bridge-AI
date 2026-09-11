import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Compass,
  Sun,
  Moon,
  School,
  GraduationCap,
  BookOpen,
  Award,
  Flame,
  Zap,
  Target,
  Brain,
  Code2,
  Cpu,
  Layers,
  User,
  Activity,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { sound } from '../../services/soundService';
import { supabaseDataService } from '../../services/supabaseDataService';
import { storageService } from '../../services/storageService';
import type { OnboardingAnswers, MemorySummary, AtmosphereTheme } from '../../types';

interface OnboardingFlowProps {
  userId: string;
  initialAnswers?: Partial<OnboardingAnswers>;
  initialStep?: number;
  theme?: AtmosphereTheme;
  onComplete: (answers: OnboardingAnswers, memorySummary: MemorySummary) => void;
}

const COMMON_COLLEGES = [
  { name: 'Stanford University', emoji: '🏛️', tag: 'Palo Alto, CA' },
  { name: 'MIT', emoji: '🔬', tag: 'Cambridge, MA' },
  { name: 'UC Berkeley', emoji: '🌲', tag: 'Berkeley, CA' },
  { name: 'Indian Institute of Technology (IIT)', emoji: '🎓', tag: 'National Flagship' },
  { name: 'National Institute of Technology (NIT)', emoji: '⚡', tag: 'Premier Tech' },
  { name: 'Carnegie Mellon University (CMU)', emoji: '🤖', tag: 'Pittsburgh, PA' },
  { name: 'University of Washington', emoji: '🌊', tag: 'Seattle, WA' },
  { name: 'Anna University', emoji: '📚', tag: 'Chennai, India' }
];

const COURSES = [
  { name: 'B.Tech / B.E. Computer Science', code: 'CS', icon: Code2, desc: 'Algorithms, OS, Cloud Systems & Software Architectures' },
  { name: 'B.S. Artificial Intelligence & Data Science', code: 'AI/DS', icon: Cpu, desc: 'Neural Networks, Machine Learning & Probabilistic Models' },
  { name: 'B.S. Software Engineering', code: 'SE', icon: Layers, desc: 'Distributed Systems, Cloud Native & Modern DevOps' },
  { name: 'M.S. Computer Science', code: 'MS-CS', icon: GraduationCap, desc: 'Advanced Research, Asymptotic Rigor & Deep Systems' },
  { name: 'BCA / MCA Applications', code: 'MCA', icon: BookOpen, desc: 'Enterprise Systems, Database Engines & Web Engineering' },
  { name: 'Information Technology', code: 'IT', icon: Activity, desc: 'Networking, Cyber Infrastructure & System Reliability' }
];

const SPECIALIZATIONS = [
  { name: 'Artificial Intelligence & Machine Learning', icon: Brain, badge: 'High Demand', desc: 'LLMs, transformers, neural networks & computer vision' },
  { name: 'Systems, OS & Cloud Infrastructure', icon: Layers, badge: 'Core', desc: 'Kernel design, distributed consensus, Docker & Kubernetes' },
  { name: 'Database Systems & Data Engineering', icon: Activity, badge: 'Scalability', desc: 'Relational query optimization, B-Trees & warehouse pipelines' },
  { name: 'Cybersecurity & Cryptography', icon: ShieldCheck, badge: 'Defense', desc: 'Zero-trust networks, protocol security & pen-testing' },
  { name: 'Core Computer Science & Algorithms', icon: Cpu, badge: 'Foundations', desc: 'Dynamic programming, graph theory & NP-completeness' },
  { name: 'Full-Stack & Web Technologies', icon: Code2, badge: 'Product Focus', desc: 'Reactive state trees, high-speed APIs & client architectures' }
];

const SEMESTERS = [
  { sem: 1, roman: 'I', year: 'Freshman', term: 'Year 1' },
  { sem: 2, roman: 'II', year: 'Freshman', term: 'Year 1' },
  { sem: 3, roman: 'III', year: 'Sophomore', term: 'Year 2' },
  { sem: 4, roman: 'IV', year: 'Sophomore', term: 'Year 2' },
  { sem: 5, roman: 'V', year: 'Junior', term: 'Year 3' },
  { sem: 6, roman: 'VI', year: 'Junior', term: 'Year 3' },
  { sem: 7, roman: 'VII', year: 'Senior', term: 'Year 4' },
  { sem: 8, roman: 'VIII', year: 'Senior', term: 'Year 4' }
];

const COMMON_SUBJECTS = [
  { name: 'Database Management Systems', icon: '🗄️', category: 'Systems' },
  { name: 'Operating Systems', icon: '⚙️', category: 'Systems' },
  { name: 'Data Structures & Algorithms', icon: '🌳', category: 'Core' },
  { name: 'Computer Networks', icon: '🌐', category: 'Networks' },
  { name: 'Machine Learning', icon: '🧠', category: 'AI' },
  { name: 'Software Engineering', icon: '🏗️', category: 'Software' },
  { name: 'Compiler Design', icon: '⚡', category: 'Theory' },
  { name: 'Discrete Mathematics', icon: '📐', category: 'Math' }
];

const COMMON_DIFFICULT_TOPICS = [
  { name: 'B-Trees & B+ Tree Indexing', category: 'DBMS', tag: 'High Exam Frequency' },
  { name: 'Dynamic Programming State Transitions', category: 'DSA', tag: 'Interview Classic' },
  { name: 'Virtual Memory & Page Replacement', category: 'OS', tag: 'Tricky Edge Cases' },
  { name: 'TCP Congestion Control & Windowing', category: 'Networks', tag: 'Protocol Invariants' },
  { name: 'Relational Normalization (BCNF & 3NF)', category: 'DBMS', tag: 'Functional Rules' },
  { name: 'Backpropagation & Loss Gradients', category: 'ML', tag: 'Calculus Bounds' },
  { name: 'Deadlock Detection & Banker Algorithm', category: 'OS', tag: 'Resource Graph' }
];

const STUDY_HOURS = [
  { hours: 1.5, label: '1 - 2 Hours', yield: '~10.5 hrs/week', desc: 'Light & consistent pacing. Great for maintaining current marks without fatigue.', icon: Zap },
  { hours: 2.5, label: '2 - 3 Hours', yield: '~17.5 hrs/week', desc: 'Balanced focus schedule. Optimal mix of deep theory, revision and testing.', badge: 'Recommended', icon: Target },
  { hours: 3.5, label: '3 - 4 Hours', yield: '~24.5 hrs/week', desc: 'Deep work & mastery. Tailored for Dean\'s List aspirants and exam dominance.', icon: Flame },
  { hours: 5.0, label: '4+ Hours', yield: '~35+ hrs/week', desc: 'Intensive academic sprint. Maximum immersion for placements and competitions.', icon: Award }
];

const STUDY_TIMES = [
  { id: 'morning', label: 'Early Morning', time: '6:00 AM - 10:00 AM', desc: 'High cognitive sharpness, zero ambient distractions', icon: Sun, gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 4:00 PM', desc: 'Post-lecture focus blocks & practical lab execution', icon: Compass, gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-cyan-500/30' },
  { id: 'evening', label: 'Evening', time: '5:00 PM - 9:00 PM', desc: 'Prime daily revision, problem sets & concept consolidation', icon: SunsetIcon, gradient: 'from-rose-500/20 to-purple-500/20', border: 'border-rose-500/30' },
  { id: 'night', label: 'Late Night', time: '10:00 PM - 2:00 AM', desc: 'Quiet deep-focus night owl flow with continuous momentum', icon: Moon, gradient: 'from-indigo-500/20 to-violet-500/20', border: 'border-indigo-500/30' }
];

const EXPLANATION_STYLES = [
  {
    id: 'intuitive_visual',
    title: 'Intuitive Analogies & Visual Logic',
    desc: 'Real-world physical metaphors and visual architecture maps before mathematical notation.',
    badge: 'Recommended',
    icon: Sparkles
  },
  {
    id: 'mathematical_formal',
    title: 'Step-by-Step Formal Rigor',
    desc: 'Rigorous definitions, theorem proofs, asymptotic complexity bounds, and exhaustive invariant conditions.',
    badge: 'Deep Theory',
    icon: Target
  },
  {
    id: 'code_first',
    title: 'Hands-on Code & Implementations',
    desc: 'TypeScript/Python algorithms, runnable data structures, and practical implementation walkthroughs.',
    badge: 'Practical',
    icon: Code2
  },
  {
    id: 'concise_bullet',
    title: 'Concise Bullet Summaries & Cheat Sheets',
    desc: 'High-density takeaways, formula sheets, key exam pitfalls, and rapid memory anchors.',
    badge: 'Exam Focused',
    icon: BookOpen
  }
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  userId,
  initialAnswers,
  initialStep = 1,
  theme: propTheme,
  onComplete
}) => {
  const activeTheme = propTheme || storageService.getAISettings().theme || 'dusk';
  const [currentStep, setCurrentStep] = useState<number>(initialStep || 1);
  const totalSteps = 12;

  // Answers State
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    name: initialAnswers?.name || '',
    college: initialAnswers?.college || '',
    course: initialAnswers?.course || COURSES[0].name,
    specialization: initialAnswers?.specialization || SPECIALIZATIONS[0].name,
    semester: initialAnswers?.semester || 6,
    cgpa: initialAnswers?.cgpa || 8.4,
    targetCgpa: initialAnswers?.targetCgpa || 9.0,
    subjects: initialAnswers?.subjects && initialAnswers.subjects.length > 0 ? initialAnswers.subjects : ['Database Management Systems', 'Operating Systems', 'Data Structures & Algorithms'],
    dailyStudyHours: initialAnswers?.dailyStudyHours || 3.0,
    preferredStudyTime: initialAnswers?.preferredStudyTime || 'Evening (5:00 PM - 9:00 PM)',
    difficultTopics: initialAnswers?.difficultTopics && initialAnswers.difficultTopics.length > 0 ? initialAnswers.difficultTopics : ['B-Trees & B+ Tree Indexing'],
    explanationStyle: initialAnswers?.explanationStyle || 'Intuitive Analogies & Visual Logic'
  });

  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [customDifficultInput, setCustomDifficultInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Autosave progress on step change
  useEffect(() => {
    if (userId) {
      supabaseDataService.saveOnboardingStep(userId, currentStep, answers);
    }
  }, [currentStep, answers, userId]);

  const handleNext = async () => {
    sound.playClick();
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Completed onboarding!
      setIsSaving(true);
      const memorySummary: MemorySummary = {
        learningStyle: answers.explanationStyle,
        currentFocus: answers.difficultTopics[0] || `${answers.subjects[0] || 'Core Modules'} Diagnostics`,
        academicGoal: `Target ${answers.targetCgpa.toFixed(2)} CGPA in ${answers.course} (Semester ${answers.semester})`,
        studyPreferences: `${answers.dailyStudyHours} hrs daily, preferring ${answers.preferredStudyTime}`,
        difficultTopics: answers.difficultTopics,
        strengths: answers.subjects.filter((s) => !answers.difficultTopics.includes(s)),
        notes: `Student at ${answers.college || 'University'} pursuing ${answers.specialization}.`,
        lastUpdated: new Date().toISOString().slice(0, 10)
      };

      await supabaseDataService.completeOnboarding(userId, answers, memorySummary);
      setIsSaving(false);
      sound.playSuccess();
      onComplete(answers, memorySummary);
    }
  };

  const handleBack = () => {
    sound.playClick();
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const jumpToStep = (stepNumber: number) => {
    if (stepNumber <= currentStep) {
      sound.playClick();
      setCurrentStep(stepNumber);
    }
  };

  const toggleSubject = (sub: string) => {
    sound.playClick();
    setAnswers((prev) => {
      const exists = prev.subjects.includes(sub);
      const updated = exists ? prev.subjects.filter((s) => s !== sub) : [...prev.subjects, sub];
      return { ...prev, subjects: updated };
    });
  };

  const addCustomSubject = () => {
    if (!customSubjectInput.trim()) return;
    sound.playClick();
    if (!answers.subjects.includes(customSubjectInput.trim())) {
      setAnswers((prev) => ({ ...prev, subjects: [...prev.subjects, customSubjectInput.trim()] }));
    }
    setCustomSubjectInput('');
  };

  const toggleDifficultTopic = (topic: string) => {
    sound.playClick();
    setAnswers((prev) => {
      const exists = prev.difficultTopics.includes(topic);
      const updated = exists ? prev.difficultTopics.filter((t) => t !== topic) : [...prev.difficultTopics, topic];
      return { ...prev, difficultTopics: updated };
    });
  };

  const addCustomDifficultTopic = () => {
    if (!customDifficultInput.trim()) return;
    sound.playClick();
    if (!answers.difficultTopics.includes(customDifficultInput.trim())) {
      setAnswers((prev) => ({ ...prev, difficultTopics: [...prev.difficultTopics, customDifficultInput.trim()] }));
    }
    setCustomDifficultInput('');
  };

  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  // Phase categorization
  const getPhaseInfo = () => {
    if (currentStep <= 2) return { number: '1/5', name: 'Student Persona & Campus', icon: User, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    if (currentStep <= 5) return { number: '2/5', name: 'Degree & Timeline', icon: GraduationCap, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
    if (currentStep <= 7) return { number: '3/5', name: 'CGPA & Performance Goals', icon: Award, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    if (currentStep === 8 || currentStep === 11) return { number: '4/5', name: 'Curriculum & Friction Areas', icon: Brain, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
    return { number: '5/5', name: 'Study Habit & Pedagogy', icon: Sparkles, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' };
  };

  const phase = getPhaseInfo();

  // CGPA Tier evaluator
  const getCgpaBadge = (val: number) => {
    if (val >= 9.0) return { label: '🌟 High Distinction / Dean\'s List', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' };
    if (val >= 8.0) return { label: '🚀 First Class with Distinction', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' };
    if (val >= 7.0) return { label: '📈 Solid Academic Baseline', color: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30' };
    return { label: '🎯 High Growth Acceleration Mode', color: 'text-pink-300 bg-pink-500/15 border-pink-500/30' };
  };

  const cgpaDelta = answers.targetCgpa - answers.cgpa;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-10 relative">
      
      {/* Ambient Accent Radial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-purple-600/15 via-pink-600/10 to-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="relative z-10 max-w-3xl w-full space-y-5 animate-fade-in">
        
        {/* Top Liquid Glass HUD Bar */}
        <div className="apple-liquid-glass p-3.5 sm:p-4 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Brand & Phase Capsule */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#020409]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight">MindBridge Intelligence</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${phase.color}`}>
                  Phase {phase.number}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">{phase.name}</p>
            </div>
          </div>

          {/* Progress Metrics & Dot Matrix */}
          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
              <span className="text-xs font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-[11px] font-mono text-slate-400">({progressPercent}%)</span>
            </div>

            {/* Neon Gradient Progress Bar */}
            <div className="w-full sm:w-48 h-2 rounded-full bg-white/10 overflow-hidden border border-white/15 relative p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeTheme === 'dusk'
                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                    : 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Interactive Dot Matrix (Click earlier steps to navigate back) */}
            <div className="hidden sm:flex items-center gap-1.5 pt-0.5">
              {Array.from({ length: totalSteps }).map((_, i) => {
                const stepIdx = i + 1;
                const isPassed = stepIdx < currentStep;
                const isCurrent = stepIdx === currentStep;
                return (
                  <button
                    key={stepIdx}
                    type="button"
                    disabled={!isPassed}
                    onClick={() => jumpToStep(stepIdx)}
                    title={`Step ${stepIdx}`}
                    className={`h-1.5 rounded-full transition-all ${
                      isCurrent
                        ? 'w-4 bg-white shadow-[0_0_8px_white]'
                        : isPassed
                        ? 'w-2 bg-purple-400 hover:bg-purple-300 cursor-pointer'
                        : 'w-1.5 bg-white/20 cursor-default'
                    }`}
                  />
                );
              })}
            </div>
          </div>

        </div>

        {/* Main Interactive Question Card */}
        <div className="apple-liquid-glass p-5 sm:p-8 lg:p-9 rounded-3xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl space-y-6 relative overflow-hidden">
          
          {/* Subtle Glass Shimmer Effect in Card Corner */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* AI Dialogue Banner & Step Title */}
          <div className="flex items-start gap-4">
            
            {/* 3D Holographic AI Tutor Avatar */}
            <div className="relative flex-shrink-0 mt-0.5">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 rounded-2xl blur-md opacity-70 animate-pulse" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/30 via-slate-900/90 to-pink-500/30 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
                <Bot className="w-6 h-6 animate-pulse text-purple-200" />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#020409]" />
              </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-amber-200 font-bold">
                  MindBridge AI Tutor • Persona Setup
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-300 border border-white/10">
                  Adaptive Engine
                </span>
              </div>

              {/* Step Title Header */}
              {currentStep === 1 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  Welcome to MindBridge! What should I call you?
                </h3>
              )}
              {currentStep === 2 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  What university or college do you study at?
                </h3>
              )}
              {currentStep === 3 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  What degree or academic program are you pursuing?
                </h3>
              )}
              {currentStep === 4 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  What is your primary academic specialization?
                </h3>
              )}
              {currentStep === 5 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  Which semester are you currently attending?
                </h3>
              )}
              {currentStep === 6 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  What is your current cumulative CGPA?
                </h3>
              )}
              {currentStep === 7 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  What is your target CGPA this semester?
                </h3>
              )}
              {currentStep === 8 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  What subjects are you taking right now?
                </h3>
              )}
              {currentStep === 9 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  How many hours can you realistically study each day?
                </h3>
              )}
              {currentStep === 10 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  When do you feel most focused and productive?
                </h3>
              )}
              {currentStep === 11 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  What specific topics do you currently find challenging?
                </h3>
              )}
              {currentStep === 12 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  What type of explanations help you learn fastest?
                </h3>
              )}
            </div>
          </div>

          {/* Dynamic Interactive Input Components */}
          <div className="pt-2">
            
            {/* Step 1: Student Name */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    autoFocus
                    value={answers.name}
                    onChange={(e) => setAnswers({ ...answers, name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && answers.name.trim() && handleNext()}
                    placeholder="Enter your full name or preferred name..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.06] border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 text-base sm:text-sm font-medium shadow-inner transition-all backdrop-blur-md"
                  />
                </div>

                {answers.name.trim() ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-transparent border border-purple-500/30 flex items-center gap-2.5 animate-fade-in">
                    <Sparkles className="w-4 h-4 text-purple-300 flex-shrink-0" />
                    <p className="text-xs text-purple-200">
                      Great to have you here, <span className="font-bold text-white">{answers.name.trim()}</span>! We'll personalize your learning profile to this name.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 font-mono">
                    MindBridge uses your name to address you across tutoring sessions, diagnostic reports, and timetable reminders.
                  </p>
                )}
              </div>
            )}

            {/* Step 2: College / University */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cyan-400">
                    <School className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    autoFocus
                    value={answers.college}
                    onChange={(e) => setAnswers({ ...answers, college: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && answers.college.trim() && handleNext()}
                    placeholder="Enter your university or institution name..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.06] border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-base sm:text-sm font-medium shadow-inner transition-all backdrop-blur-md"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                      Popular Institutions (Click to auto-select):
                    </span>
                    {answers.college && (
                      <span className="text-[11px] font-mono text-cyan-300">Selected</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {COMMON_COLLEGES.map((c, i) => {
                      const isSelected = answers.college === c.name;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setAnswers({ ...answers, college: c.name });
                          }}
                          className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                              : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base flex-shrink-0">{c.emoji}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate">{c.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono truncate">{c.tag}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-cyan-300 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Course / Degree */}
            {currentStep === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COURSES.map((c, i) => {
                  const Icon = c.icon;
                  const isSelected = answers.course === c.name;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        sound.playClick();
                        setAnswers({ ...answers, course: c.name });
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-gradient-to-br from-purple-600/30 via-pink-600/20 to-purple-900/30 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                          : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40' : 'bg-white/[0.08] text-slate-300'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">
                            {c.code}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-300" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{c.name}</p>
                        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{c.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 4: Specialization */}
            {currentStep === 4 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SPECIALIZATIONS.map((s, i) => {
                  const Icon = s.icon;
                  const isSelected = answers.specialization === s.name;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        sound.playClick();
                        setAnswers({ ...answers, specialization: s.name });
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-purple-600/25 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                          : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-purple-500/30 text-purple-200' : 'bg-white/[0.08] text-slate-300'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white truncate">{s.name}</p>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex-shrink-0">
                              {s.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">{s.desc}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-purple-300 flex-shrink-0 mt-1" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 5: Semester Grid */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SEMESTERS.map((item) => {
                    const isSelected = answers.semester === item.sem;
                    return (
                      <button
                        key={item.sem}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setAnswers({ ...answers, semester: item.sem });
                        }}
                        className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-b from-purple-600/30 to-pink-600/30 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                            : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/[0.08]'
                        }`}
                      >
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">{item.year}</span>
                        <span className="text-xl font-bold font-heading text-white">Sem {item.roman}</span>
                        <span className="text-[10px] text-purple-300 font-mono px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                          {item.term}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-300 text-center font-mono">
                  Currently selected: <span className="text-purple-300 font-bold">Semester {answers.semester}</span>
                </p>
              </div>
            )}

            {/* Step 6: Current Cumulative CGPA */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                  <div>
                    <span className="text-xs font-mono text-slate-300 block">Current Cumulative CGPA</span>
                    <span className="text-[11px] text-slate-400">Measured on standard 10.0 scale</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                      {answers.cgpa.toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-xl border ${getCgpaBadge(answers.cgpa).color}`}>
                      {getCgpaBadge(answers.cgpa).label}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min="4.0"
                    max="10.0"
                    step="0.05"
                    value={answers.cgpa}
                    onChange={(e) => setAnswers({ ...answers, cgpa: parseFloat(e.target.value) })}
                    className="w-full accent-pink-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>4.00</span>
                    <span>6.00</span>
                    <span>8.00</span>
                    <span>10.00</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Quick Jump:</span>
                  {[7.0, 7.5, 8.0, 8.5, 9.0, 9.5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { sound.playClick(); setAnswers({ ...answers, cgpa: val }); }}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all ${
                        answers.cgpa === val
                          ? 'bg-pink-500/30 border-pink-400 text-white'
                          : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {val.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Target CGPA Goal */}
            {currentStep === 7 && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                  <div>
                    <span className="text-xs font-mono text-slate-300 block">Target CGPA Goal</span>
                    <span className="text-[11px] text-slate-400">Target for Semester {answers.semester}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold font-mono text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
                      {answers.targetCgpa.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-xl border bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
                      {cgpaDelta >= 0 ? `+${cgpaDelta.toFixed(2)} Delta Elevation` : 'Baseline'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min="6.0"
                    max="10.0"
                    step="0.05"
                    value={answers.targetCgpa}
                    onChange={(e) => setAnswers({ ...answers, targetCgpa: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>6.00</span>
                    <span>7.50</span>
                    <span>9.00</span>
                    <span>10.00</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                  <Target className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    MindBridge calculates optimal timetable study blocks, spaced repetition intervals, and high-frequency diagnostic test schedules to bridge the gap between your current <span className="font-bold text-white">{answers.cgpa.toFixed(2)}</span> and target <span className="font-bold text-white">{answers.targetCgpa.toFixed(2)}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Step 8: Subjects */}
            {currentStep === 8 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                    Select your active courses ({answers.subjects.length} selected):
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {COMMON_SUBJECTS.map((sub, i) => {
                    const isSelected = answers.subjects.includes(sub.name);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleSubject(sub.name)}
                        className={`text-xs px-3.5 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                            : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/[0.08]'
                        }`}
                      >
                        <span>{sub.icon}</span>
                        <span className="font-medium">{sub.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-300 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Subject */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomSubject()}
                    placeholder="Add any other course or elective code..."
                    className="flex-1 text-xs px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="button"
                    onClick={addCustomSubject}
                    className="btn-apple-glass px-4 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-400" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 9: Realistic Daily Study Hours */}
            {currentStep === 9 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STUDY_HOURS.map((item, i) => {
                  const Icon = item.icon;
                  const isSelected = answers.dailyStudyHours === item.hours;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setAnswers({ ...answers, dailyStudyHours: item.hours });
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/20 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                          : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-purple-500/30 text-purple-200' : 'bg-white/[0.08] text-slate-300'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-white">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                            {item.badge}
                          </span>
                        )}
                        {isSelected && !item.badge && <Check className="w-4 h-4 text-purple-300" />}
                      </div>

                      <div>
                        <span className="text-[11px] font-mono text-purple-300 block font-semibold">{item.yield}</span>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 10: Preferred Study Time */}
            {currentStep === 10 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STUDY_TIMES.map((item, i) => {
                  const Icon = item.icon;
                  const isSelected = answers.preferredStudyTime.includes(item.label);
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        sound.playClick();
                        setAnswers({ ...answers, preferredStudyTime: `${item.label} (${item.time})` });
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? `bg-gradient-to-br ${item.gradient} ${item.border} text-white shadow-xl`
                          : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-white/[0.08] flex items-center justify-center text-white">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{item.label}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{item.time}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 11: Difficult Topics */}
            {currentStep === 11 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wider font-semibold">
                    Select topics where you feel friction ({answers.difficultTopics.length} flagged):
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {COMMON_DIFFICULT_TOPICS.map((topic, i) => {
                    const isSelected = answers.difficultTopics.includes(topic.name);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDifficultTopic(topic.name)}
                        className={`text-xs px-3.5 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-rose-500/25 border-rose-400 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                            : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.08]'
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
                        <span>{topic.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-rose-300 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Difficult Topic */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customDifficultInput}
                    onChange={(e) => setCustomDifficultInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomDifficultTopic()}
                    placeholder="Add any other difficult chapter, algorithm, or theorem..."
                    className="flex-1 text-xs px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:border-rose-400"
                  />
                  <button
                    type="button"
                    onClick={addCustomDifficultTopic}
                    className="btn-apple-glass px-4 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-400" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 12: Explanation Style */}
            {currentStep === 12 && (
              <div className="space-y-3">
                {EXPLANATION_STYLES.map((style, i) => {
                  const Icon = style.icon;
                  const isSelected = answers.explanationStyle === style.title;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        sound.playClick();
                        setAnswers({ ...answers, explanationStyle: style.title });
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                          : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-purple-500/30 text-purple-200' : 'bg-white/[0.08] text-slate-300'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white">{style.title}</p>
                            {style.badge && (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                {style.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{style.desc}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-purple-300 flex-shrink-0 mt-1" />}
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Card Footer Navigation Bar */}
          <div className="flex items-center justify-between pt-5 border-t border-white/15">
            <button
              type="button"
              disabled={currentStep === 1 || isSaving}
              onClick={handleBack}
              className="btn-apple-glass py-2.5 px-4 text-xs flex items-center gap-2 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-semibold">↵ Enter</kbd> to continue</span>
            </div>

            <button
              type="button"
              disabled={isSaving || (currentStep === 1 && !answers.name.trim())}
              onClick={handleNext}
              className={`py-3 px-6 text-xs font-semibold rounded-2xl flex items-center gap-2 shadow-2xl transition-all cursor-pointer ${
                activeTheme === 'dusk'
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                  : 'btn-apple-primary'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Calibrating Persona...</span>
                </>
              ) : (
                <>
                  <span>{currentStep === totalSteps ? 'Complete & Map Syllabus' : 'Continue'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

// Helper Sunset icon
function SunsetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 10V2" />
      <path d="m4.93 10.93 1.41 1.41" />
      <path d="M2 18h2" />
      <path d="M20 18h2" />
      <path d="m19.07 10.93-1.41 1.41" />
      <path d="M22 22H2" />
      <path d="m8 6 4-4 4 4" />
      <path d="M16 18a4 4 0 0 0-8 0" />
    </svg>
  );
}
