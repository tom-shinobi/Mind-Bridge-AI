import type {
  StudentProfile,
  AcademicRecord,
  LearningGap,
  SyllabusTopic,
  TimetableBlock,
  Test,
  Achievement,
  AdaptiveAuditEntry,
  AISettings
} from '../types';

export const initialStudentProfile: StudentProfile = {
  id: 'std_sanjay_2026',
  name: 'J Sanjay Aron',
  email: 'sanjay.aron@spacecoders.edu',
  degree: 'B.Tech Computer Science & Engineering',
  department: 'School of Computing Sciences',
  semester: 6,
  cgpa: 8.42,
  targetCgpa: 9.00,
  streakDays: 7,
  totalXp: 3450,
  level: 4,
  joinedDate: 'August 2023',
};

export const initialAcademicRecords: AcademicRecord[] = [
  {
    id: 'rec_dbms_mid',
    subjectCode: 'CS301',
    subjectName: 'Database Management Systems',
    semester: 6,
    examType: 'Midterm',
    score: 31,
    totalMarks: 50,
    percentage: 62,
    grade: 'B',
    date: '2026-02-20',
    topicsEvaluated: ['Relational Algebra', 'SQL Queries', 'B-Trees & Indexing', 'Transactions']
  },
  {
    id: 'rec_dsa_quiz',
    subjectCode: 'CS302',
    subjectName: 'Data Structures & Algorithms',
    semester: 6,
    examType: 'Quiz',
    score: 11,
    totalMarks: 20,
    percentage: 55,
    grade: 'C+',
    date: '2026-02-14',
    topicsEvaluated: ['Dynamic Programming', 'Greedy Methods', 'Divide and Conquer']
  },
  {
    id: 'rec_os_mid',
    subjectCode: 'CS303',
    subjectName: 'Operating Systems',
    semester: 6,
    examType: 'Midterm',
    score: 34,
    totalMarks: 50,
    percentage: 68,
    grade: 'B+',
    date: '2026-02-18',
    topicsEvaluated: ['Process Scheduling', 'Deadlocks', 'Virtual Memory & Paging']
  },
  {
    id: 'rec_cn_lab',
    subjectCode: 'CS304',
    subjectName: 'Computer Networks',
    semester: 6,
    examType: 'Lab Test',
    score: 44,
    totalMarks: 50,
    percentage: 88,
    grade: 'A',
    date: '2026-02-10',
    topicsEvaluated: ['Socket Programming', 'TCP 3-Way Handshake', 'Subnetting']
  },
  {
    id: 'rec_ml_assign',
    subjectCode: 'CS305',
    subjectName: 'Machine Learning & Deep Learning',
    semester: 6,
    examType: 'Assignment',
    score: 46,
    totalMarks: 50,
    percentage: 92,
    grade: 'A+',
    date: '2026-02-05',
    topicsEvaluated: ['Linear Regression', 'Backpropagation', 'Loss Functions']
  },
  {
    id: 'rec_dsa_sem5',
    subjectCode: 'CS201',
    subjectName: 'Advanced Data Structures',
    semester: 5,
    examType: 'End Semester',
    score: 87,
    totalMarks: 100,
    percentage: 87,
    grade: 'A',
    date: '2025-12-15',
    topicsEvaluated: ['Graph Algorithms', 'Trees', 'Hashing', 'Sorting']
  }
];

export const initialLearningGaps: LearningGap[] = [
  {
    id: 'gap-dbms-btree',
    subject: 'Database Management Systems',
    topic: 'B-Trees & B+ Tree Indexing',
    module: 'Module 3: Storage & Indexing Architecture',
    severity: 'critical',
    masteryScore: 38,
    identifiedFrom: 'Midterm Exam Question 4 & 5 (Scored 3/15)',
    rootCause: 'Confusion on balanced node splitting mechanisms, leaf node pointer linkage, and disk block I/O calculation.',
    recommendedHours: 4.5,
    status: 'active',
    lastEvaluated: '2026-02-21'
  },
  {
    id: 'gap-dsa-dp',
    subject: 'Data Structures & Algorithms',
    topic: 'Dynamic Programming: State Transitions',
    module: 'Module 4: Advanced Algorithm Design',
    severity: 'high',
    masteryScore: 45,
    identifiedFrom: 'DSA Quiz 3 Question 2 (Formulating Recurrence Relations)',
    rootCause: 'Difficulty defining optimal substructure for 2D table states (e.g. 0/1 Knapsack & Matrix Chain Multiplication).',
    recommendedHours: 4.0,
    status: 'active',
    lastEvaluated: '2026-02-15'
  },
  {
    id: 'gap-os-vmem',
    subject: 'Operating Systems',
    topic: 'Virtual Memory & Page Replacement',
    module: 'Module 4: Memory Management Systems',
    severity: 'medium',
    masteryScore: 56,
    identifiedFrom: 'OS Midterm Question 3B',
    rootCause: 'Calculating page faults under Belady\'s Anomaly (FIFO) and implementing Clock/Second-Chance replacement algorithm.',
    recommendedHours: 3.0,
    status: 'active',
    lastEvaluated: '2026-02-19'
  }
];

export const initialSyllabusTopics: SyllabusTopic[] = [
  {
    id: 'syl_1',
    subject: 'Database Management Systems',
    moduleName: 'Storage & Indexing',
    topic: 'B-Trees & B+ Tree Indexing',
    priority: 'high',
    status: 'in_progress',
    estimatedHours: 5,
    completedHours: 1.5,
    masteryPercentage: 38,
    isGapRemediation: true,
    orderIndex: 1
  },
  {
    id: 'syl_2',
    subject: 'Data Structures & Algorithms',
    moduleName: 'Advanced Algorithm Design',
    topic: 'Dynamic Programming: State Transitions',
    priority: 'high',
    status: 'pending',
    estimatedHours: 4,
    completedHours: 0.5,
    masteryPercentage: 45,
    isGapRemediation: true,
    orderIndex: 2
  },
  {
    id: 'syl_3',
    subject: 'Operating Systems',
    moduleName: 'Memory Management',
    topic: 'Virtual Memory & Page Replacement',
    priority: 'medium',
    status: 'pending',
    estimatedHours: 3,
    completedHours: 1.0,
    masteryPercentage: 56,
    isGapRemediation: true,
    orderIndex: 3
  },
  {
    id: 'syl_4',
    subject: 'Database Management Systems',
    moduleName: 'Query Optimization',
    topic: 'Query Execution Plans & Cost Estimation',
    priority: 'medium',
    status: 'pending',
    estimatedHours: 3,
    completedHours: 0,
    masteryPercentage: 65,
    isGapRemediation: false,
    orderIndex: 4
  },
  {
    id: 'syl_5',
    subject: 'Computer Networks',
    moduleName: 'Transport Layer',
    topic: 'TCP Congestion Control & Flow Control',
    priority: 'low',
    status: 'mastered',
    estimatedHours: 2,
    completedHours: 2.0,
    masteryPercentage: 88,
    isGapRemediation: false,
    orderIndex: 5
  },
  {
    id: 'syl_6',
    subject: 'Database Management Systems',
    moduleName: 'Relational Design',
    topic: 'Functional Dependencies & Normalization (BCNF)',
    priority: 'low',
    status: 'mastered',
    estimatedHours: 2,
    completedHours: 2.0,
    masteryPercentage: 94,
    isGapRemediation: false,
    orderIndex: 6
  },
  {
    id: 'syl_7',
    subject: 'Machine Learning',
    moduleName: 'Neural Networks',
    topic: 'Backpropagation & Gradient Optimization',
    priority: 'low',
    status: 'mastered',
    estimatedHours: 3,
    completedHours: 3.0,
    masteryPercentage: 95,
    isGapRemediation: false,
    orderIndex: 7
  }
];

export const initialTimetableBlocks: TimetableBlock[] = [
  {
    id: 'tb_1',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    subject: 'Database Management Systems',
    topic: 'B-Trees: Node Splitting & Insertion Mechanics',
    blockType: 'deep_work',
    isAdaptive: true,
    adaptiveReason: 'Priority remediation for critical DBMS gap identified in Midterm.',
    completed: true,
    dateString: '2026-09-10'
  },
  {
    id: 'tb_2',
    dayOfWeek: 'Monday',
    startTime: '11:00',
    endTime: '12:00',
    subject: 'Database Management Systems',
    topic: 'Interactive AI Tutor: Socratic B-Tree Walkthrough',
    blockType: 'tutor',
    isAdaptive: true,
    adaptiveReason: 'Concept verification session to solidify node splitting rules.',
    completed: false,
    dateString: '2026-09-10'
  },
  {
    id: 'tb_3',
    dayOfWeek: 'Monday',
    startTime: '14:00',
    endTime: '15:00',
    subject: 'Data Structures & Algorithms',
    topic: 'Dynamic Programming: 0/1 Knapsack State Formulation',
    blockType: 'deep_work',
    isAdaptive: true,
    adaptiveReason: 'Scheduled based on DSA Quiz 3 performance gap.',
    completed: false,
    dateString: '2026-09-10'
  },
  {
    id: 'tb_4',
    dayOfWeek: 'Monday',
    startTime: '16:00',
    endTime: '16:45',
    subject: 'Database Management Systems',
    topic: 'Personalized Diagnostic Quiz: B-Trees & Indexing',
    blockType: 'test',
    isAdaptive: true,
    adaptiveReason: 'Formative assessment to trigger syllabus adaptation upon mastery.',
    completed: false,
    dateString: '2026-09-10'
  },
  {
    id: 'tb_5',
    dayOfWeek: 'Tuesday',
    startTime: '09:30',
    endTime: '11:00',
    subject: 'Data Structures & Algorithms',
    topic: 'Matrix Chain Multiplication & Memoization',
    blockType: 'deep_work',
    isAdaptive: true,
    adaptiveReason: 'Deep dive into 2D dynamic programming tables.',
    completed: false,
    dateString: '2026-09-11'
  },
  {
    id: 'tb_6',
    dayOfWeek: 'Tuesday',
    startTime: '14:00',
    endTime: '15:15',
    subject: 'Operating Systems',
    topic: 'Page Replacement Algorithms (FIFO vs LRU vs Clock)',
    blockType: 'deep_work',
    isAdaptive: true,
    adaptiveReason: 'Medium gap remediation from OS Midterm.',
    completed: false,
    dateString: '2026-09-11'
  },
  {
    id: 'tb_7',
    dayOfWeek: 'Wednesday',
    startTime: '10:00',
    endTime: '11:30',
    subject: 'Computer Networks',
    topic: 'TCP Sliding Window & Retransmission Timers',
    blockType: 'revision',
    isAdaptive: false,
    completed: false,
    dateString: '2026-09-12'
  },
  {
    id: 'tb_8',
    dayOfWeek: 'Thursday',
    startTime: '09:00',
    endTime: '10:30',
    subject: 'Database Management Systems',
    topic: 'B+ Tree Range Queries & Secondary Clustering',
    blockType: 'deep_work',
    isAdaptive: true,
    adaptiveReason: 'Advanced index mechanics following node splitting mastery.',
    completed: false,
    dateString: '2026-09-13'
  }
];

export const initialTests: Test[] = [
  {
    id: 'test-dbms-btree',
    title: 'Adaptive Diagnostic: B-Trees & B+ Tree Indexing',
    subject: 'Database Management Systems',
    topic: 'B-Trees & B+ Tree Indexing',
    difficulty: 'medium',
    timeLimitMinutes: 12,
    targetedGapId: 'gap-dbms-btree',
    questions: [
      {
        id: 'q1',
        questionText: 'In a B-Tree of order m (maximum children = m), what is the MINIMUM number of keys a non-root internal node must contain?',
        options: [
          'ceil(m / 2) - 1',
          'm / 2',
          'ceil(m / 2)',
          'm - 1'
        ],
        correctIndex: 0,
        explanation: 'Every non-root node in a B-Tree of order m must have at least ceil(m/2) children, which corresponds to ceil(m/2) - 1 keys.',
        conceptTested: 'B-Tree Node Invariants',
        difficulty: 'medium'
      },
      {
        id: 'q2',
        questionText: 'What is the primary architectural advantage of a B+ Tree over a standard B-Tree for relational database storage engines?',
        options: [
          'B+ Trees store duplicate keys in all levels to prevent disk failures.',
          'All record data pointers reside strictly in the leaf nodes, which are sequentially linked for lightning-fast range scans.',
          'B+ Trees have smaller tree height because they don\'t use balance factors.',
          'B+ Trees do not require binary search inside disk blocks.'
        ],
        correctIndex: 1,
        explanation: 'In a B+ Tree, internal nodes only hold search keys for routing; actual data pointers or tuples are at the leaves. Because leaves are linked as a doubly-linked list, sequential range queries (e.g. WHERE salary BETWEEN 50000 AND 80000) require no tree traversal after locating the lower bound!',
        conceptTested: 'B+ Tree Leaf Node Linkage & Range Scans',
        difficulty: 'medium'
      },
      {
        id: 'q3',
        questionText: 'Given a B-Tree of order 3 (Max 2 keys per node). Currently a leaf node contains keys [20, 30]. If key 25 is inserted into this node, what operation occurs?',
        codeSnippet: `Current Leaf: [20, 30]
Insert: 25 -> Overflow [20, 25, 30]`,
        options: [
          'Key 30 is deleted to maintain capacity.',
          'The node overflows: median key 25 is pushed up to the parent, and [20] and [30] become two new leaf children.',
          'Key 25 is stored in an overflow hash bucket.',
          'A rotational balance shift pushes 20 to the left sibling.'
        ],
        correctIndex: 1,
        explanation: 'When node capacity is exceeded, the node splits around the median key (25 here). 25 is promoted to the parent node, and the remaining left and right halves form two separate valid nodes.',
        conceptTested: 'Node Splitting & Promotion Mechanics',
        difficulty: 'hard'
      },
      {
        id: 'q4',
        questionText: 'If a database table has 10,000,000 rows and a B+ Tree index with a fanout of 100 is used, approximately how many disk block reads are needed to find a single record?',
        options: [
          'At most 4 disk I/O reads (height of tree is ~log_100(10^7) = 3.5)',
          'Approximately 10,000 disk I/O reads',
          'At least 100 disk I/O reads',
          'Exactly 1 disk I/O read always'
        ],
        correctIndex: 0,
        explanation: 'Tree height = log_fanout(N) = log_100(10,000,000) ≈ 3.5. Thus, at most 4 disk block accesses are needed to reach the leaf node even in a massive table!',
        conceptTested: 'Disk I/O Complexity & Fanout',
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'test-dsa-dp',
    title: 'Adaptive Diagnostic: Dynamic Programming State Transitions',
    subject: 'Data Structures & Algorithms',
    topic: 'Dynamic Programming: State Transitions',
    difficulty: 'medium',
    timeLimitMinutes: 10,
    targetedGapId: 'gap-dsa-dp',
    questions: [
      {
        id: 'dp_q1',
        questionText: 'In the 0/1 Knapsack Problem with weights W[] and values V[], what is the correct state transition relation for dp[i][w] (considering items up to i with maximum weight capacity w)?',
        options: [
          'dp[i][w] = max(dp[i-1][w], dp[i-1][w - W[i]] + V[i]) if w >= W[i]',
          'dp[i][w] = dp[i-1][w] + dp[i-1][w - W[i]]',
          'dp[i][w] = max(dp[i][w], dp[i][w - W[i]] + V[i])',
          'dp[i][w] = min(dp[i-1][w], V[i])'
        ],
        correctIndex: 0,
        explanation: 'At each item i, we choose either not to include it (dp[i-1][w]) or include it (dp[i-1][w - W[i]] + V[i]) provided remaining capacity w >= W[i].',
        conceptTested: '0/1 Knapsack Recurrence Relation',
        difficulty: 'medium'
      },
      {
        id: 'dp_q2',
        questionText: 'Why can the space complexity of the 0/1 Knapsack DP table be reduced from O(N * W) to O(W)?',
        options: [
          'Because computing row i only depends on values from row i-1, which can be updated backwards in a 1D array.',
          'Because the problem exhibits divide and conquer rather than dynamic programming.',
          'Because items are sorted in ascending order of value.',
          'Because the recurrence only checks W/2 elements.'
        ],
        correctIndex: 0,
        explanation: 'Since each entry in row i depends strictly on the previous row i-1, iterating backwards from W down to W[i] in a single 1D array prevents overwriting values needed for subsequent computations in that same step.',
        conceptTested: '1D State Space Optimization',
        difficulty: 'hard'
      }
    ]
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: 'ach_first_gap',
    title: 'Gap Buster: Novice',
    description: 'Resolve your first critical learning gap with an adaptive test score > 75%',
    iconName: 'ShieldCheck',
    category: 'gap_buster',
    xpReward: 300,
    progress: 0,
    target: 1
  },
  {
    id: 'ach_streak_7',
    title: 'Study Engine: 7-Day Streak',
    description: 'Maintain uninterrupted daily learning for 7 consecutive days',
    iconName: 'Flame',
    category: 'streak',
    unlockedAt: '2026-09-09',
    xpReward: 250,
    progress: 7,
    target: 7
  },
  {
    id: 'ach_tutor_dialogue',
    title: 'Socratic Thinker',
    description: 'Engage in back-and-forth AI tutoring sessions and answer 3 conceptual checks correctly',
    iconName: 'MessageSquareCheck',
    category: 'mastery',
    xpReward: 200,
    progress: 1,
    target: 3
  },
  {
    id: 'ach_stress_balance',
    title: 'Mindful Scholar',
    description: 'Use the daily workload check to protect study balance and prevent burnout',
    iconName: 'Compass',
    category: 'workload',
    unlockedAt: '2026-09-08',
    xpReward: 150,
    progress: 1,
    target: 1
  },
  {
    id: 'ach_level_5',
    title: 'Academic Prodigy',
    description: 'Accumulate 5,000 Academic XP across verified topics and quizzes',
    iconName: 'Award',
    category: 'mastery',
    xpReward: 500,
    progress: 3450,
    target: 5000
  }
];

export const initialAuditLog: AdaptiveAuditEntry[] = [
  {
    id: 'aud_1',
    timestamp: '2026-09-09 08:30',
    triggerEvent: 'Academic History Ingestion (DBMS Midterm 62%)',
    actionTaken: 'Auto-detected critical weakness in B-Trees & Indexing (Score 3/15)',
    category: 'gap_detected',
    impactDescription: 'Inserted B-Trees to position #1 in Personalized Syllabus. Allocated 4.5 dedicated study hours.'
  },
  {
    id: 'aud_2',
    timestamp: '2026-09-09 08:31',
    triggerEvent: 'Timetable Optimization Engine',
    actionTaken: 'Shifted 90 minutes from mastered topics (Normalization) to B-Trees node mechanics',
    category: 'timetable',
    impactDescription: 'Optimized Monday 09:00 study block for deep work.'
  },
  {
    id: 'aud_3',
    timestamp: '2026-09-08 19:45',
    triggerEvent: 'Daily Workload Check: Student reported Heavy academic load',
    actionTaken: 'Reduced Tuesday evening load by 60 mins and reallocated to Saturday morning',
    category: 'workload_relief',
    impactDescription: 'Protected student focus and mitigated fatigue while preserving weekly curriculum goals.'
  }
];

export const initialAISettings: AISettings = {
  provider: 'openrouter',
  openRouterApiKey: (import.meta as unknown as { env?: { VITE_OPENROUTER_API_KEY?: string } }).env?.VITE_OPENROUTER_API_KEY || '',
  model: 'liquid/lfm-2.5-2.6b:free',
  speechEnabled: true,
  soundFxEnabled: true
};

