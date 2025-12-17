import { quizService } from '../services/quizService';
import { textService } from '../services/textService';
import { audioService } from '../services/audioService';
import { settingsService } from '../services/settingsService';
import { vocabService } from '../services/vocabService';

export class QuizApp {
    constructor() {
        this.container = null;
        this.currentData = null;
        this.isAnswered = false;
        this.selectedId = null; // Track first click for double-click mode
    }

    mount(elementId) {
        this.container = document.getElementById(elementId);
        this.next();
    }

    next(specificId = null) {
        this.isAnswered = false;
        this.selectedId = null;
        audioService.stop(); 
        this.currentData = quizService.generateQuestion(specificId);
        this.render();
    }

    prev() { this.next(); }

    handleClick(id, buttonElement) {
        if (this.isAnswered) return;

        const settings = settingsService.get();
        
        // DOUBLE CLICK MODE
        if (settings.quizClickMode === 'double') {
            if (this.selectedId !== id) {
                // FIRST CLICK: Select & Preview
                this.selectedId = id;
                
                // Remove highlight from others
                this.container.querySelectorAll('.quiz-option').forEach(btn => {
                    btn.classList.remove('ring-4', 'ring-indigo-300', 'bg-indigo-50', 'dark:bg-indigo-900/30');
                });
                // Add Highlight
                buttonElement.classList.add('ring-4', 'ring-indigo-300', 'bg-indigo-50', 'dark:bg-indigo-900/30');

                // Play Preview Audio (Answer language is Origin Lang)
                if (settings.quizAnswerAudio) {
                    const choice = this.currentData.choices.find(c => c.id === id);
                    audioService.speak(choice.back.definition, settings.originLang);
                }
                return;
            }
        }

        // CONFIRMATION (Single Mode OR Second Click)
        this.submitAnswer(id, buttonElement);
    }

    submitAnswer(selectedId, buttonElement) {
        this.isAnswered = true;
        const correctId = this.currentData.target.id;
        const isCorrect = selectedId === correctId;
        const questionBox = document.getElementById('quiz-question-box');
        const questionText = document.getElementById('quiz-question-text');

        if (isCorrect) {
            // 1. Button Feedback
            buttonElement.className = 'quiz-option relative w-full h-full p-2 bg-green-500 text-white border-2 border-green-600 rounded-2xl shadow-lg flex items-center justify-center animate-success-pulse';
            
            // 2. Question Box Feedback (Match Answer Style)
            questionBox.classList.remove('bg-white', 'dark:bg-dark-card', 'border-indigo-100', 'dark:border-dark-border');
            questionBox.classList.add('bg-green-500', 'border-green-600', 'shadow-xl');
            
            // 3. Question Text Reverse Color
            questionText.classList.remove('text-gray-800', 'dark:text-white');
            questionText.classList.add('text-white');

            // 4. Play Target Audio
            if (settingsService.get().autoPlay) {
                audioService.speak(this.currentData.target.front.main, settingsService.get().targetLang);
            }

            // 5. Disable all
            this.container.querySelectorAll('.quiz-option').forEach(btn => btn.disabled = true);

            setTimeout(() => this.next(), 1500);

        } else {
            // Error Feedback
            buttonElement.classList.remove('bg-white', 'dark:bg-dark-card', 'ring-4');
            buttonElement.classList.add('bg-red-500', 'text-white', 'border-red-600', 'animate-shake');
            this.selectedId = null; // Reset selection to allow retry
            this.isAnswered = false; // Allow retry
        }
    }

    render() {
        if (!this.container || !this.currentData) return;
        const { target, choices } = this.currentData;
        const fontClass = target.type === 'JAPANESE' ? 'font-jp' : '';
        const gridCols = choices.length === 2 ? 'grid-cols-2' : choices.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

        // --- NO SCROLL LAYOUT ---
        // h-screen minus padding/header = fixed area
        // grid-rows-[auto_1fr_auto] = Header, Content, Footer
        this.container.innerHTML = `
            <div class="w-full h-full flex flex-col">
                <div class="h-16 flex-none px-4 flex justify-between items-center bg-gray-100/90 dark:bg-dark-bg/90 backdrop-blur-sm z-40">
                    <div class="flex items-center">
                        <div class="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full pl-1 pr-3 py-1 flex items-center shadow-sm">
                            <span class="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider mr-2">ID</span>
                            <input type="number" id="quiz-id-input" class="w-12 bg-transparent border-none text-center font-mono font-bold text-gray-700 dark:text-white focus:ring-0 outline-none text-sm p-0" value="${target.id}">
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <button id="quiz-random-btn" class="w-10 h-10 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl flex items-center justify-center text-indigo-500 dark:text-dark-primary shadow-sm active:scale-90 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </button>
                        <button id="quiz-close-btn" class="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div class="flex-grow flex flex-col px-4 pb-24 overflow-hidden gap-4">
                    
                    <div id="quiz-question-box" class="flex-[3] w-full bg-white dark:bg-dark-card rounded-[2rem] shadow-xl dark:shadow-none border-2 border-indigo-100 dark:border-dark-border p-4 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
                        <span class="absolute top-4 w-full text-center text-[10px] font-black uppercase tracking-widest opacity-30 dark:text-gray-400">Select the meaning</span>
                        <div class="flex-grow w-full flex items-center justify-center overflow-hidden px-4">
                            <span id="quiz-question-text" class="font-black text-gray-800 dark:text-white leading-none select-none opacity-0 transition-opacity duration-300 ${fontClass}" data-fit="true">
                                ${target.front.main}
                            </span>
                        </div>
                    </div>

                    <div class="flex-[2] w-full grid ${gridCols} gap-3">
                        ${choices.map(choice => `
                            <button class="quiz-option relative w-full h-full p-2 bg-white dark:bg-dark-card border-2 border-gray-100 dark:border-dark-border rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center group overflow-hidden" data-id="${choice.id}">
                                <div class="text-lg font-bold text-gray-700 dark:text-gray-200 leading-tight text-center opacity-0 transition-opacity duration-300 w-full" data-fit="true">
                                    ${choice.back.definition}
                                </div>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="fixed bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent dark:from-dark-bg dark:via-dark-bg">
                    <div class="max-w-md mx-auto flex gap-4">
                        <button id="quiz-prev-btn" class="flex-1 h-16 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-400 dark:text-gray-500 rounded-3xl shadow-sm active:scale-95 transition-all flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg></button>
                        <button id="quiz-next-btn" class="flex-1 h-16 bg-indigo-600 dark:bg-dark-primary text-white border border-transparent rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-none active:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg></button>
                    </div>
                </div>
            </div>
        `;

        // RESIZE & REVEAL
        requestAnimationFrame(() => {
            const fitElements = this.container.querySelectorAll('[data-fit="true"]');
            fitElements.forEach(el => {
                textService.fitText(el);
                requestAnimationFrame(() => el.classList.remove('opacity-0'));
            });
        });

        // BINDINGS
        this.container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleClick(parseInt(e.currentTarget.getAttribute('data-id')), e.currentTarget));
        });
        document.getElementById('quiz-random-btn').addEventListener('click', () => this.next());
        document.getElementById('quiz-close-btn').addEventListener('click', () => { audioService.stop(); window.dispatchEvent(new CustomEvent('router:home')); });
        const idInput = document.getElementById('quiz-id-input');
        idInput.addEventListener('change', (e) => {
            const newId = parseInt(e.target.value);
            vocabService.findIndexById(newId) !== -1 ? this.next(newId) : alert('ID not found');
        });
    }
}
export const quizApp = new QuizApp();
