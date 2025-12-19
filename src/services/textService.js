import { settingsService } from './settingsService';

class TextService {
    constructor() {
        this.observer = new ResizeObserver(entries => {
            window.requestAnimationFrame(() => {
                for (let entry of entries) {
                    if (entry.target._fitText) {
                        this.fitText(entry.target);
                    }
                }
            });
        });
    }

    smartWrap(text) {
        if (!text) return "";
        const settings = settingsService.get();
        // Insert <wbr> after punctuation to allow breaking there
        // Also handling CJK punctuation specifically
        return text
            .replace(/([、。，．！？])/g, '$1<wbr>') 
            .replace(/(failed|error)/gi, '$1')      
            .replace(/_/g, '_<wbr>');               
    }

    /**
     * Advanced Tokenizer for Japanese.
     * Uses Intl.Segmenter and then combines particles with previous words.
     */
    tokenizeJapanese(text) {
        if (!text) return [];
        if (text.includes(' ')) return text.split(' ').filter(t => t.trim().length > 0);

        if (typeof Intl !== 'undefined' && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });
            const segments = [...segmenter.segment(text)].map(s => s.segment);
            
            // Post-Processing: Combine particles (ha, ga, no, wo, ni, etc.) with previous word
            // This prevents single hiragana blocks which are annoying in games.
            const combined = [];
            const particles = ['は', 'が', 'の', 'を', 'に', 'へ', 'と', 'で', 'や', 'も', 'か'];
            
            for (let i = 0; i < segments.length; i++) {
                const current = segments[i];
                const prev = combined.length > 0 ? combined[combined.length - 1] : null;

                // If current is a particle and prev exists, merge
                if (prev && particles.includes(current) && current.length === 1) {
                    combined[combined.length - 1] = prev + current;
                } else if (current.trim().length > 0) {
                    combined.push(current);
                }
            }
            return combined;
        }

        return Array.from(text);
    }

    fitText(el) {
        if (!el) return;
        
        if (!el._fitText) {
            el._fitText = true;
            this.observer.observe(el);
        }

        const settings = settingsService.get();
        const parent = el.parentElement;
        if (!parent) return;

        // 1. Apply Styles
        el.style.fontFamily = this.getFontFamily(settings.fontFamily);
        el.style.fontWeight = this.getFontWeight(settings.fontWeight);
        el.style.lineHeight = '1.3';
        
        // 2. Determine Mode
        const allowWrap = el.getAttribute('data-wrap') === 'true';

        if (allowWrap) {
            el.style.whiteSpace = 'normal';
            el.style.wordBreak = 'break-word';
        } else {
            el.style.whiteSpace = 'nowrap';
        }

        // 3. Size Limits (Distinct Steps)
        let min = 10;
        let max = 90; // Default max (for large)
        
        if (settings.fontSize === 'small') max = 24;       // Clearly small
        else if (settings.fontSize === 'medium') max = 48; // Clearly medium
        else if (settings.fontSize === 'large') max = 120; // Huge

        // 4. Binary Search
        let low = min;
        let high = max;
        let best = min;

        el.style.fontSize = `${high}px`; // Reset to max to start

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            el.style.fontSize = `${mid}px`;

            const scrollW = el.scrollWidth;
            const scrollH = el.scrollHeight;
            const clientW = parent.clientWidth;
            const clientH = parent.clientHeight;

            let fits = false;

            if (allowWrap) {
                // Tolerance of 2px
                fits = (scrollH <= clientH + 2);
            } else {
                fits = (scrollW <= clientW + 2);
            }

            if (fits) {
                best = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        el.style.fontSize = `${best}px`;
    }

    getFontFamily(key) {
        // CJK-Friendly Font Stacks
        const fonts = {
            'notosans': "'Noto Sans JP', 'Noto Sans SC', 'Noto Sans KR', sans-serif",
            'notoserif': "'Noto Serif JP', 'Noto Serif SC', 'Noto Serif KR', serif",
            'mplus': "'M PLUS Rounded 1c', sans-serif",
            'sawarabi': "'Sawarabi Mincho', serif",
            'nanumgothic': "'Nanum Gothic', sans-serif",
            'nanummyeongjo': "'Nanum Myeongjo', serif",
            'zcool': "'ZCOOL XiaoWei', serif",
            'merriweather': "'Merriweather', 'Noto Serif JP', serif", // Fallback for CJK
            'roboto': "'Roboto', 'Noto Sans JP', sans-serif",
            'system': "system-ui, -apple-system, sans-serif"
        };
        return fonts[key] || fonts['notosans'];
    }

    getFontWeight(key) {
        const weights = {
            'light': '300',
            'normal': '400',
            'bold': '700',
            'thick': '900'
        };
        return weights[key] || '700';
    }
}

export const textService = new TextService();
