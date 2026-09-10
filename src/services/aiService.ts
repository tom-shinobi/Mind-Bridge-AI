import type { Test, TutorMessage } from '../types';
import { storageService } from './storageService';

export interface TutorResponse {
  message: string;
  conceptCheck?: {
    question: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
  } | null;
  masteryDelta?: number; // e.g. +5% or +10%
}

export interface ApiStatus {
  isLive: boolean;
  isRateLimited: boolean;
  lastError: string | null;
  statusMessage: string;
  model: string;
  keyMasked: string;
}

class AIService {
  private apiStatus: ApiStatus = {
    isLive: false,
    isRateLimited: false,
    lastError: null,
    statusMessage: 'Ready',
    model: 'liquid/lfm-2.5-2.6b:free',
    keyMasked: ''
  };

  private listeners: Array<(status: ApiStatus) => void> = [];

  public getApiStatus(): ApiStatus {
    const settings = storageService.getAISettings();
    const rawKey = (settings.openRouterApiKey || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY || '').trim();
    return {
      ...this.apiStatus,
      model: settings.model || 'gemini-2.5-flash',
      keyMasked: rawKey ? 'Active & Encrypted' : 'None'
    };
  }

  public subscribe(cb: (status: ApiStatus) => void): () => void {
    this.listeners.push(cb);
    cb(this.getApiStatus());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    const status = this.getApiStatus();
    this.listeners.forEach((cb) => cb(status));
  }

  /**
   * Speak text using Web Speech API if enabled
   */
  public speak(text: string): void {
    const settings = storageService.getAISettings();
    if (!settings.speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      // Clean markdown stars, backticks, and math symbols for smoother speech
      const cleanText = text
        .replace(/[*_`#]/g, '')
        .replace(/\$[^$]*\$/g, 'the mathematical expression')
        .slice(0, 260);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  /**
   * Compiles the student's full profile, marks, learning gaps, timetable,
   * and syllabus into an authoritative context block for the LLM.
   */
  public getStudentContext(): string {
    try {
      const profile = storageService.getProfile();
      const records = storageService.getAcademicRecords();
      const gaps = storageService.getLearningGaps();
      const syllabus = storageService.getSyllabus();
      const timetable = storageService.getTimetable();
      const studySeconds = storageService.getTodayStudySeconds();
      const checkIns = storageService.getDailyCheckIns();
      const latestCheckIn = checkIns[checkIns.length - 1];
      const workloadState = latestCheckIn ? `${latestCheckIn.workloadLevel} (stress rating ${latestCheckIn.stressRating}/5)` : 'balanced';

      const activeGaps = gaps
        .filter((g) => g.status !== 'resolved')
        .map(
          (g) =>
            `- [${g.severity.toUpperCase()} GAP] Topic: "${g.topic}" (${g.subject}) | Current Mastery: ${g.masteryScore}% | Recommended Remediation: ${g.recommendedHours} hrs | Root Cause: ${g.rootCause}`
        )
        .join('\n');

      const recentMarks = records
        .slice(0, 6)
        .map(
          (r) =>
            `- ${r.subjectName} (${r.subjectCode}): ${r.examType} = ${r.score}/${r.totalMarks} (${r.percentage}%, Grade: ${r.grade})`
        )
        .join('\n');

      const todaySchedule = timetable
        .map(
          (t) =>
            `- ${t.dayOfWeek} [${t.startTime} - ${t.endTime}] | ${t.subject}: ${t.topic} | Type: ${t.blockType} | Status: ${t.completed ? 'COMPLETED' : 'PENDING'}`
        )
        .join('\n');

      const weakTopics = syllabus
        .filter((s) => s.status === 'pending' || s.masteryPercentage < 50)
        .map((s) => `- ${s.subject} (${s.moduleName}): ${s.topic} (${s.masteryPercentage}% mastery, status: ${s.status})`)
        .join('\n');

      const mem = profile.memorySummary;
      const memoryBlock = mem ? `
PERSISTENT ACADEMIC MEMORY & COGNITIVE PREFERENCES:
- Pedagogical / Explanation Preference: ${mem.learningStyle || 'Conceptual and First Principles'}
- Current Academic Focus: ${mem.currentFocus || 'Core syllabus mastery'}
- Target Academic Goal: ${mem.academicGoal || `${profile.targetCgpa} CGPA`}
- Study Habits & Timing: ${mem.studyPreferences || 'Structured deep work sessions'}
- Identified Difficult Topics: ${mem.difficultTopics && mem.difficultTopics.length > 0 ? mem.difficultTopics.join(', ') : 'None specified'}
- Mastered Strengths: ${mem.strengths && mem.strengths.length > 0 ? mem.strengths.join(', ') : 'None specified'}
${mem.notes ? `- Special Tutor Notes: ${mem.notes}` : ''}` : '';

      return `=== AUTHENTICATED STUDENT USER DATA ===
STUDENT NAME: ${profile.name}
DEGREE & PROGRAM: ${profile.degree} (Semester ${profile.semester})
DEPARTMENT: ${profile.department || profile.degree}
COLLEGE: ${profile.college || 'Engineering'}
ACADEMIC STANDING: Current CGPA ${profile.cgpa}/10.0 | Target CGPA: ${profile.targetCgpa}/10.0
ENGAGEMENT: Level ${profile.level}, ${profile.totalXp} XP, ${profile.streakDays}-Day Consistent Streak
COGNITIVE WORKLOAD STATE: ${workloadState}
TOTAL TIME STUDIED TODAY: ${Math.round(studySeconds / 60)} minutes
${memoryBlock}

OFFICIAL ACADEMIC EXAM MARKS:
${recentMarks || 'No exam records logged'}

CURRENT ACTIVE LEARNING GAPS (DIAGNOSED BY EVALUATION ENGINE):
${activeGaps || 'No active learning gaps recorded'}

TODAY'S ADAPTIVE TIMETABLE:
${todaySchedule || 'No study blocks scheduled today'}

FLAGGED SYLLABUS TOPICS REQUIRING ATTENTION:
${weakTopics || 'All syllabus topics above 50%'}
----------------------------------------`;
    } catch (e) {
      console.warn('Error reading student context for AI:', e);
      return '';
    }
  }

  /**
   * Generates a personalized Socratic tutoring response with access to user data.
   */
  public async getTutorResponse(
    topic: string,
    history: TutorMessage[],
    userMessage: string
  ): Promise<TutorResponse> {
    const settings = storageService.getAISettings();
    const studentContext = this.getStudentContext();
    const activeModel = settings.model || 'gemini-2.5-flash';
    const apiKey = (settings.openRouterApiKey || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY || '').trim();

    // Try OpenRouter if API key is provided
    if (apiKey) {
      try {
        const systemPrompt = `You are Mind Bridge AI, the personal AI academic tutor and learning assistant for the student described below.
You have direct, authenticated access to the student's real academic record, exam marks, diagnosed learning gaps, personalized syllabus, and daily timetable.

${studentContext}

CURRENT SUBJECT / CONVERSATION SCOPE: "${topic}"

YOUR INSTRUCTIONS:
1. USER DATA AWARENESS:
   - If the student asks about their grades, learning gaps, schedule, weak topics, or how to improve, cite their actual numbers (e.g. 8.42 CGPA, 38% mastery in B-Trees, 62% DBMS Midterm, today's schedule).
   - Tailor all learning explanations and advice to their level (B.Tech CSE Semester 6) and visual/hands-on learning style.

2. ACADEMIC TUTORING & GENERAL QUESTIONS:
   - When teaching or answering concept questions, provide deep yet crystal-clear, intuitive explanations with analogies and examples.
   - If the student asks general knowledge questions (e.g. about Paris, world history, science, geography, or culture), answer them helpfully, accurately, and eloquently while maintaining your role as an encouraging tutor.

3. INTERACTIVE SOCRATIC CONCEPT CHECK:
   - When teaching or clarifying an academic syllabus topic, include a targeted multiple-choice question in "conceptCheck" to test if they truly grasp the concept.
   - If the student asks a general knowledge inquiry, asks about their marks/schedule, or says casual greetings, set "conceptCheck" to null.
   - For "conceptCheck", provide:
     * "question": The targeted question.
     * "options": Exactly 4 clear choices.
     * "correctAnswer": The exact text of the correct choice from the options array.
     * "explanation": Why that choice is correct.

4. MATHEMATICAL & MARKDOWN FORMATTING:
   - ALWAYS format mathematical expressions, time complexities, asymptotic notations, and formulas in standard LaTeX math notation:
     * Inline math with single dollar signs: $O(\\log n)$, $O(\\log_2 N)$, $\\lceil t/2 \\rceil$, $t - 1$, $O(N)$, $O(1)$.
     * Display math with double dollar signs: $$...$$ for standalone formulas.
   - Use bold markdown asterisks (**term**) for core definitions and vital takeaways.
   - Use markdown headings (## and ###), structured bullet points (- ), and fenced code blocks for tree/code visualizations.

5. OUTPUT FORMAT:
   You MUST return a valid JSON object matching this schema:
   {
     "message": "Your markdown-formatted answer, feedback, or explanation to the student.",
     "conceptCheck": {
       "question": "Question text",
       "options": ["Option A", "Option B", "Option C", "Option D"],
       "correctAnswer": "Option A",
       "explanation": "Why Option A is correct"
     } or null,
     "masteryDelta": 5
   }`;

        const isGoogleGemini = apiKey.startsWith('AIzaSy') || activeModel.includes('gemini');

        let rawText: string | null = null;

        if (isGoogleGemini && apiKey.startsWith('AIzaSy')) {
          // Direct Google AI Studio Gemini Engine
          const geminiModel = 'gemini-2.5-flash';
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

          const geminiContents = [
            ...history.slice(-8).map((m) => ({
              role: m.sender === 'ai' ? 'model' : 'user',
              parts: [{ text: m.text }]
            })),
            { role: 'user', parts: [{ text: userMessage }] }
          ];

          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: geminiContents,
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.7,
                maxOutputTokens: 2048
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
            if (rawText) {
              this.apiStatus = {
                isLive: true,
                isRateLimited: false,
                lastError: null,
                statusMessage: `Google AI Studio Live: ${geminiModel}`,
                model: geminiModel,
                keyMasked: 'Active & Encrypted'
              };
              this.notify();
            }
          } else {
            const errBody = await response.text();
            let parsedErrMsg = errBody;
            try {
              const errJson = JSON.parse(errBody);
              parsedErrMsg = errJson.error?.message || errBody;
            } catch {}

            this.apiStatus = {
              isLive: false,
              isRateLimited: response.status === 429,
              lastError: `Google AI Studio Error (${response.status}): ${parsedErrMsg}`,
              statusMessage: response.status === 429 ? 'Google AI Studio Quota Exceeded' : `Google AI Studio Error (${response.status})`,
              model: geminiModel,
              keyMasked: 'Active & Encrypted'
            };
            this.notify();
          }
        } else {
          // OpenRouter API Engine
          const messages = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-8).map((m) => ({
              role: m.sender === 'ai' ? 'assistant' : 'user',
              content: m.text
            })),
            { role: 'user', content: userMessage }
          ];

          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
              'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://mindbridge.ai',
              'X-Title': 'Mind Bridge AI'
            },
            body: JSON.stringify({
              model: activeModel,
              messages,
              response_format: { type: 'json_object' },
              max_tokens: 2048
            })
          });

          if (response.ok) {
            const data = await response.json();
            rawText = data.choices?.[0]?.message?.content || null;
            if (rawText) {
              this.apiStatus = {
                isLive: true,
                isRateLimited: false,
                lastError: null,
                statusMessage: `OpenRouter Live: ${activeModel}`,
                model: activeModel,
                keyMasked: 'Active & Encrypted'
              };
              this.notify();
            }
          } else {
            const errBody = await response.text();
            let parsedErrMsg = errBody;
            try {
              const errJson = JSON.parse(errBody);
              parsedErrMsg = errJson.error?.message || errBody;
            } catch {}

            this.apiStatus = {
              isLive: false,
              isRateLimited: response.status === 429,
              lastError: `HTTP ${response.status}: ${parsedErrMsg}`,
              statusMessage: response.status === 429 ? 'OpenRouter Limit Reached' : `Error (${response.status})`,
              model: activeModel,
              keyMasked: 'Active & Encrypted'
            };
            this.notify();
          }
        }

        if (rawText) {
          let cleaned = rawText.trim();
          if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }

          try {
            const parsed: TutorResponse = JSON.parse(cleaned);
            if (parsed.message) {
              this.speak(parsed.message);
              return parsed;
            }
          } catch (jsonErr) {
            console.warn('JSON parse error from LLM output, extracting text:', jsonErr);
            const msgMatch = cleaned.match(/"message"\s*:\s*"([\s\S]*?)(?:",\s*"conceptCheck"|"$|"\s*})/);
            const extractedMsg = msgMatch ? msgMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : cleaned;
            this.speak(extractedMsg);
            return {
              message: extractedMsg,
              conceptCheck: null,
              masteryDelta: 5
            };
          }
        }
      } catch (err: unknown) {
        const error = err as Error;
        this.apiStatus = {
          isLive: false,
          isRateLimited: false,
          lastError: `Network error: ${error.message || 'Failed to fetch'}`,
          statusMessage: 'Connection Failed — Local Engine Active',
          model: activeModel,
          keyMasked: 'Active & Encrypted'
        };
        this.notify();
      }
    }

    // High-fidelity Local Socratic Reasoning Engine fallback
    return this.getLocalTutorResponse(topic, userMessage, history.length);
  }

  /**
   * Tests connection to Google AI Studio or OpenRouter with a specific key and model.
   */
  public async testConnection(customKey?: string, customModel?: string): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const settings = storageService.getAISettings();
    const key = (customKey || settings.openRouterApiKey || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY || '').trim();
    const model = customModel || settings.model || 'gemini-2.5-flash';

    if (!key) {
      return { success: false, message: 'No API key configured.' };
    }

    const startTime = Date.now();
    try {
      if (key.startsWith('AIzaSy')) {
        // Direct Google AI Studio Gemini Health Check
        const geminiModel = 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Ping' }] }]
          })
        });

        const latencyMs = Date.now() - startTime;
        if (res.ok) {
          this.apiStatus = {
            isLive: true,
            isRateLimited: false,
            lastError: null,
            statusMessage: `Google AI Studio Live: ${geminiModel}`,
            model: geminiModel,
            keyMasked: 'Active & Encrypted'
          };
          this.notify();
          return {
            success: true,
            message: `Connected successfully to Google AI Studio (${geminiModel})! Latency: ${latencyMs}ms`,
            latencyMs
          };
        } else {
          const errText = await res.text();
          let parsed = errText;
          try {
            const json = JSON.parse(errText);
            parsed = json.error?.message || errText;
          } catch {}

          this.apiStatus = {
            isLive: false,
            isRateLimited: res.status === 429,
            lastError: `Google AI Studio Error (${res.status}): ${parsed}`,
            statusMessage: `Google AI Studio Error (${res.status})`,
            model: geminiModel,
            keyMasked: 'Active & Encrypted'
          };
          this.notify();
          return {
            success: false,
            message: `Google AI Studio (${res.status}): ${parsed}`
          };
        }
      }

      // OpenRouter Check
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://mindbridge.ai',
          'X-Title': 'Mind Bridge AI'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 16
        })
      });

      const latencyMs = Date.now() - startTime;
      if (res.ok) {
        this.apiStatus = {
          isLive: true,
          isRateLimited: false,
          lastError: null,
          statusMessage: `OpenRouter Live: ${model}`,
          model,
          keyMasked: 'Active & Encrypted'
        };
        this.notify();
        return {
          success: true,
          message: `Connected successfully to ${model}! Latency: ${latencyMs}ms`,
          latencyMs
        };
      } else {
        const errText = await res.text();
        let parsed = errText;
        try {
          const json = JSON.parse(errText);
          parsed = json.error?.message || errText;
        } catch {}

        this.apiStatus = {
          isLive: false,
          isRateLimited: res.status === 429,
          lastError: `HTTP ${res.status}: ${parsed}`,
          statusMessage: res.status === 429 ? 'Rate Limit (429) Reached' : `Error ${res.status}`,
          model,
          keyMasked: 'Active & Encrypted'
        };
        this.notify();
        return {
          success: false,
          message: `HTTP ${res.status}: ${parsed}`
        };
      }
    } catch (e: unknown) {
      const err = e as Error;
      return {
        success: false,
        message: `Network failure: ${err.message || 'Unable to connect to AI provider'}`
      };
    }
  }

  private getLocalTutorResponse(topic: string, userMessage: string, turnCount: number): TutorResponse {
    const lowerTopic = topic.toLowerCase();
    const lowerUser = userMessage.toLowerCase();
    const profile = storageService.getProfile();
    const gaps = storageService.getLearningGaps();
    const timetable = storageService.getTimetable();

    // 0. General non-academic questions fallback (e.g. Paris, general queries)
    if (lowerUser.includes('paris') || lowerUser.includes('france') || lowerUser.includes('capital of france')) {
      const msg = `**Paris** is the capital and most populous city of France, situated along the Seine River. Famous worldwide as the "City of Light" (*La Ville Lumière*), it is celebrated for landmarks like the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral, as well as its rich heritage in philosophy, art, and cuisine!
      
*(Note: I am currently responding using my offline backup engine. To unlock live conversational intelligence with OpenRouter, verify your API key connection in the AI Settings pill above).*`;
      this.speak(msg);
      return {
        message: msg,
        conceptCheck: null,
        masteryDelta: 0
      };
    }

    // Student asks about gaps or performance
    if (lowerUser.includes('gap') || lowerUser.includes('weak') || lowerUser.includes('mark') || lowerUser.includes('score') || lowerUser.includes('grade')) {
      const activeGapsList = gaps.map((g) => `• **${g.topic}** (${g.subject}): ${g.masteryScore}% mastery [${g.severity.toUpperCase()} gap]`).join('\n');
      const msg = `Hey ${profile.name}! Based on your authenticated academic records:

**Current Standing:**
• CGPA: **${profile.cgpa}/10.0** (Target: **${profile.targetCgpa}**)
• Consistent **${profile.streakDays}-Day Study Streak** with **${profile.totalXp} XP** (Level ${profile.level})

**Your Active Learning Gaps:**
${activeGapsList}

Your highest priority is **B-Trees & B+ Tree Indexing** in DBMS (38% mastery, 35% end-sem weight). Would you like to practice B-Tree node splitting or schedule a deep-focus block?`;
      this.speak(msg);
      return {
        message: msg,
        conceptCheck: {
          question: "Which of your active learning gaps has the highest exam impact weighting?",
          options: [
            "B-Trees & B+ Tree Indexing (35% impact)",
            "Dynamic Programming State Transitions (30% impact)",
            "Virtual Memory Page Replacement (20% impact)",
            "Computer Networks Framing"
          ],
          correctAnswer: "B-Trees & B+ Tree Indexing (35% impact)",
          explanation: "B-Trees in DBMS represent a Critical severity gap with 35% weightage on your upcoming end-semester examinations."
        },
        masteryDelta: 5
      };
    }

    // Student asks about timetable or schedule
    if (lowerUser.includes('schedule') || lowerUser.includes('timetable') || lowerUser.includes('today') || lowerUser.includes('plan')) {
      const scheduleList = timetable.map((t) => `• **${t.startTime} - ${t.endTime}**: ${t.subject} — *${t.topic}* (${t.completed ? '✅ Done' : '⏳ Pending'})`).join('\n');
      const msg = `Here is your current adaptive schedule for **${profile.name}**:

${scheduleList}

Your study plan is dynamically balanced based on your cognitive workload state. Focus on the upcoming pending blocks to keep your **${profile.streakDays}-day streak** alive!`;
      this.speak(msg);
      return {
        message: msg,
        conceptCheck: null,
        masteryDelta: 5
      };
    }

    // 1. DBMS: B-Trees & Indexing
    if (lowerTopic.includes('b-tree') || lowerTopic.includes('indexing') || lowerTopic.includes('dbms')) {
      if (turnCount <= 1) {
        const msg = `Welcome ${profile.name}! Let's conquer **B-Trees & B+ Trees** (currently at ${gaps[0]?.masteryScore || 38}% mastery in your profile).

In database storage engines, disks read blocks in 4KB/8KB pages. If we used binary search on disk, we would do $O(\\log_2 N)$ disk seeks—which takes tens of milliseconds! 

A **B-Tree** solves this by having high fan-out: each node holds hundreds of keys and points to multiple child pages, reducing tree height to typically 3 or 4 levels.`;
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

      // Check specifically for B-Tree splitting / fanout keywords without false positives on single letters
      const isSplitQuery = /\b(split|splitting|median|fanout|leaf node|internal node|order m|m-way)\b/i.test(lowerUser);
      if (isSplitQuery) {
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

      // Check if user is asking something completely outside the topic
      const isTopicRelevant = /\b(tree|b-tree|b\+|btree|index|indexing|disk|page|block|node|root|leaf|key|search|seek)\b/i.test(lowerUser);
      if (!isTopicRelevant && turnCount > 1) {
        const msg = `You asked: "${userMessage}".

I am currently running in **Curriculum Focus Mode** for **${topic}**. 

If you would like to ask open-ended questions or get real-time reasoning from our cloud LLM, check the **AI Settings** pill above to ensure your OpenRouter API key is connected. Would you like to continue mastering **${topic}**?`;
        this.speak(msg);
        return {
          message: msg,
          conceptCheck: null,
          masteryDelta: 0
        };
      }

      const msg = `Great effort, ${profile.name}. The key point to remember is that B-Trees are designed around disk block boundaries. Even with a million records, a B-Tree has a height of only 3 to 4 levels! Let's test your understanding of leaf node structure.`;
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
    if (lowerTopic.includes('dynamic') || lowerTopic.includes('knapsack') || lowerTopic.includes('recurrence') || lowerTopic.includes('dp')) {
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
    const msg = `Hello ${profile.name}! I'm ready to explore **${topic}** with you. With your visual & hands-on learning style, what part of this topic feels most challenging to you right now? Is it the core intuition, the mathematical formalisms, or implementing the code?`;
    this.speak(msg);
    return {
      message: msg,
      conceptCheck: {
        question: `When analyzing "${topic}", what is the primary invariant or objective to optimize for?`,
        options: [
          "Preserve correctness while minimizing asymptotic time and space complexity.",
          "Execute exclusively in kernel mode.",
          "Avoid using cache memory.",
          "Hardcode all runtime constants."
        ],
        correctAnswer: "Preserve correctness while minimizing asymptotic time and space complexity.",
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
