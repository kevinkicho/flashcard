export const textService = {
    // 1. MAXIMIZE TEXT SIZE
    fitText(element) {
        if (!element) return;
        
        // Reset to minimum
        element.style.fontSize = '10px';
        element.style.whiteSpace = 'nowrap';
        element.style.display = 'inline-block';
        element.style.width = 'auto'; 
        
        const parent = element.parentElement;
        const maxWidth = parent.offsetWidth - 32; // More padding safety
        const maxHeight = parent.offsetHeight - 16;

        let min = 10;
        let max = 150;
        let optimal = min;

        // Binary Search
        while (min <= max) {
            const current = Math.floor((min + max) / 2);
            element.style.fontSize = `${current}px`;
            
            if (element.scrollWidth <= maxWidth && element.scrollHeight <= maxHeight) {
                optimal = current;
                min = current + 1;
            } else {
                max = current - 1;
            }
        }
        
        element.style.fontSize = `${optimal}px`;
    },

    // 2. SMART WRAPPING (Visual)
    formatSentence(text, lang) {
        if (!text) return '';
        if (lang === 'ja') return text.replace(/([、。！？])/g, '$1<wbr>').replace(/(て|と|が|は|を|に|で)(?![、。])/g, '$1<wbr>');
        if (lang === 'zh') return `<span style="word-break: break-all;">${text}</span>`;
        return text;
    },

    // 3. JAPANESE TOKENIZER (For Sentences Game)
    tokenizeJapanese(text) {
        // Particles and Suffixes that usually mark the END of a block
        // Particles: ha, ga, wo, ni, de, he, to, mo, kara, yori
        // Suffixes: sa, mi, saku, ru, eru, san, chan, kun, sama, tachi, ya, i, ge, rashii, masu, mashita, nai, tai
        const markers = [
            'は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'から', 'より', // Particles
            'です', 'ます', 'した', 'ない', 'たい', // Simple Endings
            'さん', 'ちゃん', 'くん', 'さま', 'たち', // Honorifics
            '、', '。', '！', '？' // Punctuation
        ];

        let chunks = [];
        let current = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            current += char;

            // Check if current string ends with any marker
            let matched = false;
            for (const marker of markers) {
                if (current.endsWith(marker)) {
                    chunks.push(current);
                    current = '';
                    matched = true;
                    break;
                }
            }
        }
        if (current) chunks.push(current);
        
        return chunks.filter(c => c.trim().length > 0);
    }
};
