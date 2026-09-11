import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Trash2,
  Flag,
  X,
  AlertTriangle,
  Lock,
  Mail,
  Loader2,
  FileCode
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { ModerationLogEntry } from '../../services/adminService';
import { communityService } from '../../services/communityService';
import { sound } from '../../services/soundService';
import type { Post } from '../../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostDeleted?: (postId: string) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onPostDeleted
}) => {
  const [step, setStep] = useState<'credentials' | '2fa' | 'dashboard'>('credentials');
  const [email, setEmail] = useState('admin@mindbridge.ai');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'flagged'>('all');
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('Violates Academic Integrity & Code of Conduct');
  const [moderationLogs, setModerationLogs] = useState<ModerationLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'moderation' | 'logs'>('moderation');

  useEffect(() => {
    if (!isOpen) return;

    if (adminService.isSuperAdmin()) {
      setStep('dashboard');
      refreshData();
    } else {
      setStep('credentials');
      setError(null);
    }
  }, [isOpen]);

  const refreshData = () => {
    setPosts(communityService.getPosts());
    setModerationLogs(adminService.getModerationLogs());
  };

  if (!isOpen) return null;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminService.initiateLogin(email, password);
      if (res.success && res.requires2FA) {
        sound.playClick();
        setStep('2fa');
      } else {
        setError(res.message);
      }
    } catch {
      setError('An unexpected administrative error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminService.verify2FA(email, otpCode);
      if (res.success) {
        sound.playLevelUp();
        setStep('dashboard');
        refreshData();
      } else {
        setError(res.message);
      }
    } catch {
      setError('2FA verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      sound.playClick();
      await adminService.deleteUnwantedPost(postId, deleteReason);
      setDeleteConfirmPostId(null);
      refreshData();
      if (onPostDeleted) onPostDeleted(postId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete post.');
    }
  };

  const handleToggleFlag = async (post: Post) => {
    try {
      sound.playClick();
      if (post.isFlagged) {
        await adminService.unflagPost(post.id);
      } else {
        await adminService.flagPost(post.id, 'Moderator flagged for content review');
      }
      refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to modify flag status.');
    }
  };

  const handleLogout = () => {
    adminService.logout();
    sound.playClick();
    setStep('credentials');
    onClose();
  };

  const filteredPosts = activeFilter === 'flagged' ? posts.filter((p) => p.isFlagged) : posts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Admin Command Center
                {step === 'dashboard' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-normal">
                    <ShieldCheck className="w-3 h-3" /> 2FA Verified
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Administrative authentication & campus content moderation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: CREDENTIALS */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="max-w-md mx-auto space-y-4 py-6">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-400 mb-2">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-white">Administrator Access</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Requires administrative credentials and two-factor authentication (2FA).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Admin Passcode / Access Key
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Demo hint: Use passcode <span className="font-mono text-slate-400">Admin@MindBridge2026</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                Proceed to 2FA Verification
              </button>
            </form>
          )}

          {/* STEP 2: 2FA TOTP */}
          {step === '2fa' && (
            <form onSubmit={handle2FASubmit} className="max-w-md mx-auto space-y-4 py-6">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-2">
                  <KeyRound className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter the 6-digit authentication code sent to your registered authenticator device for <span className="text-white font-medium">{email}</span>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="882026"
                  required
                  autoFocus
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>Demo default token: <span className="font-mono text-indigo-400 cursor-pointer hover:underline" onClick={() => setOtpCode('882026')}>882026</span></span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode('882026');
                      sound.playClick();
                    }}
                    className="text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Autofill
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Verify & Enter
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ADMIN MODERATION DASHBOARD */}
          {step === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Navigation & Status */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
                    SA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">Super Administrator</span>
                      <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-mono">
                        LEVEL 99 MODERATOR
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">Session active • 2FA verified</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 text-xs">
                    <button
                      onClick={() => setActiveTab('moderation')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeTab === 'moderation'
                          ? 'bg-red-600 text-white font-medium shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Posts Moderation ({posts.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('logs')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeTab === 'logs'
                          ? 'bg-red-600 text-white font-medium shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Audit Trail ({moderationLogs.length})
                    </button>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* POSTS MODERATION TAB */}
              {activeTab === 'moderation' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveFilter('all')}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          activeFilter === 'all'
                            ? 'bg-slate-700 text-white font-medium'
                            : 'text-slate-400 hover:text-white bg-slate-800/40'
                        }`}
                      >
                        All Campus Posts ({posts.length})
                      </button>
                      <button
                        onClick={() => setActiveFilter('flagged')}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                          activeFilter === 'flagged'
                            ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 font-medium'
                            : 'text-slate-400 hover:text-white bg-slate-800/40'
                        }`}
                      >
                        <Flag className="w-3 h-3 text-amber-400" />
                        Flagged / Reported ({posts.filter((p) => p.isFlagged).length})
                      </button>
                    </div>
                    <span className="text-xs text-slate-400">
                      Total {filteredPosts.length} posts retrieved
                    </span>
                  </div>

                  {filteredPosts.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-800/30 border border-slate-800">
                      <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                      <p className="text-slate-300 text-sm font-medium">No posts found under this filter</p>
                      <p className="text-slate-500 text-xs mt-1">Campus feed is clean and compliant.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPosts.map((post) => (
                        <div
                          key={post.id}
                          className={`p-4 rounded-xl border transition-all ${
                            post.isFlagged
                              ? 'bg-amber-950/20 border-amber-500/40'
                              : 'bg-slate-800/50 border-slate-700/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {post.authorAvatar ? (
                                <img
                                  src={post.authorAvatar}
                                  alt={post.authorName}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                                  {post.authorName[0]}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-white">
                                    {post.authorName}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    @{post.authorId}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-700 text-slate-300">
                                    {post.authorCollege || 'Campus'}
                                  </span>
                                  {post.visibility === 'private' && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                      Private
                                    </span>
                                  )}
                                  {post.isFlagged && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                                      <Flag className="w-2.5 h-2.5" /> Flagged: {post.flagReason || 'Reported'}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500">
                                  Posted {new Date(post.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleFlag(post)}
                                title={post.isFlagged ? 'Remove Flag' : 'Flag Post'}
                                className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                                  post.isFlagged
                                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                    : 'bg-slate-700/50 text-slate-400 hover:text-amber-300 hover:bg-slate-700'
                                }`}
                              >
                                <Flag className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeleteConfirmPostId(post.id)}
                                title="Delete Post as Admin"
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Content */}
                          <p className="text-sm text-slate-200 mt-3 whitespace-pre-line leading-relaxed">
                            {post.content}
                          </p>

                          {/* Code Snippet Attachment */}
                          {post.mediaType === 'code' && post.codeSnippet && (
                            <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                              <div className="flex items-center gap-2 text-slate-500 pb-2 mb-2 border-b border-slate-800 text-[10px]">
                                <FileCode className="w-3.5 h-3.5" />
                                <span>{post.codeLanguage || 'Code snippet'}</span>
                              </div>
                              <pre>{post.codeSnippet}</pre>
                            </div>
                          )}

                          {/* Image Attachment */}
                          {post.mediaType === 'image' && post.mediaUrl && (
                            <div className="mt-3 rounded-lg overflow-hidden max-h-60 border border-slate-700">
                              <img
                                src={post.mediaUrl}
                                alt="Post attachment"
                                className="w-full h-auto object-cover"
                              />
                            </div>
                          )}

                          {/* Post Meta */}
                          <div className="mt-3 pt-2 border-t border-slate-750 flex items-center justify-between text-xs text-slate-400">
                            <div className="flex items-center gap-4">
                              <span>❤️ {post.likesCount} Likes</span>
                              <span>💬 {post.commentsCount} Comments</span>
                              <span>🔄 {post.repostsCount} Reposts</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-500">ID: {post.id}</span>
                          </div>

                          {/* Inline Delete Confirmation Dialog */}
                          {deleteConfirmPostId === post.id && (
                            <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/50 space-y-2 animate-fade-in">
                              <div className="flex items-center gap-2 text-red-300 text-xs font-semibold">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                Confirm Permanent Post Removal (Admin Moderation)
                              </div>
                              <input
                                type="text"
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder="State reason for removal (logged in audit trail)"
                                className="w-full text-xs px-3 py-1.5 bg-slate-900 border border-red-500/30 rounded-lg text-white"
                              />
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  onClick={() => setDeleteConfirmPostId(null)}
                                  className="px-3 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="px-3 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium shadow-md shadow-red-500/30 flex items-center gap-1.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* AUDIT LOGS TAB */}
              {activeTab === 'logs' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Administrative Action Audit Trail
                    </h3>
                    <span className="text-xs text-slate-500">
                      Immutable action history
                    </span>
                  </div>

                  {moderationLogs.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-800/30 border border-slate-800 text-slate-400 text-xs">
                      No moderation events recorded in this session.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-900/60 overflow-hidden">
                      {moderationLogs.map((log) => (
                        <div key={log.id} className="p-3 text-xs flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                log.action === 'delete_post'
                                  ? 'bg-red-500/20 text-red-300'
                                  : log.action === 'flag_post'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                {log.action.toUpperCase()}
                              </span>
                              <span className="text-slate-300 font-mono">Target: {log.targetId}</span>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-1">Reason: {log.reason}</p>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
