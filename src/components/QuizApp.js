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
    }

    mount(elementId) {
        this.container = document.getElementById(elementId);
        this.nextQuestion();
    }

    nextQuestion(specificId = null) {
        this.isAnswered = false;
        // Stop any previous audio before new question loads
        audioService.stop(); 
        this.currentData = quizService.generateQuestion(specificId);
        this.render();
    }

    handleAnswer(selectedId, buttonElement) {
        if (this.isAnswered) return;
        this.isAnswered = true;

        const correctId = this.currentData.target.id;
        const isCorrect = selectedId === correctId;

        // Visual Feedback & Animation
        if (isCorrect) {
            // Success: Green Pulse Animation
            buttonElement.classList.remove('bg-white', 'dark:bg-dark-card', 'hover:shadow-md');
            buttonElement.classList.add('bg-green-500', 'text-white', 'border-green-500', 'animate-success-pulse', 'shadow-lg');
        } else {
            // Error: Red Shake Animation
            buttonElement.classList.remove('bg-white', 'dark:bg-dark-card');
            buttonElement.classList.add('bg-red-500', 'text-white', 'border-red-500', 'animate-shake');
            
            // Highlight correct one (subtly)
            const correctBtn = document.querySelector(`button[data-id="${correctId}"]`);
            if (correctBtn) {
                correctBtn.classList.add('ring-2', 'ring-green-400', 'bg-green-50', 'dark:bg-green-900/20');
            }
        }

        // Auto Advance after animation (1.5s delay)
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }

    render() {
        if (!this.container || !this.currentData) return;
        const settings = settingsService.get();
        const { target, choices } = this.currentData;
        
        // Determine Font Class based on Target Language
        const fontClass = target.type === 'JAPANESE' ? 'font-jp' : '';

        // --- LAYOUT ---
        this.container.innerHTML = `
            <div class="fixed top-0 left-0 right-0 h-16 z-40 px-4 flex justify-between items-center bg-gray-100/90 dark:bg-dark-bg/90 backdrop-blur-sm">
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

            <div class="w-full h-full pt-20 pb-6 px-6 flex flex-col items-center max-w-2xl mx-auto">
                
                <div class="w-full bg-white dark:bg-dark-card rounded-[2rem] shadow-xl dark:shadow-none border-2 border-indigo-100 dark:border-dark-border p-8 mb-8 flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden">
                    <span class="absolute top-4 w-full text-center text-[10px] font-black uppercase tracking-widest opacity-30 dark:text-gray-400">Select the meaning</span>
                    
                    <div class="flex-grow w-full flex items-center justify-center overflow-hidden px-4 mt-6">
                        <span class="font-black text-gray-800 dark:text-white leading-none select-none ${fontClass}" 
                              data-fit="true">
                             ${target.front.main}
                        </span>
                    </div>
                     ${target.front.sub ? `<div class="mt-4 text-indigo-500 dark:text-dark-primary font-bold text-xl">${target.front.sub}</div>` : ''}
                </div>

                <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow content-start">
                    ${choices.map(choice => `
                        <button class="quiz-option relative w-full p-5 bg-white dark:bg-dark-card border-2 border-gray-100 dark:border-dark-border rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left group" data-id="${choice.id}">
                            <div class="text-lg font-bold text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-dark-primary leading-tight">
                                ${choice.back.definition}
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // --- BINDINGS ---
        // 1. Resize Text
        requestAnimationFrame(() => {
            const fitEl = this.container.querySelector('[data-fit="true"]');
            if (fitEl) textService.fitText(fitEl);
        });

        // 2. Auto-Play Audio (Immediate)
        if(settings.autoPlay) {
             // Small delay to ensure previous audio is cleared and transition is started
            setTimeout(() => {
                audioService.speak(target.front.main, settings.targetLang);
            }, 200);
        }

        // 3. Event Listeners
        this.container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                this.handleAnswer(id, e.currentTarget);
            });
        });

        document.getElementById('quiz-random-btn').addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('quiz-close-btn').addEventListener('click', () => {
            // Stop audio when exiting quiz
            audioService.stop();
            window.dispatchEvent(new CustomEvent('router:home'));
        });

        const idInput = document.getElementById('quiz-id-input');
        idInput.addEventListener('change', (e) => {
            const newId = parseInt(e.target.value);
            if (vocabService.findIndexById(newId) !== -1) {
                this.nextQuestion(newId);
            } else {
                alert('ID not found');
                e.target.value = target.id; // reset
            }
        });
    }
}

export const quizApp = new QuizApp();
