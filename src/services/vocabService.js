import { db } from './firebase'; // Local instance
import { ref, get, child } from 'firebase/database'; // Official SDK functions
import { settingsService } from './settingsService';

class VocabService {
    constructor() {
        this.vocabList = [];
        this.isLoaded = false;
    }

    async fetchData() {
        if (this.isLoaded) return;

        try {
            console.log("[Vocab] Fetching from Firebase...");
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, 'vocab'));

            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Convert object/array to standardized array
                const rawList = Array.isArray(data) ? data : Object.values(data);
                
                this.vocabList = rawList.map(item => ({
                    ...item,
                    id: item.id !== undefined ? parseInt(item.id, 10) : 0
                }));

                // Sort by ID
                this.vocabList.sort((a, b) => a.id - b.id);
                
                console.log(`[Vocab] Loaded ${this.vocabList.length} items.`);
            } else {
                console.warn("[Vocab] No data found.");
                this.vocabList = [];
            }
            this.isLoaded = true;

        } catch (error) {
            console.error("[Vocab] Error:", error);
            this.vocabList = [];
        }
    }

    getAll() {
        return this.vocabList;
    }
    
    findIndexById(id) {
        return this.vocabList.findIndex(item => item.id == id);
    }

    getRandomIndex() {
        if (this.vocabList.length === 0) return -1;
        return Math.floor(Math.random() * this.vocabList.length);
    }

    getFlashcardData() {
        const { targetLang, originLang } = settingsService.get();
        
        return this.vocabList.map(item => {
            const mainText = item[targetLang] || '...';
            let subText = '', extraText = '';

            if (targetLang === 'ja') {
                extraText = item.ja_furi || ''; 
                subText = item.ja_roma || '';
            } else if (['zh', 'ko', 'ru'].includes(targetLang)) {
                if(targetLang === 'zh') subText = item.zh_pin || '';
                if(targetLang === 'ko') subText = item.ko_roma || '';
                if(targetLang === 'ru') subText = item.ru_tr || '';
            }
            
            const type = (targetLang === 'ja') ? 'JAPANESE' : 
                         (['zh', 'ko', 'ru'].includes(targetLang)) ? 'NON_LATIN' : 'WESTERN';

            const definition = item[originLang] || item['en'] || 'Definition unavailable';
            const sentenceTarget = item[targetLang + '_ex'] || '';
            const sentenceOrigin = item[originLang + '_ex'] || '';

            return {
                id: item.id,
                type: type,
                front: { main: mainText, sub: subText, extra: extraText },
                back: { definition: definition, sentenceTarget: sentenceTarget, sentenceOrigin: sentenceOrigin }
            };
        });
    }
}

export const vocabService = new VocabService();
