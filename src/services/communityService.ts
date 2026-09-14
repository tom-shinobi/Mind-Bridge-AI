import type {
  Post,
  PostComment,
  CommunityServer,
  ChatMessage,
  DirectMessage,
  FriendSuggestion,
  StudentProfile,
  LearningGap,
  DMConversation,
  ScholarDirectoryUser
} from '../types';
import { webSocketService } from './webSocketService';
import { getSupabaseClient } from './supabaseClient';

const STORAGE_KEY_POSTS = 'mba_community_posts';
const STORAGE_KEY_MESSAGES = 'mba_channel_messages';
const STORAGE_KEY_DMS = 'mba_direct_messages';
const STORAGE_KEY_FOLLOWING = 'mba_following_users';

// Comprehensive Campus Directory of Verified Students & Scholars with unique Instagram-style handles
export const CAMPUS_DIRECTORY: ScholarDirectoryUser[] = [
  {
    id: 'user_alex_chen',
    name: 'Alex Chen',
    handle: '@alex_chen',
    email: 'alex.chen@stanford.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    college: 'Stanford University',
    course: 'B.Tech Computer Science',
    level: 14,
    bio: 'Tree indexing & algorithm optimization enthusiast. Socratic learner.',
    online: true,
    semester: 6,
    mutualSubjects: ['Database Systems', 'Data Structures & Algorithms'],
    commonLearningGaps: ['B-Trees & B+ Tree Indexing']
  },
  {
    id: 'peer_priya',
    name: 'Priya Sharma',
    handle: '@priya_sharma',
    email: 'priya.sharma@iitb.ac.in',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    college: 'Indian Institute of Technology (IIT)',
    course: 'B.Tech / B.E. Computer Science',
    level: 16,
    bio: 'Polymath scholar focusing on DBMS, concurrency control, and distributed systems.',
    online: true,
    semester: 6,
    mutualSubjects: ['Database Management Systems', 'Computer Networks'],
    commonLearningGaps: ['B-Trees & B+ Tree Indexing', 'TCP Congestion Control']
  },
  {
    id: 'peer_marcus',
    name: 'Marcus Vance',
    handle: '@marcus_vance',
    email: 'marcus.vance@mit.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    college: 'MIT',
    course: 'M.S. Computer Science',
    level: 19,
    bio: 'Systems, kernel internals, and network protocol optimization.',
    online: true,
    semester: 6,
    mutualSubjects: ['Operating Systems', 'Computer Networks'],
    commonLearningGaps: ['TCP Congestion Control', 'Deadlock Avoidance']
  },
  {
    id: 'peer_david',
    name: 'David Kim',
    handle: '@david_kim',
    email: 'david.kim@stanford.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    college: 'Stanford University',
    course: 'B.Tech / B.E. Computer Science',
    level: 18,
    bio: 'Paging architectures, virtual memory & cache hierarchies.',
    online: true,
    semester: 6,
    mutualSubjects: ['Operating Systems', 'Data Structures & Algorithms'],
    commonLearningGaps: ['Virtual Memory & Page Replacement']
  },
  {
    id: 'user_elena_rostova',
    name: 'Elena Rostova',
    handle: '@elena_rostova',
    email: 'elena.rostova@berkeley.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    college: 'UC Berkeley',
    course: 'B.S. Electrical Eng & CS',
    level: 17,
    bio: 'Database normalization theory and formal automated verification.',
    online: false,
    semester: 6,
    mutualSubjects: ['Database Systems', 'Compiler Design'],
    commonLearningGaps: ['Relational Normalization (BCNF & 3NF)']
  },
  {
    id: 'user_sarah_jenkins',
    name: 'Sarah Jenkins',
    handle: '@sarah_jenkins',
    email: 'sarah.jenkins@berkeley.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    college: 'UC Berkeley',
    course: 'B.S. Artificial Intelligence',
    level: 12,
    bio: 'Deep learning models, attention mechanisms, and dynamic programming.',
    online: true,
    semester: 6,
    mutualSubjects: ['Machine Learning', 'Data Structures & Algorithms'],
    commonLearningGaps: ['Dynamic Programming State Spaces']
  },
  {
    id: 'peer_ananya',
    name: 'Ananya Roy',
    handle: '@ananya_roy',
    email: 'ananya.roy@mit.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    college: 'MIT',
    course: 'B.S. Artificial Intelligence & Data Science',
    level: 13,
    bio: 'Semaphores, synchronization primitives, and neural loss landscapes.',
    online: false,
    semester: 6,
    mutualSubjects: ['Operating Systems', 'Machine Learning'],
    commonLearningGaps: ['Counting Semaphores', 'Backpropagation']
  },
  {
    id: 'user_rohan_mehta',
    name: 'Rohan Mehta',
    handle: '@rohan_mehta',
    email: 'rohan.mehta@iitd.ac.in',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    college: 'IIT Delhi',
    course: 'B.Tech Computer Engineering',
    level: 15,
    bio: 'Master Theorem proofs, asymptotic complexity, and graph theory.',
    online: true,
    semester: 6,
    mutualSubjects: ['Data Structures & Algorithms', 'Discrete Mathematics'],
    commonLearningGaps: ['Master Theorem Recurrences']
  }
];

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

// Initial Seed Posts (Twitter/X Style with Unique Instagram-Style Handles)
const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'user_alex_chen',
    authorName: 'Alex Chen',
    authorHandle: '@alex_chen',
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
        authorId: 'peer_priya',
        authorName: 'Priya Sharma',
        authorHandle: '@priya_sharma',
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
    authorId: 'peer_marcus',
    authorName: 'Marcus Vance',
    authorHandle: '@marcus_vance',
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
    authorHandle: '@sarah_jenkins',
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

// Initial Mock Channel Messages with Rich Doubts & Peer Interactions
const INITIAL_CHANNEL_MESSAGES: Record<string, ChatMessage[]> = {
  ch_global_general: [
    {
      id: 'msg_1',
      serverId: 'server_global',
      channelId: 'ch_global_general',
      senderId: 'user_elena_rostova',
      senderName: 'Elena Rostova',
      senderHandle: '@elena_rostova',
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
      senderHandle: '@david_kim',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Polymath',
      content: 'Yes! It immediately populated the Smart Timetable with prioritized blocks for Virtual Memory and Page Replacement algorithms. Super seamless.',
      createdAt: '2026-09-11T14:12:30Z',
      reactions: { '🙌': ['user_elena_rostova'] }
    }
  ],
  ch_global_doubts: [
    {
      id: 'msg_gd_1',
      serverId: 'server_global',
      channelId: 'ch_global_doubts',
      senderId: 'user_rohan_mehta',
      senderName: 'Rohan Mehta',
      senderHandle: '@rohan_mehta',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Scholar',
      content: 'Quick doubt on Master Theorem: What happens when f(n) = n^(log_b a) * log n? Does Case 2 apply directly?',
      createdAt: '2026-09-11T15:20:00Z',
      reactions: { '❓': ['user_1'] }
    },
    {
      id: 'msg_gd_2',
      serverId: 'server_global',
      channelId: 'ch_global_doubts',
      senderId: 'peer_priya',
      senderName: 'Priya Sharma',
      senderHandle: '@priya_sharma',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Polymath',
      content: 'Hey Rohan! Yes, this is the Extended Case 2: if f(n) = Theta(n^(log_b a) * log^k n) where k >= 0, then T(n) = Theta(n^(log_b a) * log^(k+1) n). So here it simplifies cleanly to Theta(n^(log_b a) * log^2 n)!',
      createdAt: '2026-09-11T15:22:15Z',
      reactions: { '💡': ['user_rohan_mehta', 'user_2'], '🔥': ['user_3'] }
    }
  ],
  ch_cs_general: [
    {
      id: 'msg_cs_1',
      serverId: 'server_cs_ai',
      channelId: 'ch_cs_general',
      senderId: 'user_marcus_vance',
      senderName: 'Marcus Vance',
      senderHandle: '@marcus_vance',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Professor',
      content: 'Remember: In multi-head self-attention, projection matrices W_Q, W_K, W_V project from d_model into d_k = d_model / h. This keeps overall computational cost equivalent to single-head attention while learning distinct representation subspaces.',
      mediaType: 'code',
      codeSnippet: `Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V`,
      codeLanguage: 'python',
      createdAt: '2026-09-11T13:40:00Z',
      reactions: { '🧠': ['user_1', 'user_2', 'user_3'], '🚀': ['user_4'] }
    }
  ],
  ch_cs_code: [
    {
      id: 'msg_code_1',
      serverId: 'server_cs_ai',
      channelId: 'ch_cs_code',
      senderId: 'user_sarah_jenkins',
      senderName: 'Sarah Jenkins',
      senderHandle: '@sarah_jenkins',
      senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Scholar',
      content: 'Wrote a fast causal masking utility for PyTorch scaled dot-product attention. Tested on sequence lengths up to 4096:',
      mediaType: 'code',
      codeSnippet: `def create_causal_mask(seq_len: int, device: torch.device):\n    return torch.triu(torch.full((seq_len, seq_len), float('-inf'), device=device), diagonal=1)`,
      codeLanguage: 'python',
      createdAt: '2026-09-11T16:05:00Z',
      reactions: { '🔥': ['user_marcus_vance'], '💯': ['user_david_kim'] }
    }
  ],
  ch_cs_exams: [
    {
      id: 'msg_dsa_1',
      serverId: 'server_cs_ai',
      channelId: 'ch_cs_exams',
      senderId: 'user_alex_chen',
      senderName: 'Alex Chen',
      senderHandle: '@alex_chen',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Scholar',
      content: 'Tip for the upcoming mid-term: In 0/1 Knapsack, if you want 1D space optimization, make sure your capacity loop runs BACKWARDS (W down to wt[i]). If you loop forwards, you accidentally solve Unbounded Knapsack because items get used multiple times!',
      createdAt: '2026-09-11T16:30:00Z',
      reactions: { '🧠': ['user_1', 'user_2'], '🙌': ['user_3'] }
    }
  ],
  ch_sys_general: [
    {
      id: 'msg_sys_1',
      serverId: 'server_systems',
      channelId: 'ch_sys_general',
      senderId: 'user_david_kim',
      senderName: 'David Kim',
      senderHandle: '@david_kim',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Polymath',
      content: 'In 64-bit x86-64 architectures, only 48 or 57 bits are used for virtual addresses (4-level or 5-level paging). The upper bits must be sign-extended (canonical address format), otherwise the CPU triggers a general protection fault (#GP).',
      createdAt: '2026-09-11T11:15:00Z',
      reactions: { '⚡': ['user_1'], '💡': ['user_2'] }
    }
  ],
  ch_sys_doubts: [
    {
      id: 'msg_sd_1',
      serverId: 'server_systems',
      channelId: 'ch_sys_doubts',
      senderId: 'peer_ananya',
      senderName: 'Ananya Roy',
      senderHandle: '@ananya_roy',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Scholar',
      content: 'Can someone explain why counting semaphores can be implemented using two binary semaphores without priority inversion?',
      createdAt: '2026-09-11T12:40:00Z',
      reactions: { '❓': ['user_1'] }
    },
    {
      id: 'msg_sd_2',
      serverId: 'server_systems',
      channelId: 'ch_sys_doubts',
      senderId: 'peer_marcus',
      senderName: 'Marcus Vance',
      senderHandle: '@marcus_vance',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Professor',
      content: 'Great question! One binary semaphore acts as a mutex to guard the integer counter `val`, and the second acts as a delay queue semaphore where threads sleep when `val <= 0`. When signal() increments `val`, if threads are waiting, it releases the second semaphore.',
      createdAt: '2026-09-11T12:44:30Z',
      reactions: { '🧠': ['user_ananya_roy'], '🚀': ['user_2'] }
    }
  ],
  ch_db_indexing: [
    {
      id: 'msg_dbi_1',
      serverId: 'server_dbms',
      channelId: 'ch_db_indexing',
      senderId: 'peer_priya',
      senderName: 'Priya Sharma',
      senderHandle: '@priya_sharma',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Polymath',
      content: 'Reminder for the DBMS indexing assessment: B+ Tree nodes have fan-out M between 50 and 500 in practice. A 3-level B+ tree with fan-out 100 can store 100^3 = 1,000,000 leaf pages. At 8KB per page, that indexes 8GB of table data with only 3 I/O reads!',
      createdAt: '2026-09-11T10:10:00Z',
      reactions: { '🔥': ['user_1', 'user_2'], '💯': ['user_3'] }
    }
  ],
  ch_db_normal: [
    {
      id: 'msg_dbn_1',
      serverId: 'server_dbms',
      channelId: 'ch_db_normal',
      senderId: 'user_david_kim',
      senderName: 'David Kim',
      senderHandle: '@david_kim',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Polymath',
      content: 'Can someone confirm the difference between dependency preservation and lossless join in BCNF?',
      createdAt: '2026-09-11T11:50:00Z',
      reactions: { '❓': ['user_1'] }
    },
    {
      id: 'msg_dbn_2',
      serverId: 'server_dbms',
      channelId: 'ch_db_normal',
      senderId: 'peer_priya',
      senderName: 'Priya Sharma',
      senderHandle: '@priya_sharma',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      senderRole: 'Polymath',
      content: 'Crucial distinction! Lossless join is GUARANTEED in BCNF (using common attributes that form a superkey in one sub-relation). But dependency preservation is NOT always possible in BCNF. If you strictly need dependency preservation, you stop at 3NF!',
      createdAt: '2026-09-11T11:53:20Z',
      reactions: { '💡': ['user_david_kim'], '🔥': ['user_2'], '🙌': ['user_3'] }
    }
  ]
};

// Initial Peer Profiles for Matchmaker (Snapchat Logic)
export const MOCK_PEERS: FriendSuggestion[] = [
  {
    id: 'peer_priya',
    name: 'Priya Sharma',
    handle: '@priya_sharma',
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
    handle: '@david_kim',
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
    handle: '@ananya_roy',
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
    handle: '@marcus_vance',
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
  private postSubscribers: Array<(posts: Post[]) => void> = [];
  private messageSubscribers: Array<(channelId: string, msg: ChatMessage) => void> = [];
  private dmSubscribers: Array<(conversationId: string, msg: DirectMessage) => void> = [];
  private typingSubscribers: Array<(channelId: string, username: string | null) => void> = [];
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Production WebSocket Real-Time Listeners (Multi-Device Internet Sync)
      webSocketService.onPostCreated((post) => {
        const posts = this.getPosts();
        if (!posts.some((p) => p.id === post.id)) {
          const updated = [post, ...posts];
          this.savePosts(updated, false);
        }
      });

      webSocketService.onPostLiked(({ postId, likesCount, likedBy }) => {
        const posts = this.getPosts();
        const target = posts.find((p) => p.id === postId);
        if (target) {
          target.likesCount = likesCount;
          target.likedBy = likedBy;
          this.savePosts(posts, false);
        }
      });

      webSocketService.onPostComment(({ postId, comment, commentsCount }) => {
        const posts = this.getPosts();
        const target = posts.find((p) => p.id === postId);
        if (target) {
          if (!target.comments.some((c) => c.id === comment.id)) {
            target.comments.push(comment);
            target.commentsCount = commentsCount ?? target.comments.length;
            this.savePosts(posts, false);
          }
        }
      });

      webSocketService.onPostDeleted((postId) => {
        const posts = this.getPosts();
        if (posts.some((p) => p.id === postId)) {
          this.savePosts(posts.filter((p) => p.id !== postId), false);
        }
      });

      webSocketService.onChannelMessage(({ channelId, message }) => {
        const currentMessages = this.getChannelMessages(channelId);
        if (!currentMessages.some((m) => m.id === message.id)) {
          const updated = [...currentMessages, message];
          this.saveChannelMessages(channelId, updated);
          this.messageSubscribers.forEach((cb) => {
            try { cb(channelId, message); } catch (e) {}
          });
          try {
            window.dispatchEvent(new CustomEvent('mba_community_update', {
              detail: { type: 'channel_message', channelId, message }
            }));
          } catch {}
        }
      });

      webSocketService.onDirectMessage(({ conversationId, message }) => {
        const existing = this.getDirectMessages(conversationId);
        if (!existing.some((m) => m.id === message.id)) {
          const updated = [...existing, message];
          this.saveDirectMessages(conversationId, updated);
          this.dmSubscribers.forEach((cb) => {
            try { cb(conversationId, message); } catch (e) {}
          });
          try {
            window.dispatchEvent(new CustomEvent('mba_community_update', {
              detail: { type: 'dm', conversationId, message }
            }));
          } catch {}
        }
      });

      webSocketService.onTyping((info) => {
        if (info && info.targetId) {
          this.typingSubscribers.forEach((cb) => {
            try { cb(info.targetId, info.isTyping ? info.userName : null); } catch (e) {}
          });
        }
      });

      // Synchronize latest posts from server on initial connection
      webSocketService.on('sync', (data) => {
        if (data && Array.isArray(data.posts) && data.posts.length > 0) {
          const local = this.getPosts();
          const localIds = new Set(local.map((p) => p.id));
          const newRemote = data.posts.filter((p: Post) => !localIds.has(p.id));
          if (newRemote.length > 0) {
            this.savePosts([...newRemote, ...local], false);
          }
        }
      });

      // 2. Cross-tab BroadcastChannel fallback
      if ('BroadcastChannel' in window) {
        try {
          this.broadcastChannel = new BroadcastChannel('mba_community_realtime');
          this.broadcastChannel.onmessage = (event) => {
            const data = event.data;
            if (!data) return;
            if (data.type === 'posts_update' && Array.isArray(data.posts)) {
              this.postSubscribers.forEach((cb) => {
                try { cb(data.posts); } catch (e) {}
              });
            } else if (data.type === 'channel_message' && data.channelId && data.message) {
              this.messageSubscribers.forEach((cb) => {
                try { cb(data.channelId, data.message); } catch (e) {}
              });
            } else if (data.type === 'dm_message' && data.conversationId && data.message) {
              this.dmSubscribers.forEach((cb) => {
                try { cb(data.conversationId, data.message); } catch (e) {}
              });
            } else if (data.type === 'typing' && data.channelId) {
              this.typingSubscribers.forEach((cb) => {
                try { cb(data.channelId, data.username ?? null); } catch (e) {}
              });
            }
          };
        } catch (err) {
          console.warn('BroadcastChannel error:', err);
        }
      }

      // 3. Storage event listener fallback for cross-tab realtime sync
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY_POSTS && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.postSubscribers.forEach((cb) => {
              try { cb(parsed); } catch (err) {}
            });
          } catch {}
        }
      });

      // 4. Supabase Realtime Broadcast fallback if configured
      try {
        const client = getSupabaseClient();
        if (client) {
          const channel = client.channel('community_hub_sync');
          channel
            .on('broadcast', { event: 'post_created' }, ({ payload }) => {
              if (payload?.post) {
                const posts = this.getPosts();
                if (!posts.some((p) => p.id === payload.post.id)) {
                  this.savePosts([payload.post, ...posts], false);
                }
              }
            })
            .subscribe();
        }
      } catch {}
    }
  }

  // =========================================================================
  // 1. POSTS & ACADEMIC FEED (REAL-TIME REACTIVE STREAM)
  // =========================================================================

  public subscribeToPosts(callback: (posts: Post[]) => void): () => void {
    this.postSubscribers.push(callback);
    return () => {
      this.postSubscribers = this.postSubscribers.filter((cb) => cb !== callback);
    };
  }

  public getPosts(): Post[] {
    if (typeof window === 'undefined') return INITIAL_POSTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_POSTS);
      if (stored) {
        const parsed: Post[] = JSON.parse(stored);
        // Ensure all posts have author handles
        let updated = false;
        parsed.forEach((p) => {
          if (!p.authorHandle) {
            const scholar = CAMPUS_DIRECTORY.find((s) => s.id === p.authorId || s.name === p.authorName);
            p.authorHandle = scholar ? scholar.handle : `@${p.authorName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            updated = true;
          }
        });
        if (updated) {
          try { localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(parsed)); } catch {}
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading posts from storage:', e);
    }
    this.savePosts(INITIAL_POSTS);
    return INITIAL_POSTS;
  }

  public savePosts(posts: Post[], _broadcast: boolean = true): void {
    void _broadcast;
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    } catch (e) {
      console.warn('Error saving posts to storage:', e);
    }

    // 1. In-process subscribers
    this.postSubscribers.forEach((cb) => {
      try { cb(posts); } catch (e) {}
    });

    // 2. BroadcastChannel across tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'posts_update', posts });
      } catch (e) {}
    }

    // 3. Dispatch Custom Window Event for any listening component
    try {
      window.dispatchEvent(new CustomEvent('mba_community_update', { detail: { type: 'posts', posts } }));
    } catch {}
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
    const handle = author.handle || `@${(author.name || 'scholar').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      authorId: author.id,
      authorName: author.name,
      authorHandle: handle,
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

    // Broadcast across devices over WebSocket
    webSocketService.sendPostCreate(newPost);

    // If post is created by student, schedule realistic peer likes & comments in real-time
    if (!author.id.startsWith('user_') && !author.id.startsWith('peer_')) {
      this.schedulePeerPostEngagement(newPost.id, newPost.content);
    }

    return newPost;
  }

  private schedulePeerPostEngagement(postId: string, content: string) {
    const q = content.toLowerCase();

    // 1. Peer like after 3.5 seconds
    setTimeout(() => {
      const posts = this.getPosts();
      const target = posts.find((p) => p.id === postId);
      if (!target) return;
      const peerLiker = CAMPUS_DIRECTORY[Math.floor(Math.random() * CAMPUS_DIRECTORY.length)];
      if (!target.likedBy.includes(peerLiker.id)) {
        target.likedBy.push(peerLiker.id);
        target.likesCount += 1;
        this.savePosts(posts);
      }
    }, 3500);

    // 2. Peer insightful comment after 6.5 seconds
    setTimeout(() => {
      const posts = this.getPosts();
      const target = posts.find((p) => p.id === postId);
      if (!target) return;

      let peer = CAMPUS_DIRECTORY[1]; // Priya Sharma (@priya_sharma)
      let commentText = 'Incredible breakdown! This clarifies a tricky concept before the upcoming midterm.';

      if (q.includes('tcp') || q.includes('network') || q.includes('ack') || q.includes('packet')) {
        peer = CAMPUS_DIRECTORY[2]; // Marcus Vance (@marcus_vance)
        commentText = 'Spot-on explanation! Remembering how window scaling interacts with RTT and duplicate ACKs makes all the difference.';
      } else if (q.includes('sql') || q.includes('index') || q.includes('b+') || q.includes('tree')) {
        peer = CAMPUS_DIRECTORY[0]; // Alex Chen (@alex_chen)
        commentText = 'Exactly right. Hoisting the median key preserves tree balance so elegantly while leaves remain linked. Appreciate this derivation!';
      } else if (q.includes('ai') || q.includes('dp') || q.includes('dynamic') || q.includes('knapsack')) {
        peer = CAMPUS_DIRECTORY[5]; // Sarah Jenkins (@sarah_jenkins)
        commentText = 'Love this! The memoized transition state fits the recurrence relation perfectly.';
      }

      const comment: PostComment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        postId,
        authorId: peer.id,
        authorName: peer.name,
        authorHandle: peer.handle,
        authorAvatar: peer.avatarUrl,
        authorCollege: peer.college,
        content: commentText,
        createdAt: new Date().toISOString()
      };

      target.comments.push(comment);
      target.commentsCount = target.comments.length;
      this.savePosts(posts);
    }, 6500);
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
    webSocketService.sendPostLike(postId, userId);
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

    const handle = author.handle || `@${(author.name || 'scholar').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const comment: PostComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      postId,
      authorId: author.id,
      authorName: author.name,
      authorHandle: handle,
      authorAvatar: author.avatarUrl,
      authorCollege: author.college,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    target.comments.push(comment);
    target.commentsCount = target.comments.length;
    this.savePosts(posts);

    // Broadcast comment across devices over WebSocket
    webSocketService.sendPostComment(postId, comment);

    // If user commented on someone else's post, schedule quick peer response
    if (target.authorId !== author.id && !author.id.startsWith('user_') && !author.id.startsWith('peer_')) {
      setTimeout(() => {
        const curPosts = this.getPosts();
        const curTarget = curPosts.find((p) => p.id === postId);
        if (!curTarget) return;
        const authorScholar = CAMPUS_DIRECTORY.find((s) => s.id === curTarget.authorId) || CAMPUS_DIRECTORY[0];
        const replyComment: PostComment = {
          id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          postId,
          authorId: authorScholar.id,
          authorName: authorScholar.name,
          authorHandle: authorScholar.handle,
          authorAvatar: authorScholar.avatarUrl,
          authorCollege: authorScholar.college,
          content: `Thanks ${handle}! That is a really sharp observation.`,
          createdAt: new Date().toISOString()
        };
        curTarget.comments.push(replyComment);
        curTarget.commentsCount = curTarget.comments.length;
        this.savePosts(curPosts);
      }, 4000);
    }

    return comment;
  }

  public deletePost(postId: string): boolean {
    const posts = this.getPosts();
    const filtered = posts.filter((p) => p.id !== postId);
    if (filtered.length !== posts.length) {
      this.savePosts(filtered);
      webSocketService.sendPostDelete(postId);
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

    const senderHandle = sender.handle || `@${(sender.name || 'scholar').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      serverId,
      channelId,
      senderId: sender.id,
      senderName: sender.name,
      senderHandle,
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

    // Broadcast across devices over WebSocket
    webSocketService.sendChannelMessage(serverId, channelId, newMessage);

    // Broadcast across tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'channel_message',
          channelId,
          message: newMessage
        });
      } catch (e) {}
    }

    try {
      window.dispatchEvent(new CustomEvent('mba_community_update', {
        detail: { type: 'channel_message', channelId, message: newMessage }
      }));
    } catch {}

    // If sent by a student user, schedule intelligent peer response
    if (
      sender.id &&
      !sender.id.startsWith('peer_') &&
      !sender.id.startsWith('user_alex') &&
      !sender.id.startsWith('user_marcus') &&
      !sender.id.startsWith('user_priya') &&
      !sender.id.startsWith('user_david') &&
      !sender.id.startsWith('user_elena') &&
      !sender.id.startsWith('user_sarah')
    ) {
      this.schedulePeerResponse(serverId, channelId, content);
    }

    return newMessage;
  }

  private schedulePeerResponse(serverId: string, channelId: string, userQuery: string) {
    // Select peer profile based on channel and content
    const peer: StudentProfile = {
      id: 'peer_priya',
      name: 'Priya Sharma',
      handle: '@priya_sharma',
      email: 'priya.sharma@iitb.ac.in',
      college: 'IIT Bombay',
      course: 'B.Tech Computer Science',
      degree: 'B.Tech Computer Science',
      department: 'Computer Science & Engineering',
      semester: 6,
      cgpa: 9.4,
      targetCgpa: 9.8,
      streakDays: 14,
      totalXp: 4800,
      joinedDate: '2026-01-10',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      level: 16
    };

    const q = userQuery.toLowerCase();
    let replyContent = '';
    let codeSnippet: string | undefined;
    let codeLanguage: string | undefined;

    if (q.includes('b+') || q.includes('b-tree') || q.includes('indexing') || channelId.includes('db_indexing')) {
      peer.name = 'Priya Sharma';
      peer.handle = '@priya_sharma';
      peer.avatarUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';
      replyContent = `Great question on B+ Trees! Remember that when a leaf node overflows (exceeds order m-1 keys), the median key is hoisted up to the parent, but remains in the leaf to maintain sequential scan integrity. All leaves are doubly-linked:`;
      codeSnippet = `// Leaf node split invariant:\nconst splitIndex = Math.floor(leaf.keys.length / 2);\nconst hoistedKey = leaf.keys[splitIndex];\nparent.insertKey(hoistedKey);\nnewLeaf.keys = leaf.keys.slice(splitIndex);\nleaf.keys = leaf.keys.slice(0, splitIndex);\nleaf.next = newLeaf; newLeaf.prev = leaf;`;
      codeLanguage = 'typescript';
    } else if (q.includes('tcp') || q.includes('ack') || q.includes('rto') || channelId.includes('sys_networks')) {
      peer.name = 'Marcus Vance';
      peer.handle = '@marcus_vance';
      peer.avatarUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
      replyContent = `On TCP ACK handling: 3 duplicate ACKs signify that packets arrived out-of-order (likely one segment dropped while downstream segments made it). This initiates Fast Retransmit without waiting for the full RTO timer to expire, instantly resetting ssthresh = cwnd / 2!`;
    } else if (q.includes('3nf') || q.includes('bcnf') || q.includes('normal') || channelId.includes('db_normal')) {
      peer.name = 'Elena Rostova';
      peer.handle = '@elena_rostova';
      peer.avatarUrl = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
      replyContent = `The core difference between 3NF and BCNF comes down to the determinant: In BCNF, for every functional dependency X → Y, X MUST be a superkey. 3NF softens this condition: if Y is a prime attribute (part of any candidate key), X does not need to be a superkey.`;
    } else if (q.includes('page') || q.includes('deadlock') || q.includes('clock') || channelId.includes('sys_doubts')) {
      peer.name = 'David Kim';
      peer.handle = '@david_kim';
      peer.avatarUrl = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80';
      replyContent = `For the Clock page replacement algorithm: think of it as circular FIFO with a second chance. If the pointer inspects a page with reference bit = 1, it clears the bit to 0 and advances. It evicts the first page it finds with reference bit = 0.`;
    } else if (q.includes('dp') || q.includes('dynamic') || q.includes('knapsack') || channelId.includes('cs_exams')) {
      peer.name = 'Sarah Jenkins';
      peer.handle = '@sarah_jenkins';
      peer.avatarUrl = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80';
      replyContent = `For DP problems like 0/1 Knapsack, identify the state tuple (index i, remaining weight w). If items cannot be repeated, iterate weight backwards from W down to weight[i] to prevent reusing the same element in 1D array optimization!`;
    } else {
      replyContent = `Insightful doubt! Based on what we covered in our lecture module, try breaking this down into the base case and recurrence invariant first. You can also ask the Socratic AI Tutor on the left nav for a step-by-step breakdown!`;
    }

    // Step 1: Trigger typing indicator after 600ms
    setTimeout(() => {
      this.notifyTyping(channelId, peer.name);
    }, 600);

    // Step 2: Send peer response after 2200ms
    setTimeout(() => {
      this.notifyTyping(channelId, null);
      this.sendChannelMessage(
        serverId,
        channelId,
        peer,
        replyContent,
        'Polymath',
        codeSnippet ? 'code' : 'none',
        undefined,
        codeSnippet,
        codeLanguage
      );
    }, 2200);
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

  public subscribeTyping(callback: (channelId: string, username: string | null) => void): () => void {
    this.typingSubscribers.push(callback);
    return () => {
      this.typingSubscribers = this.typingSubscribers.filter((cb) => cb !== callback);
    };
  }

  public notifyTyping(channelId: string, username: string | null): void {
    this.typingSubscribers.forEach((cb) => {
      try { cb(channelId, username); } catch (e) {}
    });
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'typing', channelId, username });
      } catch (e) {}
    }
  }

  // =========================================================================
  // 3. INSTAGRAM-STYLE DIRECT MESSAGES (DMs) WITH UNIQUE HANDLES
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
    mediaUrl?: string,
    senderHandle?: string
  ): DirectMessage {
    const existing = this.getDirectMessages(conversationId);

    const newDM: DirectMessage = {
      id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversationId,
      senderId,
      recipientId,
      senderName,
      senderHandle,
      senderAvatar,
      content: content.trim(),
      mediaUrl,
      createdAt: new Date().toISOString(),
      read: false
    };

    const updated = [...existing, newDM];
    this.saveDirectMessages(conversationId, updated);

    // Update conversation record with lastMessage
    const convs = this.getConversations(senderId);
    const targetConv = convs.find((c) => c.id === conversationId);
    if (targetConv) {
      targetConv.lastMessage = newDM;
      try {
        localStorage.setItem(`mba_dm_conversations_${senderId}`, JSON.stringify(convs));
      } catch {}
    }

    this.dmSubscribers.forEach((cb) => {
      try {
        cb(conversationId, newDM);
      } catch (err) {}
    });

    // Broadcast across devices over WebSocket
    webSocketService.sendDirectMessage(conversationId, newDM);

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'dm_message',
          conversationId,
          message: newDM
        });
      } catch (e) {}
    }

    try {
      window.dispatchEvent(new CustomEvent('mba_community_update', {
        detail: { type: 'dm', conversationId, message: newDM }
      }));
    } catch {}

    // Schedule automated reply from peer if sent by user
    if (!senderId.startsWith('peer_') && !senderId.startsWith('user_')) {
      this.scheduleDirectMessageReply(conversationId, senderId, recipientId, content);
    }

    return newDM;
  }

  private scheduleDirectMessageReply(
    conversationId: string,
    userId: string,
    peerId: string,
    _userMessage: string
  ) {
    const convs = this.getConversations(userId);
    const conv = convs.find((c) => c.id === conversationId || c.peerProfile.id === peerId);
    const peerName = conv ? conv.peerProfile.name : 'Study Peer';
    const peerHandle = conv?.peerProfile.handle;
    const peerAvatar = conv ? conv.peerProfile.avatarUrl : undefined;

    setTimeout(() => {
      const replies = [
        `Hey! Thanks for pinging me on this. I just checked my lecture notes, and that completely matches what the professor covered!`,
        `Got your message! Let's definitely review this topic together before the upcoming mid-term session.`,
        `Solid question! I found that tracing through a small concrete example made it super intuitive. Let me know if you want to hop into the Pomodoro Lounge!`,
        `Agreed! Check out the DreamNotes module too—you can index our notes into the AI Tutor so it tests us on it.`
      ];
      const selectedReply = replies[Math.floor(Math.random() * replies.length)];

      const existing = this.getDirectMessages(conversationId);
      const peerDM: DirectMessage = {
        id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        conversationId,
        senderId: peerId,
        recipientId: userId,
        senderName: peerName,
        senderHandle: peerHandle,
        senderAvatar: peerAvatar,
        content: selectedReply,
        createdAt: new Date().toISOString(),
        read: false
      };

      const updated = [...existing, peerDM];
      this.saveDirectMessages(conversationId, updated);

      // Update conversation lastMessage
      if (conv) {
        conv.lastMessage = peerDM;
        try {
          localStorage.setItem(`mba_dm_conversations_${userId}`, JSON.stringify(convs));
        } catch {}
      }

      this.dmSubscribers.forEach((cb) => {
        try { cb(conversationId, peerDM); } catch (e) {}
      });

      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage({
            type: 'dm_message',
            conversationId,
            message: peerDM
          });
        } catch (e) {}
      }

      try {
        window.dispatchEvent(new CustomEvent('mba_community_update', {
          detail: { type: 'dm', conversationId, message: peerDM }
        }));
      } catch {}
    }, 2000);
  }

  public getConversations(userId: string): DMConversation[] {
    const key = `mba_dm_conversations_${userId}`;
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: DMConversation[] = JSON.parse(stored);
        let changed = false;
        parsed.forEach((c) => {
          if (!c.peerProfile.handle) {
            const scholar = CAMPUS_DIRECTORY.find((s) => s.id === c.peerProfile.id || s.name === c.peerProfile.name);
            c.peerProfile.handle = scholar ? scholar.handle : `@${c.peerProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            changed = true;
          }
        });
        if (changed) {
          try { localStorage.setItem(key, JSON.stringify(parsed)); } catch {}
        }
        return parsed;
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
          handle: '@priya_sharma',
          email: 'priya.sharma@iitb.ac.in',
          college: 'Indian Institute of Technology (IIT)',
          course: 'B.Tech / B.E. Computer Science',
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
          senderHandle: '@priya_sharma',
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
          handle: '@marcus_vance',
          email: 'marcus.vance@mit.edu',
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
          senderHandle: '@marcus_vance',
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
    const existing = convs.find((c) => c.peerProfile.id === peer.id || (peer.handle && c.peerProfile.handle === peer.handle));
    if (existing) {
      if (!existing.peerProfile.handle && peer.handle) {
        existing.peerProfile.handle = peer.handle;
        try {
          localStorage.setItem(`mba_dm_conversations_${userId}`, JSON.stringify(convs));
        } catch {}
      }
      return existing.id;
    }

    const handle = peer.handle || `@${peer.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const newConvId = `conv_${peer.id || handle.replace('@', '')}`;
    const newConv: DMConversation = {
      id: newConvId,
      participantIds: [userId, peer.id],
      peerProfile: {
        ...peer,
        handle
      },
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
  // 4. CENTRAL SCHOLAR DIRECTORY & INSTA USERNAME SEARCH
  // =========================================================================

  public getAllScholars(): ScholarDirectoryUser[] {
    return CAMPUS_DIRECTORY;
  }

  public searchScholars(query: string): ScholarDirectoryUser[] {
    const q = query.toLowerCase().trim().replace(/^@/, '');
    if (!q) return CAMPUS_DIRECTORY;
    return CAMPUS_DIRECTORY.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.handle.toLowerCase().includes(q) ||
      (s.college && s.college.toLowerCase().includes(q)) ||
      (s.course && s.course.toLowerCase().includes(q))
    );
  }

  public getScholarByHandle(handle: string): ScholarDirectoryUser | null {
    const clean = handle.toLowerCase().trim();
    const formatted = clean.startsWith('@') ? clean : `@${clean}`;
    return CAMPUS_DIRECTORY.find((s) => s.handle.toLowerCase() === formatted) || null;
  }

  public getScholarById(id: string): ScholarDirectoryUser | null {
    return CAMPUS_DIRECTORY.find((s) => s.id === id) || null;
  }

  public getOrCreateConversationWithScholar(userId: string, scholar: ScholarDirectoryUser): string {
    return this.getOrCreateConversation(userId, {
      id: scholar.id,
      name: scholar.name,
      handle: scholar.handle,
      email: scholar.email,
      college: scholar.college,
      course: scholar.course,
      avatarUrl: scholar.avatarUrl,
      online: scholar.online,
      level: scholar.level
    });
  }

  // =========================================================================
  // 5. SNAPCHAT-STYLE FRIEND SUGGESTIONS & MATCHMAKER
  // =========================================================================

  public getFriendSuggestions(userProfile: StudentProfile, gaps: LearningGap[]): FriendSuggestion[] {
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
        handle: peer.handle || `@${peer.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
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
