import './services/firebase';
import './styles/main.scss';
import { settingsService } from './services/settingsService';
import { flashcardApp } from './components/FlashcardApp';
import { quizApp } from './components/QuizApp';
import { audioService } from './services/audioService';

// --- FOUC FIX ---
// Remove loading class immediately so transitions can start
document.body.classList.remove('is-loading');

// --- ELEMENTS ---
const mainMenu = document.getElementById('main-menu');
const flashcardView = document.getElementById('flashcard-view');
const quizView = document.getElementById('quiz-view');
const menuFlashcardBtn = document.getElementById('menu-flashcard-btn');
const menuQuizBtn = document.getElementById('menu-quiz-btn');
const splash = document.getElementById('splash-screen');
const startBtn = document.getElementById('start-app-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// --- ROUTER (With 1s Delays) ---
function showMenu() {
    // Stop any audio when returning to menu
    audioService.stop();
    flashcardView.classList.add('hidden');
    quizView.classList.add('hidden');
    // Delay menu appearance
    setTimeout(() => {
        mainMenu.classList.remove('translate-y-full', 'opacity-0');
    }, 50);
}

function showFlashcard() {
    mainMenu.classList.add('translate-y-full', 'opacity-0');
    // 1 Second breathing room
    setTimeout(() => {
        flashcardView.classList.remove('hidden');
        flashcardApp.mount('flashcard-view');
    }, 1000);
}

function showQuiz() {
    mainMenu.classList.add('translate-y-full', 'opacity-0');
    // 1 Second breathing room
    setTimeout(() => {
        quizView.classList.remove('hidden');
        quizApp.mount('quiz-view');
    }, 1000);
}

window.addEventListener('router:home', showMenu);
menuFlashcardBtn.addEventListener('click', showFlashcard);
menuQuizBtn.addEventListener('click', showQuiz);

// --- STARTUP ---
const checks = [document.getElementById('check-1'), document.getElementById('check-2'), document.getElementById('check-3')];
function initApp() {
    if (settingsService.get().darkMode) document.documentElement.classList.add('dark');
    let delay = 500;
    checks.forEach((check, index) => {
        setTimeout(() => {
            check.className = "w-4 h-4 bg-green-500 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-green-200";
            check.innerHTML = `<svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`;
            if (index === checks.length - 1) {
                setTimeout(() => {
                    startBtn.disabled = false;
                    startBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'scale-95');
                    startBtn.classList.add('bg-indigo-600', 'dark:bg-dark-primary', 'text-white', 'shadow-xl', 'hover:bg-indigo-700', 'active:scale-95');
                    startBtn.textContent = "Start Learning";
                }, 500);
            }
        }, delay);
        delay += 600;
    });
}
startBtn.addEventListener('click', () => {
    splash.classList.add('opacity-0', 'pointer-events-none');
    // 1 Second delay before showing menu
    setTimeout(() => { splash.style.display = 'none'; showMenu(); }, 1000);
});
initApp();

// --- SETTINGS LOGIC (Keep existing code) ---
const modal = document.getElementById('settings-modal');
const backdrop = document.getElementById('modal-backdrop');
const openBtn = document.getElementById('settings-open-btn');
const doneBtn = document.getElementById('modal-done-btn');

const targetSelect = document.getElementById('target-select');
const originSelect = document.getElementById('origin-select');
const darkToggle = document.getElementById('toggle-dark');
const vocabToggle = document.getElementById('toggle-vocab');
const readingToggle = document.getElementById('toggle-reading');
const sentenceToggle = document.getElementById('toggle-sentence');
const englishToggle = document.getElementById('toggle-english');
const audioToggle = document.getElementById('toggle-audio');
const quizChoicesSelect = document.getElementById('quiz-choices-select');

// Accordions
const acc1Btn = document.getElementById('display-accordion-btn');
const acc1Content = document.getElementById('display-options');
const acc1Arrow = document.getElementById('accordion-arrow-1');
const acc2Btn = document.getElementById('audio-accordion-btn');
const acc2Content = document.getElementById('audio-options');
const acc2Arrow = document.getElementById('accordion-arrow-2');
const acc3Btn = document.getElementById('quiz-accordion-btn');
const acc3Content = document.getElementById('quiz-options');
const acc3Arrow = document.getElementById('accordion-arrow-3');

// Logic
function openModal() { modal.classList.remove('hidden'); setTimeout(() => modal.classList.remove('opacity-0'), 10); }
function closeModal() { modal.classList.add('opacity-0'); setTimeout(() => modal.classList.add('hidden'), 200); }
function toggleAccordion(c, a) { c.classList.toggle('hidden'); a.style.transform = c.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)'; }

openBtn.addEventListener('click', openModal);
doneBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);
acc1Btn.addEventListener('click', () => toggleAccordion(acc1Content, acc1Arrow));
acc2Btn.addEventListener('click', () => toggleAccordion(acc2Content, acc2Arrow));
acc3Btn.addEventListener('click', () => toggleAccordion(acc3Content, acc3Arrow));

// Updates
targetSelect.addEventListener('change', (e) => { settingsService.setTarget(e.target.value); flashcardApp.refresh(); });
originSelect.addEventListener('change', (e) => { settingsService.setOrigin(e.target.value); flashcardApp.refresh(); });
vocabToggle.addEventListener('change', (e) => { settingsService.set('showVocab', e.target.checked); flashcardApp.refresh(); });
readingToggle.addEventListener('change', (e) => { settingsService.set('showReading', e.target.checked); flashcardApp.refresh(); });
sentenceToggle.addEventListener('change', (e) => { settingsService.set('showSentence', e.target.checked); flashcardApp.refresh(); });
englishToggle.addEventListener('change', (e) => { settingsService.set('showEnglish', e.target.checked); flashcardApp.refresh(); });
audioToggle.addEventListener('change', (e) => { settingsService.set('autoPlay', e.target.checked); });
quizChoicesSelect.addEventListener('change', (e) => { settingsService.set('quizChoices', e.target.value); });

darkToggle.addEventListener('change', (e) => {
    settingsService.set('darkMode', e.target.checked);
    if (e.target.checked) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
});

// Load Saved
const saved = settingsService.get();
if(targetSelect) targetSelect.value = saved.targetLang;
if(originSelect) originSelect.value = saved.originLang;
vocabToggle.checked = saved.showVocab;
readingToggle.checked = saved.showReading;
sentenceToggle.checked = saved.showSentence;
englishToggle.checked = saved.showEnglish;
audioToggle.checked = saved.autoPlay;
darkToggle.checked = saved.darkMode;
if(quizChoicesSelect) quizChoicesSelect.value = saved.quizChoices;

// Fullscreen
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(console.log);
    else if (document.exitFullscreen) document.exitFullscreen();
});
