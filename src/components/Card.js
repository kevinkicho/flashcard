import { settingsService } from '../services/settingsService';
import { textService } from '../services/textService';

export function createCardDOM(data) {
    const settings = settingsService.get();
    
    // --- DATA PREP ---
    // If showEnglish is on AND we aren't already looking at English, show it.
    const showEng = settings.showEnglish && settings.originLang !== 'en';
    const englishDef = showEng && data.back.englishDef ? `<span class="block mt-2 text-xl text-indigo-400 dark:text-indigo-300 font-medium opacity-80">${data.back.englishDef}</span>` : '';
    const englishSent = showEng && data.back.englishSent ? `<div class="mt-2 text-indigo-500 dark:text-indigo-400 font-medium">${data.back.englishSent}</div>` : '';

    const scene = document.createElement('div');
    scene.className = 'flashcard-scene w-[90vw] h-full max-h-[65vh] md:w-[450px] md:h-[600px] mx-auto relative z-10';

    const inner = document.createElement('div');
    inner.className = 'flashcard-inner';

    // --- FRONT ---
    const showReading = settings.showReading && (data.front.extra || data.front.sub);
    const vocabHTML = settings.showVocab ? `
        <div class="flex-grow w-full flex items-center justify-center overflow-hidden px-4">
            <span class="font-black text-gray-800 dark:text-white leading-none select-none" 
                  data-fit="true">
                 ${data.front.main}
            </span>
        </div>
    ` : '';

    const frontContent = `
        <div class="flex flex-col items-center justify-center h-full py-8 gap-4">
            ${showReading && data.front.extra ? `<span class="text-2xl text-gray-400 dark:text-gray-500 font-medium">${data.front.extra}</span>` : ''}
            ${vocabHTML}
            ${showReading && data.front.sub ? `<span class="text-lg text-indigo-500 dark:text-indigo-400 font-bold tracking-wider">${data.front.sub}</span>` : ''}
        </div>
    `;

    const front = document.createElement('div');
    front.className = 'card-face card-front bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl dark:shadow-none border border-gray-100 dark:border-gray-700 flex flex-col p-6';
    front.innerHTML = frontContent;

    // --- BACK ---
    const formattedSentence = textService.formatSentence(data.back.sentenceTarget, settings.targetLang);
    const sentenceHTML = settings.showSentence ? `
        <div class="w-full flex flex-col gap-2 mt-auto">
            <p class="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-relaxed text-center">
                ${formattedSentence}
            </p>
            <p class="text-lg text-gray-500 dark:text-gray-400 text-center italic">
                ${data.back.sentenceOrigin}
            </p>
            ${englishSent ? `<div class="text-center text-lg">${englishSent}</div>` : ''}
        </div>
    ` : '';

    const backContent = `
        <div class="h-full w-full flex flex-col items-center p-6 gap-6">
            
            <div class="flex-grow w-full flex flex-col items-center justify-center overflow-hidden">
                <div class="font-black text-indigo-600 dark:text-indigo-400 leading-none text-center"
                     data-fit="true">
                    ${data.back.definition}
                </div>
                ${englishDef}
            </div>

            ${sentenceHTML}
        </div>
    `;

    const back = document.createElement('div');
    back.className = 'card-face card-back bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl dark:shadow-none border border-gray-100 dark:border-gray-700 p-0 overflow-hidden';
    back.innerHTML = backContent;

    inner.appendChild(front);
    inner.appendChild(back);
    scene.appendChild(inner);

    // FLIP & AUDIO
    scene.addEventListener('click', () => {
        const isFlipped = inner.classList.toggle('is-flipped');
        if (isFlipped && settings.autoPlay) {
            setTimeout(() => {
                const cleanSentence = data.back.sentenceTarget.replace(/<[^>]*>?/gm, '');
                import('../services/audioService').then(({audioService}) => {
                    audioService.speak(cleanSentence, settings.targetLang);
                });
            }, 300);
        }
    });

    return scene;
}
