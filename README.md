# Mind Bridge AI — Personalized Academic Learning Assistant

> **"Personalized AI-powered academic learning assistant that connects academic history, learning gaps, and daily study."**

Developed by **SPACE CODERS**:
- **J Sanjay Aron**
- **J Koushik**
- **K Yaswanth**
- **S Razak Ali**

---

## 1. Product Vision & Architecture

Standard college systems provide a fixed, uniform syllabus, timetable, and exam format regardless of the student's individual learning speed, strengths, or weaknesses. 

**Mind Bridge AI** replaces this static paradigm with a **Closed Continuous Improvement Loop**:

```
Student Academic History
      ↓
Performance Analysis
      ↓
Identify Learning Gaps (Critical, High, Medium, Low)
      ↓
Generate Personalized Syllabus (Dynamic Priority Re-ranking)
      ↓
AI-Generated Study Timetable (Adaptive Load Distribution)
      ↓
Interactive Socratic AI Tutor (Back-and-Forth Concept Checks)
      ↓
Personalized Diagnostic Tests (Focused on Active Weak Areas)
      ↓
Performance & Mastery Evaluation (Accuracy & Delta Analysis)
      ↓
Update Adaptive Learning Plan (Syllabus & Timetable Recalibration)
      ↓
Academic Gamification & Rewards (XP, Levels, Milestone Badges)
      ↓
Daily Workload & Stress-Aware Check (Non-medical Cognitive Pacing)
      ↓
CONTINUOUS IMPROVEMENT LOOP
```

---

## 2. Design System: Skeuomorphism & Liquid Glass

Mind Bridge AI combines a dark futuristic theme with tactile skeuomorphism and Apple-style liquid glass refraction:
- **Base Canvas**: Deep obsidian & space charcoal (`#08090E`, `#0D101A`, `#141826`) with ambient mesh gradient glows.
- **Liquid Glass Materials**: Translucent backdrop blur (`backdrop-blur-2xl`), specular top rim reflection (`inset 0 1.5px 1px rgba(255,255,255,0.35)`), caustic bottom edge glows, and fluid pill capsules.
- **Tactile Skeuomorphic Controls**: Extruded 3D buttons with realistic press depth (`:active` translation and inset shadows), LCD digital time displays, and glowing hardware LED status diodes (emerald, amber, rose, violet).
- **Procedural Sound FX**: Built-in Web Audio API synthesizer for tactile physical button clicks, LED chimes, quiz correct fanfares, and adaptive engine recalibration pings (zero audio asset downloads, 100% offline capable).

---

## 3. Ten Core Modules

1. **Intelligent Command Dashboard**: Answers *"What should I study today, and why?"* with today's highest-yield focus topic, why it was recommended, next actions, live focus stopwatch, and today's adaptive timetable.
2. **Academic History**: Centralized log of courses, semester GPAs, exam types (Midterm, End-Sem, Quiz, Lab), marks, and evaluated concepts. Includes a simulated modal to ingest new academic records in real-time.
3. **Learning Gap Diagnostics**: Automated analysis classifying topics into Mastered Strengths vs Critical/High/Medium Gaps with root-cause explanations and 1-click remediation.
4. **Personalized Syllabus**: Dynamic curriculum hierarchy that automatically re-ranks topics placing critical deficiencies first with higher estimated study allocations.
5. **Smart Timetable**: Daily and weekly scheduler where weak topics receive 60-90 minute deep work blocks and mastered topics receive spaced repetition maintenance.
6. **Interactive Socratic AI Tutor**: Chat-style tutor room that explains core intuitions and poses targeted conceptual questions with immediate feedback and a live 0-100% Understanding Gauge.
7. **Personalized Tests**: Diagnostic assessments targeting active gaps, featuring a countdown timer, question navigator, and instant rubric grading.
8. **Adaptive Feedback Loop Visualizer**: Interactive 11-step pipeline diagram accompanied by a real-time chronological audit trail of all automated system adaptations.
9. **Progress & Gamification**: Academic XP tracking, Level progression (e.g. Level 4: Algorithm Adept), milestone badges (Gap Buster, Study Engine, Socratic Thinker), and confetti celebrations.
10. **Workload & Stress-Aware Planning**: Cognitive pacing modal allowing students to report heavy load or fatigue. Dynamically defers non-critical study blocks to the weekend with clear disclaimers that it is strictly study planning, not a medical/psychological assessment.

---

## 4. AI Engine: Dual-Mode Integration

Mind Bridge AI features a pluggable AI architecture:
- **Live OpenRouter Integration**: Connects to cutting-edge models (`google/gemini-2.0-flash-001`, `anthropic/claude-3.5-haiku`, `meta-llama/llama-3.3-70b-instruct`) using the user's OpenRouter API key.
- **Intelligent Local Pedagogical Fallback**: High-fidelity deterministic Socratic reasoning engine built directly into the app. Delivers instant, structured dialogue, gap diagnostics, and dynamic question generation even without internet connectivity or API quota limits.

---

## 5. Technology Stack

- **Frontend**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 8
- **Styling**: Tailwind CSS v4 with custom liquid glass and tactile skeuomorphic layers
- **Icons**: Lucide React
- **Animations & Effects**: `canvas-confetti`, Web Audio API procedural synthesis
- **State Management**: Reactive LocalStorage state service with comprehensive pre-seeded demo records for Sanjay Aron (B.Tech CSE)

---

## 6. How to Run Locally

1. **Install dependencies**:
   ```bash
   cd mind-bridge-ai
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. **Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 7. Key Demonstration Scenario (Verification Walkthrough)

1. Open the **Dashboard**: Note that **B-Trees & B+ Tree Indexing (DBMS)** is flagged as **Today's Highest-Yield Focus** because of a 38% mastery gap detected in the Midterm exam.
2. Click **"Launch Socratic AI Tutor"**: Engage with the AI tutor, answer the embedded conceptual question regarding node splitting and range queries, and watch the **Understanding Gauge** rise.
3. Click **"Take Diagnostic Quiz"**: Answer the B-Tree assessment and click **"Submit & Trigger Adaptive Loop"**.
4. Observe the **Closed Feedback Loop**:
   - Confetti celebration triggers.
   - B-Trees gap is upgraded from *Critical* to *Mastered*.
   - Academic XP increases by +300 and awards the *Gap Buster* badge.
   - The **Syllabus** marks B-Trees as *Mastered* and elevates **Dynamic Programming** to priority #1.
   - The **Timetable** swaps upcoming remedial slots to Dynamic Programming.
   - The **Adaptive Audit Trail** records the complete transaction with exact timestamps.
5. Click **"Workload Check-in"** from the sidebar or dashboard:
   - Select **"Heavy Pressure"** or **"Overwhelmed"** (Stress rating 4/5).
   - Click **"Apply Workload Adaptation"**.
   - Watch today's intensive study blocks automatically shift to Saturday to protect cognitive focus.
