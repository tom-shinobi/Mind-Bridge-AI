import React, { useState } from 'react';
import {
  Settings,
  User,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Key,
  Volume2,
  Sparkles,
  Users
} from 'lucide-react';
import type { StudentProfile, AISettings } from '../types';
import { sound } from '../services/soundService';

interface SettingsProfileProps {
  profile: StudentProfile;
  aiSettings: AISettings;
  onUpdateProfile: (profile: StudentProfile) => void;
  onUpdateAISettings: (settings: AISettings) => void;
}

export const SettingsProfile: React.FC<SettingsProfileProps> = ({
  profile,
  aiSettings,
  onUpdateProfile,
  onUpdateAISettings
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [degree, setDegree] = useState(profile.degree);
  const [targetCgpa, setTargetCgpa] = useState(profile.targetCgpa);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // AI settings
  const [provider, setProvider] = useState(aiSettings.provider);
  const [apiKey, setApiKey] = useState(aiSettings.openRouterApiKey);
  const [model, setModel] = useState(aiSettings.model);
  const [speechEnabled, setSpeechEnabled] = useState(aiSettings.speechEnabled);
  const [soundFxEnabled, setSoundFxEnabled] = useState(aiSettings.soundFxEnabled);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    onUpdateProfile({
      ...profile,
      name,
      email,
      degree,
      targetCgpa
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    onUpdateAISettings({
      provider,
      openRouterApiKey: apiKey,
      model,
      speechEnabled,
      soundFxEnabled
    });
    sound.setEnabled(soundFxEnabled);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="liquid-glass-card p-6 relative overflow-hidden">
        <div className="glow-purple -top-24 -right-24 opacity-25" />
        
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>SYSTEM CONFIGURATION & SAFETY BOUNDARIES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Student Profile & AI Intelligence Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage your academic credentials, customize AI model parameters, and review the strict safety guidelines governing Mind Bridge AI.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Configuration saved successfully and synchronized across the application.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Student Profile Card */}
        <div className="liquid-glass-card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
            <User className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Student Academic Profile
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                University Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Degree & Specialization
              </label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Current CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled
                  value={profile.cgpa}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/20 border border-white/5 text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Target CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={targetCgpa}
                  onChange={(e) => setTargetCgpa(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <button type="submit" className="btn-skeuo-primary py-2 px-4 text-xs">
                Save Academic Profile
              </button>
            </div>
          </form>
        </div>

        {/* Right: AI Engine Settings */}
        <div className="liquid-glass-card p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
            <Cpu className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              AI Provider & Intelligence Config
            </h3>
          </div>

          <form onSubmit={handleSaveAI} className="space-y-3.5 text-xs">
            {/* Provider selector */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Reasoning Backend Provider
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { sound.playClick(); setProvider('openrouter'); }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                    provider === 'openrouter'
                      ? 'border-purple-500/60 bg-purple-950/40 text-white'
                      : 'border-white/10 bg-white/[0.02] text-slate-400'
                  }`}
                >
                  <span>OpenRouter (Live LLM)</span>
                  <span className="led-indicator led-emerald" />
                </button>

                <button
                  type="button"
                  onClick={() => { sound.playClick(); setProvider('local_intelligent'); }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                    provider === 'local_intelligent'
                      ? 'border-purple-500/60 bg-purple-950/40 text-white'
                      : 'border-white/10 bg-white/[0.02] text-slate-400'
                  }`}
                >
                  <span>Built-in Heuristic AI</span>
                  <span className="led-indicator led-violet" />
                </button>
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
                <span>OpenRouter API Key</span>
                <span className="text-purple-400 text-[10px]">Configured for OpenRouter</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-500/50"
                />
                <Key className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Model Selector */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Target Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
              >
                <option value="google/gemini-2.0-flash-001">Google Gemini 2.0 Flash (Fast & Sharp)</option>
                <option value="anthropic/claude-3.5-haiku">Claude 3.5 Haiku</option>
                <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B Instruct</option>
              </select>
            </div>

            {/* Audio Toggles */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={speechEnabled}
                  onChange={(e) => setSpeechEnabled(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-0"
                />
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Speech Voice</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundFxEnabled}
                  onChange={(e) => setSoundFxEnabled(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-0"
                />
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Tactile Sound FX</span>
                </div>
              </label>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <button type="submit" className="btn-skeuo-orange py-2 px-4 text-xs">
                Save AI Configuration
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Safety & Ethical Boundaries (Mandatory Requirement) */}
      <div className="liquid-glass-card p-6 space-y-3.5 border-purple-500/25 bg-purple-950/15">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
            Safety, Ethical & Product Boundaries
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
            <h5 className="font-bold text-emerald-400">What Mind Bridge AI Does:</h5>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Analyzes academic course records and exam performance.</li>
              <li>Identifies specific conceptual learning gaps with actionable severity.</li>
              <li>Personalizes syllabus sequence and study timetables to maximize retention.</li>
              <li>Supports learning with interactive Socratic tutoring and diagnostic testing.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
            <h5 className="font-bold text-rose-400">What Mind Bridge AI Does NOT Do:</h5>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Does NOT claim to replace human professors or university instructors.</li>
              <li>Does NOT diagnose mental health or psychiatric conditions.</li>
              <li>Does NOT give medical advice or clinical psychological assessments.</li>
              <li>Workload check-ins are strictly for study schedule redistribution.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Space Coders Project Credits from Presentation */}
      <div className="liquid-glass p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white font-extrabold shadow-md">
            SC
          </div>
          <div>
            <p className="font-bold text-white text-sm">Space Coders Development Team</p>
            <p className="text-[11px] text-slate-400 font-mono">
              J Sanjay Aron • J Koushik • K Yaswanth • S Razak Ali
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-purple-300 font-mono">
          <Users className="w-3.5 h-3.5" />
          <span>Mind Bridge AI Reference Specification 2026</span>
        </div>
      </div>

    </div>
  );
};
