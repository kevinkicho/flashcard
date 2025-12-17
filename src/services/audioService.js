import { settingsService } from './settingsService';

class AudioService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        
        // Load voices asynchronously
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
            };
        }
    }

    getVoice(langCode) {
        if (!this.voices.length) this.voices = this.synth.getVoices();
        
        // Map ISO codes to BCP 47 tags
        const langMap = {
            'ja': 'ja-JP', 'en': 'en-US', 'ko': 'ko-KR', 'zh': 'zh-CN',
            'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT',
            'pt': 'pt-BR', 'ru': 'ru-RU'
        };
        const target = langMap[langCode] || 'en-US';

        // Find exact match or partial match (e.g. en-GB for en)
        return this.voices.find(v => v.lang === target) || 
               this.voices.find(v => v.lang.startsWith(target.split('-')[0]));
    }

    // Force Stop Audio
    stop() {
        if (this.synth.speaking || this.synth.pending) {
            this.synth.cancel();
        }
    }

    speak(text, lang) {
        if (!text) return;
        
        // Always stop previous before starting new
        this.stop();

        // Small delay to ensure the browser clears the previous stream
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.9; // Slightly slower for clarity
            
            const voice = this.getVoice(lang);
            if (voice) utterance.voice = voice;

            this.synth.speak(utterance);
        }, 50);
    }
}

export const audioService = new AudioService();
