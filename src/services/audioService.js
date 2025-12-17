import { settingsService } from './settingsService';

class AudioService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        
        // Load voices (browsers handle this asynchronously)
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
            };
        }
    }

    getVoice(langCode) {
        if (!this.voices.length) this.voices = this.synth.getVoices();
        
        // Map our ISO codes to BCP 47 tags (e.g., 'ja' -> 'ja-JP')
        const langMap = {
            'ja': 'ja-JP', 'en': 'en-US', 'ko': 'ko-KR', 'zh': 'zh-CN',
            'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT',
            'pt': 'pt-BR', 'ru': 'ru-RU'
        };
        const target = langMap[langCode] || 'en-US';

        // Find exact match or partial match
        return this.voices.find(v => v.lang === target) || 
               this.voices.find(v => v.lang.startsWith(target.split('-')[0]));
    }

    stop() {
        if (this.synth.speaking) this.synth.cancel();
    }

    speak(text, lang) {
        if (!text || !settingsService.get().autoPlay) return;

        this.stop(); // Stop previous audio

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9; // Slightly slower is better for learning
        
        const voice = this.getVoice(lang);
        if (voice) utterance.voice = voice;

        this.synth.speak(utterance);
    }
}

export const audioService = new AudioService();
