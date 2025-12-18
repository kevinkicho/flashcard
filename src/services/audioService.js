import { settingsService } from './settingsService';

class AudioService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
    }

    getVoice(langCode) {
        if (!this.voices.length) {
            this.voices = this.synth.getVoices();
        }
        
        const langMap = { 
            'ja': 'ja-JP', 'en': 'en-US', 'ko': 'ko-KR', 'zh': 'zh-CN', 
            'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT', 
            'pt': 'pt-BR', 'ru': 'ru-RU' 
        };
        
        const target = langMap[langCode] || 'en-US';
        
        return this.voices.find(v => v.lang === target) || 
               this.voices.find(v => v.lang.startsWith(target.split('-')[0])) ||
               null;
    }

    stop() {
        if (this.synth.speaking || this.synth.pending) {
            this.synth.cancel();
        }
    }

    speak(text, lang) {
        if (!text) return;
        this.stop();

        // Cleanup for Japanese (remove dots/furigana artifacts if any)
        let textToSpeak = text;
        if (lang === 'ja' && text.includes('・')) {
            textToSpeak = text.split('・')[0];
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = lang;
        utterance.rate = 0.9;

        const voice = this.getVoice(lang);
        if (voice) utterance.voice = voice;

        this.synth.speak(utterance);
    }

    speakWithCallback(text, lang, onEnd) {
        if (!text) { if(onEnd) onEnd(); return; }
        
        this.stop();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.onend = onEnd || null;
        
        const voice = this.getVoice(lang);
        if (voice) utterance.voice = voice;

        this.synth.speak(utterance);
    }

    // NEW: Reads "Part 1 ... [Pause] ... Part 2"
    speakGapSentence(part1, part2, lang) {
        this.stop();

        const u1 = new SpeechSynthesisUtterance(part1);
        u1.lang = lang;
        const voice = this.getVoice(lang);
        if (voice) u1.voice = voice;

        u1.onend = () => {
            // Wait 1 second before speaking part 2
            setTimeout(() => {
                const u2 = new SpeechSynthesisUtterance(part2);
                u2.lang = lang;
                if (voice) u2.voice = voice;
                this.synth.speak(u2);
            }, 1000); // 1 second pause for the "Blank"
        };

        this.synth.speak(u1);
    }
}

export const audioService = new AudioService();
