import type {
  Post,
  PostComment,
  CommunityServer,
  ChatMessage,
  DirectMessage,
  FriendSuggestion,
  StudentProfile,
  LearningGap,
  DMConversation
} from '../types';

const STORAGE_KEY_POSTS = 'mba_community_posts';
const STORAGE_KEY_MESSAGES = 'mba_channel_messages';
const STORAGE_KEY_DMS = 'mba_direct_messages';
const STORAGE_KEY_FOLLOWING = 'mba_following_users';

// Pre-configured Academic Community Servers (Discord Logic)
export const DEFAULT_SERVERS: CommunityServer[] = [
  {
    id: 'server_global',
    name: 'Global Scholar Hub',
    icon: '🌍',
    description: 'Cross-university hub for academic collaboration, peer debate & general discussions.',
    category: 'General',
    memberCount: 12480,
    channels: [
      { id: 'ch_global_general', serverId: 'server_global', name: 'general-lounge', topic: 'Casual academic chatter, campus life and study tips', category: 'general' },
      { id: 'ch_global_doubts', serverId: 'server_global', name: 'ask-for-help', topic: 'Fast homework and conceptual doubts triage', category: 'doubts' },
      { id: 'ch_global_announcements', serverId: 'server_global', name: 'scholar-bulletin', topic: 'Platform updates, global hackathons and paper releases', category: 'academic' },
      { id: 'ch_global_voice', serverId: 'server_global', name: 'pomodoro-lounge', topic: 'Silent co-working and low-fi study sessions', category: 'voice' }
    ]
  },
  {
    id: 'server_cs_ai',
    name: 'Computer Science & AI',
    icon: '🤖',
    description: 'Neural architectures, deep learning theory, LLM engineering & systems research.',
    category: 'Engineering',
    memberCount: 8940,
    channels: [
      { id: 'ch_cs_general', serverId: 'server_cs_ai', name: 'ai-research', topic: 'Transformers, attention mechanisms and loss gradients', category: 'academic' },
      { id: 'ch_cs_code', serverId: 'server_cs_ai', name: 'code-review-lab', topic: 'Post your PyTorch, TypeScript and Python snippets', category: 'collab' },
      { id: 'ch_cs_exams', serverId: 'server_cs_ai', name: 'exam-prep-dsa', topic: 'Dynamic programming, graph theory and asymptotic complexity', category: 'doubts' }
    ]
  },
  {
    id: 'server_systems',
    name: 'Systems, OS & Cloud',
    icon: '⚡',
    description: 'Kernel internals, distributed consensus, memory paging & cloud infrastructure.',
    category: 'Engineering',
    memberCount: 6420,
    channels: [
      { id: 'ch_sys_general', serverId: 'server_systems', name: 'kernel-space', topic: 'Virtual memory, context switches and scheduler internals', category: 'academic' },
      { id: 'ch_sys_networks', serverId: 'server_systems', name: 'tcp-and-distributed', topic: 'TCP windowing, Paxos, Raft and networking proofs', category: 'academic' },
      { id: 'ch_sys_doubts', serverId: 'server_systems', name: 'systems-doubts', topic: 'Deadlock detection, page replacement algorithms', category: 'doubts' }
    ]
  },
  {
    id: 'server_dbms',
    name: 'DBMS & Data Engineering',
    icon: '🗄️',
    description: 'Relational query optimization, B+ Tree indexing, ACID transactions & data pipelines.',
    category: 'Databases',
    memberCount: 5120,
    channels: [
      { id: 'ch_db_indexing', serverId: 'server_dbms', name: 'indexing-and-btrees', topic: 'B-Trees, Hash indexing, and query plan execution', category: 'academic' },
      { id: 'ch_db_normal', serverId: 'server_dbms', name: 'normalization-lab', topic: 'BCNF, 3NF, functional dependencies and decomposition proofs', category: 'doubts' }
    ]
  }
];

// Initial Seed Posts (Twitter/X Style)
const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'user_alex_chen',
    authorName: 'Alex Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    authorCollege: 'Stanford University',
    authorCourse: 'B.Tech Computer Science',
    authorLevel: 14,
    content: 'Just cracked B+ Tree node split propagation after 3 hours of Socratic tutoring with MindBridge! The trick is realizing the middle key is hoisted up while the leaf nodes keep horizontal doubly-linked pointers. Here is my derivation snippet:',
    mediaType: 'code',
    codeSnippet: `class BPlusTreeNode {\n  keys: number[] = [];\n  children: BPlusTreeNode[] = [];\n  isLeaf: boolean = false;\n  next: BPlusTreeNode | null = null; // Doubly-linked leaf pointers\n  prev: BPlusTreeNode | null = null;\n}`,
    codeLanguage: 'typescript',
    visibility: 'public',
    likesCount: 38,
    likedBy: [],
    commentsCount: 6,
    comments: [
      {
        id: 'c_1',
        postId: 'post_1',
        authorId: 'user_priya_sharma',
        authorName: 'Priya Sharma',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        authorCollege: 'IIT Bombay',
        content: 'This diagram clarifies why range queries in B+ Trees are O(log N + K) vs B-Trees! Thanks Alex.',
        createdAt: '2026-09-11T12:30:00Z'
      }
    ],
    repostsCount: 12,
    repostedBy: [],
    bookmarkedBy: [],
    tags: ['DBMS', 'DataStructures', 'Algorithms'],
    createdAt: '2026-09-11T12:00:00Z'
  },
  {
    id: 'post_2',
    authorId: 'user_marcus_vance',
    authorName: 'Marcus Vance',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorCollege: 'MIT',
    authorCourse: 'M.S. Computer Science',
    authorLevel: 19,
    content: 'Friendly reminder to all undergraduates: TCP Fast Retransmit triggers on 3 duplicate ACKs before the RTO timer expires. Do not calculate full RTO timeout delay if 3 duplicate ACKs are already present in the trace problem!',
    mediaType: 'none',
    visibility: 'public',
    likesCount: 64,
    likedBy: [],
    commentsCount: 11,
    comments: [],
    repostsCount: 29,
    repostedBy: [],
    bookmarkedBy: [],
    tags: ['Networks', 'OS', 'ExamTips'],
    createdAt: '2026-09-11T09:45:00Z'
  },
  {
    id: 'post_3',
    authorId: 'user_sarah_jenkins',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    authorCollege: 'UC Berkeley',
    authorCourse: 'B.S. Artificial Intelligence',
    authorLevel: 9,
    content: 'My study group is hosting a live Pomodoro voice squad tonight at 8 PM in the Global Scholar Hub voice channel! We are tackling Dynamic Programming knapsack state spaces. Anyone struggling with DP is welcome to join.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    visibility: 'public',
    likesCount: 45,
    likedBy: [],
    commentsCount: 8,
    comments: [],
    repostsCount: 14,
    repostedBy: [],
    bookmarkedBy: [],
    tags: ['StudySquad', 'DSA', 'PeerLearning'],
    createdAt: '2026-09-11T08:15:00Z'
  }
];

// Initial Mock Channel Messages
const INITIAL_CHANNEL_MESSAGES: Record<string, ChatMessage[]> = {
  ch_global_general: [
    {
      id: 'msg_1',
      serverId: 'server_global',
      channelId: 'ch_global_general',
      senderId: 'user_elena_rostova',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Scholar',
      content: 'Has anyone integrated the new syllabus upload with their university LMS yet? The OCR scanned my 4-page Operating Systems curriculum in 12 seconds!',
      createdAt: '2026-09-11T14:10:00Z',
      reactions: { '🔥': ['user_1', 'user_2'], '💯': ['user_3'] }
    },
    {
      id: 'msg_2',
      serverId: 'server_global',
      channelId: 'ch_global_general',
      senderId: 'user_david_kim',
      senderName: 'David Kim',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Polymath',
      content: 'Yes! It immediately populated the Smart Timetable with prioritized blocks for Virtual Memory and Page Replacement algorithms. Super seamless.',
      createdAt: '2026-09-11T14:12:30Z',
      reactions: { '🙌': ['user_elena_rostova'] }
    }
  ],
  ch_cs_general: [
    {
      id: 'msg_cs_1',
      serverId: 'server_cs_ai',
      channelId: 'ch_cs_general',
      senderId: 'user_marcus_vance',
      senderName: 'Marcus Vance',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Professor',
      content: 'Remember: In multi-head self-attention, projection matrices W_Q, W_K, W_V project from d_model into d_k = d_model / h. This keeps overall computational cost equivalent to single-head attention while learning distinct representation subspaces.',
      mediaType: 'code',
      codeSnippet: `Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V`,
      codeLanguage: 'python',
      createdAt: '2026-09-11T13:40:00Z',
      reactions: { '🧠': ['user_1', 'user_2', 'user_3'], '🚀': ['user_4'] }
    }
  ]
};

// Initial Peer Profiles for Matchmaker (Snapchat Logic)
export const MOCK_PEERS: FriendSuggestion[] = [
  {
    id: 'peer_priya',
    name: 'Priya Sharma',
    email: 'priya.sharma@iitb.ac.in',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    college: 'Indian Institute of Technology (IIT)',
    course: 'B.Tech / B.E. Computer Science',
    semester: 6,
    level: 15,
    cgpa: 9.3,
    matchScore: 98,
    matchReasons: ['Same Course (B.Tech CS)', 'Same Semester (Sem VI)', 'Both targeting B-Trees gap'],
    mutualSubjects: ['Database Management Systems', 'Computer Networks'],
    commonLearningGaps: ['B-Trees & B+ Tree Indexing', 'TCP Congestion Control'],
    isFollowing: false,
    isPrivate: false
  },
  {
    id: 'peer_david',
    name: 'David Kim',
    email: 'david.kim@stanford.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    college: 'Stanford University',
    course: 'B.Tech / B.E. Computer Science',
    semester: 6,
    level: 18,
    cgpa: 9.1,
    matchScore: 94,
    matchReasons: ['Same Major', 'High Study Consistency (18d streak)', 'Common Operating Systems syllabus'],
    mutualSubjects: ['Operating Systems', 'Data Structures & Algorithms'],
    commonLearningGaps: ['Virtual Memory & Page Replacement'],
    isFollowing: true,
    isPrivate: false
  },
  {
    id: 'peer_ananya',
    name: 'Ananya Roy',
    email: 'ananya.roy@mit.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    college: 'MIT',
    course: 'B.S. Artificial Intelligence & Data Science',
    semester: 6,
    level: 12,
    cgpa: 8.9,
    matchScore: 88,
    matchReasons: ['Mutual AI/ML Interest', 'Active in Computer Science & AI Discord'],
    mutualSubjects: ['Machine Learning', 'Data Structures & Algorithms'],
    commonLearningGaps: ['Backpropagation & Loss Gradients'],
    isFollowing: false,
    isPrivate: true
  },
  {
    id: 'peer_marcus',
    name: 'Marcus Vance',
    email: 'marcus.vance@cmu.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    college: 'Carnegie Mellon University (CMU)',
    course: 'B.S. Software Engineering',
    semester: 6,
    level: 21,
    cgpa: 9.6,
    matchScore: 82,
    matchReasons: ['Grand Polymath Tier', 'Shared Systems Architecture interest'],
    mutualSubjects: ['Operating Systems', 'Database Management Systems'],
    commonLearningGaps: ['Relational Normalization (BCNF & 3NF)'],
    isFollowing: false,
    isPrivate: false
  }
];

class CommunityService {
  private messageSubscribers: Array<(channelId: string, msg: ChatMessage) => void> = [];
  private dmSubscribers: Array<(conversationId: string, msg: DirectMessage) => void> = [];

  // =========================================================================
  // 1. POSTS & ACADEMIC FEED (TWITTER / X STYLE)
  // =========================================================================

  public getPosts(): Post[] {
    if (typeof window === 'undefined') return INITIAL_POSTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_POSTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading posts from storage:', e);
    }
    this.savePosts(INITIAL_POSTS);
    return INITIAL_POSTS;
  }

  public savePosts(posts: Post[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    } catch (e) {
      console.warn('Error saving posts to storage:', e);
    }
  }

  public createPost(
    author: StudentProfile,
    content: string,
    mediaType: 'image' | 'code' | 'none' = 'none',
    mediaUrl?: string,
    codeSnippet?: string,
    codeLanguage?: string,
    tags: string[] = []
  ): Post {
    const posts = this.getPosts();
    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatarUrl,
      authorCollege: author.college || 'Scholar Academy',
      authorCourse: author.course || author.degree,
      authorLevel: author.level || 1,
      content: content.trim(),
      mediaType,
      mediaUrl,
      codeSnippet,
      codeLanguage,
      visibility: author.isPrivateAccount ? 'private' : 'public',
      likesCount: 0,
      likedBy: [],
      commentsCount: 0,
      comments: [],
      repostsCount: 0,
      repostedBy: [],
      bookmarkedBy: [],
      tags,
      createdAt: new Date().toISOString()
    };

    const updated = [newPost, ...posts];
    this.savePosts(updated);
    return newPost;
  }

  public toggleLike(postId: string, userId: string): Post | null {
    const posts = this.getPosts();
    const target = posts.find((p) => p.id === postId);
    if (!target) return null;

    const alreadyLiked = target.likedBy.includes(userId);
    if (alreadyLiked) {
      target.likedBy = target.likedBy.filter((id) => id !== userId);
      target.likesCount = Math.max(0, target.likesCount - 1);
    } else {
      target.likedBy.push(userId);
      target.likesCount += 1;
    }

    this.savePosts(posts);
    return target;
  }

  public toggleRepost(postId: string, userId: string): Post | null {
    const posts = this.getPosts();
    const target = posts.find((p) => p.id === postId);
    if (!target) return null;

    const alreadyReposted = target.repostedBy.includes(userId);
    if (alreadyReposted) {
      target.repostedBy = target.repostedBy.filter((id) => id !== userId);
      target.repostsCount = Math.max(0, target.repostsCount - 1);
    } else {
      target.repostedBy.push(userId);
      target.repostsCount += 1;
    }

    this.savePosts(posts);
    return target;
  }

  public toggleBookmark(postId: string, userId: string): Post | null {
    const posts = this.getPosts();
    const target = posts.find((p) => p.id === postId);
    if (!target) return null;

    const alreadyBookmarked = target.bookmarkedBy.includes(userId);
    if (alreadyBookmarked) {
      target.bookmarkedBy = target.bookmarkedBy.filter((id) => id !== userId);
    } else {
      target.bookmarkedBy.push(userId);
    }

    this.savePosts(posts);
    return target;
  }

  public addComment(
    postId: string,
    author: StudentProfile,
    content: string
  ): PostComment | null {
    const posts = this.getPosts();
    const target = posts.find((p) => p.id === postId);
    if (!target) return null;

    const comment: PostComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatarUrl,
      authorCollege: author.college,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    target.comments.push(comment);
    target.commentsCount = target.comments.length;
    this.savePosts(posts);
    return comment;
  }

  public deletePost(postId: string): boolean {
    const posts = this.getPosts();
    const filtered = posts.filter((p) => p.id !== postId);
    if (filtered.length !== posts.length) {
      this.savePosts(filtered);
      return true;
    }
    return false;
  }

  public flagPost(postId: string, reason: string): boolean {
    const posts = this.getPosts();
    const target = posts.find((p) => p.id === postId);
    if (!target) return false;
    target.isFlagged = true;
    target.flagReason = reason;
    this.savePosts(posts);
    return true;
  }

  public unflagPost(postId: string): boolean {
    const posts = this.getPosts();
    const target = posts.find((p) => p.id === postId);
    if (!target) return false;
    target.isFlagged = false;
    delete target.flagReason;
    this.savePosts(posts);
    return true;
  }

  // =========================================================================
  // 2. DISCORD SERVER & CHANNEL REALTIME CHAT
  // =========================================================================

  public getServers(): CommunityServer[] {
    return DEFAULT_SERVERS;
  }

  public getChannelMessages(channelId: string): ChatMessage[] {
    if (typeof window === 'undefined') return INITIAL_CHANNEL_MESSAGES[channelId] || [];
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_MESSAGES}_${channelId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error fetching channel messages:', e);
    }
    const initial = INITIAL_CHANNEL_MESSAGES[channelId] || [];
    this.saveChannelMessages(channelId, initial);
    return initial;
  }

  public saveChannelMessages(channelId: string, messages: ChatMessage[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_MESSAGES}_${channelId}`, JSON.stringify(messages));
    } catch (e) {
      console.warn('Error saving channel messages:', e);
    }
  }

  public sendChannelMessage(
    serverId: string,
    channelId: string,
    sender: StudentProfile,
    content: string,
    role?: ChatMessage['senderRole'],
    mediaType: 'image' | 'code' | 'none' = 'none',
    mediaUrl?: string,
    codeSnippet?: string,
    codeLanguage?: string
  ): ChatMessage {
    const currentMessages = this.getChannelMessages(channelId);
    
    let actualRole: ChatMessage['senderRole'] = role || 'Scholar';
    if (!role) {
      if (sender.level >= 20) actualRole = 'Polymath';
      else if (sender.level >= 15) actualRole = 'Professor';
      else if (sender.level < 5) actualRole = 'Apprentice';
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      serverId,
      channelId,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatarUrl,
      senderRole: actualRole,
      content: content.trim(),
      mediaUrl,
      mediaType,
      codeSnippet,
      codeLanguage,
      createdAt: new Date().toISOString(),
      reactions: {}
    };

    const updated = [...currentMessages, newMessage];
    this.saveChannelMessages(channelId, updated);

    // Notify live subscribers
    this.messageSubscribers.forEach((cb) => {
      try {
        cb(channelId, newMessage);
      } catch (err) {
        console.warn('Subscriber error:', err);
      }
    });

    return newMessage;
  }

  public sendChatMessage(
    serverId: string,
    channelId: string,
    sender: StudentProfile,
    content: string,
    mediaUrl?: string,
    mediaType: 'image' | 'code' | 'none' = 'none',
    codeLanguage?: string
  ): ChatMessage {
    return this.sendChannelMessage(
      serverId,
      channelId,
      sender,
      content,
      undefined,
      mediaType,
      mediaUrl,
      undefined,
      codeLanguage
    );
  }

  public addMessageReaction(channelId: string, messageId: string, emoji: string, userId: string): ChatMessage | null {
    const messages = this.getChannelMessages(channelId);
    const target = messages.find((m) => m.id === messageId);
    if (!target) return null;

    if (!target.reactions[emoji]) {
      target.reactions[emoji] = [];
    }

    const index = target.reactions[emoji].indexOf(userId);
    if (index >= 0) {
      target.reactions[emoji].splice(index, 1);
      if (target.reactions[emoji].length === 0) {
        delete target.reactions[emoji];
      }
    } else {
      target.reactions[emoji].push(userId);
    }

    this.saveChannelMessages(channelId, messages);
    return target;
  }

  public subscribeToMessages(callback: (channelId: string, msg: ChatMessage) => void): () => void {
    this.messageSubscribers.push(callback);
    return () => {
      this.messageSubscribers = this.messageSubscribers.filter((cb) => cb !== callback);
    };
  }

  public subscribeChannel(channelId: string, callback: (msg: ChatMessage) => void): () => void {
    return this.subscribeToMessages((chId, msg) => {
      if (chId === channelId) {
        callback(msg);
      }
    });
  }

  // =========================================================================
  // 3. INSTAGRAM-STYLE DIRECT MESSAGES (DMs)
  // =========================================================================

  public getDirectMessages(conversationId: string): DirectMessage[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_DMS}_${conversationId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading DMs:', e);
    }
    return [];
  }

  public saveDirectMessages(conversationId: string, messages: DirectMessage[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_DMS}_${conversationId}`, JSON.stringify(messages));
    } catch (e) {
      console.warn('Error saving DMs:', e);
    }
  }

  public sendDirectMessage(
    conversationId: string,
    senderId: string,
    recipientId: string,
    senderName: string,
    content: string,
    senderAvatar?: string,
    mediaUrl?: string
  ): DirectMessage {
    const existing = this.getDirectMessages(conversationId);

    const newDM: DirectMessage = {
      id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversationId,
      senderId,
      recipientId,
      senderName,
      senderAvatar,
      content: content.trim(),
      mediaUrl,
      createdAt: new Date().toISOString(),
      read: false
    };

    const updated = [...existing, newDM];
    this.saveDirectMessages(conversationId, updated);

    this.dmSubscribers.forEach((cb) => {
      try {
        cb(conversationId, newDM);
      } catch (err) {}
    });

    return newDM;
  }

  public getConversations(userId: string): DMConversation[] {
    const key = `mba_dm_conversations_${userId}`;
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading conversations:', e);
    }

    const initial: DMConversation[] = [
      {
        id: 'conv_priya_sharma',
        participantIds: [userId, 'peer_priya'],
        peerProfile: {
          id: 'peer_priya',
          name: 'Priya Sharma',
          email: 'priya.sharma@iitb.ac.in',
          college: 'Indian Institute of Technology (IIT)',
          course: 'B.Tech Computer Science',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          online: true,
          level: 15
        },
        lastMessage: {
          id: 'm_init_1',
          conversationId: 'conv_priya_sharma',
          senderId: 'peer_priya',
          recipientId: userId,
          senderName: 'Priya Sharma',
          content: 'Hey! Are you studying for the Computer Networks mid-term this week? We have a squad session.',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          read: true
        },
        unreadCount: 0
      },
      {
        id: 'conv_marcus_vance',
        participantIds: [userId, 'peer_marcus'],
        peerProfile: {
          id: 'peer_marcus',
          name: 'Marcus Vance',
          email: 'marcus.v@mit.edu',
          college: 'MIT',
          course: 'M.S. Computer Science',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          online: false,
          level: 19
        },
        lastMessage: {
          id: 'm_init_2',
          conversationId: 'conv_marcus_vance',
          senderId: 'peer_marcus',
          recipientId: userId,
          senderName: 'Marcus Vance',
          content: 'Check out the B+ Tree doubly-linked pointer trick Alex posted. It shaved 20% off tree query times.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          read: true
        },
        unreadCount: 0
      }
    ];

    try {
      localStorage.setItem(key, JSON.stringify(initial));
    } catch {}
    return initial;
  }

  public getOrCreateConversation(userId: string, peer: DMConversation['peerProfile']): string {
    const convs = this.getConversations(userId);
    const existing = convs.find((c) => c.peerProfile.id === peer.id);
    if (existing) return existing.id;

    const newConvId = `conv_${peer.id}`;
    const newConv: DMConversation = {
      id: newConvId,
      participantIds: [userId, peer.id],
      peerProfile: peer,
      unreadCount: 0
    };

    const updated = [newConv, ...convs];
    try {
      localStorage.setItem(`mba_dm_conversations_${userId}`, JSON.stringify(updated));
    } catch {}
    return newConvId;
  }

  public subscribeToDMs(callback: (conversationId: string, msg: DirectMessage) => void): () => void {
    this.dmSubscribers.push(callback);
    return () => {
      this.dmSubscribers = this.dmSubscribers.filter((cb) => cb !== callback);
    };
  }

  // =========================================================================
  // 4. SNAPCHAT-STYLE FRIEND SUGGESTIONS & MATCHMAKER
  // =========================================================================

  public getFriendSuggestions(userProfile: StudentProfile, gaps: LearningGap[]): FriendSuggestion[] {
    // Dynamic matching algorithm: assigns match affinity score based on mutual university, course, and learning gaps
    const userCollege = (userProfile.college || '').toLowerCase();
    const userCourse = (userProfile.course || userProfile.degree || '').toLowerCase();
    const userGaps = gaps.map((g) => g.topic.toLowerCase());

    return MOCK_PEERS.map((peer) => {
      let score = 50;
      const reasons: string[] = [];

      if (peer.college && userCollege && peer.college.toLowerCase().includes(userCollege)) {
        score += 25;
        reasons.push(`Attends ${peer.college}`);
      }

      if (peer.course && userCourse && peer.course.toLowerCase().includes(userCourse)) {
        score += 20;
        reasons.push(`Studying same program: ${peer.course}`);
      }

      if (peer.semester === userProfile.semester) {
        score += 15;
        reasons.push(`In Semester ${peer.semester}`);
      }

      const commonGaps = peer.commonLearningGaps.filter((g) =>
        userGaps.some((ug) => ug.includes(g.toLowerCase()) || g.toLowerCase().includes(ug))
      );

      if (commonGaps.length > 0) {
        score += 25;
        reasons.push(`Overlapping learning gap: ${commonGaps[0]}`);
      }

      const finalScore = Math.min(99, Math.max(65, score));

      return {
        ...peer,
        matchScore: finalScore,
        matchReasons: reasons.length > 0 ? reasons : ['High academic study consistency']
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  public getFollowingUserIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FOLLOWING);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public toggleFollow(targetUserId: string): boolean {
    return this.toggleFollowUser(targetUserId);
  }

  public toggleFollowUser(targetUserId: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FOLLOWING);
      const following: string[] = stored ? JSON.parse(stored) : [];
      const isFollowing = following.includes(targetUserId);

      let updated: string[];
      if (isFollowing) {
        updated = following.filter((id) => id !== targetUserId);
      } else {
        updated = [...following, targetUserId];
      }

      localStorage.setItem(STORAGE_KEY_FOLLOWING, JSON.stringify(updated));
      return !isFollowing;
    } catch (e) {
      return false;
    }
  }

  public isFollowing(targetUserId: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FOLLOWING);
      const following: string[] = stored ? JSON.parse(stored) : [];
      return following.includes(targetUserId);
    } catch (e) {
      return false;
    }
  }
}

export const communityService = new CommunityService();
