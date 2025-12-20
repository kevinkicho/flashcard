import { settingsService } from './settingsService';

class TextService {
    // --- 1. FIT TEXT & FIT GROUP (UI LOGIC) ---

    _calculateBestFit(el, min, max) {
        if (!el || !el.parentElement) return min;

        const parent = el.parentElement;
        const style = window.getComputedStyle(parent);
        const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        
        // Available width/height for the text
        const parentW = parent.clientWidth - padX;
        const parentH = parent.clientHeight - padY;
        
        if (parentW <= 0 || parentH <= 0) return min;

        // Reset for measurement
        const originalSize = el.style.fontSize;
        
        // GLOBAL CHANGE: Enforce No Wrap as requested
        el.style.whiteSpace = 'nowrap';
        el.style.lineHeight = '1.1';
        el.style.display = 'inline-block';
        el.style.width = 'auto';
        
        let best = min;
        let low = min;
        let high = max;
        let iterations = 0;

        while (low <= high && iterations < 15) {
            const mid = Math.floor((low + high) / 2);
            el.style.fontSize = `${mid}px`;
            
            // Check if it fits
            if (el.scrollWidth <= parentW && el.scrollHeight <= parentH) {
                best = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
            iterations++;
        }

        el.style.fontSize = originalSize; // Restore
        return Math.max(best - 1, min);
    }

    /** Fit a single element */
    fitText(el, min = 10, max = 150) {
        if (!el) return;
        const size = this._calculateBestFit(el, min, max);
        el.style.fontSize = `${size}px`;
        el.style.lineHeight = '1.1';
        el.style.whiteSpace = 'nowrap'; // Enforce
    }

    /** Fit a group so they all have the SAME size */
    fitGroup(elements, min = 10, max = 48) {
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
            el.style.whiteSpace = 'nowrap'; // Enforce
        });
    }

    // --- 2. JAPANESE TOKENIZER ---
    parseVocabVariations(vocab) {
        if (!vocab) return [];
        let normalized = vocab.replace(/\[/g, '・').replace(/\]/g, '');
        normalized = normalized.replace(/·/g, '・'); 
        return normalized.split('・').map(v => v.trim()).filter(v => v.length > 0);
    }

    tokenizeJapanese(text, vocab = '', applyPostProcessing = true) {
        if (typeof Intl === 'undefined' || !Intl.Segmenter) {
            return text.split('').filter(s => s.trim().length > 0);
        }

        const segmenter = new Intl.Segmenter('ja-JP', { granularity: 'word' });
        let chunks = Array.from(segmenter.segment(text))
                          .map(s => s.segment)
                          .filter(s => s.trim().length > 0);
        
        if (!applyPostProcessing) return chunks;
        return this.postProcessJapanese(chunks, vocab);
    }

    postProcessJapanese(chunks, vocab = '') {
        if (chunks.length === 0) return [];

        const smallKana = /^([っゃゅょャュョん])/;
        const punctuation = /^([、。？?！!])/; 
        const isAllKanji = /^[\u4e00-\u9faf]+$/;
        const startsHiragana = /^[\u3040-\u309f]/;
        const specialWords = ['とても', 'たくさんの'];
        const suffixes = [
            'さん', 'ちゃん', 'くん', 'さま', 'たち', '屋',
            'さ', 'み', 'さく', 'い', 'げ', 'らしい',
            'る', 'える', 'する', 'した', 'します', 'しました',
            'です', 'てすか', 'ですか', 'でした', 'だ', 'だろう', 'ろう',
            'ます', 'ました', 'ませ', 'ません',
            'ない', 'たい', 'て', 'いる', 'ある', 'れる', 'られる',
            'でき', 'できな', 'できない',
            'の', 'には', 'では', 'がら', 'から', 'より', 'にして', 
            'どころ', 'ですが', 'けど', 'けれど', 'のに', 'ので',
            'か', 'よ', 'ね', 'わ', 'ぜ', 'な', 'へ', 'に', 'が', 'で'
        ];

        let processed = [...chunks];
        let changed = true;

        while (changed) {
            changed = false;
            const nextPass = [];
            
            if (processed.length > 0) {
                nextPass.push(processed[0]);
                for (let i = 1; i < processed.length; i++) {
                    const prev = nextPass[nextPass.length - 1];
                    const curr = processed[i];
                    let merged = false;

                    if (smallKana.test(curr)) {
                        nextPass[nextPass.length - 1] = prev + curr;
                        merged = true;
                    } else if (specialWords.includes(prev + curr)) {
                        nextPass[nextPass.length - 1] = prev + curr;
                        merged = true;
                    } else {
                        const isSuffix = suffixes.some(s => curr === s || curr.startsWith(s));
                        if (isSuffix) {
                            nextPass[nextPass.length - 1] = prev + curr;
                            merged = true;
                        } else if (prev === 'お') {
                            nextPass[nextPass.length - 1] = prev + curr;
                            merged = true;
                        } else if (curr === 'は' || curr === 'を') {
                            nextPass[nextPass.length - 1] = prev + curr;
                            merged = true;
                        } else if (isAllKanji.test(prev) && startsHiragana.test(curr)) {
                            nextPass[nextPass.length - 1] = prev + curr;
                            merged = true;
                        }
                    }

                    if (merged) changed = true;
                    else nextPass.push(curr);
                }
            }
            processed = nextPass;
        }

        const punctPass = [];
        if (processed.length > 0) {
            punctPass.push(processed[0]);
            for (let i = 1; i < processed.length; i++) {
                const prev = punctPass[punctPass.length - 1];
                const curr = processed[i];
                if (punctuation.test(curr)) {
                    punctPass[punctPass.length - 1] = prev + curr;
                } else {
                    punctPass.push(curr);
                }
            }
            processed = punctPass;
        }

        return processed;
    }

    smartWrap(text) {
        return text || "";
    }
}

export const textService = new TextService();
