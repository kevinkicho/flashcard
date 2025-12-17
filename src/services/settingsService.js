class SettingsService {
    constructor() {
        this.config = {
            targetLang: 'ja',
            originLang: 'en',
            fontFamily: 'font-inter',
            fontWeight: 'font-normal',
            // Display
            showVocab: true, showReading: true, showSentence: true, showEnglish: false, darkMode: false,
            // Audio
            autoPlay: true,
            // Quiz
            quizChoices: 4,
            quizClickMode: 'double', // 'single' or 'double'
            quizAnswerAudio: true // Preview audio on click
        };
        
        const saved = localStorage.getItem('flashcard-settings');
        if (saved) this.config = { ...this.config, ...JSON.parse(saved) };
    }

    get() { return this.config; }
    setTarget(lang) { this.config.targetLang = lang; this.save(); }
    setOrigin(lang) { this.config.originLang = lang; this.save(); }
    set(key, value) { this.config[key] = value; this.save(); }
    save() { localStorage.setItem('flashcard-settings', JSON.stringify(this.config)); }
}

export const settingsService = new SettingsService();
