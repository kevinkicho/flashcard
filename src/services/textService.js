export const textService = {
    // 1. MAXIMIZE TEXT SIZE (No Wrap)
    fitText(element) {
        if (!element) return;
        
        // Force single line
        element.style.whiteSpace = 'nowrap';
        element.style.display = 'inline-block';
        element.style.width = 'auto'; // Allow it to expand to measure
        
        const parent = element.parentElement;
        const maxWidth = parent.clientWidth;
        const maxHeight = parent.clientHeight;

        let min = 10;
        let max = 200; // Start huge
        let optimal = min;

        // Binary Search for best fit
        while (min <= max) {
            const current = Math.floor((min + max) / 2);
            element.style.fontSize = `${current}px`;
            
            // Measure actual dimensions
            const width = element.scrollWidth;
            const height = element.scrollHeight;

            if (width <= maxWidth && height <= maxHeight) {
                optimal = current;
                min = current + 1;
            } else {
                max = current - 1;
            }
        }
        
        // Apply final size (slightly reduced for padding safety)
        element.style.fontSize = `${optimal - 4}px`;
    },

    // 2. SMART WRAPPING
    formatSentence(text, lang) {
        if (!text) return '';
        if (lang === 'ja') {
            return text
                .replace(/([、。！？])/g, '$1<wbr>')
                .replace(/(て|と|が|は|を|に|で)(?![、。])/g, '$1<wbr>');
        }
        if (lang === 'zh') {
            return `<span style="word-break: break-all;">${text}</span>`;
        }
        return text;
    }
};
