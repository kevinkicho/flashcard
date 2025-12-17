import dbData from '../data/export_rtdb_121725.json';

class DictionaryService {
    constructor() {
        // The first item in your dictionary array is null, so we filter it out
        this.dictionary = (dbData.dictionary || []).filter(item => item !== null);
    }

    // Search by Character (Simplified 's' or Traditional 't')
    searchByChar(char) {
        return this.dictionary.find(entry => entry.s === char || entry.t === char);
    }

    // Search by English meaning
    searchByMeaning(query) {
        const lowerQuery = query.toLowerCase();
        return this.dictionary.filter(entry => 
            entry.e && entry.e.toLowerCase().includes(lowerQuery)
        );
    }

    // Get details by ID
    getById(id) {
        return this.dictionary.find(entry => entry.id === id);
    }
}

export const dictionaryService = new DictionaryService();
