import { vocabService } from '../services/vocabService';
import { settingsService } from '../services/settingsService';
import { audioService } from '../services/audioService';

export class SentencesApp {
    constructor() {
        this.container = null;
        this.currentIndex = 0;
        this.currentData = null;
        this.userSentence = []; // Array of words
        this.shuffledWords = [];
    }

    mount(elementId) {
        this.container = document.getElementById(elementId);
        this.currentIndex = vocabService.getRandomIndex();
        this.loadGame();
    }

    loadGame() {
        const list = vocabService.getFlashcardData();
        const item = list[this.currentIndex];
        const settings = settingsService.get();
        const targetSentence = item.back.sentenceTarget;

        // Strip punctuation/HTML for logic
        const cleanSentence = targetSentence.replace(/<[^>]*>?/gm, '');
        
        // Tokenize (Space based for Western, character based for Asian mostly, but simple space split for now as data usually has spaces or we assume western for sentence building initially. 
        // NOTE: For JP/ZH without spaces, sentence building is hard. We will focus on Space-separated languages or just char splitting for JP/ZH)
        let words = [];
        if (['ja', 'zh'].includes(settings.targetLang)) {
            // For JP/ZH, split by character for extra difficulty
            words = cleanSentence.split('');
        } else {
            words = cleanSentence.split(' ');
        }

        // Shuffle
        this.currentData = { ...item, originalWords: [...words] };
        this.shuffledWords = [...words].sort(() => Math.random() - 0.5);
        this.userSentence = [];
        
        this.render();
    }

    handleWordClick(word, index) {
        // Move from Bank to User Line
        this.userSentence.push(word);
        this.shuffledWords.splice(index, 1);
        this.render();
        this.checkWin();
    }

    handleUserWordClick(word, index) {
        // Move back to Bank
        this.shuffledWords.push(word);
        this.userSentence.splice(index, 1);
        this.render();
    }

    checkWin() {
        if (this.shuffledWords.length === 0) {
            const userStr = this.userSentence.join(settingsService.get().targetLang === 'en' ? ' ' : '');
            const targetStr = this.currentData.originalWords.join(settingsService.get().targetLang === 'en' ? ' ' : '');
            
            if (userStr === targetStr) {
                // Success
                const dropZone = document.getElementById('sentence-drop-zone');
                dropZone.classList.add('bg-green-100', 'border-green-500', 'dark:bg-green-900/30');
                
                if (settingsService.get().autoPlay) {
                    audioService.speak(userStr, settingsService.get().targetLang);
                }

                setTimeout(() => {
                    this.currentIndex = vocabService.getRandomIndex();
                    this.loadGame();
                }, 1500);
            }
        }
    }

    render() {
        if (!this.container) return;
        const item = this.currentData;

        this.container.innerHTML = `
            <div class="fixed top-0 left-0 right-0 h-16 z-40 px-4 flex justify-between items-center bg-gray-100/90 dark:bg-dark-bg/90 backdrop-blur-sm">
                <div class="font-black text-xl text-indigo-600 dark:text-dark-primary tracking-tighter">SENTENCES</div>
                <button id="sent-close-btn" class="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div class="w-full h-full pt-20 pb-10 px-4 flex flex-col items-center max-w-2xl mx-auto">
                
                <div class="w-full p-6 bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border mb-6 text-center">
                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">Make this sentence:</p>
                    <h2 class="text-xl font-bold text-gray-800 dark:text-white">${item.back.sentenceOrigin}</h2>
                </div>

                <div id="sentence-drop-zone" class="w-full min-h-[100px] bg-gray-50 dark:bg-black/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-4 flex flex-wrap gap-2 items-center justify-center mb-8 transition-colors">
                    ${this.userSentence.length === 0 ? '<span class="text-gray-400 italic">Tap words below to build</span>' : ''}
                    ${this.userSentence.map((word, i) => `
                        <button class="user-word px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-md active:scale-95 transition-transform font-bold text-lg" data-index="${i}">
                            ${word}
                        </button>
                    `).join('')}
                </div>

                <div class="flex flex-wrap gap-3 justify-center">
                    ${this.shuffledWords.map((word, i) => `
                        <button class="bank-word px-4 py-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200 rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all text-lg font-medium" data-index="${i}">
                            ${word}
                        </button>
                    `).join('')}
                </div>

            </div>
        `;

        // Listeners
        this.container.querySelectorAll('.bank-word').forEach(btn => {
            btn.addEventListener('click', () => this.handleWordClick(btn.innerText, parseInt(btn.dataset.index)));
        });
        this.container.querySelectorAll('.user-word').forEach(btn => {
            btn.addEventListener('click', () => this.handleUserWordClick(btn.innerText, parseInt(btn.dataset.index)));
        });
        document.getElementById('sent-close-btn').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('router:home'));
        });
    }
}

export const sentencesApp = new SentencesApp();
