import './services/firebase';
import './styles/main.scss';
import { settingsService } from './services/settingsService';
import { flashcardApp } from './components/FlashcardApp';

// --- INITIALIZATION ---
const splash = document.getElementById('splash-screen');
const startBtn = document.getElementById('start-app-btn');
const checks = [
    document.getElementById('check-1'),
    document.getElementById('check-2'),
    document.getElementById('check-3')
];

// FAKE LOADING SEQUENCE
function initApp() {
    let delay = 500;
    
    checks.forEach((check, index) => {
        setTimeout(() => {
            check.className = "w-4 h-4 bg-green-500 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-green-200";
            check.innerHTML = `<svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`;
            
            // On last check
            if (index === checks.length - 1) {
                setTimeout(() => {
                    startBtn.disabled = false;
                    startBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'scale-95');
                    startBtn.classList.add('bg-indigo-600', 'text-white', 'shadow-xl', 'hover:bg-indigo-700', 'active:scale-95');
                    startBtn.textContent = "Start Learning";
                }, 500);
            }
        }, delay);
        delay += 800; // Stagger checks
    });
}

// Start button click
startBtn.addEventListener('click', () => {
    splash.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        splash.style.display = 'none';
        flashcardApp.mount('main-content');
    }, 500);
});

// Run Init
initApp();

// --- SETTINGS ELEMENTS ---
const modal = document.getElementById('settings-modal');
const backdrop = document.getElementById('modal-backdrop');
const openBtn = document.getElementById('settings-open-btn');
const doneBtn = document.getElementById('modal-done-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// Accordions
const acc1Btn = document.getElementById('display-accordion-btn');
const acc1Content = document.getElementById('display-options');
const acc1Arrow = document.getElementById('accordion-arrow-1');

const acc2Btn = document.getElementById('audio-accordion-btn');
const acc2Content = document.getElementById('audio-options');
const acc2Arrow = document.getElementById('accordion-arrow-2');

// Inputs
const targetSelect = document.getElementById('target-select');
const originSelect = document.getElementById('origin-select');
const darkToggle = document.getElementById('toggle-dark');
const vocabToggle = document.getElementById('toggle-vocab');
const readingToggle = document.getElementById('toggle-reading');
const sentenceToggle = document.getElementById('toggle-sentence');
const englishToggle = document.getElementById('toggle-english');
const audioToggle = document.getElementById('toggle-audio');

// --- LOAD SETTINGS ---
const saved = settingsService.get();
if(targetSelect) targetSelect.value = saved.targetLang;
if(originSelect) originSelect.value = saved.originLang;

// Visuals
vocabToggle.checked = saved.showVocab;
readingToggle.checked = saved.showReading;
sentenceToggle.checked = saved.showSentence;
englishToggle.checked = saved.showEnglish;
audioToggle.checked = saved.autoPlay;
darkToggle.checked = saved.darkMode;

// Apply Dark Mode Immediately
if (saved.darkMode) document.documentElement.classList.add('dark');

// --- EVENT HANDLERS ---

// Modals
function openModal() {
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}
function closeModal() {
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 200);
}
openBtn.addEventListener('click', openModal);
doneBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);

// Accordions
function toggleAccordion(content, arrow) {
    content.classList.toggle('hidden');
    arrow.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}
acc1Btn.addEventListener('click', () => toggleAccordion(acc1Content, acc1Arrow));
acc2Btn.addEventListener('click', () => toggleAccordion(acc2Content, acc2Arrow));

// Settings Changes
targetSelect.addEventListener('change', (e) => { settingsService.setTarget(e.target.value); flashcardApp.refresh(); });
originSelect.addEventListener('change', (e) => { settingsService.setOrigin(e.target.value); flashcardApp.refresh(); });

// Dark Mode
darkToggle.addEventListener('change', (e) => {
    settingsService.set('darkMode', e.target.checked);
    if (e.target.checked) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
});

// Toggles
vocabToggle.addEventListener('change', (e) => { settingsService.set('showVocab', e.target.checked); flashcardApp.refresh(); });
readingToggle.addEventListener('change', (e) => { settingsService.set('showReading', e.target.checked); flashcardApp.refresh(); });
sentenceToggle.addEventListener('change', (e) => { settingsService.set('showSentence', e.target.checked); flashcardApp.refresh(); });
englishToggle.addEventListener('change', (e) => { settingsService.set('showEnglish', e.target.checked); flashcardApp.refresh(); });
audioToggle.addEventListener('change', (e) => { settingsService.set('autoPlay', e.target.checked); });

// Fullscreen
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
});
