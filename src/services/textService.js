import { settingsService } from './settingsService';

class TextService {
    tokenizeJapanese(text) {
        if (!text) return [];
        
        // "Poor Man's Tokenizer" - Split on script boundaries
        // 1. Punctuation/Space (Keep delimiters)
        // 2. Switch between Kanji/Kana/Latin/Digit
        
        // Replace punctuation with spaced versions to force split later
        let processed = text.replace(/([。、！？\s]+)/g, ' $1 ');
        
        // Regex lookbehinds/lookaheads to split between different script blocks
        // Kanji: \u4E00-\u9FAF
        // Hiragana: \u3040-\u309F
        // Katakana: \u30A0-\u30FF
        
        // Insert spaces between script changes if no space exists
        // Kanji <-> Kana
        processed = processed.replace(/([\u4E00-\u9FAF])([\u3040-\u309F\u30A0-\u30FF])/g, '$1 $2');
        processed = processed.replace(/([\u3040-\u309F\u30A0-\u30FF])([\u4E00-\u9FAF])/g, '$1 $2');
        
        // Kana <-> Latin/Num
        processed = processed.replace(/([\u3000-\u30FF\u4E00-\u9FAF])([a-zA-Z0-9])/g, '$1 $2');
        processed = processed.replace(/([a-zA-Z0-9])([\u3000-\u30FF\u4E00-\u9FAF])/g, '$1 $2');

        return processed.split(/\s+/).filter(t => t.trim().length > 0);
    }

    // Auto-fit text logic
    fitText(el) {
        if (!el || !el.parentElement) return;

        el.style.fontSize = '';
        el.style.lineHeight = '1.1'; // Tighter line height for bigger text
        el.style.whiteSpace = 'normal';
        
        const parent = el.parentElement;
        // Account for parent padding
        const style = window.getComputedStyle(parent);
        const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        
        const parentW = parent.clientWidth - padX;
        const parentH = parent.clientHeight - padY;
        
        if (parentW <= 0 || parentH <= 0) return;

        let min = 10;
        let max = 200; // Allow it to go quite big
        
        let best = min;
        let low = min;
        let high = max;
        let iterations = 0;

        while (low <= high && iterations < 15) {
            const mid = Math.floor((low + high) / 2);
            el.style.fontSize = `${mid}px`;
            
            const scrollW = el.scrollWidth;
            const scrollH = el.scrollHeight;

            if (scrollW <= parentW && scrollH <= parentH) {
                best = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
            iterations++;
        }

        // Apply slight safety margin
        el.style.fontSize = `${Math.max(best - 1, min)}px`;
    }

    smartWrap(text) {
        if (!text) return "";
        return text;
    }
}

export const textService = new TextService();
