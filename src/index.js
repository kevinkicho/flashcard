import './services/firebase';
import './styles/main.scss';
import { settingsService } from './services/settingsService';
import { flashcardApp } from './components/FlashcardApp';

// 1. Mount App
flashcardApp.mount('main-content');

// 2. DOM Elements
const modal = document.getElementById('settings-modal');
const backdrop = document.getElementById('modal-backdrop');
const openBtn = document.getElementById('settings-open-btn');
const doneBtn = document.getElementById('modal-done-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');

const targetSelect = document.getElementById('target-select');
const originSelect = document.getElementById('origin-select');
const fontSelect = document.getElementById('font-select');

// 3. Load & Apply Settings
const saved = settingsService.get();
if(targetSelect) targetSelect.value = saved.targetLang;
if(originSelect) originSelect.value = saved.originLang;
if(fontSelect) fontSelect.value = saved.font;
applyFont(saved.font);

// 4. Fullscreen Logic (Immersive Mode)
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

// 5. Modal Logic
function openModal() {
    modal.classList.remove('hidden');
    // Small timeout to allow display:block to render before opacity transition
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeModal() {
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 200);
}

openBtn.addEventListener('click', openModal);
doneBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);

// 6. Settings Change Listeners
targetSelect.addEventListener('change', (e) => {
    settingsService.setTarget(e.target.value);
    flashcardApp.refresh();
});

originSelect.addEventListener('change', (e) => {
    settingsService.setOrigin(e.target.value);
    flashcardApp.refresh();
});

fontSelect.addEventListener('change', (e) => {
    const newFont = e.target.value;
    settingsService.setFont(newFont);
    applyFont(newFont);
});

function applyFont(fontClass) {
    // Reset classes
    document.body.classList.remove('font-inter', 'font-lato', 'font-roboto');
    // Apply new class
    document.body.classList.add(fontClass);
}
