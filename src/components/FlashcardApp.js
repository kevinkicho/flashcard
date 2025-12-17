import { createCardDOM } from './Card';
import { vocabService } from '../services/vocabService';
import { textService } from '../services/textService';
import { settingsService } from '../services/settingsService';
import { audioService } from '../services/audioService';

export class FlashcardApp {
    constructor() {
        this.currentIndex = 0;
        this.container = null;
    }

    mount(elementId) {
        this.container = document.getElementById(elementId);
        this.bindEvents(); 
        this.render();
    }

    bindEvents() {
        const prev = document.getElementById('prev-btn');
        const next = document.getElementById('next-btn');
        if(prev) prev.addEventListener('click', () => this.prev());
        if(next) next.addEventListener('click', () => this.next());
    }

    next() {
        const list = vocabService.getAll();
        this.currentIndex = (this.currentIndex + 1) % list.length;
        this.render();
    }

    prev() {
        const list = vocabService.getAll();
        this.currentIndex = (this.currentIndex - 1 + list.length) % list.length;
        this.render();
    }

    refresh() {
        this.render();
    }

    render() {
        const list = vocabService.getFlashcardData();
        if (!list || list.length === 0) {
            this.container.innerHTML = '';
            return;
        }

        this.container.innerHTML = '';
        const data = list[this.currentIndex];
        const card = createCardDOM(data);
        this.container.appendChild(card);

        // 1. Fit Text (Find ALL elements with data-fit="true")
        requestAnimationFrame(() => {
            const fitElements = card.querySelectorAll('[data-fit="true"]');
            fitElements.forEach(el => textService.fitText(el));
        });

        // 2. Audio
        const settings = settingsService.get();
        if (settings.autoPlay) {
            audioService.stop();
            setTimeout(() => {
                audioService.speak(data.front.main, settings.targetLang);
            }, 100);
        }
    }
}

export const flashcardApp = new FlashcardApp();
