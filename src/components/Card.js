import { settingsService } from '../services/settingsService';
import { textService } from '../services/textService';
import { audioService } from '../services/audioService';

export function createCardDOM(data) {
    const settings = settingsService.get();
    
    // --- DATA PREP ---
    const showEng = settings.showEnglish && settings.originLang !== 'en';
    // English extras style
    const englishDef = showEng && data.back.englishDef ? `<span class="block mt-2 text-lg text-indigo-400 dark:text-dark-accent font-medium opacity-90">${data.back.englishDef}</span>` : '';
    const englishSent = showEng && data.back.englishSent ? `<div class="mt-2 text-indigo-500 dark:text-dark-accent font-medium text-sm">${data.back.englishSent}</div>` : '';

    const scene = document.createElement('div');
    // Fits available space in the view
    scene.className = 'flashcard-scene w-full h-full max-w-md mx-auto relative z-10';

    const inner = document.createElement('div');
    inner.className = 'flashcard-inner';

    // --- FRONT CONTENT ---
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
            ${showReading && data.front.sub ? `<span class="text-lg text-indigo-500 dark:text-dark-primary font-bold tracking-wider">${data.front.sub}</span>` : ''}
        </div>
    `;

    const front = document.createElement('div');
    // Dark mode: bg-dark-card, border-dark-border
    front.className = 'card-face card-front bg-white dark:bg-dark-card rounded-[2.5rem] shadow-2xl dark:shadow-none border border-gray-100 dark:border-dark-border flex flex-col p-6 transition-colors duration-300';
    front.innerHTML = `
        <div class="w-full flex justify-between items-center opacity-30 mb-2 dark:text-gray-400">
            <span class="text-[10px] font-black uppercase tracking-widest">Question</span>
            <span class="text-[10px] font-black uppercase tracking-widest">Tap to Flip</span>
        </div>
        <div class="flex-grow w-full relative">
            ${frontContent}
        </div>
    `;

    // --- BACK CONTENT ---
    const formattedSentence = textService.formatSentence(data.back.sentenceTarget, settings.targetLang);
    const sentenceHTML = settings.showSentence ? `
        <div class="w-full flex flex-col gap-2 mt-auto">
            <p class="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-relaxed text-center">
                ${formattedSentence}
            </p>
            <p class="text-lg text-gray-500 dark:text-gray-400 text-center italic">
                ${data.back.sentenceOrigin}
            </p>
            ${englishSent}
        </div>
    ` : '';

    const backContent = `
        <div class="h-full w-full flex flex-col items-center p-6 gap-6">
            
            <div class="flex-grow w-full flex flex-col items-center justify-center overflow-hidden">
                <div class="font-black text-indigo-600 dark:text-dark-primary leading-none text-center"
                     data-fit="true">
                    ${data.back.definition}
                </div>
                ${englishDef}
            </div>

            ${sentenceHTML}
        </div>
    `;

    const back = document.createElement('div');
    back.className = 'card-face card-back bg-white dark:bg-dark-card rounded-[2.5rem] shadow-2xl dark:shadow-none border border-gray-100 dark:border-dark-border p-0 overflow-hidden transition-colors duration-300';
    back.innerHTML = backContent;

    inner.appendChild(front);
    inner.appendChild(back);
    scene.appendChild(inner);

    // FLIP & AUDIO LOGIC
    scene.addEventListener('click', () => {
        const isFlipped = inner.classList.toggle('is-flipped');
        
        // Stop any current audio immediately upon interaction
        audioService.stop();

        if (settings.autoPlay) {
            setTimeout(() => {
                if (isFlipped) {
                    // Back: Speak Sentence
                    const cleanSentence = data.back.sentenceTarget.replace(/<[^>]*>?/gm, '');
                    audioService.speak(cleanSentence, settings.targetLang);
                } else {
                    // Front: Speak Vocab
                    audioService.speak(data.front.main, settings.targetLang);
                }
            }, 300); // Wait for flip
        }
    });

    return scene;
}
