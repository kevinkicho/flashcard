import { settingsService } from './settingsService';

class AudioService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            this.loadVoices();
            window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    loadVoices() {
        this.voices = this.synth.getVoices();
    }

    getVoice(lang) {
        let voice = this.voices.find(v => v.lang === lang || v.lang.startsWith(lang));
        if (!voice && lang === 'ja') voice = this.voices.find(v => v.lang === 'ja-JP');
        if (!voice && lang === 'zh') voice = this.voices.find(v => v.lang === 'zh-CN');
        if (!voice && lang === 'ko') voice = this.voices.find(v => v.lang === 'ko-KR');
        return voice;
    }

    sanitizeText(text, lang) {
        if (!text) return "";
        let clean = text;

        // UNIVERSAL: STOP reading at any of these characters: ・, ･, ·, •, （, (, [, <, /, ,
        clean = clean.split(/[・･\u30FB\uFF65\u00B7\u2022（(\[<\/,]/)[0];

        return clean.trim();
    }

    speak(text, lang) {
        return new Promise((resolve, reject) => {
            if (!this.synth) { resolve(); return; }
            
            // App-wide Effect: Do not play audio for the Origin Language
            const settings = settingsService.get();
            if (lang === settings.originLang) {
                resolve(); 
                return;
            }

            this.synth.cancel();

            const cleanText = this.sanitizeText(text, lang);
            if (!cleanText) { resolve(); return; }

            const utter = new SpeechSynthesisUtterance(cleanText);
            const voice = this.getVoice(lang);
            if (voice) utter.voice = voice;
            
            utter.lang = lang;
            utter.volume = settings.volume !== undefined ? settings.volume : 1.0;
            utter.rate = 1.0; 

            utter.onend = () => resolve();
            utter.onerror = (e) => {
                console.warn("Audio error:", e);
                resolve();
            };

            this.synth.speak(utter);
        });
    }

    stop() {
        if (this.synth) this.synth.cancel();
    }
}

export const audioService = new AudioService();
