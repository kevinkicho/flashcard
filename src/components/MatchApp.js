import { vocabService } from '../services/vocabService';
import { settingsService } from '../services/settingsService';
import { audioService } from '../services/audioService';
import { scoreService } from '../services/scoreService';

export class MatchApp {
    constructor() {
        this.container = null;
        this.cards = [];
        this.selectedCard = null;
        this.isProcessing = false;
        this.matchesFound = 0;
    }

    mount(elementId) {
        this.container = document.getElementById(elementId);
        this.startNewGame();
    }

    startNewGame() {
        this.isProcessing = false;
        this.selectedCard = null;
        this.matchesFound = 0;
        
        const allVocab = vocabService.getAll();
        if (allVocab.length < 6) return; // Need at least 6 items

        // Pick 6 random items
        const gameItems = [...allVocab].sort(() => 0.5 - Math.random()).slice(0, 6);
        
        // Create 12 cards (6 Target, 6 Origin)
        let deck = [];
        gameItems.forEach(item => {
            // Target Card
            deck.push({
                id: item.id,
                type: 'target',
                text: item.front.main,
                pairId: item.id
            });
            // Origin Card
            deck.push({
                id: item.id,
                type: 'origin',
                text: item.back.main || item.back.definition, // Fallback
                pairId: item.id
            });
        });

        // Shuffle deck
        this.cards = deck.sort(() => 0.5 - Math.random());
        
        this.render();
    }

    async handleCardClick(idx, el) {
        if (this.isProcessing) return;
        const card = this.cards[idx];
        
        // Ignore if already matched or same card clicked
        if (card.matched || (this.selectedCard && this.selectedCard.idx === idx)) return;

        // Play Audio (Global Setting)
        if (settingsService.get().clickAudio) {
            const lang = card.type === 'target' ? settingsService.get().targetLang : settingsService.get().originLang;
            audioService.speak(card.text, lang);
        }

        el.classList.add('ring-4', 'ring-indigo-400', 'scale-105', 'bg-indigo-50', 'dark:bg-indigo-900/30');

        if (!this.selectedCard) {
            // First pick
            this.selectedCard = { idx, ...card, el };
        } else {
            // Second pick - Check Match
            this.isProcessing = true;
            const first = this.selectedCard;
            
            if (first.pairId === card.pairId) {
                // MATCH!
                this.matchesFound++;
                scoreService.addScore('match', 10);
                
                // Visual Celebration
                first.el.classList.remove('ring-indigo-400');
                el.classList.remove('ring-indigo-400');
                first.el.classList.add('animate-celebrate', 'border-green-500', 'text-green-600');
                el.classList.add('animate-celebrate', 'border-green-500', 'text-green-600');

                // Mark matched in state
                this.cards[first.idx].matched = true;
                this.cards[idx].matched = true;

                await new Promise(r => setTimeout(r, 600));
                
                // Fade out/Hide
                first.el.classList.add('opacity-0', 'pointer-events-none');
                el.classList.add('opacity-0', 'pointer-events-none');
                
                this.selectedCard = null;
                this.isProcessing = false;

                if (this.matchesFound === 6) {
                    setTimeout(() => this.startNewGame(), 500);
                }

            } else {
                // MISMATCH
                first.el.classList.remove('ring-indigo-400');
                el.classList.remove('ring-indigo-400');
                
                first.el.classList.add('bg-red-100', 'dark:bg-red-900/30', 'shake');
                el.classList.add('bg-red-100', 'dark:bg-red-900/30', 'shake');

                // Reset styles after delay
                await new Promise(r => setTimeout(r, 500));
                
                first.el.classList.remove('ring-4', 'scale-105', 'bg-indigo-50', 'dark:bg-indigo-900/30', 'bg-red-100', 'dark:bg-red-900/30', 'shake');
                el.classList.remove('ring-4', 'scale-105', 'bg-indigo-50', 'dark:bg-indigo-900/30', 'bg-red-100', 'dark:bg-red-900/30', 'shake');
                
                this.selectedCard = null;
                this.isProcessing = false;
            }
        }
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="fixed top-0 left-0 right-0 h-16 z-40 px-4 flex justify-between items-center bg-gray-100/90 dark:bg-dark-bg/90 backdrop-blur-sm border-b border-white/10">
                <div class="text-xl font-black text-yellow-500 tracking-tighter">MATCH</div>
                <div class="flex items-center gap-2">
                    <button id="score-pill" class="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full px-3 py-1 flex items-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <span class="text-base">🏆</span>
                        <span class="font-black text-gray-700 dark:text-white text-sm global-score-display">${scoreService.todayScore}</span>
                    </button>
                    <button id="match-close-btn" class="header-icon-btn bg-red-50 text-red-500 rounded-full shadow-sm"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            </div>

            <div class="w-full h-full pt-20 pb-10 px-4 max-w-lg mx-auto">
                <div class="grid grid-cols-3 gap-3 h-full content-center">
                    ${this.cards.map((c, i) => `
                        <button class="match-card relative w-full aspect-square bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl shadow-sm flex items-center justify-center p-2 transition-all duration-200 ${c.matched ? 'opacity-0 pointer-events-none' : 'hover:scale-105 active:scale-95'}" data-index="${i}">
                            <span class="font-bold text-sm md:text-base text-gray-700 dark:text-white break-words text-center leading-tight ${c.type === 'target' && settingsService.get().targetLang === 'ja' ? 'text-ja-wrap' : ''}">${c.text}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <style>
                .shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
                @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
            </style>
        `;

        this.container.querySelector('#match-close-btn').addEventListener('click', () => window.dispatchEvent(new CustomEvent('router:home')));
        
        this.container.querySelectorAll('.match-card').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCardClick(parseInt(e.currentTarget.dataset.index), e.currentTarget));
        });
    }
}
export const matchApp = new MatchApp();
