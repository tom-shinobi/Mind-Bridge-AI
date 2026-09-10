import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  CheckCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';
import type { AcademicRecord, StudentProfile } from '../types';
import { sound } from '../services/soundService';

interface AcademicHistoryProps {
  records: AcademicRecord[];
  profile: StudentProfile;
  onAddRecord: (record: AcademicRecord) => void;
  onNavigate: (tab: string, extra?: { topic?: string }) => void;
}

export const AcademicHistory: React.FC<AcademicHistoryProps> = ({
  records,
  profile,
  onAddRecord,
  onNavigate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterSemester, setFilterSemester] = useState<number | 'all'>('all');

  // Form State
  const [subjectCode, setSubjectCode] = useState('CS306');
  const [subjectName, setSubjectName] = useState('Compiler Design');
  const [semester, setSemester] = useState(6);
  const [examType, setExamType] = useState<'Midterm' | 'End Semester' | 'Quiz' | 'Assignment' | 'Lab Test'>('Midterm');
  const [score, setScore] = useState(28);
  const [totalMarks, setTotalMarks] = useState(50);
  const [topicsString, setTopicsString] = useState('Lexical Analysis, Parsing, LL(1) Grammars');

  const filteredRecords = records.filter(
    (r) => filterSemester === 'all' || r.semester === filterSemester
  );

  const avgScore = Math.round(
    records.reduce((acc, r) => acc + r.percentage, 0) / (records.length || 1)
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    const pct = Math.round((score / totalMarks) * 100);
    let grade = 'C';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B+';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C+';

    const newRecord: AcademicRecord = {
      id: `rec_${Date.now()}`,
      subjectCode,
      subjectName,
      semester,
      examType,
      score,
      totalMarks,
      percentage: pct,
      grade,
      date: new Date().toISOString().split('T')[0],
      topicsEvaluated: topicsString.split(',').map((t) => t.trim())
    };

    onAddRecord(newRecord);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Banner */}
      <div className="liquid-glass-card p-6 relative overflow-hidden">
        <div className="glow-purple -top-24 -right-24 opacity-25" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>ACADEMIC FOUNDATION VAULT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Student Academic History
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Every course, exam grade, and topic evaluation is ingested into Mind Bridge AI to pinpoint knowledge gaps and dynamically shape your personalized syllabus.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsModalOpen(true);
            }}
            className="btn-skeuo-primary py-2.5 px-4 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Academic Record</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/[0.08]">
          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Current CGPA</span>
            <span className="text-xl sm:text-2xl font-bold text-white">{profile.cgpa} / 10.0</span>
          </div>
          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Target CGPA</span>
            <span className="text-xl sm:text-2xl font-bold text-purple-300">{profile.targetCgpa} / 10.0</span>
          </div>
          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Avg Exam Score</span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-400">{avgScore}%</span>
          </div>
          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Ingested Tests</span>
            <span className="text-xl sm:text-2xl font-bold text-orange-400">{records.length} Records</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Academic Performance Log
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Semester:</span>
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-xs px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-slate-200 focus:outline-none focus:border-purple-500/40"
          >
            <option value="all">All Semesters</option>
            <option value={6}>Semester 6 (Current)</option>
            <option value={5}>Semester 5</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="liquid-glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-slate-400 font-mono uppercase text-[10px] border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Subject & Code</th>
                <th className="py-3 px-3">Exam Type</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3">Grade</th>
                <th className="py-3 px-4">Evaluated Topics</th>
                <th className="py-3 px-4 text-right">Adaptive Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-300">
              {filteredRecords.map((r) => {
                const isWeak = r.percentage < 65;

                return (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{r.subjectName}</p>
                      <p className="text-[10px] text-purple-300/80 font-mono">{r.subjectCode} • Sem {r.semester}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono">
                        {r.examType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">{r.date}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold text-sm ${isWeak ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {r.score}/{r.totalMarks}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({r.percentage}%)</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                          r.grade.startsWith('A')
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : r.grade.startsWith('B')
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {r.topicsEvaluated.map((top, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              isWeak && idx >= 2
                                ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30 font-semibold'
                                : 'bg-white/[0.04] text-slate-300'
                            }`}
                          >
                            {top}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isWeak ? (
                        <button
                          onClick={() => {
                            sound.playClick();
                            onNavigate('gaps');
                          }}
                          className="btn-skeuo-orange py-1 px-2 text-[10px]"
                        >
                          View Gap
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-400 flex items-center justify-end gap-1 font-mono">
                          <CheckCircle className="w-3 h-3" /> Mastered
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Academic Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="liquid-glass-card max-w-md w-full p-6 relative border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                Add Academic Record
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Exam Type
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white"
                  >
                    <option value="Midterm">Midterm</option>
                    <option value="Quiz">Quiz</option>
                    <option value="End Semester">End Sem</option>
                    <option value="Lab Test">Lab Test</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Marks Scored
                  </label>
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Evaluated Topics (Comma Separated)
                </label>
                <input
                  type="text"
                  value={topicsString}
                  onChange={(e) => setTopicsString(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                  placeholder="e.g. Topic 1, Topic 2, Topic 3"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-skeuo-glass px-3 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-skeuo-primary px-4 py-1.5 text-xs"
                >
                  Ingest & Analyze
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
