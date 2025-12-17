class SettingsService {
    constructor() {
        this.config = {
            targetLang: 'ja',
            originLang: 'en',
            font: 'font-inter',
            // Display
            showVocab: true,
            showReading: true,
            showSentence: true,
            showEnglish: false,
            darkMode: false,
            // Audio
            autoPlay: true,
            // Quiz
            quizChoices: 4 // Default number of options
        };
        
        const saved = localStorage.getItem('flashcard-settings');
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
        }
    }

    get() { return this.config; }

    setTarget(lang) { this.config.targetLang = lang; this.save(); }
    setOrigin(lang) { this.config.originLang = lang; this.save(); }
    setFont(font) { this.config.font = font; this.save(); }
    
    set(key, value) {
        this.config[key] = value;
        this.save();
    }

    save() {
        localStorage.setItem('flashcard-settings', JSON.stringify(this.config));
    }
}

export const settingsService = new SettingsService();
