import type { Test, TutorMessage } from '../types';
import { storageService } from './storageService';

export interface TutorResponse {
  message: string;
  conceptCheck?: {
    question: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
  };
  masteryDelta?: number; // e.g. +5% or +10%
}

class AIService {
  /**
   * Speak text using Web Speech API if enabled
   */
  public speak(text: string): void {
    const settings = storageService.getAISettings();
    if (!settings.speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      // Clean markdown stars and backticks for smoother speech
      const cleanText = text.replace(/[*_`#]/g, '').slice(0, 280);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  /**
   * Generates a Socratic tutoring turn for a given subject and topic.
   */
  public async getTutorResponse(
    topic: string,
    history: TutorMessage[],
    userMessage: string
  ): Promise<TutorResponse> {
    const settings = storageService.getAISettings();

    // Try OpenRouter if API key is provided
    if (settings.provider === 'openrouter' && settings.openRouterApiKey) {
      try {
        const systemPrompt = `You are Mind Bridge AI, a personalized Socratic academic tutor.
Your mission is to teach "${topic}" concisely, clearly, and interactively.
Guidelines:
1. Keep explanations under 3-4 sentences.
2. After explaining a core intuition, ALWAYS ask ONE targeted conceptual check question to test if the student truly understands.
3. If evaluating a student's answer, provide clear feedback (validate what is right, gently clarify misconceptions).
4. Tone: Encouraging, razor-sharp, educational, respectful.
Format your output as JSON:
{
  "message": "Your conversational explanation or feedback",
  "conceptCheck": {
    "question": "The question for the student",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option B",
    "explanation": "Why Option B is correct"
  },
  "masteryDelta": 5
}`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.map((m) => ({
            role: m.sender === 'ai' ? 'assistant' : 'user',
            content: m.text
          })),
          { role: 'user', content: userMessage }
        ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.openRouterApiKey}`,
            'HTTP-Referer': 'https://mindbridge.ai',
            'X-Title': 'Mind Bridge AI'
          },
          body: JSON.stringify({
            model: settings.model || 'google/gemini-2.0-flash-001',
            messages,
            response_format: { type: 'json_object' }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            if (parsed.message) {
              this.speak(parsed.message);
              return parsed;
            }
          }
        }
      } catch (err) {
        console.warn('OpenRouter API call failed or timed out, using intelligent local engine:', err);
      }
    }

    // High-fidelity Local Socratic Reasoning Engine
    return this.getLocalTutorResponse(topic, userMessage, history.length);
  }

  private getLocalTutorResponse(topic: string, userMessage: string, turnCount: number): TutorResponse {
    const lowerTopic = topic.toLowerCase();
    const lowerUser = userMessage.toLowerCase();

    // 1. DBMS: B-Trees & Indexing
    if (lowerTopic.includes('b-tree') || lowerTopic.includes('indexing') || lowerTopic.includes('dbms')) {
      if (turnCount <= 1) {
        const msg = `Welcome! Let's conquer **B-Trees & B+ Trees**. In databases, disks read data in fixed-size blocks (pages). If we used binary search on disk, we would do $O(\\log_2 N)$ disk seeks—which is way too slow! 
        
A **B-Tree** solves this by having high fan-out: each node holds multiple keys and points to multiple children, reducing tree height to typically 3 or 4.`;
        this.speak(msg);
        return {
          message: msg,
          conceptCheck: {
            question: "Why do relational database storage engines prefer a B-Tree with order 100+ over a standard balanced binary search tree (like AVL or Red-Black)?",
            options: [
              "Binary trees use more RAM memory than B-Trees.",
              "High fanout drastically minimizes the number of expensive disk block I/O operations.",
              "B-Trees guarantee that no data sorting is ever needed.",
              "Binary search trees cannot store integer keys."
            ],
            correctAnswer: "High fanout drastically minimizes the number of expensive disk block I/O operations.",
            explanation: "Each disk read takes milliseconds. A fanout of 100 allows indexing 1,000,000 records with only 3 disk seeks!"
          },
          masteryDelta: 5
        };
      }

      if (lowerUser.includes('split') || lowerUser.includes('median') || lowerUser.includes('fanout') || lowerUser.includes('disk') || lowerUser.includes('b') || lowerUser.includes('io')) {
        const msg = `Spot on! You understand the fundamental disk latency motivation. 
        
Now let's examine the **Node Splitting rule**: When a node reaches its capacity (order $m$) and a new key arrives, the node splits around the **median key**. The median key is promoted to the parent node, and two half-sized child nodes are formed.`;
        this.speak(msg);
        return {
          message: msg,
          conceptCheck: {
            question: "In a B+ Tree, what happens to the keys during a node split compared to a standard B-Tree?",
            options: [
              "In a B+ Tree, the promoted key is also retained in the leaf level because leaves contain all records.",
              "In a B+ Tree, the promoted key is discarded forever.",
              "In a B+ Tree, splits happen only when the root is empty.",
              "There is no difference in splitting mechanisms."
            ],
            correctAnswer: "In a B+ Tree, the promoted key is also retained in the leaf level because leaves contain all records.",
            explanation: "In B+ Trees, internal nodes only act as an index router. All data keys stay in the sequentially linked leaf nodes!"
          },
          masteryDelta: 10
        };
      }

      const msg = `Great effort. The key point to remember is that B-Trees are designed around disk block boundaries. Even with a million records, a B-Tree has a height of only 3 to 4 levels! Let's test your understanding of leaf node structure.`;
      this.speak(msg);
      return {
        message: msg,
        conceptCheck: {
          question: "How do leaf nodes in a B+ Tree enable ultra-fast range queries (e.g. `BETWEEN 100 AND 500`)?",
          options: [
            "Leaves are connected via a doubly linked list, so we traverse sideways without climbing back up the tree.",
            "Leaves use hash tables for range calculations.",
            "Range queries run on a secondary CPU thread.",
            "The database copies all leaf data to RAM first."
          ],
          correctAnswer: "Leaves are connected via a doubly linked list, so we traverse sideways without climbing back up the tree.",
          explanation: "Once the lower bound (100) is located by traversing down from the root, subsequent records are fetched in order using leaf pointers!"
        },
        masteryDelta: 8
      };
    }

    // 2. DSA: Dynamic Programming
    if (lowerTopic.includes('dynamic') || lowerTopic.includes('knapsack') || lowerTopic.includes('recurrence')) {
      const msg = `Let's break down **Dynamic Programming (DP)**! DP is all about two properties: **Overlapping Subproblems** and **Optimal Substructure**. Instead of re-solving identical subproblems exponentially, we store intermediate results in a table (memoization or tabulation).`;
      this.speak(msg);
      return {
        message: msg,
        conceptCheck: {
          question: "In the 0/1 Knapsack problem, why does the state require two parameters `dp[i][w]` rather than just `dp[w]`?",
          options: [
            "Because each item can only be selected once, so we need index `i` to track which items have been considered.",
            "Because weight capacity must always be squared.",
            "Because values are non-deterministic.",
            "Because 0/1 Knapsack is an NP-hard problem that cannot run in 1D."
          ],
          correctAnswer: "Because each item can only be selected once, so we need index `i` to track which items have been considered.",
          explanation: "Index `i` prevents reusing the same item multiple times. (In Unbounded Knapsack, 1D suffices!)"
        },
        masteryDelta: 8
      };
    }

    // 3. Operating Systems: Virtual Memory
    if (lowerTopic.includes('virtual') || lowerTopic.includes('paging') || lowerTopic.includes('page') || lowerTopic.includes('memory')) {
      const msg = `Virtual Memory gives each program the illusion of having a contiguous block of dedicated RAM. The hardware **MMU (Memory Management Unit)** translates virtual addresses to physical frame addresses via Page Tables with the help of a **TLB (Translation Lookaside Buffer)**.`;
      this.speak(msg);
      return {
        message: msg,
        conceptCheck: {
          question: "What is Belady's Anomaly in page replacement algorithms?",
          options: [
            "Increasing the number of page frames causes MORE page faults under FIFO.",
            "Allocating more memory crashes the operating system kernel.",
            "LRU replacement produces invalid physical addresses.",
            "Virtual addresses exceed 64-bit limits."
          ],
          correctAnswer: "Increasing the number of page frames causes MORE page faults under FIFO.",
          explanation: "Belady's Anomaly shows that FIFO is not a stack algorithm; allocating more physical memory can counter-intuitively increase page faults!"
        },
        masteryDelta: 8
      };
    }

    // Default General Tutor
    const msg = `Let's explore **${topic}**. What part of this topic feels most challenging to you right now? Is it the core definitions, the mathematical recurrence, or how it is implemented?`;
    this.speak(msg);
    return {
      message: msg,
      conceptCheck: {
        question: `When analyzing ${topic}, what is the primary objective or invariant you must preserve?`,
        options: [
          "Preserve correctness while minimizing time and space complexity.",
          "Execute exclusively in kernel mode.",
          "Avoid using cache memory.",
          "Hardcode all constants."
        ],
        correctAnswer: "Preserve correctness while minimizing time and space complexity.",
        explanation: "Academic mastery focuses on maintaining system correctness and optimizing algorithmic resource constraints."
      },
      masteryDelta: 5
    };
  }

  /**
   * Generates dynamic diagnostic tests targeted at a student's learning gap.
   */
  public generateTestForGap(topic: string, gapId?: string): Test {
    return {
      id: `test_${Date.now()}`,
      title: `Personalized Diagnostic: ${topic}`,
      subject: topic.includes('B-Tree') ? 'Database Management Systems' : topic.includes('Dynamic') ? 'Data Structures & Algorithms' : 'Operating Systems',
      topic,
      difficulty: 'medium',
      timeLimitMinutes: 10,
      targetedGapId: gapId,
      questions: [
        {
          id: `q_${Date.now()}_1`,
          questionText: `Which fundamental principle governs optimal performance in "${topic}"?`,
          options: [
            "Minimizing redundant computation / I/O latency through structured indexing or memoization.",
            "Executing purely on single-threaded architectures.",
            "Disabling compiler optimization flags.",
            "Bypassing cache structures entirely."
          ],
          correctIndex: 0,
          explanation: `In ${topic}, the goal is eliminating redundant execution paths or disk accesses.`,
          conceptTested: "Foundational Principle",
          difficulty: "medium"
        },
        {
          id: `q_${Date.now()}_2`,
          questionText: `Consider an edge case in ${topic} where resources or capacity constraints reach their upper threshold. What is the standard recovery mechanism?`,
          options: [
            "Dynamic rebalancing / node splitting / reallocation to maintain invariant bounds.",
            "Immediate fatal crash of the application.",
            "Random truncation of data packets.",
            "Ignoring bounds until stack overflow occurs."
          ],
          correctIndex: 0,
          explanation: "Robust systems systematically rebalance or split state nodes to preserve logarithmic bounds.",
          conceptTested: "Edge Case & Invariant Handling",
          difficulty: "hard"
        },
        {
          id: `q_${Date.now()}_3`,
          questionText: `What is the theoretical asymptotic time complexity commonly associated with search/access in this domain?`,
          options: [
            "O(log N) or O(height)",
            "O(N!) factorial",
            "O(2^N) exponential",
            "O(N^3) cubic"
          ],
          correctIndex: 0,
          explanation: "Efficient indexing and dynamic state algorithms reduce search and traversal to logarithmic bounds.",
          conceptTested: "Asymptotic Complexity",
          difficulty: "medium"
        }
      ]
    };
  }
}

export const aiService = new AIService();
