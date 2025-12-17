export const textService = {
    fitText(element) {
        if (!element) return;
        
        // 1. Reset to minimum to ensure container isn't stretched by old large text
        element.style.fontSize = '10px';
        element.style.whiteSpace = 'nowrap';
        element.style.display = 'inline-block';
        element.style.width = 'auto'; 
        
        // 2. Get constraints
        const parent = element.parentElement;
        // Use simpler dimensions to avoid padding confusion
        const maxWidth = parent.offsetWidth - 20; // Safety padding
        const maxHeight = parent.offsetHeight - 10;

        let min = 10;
        let max = 150; // Cap max size reasonable for UI
        let optimal = min;

        // 3. Binary Search
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
        
        // 4. Apply Final
        element.style.fontSize = `${optimal}px`;
    },

    formatSentence(text, lang) {
        if (!text) return '';
        if (lang === 'ja') return text.replace(/([、。！？])/g, '$1<wbr>').replace(/(て|と|が|は|を|に|で)(?![、。])/g, '$1<wbr>');
        if (lang === 'zh') return `<span style="word-break: break-all;">${text}</span>`;
        return text;
    }
};
