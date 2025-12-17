class SettingsService {
    constructor() {
        this.config = {
            targetLang: 'ja',
            originLang: 'en',
            fontFamily: 'font-inter', // Renamed for clarity
            fontWeight: 'font-normal', // New: 'font-light', 'font-normal', 'font-bold', 'font-black'
            // Display
            showVocab: true,
            showReading: true,
            showSentence: true,
            showEnglish: false,
            darkMode: false,
            // Audio
            autoPlay: true,
            // Quiz
            quizChoices: 4
        };
        
        const saved = localStorage.getItem('flashcard-settings');
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
        }
    }

    get() { return this.config; }

    setTarget(lang) { this.config.targetLang = lang; this.save(); }
    setOrigin(lang) { this.config.originLang = lang; this.save(); }
    
    set(key, value) {
        this.config[key] = value;
        this.save();
    }

    save() {
        localStorage.setItem('flashcard-settings', JSON.stringify(this.config));
    }
}

export const settingsService = new SettingsService();
