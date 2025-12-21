export const textService = {
    // Splits Japanese/Chinese text safely for wrapping if needed, though we mostly use nowrap now
    smartWrap(text) {
        if (!text) return '';
        // If it contains Japanese/Chinese characters, allow breaks
        if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text)) {
            return text.split('').map(char => 
                `<span class="inline-block">${char}</span>`
            ).join('');
        }
        return text;
    },

    tokenizeJapanese(text) {
        // Simple tokenizer for Sentence game
        return text.split('').map((c, i) => ({
            id: i,
            surface_form: c,
            pos: 'noun' // dummy pos
        }));
    },

    // The core function used by all games to resize text
    fitText(element, minSize = 12, maxSize = 60, isGroup = false) {
        if (!element) return;

        // 1. Reset to max size to start calculation
        element.style.fontSize = `${maxSize}px`;
        element.style.lineHeight = '1.2';
        element.style.whiteSpace = 'nowrap'; // Enforce no-wrap
        
        let currentSize = maxSize;
        const parent = element.parentElement;
        
        if (!parent) return;

        // 2. Reduce size until it fits within the parent container
        // We check if content width (scrollWidth) > container width (clientWidth)
        while (
            (element.scrollWidth > parent.clientWidth || element.scrollHeight > parent.clientHeight) && 
            currentSize > minSize
        ) {
            currentSize--;
            element.style.fontSize = `${currentSize}px`;
        }

        // 3. If it's a group (like Flashcards front/back), we might want to sync sizes, 
        // but for now, individual fitting is preferred by your request.
        // This parameter is kept for backward compatibility with the flashcard calls.
    }
};
