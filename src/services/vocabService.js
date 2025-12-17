import dbData from '../data/export_rtdb_121725.json';
import { settingsService } from './settingsService';

class VocabService {
    constructor() {
        this.vocabList = dbData.vocab || [];
    }

    getAll() { return this.vocabList; }

    getFlashcardData() {
        const { targetLang, originLang } = settingsService.get();
        
        return this.vocabList.map(item => {
            // FRONT
            const mainText = item[targetLang] || '...';
            let subText = '', extraText = '';

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
            
            const type = (targetLang === 'ja') ? 'JAPANESE' : 
                         (['zh', 'ko', 'ru'].includes(targetLang)) ? 'NON_LATIN' : 'WESTERN';

            // BACK
            const definition = item[originLang] || item['en'] || 'Definition unavailable';
            const sentenceTarget = item[targetLang + '_ex'] || '';
            const sentenceOrigin = item[originLang + '_ex'] || '';

            // ENGLISH EXTRAS (For "Show English" feature)
            const englishDef = item['en'] || '';
            const englishSent = item['en_ex'] || '';

            return {
                id: item.id,
                type: type,
                front: { main: mainText, sub: subText, extra: extraText },
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
