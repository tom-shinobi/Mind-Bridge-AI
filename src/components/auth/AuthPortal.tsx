import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  Fingerprint,
  AlertCircle,
  CheckCircle2,
  Database,
  RefreshCw,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { sound } from '../../services/soundService';
import { authService } from '../../services/authService';
import { isSupabaseConfigured, getSupabaseConfig, saveSupabaseConfig } from '../../services/supabaseClient';
import type { AuthUser } from '../../types';
import { ParticleBackground } from '../ParticleBackground';

interface AuthPortalProps {
  onSuccess: (user: AuthUser) => void;
  onContinueDemo: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  onSuccess,
  onContinueDemo
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [hasPasskey, setHasPasskey] = useState(false);
  const [isPasskeyEnrollModalOpen, setIsPasskeyEnrollModalOpen] = useState(false);
  const [enrollEmail, setEnrollEmail] = useState('');
  const [isEnrollingPasskey, setIsEnrollingPasskey] = useState(false);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Supabase Configuration Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configUrl, setConfigUrl] = useState('');
  const [configKey, setConfigKey] = useState('');

  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    // Check if biometric passkeys are enrolled on this device
    authService.isPasskeySupported().then((supported) => {
      if (supported && authService.hasLocalPasskey()) {
        setHasPasskey(true);
      }
    });

    const cfg = getSupabaseConfig();
    setConfigUrl(cfg.url);
    setConfigKey(cfg.anonKey);
  }, []);

  const handleEnrollPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollEmail) {
      setErrorMsg('Please enter your email to register Windows Hello passkey.');
      return;
    }
    sound.playClick();
    setIsEnrollingPasskey(true);
    setErrorMsg(null);

    const userId = crypto.randomUUID();
    const res = await authService.registerPasskey(userId, enrollEmail.trim(), 'Scholar');
    setIsEnrollingPasskey(false);

    if (res.error) {
      sound.playError();
      setErrorMsg(res.error);
    } else {
      sound.playSuccess();
      setHasPasskey(true);
      setIsPasskeyEnrollModalOpen(false);
      onSuccess({
        id: userId,
        email: enrollEmail.trim(),
        name: 'Scholar'
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    sound.playClick();
    setIsLoading(true);
    setErrorMsg(null);

    const res = await authService.signInWithEmail(email.trim(), password);
    setIsLoading(false);

    if (res.error) {
      sound.playError();
      setErrorMsg(res.error);
    } else if (res.user) {
      sound.playSuccess();
      onSuccess(res.user);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    sound.playClick();
    setIsLoading(true);
    setErrorMsg(null);

    const res = await authService.signUpWithEmail(email.trim(), password, fullName.trim() || 'Scholar');
    setIsLoading(false);

    if (res.error) {
      sound.playError();
      setErrorMsg(res.error);
    } else if (res.user) {
      sound.playSuccess();
      setInfoMsg('Account created! Logging you in...');
      onSuccess(res.user);
    }
  };

  const handleGoogleSignIn = async () => {
    sound.playClick();
    setIsLoading(true);
    setErrorMsg(null);
    const res = await authService.signInWithGoogle();
    setIsLoading(false);
    if (res.error) {
      sound.playError();
      setErrorMsg(res.error);
    }
  };

  const handleBiometricUnlock = async () => {
    sound.playClick();
    setIsLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const res = await authService.authenticateWithPasskey();
    setIsLoading(false);

    if (res.isFirstTime || (!res.success && (res.error?.toLowerCase().includes('no passkey') || res.error?.toLowerCase().includes('no windows hello')))) {
      setEnrollEmail(email.trim());
      setIsPasskeyEnrollModalOpen(true);
      return;
    }

    if (res.error) {
      sound.playError();
      setErrorMsg(res.error);
    } else if (res.user) {
      sound.playSuccess();
      onSuccess(res.user);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    sound.playClick();
    setIsLoading(true);
    const res = await authService.resetPassword(resetEmail.trim());
    setIsLoading(false);
    if (res.error) {
      sound.playError();
      setErrorMsg(res.error);
    } else {
      sound.playSuccess();
      setResetSuccess(true);
    }
  };

  const handleSaveConfig = () => {
    sound.playSuccess();
    saveSupabaseConfig(configUrl, configKey);
    setIsConfigModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#020409] text-[#F5F5F7] flex flex-col relative selection:bg-white/20 selection:text-white font-body p-4 sm:p-6 justify-center items-center">
      
      {/* Background Dynamic Particles & Ambient Fluid Ribbons */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <ParticleBackground />
        <div className="chromatic-ribbon-purple -top-[140px] left-[15%] opacity-25" />
        <div className="chromatic-ribbon-cyan bottom-[10%] right-[10%] opacity-20" />
        <div className="chromatic-ribbon-magenta top-[40%] right-[25%]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(2,4,9,0.85)_100%)] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/30 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_8px_25px_rgba(0,0,0,0.5)] mb-1">
            <Sparkles className="w-6 h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-heading">
            MindBridge <span className="text-[12px] px-2 py-0.5 rounded-full bg-white/10 text-white/90 font-mono font-medium border border-white/20">AI</span>
          </h1>
          <p className="text-xs text-[#A1A1A6]">
            Personalized Academic Intelligence & Socratic Learning
          </p>
        </div>

        {/* Supabase Status Pill */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono flex items-center gap-1.5 border transition-all ${
              supabaseReady
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Database className="w-3 h-3" />
            <span>{supabaseReady ? 'Supabase Database Connected' : 'Configure Supabase Keys'}</span>
          </button>
        </div>

        {/* Main Auth Card */}
        <div className="apple-liquid-glass p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-5">
          
          {/* Sign In vs Sign Up Tabs */}
          <div className="flex p-1 rounded-2xl bg-black/50 border border-white/10 text-xs font-medium">
            <button
              type="button"
              onClick={() => { sound.playClick(); setTab('signin'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                tab === 'signin'
                  ? 'bg-white/[0.12] text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { sound.playClick(); setTab('signup'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                tab === 'signup'
                  ? 'bg-white/[0.12] text-white shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            disabled={isLoading || !supabaseReady}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-xs font-semibold text-white flex items-center justify-center gap-2.5 transition-all shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.2 8.9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.2-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Sign In with Windows Hello / Passkey Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleBiometricUnlock}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-pink-600/30 hover:from-purple-600/40 hover:via-indigo-600/40 hover:to-pink-600/40 border border-purple-400/40 text-xs font-semibold text-white flex items-center justify-between transition-all shadow-[0_0_18px_rgba(168,85,247,0.22)] group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Sign In with Windows Hello / Passkey</p>
                <p className="text-[10px] text-purple-200/80 font-mono">Face, Fingerprint, or PIN</p>
              </div>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-200 border border-purple-400/30">
              {hasPasskey ? '1-Tap Unlock' : 'Biometrics'}
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">Or with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={tab === 'signin' ? handleSignIn : handleSignUp} className="space-y-3.5">
            {tab === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sanjay Aron"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass-input text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass-input text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase text-slate-400">Password</label>
                {tab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setIsResetModalOpen(true); setResetSuccess(false); }}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-mono"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl liquid-glass-input text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>



            {tab === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass-input text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl liquid-glass-danger border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="p-3 rounded-xl liquid-glass-emerald border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{infoMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !supabaseReady}
              className="w-full btn-apple-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 shadow-xl mt-2 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{tab === 'signin' ? 'Sign In' : 'Create Student Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Demo Mode Fallback Button */}
          <div className="pt-2 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={() => { sound.playClick(); onContinueDemo(); }}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <span>Or explore in</span>
              <strong className="text-purple-300 underline font-semibold">Guest Demo Mode</strong>
              <ArrowRight className="w-3 h-3 text-purple-400" />
            </button>
          </div>

        </div>

      </div>

      {/* Password Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="apple-liquid-glass max-w-sm w-full p-6 space-y-4 rounded-3xl border border-white/20 shadow-2xl">
            <h3 className="text-base font-bold text-white">Reset Password</h3>
            <p className="text-xs text-slate-400">
              Enter your registered email and we'll send a password recovery link.
            </p>

            {resetSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Password reset link sent! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-apple-primary py-2 text-xs font-semibold"
                >
                  Send Recovery Link
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="w-full btn-apple-glass py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Supabase Config Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="apple-liquid-glass max-w-md w-full p-6 space-y-4 rounded-3xl border border-white/20 shadow-2xl text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Supabase Connection Settings</h3>
            </div>

            <p className="text-slate-400 leading-relaxed">
              Connect your Supabase project to enable real database persistence, user accounts, and row-level security. (You can also define these in <code>.env</code> as <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  value={configUrl}
                  onChange={(e) => setConfigUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Supabase Anon Key</label>
                <input
                  type="text"
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  placeholder="eyJh..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="btn-apple-glass py-2 px-4 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="btn-apple-primary py-2 px-5 text-xs font-semibold"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Windows Hello / Passkey Enrollment Modal */}
      {isPasskeyEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="apple-liquid-glass p-6 sm:p-7 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Setup Windows Hello / Passkey</h3>
                <p className="text-xs text-slate-400">Unlock MindBridge with Face, Fingerprint, or PIN</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              No passkey was found for this device yet. Enter your email to create a secure, hardware-backed Windows Hello credential.
            </p>

            <form onSubmit={handleEnrollPasskey} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Account Email</label>
                <input
                  type="email"
                  required
                  value={enrollEmail}
                  onChange={(e) => setEnrollEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasskeyEnrollModalOpen(false)}
                  className="btn-apple-glass py-2 px-4 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEnrollingPasskey}
                  className="btn-apple-primary py-2 px-5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  {isEnrollingPasskey ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying with Windows Hello...</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-3.5 h-3.5 text-purple-300" />
                      <span>Register Windows Hello</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
