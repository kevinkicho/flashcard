import './services/firebase';
import './styles/main.scss';
import { settingsService } from './services/settingsService';
import { flashcardApp } from './components/FlashcardApp';

// Mount
flashcardApp.mount('main-content');

// --- SETTINGS LOGIC ---
const modal = document.getElementById('settings-modal');
const backdrop = document.getElementById('modal-backdrop');
const openBtn = document.getElementById('settings-open-btn');
const doneBtn = document.getElementById('modal-done-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// Accordion
const accordionBtn = document.getElementById('display-accordion-btn');
const accordionContent = document.getElementById('display-options');
const accordionArrow = document.getElementById('accordion-arrow');

// Inputs
const targetSelect = document.getElementById('target-select');
const originSelect = document.getElementById('origin-select');
const vocabToggle = document.getElementById('toggle-vocab');
const readingToggle = document.getElementById('toggle-reading');
const sentenceToggle = document.getElementById('toggle-sentence');
const englishToggle = document.getElementById('toggle-english');
const audioToggle = document.getElementById('toggle-audio');

// Load Defaults
const saved = settingsService.get();
if(targetSelect) targetSelect.value = saved.targetLang;
if(originSelect) originSelect.value = saved.originLang;
vocabToggle.checked = saved.showVocab;
readingToggle.checked = saved.showReading;
sentenceToggle.checked = saved.showSentence;
englishToggle.checked = saved.showEnglish;
audioToggle.checked = saved.autoPlay;

// Handlers
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

accordionBtn.addEventListener('click', () => {
    accordionContent.classList.toggle('hidden');
    accordionArrow.style.transform = accordionContent.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
});

// Setting Updates
targetSelect.addEventListener('change', (e) => { settingsService.setTarget(e.target.value); flashcardApp.refresh(); });
originSelect.addEventListener('change', (e) => { settingsService.setOrigin(e.target.value); flashcardApp.refresh(); });

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
