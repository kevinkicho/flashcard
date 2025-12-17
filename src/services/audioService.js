import { settingsService } from './settingsService';

class AudioService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => { this.voices = this.synth.getVoices(); };
        }
    }

    getVoice(langCode) {
        if (!this.voices.length) this.voices = this.synth.getVoices();
        const langMap = { 'ja': 'ja-JP', 'en': 'en-US', 'ko': 'ko-KR', 'zh': 'zh-CN', 'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT', 'pt': 'pt-BR', 'ru': 'ru-RU' };
        const target = langMap[langCode] || 'en-US';
        return this.voices.find(v => v.lang === target) || this.voices.find(v => v.lang.startsWith(target.split('-')[0]));
    }

    stop() {
        if (this.synth.speaking || this.synth.pending) this.synth.cancel();
    }

    speak(text, lang) {
        if (!text) return;
        this.stop();

        // [FIX] Japanese Audio Parsing: "Word A・Word B" -> Speak "Word A" only
        let textToSpeak = text;
        if (lang === 'ja' && text.includes('・')) {
            textToSpeak = text.split('・')[0];
        }

        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = lang;
            utterance.rate = 0.9;
            const voice = this.getVoice(lang);
            if (voice) utterance.voice = voice;
            this.synth.speak(utterance);
        }, 50);
    }
}

export const audioService = new AudioService();
