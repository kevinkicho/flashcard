import { settingsService } from './settingsService';

class TextService {
    tokenizeJapanese(text) {
        if (!text) return [];
        
        // "Poor Man's Tokenizer" - Split on script boundaries
        let processed = text.replace(/([。、！？\s]+)/g, ' $1 ');
        
        // Kanji <-> Kana
        processed = processed.replace(/([\u4E00-\u9FAF])([\u3040-\u309F\u30A0-\u30FF])/g, '$1 $2');
        processed = processed.replace(/([\u3040-\u309F\u30A0-\u30FF])([\u4E00-\u9FAF])/g, '$1 $2');
        
        // Kana <-> Latin/Num
        processed = processed.replace(/([\u3000-\u30FF\u4E00-\u9FAF])([a-zA-Z0-9])/g, '$1 $2');
        processed = processed.replace(/([a-zA-Z0-9])([\u3000-\u30FF\u4E00-\u9FAF])/g, '$1 $2');

        return processed.split(/\s+/).filter(t => t.trim().length > 0);
    }

    _calculateBestFit(el, min, max) {
        if (!el || !el.parentElement) return min;

        const parent = el.parentElement;
        const style = window.getComputedStyle(parent);
        const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        
        const parentW = parent.clientWidth - padX;
        const parentH = parent.clientHeight - padY;
        
        if (parentW <= 0 || parentH <= 0) return min;

        const originalSize = el.style.fontSize;
        const originalLineHeight = el.style.lineHeight;
        const originalWhiteSpace = el.style.whiteSpace;

        el.style.whiteSpace = 'normal';
        el.style.lineHeight = '1.1';
        
        let best = min;
        let low = min;
        let high = max;
        let iterations = 0;

        while (low <= high && iterations < 15) {
            const mid = Math.floor((low + high) / 2);
            el.style.fontSize = `${mid}px`;
            
            if (el.scrollWidth <= parentW && el.scrollHeight <= parentH) {
                best = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
            iterations++;
        }

        el.style.fontSize = originalSize;
        el.style.lineHeight = originalLineHeight;
        el.style.whiteSpace = originalWhiteSpace;

        return Math.max(best - 1, min);
    }

    fitText(el, min = 12, max = 200) {
        if (!el) return; // Safety Check
        const size = this._calculateBestFit(el, min, max);
        el.style.fontSize = `${size}px`;
        el.style.lineHeight = '1.1';
        el.style.whiteSpace = 'normal';
    }

    fitGroup(elements, min = 12, max = 32) {
        if (!elements || elements.length === 0) return;

        let minSizeFound = max;

        elements.forEach(el => {
            const bestForEl = this._calculateBestFit(el, min, max);
            if (bestForEl < minSizeFound) {
                minSizeFound = bestForEl;
            }
        });

        elements.forEach(el => {
            el.style.fontSize = `${minSizeFound}px`;
            el.style.lineHeight = '1.1';
            el.style.whiteSpace = 'normal';
        });
    }

    smartWrap(text) {
        if (!text) return "";
        return text;
    }
}

export const textService = new TextService();
