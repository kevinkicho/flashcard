import dbData from '../data/export_rtdb_121725.json';
import { settingsService } from './settingsService';

class VocabService {
    constructor() {
        this.vocabList = dbData.vocab || [];
    }

    getAll() {
        return this.vocabList;
    }
    
    // Find array index by Vocab ID (e.g. ID 250 -> Index 249)
    findIndexById(id) {
        // Loose equality (==) allows string '250' to match number 250
        return this.vocabList.findIndex(item => item.id == id);
    }

    // Get a random index from the list
    getRandomIndex() {
        return Math.floor(Math.random() * this.vocabList.length);
    }

    getFlashcardData() {
        const { targetLang, originLang } = settingsService.get();
        
        return this.vocabList.map(item => {
            // FRONT CARD LOGIC
            const mainText = item[targetLang] || '...';
            let subText = '', extraText = '';

            // Handle specific language features
            if (targetLang === 'ja') {
                extraText = item.ja_furi || ''; 
                subText = item.ja_roma || '';
            } else if (['zh', 'ko', 'ru'].includes(targetLang)) {
                if(targetLang === 'zh') subText = item.zh_pin || '';
                if(targetLang === 'ko') subText = item.ko_roma || '';
                if(targetLang === 'ru') subText = item.ru_tr || '';
            }
            
            // Determine visual type
            const type = (targetLang === 'ja') ? 'JAPANESE' : 
                         (['zh', 'ko', 'ru'].includes(targetLang)) ? 'NON_LATIN' : 'WESTERN';

            // BACK CARD LOGIC
            // Definition in origin language, fallback to English
            const definition = item[originLang] || item['en'] || 'Definition unavailable';
            const sentenceTarget = item[targetLang + '_ex'] || '';
            const sentenceOrigin = item[originLang + '_ex'] || '';

            // ENGLISH EXTRAS (For "Show English" feature)
            const englishDef = item['en'] || '';
            const englishSent = item['en_ex'] || '';

            return {
                id: item.id,
                type: type,
                front: { 
                    main: mainText, 
                    sub: subText, 
                    extra: extraText 
                },
                back: { 
                    definition: definition, 
                    sentenceTarget: sentenceTarget, 
                    sentenceOrigin: sentenceOrigin,
                    englishDef: englishDef,
                    englishSent: englishSent
                }
            };
        });
    }
}

export const vocabService = new VocabService();
