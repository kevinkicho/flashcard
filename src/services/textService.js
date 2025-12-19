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
        return text
            .replace(/([、。，．！？])/g, '$1<wbr>') 
            .replace(/(failed|error)/gi, '$1')      
            .replace(/_/g, '_<wbr>');               
    }

    /**
     * Advanced Japanese Tokenizer
     * Implements specific grammar/chunking rules:
     * 1. Preserves target vocab (handling middle dots).
     * 2. Merges particles (wa, ga, no, etc.) into preceding chunks.
     * 3. Merges Kanji runs, pronouns, honorifics, etc.
     */
    tokenizeJapanese(text, targetVocab, useExperimentalFilter = false) {
        if (!text) return [];

        // 0. Pre-process Vocab: Handle variations like "·" in dictionary forms
        // e.g. "スミス·さん" -> "スミスさん"
        const cleanVocab = targetVocab ? targetVocab.replace(/[·・]/g, '') : '';
        const vocabVariants = [targetVocab, cleanVocab].filter(v => v);

        // --- STEP 1: INITIAL SPLIT BY VOCAB ---
        // We identify the vocab in the sentence first to keep it as a "locked" chunk.
        // We split the rest into individual characters for granular processing.
        
        let chunks = [];
        let remaining = text;
        
        // Find the vocab in the text (simple implementation, picks first occurrence)
        let foundVocab = false;
        for (let v of vocabVariants) {
            const idx = remaining.indexOf(v);
            if (idx !== -1) {
                const pre = remaining.substring(0, idx);
                const match = remaining.substring(idx, idx + v.length);
                const post = remaining.substring(idx + v.length);
                
                // Split pre and post into single chars
                chunks = [...Array.from(pre), match, ...Array.from(post)];
                foundVocab = true;
                break;
            }
        }
        
        if (!foundVocab) {
            chunks = Array.from(text);
        }

        // If experiment mode is OFF, just return this simple split (plus spaces check)
        if (!useExperimentalFilter) {
             if (text.includes(' ')) return text.split(' ').filter(t => t.trim().length > 0);
             return chunks;
        }

        // --- STEP 2: APPLY GRAMMAR RULES (The "Experiment") ---
        // We iterate and merge chunks. Since we need to merge left-to-right based on conditions,
        // we'll use a pass-based approach.

        // Helper regexes
        const isKanji = (c) => /^[\u4E00-\u9FAF]+$/.test(c);
        const isHiragana = (c) => /^[\u3040-\u309F]+$/.test(c);
        const isKatakana = (c) => /^[\u30A0-\u30FF]+$/.test(c);

        // RULE DATA
        const particlesSet1 = new Set(['が', 'の', 'を', 'に', 'へ', 'と', 'で', 'から', 'より']);
        const particlesSet2 = new Set(['の', 'に', 'と', 'や', 'やら', 'か', 'なり', 'だの']);
        const particlesSet3 = new Set(['ばかり','まで','だけ','ほど','くらい','など','なり','やら','は','って','も','こそ','でも','しか','さえ','だに']);
        const particlesSet4 = new Set(['ば','や','が','て','のに','ので','から','ところが','けれども']);
        
        const allParticles = new Set([
            ...particlesSet1, ...particlesSet2, ...particlesSet3, ...particlesSet4
        ]);

        const pronouns = new Set(['私', 'わたし', '我々', 'われわれ', '私達', '私たち', 'わたしたち', '君', 'きみ', '彼', 'かれ', '彼ら', 'かれら', '彼女', 'かのじょ', '皆', 'みんな']);
        const honorifics = new Set(['さん', 'ちゃん', '様', 'さま', '氏', '殿', 'どの']);
        const smallKana = new Set(['ゃ','ゅ','ょ']);

        // Wrapper for chunk merging
        // We use a linked list approach or repeatedly modify the array. 
        // Array modification is easier to reason about for these specific sequential rules.
        
        const mergeNextIf = (conditionFn) => {
            let i = 0;
            while (i < chunks.length - 1) {
                const curr = chunks[i];
                const next = chunks[i+1];
                if (conditionFn(curr, next, i)) {
                    chunks[i] = curr + next;
                    chunks.splice(i+1, 1);
                    // Don't increment i, check this new chunk against the *next* one again?
                    // Usually Japanese agglutinates forward.
                    // But for safety in these specific rules (absorbing ONE element), we usually move on.
                    // However, particles can stack (e.g. て + い + た). 
                    // Based on "absorb adjacent", we'll retry the same index to see if it absorbs the *new* next one.
                    continue; 
                }
                i++;
            }
        };

        const mergePrevIf = (conditionFn) => {
             let i = 1;
             while (i < chunks.length) {
                 const prev = chunks[i-1];
                 const curr = chunks[i];
                 if (conditionFn(prev, curr)) {
                     chunks[i-1] = prev + curr;
                     chunks.splice(i, 1);
                     // Stay at current index (which is now the next element) to check against the merged block?
                     // No, we merged into prev.
                     continue; 
                 }
                 i++;
             }
        };

        // RULE 3-1: Vocab absorbs particles immediately after
        // AND RULE 3-3: Pronouns absorb particles immediately after
        // Logic: specific chunks + specific particles -> merge.
        // Also generalized: "if there is Japanese articles... happening immediately after that chunk"
        mergeNextIf((curr, next) => {
            // Check if curr is the Target Vocab OR one of the Pronouns
            const isTarget = vocabVariants.includes(curr) || pronouns.has(curr);
            // Check if next is a particle
            const isPart = allParticles.has(next);
            return isTarget && isPart;
        });

        // RULE 3-2: Kanji blocks merge until hiragana is met
        // "kanjis that still remain as single chunk... should absorb adjacent ones... until hiragana"
        // This implies grouping strictly consecutive Kanji.
        mergeNextIf((curr, next) => {
            // If both are Kanij blocks, merge them.
            // If curr is Kanji and next is NOT Hiragana (and not the end?), merge?
            // "until hiragana is met" usually means Kanji+Kanji=Merge. Kanji+Katakana=Merge?
            // Let's stick to strict Kanji merging for "Kanji compounds".
            return isKanji(curr) && isKanji(next);
        });

        // RULE 3-4: Honorifics (San/Chan/etc)
        // "from the remaining chunks, these form single chunk... if they have block that has kanji blocks before, merge"
        // This is a "Merge Prev" rule.
        mergePrevIf((prev, curr) => {
            if (honorifics.has(curr)) {
                // Merge if it exists alone (implied "form single chunk")
                // AND merge with previous if previous is Kanji.
                if (isKanji(prev)) return true;
                // Even if prev isn't Kanji, honorifics attach to names (Kana names too).
                // But prompt specific: "if they have... kanji blocks... merge".
                // Let's assume they attach to whatever name precedes them.
                return true; 
            }
            return false;
        });

        // RULE 3-5: Kanji + Single Hiragana
        // "any remaining single character kanji blocks: if they have a single character hiragana block immediately after"
        mergeNextIf((curr, next) => {
            // Must be Single char Kanji and Single char Hiragana? 
            // Or just blocks? "single character kanji blocks" implies length 1.
            const isSingleKanji = isKanji(curr) && [...curr].length === 1;
            const isSingleHira = isHiragana(next) && [...next].length === 1;
            return isSingleKanji && isSingleHira;
        });

        // RULE 3-7: Small Kana (ya, yu, yo) form blocks with before and after.
        // This effectively glues the small kana to the preceding char (kyu, sha, etc).
        // Merge Prev first
        mergePrevIf((prev, curr) => smallKana.has(curr));
        // Then Merge Next (if the rule implies wrapping? Usually small kana attaches to previous).
        // "form blocks with block before it and after it" -> Pre + Small + Post?
        // Let's do Prev first, then if the merged block ends in small kana, merge next?
        // Usually small kana is part of the previous syllable. Merging "after" might be too aggressive (e.g. Shya + A).
        // But following instructions:
        mergeNextIf((curr, next) => {
            const lastChar = curr.slice(-1);
            return smallKana.has(lastChar);
        });

        // Punctuation absorption (Prompt mentions 、and 。)
        // "、and 。gets absorbed to the word chunk prior to it."
        mergePrevIf((prev, curr) => {
            return (curr === '、' || curr === '。');
        });

        return chunks;
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

        el.style.fontFamily = this.getFontFamily(settings.fontFamily);
        el.style.fontWeight = this.getFontWeight(settings.fontWeight);
        el.style.lineHeight = '1.3';
        
        const allowWrap = el.getAttribute('data-wrap') === 'true';

        if (allowWrap) {
            el.style.whiteSpace = 'normal';
            // Use keep-all for CJK to prevent mid-word breaks if possible
            el.style.wordBreak = (settings.targetLang === 'ja' || settings.targetLang === 'zh') ? 'keep-all' : 'break-word';
            el.style.overflowWrap = 'break-word';
        } else {
            el.style.whiteSpace = 'nowrap';
        }

        let min = 10;
        let max = 90; 
        
        if (el.getAttribute('data-type') === 'hint') max = 32; 

        if (settings.fontSize === 'small') max = Math.min(max, 24);
        else if (settings.fontSize === 'medium') max = Math.min(max, 48);
        else if (settings.fontSize === 'large') max = 120; 

        let low = min;
        let high = max;
        let best = min;

        el.style.fontSize = `${high}px`; 

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            el.style.fontSize = `${mid}px`;

            const scrollW = el.scrollWidth;
            const scrollH = el.scrollHeight;
            const clientW = parent.clientWidth;
            const clientH = parent.clientHeight;

            let fits = false;

            if (allowWrap) {
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
        const fonts = {
            'notosans': "'Noto Sans JP', 'Noto Sans SC', 'Noto Sans KR', sans-serif",
            'notoserif': "'Noto Serif JP', 'Noto Serif SC', 'Noto Serif KR', serif",
            'mplus': "'M PLUS Rounded 1c', sans-serif",
            'sawarabi': "'Sawarabi Mincho', serif",
            'nanumgothic': "'Nanum Gothic', sans-serif",
            'nanummyeongjo': "'Nanum Myeongjo', serif",
            'zcool': "'ZCOOL XiaoWei', serif",
            'merriweather': "'Merriweather', 'Noto Serif JP', serif",
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
