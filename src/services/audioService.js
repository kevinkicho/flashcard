import { settingsService } from './settingsService';

class AudioService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.utterance = null;
    }

    stop() {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
    }

    speak(text, lang) {
        return new Promise((resolve, reject) => {
            this.stop();

            if (!text) {
                resolve();
                return;
            }

            // JAPANESE FIX: Stop reading at special characters
            if (lang === 'ja') {
                // Split by comma, slash, parenthesis (full/half width), etc.
                const splitters = /[、,，/／(（[【<＜]/;
                text = text.split(splitters)[0];
            }

            const u = new SpeechSynthesisUtterance(text);
            
            // Map our app's lang codes to BCP 47 tags
            const langMap = {
                'en': 'en-US', 'ja': 'ja-JP', 'ko': 'ko-KR', 'zh': 'zh-CN',
                'ru': 'ru-RU', 'de': 'de-DE', 'fr': 'fr-FR', 'es': 'es-ES',
                'it': 'it-IT', 'pt': 'pt-PT'
            };

            u.lang = langMap[lang] || 'en-US';
            
            // Rate/Volume settings
            const settings = settingsService.get();
            u.volume = settings.volume !== undefined ? settings.volume : 1.0;
            u.rate = 1.0; // Default rate

            u.onend = () => resolve();
            u.onerror = (e) => resolve(); // Resolve anyway to not block app

            this.synth.speak(u);
        });
    }
}

export const audioService = new AudioService();
