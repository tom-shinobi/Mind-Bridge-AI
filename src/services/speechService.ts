// Web Speech API Speech-to-Text Service for MindBridge AI
// Handles native browser speech recognition, microphone stream, and transcript events

interface SpeechRecognitionCallbacks {
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onError?: (errorMessage: string) => void;
  onEnd?: () => void;
}

class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentFinalTranscript: string = '';

  constructor() {
    this.initRecognition();
  }

  private initRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
        this.recognition = null;
      }
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public startListening(callbacks: SpeechRecognitionCallbacks): boolean {
    if (!this.isSupported()) {
      callbacks.onError?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return false;
    }

    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        callbacks.onError?.('Failed to initialize speech engine.');
        return false;
      }
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.currentFinalTranscript = '';

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalChunk) {
        this.currentFinalTranscript += (this.currentFinalTranscript ? ' ' : '') + finalChunk.trim();
        callbacks.onFinal(this.currentFinalTranscript);
      } else if (interimTranscript) {
        const fullLiveText = this.currentFinalTranscript
          ? `${this.currentFinalTranscript} ${interimTranscript.trim()}`
          : interimTranscript.trim();
        callbacks.onInterim?.(fullLiveText);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      let errorMsg = 'Microphone or speech recognition error.';
      if (event.error === 'not-allowed') {
        errorMsg = 'Microphone access was denied. Please allow microphone permissions in your browser.';
      } else if (event.error === 'no-speech') {
        return;
      } else if (event.error === 'network') {
        errorMsg = 'Speech network service error.';
      }
      callbacks.onError?.(errorMsg);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd?.();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      this.isListening = false;
      callbacks.onError?.(err?.message || 'Could not access microphone.');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.isListening = false;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();
