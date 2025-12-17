class SettingsService {
    constructor() {
        this.config = {
            targetLang: 'ja',
            originLang: 'en',
            fontFamily: 'font-inter',
            fontWeight: 'font-normal',
            // Display
            showVocab: true,
            showReading: true,
            showSentence: true,
            showEnglish: false,
            darkMode: false,
            // Audio
            autoPlay: true,
            // Quiz
            quizChoices: 4,
            quizClickMode: 'double', 
            quizAnswerAudio: true
        };
        
        try {
            const saved = localStorage.getItem('flashcard-settings');
            if (saved) {
                this.config = { ...this.config, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error("Failed to load settings, resetting to defaults", e);
            // If error, we just stick to default config
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
        try {
            localStorage.setItem('flashcard-settings', JSON.stringify(this.config));
        } catch (e) {
            console.error("Failed to save settings", e);
        }
    }
}

export const settingsService = new SettingsService();
