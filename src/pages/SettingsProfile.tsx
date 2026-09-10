import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Key,
  Volume2,
  Sparkles,
  Users,
  Brain,
  Fingerprint,
  LogOut,
  RotateCcw,
  AlertCircle,
  Shield,
  Mail,
  Loader2,
  Lock
} from 'lucide-react';
import type { StudentProfile, AISettings, MemorySummary, AtmosphereTheme } from '../types';
import { sound } from '../services/soundService';
import { authService } from '../services/authService';
import { supabaseDataService } from '../services/supabaseDataService';

interface SettingsProfileProps {
  profile: StudentProfile;
  aiSettings: AISettings;
  onUpdateProfile: (profile: StudentProfile) => void;
  onUpdateAISettings: (settings: AISettings) => void;
  onSignOut?: () => void;
}

export const SettingsProfile: React.FC<SettingsProfileProps> = ({
  profile,
  aiSettings,
  onUpdateProfile,
  onUpdateAISettings,
  onSignOut
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [degree, setDegree] = useState(profile.degree);
  const [targetCgpa, setTargetCgpa] = useState(profile.targetCgpa);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // AI settings
  const [provider, setProvider] = useState(aiSettings.provider);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(aiSettings.model || 'gemini-2.5-flash');
  const [speechEnabled, setSpeechEnabled] = useState(aiSettings.speechEnabled);
  const [soundFxEnabled, setSoundFxEnabled] = useState(aiSettings.soundFxEnabled);
  const [theme, setTheme] = useState<AtmosphereTheme>(aiSettings.theme || 'dusk');

  // Persistent Academic Memory State
  const defaultMemory: MemorySummary = {
    learningStyle: 'Conceptual with derivations and real-world engineering examples',
    currentFocus: 'Relational Database Design & Normalization',
    academicGoal: `Achieve ${profile.targetCgpa || 9.0}+ CGPA in ${profile.degree || 'Computer Science'}`,
    studyPreferences: 'Deep focus blocks in mornings, Socratic diagnostic testing',
    difficultTopics: ['Query Optimization', 'B+ Tree Indexing', 'Concurrency Control'],
    strengths: ['Entity Relationship Modeling', 'SQL DDL/DML', 'Relational Algebra'],
    notes: 'Prioritize active recall, visual schematics, and code-based problem solving.',
    lastUpdated: new Date().toISOString()
  };

  const [memory, setMemory] = useState<MemorySummary>(profile.memorySummary || defaultMemory);
  const [difficultInput, setDifficultInput] = useState(
    (profile.memorySummary?.difficultTopics || defaultMemory.difficultTopics).join(', ')
  );
  const [strengthsInput, setStrengthsInput] = useState(
    (profile.memorySummary?.strengths || defaultMemory.strengths).join(', ')
  );
  const [memorySavedSuccess, setMemorySavedSuccess] = useState(false);

  // Biometric / Passkey State
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);
  const [isPasskeyEnrolled, setIsPasskeyEnrolled] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyStatus, setPasskeyStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Account / Reset Password State
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    authService.isPasskeySupported().then((supported) => {
      setIsPasskeySupported(supported);
      if (supported && (authService.hasLocalPasskey() || profile.biometricEnabled)) {
        setIsPasskeyEnrolled(true);
      }
    });
  }, [profile.biometricEnabled]);

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

  const handleSelectTheme = (newTheme: AtmosphereTheme) => {
    sound.playClick();
    setTheme(newTheme);
    const finalApiKey = apiKey.trim() || aiSettings.openRouterApiKey;
    onUpdateAISettings({
      ...aiSettings,
      provider,
      openRouterApiKey: finalApiKey,
      model,
      speechEnabled,
      soundFxEnabled,
      theme: newTheme
    });
  };

  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    const finalApiKey = apiKey.trim() || aiSettings.openRouterApiKey;
    onUpdateAISettings({
      provider,
      openRouterApiKey: finalApiKey,
      model,
      speechEnabled,
      soundFxEnabled,
      theme
    });
    setApiKey('');
    sound.setEnabled(soundFxEnabled);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    const updatedMemory: MemorySummary = {
      ...memory,
      difficultTopics: difficultInput.split(',').map((s) => s.trim()).filter(Boolean),
      strengths: strengthsInput.split(',').map((s) => s.trim()).filter(Boolean),
      lastUpdated: new Date().toISOString()
    };
    setMemory(updatedMemory);
    onUpdateProfile({
      ...profile,
      memorySummary: updatedMemory
    });
    await supabaseDataService.saveMemorySummary(profile.id, updatedMemory);
    setMemorySavedSuccess(true);
    setTimeout(() => setMemorySavedSuccess(false), 3500);
  };

  const handleResetMemory = async () => {
    if (confirm('Reset your MindBridge Academic Memory to initial baseline? This will clear personalized learning notes and topic preferences.')) {
      sound.playClick();
      setMemory(defaultMemory);
      setDifficultInput(defaultMemory.difficultTopics.join(', '));
      setStrengthsInput(defaultMemory.strengths.join(', '));
      onUpdateProfile({
        ...profile,
        memorySummary: defaultMemory
      });
      await supabaseDataService.saveMemorySummary(profile.id, defaultMemory);
      setMemorySavedSuccess(true);
      setTimeout(() => setMemorySavedSuccess(false), 3500);
    }
  };

  const handleRegisterPasskey = async () => {
    setPasskeyLoading(true);
    setPasskeyStatus(null);
    sound.playClick();
    try {
      const res = await authService.registerPasskey(profile.id, profile.email, profile.name);
      if (res.success) {
        sound.playSuccess();
        setIsPasskeyEnrolled(true);
        setPasskeyStatus({
          type: 'success',
          message: 'Biometric passkey successfully registered! You can now unlock MindBridge AI with your face or fingerprint.'
        });
        onUpdateProfile({
          ...profile,
          biometricEnabled: true
        });
      } else {
        sound.playError();
        setPasskeyStatus({
          type: 'error',
          message: res.error || 'Failed to register biometric passkey.'
        });
      }
    } catch (err: unknown) {
      const e = err as Error;
      sound.playError();
      setPasskeyStatus({
        type: 'error',
        message: e.message || 'Passkey enrollment failed.'
      });
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!profile.email) return;
    setResetLoading(true);
    sound.playClick();
    const res = await authService.resetPassword(profile.email);
    setResetLoading(false);
    if (res.success) {
      sound.playSuccess();
      setResetEmailSent(true);
      setTimeout(() => setResetEmailSent(false), 6000);
    } else {
      sound.playError();
      alert(res.error || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="apple-liquid-glass p-6 relative overflow-hidden">
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
        <div className="p-3.5 rounded-xl liquid-glass-emerald border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Configuration saved successfully and synchronized across the application.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Student Profile Card */}
        <div className="apple-liquid-glass p-6 space-y-4">
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
                className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white focus:outline-none focus:border-purple-500/50"
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
                className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white focus:outline-none focus:border-purple-500/50"
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
                className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white focus:outline-none focus:border-purple-500/50"
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
                  className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-block text-slate-400 opacity-70 cursor-not-allowed"
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
                  className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <button type="submit" className="btn-apple-primary py-2 px-5 text-xs font-semibold">
                Save Academic Profile
              </button>
            </div>
          </form>
        </div>

        {/* Right: AI Engine Settings */}
        <div className="apple-liquid-glass p-6 space-y-4">
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
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    provider === 'openrouter'
                      ? 'border-purple-500/60 bg-purple-950/40 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                      : 'liquid-glass-block border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>OpenRouter (Live LLM)</span>
                  <span className="led-indicator led-emerald" />
                </button>

                <button
                  type="button"
                  onClick={() => { sound.playClick(); setProvider('local_intelligent'); }}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    provider === 'local_intelligent'
                      ? 'border-purple-500/60 bg-purple-950/40 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                      : 'liquid-glass-block border-white/10 text-slate-400 hover:text-white'
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
                <span>AI Provider API Key</span>
                <span className="text-emerald-400 text-[10px]">Active & Encrypted (Hidden)</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="•••••••••••••••••••••••••••••••• (Leave blank to keep active key)"
                  className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white font-mono text-xs focus:outline-none focus:border-purple-500/50"
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
                className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white text-xs"
              >
                <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Google AI Studio - Active Default)</option>
                <option value="liquid/lfm-2.5-2.6b:free">LiquidAI: LFM 2.5 2.6B (Free)</option>
                <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B Instruct</option>
                <option value="anthropic/claude-3.5-haiku">Claude 3.5 Haiku</option>
              </select>
            </div>

            {/* Atmosphere Theme Selector */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Atmosphere & Background Theme</span>
                <span className="text-amber-400 text-[10px]">Real-time Dynamic Shader</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectTheme('dusk')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    theme === 'dusk'
                      ? 'bg-gradient-to-r from-orange-500/20 via-pink-500/15 to-purple-500/20 border-orange-400/60 shadow-[0_0_15px_rgba(251,146,60,0.25)] text-white'
                      : 'bg-white/[0.04] border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <span className="text-xl">🌅</span>
                  <div>
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <span>Sunlight Dusk</span>
                      {theme === 'dusk' && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                      Solar amber dusk sun setting over cosmic twilight nebula
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTheme('nebula')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    theme === 'nebula'
                      ? 'bg-gradient-to-r from-purple-500/20 via-cyan-500/15 to-blue-500/20 border-cyan-400/60 shadow-[0_0_15px_rgba(56,189,248,0.25)] text-white'
                      : 'bg-white/[0.04] border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <span className="text-xl">🌌</span>
                  <div>
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <span>Cosmic Nebula</span>
                      {theme === 'nebula' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                      Deep obsidian space with electric violet, neon cyan & starlight
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Audio Toggles */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2.5 p-3 rounded-xl liquid-glass-block cursor-pointer hover:border-white/20 transition-all">
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

              <label className="flex items-center gap-2.5 p-3 rounded-xl liquid-glass-block cursor-pointer hover:border-white/20 transition-all">
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
              <button type="submit" className="btn-apple-primary py-2 px-5 text-xs font-semibold">
                Save AI Configuration
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* MindBridge Academic Memory Profile (Persistent Tutor Intelligence) */}
      <div className="apple-liquid-glass p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <span>MindBridge Academic Memory Profile</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI Context Injection
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Persistent cognitive profile injected into the Socratic AI Tutor for adaptive explanations and guidance.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetMemory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Memory</span>
          </button>
        </div>

        {memorySavedSuccess && (
          <div className="p-3 rounded-xl liquid-glass-cyan border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Academic memory profile synchronized with database and active Socratic context!</span>
          </div>
        )}

        <form onSubmit={handleSaveMemory} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Learning Style & Explanation Preference
              </label>
              <input
                type="text"
                value={memory.learningStyle}
                onChange={(e) => setMemory({ ...memory, learningStyle: e.target.value })}
                placeholder="e.g. First principles, visual diagrams, code examples"
                className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Current Academic Focus Topic
              </label>
              <input
                type="text"
                value={memory.currentFocus}
                onChange={(e) => setMemory({ ...memory, currentFocus: e.target.value })}
                placeholder="e.g. Relational Algebra, B+ Trees, Concurrency"
                className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Primary Academic Goal
              </label>
              <input
                type="text"
                value={memory.academicGoal}
                onChange={(e) => setMemory({ ...memory, academicGoal: e.target.value })}
                placeholder="e.g. Achieve 9.0+ CGPA, ace upcoming Midterms"
                className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Study Habits & Time Preferences
              </label>
              <input
                type="text"
                value={memory.studyPreferences}
                onChange={(e) => setMemory({ ...memory, studyPreferences: e.target.value })}
                placeholder="e.g. Deep morning focus, 45-min pomodoro intervals"
                className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Known Difficult Topics (comma separated)
              </label>
              <input
                type="text"
                value={difficultInput}
                onChange={(e) => setDifficultInput(e.target.value)}
                placeholder="Query Optimization, Concurrency Control, B-Trees"
                className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Academic Strengths & Mastered Areas (comma separated)
              </label>
              <input
                type="text"
                value={strengthsInput}
                onChange={(e) => setStrengthsInput(e.target.value)}
                placeholder="ER Diagrams, SQL Queries, Normalization"
                className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Pedagogical Notes for AI Tutor
            </label>
            <textarea
              rows={2}
              value={memory.notes || ''}
              onChange={(e) => setMemory({ ...memory, notes: e.target.value })}
              placeholder="Any special guidance or preferences for how the AI Tutor should guide you..."
              className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
            <span className="text-[11px] text-slate-400 font-mono">
              Last synchronized: {memory.lastUpdated ? new Date(memory.lastUpdated).toLocaleDateString() : 'Never'}
            </span>
            <button type="submit" className="btn-apple-primary py-2 px-5 text-xs font-semibold">
              Save Academic Memory Profile
            </button>
          </div>
        </form>
      </div>

      {/* Passkey Biometrics & Account Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biometric & Device Passkeys Card */}
        <div className="apple-liquid-glass p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
            <Fingerprint className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Biometric & Passkey Authentication
              </h3>
              <p className="text-[11px] text-slate-400">
                Unlock MindBridge instantly using device biometric sensors.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Status */}
            <div className="p-3.5 rounded-2xl liquid-glass-block flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPasskeyEnrolled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'}`}>
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {isPasskeyEnrolled ? 'Biometric Passkey Active' : 'No Passkey Enrolled'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isPasskeyEnrolled
                      ? 'This device is verified for Face ID / Windows Hello login.'
                      : 'Enroll this device for 1-click biometric sign-in.'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono border ${isPasskeyEnrolled ? 'liquid-glass-emerald text-emerald-300 border-emerald-500/40' : 'bg-slate-800/60 text-slate-400 border-slate-700'}`}>
                {isPasskeyEnrolled ? 'ENROLLED' : 'DISABLED'}
              </span>
            </div>

            {passkeyStatus && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${passkeyStatus.type === 'success' ? 'liquid-glass-emerald border-emerald-500/40 text-emerald-200' : 'liquid-glass-danger border-rose-500/40 text-rose-200'}`}>
                {passkeyStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                <span>{passkeyStatus.message}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleRegisterPasskey}
              disabled={passkeyLoading || !isPasskeySupported}
              className="w-full py-2.5 px-4 rounded-xl btn-apple-primary text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {passkeyLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
              ) : (
                <Fingerprint className="w-4 h-4 text-purple-300" />
              )}
              <span>{isPasskeyEnrolled ? 'Re-enroll This Device (Passkey)' : 'Register This Device (Face ID / Windows Hello)'}</span>
            </button>

            {/* Zero Biometric Storage Explainer */}
            <div className="p-3.5 rounded-2xl liquid-glass-block space-y-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Zero Biometric Storage Guarantee</span>
              </div>
              <p className="leading-relaxed">
                MindBridge AI never touches, records, or stores your face images, embeddings, or fingerprints. Biometric authentication is handled exclusively by your hardware device (W3C WebAuthn standard).
              </p>
            </div>
          </div>
        </div>

        {/* Real User Account & Session Card */}
        <div className="apple-liquid-glass p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
            <Lock className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Account & Authentication Session
              </h3>
              <p className="text-[11px] text-slate-400">
                Manage your authenticated identity and cloud synchronization.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="p-3.5 rounded-2xl liquid-glass-block space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-mono">ACCOUNT EMAIL</span>
                <span className="text-white font-medium">{profile.email || 'scholar@mindbridge.edu'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-mono">USER IDENTIFIER</span>
                <span className="text-slate-300 font-mono text-[11px]">{profile.id?.slice(0, 18) || 'student-demo'}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-mono">MEMBER SINCE</span>
                <span className="text-slate-300 font-mono text-[11px]">{profile.joinedDate || '2026'}</span>
              </div>
            </div>

            {resetEmailSent && (
              <div className="p-3 rounded-xl liquid-glass-emerald border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Password reset link sent to your email address.</span>
              </div>
            )}

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={resetLoading}
                className="flex-1 py-2.5 px-3 rounded-xl btn-apple-glass text-white text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {resetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5 text-slate-400" />}
                <span>Send Password Reset</span>
              </button>

              {onSignOut && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to sign out of MindBridge AI?')) {
                      sound.playClick();
                      onSignOut();
                    }
                  }}
                  className="py-2.5 px-4 rounded-xl liquid-glass-danger border border-rose-500/30 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="apple-liquid-glass liquid-glass-adaptive p-6 space-y-3.5">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
            Safety, Ethical & Product Boundaries
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl liquid-glass-block space-y-1.5">
            <h5 className="font-bold text-emerald-400">What Mind Bridge AI Does:</h5>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <li>Analyzes academic course records and exam performance.</li>
              <li>Identifies specific conceptual learning gaps with actionable severity.</li>
              <li>Personalizes syllabus sequence and study timetables to maximize retention.</li>
              <li>Supports learning with interactive Socratic tutoring and diagnostic testing.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl liquid-glass-block space-y-1.5">
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

      {/* ==========================================================================
          SPACE CODERS CORE ENGINEERING TEAM SHOWCASE (Expanded Executive Section)
          ========================================================================== */}
      <div className="apple-liquid-glass p-6 sm:p-10 rounded-3xl border border-white/20 shadow-2xl space-y-8 relative overflow-hidden">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 p-0.5 shadow-[0_0_25px_rgba(168,85,247,0.4)] flex-shrink-0">
              <div className="w-full h-full rounded-2xl bg-[#0a0518] flex items-center justify-center font-heading font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-tr from-purple-300 via-pink-200 to-orange-200">
                SC
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-heading">
                  Space Coders Core Engineering Team
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-mono font-bold">
                  2026 ARCHITECTS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#A1A1A6] mt-1 leading-relaxed max-w-2xl">
                The minds behind MindBridge AI — crafting autonomous academic intelligence, adaptive socratic feedback loops, and next-generation liquid glass interfaces.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <span className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-xs font-mono text-purple-300 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              <span>4 Engineers</span>
            </span>
          </div>
        </div>

        {/* 4 Member Profile Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Member 1: J Sanjay Aron */}
          <div className="liquid-glass-block p-5 rounded-2xl border border-white/10 hover:border-purple-400/40 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-base text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] group-hover:scale-105 transition-transform">
                  SA
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 font-bold">
                  LEAD ARCHITECT
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors font-heading">
                  J Sanjay Aron
                </h4>
                <p className="text-xs text-purple-300 font-mono font-medium mt-0.5">
                  Lead AI & Full-Stack Architect
                </p>
              </div>
              <p className="text-xs text-[#A1A1A6] leading-relaxed">
                Spearheaded system architecture, Socratic AI Tutor orchestration, Supabase authentication integration, and autonomous loop orchestration.
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">System Design</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">AI Pipelines</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">Supabase</span>
            </div>
          </div>

          {/* Member 2: J Koushik */}
          <div className="liquid-glass-block p-5 rounded-2xl border border-white/10 hover:border-pink-400/40 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center font-bold text-base text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] group-hover:scale-105 transition-transform">
                  JK
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 font-bold">
                  UI / UX LEAD
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-pink-200 transition-colors font-heading">
                  J Koushik
                </h4>
                <p className="text-xs text-pink-300 font-mono font-medium mt-0.5">
                  Frontend & Liquid Glass Engineer
                </p>
              </div>
              <p className="text-xs text-[#A1A1A6] leading-relaxed">
                Engineered the authentic Apple Liquid Glass aesthetic, Unified Floating Navigation Island, dynamic chromatic canvas, and responsive animations.
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">Liquid Glass</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">React / Vite</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">Design Systems</span>
            </div>
          </div>

          {/* Member 3: K Yaswanth */}
          <div className="liquid-glass-block p-5 rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-base text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
                  KY
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold">
                  INTELLIGENCE
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors font-heading">
                  K Yaswanth
                </h4>
                <p className="text-xs text-cyan-300 font-mono font-medium mt-0.5">
                  Academic ML & Diagnostics Specialist
                </p>
              </div>
              <p className="text-xs text-[#A1A1A6] leading-relaxed">
                Formulated the 3-tier gap severity classification algorithms, syllabus dynamic re-ranking weights, and diagnostic quiz assessment matrix.
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">Curriculum ML</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">Diagnostics</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">Analytics</span>
            </div>
          </div>

          {/* Member 4: S Razak Ali */}
          <div className="liquid-glass-block p-5 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-base text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform">
                  RA
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
                  SECURITY & DEVOPS
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors font-heading">
                  S Razak Ali
                </h4>
                <p className="text-xs text-amber-300 font-mono font-medium mt-0.5">
                  DevOps & Systems Security Engineer
                </p>
              </div>
              <p className="text-xs text-[#A1A1A6] leading-relaxed">
                Implemented biometric WebAuthn passkey enrollment, client-side cryptographic storage, state isolation, and production pipeline deployment.
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">WebAuthn</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">DevOps</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/10">Cloud Sync</span>
            </div>
          </div>

        </div>

        {/* Team Footer Note */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#A1A1A6]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Engineered by Space Coders for Academic Excellence</span>
          </div>
          <span className="text-white/60">MindBridge AI Reference Architecture • 2026 Production Build</span>
        </div>

      </div>

    </div>
  );
};
