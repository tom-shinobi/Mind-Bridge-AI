import React, { useState, useRef } from 'react';
import {
  Upload,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  Layers,
  BookOpen,
  Loader2
} from 'lucide-react';
import { sound } from '../../services/soundService';
import { syllabusService } from '../../services/syllabusService';
import { supabaseDataService } from '../../services/supabaseDataService';
import type { ExtractedSyllabus, SyllabusTopic, LearningGap, OnboardingAnswers } from '../../types';

interface SyllabusUploadViewProps {
  userId: string;
  onboardingAnswers: OnboardingAnswers;
  onComplete: (topics: SyllabusTopic[], gaps: LearningGap[]) => void;
}

export const SyllabusUploadView: React.FC<SyllabusUploadViewProps> = ({
  userId,
  onboardingAnswers,
  onComplete
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
    <div className="min-h-screen bg-[#030712] text-[#F5F5F7] flex flex-col relative selection:bg-white/20 selection:text-white font-body p-4 sm:p-6 lg:p-10 justify-center items-center">
      
      {/* Background Chromatic Fluid Ribbon Canvas */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
        <div className="chromatic-ribbon-purple -top-[140px] left-[15%]" />
        <div className="chromatic-ribbon-cyan bottom-[10%] right-[10%]" />
        <div className="chromatic-ribbon-magenta top-[40%] right-[25%]" />
      </div>

      <div className="relative z-10 max-w-3xl w-full space-y-6">
        
        {/* Header Capsule */}
        <div className="apple-liquid-glass p-5 rounded-3xl border border-white/20 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-400">
                Step 2: Syllabus Mapping
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Map What You're Actually Studying
              </h2>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-300">
            Final Step
          </span>
        </div>

        {/* Upload Card or Review Card */}
        {!extractedSyllabus ? (
          <div className="apple-liquid-glass p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6 text-center">
            
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Upload your course syllabus
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                MindBridge AI automatically extracts your units, modules, and topics into an adaptive learning roadmap. You will not have to type topics manually.
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

              <div>
                <p className="text-sm font-semibold text-white">
                  Drop your syllabus document here, or <span className="text-purple-400 underline">browse files</span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  Supports PDF, DOCX, Word, or Scanned Images (PNG, JPG) with OCR
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-2">
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">📄 PDF</span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">📝 DOCX</span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">🖼️ Image OCR</span>
              </div>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center gap-3 text-xs text-purple-200 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="font-mono">{processingStatus}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Manual Entry Alternate Action */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <span>Don't have a syllabus document on hand right now?</span>
              <button
                type="button"
                onClick={handleManualStart}
                className="btn-apple-glass py-2 px-4 text-xs text-slate-200 hover:text-white"
              >
                Add Manually
              </button>
            </div>

          </div>
        ) : (
          /* Syllabus Review & Confirmation Interface */
          <div className="apple-liquid-glass p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Extracted Curriculum Subject</span>
                <input
                  type="text"
                  value={extractedSyllabus.subject}
                  onChange={(e) => setExtractedSyllabus({ ...extractedSyllabus, subject: e.target.value })}
                  className="text-lg sm:text-xl font-bold text-white bg-transparent border-b border-white/20 focus:border-purple-400 focus:outline-none w-full sm:w-auto"
                />
              </div>

              <div className="flex items-center gap-3">
                {selectedFile && (
                  <span className="text-[11px] font-mono text-purple-300 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 hidden sm:inline-block">
                    📄 {selectedFile.name}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => { setExtractedSyllabus(null); setSelectedFile(null); }}
                  className="btn-apple-glass py-1.5 px-3 text-xs text-slate-300 hover:text-white"
                >
                  Upload Different File
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              MindBridge parsed your syllabus into modules. You can review, rename, or add topics before confirming your learning map.
            </p>

            {/* Module Hierarchy */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {extractedSyllabus.modules.map((mod, modIdx) => (
                <div key={modIdx} className="p-4 rounded-2xl bg-black/40 border border-white/15 space-y-3 shadow-inner">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <input
                        type="text"
                        value={mod.moduleName}
                        onChange={(e) => {
                          const updated = { ...extractedSyllabus };
                          updated.modules[modIdx].moduleName = e.target.value;
                          setExtractedSyllabus(updated);
                        }}
                        className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-purple-400 focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddTopic(modIdx)}
                      className="text-[11px] font-mono text-purple-300 hover:text-white flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Topic</span>
                    </button>
                  </div>

                  {/* Topics List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {mod.topics.map((t, topicIdx) => (
                      <div
                        key={topicIdx}
                        className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-2 group hover:border-white/25 transition-all"
                      >
                        <input
                          type="text"
                          value={t.topic}
                          onChange={(e) => handleUpdateTopicName(modIdx, topicIdx, e.target.value)}
                          className="flex-1 text-xs text-slate-200 bg-transparent focus:outline-none focus:text-white"
                        />

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                            t.priority === 'high'
                              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                              : 'bg-white/10 text-slate-300'
                          }`}>
                            {t.priority || 'medium'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveTopic(modIdx, topicIdx)}
                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>

            {/* Confirm & Launch Dashboard */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-mono">
                {extractedSyllabus.modules.reduce((sum, m) => sum + m.topics.length, 0)} Topics extracted across {extractedSyllabus.modules.length} Modules
              </div>

              <button
                type="button"
                onClick={handleConfirmAndFinish}
                className="btn-apple-primary py-2.5 px-6 text-xs font-semibold flex items-center gap-2 shadow-2xl"
              >
                <span>Confirm & Generate Learning Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
