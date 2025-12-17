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

        // INJECT FLASHCARD VIEW LAYOUT
        // Includes: Top Bar, Card Area, Bottom Controls
        this.wrapper.innerHTML = `
            <div class="fixed top-0 left-0 right-0 h-16 z-40 px-4 flex justify-between items-center bg-gray-100/90 dark:bg-dark-bg/90 backdrop-blur-sm border-b border-transparent">
                
                <div class="flex items-center">
                    <div class="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full pl-1 pr-3 py-1 flex items-center shadow-sm">
                        <span class="bg-indigo-100 dark:bg-dark-primary/20 text-indigo-600 dark:text-dark-primary text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider mr-2">ID</span>
                        <input type="number" id="vocab-id-input" 
                            class="w-12 bg-transparent border-none text-center font-mono font-bold text-gray-700 dark:text-white focus:ring-0 outline-none text-sm p-0 appearance-none"
                            value="0">
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <button id="random-btn" class="w-10 h-10 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full flex items-center justify-center text-indigo-500 dark:text-dark-primary shadow-sm active:scale-90 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
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
        // Nav
        document.getElementById('prev-btn').addEventListener('click', () => this.prev());
        document.getElementById('next-btn').addEventListener('click', () => this.next());
        
        // Random
        document.getElementById('random-btn').addEventListener('click', () => {
            audioService.stop();
            this.currentIndex = vocabService.getRandomIndex();
            this.render();
        });

        // Close (Emit event or direct call)
        document.getElementById('fc-close-btn').addEventListener('click', () => {
            audioService.stop();
            // Trigger the global router to show menu
            const event = new CustomEvent('router:home');
            window.dispatchEvent(event);
        });

        // ID Input Logic
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
                // Reset to current
                const list = vocabService.getAll();
                idInput.value = list[this.currentIndex].id; 
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

    refresh() { this.render(); }

    render() {
        const list = vocabService.getFlashcardData();
        if (!list || list.length === 0) return;

        this.container.innerHTML = '';
        const data = list[this.currentIndex];
        const card = createCardDOM(data);
        this.container.appendChild(card);

        // Update Pill
        const idInput = document.getElementById('vocab-id-input');
        if(idInput) idInput.value = data.id;

        // Resize Text
        requestAnimationFrame(() => {
            const fitElements = card.querySelectorAll('[data-fit="true"]');
            fitElements.forEach(el => textService.fitText(el));
        });

        // Auto Play
        const settings = settingsService.get();
        if (settings.autoPlay) {
            setTimeout(() => {
                audioService.speak(data.front.main, settings.targetLang);
            }, 200);
        }
    }
}

export const flashcardApp = new FlashcardApp();
