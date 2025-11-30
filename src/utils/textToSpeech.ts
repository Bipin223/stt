export interface Voice {
    name: string;
    lang: string;
    voiceURI: string;
    localService: boolean;
}

export interface SpeechCallbacks {
    onStart?: () => void;
    onEnd?: () => void;
    onPause?: () => void;
    onResume?: () => void;
    onError?: (error: Error) => void;
    onBoundary?: (charIndex: number) => void;
}

export class TextToSpeechService {
    private synth: SpeechSynthesis;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private voices: SpeechSynthesisVoice[] = [];

    constructor() {
        this.synth = window.speechSynthesis;
        this.loadVoices();

        // Load voices when they become available
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
    }

    private loadVoices(): void {
        this.voices = this.synth.getVoices();
    }

    getAvailableVoices(): Voice[] {
        const voices = this.synth.getVoices();
        return voices.map(voice => ({
            name: voice.name,
            lang: voice.lang,
            voiceURI: voice.voiceURI,
            localService: voice.localService
        }));
    }

    speak(
        text: string,
        voiceURI?: string,
        callbacks?: SpeechCallbacks,
        options?: {
            rate?: number;
            pitch?: number;
            volume?: number;
        }
    ): void {
        if (!text.trim()) {
            throw new Error('No text provided to speak');
        }

        // Cancel any ongoing speech
        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);

        // Set voice if specified
        if (voiceURI) {
            const voice = this.voices.find(v => v.voiceURI === voiceURI);
            if (voice) {
                utterance.voice = voice;
            }
        }

        // Set options
        utterance.rate = options?.rate ?? 1.0;
        utterance.pitch = options?.pitch ?? 1.0;
        utterance.volume = options?.volume ?? 1.0;

        // Set callbacks
        if (callbacks?.onStart) {
            utterance.onstart = callbacks.onStart;
        }
        if (callbacks?.onEnd) {
            utterance.onend = callbacks.onEnd;
        }
        if (callbacks?.onPause) {
            utterance.onpause = callbacks.onPause;
        }
        if (callbacks?.onResume) {
            utterance.onresume = callbacks.onResume;
        }
        if (callbacks?.onError) {
            utterance.onerror = (event) => {
                callbacks.onError!(new Error(`Speech synthesis error: ${event.error}`));
            };
        }
        if (callbacks?.onBoundary) {
            utterance.onboundary = (event) => {
                callbacks.onBoundary!(event.charIndex);
            };
        }

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    }

    pause(): void {
        if (this.synth.speaking && !this.synth.paused) {
            this.synth.pause();
        }
    }

    resume(): void {
        if (this.synth.paused) {
            this.synth.resume();
        }
    }

    stop(): void {
        this.synth.cancel();
        this.currentUtterance = null;
    }

    isSpeaking(): boolean {
        return this.synth.speaking;
    }

    isPaused(): boolean {
        return this.synth.paused;
    }

    getDefaultVoice(): Voice | null {
        const voices = this.getAvailableVoices();

        // Try to find an English voice
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) return englishVoice;

        // Return first available voice
        return voices.length > 0 ? voices[0] : null;
    }

    // Get voices by language
    getVoicesByLanguage(langCode: string): Voice[] {
        return this.getAvailableVoices().filter(v => v.lang.startsWith(langCode));
    }
}

export const textToSpeechService = new TextToSpeechService();
