import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Flame,
  Users,
  Send,
  Heart,
  Repeat2,
  Bookmark,
  Image as ImageIcon,
  Code2,
  Lock,
  Globe,
  Hash,
  Check,
  Copy,
  Trash2,
  Flag,
  Search,
  Sparkles,
  BookOpen,
  Volume2,
  Circle,
  X,
  ChevronRight,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { communityService } from '../services/communityService';
import { sound } from '../services/soundService';
import type {
  Post,
  CommunityServer,
  ChatMessage,
  DirectMessage,
  DMConversation,
  FriendSuggestion,
  StudentProfile,
  LearningGap
} from '../types';

interface CommunityHubProps {
  profile: StudentProfile;
  gaps?: LearningGap[];
  onNavigate?: (tab: string, extra?: any) => void;
  onUpdateProfile?: (updated: StudentProfile) => void;
}

type HubTab = 'pulse' | 'squads' | 'dms' | 'matchmaker';

export const CommunityHub: React.FC<CommunityHubProps> = ({
  profile,
  gaps = [],
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState<HubTab>('pulse');
  const [isPrivateAccount, setIsPrivateAccount] = useState<boolean>(profile.isPrivateAccount || false);

  // =========================================================================
  // 1. CAMPUS PULSE (TWITTER/X FEED) STATE
  // =========================================================================
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedFilter, setFeedFilter] = useState<'all' | 'feed' | 'code' | 'media' | 'bookmarks'>('all');
  const [newPostText, setNewPostText] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'code' | 'none'>('none');
  const [mediaUrl, setMediaUrl] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [tagInput, setTagInput] = useState('');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // =========================================================================
  // 2. STUDY SQUADS (DISCORD SERVERS) STATE
  // =========================================================================
  const [servers, setServers] = useState<CommunityServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string>('server_global');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('ch_global_general');
  const [channelMessages, setChannelMessages] = useState<ChatMessage[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const [isChatCodeOpen, setIsChatCodeOpen] = useState(false);
  const [chatCodeText, setChatCodeText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // =========================================================================
  // 3. DIRECT MESSAGES (INSTAGRAM STYLE) STATE
  // =========================================================================
  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeDmMessages, setActiveDmMessages] = useState<DirectMessage[]>([]);
  const [dmInputText, setDmInputText] = useState('');
  const dmBottomRef = useRef<HTMLDivElement | null>(null);

  // =========================================================================
  // 4. STUDY BUDDY MATCHMAKER (SNAPCHAT STYLE) STATE
  // =========================================================================
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [matchSearchQuery, setMatchSearchQuery] = useState('');
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  // =========================================================================
  // INITIALIZATION & SUBSCRIPTIONS
  // =========================================================================
  useEffect(() => {
    // Load Posts
    setPosts(communityService.getPosts());

    // Load Discord Servers
    const allServers = communityService.getServers();
    setServers(allServers);
    if (allServers.length > 0 && !selectedServerId) {
      setSelectedServerId(allServers[0].id);
      if (allServers[0].channels.length > 0) {
        setSelectedChannelId(allServers[0].channels[0].id);
      }
    }

    // Load DMs
    const allDMs = communityService.getConversations(profile.id);
    setConversations(allDMs);
    if (allDMs.length > 0 && !activeConversationId) {
      setActiveConversationId(allDMs[0].id);
      setActiveDmMessages(communityService.getDirectMessages(allDMs[0].id));
    }

    // Load Friend Matches
    setSuggestions(communityService.getFriendSuggestions(profile, gaps));
    setFollowingIds(communityService.getFollowingUserIds());
  }, [profile, gaps]);

  // Sync Discord Channel Messages when Channel Changes
  useEffect(() => {
    if (!selectedChannelId) return;
    const msgs = communityService.getChannelMessages(selectedChannelId);
    setChannelMessages(msgs);

    // Subscribe to realtime updates
    const unsubscribe = communityService.subscribeChannel(selectedChannelId, (newMsg: ChatMessage) => {
      setChannelMessages((prev) => [...prev, newMsg]);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [selectedChannelId]);

  // Sync Active DM messages
  useEffect(() => {
    if (!activeConversationId) return;
    setActiveDmMessages(communityService.getDirectMessages(activeConversationId));
    setTimeout(() => dmBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [activeConversationId]);

  // Account Visibility Toggle
  const handleTogglePrivacy = () => {
    const newStatus = !isPrivateAccount;
    setIsPrivateAccount(newStatus);
    sound.playClick();
    if (onUpdateProfile) {
      onUpdateProfile({ ...profile, isPrivateAccount: newStatus });
    }
  };

  // =========================================================================
  // POST ACTIONS (TWITTER / X)
  // =========================================================================
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !mediaUrl && !codeSnippet.trim()) return;

    sound.playLevelUp();
    const tags = tagInput
      .split(' ')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const created = communityService.createPost(
      profile,
      newPostText,
      mediaType,
      mediaUrl || undefined,
      codeSnippet.trim() || undefined,
      codeLanguage,
      tags
    );

    setPosts([created, ...posts]);
    setNewPostText('');
    setMediaType('none');
    setMediaUrl('');
    setCodeSnippet('');
    setTagInput('');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setMediaUrl(event.target.result);
        setMediaType('image');
        sound.playClick();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleLike = (postId: string) => {
    sound.playClick();
    const updated = communityService.toggleLike(postId, profile.id);
    if (updated) {
      setPosts(posts.map((p) => (p.id === postId ? { ...updated } : p)));
    }
  };

  const handleToggleRepost = (postId: string) => {
    sound.playClick();
    const updated = communityService.toggleRepost(postId, profile.id);
    if (updated) {
      setPosts(posts.map((p) => (p.id === postId ? { ...updated } : p)));
    }
  };

  const handleToggleBookmark = (postId: string) => {
    sound.playClick();
    const updated = communityService.toggleBookmark(postId, profile.id);
    if (updated) {
      setPosts(posts.map((p) => (p.id === postId ? { ...updated } : p)));
    }
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    sound.playClick();
    const comment = communityService.addComment(postId, profile, commentText);
    if (comment) {
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                commentsCount: p.commentsCount + 1,
                comments: [...p.comments, comment]
              }
            : p
        )
      );
      setCommentText('');
    }
  };

  const handleDeletePost = (postId: string) => {
    sound.playClick();
    if (communityService.deletePost(postId)) {
      setPosts(posts.filter((p) => p.id !== postId));
    }
  };

  const handleFlagPost = (postId: string) => {
    sound.playClick();
    communityService.flagPost(postId, 'Reported by campus user');
    setPosts(
      posts.map((p) => (p.id === postId ? { ...p, isFlagged: true, flagReason: 'Reported by peer' } : p))
    );
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    sound.playClick();
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Filtered Posts
  const filteredPosts = posts.filter((p) => {
    // If post is private and not author, check if following
    if (p.visibility === 'private' && p.authorId !== profile.id && !followingIds.includes(p.authorId)) {
      return false;
    }
    if (feedFilter === 'code') return p.mediaType === 'code';
    if (feedFilter === 'media') return p.mediaType === 'image';
    if (feedFilter === 'bookmarks') return p.bookmarkedBy.includes(profile.id);
    if (feedFilter === 'feed') return p.authorId === profile.id || followingIds.includes(p.authorId);
    return true;
  });

  // =========================================================================
  // DISCORD CHAT ACTIONS
  // =========================================================================
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() && !chatCodeText.trim()) return;

    sound.playClick();
    const role: 'Scholar' | 'Polymath' | 'Professor' =
      profile.level > 15 ? 'Polymath' : profile.level > 8 ? 'Scholar' : 'Scholar';

    const newMsg = communityService.sendChannelMessage(
      selectedServerId,
      selectedChannelId,
      profile,
      chatInputText,
      role,
      chatCodeText ? 'code' : 'none',
      undefined,
      chatCodeText ? chatCodeText : undefined,
      'typescript'
    );

    setChannelMessages((prev) => [...prev, newMsg]);
    setChatInputText('');
    setChatCodeText('');
    setIsChatCodeOpen(false);
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    sound.playClick();
    const updated = communityService.addMessageReaction(selectedChannelId, messageId, emoji, profile.id);
    if (updated) {
      setChannelMessages(channelMessages.map((m) => (m.id === messageId ? updated : m)));
    }
  };

  // =========================================================================
  // DIRECT MESSAGING (INSTAGRAM) ACTIONS
  // =========================================================================
  const handleSendDm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmInputText.trim() || !activeConversationId) return;

    sound.playClick();
    const activeConv = conversations.find((c) => c.id === activeConversationId);
    if (!activeConv) return;

    const newMsg = communityService.sendDirectMessage(
      activeConversationId,
      profile.id,
      activeConv.peerProfile.id,
      profile.name,
      dmInputText,
      profile.avatarUrl
    );

    setActiveDmMessages((prev) => [...prev, newMsg]);
    setDmInputText('');
    // Update last message in conversation list
    setConversations(
      conversations.map((c) => (c.id === activeConversationId ? { ...c, lastMessage: newMsg } : c))
    );
    setTimeout(() => dmBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const startDmWithPeer = (peer: FriendSuggestion) => {
    sound.playClick();
    const convId = communityService.getOrCreateConversation(profile.id, {
      id: peer.id,
      name: peer.name,
      email: peer.email,
      college: peer.college,
      course: peer.course,
      avatarUrl: peer.avatarUrl,
      level: peer.level
    });

    const updatedConvs = communityService.getConversations(profile.id);
    setConversations(updatedConvs);
    setActiveConversationId(convId);
    setActiveTab('dms');
  };

  // =========================================================================
  // MATCHMAKER (SNAPCHAT) ACTIONS
  // =========================================================================
  const handleToggleFollow = (targetUserId: string) => {
    sound.playSuccess();
    const isNowFollowing = communityService.toggleFollow(targetUserId);
    setFollowingIds(communityService.getFollowingUserIds());
    setSuggestions(
      suggestions.map((s) => (s.id === targetUserId ? { ...s, isFollowing: isNowFollowing } : s))
    );
  };

  const filteredSuggestions = suggestions.filter((s) => {
    if (!matchSearchQuery.trim()) return true;
    const q = matchSearchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.college?.toLowerCase().includes(q) ||
      s.course?.toLowerCase().includes(q) ||
      s.mutualSubjects.some((sub) => sub.toLowerCase().includes(q)) ||
      s.commonLearningGaps.some((gap) => gap.toLowerCase().includes(q))
    );
  });

  const currentServer = servers.find((s) => s.id === selectedServerId) || servers[0];
  const currentChannel = currentServer?.channels.find((c) => c.id === selectedChannelId) || currentServer?.channels[0];
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Hub Controls */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Academic Social Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Campus Community & Social Pulse
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Collaborate in Discord-style academic squads, share breakthrough derivations on Campus Pulse, direct message study partners, and match with peers sharing identical learning gaps.
            </p>
          </div>

          {/* Account Visibility Badge & Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${
                  isPrivateAccount ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {isPrivateAccount ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  Account: {isPrivateAccount ? 'Private' : 'Public'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isPrivateAccount ? 'Followers & study buddies only' : 'Visible to all universities'}
                </p>
              </div>
            </div>

            <button
              onClick={handleTogglePrivacy}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                isPrivateAccount
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              Switch to {isPrivateAccount ? 'Public' : 'Private'}
            </button>
          </div>
        </div>

        {/* 4 Feature Tab Switcher */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('pulse');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'pulse'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Campus Pulse (X Feed)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 ml-1">
              {posts.length}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('squads');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'squads'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Study Squads (Discord)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 ml-1">
              {servers.length} Servers
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('dms');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'dms'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Direct Messages</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 ml-1">
              {conversations.length}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('matchmaker');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'matchmaker'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Study Buddy Matchmaker</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 ml-1">
              {suggestions.length} Matches
            </span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: CAMPUS PULSE (TWITTER/X STYLE FEED) */}
      {/* ===================================================================== */}
      {activeTab === 'pulse' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Composer Card */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="flex gap-3">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                      {profile.name[0]}
                    </div>
                  )}

                  <div className="flex-1">
                    <textarea
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder="Share a derivation, breakthrough concept, or ask campus peers for review..."
                      rows={3}
                      className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
                    />

                    {/* Image Attachment Preview */}
                    {mediaType === 'image' && mediaUrl && (
                      <div className="relative mt-2 rounded-2xl overflow-hidden border border-slate-700 max-h-60 group">
                        <img src={mediaUrl} alt="Preview" className="w-full h-auto object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setMediaType('none');
                            setMediaUrl('');
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Code Snippet Attachment Form */}
                    {mediaType === 'code' && (
                      <div className="mt-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-indigo-400 flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5" /> Code Snippet
                          </span>
                          <select
                            value={codeLanguage}
                            onChange={(e) => setCodeLanguage(e.target.value)}
                            className="bg-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 border border-slate-700"
                          >
                            <option value="typescript">TypeScript</option>
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                            <option value="sql">SQL</option>
                            <option value="latex">LaTeX</option>
                            <option value="rust">Rust</option>
                          </select>
                        </div>
                        <textarea
                          value={codeSnippet}
                          onChange={(e) => setCodeSnippet(e.target.value)}
                          placeholder="// Paste algorithm or proof snippet here..."
                          rows={4}
                          className="w-full font-mono text-xs bg-slate-900 p-2.5 rounded-xl text-emerald-400 focus:outline-none border border-slate-800"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Composer Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    {/* Image Attachment Trigger */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                        mediaType === 'image'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title="Upload Diagram or Image"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Diagram</span>
                    </button>

                    {/* Code Attachment Trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setMediaType(mediaType === 'code' ? 'none' : 'code');
                      }}
                      className={`p-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                        mediaType === 'code'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title="Attach Code Snippet"
                    >
                      <Code2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Code Snippet</span>
                    </button>

                    {/* Tag Input */}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="#DBMS #Networks"
                      className="text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-32 sm:w-44"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {isPrivateAccount ? '🔒 Private' : '🌍 Public'}
                    </span>
                    <button
                      type="submit"
                      disabled={!newPostText.trim() && !mediaUrl && !codeSnippet.trim()}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-40 transition-all"
                    >
                      <span>Post</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Feed Filtering Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setFeedFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  feedFilter === 'all'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Posts
              </button>
              <button
                onClick={() => setFeedFilter('feed')}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  feedFilter === 'feed'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Following ({followingIds.length})
              </button>
              <button
                onClick={() => setFeedFilter('code')}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  feedFilter === 'code'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                Code Snippets
              </button>
              <button
                onClick={() => setFeedFilter('media')}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  feedFilter === 'media'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                Campus Media
              </button>
              <button
                onClick={() => setFeedFilter('bookmarks')}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                  feedFilter === 'bookmarks'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                Saved
              </button>
            </div>

            {/* Posts Stream */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-slate-900/50 border border-slate-800">
                  <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-300 text-sm font-medium">No posts in this stream yet</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Be the first to share an academic insight or problem derivation!
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const isLiked = post.likedBy.includes(profile.id);
                  const isReposted = post.repostedBy.includes(profile.id);
                  const isBookmarked = post.bookmarkedBy.includes(profile.id);
                  const isAuthor = post.authorId === profile.id;

                  return (
                    <div
                      key={post.id}
                      className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-3.5 hover:border-slate-700/80 transition-all"
                    >
                      {/* Author Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {post.authorAvatar ? (
                            <img
                              src={post.authorAvatar}
                              alt={post.authorName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                              {post.authorName[0]}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-bold text-white">
                                {post.authorName}
                              </span>
                              {post.authorLevel && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                                  Lv {post.authorLevel}
                                </span>
                              )}
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-400">
                                {post.authorCollege || 'Campus'}
                              </span>
                              {post.visibility === 'private' && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Private
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {new Date(post.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {isAuthor && (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                              title="Delete Post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleFlagPost(post.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 transition-colors"
                            title="Report Post"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Post Content */}
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Code Snippet Card */}
                      {post.mediaType === 'code' && post.codeSnippet && (
                        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-xs overflow-x-auto group">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1.5 text-indigo-400">
                              <Code2 className="w-3.5 h-3.5" /> {post.codeLanguage || 'TypeScript'}
                            </span>
                            <button
                              onClick={() => handleCopyCode(post.codeSnippet!, post.id)}
                              className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 transition-colors"
                            >
                              {copiedCodeId === post.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 text-[10px]">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span className="text-[10px]">Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="text-emerald-400 leading-relaxed">{post.codeSnippet}</pre>
                        </div>
                      )}

                      {/* Image Preview */}
                      {post.mediaType === 'image' && post.mediaUrl && (
                        <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-96">
                          <img
                            src={post.mediaUrl}
                            alt="Post attachment"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}

                      {/* Actions Bar (Twitter/X Style) */}
                      <div className="flex items-center justify-between pt-2 text-slate-400 text-xs border-t border-slate-800/80">
                        {/* Likes */}
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isLiked ? 'text-pink-500 font-semibold' : 'hover:text-pink-400'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`}
                          />
                          <span>{post.likesCount}</span>
                        </button>

                        {/* Comments Toggle */}
                        <button
                          onClick={() => {
                            sound.playClick();
                            setActiveCommentsPostId(
                              activeCommentsPostId === post.id ? null : post.id
                            );
                          }}
                          className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.commentsCount}</span>
                        </button>

                        {/* Repost */}
                        <button
                          onClick={() => handleToggleRepost(post.id)}
                          className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isReposted ? 'text-emerald-400 font-semibold' : 'hover:text-emerald-400'
                          }`}
                        >
                          <Repeat2 className="w-4 h-4" />
                          <span>{post.repostsCount}</span>
                        </button>

                        {/* Bookmark */}
                        <button
                          onClick={() => handleToggleBookmark(post.id)}
                          className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isBookmarked ? 'text-amber-400 font-semibold' : 'hover:text-amber-400'
                          }`}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              isBookmarked ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Comments Accordion */}
                      {activeCommentsPostId === post.id && (
                        <div className="pt-3 border-t border-slate-800 space-y-3 animate-fade-in">
                          {/* Comments List */}
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {post.comments.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">
                                No comments yet. Share your thoughts!
                              </p>
                            ) : (
                              post.comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs"
                                >
                                  {comment.authorAvatar ? (
                                    <img
                                      src={comment.authorAvatar}
                                      alt={comment.authorName}
                                      className="w-7 h-7 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                                      {comment.authorName[0]}
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-white">
                                        {comment.authorName}
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        {new Date(comment.createdAt).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-slate-300 mt-1">{comment.content}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Add Comment Box */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Write a constructive academic reply..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddComment(post.id);
                              }}
                              className="flex-1 text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Sidebar: Trending Topics & Top Scholars */}
          <div className="space-y-6">
            {/* Quick Match Buddy Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/20 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Study Buddy Match
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Algorithmic
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Peers with identical course modules and shared diagnosed learning gaps waiting to collaborate.
              </p>
              <button
                onClick={() => setActiveTab('matchmaker')}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Browse {suggestions.length} Recommended Peers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trending Academic Hashtags */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Trending Campus Topics
              </h3>
              <div className="space-y-2.5">
                {[
                  { tag: 'DBMS_Indexing', posts: '48 posts', domain: 'Database Systems' },
                  { tag: 'TCP_SlidingWindow', posts: '35 posts', domain: 'Computer Networks' },
                  { tag: 'Concurrency_Semaphores', posts: '29 posts', domain: 'Operating Systems' },
                  { tag: 'DynamicProgramming', posts: '54 posts', domain: 'Algorithms' },
                  { tag: 'AttentionMechanisms', posts: '41 posts', domain: 'Deep Learning' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setTagInput(`#${item.tag}`);
                      sound.playClick();
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800/80 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white hover:text-indigo-400">
                        #{item.tag}
                      </p>
                      <p className="text-[10px] text-slate-400">{item.domain}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{item.posts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: STUDY SQUADS (DISCORD SERVER LOGIC) */}
      {/* ===================================================================== */}
      {activeTab === 'squads' && (
        <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden min-h-[640px]">
          {/* Column 1: Server Icons Sidebar (2 cols) */}
          <div className="md:col-span-1 bg-slate-950/90 border-r border-slate-800 p-2.5 flex md:flex-col items-center gap-3 overflow-x-auto md:overflow-y-auto">
            {servers.map((server) => (
              <button
                key={server.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedServerId(server.id);
                  if (server.channels.length > 0) {
                    setSelectedChannelId(server.channels[0].id);
                  }
                }}
                className={`relative group p-2.5 rounded-2xl transition-all duration-300 flex items-center justify-center cursor-pointer shrink-0 ${
                  selectedServerId === server.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title={server.name}
              >
                <span className="text-xl">{server.icon}</span>
                {/* Active indicator bar */}
                {selectedServerId === server.id && (
                  <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full hidden md:block" />
                )}
              </button>
            ))}
          </div>

          {/* Column 2: Channel List Sidebar (3 cols) */}
          <div className="md:col-span-3 bg-slate-900/80 border-r border-slate-800 p-4 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentServer?.icon}</span>
                  <span className="truncate">{currentServer?.name}</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {currentServer?.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    👥 {currentServer?.memberCount.toLocaleString()} Scholars
                  </span>
                </div>
              </div>

              {/* Channels Categorized */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Text Channels
                </p>
                <div className="space-y-1">
                  {currentServer?.channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedChannelId(channel.id);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedChannelId === channel.id
                          ? 'bg-indigo-600/30 text-indigo-200 font-semibold border border-indigo-500/40'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {channel.category === 'voice' ? (
                          <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                        ) : (
                          <Hash className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span className="truncate">{channel.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Student Mini Card in Discord */}
            <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
              <div className="relative">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold">
                    {profile.name[0]}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{profile.name}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  Lv {profile.level || 1} • Scholar
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Realtime Channel Chat Area (8 cols) */}
          <div className="md:col-span-8 flex flex-col justify-between bg-slate-900/50 min-h-[500px]">
            {/* Channel Top Header */}
            <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-white">{currentChannel?.name}</span>
                <span className="text-xs text-slate-500 hidden sm:inline">•</span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {currentChannel?.topic}
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                <Circle className="w-2 h-2 fill-emerald-400 animate-pulse" /> Live Stream
              </span>
            </div>

            {/* Chat Message Stream */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 max-h-[480px]">
              {channelMessages.map((msg) => (
                <div key={msg.id} className="group flex items-start gap-3 text-xs">
                  {msg.senderAvatar ? (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600/40 border border-indigo-500/30 flex items-center justify-center font-bold text-white shrink-0">
                      {msg.senderName[0]}
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{msg.senderName}</span>
                      {msg.senderRole && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                            msg.senderRole === 'Professor'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : msg.senderRole === 'Polymath'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {msg.senderRole}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="text-slate-200 leading-relaxed">{msg.content}</p>

                    {/* Chat Code Attachment */}
                    {msg.mediaType === 'code' && msg.codeSnippet && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto my-1">
                        <pre>{msg.codeSnippet}</pre>
                      </div>
                    )}

                    {/* Emoji Reactions Bar */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {['👍', '🔥', '🚀', '💡', '🧠'].map((emoji) => {
                        const count = msg.reactions?.[emoji]?.length || 0;
                        const hasReacted = msg.reactions?.[emoji]?.includes(profile.id);

                        return (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className={`px-2 py-0.5 rounded-lg border text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                              hasReacted
                                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-200 font-bold'
                                : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span className="font-mono">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Box */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
              {isChatCodeOpen && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Attach Code to #{currentChannel?.name}</span>
                    <button
                      onClick={() => setIsChatCodeOpen(false)}
                      className="text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={chatCodeText}
                    onChange={(e) => setChatCodeText(e.target.value)}
                    placeholder="// paste code snippet here..."
                    rows={3}
                    className="w-full bg-slate-900 p-2 rounded-lg font-mono text-xs text-emerald-400 focus:outline-none border border-slate-800"
                  />
                </div>
              )}

              <form onSubmit={handleSendChatMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsChatCodeOpen(!isChatCodeOpen);
                  }}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    isChatCodeOpen
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                  }`}
                  title="Attach Code"
                >
                  <Code2 className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  placeholder={`Message #${currentChannel?.name || 'squad'}...`}
                  className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <button
                  type="submit"
                  disabled={!chatInputText.trim() && !chatCodeText.trim()}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-indigo-500/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: DIRECT MESSAGES (INSTAGRAM STYLE) */}
      {/* ===================================================================== */}
      {activeTab === 'dms' && (
        <div className="grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden min-h-[600px]">
          {/* Conversations List (4 cols) */}
          <div className="md:col-span-4 bg-slate-950/60 border-r border-slate-800 p-4 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Direct Messages</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {conversations.length} Active
              </span>
            </h2>

            <div className="space-y-1.5 overflow-y-auto max-h-[500px]">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No active direct messages. Connect with classmates in Study Buddy Matchmaker!
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = conv.id === activeConversationId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        sound.playClick();
                        setActiveConversationId(conv.id);
                      }}
                      className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/25 border border-indigo-500/40'
                          : 'hover:bg-slate-800/50 border border-transparent'
                      }`}
                    >
                      <div className="relative">
                        {conv.peerProfile.avatarUrl ? (
                          <img
                            src={conv.peerProfile.avatarUrl}
                            alt={conv.peerProfile.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                            {conv.peerProfile.name[0]}
                          </div>
                        )}
                        {conv.peerProfile.online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">
                            {conv.peerProfile.name}
                          </p>
                          {conv.lastMessage && (
                            <span className="text-[10px] text-slate-500">
                              {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {conv.lastMessage?.content || 'Started conversation'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 1-on-1 Chat Area (8 cols) */}
          <div className="md:col-span-8 flex flex-col justify-between bg-slate-900/40">
            {activeConv ? (
              <>
                {/* Chat Top Header */}
                <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {activeConv.peerProfile.avatarUrl ? (
                      <img
                        src={activeConv.peerProfile.avatarUrl}
                        alt={activeConv.peerProfile.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                        {activeConv.peerProfile.name[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">
                        {activeConv.peerProfile.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {activeConv.peerProfile.college || 'Campus'} •{' '}
                        {activeConv.peerProfile.course || 'Scholar'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Online
                  </span>
                </div>

                {/* Messages Bubbles */}
                <div className="p-6 overflow-y-auto flex-1 space-y-3 max-h-[460px]">
                  {activeDmMessages.map((msg) => {
                    const isMine = msg.senderId === profile.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isMine
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-500/20'
                              : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/60'
                          }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 font-mono px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={dmBottomRef} />
                </div>

                {/* DM Input Box */}
                <form
                  onSubmit={handleSendDm}
                  className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={dmInputText}
                    onChange={(e) => setDmInputText(e.target.value)}
                    placeholder={`Message ${activeConv.peerProfile.name}...`}
                    className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!dmInputText.trim()}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-indigo-500/30"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                Select a conversation to begin messaging
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: STUDY BUDDY MATCHMAKER (SNAPCHAT STYLE) */}
      {/* ===================================================================== */}
      {activeTab === 'matchmaker' && (
        <div className="space-y-6">
          {/* Matchmaker Search & Filters Header */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={matchSearchQuery}
                onChange={(e) => setMatchSearchQuery(e.target.value)}
                placeholder="Search by college, subject, or learning gap..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Matched against your syllabus & diagnosed learning gaps</span>
            </div>
          </div>

          {/* Grid of Matched Peers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuggestions.map((peer) => {
              const isFollowing = followingIds.includes(peer.id);

              return (
                <div
                  key={peer.id}
                  className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top Peer Info & Match Badge */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {peer.avatarUrl ? (
                          <img
                            src={peer.avatarUrl}
                            alt={peer.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base">
                            {peer.name[0]}
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-bold text-white">{peer.name}</h3>
                          <p className="text-[11px] text-slate-400">{peer.college}</p>
                          <p className="text-[10px] text-indigo-300 font-mono">
                            {peer.course} • Sem {peer.semester || 4}
                          </p>
                        </div>
                      </div>

                      {/* Affinity Match Score Badge */}
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30">
                          {peer.matchScore}% Match
                        </span>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="space-y-1 pt-1">
                      {peer.matchReasons.map((reason, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] text-slate-300 flex items-center gap-1.5"
                        >
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Mutual Learning Gaps Tag Pill */}
                    {peer.commonLearningGaps && peer.commonLearningGaps.length > 0 && (
                      <div className="pt-2 border-t border-slate-800">
                        <p className="text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-1">
                          Shared Learning Gaps:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {peer.commonLearningGaps.map((gap, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            >
                              {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions: Follow / Add Friend & DM */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleToggleFollow(peer.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isFollowing
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Connected</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add Friend</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => startDmWithPeer(peer)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-purple-400" />
                      <span>Direct Message</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
