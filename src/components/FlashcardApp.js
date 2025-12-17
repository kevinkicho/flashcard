import { createCardDOM } from './Card';
import { vocabService } from '../services/vocabService';

export class FlashcardApp {
    constructor() {
        this.currentIndex = 0;
        this.container = null;
    }

    mount(elementId) {
        const root = document.getElementById(elementId);
        if (!root) return;

        root.innerHTML = `
            <div id="card-display-area" class="flex-grow flex flex-col justify-center w-full"></div>
            
            <div class="w-full p-6 pb-8 bg-gradient-to-t from-gray-50 to-transparent">
                <div class="max-w-md mx-auto flex gap-4">
                    <button id="prev-btn" class="flex-1 h-14 bg-white border-2 border-gray-200 text-gray-500 font-bold rounded-2xl text-lg shadow-sm active:bg-gray-50 active:scale-95 transition-all">
                        ←
                    </button>
                    <button id="next-btn" class="flex-[2] h-14 bg-indigo-600 text-white font-bold rounded-2xl text-lg shadow-xl shadow-indigo-200 active:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                        Next Word
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
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
    }

    next() {
        const list = vocabService.getAll();
        // Infinite Loop Logic
        this.currentIndex = (this.currentIndex + 1) % list.length;
        this.render();
    }

    prev() {
        const list = vocabService.getAll();
        // Infinite Loop Logic (Backwards)
        this.currentIndex = (this.currentIndex - 1 + list.length) % list.length;
        this.render();
    }

    refresh() {
        this.render();
    }

    render() {
        const list = vocabService.getFlashcardData();
        
        if (!list || list.length === 0) {
            this.container.innerHTML = '<p class="text-center text-gray-400">No vocabulary found.</p>';
            return;
        }

        this.container.innerHTML = '';
        const data = list[this.currentIndex];
        const card = createCardDOM(data);
        this.container.appendChild(card);
    }
}

export const flashcardApp = new FlashcardApp();
