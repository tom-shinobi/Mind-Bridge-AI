import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { createWorker } from 'tesseract.js';
import { storageService } from './storageService';
import type { ExtractedSyllabus, SyllabusTopic, LearningGap } from '../types';

// Configure pdfjs worker if available
if (typeof window !== 'undefined' && 'Worker' in window) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch {
    // fallback to default
  }
}

class SyllabusService {
  /**
   * Extract raw text from uploaded syllabus document (PDF, DOCX, Images, Text)
   */
  public async extractTextFromFile(file: File): Promise<{ text: string; fileType: string; isScanned: boolean }> {
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';

    // 1. PDF Extraction
    if (fileType === 'pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ');
          fullText += `\n--- Page ${i} ---\n` + pageText;
        }

        if (fullText.trim().length > 50) {
          return { text: fullText.trim(), fileType: 'pdf', isScanned: false };
        }
      } catch (err) {
        console.warn('PDF parsing error, falling back to OCR:', err);
      }
    }

    // 2. Word (.docx) Extraction
    if (fileType === 'docx') {
      try {
        const zip = new JSZip();
        const loaded = await zip.loadAsync(file);
        const xmlFile = loaded.file('word/document.xml');
        if (xmlFile) {
          const xmlContent = await xmlFile.async('text');
          // Extract text inside <w:t> tags
          const matches = xmlContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
          if (matches) {
            const cleanText = matches
              .map((m) => m.replace(/<\/?w:t[^>]*>/g, ''))
              .join(' ');
            return { text: cleanText, fileType: 'docx', isScanned: false };
          }
        }
      } catch (err) {
        console.warn('DOCX extraction error:', err);
      }
    }

    // 3. Image OCR (PNG, JPG, JPEG, WEBP)
    if (['png', 'jpg', 'jpeg', 'webp'].includes(fileType)) {
      try {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(file);
        await worker.terminate();
        return { text: ret.data.text.trim(), fileType, isScanned: true };
      } catch (err) {
        console.warn('OCR processing error:', err);
      }
    }

    // 4. Plain text / Markdown fallback
    try {
      const text = await file.text();
      return { text: text.trim(), fileType, isScanned: false };
    } catch {
      return { text: '', fileType, isScanned: false };
    }
  }

  /**
   * Structure raw syllabus text using OpenRouter AI
   */
  public async structureSyllabusWithAI(rawText: string, contextSubject = ''): Promise<ExtractedSyllabus> {
    const settings = storageService.getAISettings();
    const apiKey = (settings.openRouterApiKey || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY || '').trim();
    const model = settings.model || 'gemini-2.5-flash';

    const systemPrompt = `You are MindBridge Academic Intelligence, an expert curriculum parser.
Your task is to analyze the provided university syllabus text and extract a clean, organized, hierarchical syllabus structure.

RULES:
1. Identify the main Subject name (e.g., "Database Management Systems", "Operating Systems").
2. Extract all Modules / Units (e.g., "Module 1: Relational Model", "Module 2: SQL & Normalization", "Module 3: Storage & Indexing").
3. For each Module, extract the individual Topics (e.g., "B-Trees", "B+ Trees", "Hashing", "Query Optimization").
4. Assign an appropriate priority ('high', 'medium', 'low') and estimated study hours (e.g. 2.0 to 4.5) to each topic.
5. If subtopics are listed, include them in an array.

OUTPUT SCHEMA:
You MUST return ONLY valid JSON matching this exact structure:
{
  "subject": "Subject Name",
  "modules": [
    {
      "moduleName": "Module 1: Title",
      "topics": [
        {
          "topic": "Topic Name",
          "priority": "high",
          "estimatedHours": 3.0,
          "subtopics": ["Subtopic 1", "Subtopic 2"]
        }
      ]
    }
  ]
}`;

    if (apiKey && rawText.trim().length > 20) {
      try {
        let rawContent: string | null = null;

        if (apiKey.startsWith('AIzaSy')) {
          // Direct Google AI Studio Gemini Engine
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `Here is the syllabus text to parse (Subject hint: ${contextSubject}):\n\n${rawText.slice(0, 4500)}` }]
                }
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
                maxOutputTokens: 2048
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
          }
        } else {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
              'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://mindbridge.ai',
              'X-Title': 'Mind Bridge AI Syllabus Parser'
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                {
                  role: 'user',
                  content: `Here is the syllabus text to parse (Subject hint: ${contextSubject}):\n\n${rawText.slice(0, 4500)}`
                }
              ],
              response_format: { type: 'json_object' },
              max_tokens: 2048
            })
          });

          if (response.ok) {
            const data = await response.json();
            rawContent = data.choices?.[0]?.message?.content || null;
          }
        }

        if (rawContent) {
          let cleaned = rawContent.trim();
          if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }

          const parsed: ExtractedSyllabus = JSON.parse(cleaned);
          if (parsed.subject && Array.isArray(parsed.modules)) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('AI syllabus parsing error, using heuristic parser:', err);
      }
    }

    // Heuristic structural fallback
    return this.fallbackHeuristicParser(rawText, contextSubject);
  }

  /**
   * Converts structured syllabus into database-ready SyllabusTopic models
   */
  public convertToSyllabusTopics(extracted: ExtractedSyllabus, difficultTopics: string[] = []): SyllabusTopic[] {
    const list: SyllabusTopic[] = [];
    let order = 1;

    extracted.modules.forEach((mod) => {
      mod.topics.forEach((t) => {
        const isDifficult = difficultTopics.some((d) =>
          t.topic.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(t.topic.toLowerCase())
        );

        list.push({
          id: `syl_${Date.now()}_${order}`,
          subject: extracted.subject,
          moduleName: mod.moduleName,
          topic: t.topic,
          priority: isDifficult ? 'high' : t.priority || 'medium',
          status: 'pending',
          estimatedHours: t.estimatedHours || 2.5,
          completedHours: 0,
          masteryPercentage: isDifficult ? 35 : 50,
          isGapRemediation: isDifficult,
          orderIndex: order++
        });
      });
    });

    return list;
  }

  /**
   * Generates initial LearningGap models from syllabus and student's flagged difficult topics
   */
  public generateInitialLearningGaps(extracted: ExtractedSyllabus, difficultTopics: string[] = []): LearningGap[] {
    const gaps: LearningGap[] = [];

    difficultTopics.forEach((dt, idx) => {
      // Find matching module if available
      let matchedModule = 'Core Foundations';
      for (const mod of extracted.modules) {
        if (mod.topics.some((t) => t.topic.toLowerCase().includes(dt.toLowerCase()))) {
          matchedModule = mod.moduleName;
          break;
        }
      }

      gaps.push({
        id: `gap_${Date.now()}_${idx}`,
        subject: extracted.subject,
        topic: dt,
        module: matchedModule,
        severity: idx === 0 ? 'critical' : idx === 1 ? 'high' : 'medium',
        masteryScore: 35 + idx * 5,
        identifiedFrom: 'Student Diagnostic Onboarding',
        rootCause: 'Flagged as high-difficulty focus area during onboarding',
        recommendedHours: 3.5,
        status: 'active',
        lastEvaluated: new Date().toISOString().slice(0, 10)
      });
    });

    return gaps;
  }

  /**
   * Heuristic line-by-line fallback parser when offline or AI call is unavailable
   */
  private fallbackHeuristicParser(rawText: string, hintSubject: string): ExtractedSyllabus {
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const subject = hintSubject || lines[0]?.slice(0, 40) || 'Academic Course Syllabus';
    const modules: ExtractedSyllabus['modules'] = [];
    let currentModule = { moduleName: 'Module 1: Foundational Principles', topics: [] as ExtractedSyllabus['modules'][0]['topics'] };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^(module|unit|chapter|part)\s+\d+/i.test(line) || /^unit\s+[IVXLCDM]+/i.test(line)) {
        if (currentModule.topics.length > 0) {
          modules.push(currentModule);
        }
        currentModule = { moduleName: line, topics: [] };
      } else if (line.length > 3 && line.length < 80) {
        currentModule.topics.push({
          topic: line.replace(/^[-•*0-9.]+\s*/, ''),
          priority: 'medium',
          estimatedHours: 2.0
        });
      }
    }

    if (currentModule.topics.length > 0) {
      modules.push(currentModule);
    }

    if (modules.length === 0) {
      modules.push({
        moduleName: 'Core Modules',
        topics: [
          { topic: 'Key Theoretical Foundations', priority: 'high', estimatedHours: 3.0 },
          { topic: 'Applied Concepts & Architecture', priority: 'medium', estimatedHours: 2.5 },
          { topic: 'Practical Implementation & Case Studies', priority: 'medium', estimatedHours: 2.0 }
        ]
      });
    }

    return { subject, modules };
  }
}

export const syllabusService = new SyllabusService();
