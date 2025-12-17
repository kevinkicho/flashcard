import { settingsService } from '../services/settingsService';
import { textService } from '../services/textService';

export function createCardDOM(data) {
    const settings = settingsService.get();
    
    // --- DATA PREP ---
    const englishDef = (settings.showEnglish && settings.originLang !== 'en') ? ` / ${data.back.englishDef || ''}` : '';
    const englishSent = (settings.showEnglish && settings.originLang !== 'en') ? `<div class="mt-1 text-indigo-400">${data.back.englishSent || ''}</div>` : '';

    const scene = document.createElement('div');
    // Full width/height available in main container
    scene.className = 'flashcard-scene w-[90vw] h-full max-h-[65vh] md:w-[450px] md:h-[600px] mx-auto relative z-10';

    const inner = document.createElement('div');
    inner.className = 'flashcard-inner';

    // --- FRONT ---
    const showReading = settings.showReading && (data.front.extra || data.front.sub);
    const vocabHTML = settings.showVocab ? `
        <div class="flex-grow w-full flex items-center justify-center overflow-hidden px-4">
            <span class="font-black text-gray-800 leading-none select-none" 
                  data-fit="true" 
                  style="white-space: nowrap;">
                 ${data.front.main}
            </span>
        </div>
    ` : '';

    const frontContent = `
        <div class="flex flex-col items-center justify-center h-full py-8 gap-4">
            ${showReading && data.front.extra ? `<span class="text-2xl text-gray-400 font-medium">${data.front.extra}</span>` : ''}
            ${vocabHTML}
            ${showReading && data.front.sub ? `<span class="text-lg text-indigo-500 font-bold tracking-wider">${data.front.sub}</span>` : ''}
        </div>
    `;

    const front = document.createElement('div');
    front.className = 'card-face card-front bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-0 overflow-hidden';
    front.innerHTML = frontContent;

    // --- BACK (Grid Layout) ---
    // We use a CSS Grid that changes columns based on orientation/width
    const formattedSentence = textService.formatSentence(data.back.sentenceTarget, settings.targetLang);
    const sentenceHTML = settings.showSentence ? `
        <div class="flex flex-col gap-1">
            <p class="text-2xl font-bold text-gray-800 leading-relaxed">${formattedSentence}</p>
            <p class="text-base text-gray-500">${data.back.sentenceOrigin}${englishSent}</p>
        </div>
    ` : '';

    const backContent = `
        <div class="h-full w-full grid grid-rows-[auto_1fr] md:grid-rows-2 p-8 gap-8 text-center items-center justify-center">
            
            <div class="flex flex-col items-center justify-center border-b border-gray-100 pb-6 md:border-none md:pb-0">
                <h2 class="text-4xl font-black text-indigo-600 leading-tight">
                    ${data.back.definition}
                    <span class="text-xl font-medium text-indigo-300 block mt-2">${englishDef}</span>
                </h2>
            </div>

            <div class="flex items-center justify-center w-full">
                ${sentenceHTML}
            </div>
        </div>
    `;

    const back = document.createElement('div');
    back.className = 'card-face card-back bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-0 overflow-hidden';
    back.innerHTML = backContent;

    inner.appendChild(front);
    inner.appendChild(back);
    scene.appendChild(inner);

    // FLIP LOGIC & AUDIO TRIGGER
    scene.addEventListener('click', () => {
        const isFlipped = inner.classList.toggle('is-flipped');
        
        // Play Audio on Flip (Back Side = Sentence)
        if (isFlipped && settings.autoPlay) {
            // Wait slightly for animation
            setTimeout(() => {
                // Play Sentence
                // We use a regex to strip HTML tags from sentence for TTS
                const cleanSentence = data.back.sentenceTarget.replace(/<[^>]*>?/gm, '');
                import('../services/audioService').then(({audioService}) => {
                    audioService.speak(cleanSentence, settings.targetLang);
                });
            }, 300);
        }
    });

    return scene;
}
