import { vocabService } from '../services/vocabService';
import { settingsService } from '../services/settingsService';
import { audioService } from '../services/audioService';
import { textService } from '../services/textService';
import { Card } from './Card';

export class FlashcardApp {
    constructor() {
        this.container = null;
        this.currentIndex = 0;
        this.isFlipped = false;
        this.cardComponent = new Card();
    }

    mount(elementId) {
        this.container = document.getElementById(elementId);
        this.render();
    }

    refresh() {
        this.render();
    }

    goto(id) {
        const idx = vocabService.findIndexById(id);
        if (idx !== -1) {
            this.currentIndex = idx;
            this.isFlipped = false;
            this.render();
        }
    }

    next() {
        const list = vocabService.getFlashcardData();
        if (!list.length) return;
        this.currentIndex = (this.currentIndex + 1) % list.length;
        this.isFlipped = false;
        this.render();
    }

    prev() {
        const list = vocabService.getFlashcardData();
        if (!list.length) return;
        this.currentIndex = (this.currentIndex - 1 + list.length) % list.length;
        this.isFlipped = false;
        this.render();
    }

    flip() {
        this.isFlipped = !this.isFlipped;
        this.updateCardState();
        if (this.isFlipped && settingsService.get().autoPlay) {
            this.playAudio();
        }
    }

    playAudio() {
        const data = vocabService.getFlashcardData()[this.currentIndex];
        if (data) {
            // Audio plays target language on flip (Back) or if front is target
            const lang = settingsService.get().targetLang;
            const text = data.front.main; // Usually just read the main word
            audioService.speak(text, lang);
        }
    }

    updateCardState() {
        const cardInner = this.container.querySelector('.card-inner');
        if (cardInner) {
            if (this.isFlipped) cardInner.classList.add('is-flipped');
            else cardInner.classList.remove('is-flipped');
        }
    }

    render() {
        if (!this.container) return;
        const list = vocabService.getFlashcardData();
        if (!list || list.length === 0) {
            this.container.innerHTML = '<div class="text-center p-10 text-gray-500">No vocabulary data loaded.</div>';
            return;
        }

        const item = list[this.currentIndex];
        const s = settingsService.get();

        // Prepare Example Text
        const exTarget = item.back.sentenceTarget || "";
        const exOrigin = item.back.sentenceOrigin || "";
        const hasExample = exTarget && s.showSentence;

        this.container.innerHTML = `
            <div class="fixed top-0 left-0 right-0 h-16 z-40 px-4 flex justify-between items-center bg-gray-100/90 dark:bg-dark-bg/90 backdrop-blur-sm border-b border-white/10">
                <div class="flex items-center gap-2">
                    <div class="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full pl-1 pr-3 py-1 flex items-center shadow-sm">
                        <span class="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-1 rounded-full mr-2">ID</span>
                        <span class="font-bold text-gray-700 dark:text-white text-sm">${item.id}</span>
                    </div>
                    <button class="game-edit-btn header-icon-btn bg-gray-200 dark:bg-gray-800 rounded-full text-gray-500 hover:text-indigo-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                </div>
                <button id="fc-close-btn" class="header-icon-btn bg-red-50 text-red-500 rounded-full shadow-sm"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <div class="w-full h-full pt-20 pb-28 px-6 flex flex-col items-center justify-center">
                <div class="card-scene w-full max-w-md aspect-[3/4] max-h-[50vh] relative mb-6">
                    <div class="card-inner w-full h-full relative transition-transform duration-500 transform-style-3d cursor-pointer ${this.isFlipped ? 'is-flipped' : ''}" id="fc-card">
                        
                        <div class="card-face card-front absolute inset-0 bg-white dark:bg-dark-card rounded-[2rem] shadow-2xl flex flex-col items-center justify-center border-2 border-gray-100 dark:border-dark-border backface-hidden">
                            <div class="text-center px-4 w-full">
                                <h1 class="font-black text-gray-800 dark:text-white mb-2 leading-tight" data-fit="true">${item.front.main}</h1>
                                ${item.front.sub ? `<p class="text-gray-400 font-medium text-lg mt-2">${item.front.sub}</p>` : ''}
                            </div>
                            <div class="absolute bottom-6 text-xs font-bold text-gray-300 uppercase tracking-widest">Tap to Flip</div>
                        </div>

                        <div class="card-face card-back absolute inset-0 bg-indigo-600 dark:bg-dark-card rounded-[2rem] shadow-2xl flex flex-col items-center justify-center border-2 border-indigo-500 dark:border-indigo-900 backface-hidden rotate-y-180 text-white">
                            <div class="text-center px-4 w-full">
                                <h2 class="font-bold text-indigo-100 dark:text-gray-300 mb-1 uppercase tracking-widest text-xs">Meaning</h2>
                                <div class="font-black text-3xl mb-4 leading-tight">${item.back.main}</div>
                                ${item.back.sub ? `<p class="text-indigo-200 dark:text-gray-400 text-sm">${item.back.sub}</p>` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                ${hasExample ? `
                <div class="w-full max-w-md flex-1 min-h-0 flex flex-col justify-center text-center p-2">
                    <p class="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 leading-snug" data-fit="true">${exTarget}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${exOrigin}</p>
                </div>
                ` : ''}

            </div>

            <div class="fixed bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent dark:from-dark-bg"><div class="max-w-md mx-auto flex gap-4"><button id="fc-prev-btn" class="flex-1 h-16 bg-white border border-gray-200 rounded-3xl shadow-sm flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg></button><button id="fc-next-btn" class="flex-1 h-16 bg-indigo-600 text-white rounded-3xl shadow-xl flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg></button></div></div>
        `;

        this.container.querySelector('#fc-card').addEventListener('click', () => this.flip());
        this.container.querySelector('#fc-next-btn').addEventListener('click', () => this.next());
        this.container.querySelector('#fc-prev-btn').addEventListener('click', () => this.prev());
        this.container.querySelector('#fc-close-btn').addEventListener('click', () => window.dispatchEvent(new CustomEvent('router:home')));

        requestAnimationFrame(() => {
            this.container.querySelectorAll('[data-fit="true"]').forEach(el => textService.fitText(el));
        });
    }
}

export const flashcardApp = new FlashcardApp();
