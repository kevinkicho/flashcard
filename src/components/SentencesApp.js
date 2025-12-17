import { vocabService } from '../services/vocabService';
import { settingsService } from '../services/settingsService';
import { audioService } from '../services/audioService';
import { textService } from '../services/textService';

export class SentencesApp {
    constructor() {
        this.container = null; this.currentIndex = 0; this.currentData = null; this.userSentence = []; this.shuffledWords = [];
    }

    mount(elementId) { this.container = document.getElementById(elementId); this.next(); }

    next(specificId = null) {
        audioService.stop();
        if (specificId !== null) {
             const index = vocabService.findIndexById(specificId);
             if(index !== -1) this.currentIndex = index; else { alert("ID not found"); return; }
        } else {
             this.currentIndex = vocabService.getRandomIndex();
        }
        this.loadGame();
    }
    prev() {
        audioService.stop();
        const list = vocabService.getAll();
        this.currentIndex = (this.currentIndex - 1 + list.length) % list.length;
        this.loadGame();
    }

    loadGame() {
        const list = vocabService.getFlashcardData();
        const item = list[this.currentIndex];
        const settings = settingsService.get();
        // Ensure sentence exists, fallback to vocab if missing (safety)
        const targetSentence = item.back.sentenceTarget || item.front.main;
        const cleanSentence = targetSentence.replace(/<[^>]*>?/gm, '');
        
        let words = [];
        // Split by character for JP/ZH, spaces otherwise
        if (['ja', 'zh'].includes(settings.targetLang)) words = cleanSentence.split('');
        else words = cleanSentence.split(' ').filter(w => w.length > 0);

        this.currentData = { ...item, originalWords: [...words], cleanSentence };
        this.shuffledWords = [...words].sort(() => Math.random() - 0.5);
        this.userSentence = [];
        this.render();

        // Auto-play target sentence on load if global setting is on
        if(settings.autoPlay) setTimeout(() => audioService.speak(this.currentData.cleanSentence, settings.targetLang), 300);
    }

    handleWordClick(word, index, fromBank) {
        if(fromBank) {
            this.userSentence.push(word); this.shuffledWords.splice(index, 1);
            // Play word audio if setting enabled
            if(settingsService.get().sentencesWordAudio) audioService.speak(word, settingsService.get().targetLang);
        } else {
            this.shuffledWords.push(word); this.userSentence.splice(index, 1);
        }
        this.render();
        if(fromBank) this.checkWin();
    }

    checkWin() {
        if (this.shuffledWords.length === 0) {
            const settings = settingsService.get();
            const joiner = ['ja', 'zh'].includes(settings.targetLang) ? '' : ' ';
            const userStr = this.userSentence.join(joiner);
            const targetStr = this.currentData.originalWords.join(joiner);
            
            const dropZone = document.getElementById('sentence-drop-zone');
            if (userStr === targetStr) {
                dropZone.classList.add('bg-green-100', 'border-green-500', 'dark:bg-green-900/30', 'animate-success-pulse');
                if (settings.autoPlay) audioService.speak(userStr, settings.targetLang);
                setTimeout(() => this.next(), 1500);
            } else {
                 dropZone.classList.add('bg-red-100', 'border-red-500', 'dark:bg-red-900/30', 'animate-shake');
                 setTimeout(() => this.render(), 500); // Reset state
            }
        }
    }

    render() {
        if (!this.container || !this.currentData) return;
        const item = this.currentData;
        const settings = settingsService.get();
        const fontClass = settings.targetLang === 'ja' ? 'font-jp' : '';

        this.container.innerHTML = `
             <div class="fixed top-0 left-0 right-0 h-16 z-40 px-4 flex justify-between items-center bg-gray-100/90 dark:bg-dark-bg/90 backdrop-blur-sm">
                <div class="flex items-center"><div class="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full pl-1 pr-3 py-1 flex items-center shadow-sm"><span class="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider mr-2">ID</span><input type="number" id="sent-id-input" class="w-12 bg-transparent border-none text-center font-mono font-bold text-gray-700 dark:text-white focus:ring-0 outline-none text-sm p-0" value="${item.id}"></div></div>
                <div class="flex items-center gap-3"><button id="sent-random-btn" class="w-10 h-10 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl flex items-center justify-center text-indigo-500 dark:text-dark-primary shadow-sm active:scale-90 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></button><button id="sent-close-btn" class="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            </div>

            <div class="w-full h-full pt-20 pb-28 px-4 flex flex-col items-center max-w-2xl mx-auto">
                <div class="w-full p-6 bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border mb-6 text-center relative">
                     <span class="absolute top-2 left-0 w-full text-center text-[10px] font-black uppercase tracking-widest opacity-30 dark:text-gray-400">Translate this</span>
                    <h2 class="text-xl font-bold text-gray-800 dark:text-white mt-2">${item.back.sentenceOrigin}</h2>
                </div>

                <div id="sentence-drop-zone" class="w-full min-h-[120px] bg-gray-50 dark:bg-black/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-4 flex flex-wrap gap-2 items-center justify-center mb-8 transition-all duration-300">
                    ${this.userSentence.length === 0 ? '<span class="text-gray-400 italic">Tap words below to build</span>' : ''}
                    ${this.userSentence.map((word, i) => `<button class="user-word px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-md active:scale-95 transition-transform font-bold text-lg ${fontClass}" data-index="${i}">${word}</button>`).join('')}
                </div>

                <div class="flex flex-wrap gap-3 justify-center content-start flex-grow">
                    ${this.shuffledWords.map((word, i) => `<button class="bank-word px-4 py-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200 rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all text-lg font-medium ${fontClass}" data-index="${i}">${word}</button>`).join('')}
                </div>
            </div>

             <div class="fixed bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent dark:from-dark-bg dark:via-dark-bg">
                <div class="max-w-md mx-auto flex gap-4">
                    <button id="sent-prev-btn" class="flex-1 h-16 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-400 dark:text-gray-500 rounded-3xl shadow-sm active:scale-95 transition-all flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg></button>
                    <button id="sent-next-btn" class="flex-1 h-16 bg-indigo-600 dark:bg-dark-primary text-white border border-transparent rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-none active:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg></button>
                </div>
            </div>
        `;

        // LISTENERS
        this.container.querySelectorAll('.bank-word').forEach(btn => btn.addEventListener('click', () => this.handleWordClick(btn.innerText, parseInt(btn.dataset.index), true)));
        this.container.querySelectorAll('.user-word').forEach(btn => btn.addEventListener('click', () => this.handleWordClick(btn.innerText, parseInt(btn.dataset.index), false)));
        document.getElementById('sent-close-btn').addEventListener('click', () => { audioService.stop(); window.dispatchEvent(new CustomEvent('router:home')); });
        document.getElementById('sent-random-btn').addEventListener('click', () => this.next());
        const idInput = document.getElementById('sent-id-input');
        idInput.addEventListener('change', (e) => this.next(parseInt(e.target.value)));
    }
}
export const sentencesApp = new SentencesApp();
