/**
 * Speech Recognition and Speech Synthesis fallback service using Web Speech API
 */

export interface SpeechCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
}

export class WebSpeechRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;
  private autoRestart: boolean = false;

  constructor(private callbacks: SpeechCallbacks = {}) {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US"; // Also recognizes Roman Urdu & basic phrases

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          this.callbacks.onResult?.(finalTranscript.trim(), true);
        } else if (interimTranscript) {
          this.callbacks.onResult?.(interimTranscript.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn("WebSpeech recognition error:", event.error);
        this.callbacks.onError?.(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.callbacks.onEnd?.();
        if (this.autoRestart) {
          try {
            this.recognition.start();
          } catch (e) {}
        }
      };
    }
  }

  public setLanguage(lang: string) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public start(autoRestart: boolean = false) {
    if (!this.recognition) return;
    this.autoRestart = autoRestart;
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Speech recognition already active or unavailable");
    }
  }

  public stop() {
    this.autoRestart = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }
}

export function speakTextWebSpeech(
  text: string,
  onEnd?: () => void,
  lang: string = "en-US"
): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      onEnd?.();
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown or unwanted tokens for natural speech
    const cleanText = text.replace(/[*_#`~[\]()]/g, "").trim();
    if (!cleanText) {
      onEnd?.();
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick best available voice (English / Urdu / Hindi if available)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.name.includes("Google") ||
        v.name.includes("Natural") ||
        v.name.includes("Female") ||
        v.name.includes("Zira") ||
        v.name.includes("Heera") ||
        v.name.includes("Hindi") ||
        v.name.includes("Urdu")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      onEnd?.();
      resolve();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      onEnd?.();
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}
