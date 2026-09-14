import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Search,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Code,
  CheckCheck,
  Sparkles,
  UserPlus,
  ArrowLeft,
  X,
  MessageSquare
} from 'lucide-react';
import { communityService } from '../../services/communityService';
import { voiceCallService, type ActiveCallState } from '../../services/voiceCallService';
import { sound } from '../../services/soundService';
import type { StudentProfile, DMConversation, DirectMessage, ScholarDirectoryUser } from '../../types';

interface StandaloneDmChatProps {
  profile: StudentProfile;
  initialConversationId?: string;
  onSelectScholar?: (scholar: ScholarDirectoryUser) => void;
}

export const StandaloneDmChat: React.FC<StandaloneDmChatProps> = ({
  profile,
  initialConversationId
}) => {
  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [peerTyping, setPeerTyping] = useState<string | null>(null);

  // Mobile navigation state
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(Boolean(initialConversationId));

  // Voice Call State
  const [callState, setCallState] = useState<ActiveCallState>(voiceCallService.getCallState());

  // In-app DM toast notification
  const [activeToast, setActiveToast] = useState<{
    conversationId: string;
    senderHandle: string;
    senderName: string;
    content: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  // Sync current user into voiceCallService
  useEffect(() => {
    voiceCallService.setCurrentUser(profile);
    const unsubCall = voiceCallService.onCallStateChange((state) => {
      setCallState(state);
    });
    return () => unsubCall();
  }, [profile]);

  // Load conversations initially
  useEffect(() => {
    const list = communityService.getConversations(profile.id);
    setConversations(list);

    if (list.length > 0 && !activeConversationId) {
      setActiveConversationId(list[0].id);
    }
  }, [profile.id]);

  // Sync active conversation messages and subscribe
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    // Mark unread as 0 for active conversation
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, unreadCount: 0 } : c))
    );

    const msgs = communityService.getDirectMessages(activeConversationId);
    setMessages(msgs);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    // Real-time DM subscription
    const unsubscribe = communityService.subscribeToDMs((convId, newDM) => {
      if (convId === activeConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newDM.id)) return prev;
          return [...prev, newDM];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }

      // Update conversation lastMessage in sidebar
      setConversations((prev) => {
        const found = prev.some((c) => c.id === convId);
        if (!found) {
          return communityService.getConversations(profile.id);
        }
        return prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                lastMessage: newDM,
                unreadCount: convId === activeConversationId ? 0 : (c.unreadCount || 0) + 1
              }
            : c
        );
      });
    });

    const unsubscribeTyping = communityService.subscribeTyping((targetId, username) => {
      if (targetId === activeConversationId) {
        setPeerTyping(username);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeTyping();
    };
  }, [activeConversationId, profile.id]);

  // Listen for in-app DM notifications across tabs/windows
  useEffect(() => {
    const handleDmNotification = (e: any) => {
      const detail = e.detail;
      if (!detail || !detail.message) return;
      const msg: DirectMessage = detail.message;

      // Only notify if message is sent to current user and from someone else
      if (
        msg.senderId !== profile.id &&
        (msg.recipientId === profile.id ||
          msg.recipientHandle?.toLowerCase() === profile.handle?.toLowerCase())
      ) {
        // If not looking at that conversation, show visual toast and audio ping
        if (detail.conversationId !== activeConversationId) {
          sound.playMessage();
          setActiveToast({
            conversationId: detail.conversationId,
            senderHandle: msg.senderHandle || `@${msg.senderName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            senderName: msg.senderName,
            content: msg.content
          });

          if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
          toastTimeoutRef.current = setTimeout(() => {
            setActiveToast(null);
          }, 6000);
        }
      }
    };

    window.addEventListener('mba_dm_notification', handleDmNotification);
    return () => {
      window.removeEventListener('mba_dm_notification', handleDmNotification);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [activeConversationId, profile.id, profile.handle]);

  // Active conversation object
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  // Filtered conversations in sidebar
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase().trim().replace(/^@/, '');
    if (!q) return true;
    return (
      c.peerProfile.name.toLowerCase().includes(q) ||
      (c.peerProfile.handle && c.peerProfile.handle.toLowerCase().includes(q))
    );
  });

  // Scholars in directory for new chat modal
  const directoryScholars = communityService.searchScholars(modalSearchQuery).filter(
    (s) => s.id !== profile.id && s.handle !== profile.handle
  );

  // Send Direct Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !codeSnippet.trim()) || !activeConversationId || !activeConv) return;

    sound.playClick();
    const content = inputText.trim();

    const newDM = communityService.sendDirectMessage(
      activeConversationId,
      profile.id,
      activeConv.peerProfile.id,
      profile.name,
      content,
      profile.avatarUrl,
      undefined,
      profile.handle,
      codeSnippet.trim() || undefined,
      codeLanguage,
      activeConv.peerProfile.handle
    );

    // Deduplicated local state update
    setMessages((prev) => {
      if (prev.some((m) => m.id === newDM.id)) return prev;
      return [...prev, newDM];
    });

    setInputText('');
    setCodeSnippet('');
    setIsCodeOpen(false);

    // Update lastMessage in conversation list
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, lastMessage: newDM } : c))
    );

    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  // Start new conversation from scholar directory
  const handleStartChatWithScholar = (scholar: ScholarDirectoryUser) => {
    sound.playClick();
    const convId = communityService.getOrCreateConversationWithScholar(profile.id, scholar);
    const updated = communityService.getConversations(profile.id);
    setConversations(updated);
    setActiveConversationId(convId);
    setIsMobileChatOpen(true);
    setIsNewChatModalOpen(false);
    setModalSearchQuery('');
  };

  // Trigger Voice Call
  const handleStartVoiceCall = () => {
    if (!activeConv) return;
    sound.playClick();
    voiceCallService.startCall(
      {
        id: activeConv.peerProfile.id,
        handle: activeConv.peerProfile.handle || `@${activeConv.peerProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name: activeConv.peerProfile.name,
        avatarUrl: activeConv.peerProfile.avatarUrl
      },
      profile
    );
  };

  // Format call duration MM:SS
  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-[calc(88vh-2rem)] min-h-[580px] max-h-[850px] bg-slate-950/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
      {/* =================================================================== */}
      {/* IN-APP NEW DM TOAST NOTIFICATION */}
      {/* =================================================================== */}
      {activeToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce-in flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.4)] backdrop-blur-xl max-w-md w-[92%] sm:w-auto">
          <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs shrink-0 border border-purple-400/40">
            💬
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
              <span>{activeToast.senderName}</span>
              <span className="text-[10px] text-purple-300 font-mono font-normal">
                {activeToast.senderHandle}
              </span>
            </p>
            <p className="text-[11px] text-slate-300 truncate">{activeToast.content}</p>
          </div>
          <button
            onClick={() => {
              setActiveConversationId(activeToast.conversationId);
              setIsMobileChatOpen(true);
              setActiveToast(null);
            }}
            className="px-3 py-1 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-extrabold text-[11px] shrink-0 cursor-pointer shadow"
          >
            Open
          </button>
          <button
            onClick={() => setActiveToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* VOICE CALL ACTIVE OVERLAY / MODAL */}
      {/* =================================================================== */}
      {callState.status !== 'idle' && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          {/* Peer Avatar & Audio Ripples */}
          <div className="relative mb-6">
            {callState.status === 'calling' && (
              <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
            )}
            {callState.status === 'incoming' && (
              <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
            )}
            {callState.status === 'connected' && (
              <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-purple-500/30 to-indigo-500/30 animate-pulse" />
            )}

            {callState.peerAvatar ? (
              <img
                src={callState.peerAvatar}
                alt={callState.peerName}
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/50 shadow-2xl relative z-10"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl relative z-10 border-4 border-purple-400/40">
                {callState.peerName[0] || 'S'}
              </div>
            )}
          </div>

          <h3 className="text-xl font-extrabold text-white mb-1">{callState.peerName}</h3>
          <p className="text-xs font-mono text-purple-300 mb-4">{callState.peerHandle}</p>

          {/* Call Status Label */}
          {callState.status === 'calling' && (
            <p className="text-sm font-semibold text-indigo-300 animate-pulse flex items-center gap-2 mb-8">
              <span>Calling scholar over WebRTC P2P...</span>
            </p>
          )}

          {callState.status === 'incoming' && (
            <p className="text-sm font-bold text-emerald-300 animate-bounce flex items-center gap-2 mb-8">
              <Phone className="w-4 h-4" />
              <span>Incoming Voice Call...</span>
            </p>
          )}

          {callState.status === 'connected' && (
            <div className="flex flex-col items-center gap-2 mb-8">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Audio Connected • {formatCallTime(callState.durationSeconds)}
              </span>

              {/* Animated Waveform Bars */}
              <div className="flex items-center gap-1 h-5 mt-2">
                {[0.4, 0.9, 0.6, 1, 0.7, 0.3, 0.8].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-purple-500 to-indigo-400 rounded-full animate-pulse"
                    style={{
                      height: `${h * 100}%`,
                      animationDelay: `${i * 120}ms`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {callState.status === 'ended' && (
            <p className="text-sm font-semibold text-rose-400 mb-8">Call Ended</p>
          )}

          {/* Call Action Buttons */}
          <div className="flex items-center gap-4">
            {callState.status === 'incoming' ? (
              <>
                <button
                  onClick={() => voiceCallService.acceptCall(profile)}
                  className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/40 cursor-pointer transition-transform hover:scale-105"
                >
                  <Phone className="w-4 h-4" />
                  <span>Accept Call</span>
                </button>
                <button
                  onClick={() => voiceCallService.declineCall()}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-rose-600/40 cursor-pointer transition-transform hover:scale-105"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Decline</span>
                </button>
              </>
            ) : (
              <>
                {callState.status === 'connected' && (
                  <button
                    onClick={() => voiceCallService.toggleMute()}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      callState.isMuted
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                    title={callState.isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  >
                    {callState.isMuted ? (
                      <MicOff className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => voiceCallService.endCall()}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-rose-600/40 cursor-pointer transition-transform hover:scale-105"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Call</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MAIN CHAT INTERFACE: 2-PANE DESKTOP / 1-PANE RESPONSIVE MOBILE */}
      {/* =================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANE: CONVERSATION ROSTER (Hidden on mobile if chat is open) */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-800/80 bg-slate-950/60 ${
            isMobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Top Identity & Action Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold text-white tracking-tight">Direct Messages</h2>
                <p className="text-[11px] font-mono text-purple-400 truncate">
                  {profile.handle || `@${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer shrink-0"
              title="New Message"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>

          {/* Search scholars / conversations */}
          <div className="p-3 border-b border-slate-800/60 bg-slate-900/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scholars by @handle or name..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <p>No conversations yet.</p>
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Start a Chat</span>
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const peer = conv.peerProfile;
                const handle = peer.handle || `@${peer.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveConversationId(conv.id);
                      setIsMobileChatOpen(true);
                    }}
                    className={`w-full p-3 text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-950/40 border-l-4 border-purple-500 shadow-inner'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    {/* Avatar & Online Dot */}
                    <div className="relative shrink-0">
                      {peer.avatarUrl ? (
                        <img
                          src={peer.avatarUrl}
                          alt={peer.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs">
                          {peer.name[0]}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    </div>

                    {/* Meta info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-bold text-white truncate max-w-[130px]">
                          {peer.name}
                        </p>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono text-purple-400 truncate max-w-[120px]">
                          {handle}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-purple-500 text-black font-extrabold text-[10px] flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {conv.lastMessage?.content || 'Started conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: ACTIVE CHAT THREAD */}
        <div
          className={`flex-1 flex flex-col bg-slate-900/30 ${
            !isMobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Active Chat Header */}
              <div className="px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setIsMobileChatOpen(false)}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white md:hidden cursor-pointer"
                    title="Back to conversations"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="relative shrink-0">
                    {activeConv.peerProfile.avatarUrl ? (
                      <img
                        src={activeConv.peerProfile.avatarUrl}
                        alt={activeConv.peerProfile.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                        {activeConv.peerProfile.name[0]}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white truncate">
                        {activeConv.peerProfile.name}
                      </h3>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 font-semibold">
                        {activeConv.peerProfile.handle}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {activeConv.peerProfile.college || 'Campus Scholar'} • Level{' '}
                      {activeConv.peerProfile.level || 10}
                    </p>
                  </div>
                </div>

                {/* Voice Call Action Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartVoiceCall}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-extrabold text-xs flex items-center gap-1.5 border border-emerald-500/40 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                    title="Start Voice Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Voice Call</span>
                  </button>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 text-xs">
                    <MessageSquare className="w-8 h-8 text-purple-400/40 mb-2" />
                    <p className="font-bold text-slate-400">No messages yet with {activeConv.peerProfile.name}</p>
                    <p className="text-[11px] mt-1 text-slate-500">
                      Send a message or start a live voice call directly!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === profile.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md sm:max-w-lg px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                            isMine
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-sm shadow-purple-600/20'
                              : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/60'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                          {/* Code Snippet Attachment */}
                          {msg.codeSnippet && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-black/70 border border-white/10 font-mono text-[11px] overflow-x-auto text-emerald-300">
                              <pre>{msg.codeSnippet}</pre>
                            </div>
                          )}
                        </div>

                        {/* Timestamp & Read Receipt */}
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[9px] text-slate-500 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isMine && <CheckCheck className="w-3 h-3 text-purple-400" />}
                        </div>
                      </div>
                    );
                  })
                )}
                {peerTyping && (
                  <div className="flex items-center gap-2 text-xs text-purple-400 italic px-2 py-1 bg-purple-950/20 rounded-xl w-fit border border-purple-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                    <span>{peerTyping} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Code Snippet Drawer */}
              {isCodeOpen && (
                <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/80 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5" />
                      Attach Formatted Code
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-emerald-300 font-mono focus:outline-none"
                      >
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="sql">SQL</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsCodeOpen(false)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="Paste code snippet here..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 font-mono text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              )}

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex items-center gap-2 shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setIsCodeOpen(!isCodeOpen)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isCodeOpen
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700'
                  }`}
                  title="Attach code snippet"
                >
                  <Code className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${activeConv.peerProfile.handle || activeConv.peerProfile.name}...`}
                  className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() && !codeSnippet.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-purple-600/30 shrink-0"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 text-xs">
              <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-sm font-bold text-slate-300 mb-1">Select a Scholar to Chat</h3>
              <p className="max-w-xs text-slate-400">
                Choose an existing conversation from the list or start a new chat with anyone on campus.
              </p>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/30"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Search Campus Scholars</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* NEW CHAT SCHOLAR PICKER MODAL */}
      {/* =================================================================== */}
      {isNewChatModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-5 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                Start New Direct Message
              </h3>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Handle Search Input */}
            <div className="py-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="Type @handle, name, or college..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Scholars List */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[380px] pr-1">
              {directoryScholars.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No scholars match &quot;{modalSearchQuery}&quot;
                </div>
              ) : (
                directoryScholars.map((scholar) => (
                  <button
                    key={scholar.id}
                    onClick={() => handleStartChatWithScholar(scholar)}
                    className="w-full p-3 rounded-2xl bg-slate-800/60 hover:bg-purple-950/40 border border-slate-700/60 hover:border-purple-500/50 text-left flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {scholar.avatarUrl ? (
                        <img
                          src={scholar.avatarUrl}
                          alt={scholar.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {scholar.name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {scholar.name}
                        </p>
                        <p className="text-[11px] font-mono text-purple-400">{scholar.handle}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {scholar.college} • {scholar.course}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30 group-hover:bg-purple-500 group-hover:text-black transition-all shrink-0">
                      Chat
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
