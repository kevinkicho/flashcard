import dbData from '../data/export_rtdb_121725.json';
import { settingsService } from './settingsService';

class VocabService {
    constructor() {
        this.vocabList = dbData.vocab || [];
    }

    getAll() {
        return this.vocabList;
    }

    getFlashcardData() {
        const { targetLang, originLang } = settingsService.get();
        
        return this.vocabList.map(item => {
            // --- FRONT CARD LOGIC ---
            // 1. Main Word (The Target Language)
            const mainText = item[targetLang] || '...';
            
            // 2. Sub Text (Romanization/Pinyin) - Only for specific languages
            let subText = '';
            let extraText = ''; // For Japanese Furigana

            if (targetLang === 'ja') {
                extraText = item.ja_furi || ''; 
                subText = item.ja_roma || '';
            } else if (targetLang === 'zh') {
                subText = item.zh_pin || item.zh_pinyin || '';
            } else if (targetLang === 'ko') {
                subText = item.ko_roma || item.ko_romaji || '';
            } else if (targetLang === 'ru') {
                subText = item.ru_tr || item.ru_translit || '';
            }
            
            // Determine type for styling
            const type = (targetLang === 'ja') ? 'JAPANESE' : 
                         (['zh', 'ko', 'ru'].includes(targetLang)) ? 'NON_LATIN' : 'WESTERN';

            // --- BACK CARD LOGIC ---
            // Definition in the User's Native Language (Origin)
            const definition = item[originLang] || item['en'] || 'Definition unavailable';
            
            // Example Sentences
            const sentenceTarget = item[targetLang + '_ex'] || '';
            const sentenceOrigin = item[originLang + '_ex'] || '';

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
                    sentenceOrigin: sentenceOrigin
                }
            };
        });
    }
}

export const vocabService = new VocabService();
