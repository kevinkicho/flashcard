import { vocabService } from '../services/vocabService';
import { settingsService } from '../services/settingsService';
import { audioService } from '../services/audioService';
import { scoreService } from '../services/scoreService';
import { textService } from '../services/textService';

export class ConstructorApp {
    constructor() {
        this.container = null;
        this.currentData = null;
        this.currentIndex = 0;
        this.builtWord = []; // Array of chars
        this.targetChars = []; // Correct chars
        this.charPool = []; // Shuffled chars
        this.isProcessing = false;
    }

    mount(elementId) {
        this.container = document.getElementById(elementId);
        this.random();
    }

    random() {
        this.currentIndex = vocabService.getRandomIndex();
        this.loadGame();
    }

    next(id = null) {
        if (id !== null) {
            const idx = vocabService.findIndexById(id);
            if (idx !== -1) this.currentIndex = idx;
        } else {
            const list = vocabService.getAll();
            this.currentIndex = (this.currentIndex + 1) % list.length;
        }
        this.loadGame();
    }

    loadGame() {
        this.isProcessing = false;
        const list = vocabService.getAll();
        if (!list.length) return;
        const item = list[this.currentIndex];
        
        const targetWord = item.front.main; // The word to build
        const originMeaning = item.back.main || item.back.definition;

        // Split into characters (handling surrogates/diacritics if simple)
        // For simple MVP, assume split('') works or use Array.from
        this.targetChars = Array.from(targetWord.replace(/\s+/g, '')); // Remove spaces for building
        this.builtWord = [];
        
        // Create pool: Target chars + randoms if we wanted hard mode, but for now just scramble target
        this.charPool = [...this.targetChars].map((char, i) => ({ char, id: i, used: false })).sort(() => 0.5 - Math.random());

        this.currentData = { item, originMeaning };
        this.render();
    }

    handlePoolClick(idx) {
        if (this.isProcessing) return;
        const charObj = this.charPool[idx];
        if (charObj.used) return;

        // Add to build
        this.builtWord.push(charObj);
        charObj.used = true;
        
        if(settingsService.get().clickAudio) {
            // Read the character? Or just a click sound? 
            // Reading single chars in some langs is weird, but let's try
            // audioService.speak(charObj.char, settingsService.get().targetLang);
        }

        this.render();
        this.checkWin();
    }

    handleBuiltClick(idx) {
        if (this.isProcessing) return;
        // Remove from build, return to pool
        const charObj = this.builtWord[idx];
        charObj.used = false;
        this.builtWord.splice(idx, 1);
        this.render();
    }

    checkWin() {
        const currentString = this.builtWord.map(c => c.char).join('');
        const targetString = this.targetChars.join('');

        if (currentString === targetString) {
            this.isProcessing = true;
            scoreService.addScore('constructor', 10);
            
            // Audio
            if(settingsService.get().autoPlay) {
                audioService.speak(this.currentData.item.front.main, settingsService.get().targetLang);
            }

            // Visual
            const zone = this.container.querySelector('#constructor-slots');
            zone.classList.add('animate-celebrate', 'border-green-500');

            setTimeout(() => this.next(), 1200);
        } else if (this.builtWord.length === this.targetChars.length) {
            // Wrong attempt
            const zone = this.container.querySelector('#constructor-slots');
            zone.classList.add('shake', 'border-red-500');
            setTimeout(() => {
                zone.classList.remove('shake', 'border-red-500');
            }, 500);
        }
    }

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="fixed top-0 left-0 right-0 h-16 z-40 px-4 flex justify-between items-center bg-gray-100/90 dark:bg-dark-bg/90 backdrop-blur-sm border-b border-white/10">
                <div class="text-xl font-black text-emerald-500 tracking-tighter">BUILD</div>
                <div class="flex items-center gap-2">
                    <button id="score-pill" class="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full px-3 py-1 flex items-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <span class="text-base">🏆</span>
                        <span class="font-black text-gray-700 dark:text-white text-sm global-score-display">${scoreService.todayScore}</span>
                    </button>
                    <button id="constructor-close-btn" class="header-icon-btn bg-red-50 text-red-500 rounded-full shadow-sm"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            </div>

            <div class="w-full h-full pt-20 pb-10 px-4 max-w-lg mx-auto flex flex-col gap-6">
                <div class="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm text-center border-2 border-gray-100 dark:border-dark-border">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Construct the word for:</span>
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mt-2" data-fit="true">${this.currentData.originMeaning}</h2>
                </div>

                <div id="constructor-slots" class="flex flex-wrap justify-center gap-2 min-h-[4rem] p-4 bg-gray-100 dark:bg-dark-bg/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 transition-all">
                    ${this.builtWord.map((c, i) => `
                        <button class="built-char w-12 h-12 bg-emerald-500 text-white rounded-xl font-bold text-xl shadow-md transform active:scale-95" data-index="${i}">${c.char}</button>
                    `).join('')}
                    ${this.builtWord.length === 0 ? '<span class="text-gray-400 text-sm self-center">Tap letters to build</span>' : ''}
                </div>

                <div class="grid grid-cols-5 gap-2 mt-auto">
                    ${this.charPool.map((c, i) => `
                        <button class="pool-char aspect-square bg-white dark:bg-dark-card border-b-4 border-gray-200 dark:border-gray-700 rounded-xl font-bold text-lg text-gray-700 dark:text-white active:scale-95 active:border-b-0 translate-y-0 active:translate-y-1 transition-all ${c.used ? 'opacity-0 pointer-events-none' : ''}" data-index="${i}">${c.char}</button>
                    `).join('')}
                </div>
            </div>
            <style>
                .shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
            </style>
        `;

        this.container.querySelector('#constructor-close-btn').addEventListener('click', () => window.dispatchEvent(new CustomEvent('router:home')));
        this.container.querySelectorAll('.pool-char').forEach(btn => btn.addEventListener('click', (e) => this.handlePoolClick(parseInt(e.currentTarget.dataset.index))));
        this.container.querySelectorAll('.built-char').forEach(btn => btn.addEventListener('click', (e) => this.handleBuiltClick(parseInt(e.currentTarget.dataset.index))));
        
        requestAnimationFrame(() => {
            this.container.querySelectorAll('[data-fit="true"]').forEach(el => textService.fitText(el));
        });
    }
}
export const constructorApp = new ConstructorApp();
