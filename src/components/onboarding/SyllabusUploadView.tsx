import React, { useState, useRef } from 'react';
import {
  Upload,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  Layers,
  BookOpen,
  Loader2,
  FileText,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';
import { sound } from '../../services/soundService';
import { syllabusService } from '../../services/syllabusService';
import { supabaseDataService } from '../../services/supabaseDataService';
import type { ExtractedSyllabus, SyllabusTopic, LearningGap, OnboardingAnswers } from '../../types';

interface SyllabusUploadViewProps {
  userId: string;
  onboardingAnswers: OnboardingAnswers;
  onComplete: (topics: SyllabusTopic[], gaps: LearningGap[]) => void;
  onSkip?: () => void;
}

export const SyllabusUploadView: React.FC<SyllabusUploadViewProps> = ({
  userId,
  onboardingAnswers,
  onComplete,
  onSkip
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [extractedSyllabus, setExtractedSyllabus] = useState<ExtractedSyllabus | null>(null);
  const [manualSubject] = useState(onboardingAnswers.subjects[0] || 'Database Management Systems');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setErrorMsg(null);
    sound.playClick();
    await processSyllabusFile(file);
  };

  const processSyllabusFile = async (file: File) => {
    setIsProcessing(true);
    try {
      setProcessingStatus('Reading document and extracting text...');
      const { text, isScanned } = await syllabusService.extractTextFromFile(file);

      if (isScanned) {
        setProcessingStatus('Running OCR text recognition on scanned syllabus...');
      }

      setProcessingStatus('MindBridge AI is structuring Modules, Units & Topics...');
      const structured = await syllabusService.structureSyllabusWithAI(
        text,
        onboardingAnswers.subjects[0] || 'Core Course Syllabus'
      );

      setExtractedSyllabus(structured);
      sound.playSuccess();
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(`Syllabus extraction notice: ${e.message || 'Falling back to manual layout'}`);
      // Create fallback structure
      setExtractedSyllabus({
        subject: onboardingAnswers.subjects[0] || 'Computer Science Core',
        modules: [
          {
            moduleName: 'Module 1: Foundations',
            topics: [
              { topic: onboardingAnswers.difficultTopics[0] || 'Core Subject Fundamentals', priority: 'high', estimatedHours: 3.0 }
            ]
          }
        ]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualStart = () => {
    sound.playClick();
    setExtractedSyllabus({
      subject: manualSubject,
      modules: [
        {
          moduleName: 'Module 1: Foundations & Architecture',
          topics: [
            { topic: onboardingAnswers.difficultTopics[0] || 'Primary Core Mechanics', priority: 'high', estimatedHours: 3.0 }
          ]
        },
        {
          moduleName: 'Module 2: Advanced Implementations',
          topics: [
            { topic: 'Key Algorithms & Data Operations', priority: 'medium', estimatedHours: 2.5 }
          ]
        }
      ]
    });
  };

  const handleAddModule = () => {
    if (!extractedSyllabus) return;
    sound.playClick();
    const updated = { ...extractedSyllabus };
    updated.modules.push({
      moduleName: `Module ${updated.modules.length + 1}: New Subject Unit`,
      topics: [
        { topic: 'Core Concept 1', priority: 'medium', estimatedHours: 2.0 }
      ]
    });
    setExtractedSyllabus(updated);
  };

  const handleRemoveModule = (moduleIdx: number) => {
    if (!extractedSyllabus || extractedSyllabus.modules.length <= 1) return;
    sound.playClick();
    const updated = { ...extractedSyllabus };
    updated.modules.splice(moduleIdx, 1);
    setExtractedSyllabus(updated);
  };

  const handleAddTopic = (moduleIdx: number) => {
    if (!extractedSyllabus) return;
    sound.playClick();
    const updated = { ...extractedSyllabus };
    updated.modules[moduleIdx].topics.push({
      topic: 'New Topic',
      priority: 'medium',
      estimatedHours: 2.0
    });
    setExtractedSyllabus(updated);
  };

  const handleRemoveTopic = (moduleIdx: number, topicIdx: number) => {
    if (!extractedSyllabus) return;
    sound.playClick();
    const updated = { ...extractedSyllabus };
    updated.modules[moduleIdx].topics.splice(topicIdx, 1);
    setExtractedSyllabus(updated);
  };

  const handleUpdateTopicName = (moduleIdx: number, topicIdx: number, newName: string) => {
    if (!extractedSyllabus) return;
    const updated = { ...extractedSyllabus };
    updated.modules[moduleIdx].topics[topicIdx].topic = newName;
    setExtractedSyllabus(updated);
  };

  const handleTogglePriority = (moduleIdx: number, topicIdx: number) => {
    if (!extractedSyllabus) return;
    sound.playClick();
    const updated = { ...extractedSyllabus };
    const current = updated.modules[moduleIdx].topics[topicIdx].priority;
    const nextPriority = current === 'high' ? 'medium' : current === 'medium' ? 'low' : 'high';
    updated.modules[moduleIdx].topics[topicIdx].priority = nextPriority;
    setExtractedSyllabus(updated);
  };

  const handleConfirmAndFinish = async () => {
    if (!extractedSyllabus) return;
    sound.playSuccess();
    setIsProcessing(true);
    setProcessingStatus('Generating personalized syllabus and diagnostic learning gaps...');

    const syllabusTopics = syllabusService.convertToSyllabusTopics(
      extractedSyllabus,
      onboardingAnswers.difficultTopics
    );

    const initialGaps = syllabusService.generateInitialLearningGaps(
      extractedSyllabus,
      onboardingAnswers.difficultTopics
    );

    // Persist to Supabase if logged in
    if (userId) {
      await supabaseDataService.saveSyllabusTopics(userId, syllabusTopics);
      await supabaseDataService.saveLearningGaps(userId, initialGaps);
    }

    setIsProcessing(false);
    onComplete(syllabusTopics, initialGaps);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      
      {/* Header Capsule */}
      <div className="apple-liquid-glass p-5 rounded-3xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-400">
                Step 2: Syllabus Mapping
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-slate-300">
                Curriculum AI
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Map What You're Actually Studying
            </h2>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {onSkip && (
            <button
              type="button"
              onClick={() => { sound.playClick(); onSkip(); }}
              className="btn-apple-glass py-2 px-3.5 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
              <span>Skip to Dashboard →</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Card or Review Card */}
      {!extractedSyllabus ? (
        <div className="apple-liquid-glass p-6 sm:p-10 rounded-3xl border border-white/20 shadow-2xl space-y-6 text-center">
          
          <div className="space-y-2.5 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Automated Course Extraction</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Upload your course syllabus
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              MindBridge AI automatically extracts your units, modules, and topics into an adaptive learning roadmap. You won't have to type topics manually.
            </p>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-3.5 ${
              dragActive
                ? 'border-purple-400 bg-purple-600/20 shadow-[0_0_25px_rgba(168,85,247,0.3)]'
                : 'border-white/20 bg-black/40 hover:border-white/40 hover:bg-white/[0.04]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-purple-300 shadow-inner">
              <Upload className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">
                Drop your syllabus document here, or <span className="text-purple-400 underline">browse files</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Supports PDF, DOCX, Word, or Scanned Images (PNG, JPG) with OCR
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-2 flex-wrap justify-center">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">📄 PDF Document</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">📝 Word (.docx)</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">🖼️ Image OCR</span>
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/40 flex items-center justify-center gap-3 text-xs text-purple-200 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span className="font-mono">{processingStatus}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Fallback actions */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>Don't have a syllabus document on hand right now?</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleManualStart}
                className="btn-apple-glass py-2 px-4 text-xs text-slate-200 hover:text-white cursor-pointer"
              >
                Add Manually
              </button>
              {onSkip && (
                <button
                  type="button"
                  onClick={() => { sound.playClick(); onSkip(); }}
                  className="text-xs text-purple-400 hover:text-purple-300 underline font-mono cursor-pointer"
                >
                  Skip for now
                </button>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Syllabus Review & Confirmation Interface */
        <div className="apple-liquid-glass p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6">
          
          {/* Top Info / Course Title Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-purple-300 block mb-1">
                  Extracted Curriculum Subject
                </label>
                <input
                  type="text"
                  value={extractedSyllabus.subject}
                  onChange={(e) => setExtractedSyllabus({ ...extractedSyllabus, subject: e.target.value })}
                  className="w-full text-base sm:text-lg font-bold text-white bg-black/40 border border-white/15 focus:border-purple-400 focus:outline-none rounded-xl px-3.5 py-2 transition-all"
                  placeholder="e.g. Database Management Systems"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedFile && (
                  <span className="text-[11px] font-mono text-purple-300 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="max-w-[160px] truncate">{selectedFile.name}</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => { setExtractedSyllabus(null); setSelectedFile(null); sound.playClick(); }}
                  className="btn-apple-glass py-2 px-3 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Upload Different</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="btn-apple-glass py-2 px-3 text-xs text-purple-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-purple-400" />
                  <span>Add Module</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              MindBridge parsed your syllabus into modules. You can review, rename, or click priority badges to adjust study weight.
            </p>
          </div>

          {/* Module Hierarchy */}
          <div className="space-y-4 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
            {extractedSyllabus.modules.map((mod, modIdx) => (
              <div key={modIdx} className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/15 space-y-3.5 shadow-inner">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 flex-1">
                    <Layers className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={mod.moduleName}
                      onChange={(e) => {
                        const updated = { ...extractedSyllabus };
                        updated.modules[modIdx].moduleName = e.target.value;
                        setExtractedSyllabus(updated);
                      }}
                      className="text-xs sm:text-sm font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-purple-400 focus:outline-none w-full"
                    />
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleAddTopic(modIdx)}
                      className="text-xs font-mono text-purple-300 hover:text-white flex items-center gap-1 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/20 transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Topic</span>
                    </button>
                    {extractedSyllabus.modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveModule(modIdx)}
                        className="text-xs text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Topics List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {mod.topics.map((t, topicIdx) => (
                    <div
                      key={topicIdx}
                      className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-2 group hover:border-white/25 hover:bg-white/[0.06] transition-all"
                    >
                      <input
                        type="text"
                        value={t.topic}
                        onChange={(e) => handleUpdateTopicName(modIdx, topicIdx, e.target.value)}
                        className="flex-1 text-xs text-slate-200 bg-transparent focus:outline-none focus:text-white placeholder-slate-500"
                        placeholder="Topic title..."
                      />

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTogglePriority(modIdx, topicIdx)}
                          title="Click to toggle priority: High -> Med -> Low"
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                            t.priority === 'high'
                              ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 hover:bg-pink-500/30'
                              : t.priority === 'low'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25'
                          }`}
                        >
                          {t.priority || 'medium'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(modIdx, topicIdx)}
                          className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/10 transition-opacity"
                          title="Remove Topic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

          {/* Confirm & Launch Dashboard Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 font-mono text-center sm:text-left">
              <span className="text-white font-semibold">{extractedSyllabus.modules.reduce((sum, m) => sum + m.topics.length, 0)}</span> Topics mapped across <span className="text-white font-semibold">{extractedSyllabus.modules.length}</span> Modules
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {onSkip && (
                <button
                  type="button"
                  onClick={() => { sound.playClick(); onSkip(); }}
                  className="btn-apple-glass py-2.5 px-4 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Skip & Go to Dashboard
                </button>
              )}

              <button
                type="button"
                onClick={handleConfirmAndFinish}
                disabled={isProcessing}
                className="btn-apple-primary py-2.5 px-6 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xl flex-1 sm:flex-none cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Confirm & Generate Learning Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
