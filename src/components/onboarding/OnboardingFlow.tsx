import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Compass,
  Clock,
  Sun,
  Moon
} from 'lucide-react';
import { sound } from '../../services/soundService';
import { supabaseDataService } from '../../services/supabaseDataService';
import type { OnboardingAnswers, MemorySummary } from '../../types';

interface OnboardingFlowProps {
  userId: string;
  initialAnswers?: Partial<OnboardingAnswers>;
  initialStep?: number;
  onComplete: (answers: OnboardingAnswers, memorySummary: MemorySummary) => void;
}

const COMMON_COLLEGES = [
  'Stanford University',
  'MIT',
  'UC Berkeley',
  'Indian Institute of Technology (IIT)',
  'National Institute of Technology (NIT)',
  'Carnegie Mellon University',
  'University of Washington',
  'Anna University'
];

const COURSES = [
  'B.Tech / B.E. Computer Science',
  'B.S. Software Engineering',
  'B.S. Artificial Intelligence & Data Science',
  'M.S. Computer Science',
  'BCA / MCA',
  'Information Technology'
];

const SPECIALIZATIONS = [
  'Artificial Intelligence & Machine Learning',
  'Systems, OS & Cloud Computing',
  'Database Systems & Data Engineering',
  'Cybersecurity & Cryptography',
  'Core Computer Science & Algorithms',
  'Full-Stack & Web Technologies'
];

const COMMON_SUBJECTS = [
  'Database Management Systems',
  'Operating Systems',
  'Data Structures & Algorithms',
  'Computer Networks',
  'Machine Learning',
  'Software Engineering',
  'Compiler Design',
  'Discrete Mathematics'
];

const COMMON_DIFFICULT_TOPICS = [
  'B-Trees & B+ Tree Indexing',
  'Dynamic Programming State Transitions',
  'Virtual Memory Page Replacement',
  'TCP Congestion Control',
  'Relational Normalization (BCNF)',
  'Backpropagation & Gradient Descent',
  'Deadlock Detection & Banker Algorithm'
];

const EXPLANATION_STYLES = [
  {
    id: 'intuitive_visual',
    title: 'Intuitive Analogies & Visual Logic',
    desc: 'Real-world metaphors and mental models before mathematical formulas.',
    badge: 'Recommended'
  },
  {
    id: 'mathematical_formal',
    title: 'Step-by-Step Formal Rigor',
    desc: 'Mathematical definitions, asymptotic proofs, and edge-case invariants.'
  },
  {
    id: 'code_first',
    title: 'Hands-on Code & Implementations',
    desc: 'TypeScript/Python algorithms, data structures, and runnable code blocks.'
  },
  {
    id: 'concise_bullet',
    title: 'Concise Bullet Summaries',
    desc: 'High-density takeaways, cheat-sheet points, and exam focus.'
  }
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  userId,
  initialAnswers,
  initialStep = 1,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep || 1);
  const totalSteps = 12;

  // Answers State
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    name: initialAnswers?.name || '',
    college: initialAnswers?.college || '',
    course: initialAnswers?.course || COURSES[0],
    specialization: initialAnswers?.specialization || SPECIALIZATIONS[0],
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
        academicGoal: `Target ${answers.targetCgpa} CGPA in ${answers.course} (Semester ${answers.semester})`,
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

  return (
    <div className="min-h-screen bg-[#030712] text-[#F5F5F7] flex flex-col relative selection:bg-white/20 selection:text-white font-body p-4 sm:p-6 lg:p-10 justify-center items-center">
      
      {/* Background Chromatic Fluid Ribbon Canvas */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
        <div className="chromatic-ribbon-purple -top-[140px] left-[15%]" />
        <div className="chromatic-ribbon-cyan bottom-[10%] right-[10%]" />
        <div className="chromatic-ribbon-magenta top-[40%] right-[25%]" />
      </div>

      <div className="relative z-10 max-w-2xl w-full space-y-6">
        
        {/* Header Progress Pill */}
        <div className="apple-liquid-glass p-4 rounded-2xl flex items-center justify-between shadow-xl border border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white tracking-tight">MindBridge Onboarding</p>
              <p className="text-[10px] text-slate-400 font-mono">Personalizing your academic experience</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-pink-400">Step {currentStep} of {totalSteps}</span>
            <div className="w-24 sm:w-32 h-2 rounded-full bg-white/10 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card Container */}
        <div className="apple-liquid-glass p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* AI Dialogue Bubble */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] flex-shrink-0 mt-0.5">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold">
                MindBridge AI Tutor
              </span>
              
              {/* Question Prompts */}
              {currentStep === 1 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  Welcome! What should I call you?
                </h3>
              )}
              {currentStep === 2 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  What university or college do you study at?
                </h3>
              )}
              {currentStep === 3 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  What degree or course are you pursuing?
                </h3>
              )}
              {currentStep === 4 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  What is your academic specialization?
                </h3>
              )}
              {currentStep === 5 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  Which semester are you currently in?
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
                  What subjects are you currently studying?
                </h3>
              )}
              {currentStep === 9 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  How many hours can you realistically study each day?
                </h3>
              )}
              {currentStep === 10 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  When do you feel most focused for studying?
                </h3>
              )}
              {currentStep === 11 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  What specific topics do you currently find challenging?
                </h3>
              )}
              {currentStep === 12 && (
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  What type of explanations help you learn best?
                </h3>
              )}
            </div>
          </div>

          {/* Dynamic Interactive Response Area */}
          <div className="pt-2">
            
            {/* Step 1: Name */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <input
                  type="text"
                  autoFocus
                  value={answers.name}
                  onChange={(e) => setAnswers({ ...answers, name: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && answers.name.trim() && handleNext()}
                  placeholder="Enter your full name or preferred name..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-black/50 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm font-medium shadow-inner"
                />
                <p className="text-xs text-slate-400 font-mono">MindBridge uses your name to address you across tutoring sessions and diagnostic reports.</p>
              </div>
            )}

            {/* Step 2: College */}
            {currentStep === 2 && (
              <div className="space-y-3.5">
                <input
                  type="text"
                  autoFocus
                  value={answers.college}
                  onChange={(e) => setAnswers({ ...answers, college: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && answers.college.trim() && handleNext()}
                  placeholder="Enter your university or institution name..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-black/50 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 text-sm font-medium shadow-inner"
                />
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Quick Suggestions:</span>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_COLLEGES.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAnswers({ ...answers, college: c })}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                          answers.college === c
                            ? 'bg-purple-600/30 border-purple-400 text-white'
                            : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Course */}
            {currentStep === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {COURSES.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => { sound.playClick(); setAnswers({ ...answers, course: c }); }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      answers.course === c
                        ? 'bg-purple-600/20 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-xs font-semibold">{c}</span>
                    {answers.course === c && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Specialization */}
            {currentStep === 4 && (
              <div className="space-y-2">
                {SPECIALIZATIONS.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => { sound.playClick(); setAnswers({ ...answers, specialization: s }); }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      answers.specialization === s
                        ? 'bg-purple-600/20 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-xs font-medium">{s}</span>
                    {answers.specialization === s && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                ))}
              </div>
            )}

            {/* Step 5: Semester */}
            {currentStep === 5 && (
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => { sound.playClick(); setAnswers({ ...answers, semester: sem }); }}
                    className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      answers.semester === sem
                        ? 'bg-purple-600/30 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-lg font-bold font-heading">Sem {sem}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Term {sem}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 6: Current CGPA */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/15">
                  <span className="text-xs font-mono text-slate-400">Current CGPA (out of 10.0)</span>
                  <span className="text-2xl font-bold font-mono text-pink-400">{answers.cgpa.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="10.0"
                  step="0.05"
                  value={answers.cgpa}
                  onChange={(e) => setAnswers({ ...answers, cgpa: parseFloat(e.target.value) })}
                  className="w-full accent-pink-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>4.00</span>
                  <span>7.00</span>
                  <span>8.50</span>
                  <span>10.00</span>
                </div>
              </div>
            )}

            {/* Step 7: Target CGPA */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/15">
                  <span className="text-xs font-mono text-slate-400">Target CGPA Goal</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">{answers.targetCgpa.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="10.0"
                  step="0.05"
                  value={answers.targetCgpa}
                  onChange={(e) => setAnswers({ ...answers, targetCgpa: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-xs text-slate-400 font-mono leading-relaxed">
                  MindBridge calculates optimal timetable study blocks and diagnostic test schedules to bridge the gap between your current {answers.cgpa.toFixed(2)} and target {answers.targetCgpa.toFixed(2)}.
                </p>
              </div>
            )}

            {/* Step 8: Subjects */}
            {currentStep === 8 && (
              <div className="space-y-3.5">
                <div className="flex flex-wrap gap-2">
                  {COMMON_SUBJECTS.map((sub, i) => {
                    const isSelected = answers.subjects.includes(sub);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleSubject(sub)}
                        className={`text-xs px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-purple-400 text-white'
                            : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-300" />}
                        <span>{sub}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Subject */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomSubject()}
                    placeholder="Add other subject..."
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="button"
                    onClick={addCustomSubject}
                    className="btn-apple-glass px-4 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 9: Realistic Study Hours */}
            {currentStep === 9 && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { hours: 1.5, label: '1 - 2 Hours', desc: 'Light & steady pacing' },
                  { hours: 2.5, label: '2 - 3 Hours', desc: 'Balanced focus schedule' },
                  { hours: 3.5, label: '3 - 4 Hours', desc: 'Deep work & mastery' },
                  { hours: 5.0, label: '4+ Hours', desc: 'Intensive academic sprint' }
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { sound.playClick(); setAnswers({ ...answers, dailyStudyHours: item.hours }); }}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                      answers.dailyStudyHours === item.hours
                        ? 'bg-purple-600/25 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                        : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-purple-400" />
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{item.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 10: Preferred Study Time */}
            {currentStep === 10 && (
              <div className="space-y-2.5">
                {[
                  { label: 'Early Morning', time: '6:00 AM - 10:00 AM', icon: Sun },
                  { label: 'Afternoon', time: '12:00 PM - 4:00 PM', icon: Compass },
                  { label: 'Evening', time: '5:00 PM - 9:00 PM', icon: SunsetIcon },
                  { label: 'Late Night', time: '10:00 PM - 2:00 AM', icon: Moon }
                ].map((item, i) => {
                  const Icon = item.icon;
                  const isSelected = answers.preferredStudyTime.includes(item.label);
                  return (
                    <div
                      key={i}
                      onClick={() => { sound.playClick(); setAnswers({ ...answers, preferredStudyTime: `${item.label} (${item.time})` }); }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-600/25 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                          : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="text-xs font-semibold text-white">{item.label}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.time}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 11: Difficult Topics */}
            {currentStep === 11 && (
              <div className="space-y-3.5">
                <div className="flex flex-wrap gap-2">
                  {COMMON_DIFFICULT_TOPICS.map((topic, i) => {
                    const isSelected = answers.difficultTopics.includes(topic);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDifficultTopic(topic)}
                        className={`text-xs px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-pink-600/30 border-pink-400 text-pink-200'
                            : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-pink-300" />}
                        <span>{topic}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Difficult Topic */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={customDifficultInput}
                    onChange={(e) => setCustomDifficultInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomDifficultTopic()}
                    placeholder="Add another topic you struggle with..."
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pink-400"
                  />
                  <button
                    type="button"
                    onClick={addCustomDifficultTopic}
                    className="btn-apple-glass px-4 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 12: Explanation Style */}
            {currentStep === 12 && (
              <div className="space-y-2.5">
                {EXPLANATION_STYLES.map((style, i) => {
                  const isSelected = answers.explanationStyle === style.title;
                  return (
                    <div
                      key={i}
                      onClick={() => { sound.playClick(); setAnswers({ ...answers, explanationStyle: style.title }); }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-purple-600/25 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                          : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white">{style.title}</p>
                          {style.badge && (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                              {style.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{style.desc}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />}
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              disabled={currentStep === 1 || isSaving}
              onClick={handleBack}
              className="btn-apple-glass py-2 px-4 text-xs flex items-center gap-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={isSaving || (currentStep === 1 && !answers.name.trim())}
              onClick={handleNext}
              className="btn-apple-primary py-2.5 px-6 text-xs font-semibold flex items-center gap-2 shadow-xl"
            >
              <span>{currentStep === totalSteps ? 'Proceed to Syllabus Upload' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
