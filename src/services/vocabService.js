// Import the large JSON file directly
import dbData from '../data/export_rtdb_121725.json';

class VocabService {
    constructor() {
        // Access the 'vocab' array from the JSON object
        this.vocabList = dbData.vocab || [];
    }

    // Get all vocabulary items
    getAll() {
        return this.vocabList;
    }

    // Get a specific item by ID
    getById(id) {
        return this.vocabList.find(item => item.id === id);
    }

    // Convert the database format to the simpler format our Card component expects
    // This allows us to switch languages easily in the future
    formatForFlashcard(item) {
        if (!item) return null;

        return {
            id: item.id,
            // Main Display (Japanese)
            japanese: item.ja || '',
            reading: item.ja_furi || item.ja_roma || '', // Fallback to Romaji if Furigana missing
            
            // Back Display (English)
            english: item.en || '',
            
            // Sentences
            sentenceJp: item.ja_ex || '',
            sentenceEn: item.en_ex || '',

            // Extra Metadata (Useful for future expansions)
            partOfSpeech: item.pos || '', 
            audio: item.audio || null
        };
    }

    // Get formatted list for the app
    getFlashcardData() {
        return this.vocabList.map(item => this.formatForFlashcard(item));
    }
}

// Export a single instance (Singleton pattern)
export const vocabService = new VocabService();
