import { createCardDOM } from './Card';
import { vocabService } from '../services/vocabService';
import { textService } from '../services/textService';
import { settingsService } from '../services/settingsService';
import { audioService } from '../services/audioService';

export class FlashcardApp {
    constructor() {
        this.currentIndex = 0;
        this.container = null;
        this.wrapper = null;
    }

    mount(elementId) {
        this.wrapper = document.getElementById(elementId);
        if(!this.wrapper) return;

        this.wrapper.innerHTML = `
            <div class="fixed top-0 left-0 right-0 h-16 z-40 px-4 flex justify-between items-center bg-gray-100/90 dark:bg-dark-bg/90 backdrop-blur-sm">
                
                <div class="flex items-center">
                    <div class="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full pl-1 pr-3 py-1 flex items-center shadow-sm">
                        <span class="bg-indigo-100 dark:bg-dark-primary/20 text-indigo-600 dark:text-dark-primary text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider mr-2">ID</span>
                        <input type="number" id="vocab-id-input" 
                            class="w-12 bg-transparent border-none text-center font-mono font-bold text-gray-700 dark:text-white focus:ring-0 outline-none text-sm p-0"
                            value="0">
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <button id="random-btn" class="w-10 h-10 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl flex items-center justify-center text-indigo-500 dark:text-dark-primary shadow-sm active:scale-90 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </button>
                    
                    <button class="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-dark-border shadow-sm">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" class="w-full h-full bg-gray-200">
                    </button>

                    <button id="fc-close-btn" class="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div id="card-display-area" class="w-full h-full pt-20 pb-28 px-4 flex items-center justify-center"></div>

            <div class="fixed bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent dark:from-dark-bg dark:via-dark-bg">
                <div class="max-w-md mx-auto flex gap-4">
                    <button id="prev-btn" class="flex-1 h-16 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-400 dark:text-gray-500 rounded-3xl shadow-sm active:scale-95 transition-all flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button id="next-btn" class="flex-1 h-16 bg-indigo-600 dark:bg-dark-primary text-white border border-transparent rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-none active:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        `;

        this.container = document.getElementById('card-display-area');
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        document.getElementById('prev-btn').addEventListener('click', () => this.prev());
        document.getElementById('next-btn').addEventListener('click', () => this.next());
        
        document.getElementById('random-btn').addEventListener('click', () => {
            audioService.stop();
            this.currentIndex = vocabService.getRandomIndex();
            this.render();
        });

        document.getElementById('fc-close-btn').addEventListener('click', () => {
            audioService.stop();
            window.dispatchEvent(new CustomEvent('router:home'));
        });

        const idInput = document.getElementById('vocab-id-input');
        idInput.addEventListener('change', (e) => {
            const newId = parseInt(e.target.value);
            const index = vocabService.findIndexById(newId);
            if (index !== -1) {
                audioService.stop();
                this.currentIndex = index;
                this.render();
                idInput.blur(); 
            } else {
                alert('ID not found');
            }
        });
    }

    next() {
        audioService.stop();
        const list = vocabService.getAll();
        this.currentIndex = (this.currentIndex + 1) % list.length;
        this.render();
    }

    prev() {
        audioService.stop();
        const list = vocabService.getAll();
        this.currentIndex = (this.currentIndex - 1 + list.length) % list.length;
        this.render();
    }

    refresh() { 
        this.render(); 
    }

    render() {
        // [FIX] Guard Clause: If the app hasn't started, container is null. Stop here.
        if (!this.container) return;

        const list = vocabService.getFlashcardData();
        if (!list || list.length === 0) return;

        this.container.innerHTML = '';
        const data = list[this.currentIndex];
        const card = createCardDOM(data);
        this.container.appendChild(card);

        const idInput = document.getElementById('vocab-id-input');
        if(idInput) idInput.value = data.id;

        requestAnimationFrame(() => {
            const fitElements = card.querySelectorAll('[data-fit="true"]');
            fitElements.forEach(el => textService.fitText(el));
        });

        const settings = settingsService.get();
        if (settings.autoPlay) {
            setTimeout(() => {
                audioService.speak(data.front.main, settings.targetLang);
            }, 200);
        }
    }
}

export const flashcardApp = new FlashcardApp();
