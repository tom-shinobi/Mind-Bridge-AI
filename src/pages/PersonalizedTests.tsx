import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  FileCheck2,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCw,
  ArrowRight,
  HelpCircle,
  Plus
} from 'lucide-react';
import type {
  Test,
  TestAttempt,
  LearningGap,
  StudentProfile
} from '../types';
import { adaptiveEngine } from '../services/adaptiveEngine';
import { aiService } from '../services/aiService';
import { sound } from '../services/soundService';
import { FormattedContent } from '../components/FormattedContent';

interface PersonalizedTestsProps {
  tests: Test[];
  gaps: LearningGap[];
  profile: StudentProfile;
  initialTopic?: string;
  onTestComplete: (attempt: TestAttempt, adaptationResult: any) => void;
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
}

export const PersonalizedTests: React.FC<PersonalizedTestsProps> = ({
  tests,
  gaps,
  initialTopic,
  onTestComplete,
  onNavigate
}) => {
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(600);
  const [attemptResult, setAttemptResult] = useState<TestAttempt | null>(null);
  const [adaptationMessage, setAdaptationMessage] = useState<string | null>(null);

  // If initialTopic provided from navigation, select matching test
  useEffect(() => {
    if (initialTopic) {
      const match = tests.find((t) => t.topic.toLowerCase().includes(initialTopic.toLowerCase()));
      if (match) {
        startTest(match);
      }
    }
  }, [initialTopic]);

  // Timer countdown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (activeTest && !attemptResult && timeRemainingSeconds > 0) {
      timer = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTest, attemptResult, timeRemainingSeconds]);

  const startTest = (test: Test) => {
    sound.playClick();
    setActiveTest(test);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setTimeRemainingSeconds(test.timeLimitMinutes * 60);
    setAttemptResult(null);
    setAdaptationMessage(null);
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    sound.playClick();
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;

    sound.playClick();
    let correctCount = 0;
    activeTest.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / activeTest.questions.length) * 100);
    const isPassed = percentage >= 70;

    const matchingGap = gaps.find(
      (g) => g.id === activeTest.targetedGapId || g.topic.toLowerCase().includes(activeTest.topic.toLowerCase())
    );

    const attempt: TestAttempt = {
      id: `attempt_${Date.now()}`,
      testId: activeTest.id,
      testTitle: activeTest.title,
      subject: activeTest.subject,
      topic: activeTest.topic,
      date: new Date().toISOString().split('T')[0],
      score: correctCount,
      totalQuestions: activeTest.questions.length,
      percentage,
      userAnswers: selectedAnswers,
      timeSpentSeconds: activeTest.timeLimitMinutes * 60 - timeRemainingSeconds,
      feedback: isPassed
        ? `Exemplary performance (${percentage}%). You have demonstrated solid conceptual mastery over ${activeTest.topic}.`
        : `Score: ${percentage}%. You demonstrated foundational understanding but missed subtle invariants. Additional tutoring recommended.`,
      previousMastery: matchingGap ? matchingGap.masteryScore : 40,
      newMastery: matchingGap ? Math.min(100, Math.round((matchingGap.masteryScore + percentage) / 2)) : percentage,
      gapId: matchingGap?.id,
      status: isPassed ? 'passed' : 'review_needed'
    };

    // Trigger the Continuous Improvement Feedback Loop!
    const adaptation = adaptiveEngine.processTestCompletion(attempt);
    setAttemptResult(attempt);
    setAdaptationMessage(adaptation.message);

    if (isPassed) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    onTestComplete(attempt, adaptation);
  };

  const handleGenerateFreshTest = (gap: LearningGap) => {
    sound.playClick();
    const newTest = aiService.generateTestForGap(gap.topic, gap.id);
    startTest(newTest);
  };

  // 1. Post-submission Analysis View
  if (attemptResult && activeTest) {
    const isPassed = attemptResult.percentage >= 70;

    return (
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Results Banner */}
        <div
          className={`p-6 sm:p-8 relative overflow-hidden ${
            isPassed ? 'liquid-glass-success' : 'liquid-glass-amber'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase mb-2 border ${
                  isPassed
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <HelpCircle className="w-3.5 h-3.5" />}
                {isPassed ? 'Mastery Criterion Achieved' : 'Review Required'}
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Diagnostic Analysis: {activeTest.topic}
              </h2>
              <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
                {attemptResult.feedback}
              </p>
            </div>

            {/* Score Ring / Gauge */}
            <div className="text-center sm:text-right flex-shrink-0">
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300">
                {attemptResult.percentage}%
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {attemptResult.score} of {attemptResult.totalQuestions} Questions Correct
              </p>
            </div>
          </div>

          {/* Adaptive Loop Output Notification */}
          {adaptationMessage && (
            <div className="mt-6 p-4 rounded-2xl liquid-glass-adaptive text-xs text-purple-200 flex items-start gap-3 shadow-xl">
              <RotateCw className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5 animate-spin-slow" />
              <div className="space-y-1">
                <p className="font-bold text-white uppercase font-mono tracking-wider">
                  Adaptive Feedback Loop Triggered
                </p>
                <p className="text-slate-200 leading-relaxed">{adaptationMessage}</p>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono pt-1 text-purple-300">
                  <span>✓ Learning Gap Updated</span> • 
                  <span>✓ Syllabus Re-ranked</span> • 
                  <span>✓ Timetable Optimized</span> • 
                  <span>✓ +{isPassed ? '300' : '80'} Academic XP Awarded</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => { sound.playClick(); setActiveTest(null); }}
              className="btn-apple-glass py-2 px-4 text-xs text-white"
            >
              Back to Tests Catalog
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { sound.playClick(); onNavigate('adaptive_loop'); }}
                className="btn-apple-glass py-2 px-4 text-xs flex items-center gap-1.5 text-white"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Inspect Feedback Loop</span>
              </button>

              <button
                onClick={() => { sound.playClick(); onNavigate('dashboard'); }}
                className="btn-apple-primary py-2 px-4 text-xs flex items-center gap-1.5"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Question by Question Review */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <span>Detailed Question Audit</span>
          </h3>

          <div className="space-y-3">
            {activeTest.questions.map((q, idx) => {
              const userAns = attemptResult.userAnswers[idx];
              const isCorrect = userAns === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`p-5 space-y-3 ${
                    isCorrect ? 'liquid-glass-success' : 'liquid-glass-danger'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-white/[0.08] border border-white/15 flex items-center justify-center font-mono font-bold text-xs text-purple-300">
                        Q{idx + 1}
                      </span>
                      <span className="text-[11px] font-mono text-slate-300">
                        Concept: <strong className="text-white">{q.conceptTested}</strong>
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {isCorrect ? 'Correct' : 'Missed'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                    {q.questionText}
                  </p>

                  {q.codeSnippet && (
                    <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-purple-300 overflow-x-auto">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  )}

                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isUserChoice = userAns === optIdx;
                      const isCorrectChoice = optIdx === q.correctIndex;

                      let style = 'bg-white/[0.04] border-white/10 text-slate-300';
                      if (isCorrectChoice) {
                        style = 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.2)]';
                      } else if (isUserChoice && !isCorrect) {
                        style = 'bg-rose-500/20 border-rose-400/50 text-rose-100 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between backdrop-blur-md ${style}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <FormattedContent content={opt} className="inline text-xs" />
                          </div>
                          {isCorrectChoice && (
                            <span className="text-[10px] font-mono text-emerald-300 uppercase font-bold">
                              Correct Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 leading-relaxed backdrop-blur-md">
                    <strong className="text-purple-300 font-mono">Pedagogical Rationale: </strong>
                    <FormattedContent content={q.explanation} className="inline text-xs" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Test Taking Interface
  if (activeTest) {
    const q = activeTest.questions[currentQuestionIdx];
    const mins = Math.floor(timeRemainingSeconds / 60);
    const secs = timeRemainingSeconds % 60;
    const isLast = currentQuestionIdx === activeTest.questions.length - 1;

    return (
      <div className="space-y-4 animate-fade-in max-w-3xl mx-auto pb-12">
        {/* Test HUD Top Bar */}
        <div className="liquid-glass-block p-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-purple-300 font-semibold block">
              {activeTest.subject}
            </span>
            <h3 className="text-base font-bold text-white leading-tight">{activeTest.title}</h3>
          </div>

          {/* Timer Box */}
          <div className="px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/20 backdrop-blur-md flex items-center gap-2 shadow-inner">
            <Clock className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-sm font-mono font-bold text-white">
              {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="apple-liquid-glass p-6 sm:p-8 space-y-5">
          {/* Progress Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="text-xs font-mono text-slate-300">
              Question <strong className="text-white">{currentQuestionIdx + 1}</strong> of{' '}
              {activeTest.questions.length}
            </span>
            <span className="text-xs font-mono text-purple-300">
              Concept: {q.conceptTested}
            </span>
          </div>

          {/* Question Text (LaTeX & Markdown Formatted) */}
          <FormattedContent
            content={q.questionText}
            className="text-base sm:text-lg font-bold text-white leading-relaxed"
          />

          {/* Code Snippet if any */}
          {q.codeSnippet && (
            <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-purple-300 overflow-x-auto">
              <code>{q.codeSnippet}</code>
            </pre>
          )}

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {q.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestionIdx, optIdx)}
                  className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-center gap-3 backdrop-blur-xl ${
                    isSelected
                      ? 'border-purple-400/80 bg-purple-500/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_0_20px_rgba(168,85,247,0.3)]'
                      : 'border-white/15 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:border-white/30'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-xl border flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                      isSelected
                        ? 'border-purple-300 bg-purple-500 text-white shadow-md'
                        : 'border-white/20 bg-white/[0.08] text-slate-300'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <FormattedContent content={opt} className="leading-snug inline text-xs sm:text-sm" />
                </button>
              );
            })}
          </div>

          {/* Bottom Nav */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentQuestionIdx === 0}
              onClick={() => {
                sound.playClick();
                setCurrentQuestionIdx((prev) => Math.max(0, prev - 1));
              }}
              className="btn-apple-glass py-2 px-4 text-xs disabled:opacity-30 text-white"
            >
              Previous
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={handleSubmitTest}
                className="btn-apple-primary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-xl"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Submit & Trigger Adaptive Loop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCurrentQuestionIdx((prev) => Math.min(activeTest.questions.length - 1, prev + 1));
                }}
                className="btn-apple-primary py-2 px-5 text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Catalog of Personalized Tests
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="apple-liquid-glass p-6 sm:p-8 relative overflow-hidden">
        <div className="glow-pink -top-24 -right-24 opacity-20" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-mono mb-2">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>DIAGNOSTIC ASSESSMENT VAULT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Personalized Tests & Diagnostics
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Standard exams ask random questions. Mind Bridge AI synthesizes tests precisely targeted at your active learning gaps to measure retention and dynamically adapt your syllabus.
            </p>
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((test) => (
          <div
            key={test.id}
            className="liquid-glass-block p-5 space-y-3.5 border-white/15 hover:border-purple-500/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-semibold text-purple-300">
                  {test.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {test.difficulty} Difficulty
                </span>
              </div>

              <h4 className="text-base font-bold text-white">{test.title}</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Targeted Gap: <strong className="text-pink-300">{test.topic}</strong>
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-3 pt-2 border-t border-white/[0.06]">
                <span>{test.questions.length} Questions</span> • 
                <span>{test.timeLimitMinutes} Mins</span> • 
                <span className="text-emerald-400 font-semibold">+300 Academic XP</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startTest(test)}
              className="w-full btn-apple-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 mt-2"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Begin Diagnostic Test</span>
            </button>
          </div>
        ))}

        {/* Generate Dynamic Test Card for other gaps */}
        {gaps.map((gap) => (
          <div
            key={gap.id}
            className="liquid-glass-amber p-5 space-y-3.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-semibold text-orange-300">
                  {gap.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {gap.severity} Gap
                </span>
              </div>

              <h4 className="text-base font-bold text-white">
                Auto-Generate Test: {gap.topic}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Synthesize fresh diagnostic questions from your recorded exam deficiencies.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleGenerateFreshTest(gap)}
              className="w-full btn-apple-glass py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 mt-2 text-white"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Generate & Take Test</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
