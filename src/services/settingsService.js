const defaultSettings = {
    targetLang: 'ja',
    originLang: 'en',
    darkMode: false,
    autoPlay: true,
    
    // Visuals
    showVocab: true,
    showReading: true,
    showSentence: true,
    showEnglish: true,
    
    // Dictionary
    dictEnabled: true,
    dictAudio: false,
    
    // Games
    quizAnswerAudio: false,
    quizAutoPlayCorrect: true,
    quizWaitAudio: false, // New
    
    sentencesWordAudio: true,
    sentAutoPlayCorrect: true,
    sentWaitAudio: false, // New
    
    blanksAnswerAudio: true,
    blanksAutoPlayCorrect: true,
    blanksWaitAudio: false // New
};

class SettingsService {
    constructor() { this.settings = this.load(); }

    load() {
        try {
            const saved = localStorage.getItem('polyglot_settings');
            if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
        } catch (e) { console.error(e); }
        return { ...defaultSettings };
    }

    get() { return this.settings; }

    set(key, value) {
        this.settings[key] = value;
        this.save();
    }

    setTarget(lang) { this.set('targetLang', lang); }
    
    save() {
        try { localStorage.setItem('polyglot_settings', JSON.stringify(this.settings)); } catch (e) {}
    }
}
export const settingsService = new SettingsService();
