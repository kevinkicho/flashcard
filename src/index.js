import './services/firebase';
import './styles/main.scss';
import { settingsService } from './services/settingsService';
import { vocabService } from './services/vocabService';
import { dictionaryService } from './services/dictionaryService';
import { auth, signInAnonymously } from './services/firebase';
import { flashcardApp } from './components/FlashcardApp';
import { quizApp } from './components/QuizApp';
import { sentencesApp } from './components/SentencesApp';
import { blanksApp } from './components/BlanksApp';
import { audioService } from './services/audioService';

// Logging
const originalLog = console.log; const originalWarn = console.warn; const originalError = console.error;
function logToScreen(type, args) { const box = document.getElementById('error-text'); if (box) { const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '); box.innerText += `[${type}] ${msg}\n`; box.scrollTop = box.scrollHeight; } }
console.log = function(...args) { originalLog.apply(console, args); logToScreen('LOG', args); };
console.warn = function(...args) { originalWarn.apply(console, args); logToScreen('WRN', args); };
console.error = function(...args) { originalError.apply(console, args); logToScreen('ERR', args); };

// Router
const views = { home: document.getElementById('main-menu'), flashcard: document.getElementById('flashcard-view'), quiz: document.getElementById('quiz-view'), sentences: document.getElementById('sentences-view'), blanks: document.getElementById('blanks-view') };

function renderView(viewName) {
    audioService.stop();
    
    // Manage Global Header Visibility
    if (viewName === 'home') {
        document.body.classList.remove('game-mode');
    } else {
        document.body.classList.add('game-mode');
    }

    Object.values(views).forEach(el => { if(el) el.classList.add('hidden'); });
    const target = views[viewName];
    if (target) {
        target.classList.remove('hidden');
        if (viewName === 'flashcard') flashcardApp.mount('flashcard-view');
        if (viewName === 'quiz') quizApp.mount('quiz-view');
        if (viewName === 'sentences') sentencesApp.mount('sentences-view');
        if (viewName === 'blanks') blanksApp.mount('blanks-view');
    }
}

function navigateTo(viewName) { history.pushState({ view: viewName }, '', `#${viewName}`); renderView(viewName); }
window.addEventListener('popstate', (e) => renderView(e.state ? e.state.view : 'home'));
window.addEventListener('router:home', () => history.back());

const bindNav = (id, view) => { const btn = document.getElementById(id); if(btn) btn.addEventListener('click', () => navigateTo(view)); };
bindNav('menu-flashcard-btn', 'flashcard');
bindNav('menu-quiz-btn', 'quiz');
bindNav('menu-sentences-btn', 'sentences');
bindNav('menu-blanks-btn', 'blanks');

// Fullscreen
document.getElementById('fullscreen-btn').addEventListener('click', () => {
    (!document.fullscreenElement) ? document.documentElement.requestFullscreen() : document.exitFullscreen();
});

// Dictionary
const popup = document.getElementById('dictionary-popup');
const popupContent = document.getElementById('dict-content');
const popupClose = document.getElementById('dict-close-btn');
let longPressTimer = null;
let startX = 0, startY = 0;

function showDictionary(text) {
    const results = dictionaryService.lookupText(text);
    if (results.length > 0 && popup) {
        popupContent.innerHTML = results.map(data => `
            <div class="flex flex-col gap-2 mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div class="flex items-end gap-3"><div class="text-4xl font-black text-indigo-600 dark:text-indigo-400">${data.simp}</div>${data.trad!==data.simp?`<div class="text-xl text-gray-500 font-serif">${data.trad}</div>`:''}</div>
                <div class="pl-1 space-y-1">
                    <div class="flex items-center gap-2"><span class="text-[10px] text-gray-400 uppercase font-bold w-12">Pinyin</span><span class="text-lg font-medium text-gray-800 dark:text-white">${data.pinyin||'-'}</span></div>
                    <div class="flex items-start gap-2"><span class="text-[10px] text-gray-400 uppercase font-bold w-12 mt-1">English</span><span class="text-sm text-gray-600 dark:text-gray-300 flex-1">${data.en||'-'}</span></div>
                    <div class="flex items-start gap-2"><span class="text-[10px] text-gray-400 uppercase font-bold w-12 mt-1">Korean</span><span class="text-sm text-gray-600 dark:text-gray-300 flex-1">${data.ko||'-'}</span></div>
                </div>
            </div>
        `).join('');
        popup.classList.remove('hidden');
        // Small delay to ensure transition works
        setTimeout(() => popup.classList.remove('opacity-0'), 10);
        
        if (settingsService.get().dictAudio) {
            const u = new SpeechSynthesisUtterance(results[0].simp); u.lang = 'zh-CN'; window.speechSynthesis.speak(u);
        }
    }
}

if(popupClose) popupClose.addEventListener('click', () => {
    popup.classList.add('opacity-0');
    setTimeout(() => popup.classList.add('hidden'), 200);
});

const handleStart = (e) => {
    if (!settingsService.get().dictEnabled) return;
    const target = e.target.closest('.quiz-option, #flashcard-text, #quiz-question-box, #blanks-question-box, .user-word, .bank-word');
    if (!target) return;

    if (e.type === 'touchstart') { startX = e.touches[0].clientX; startY = e.touches[0].clientY; } 
    else { startX = e.clientX; startY = e.clientY; }

    longPressTimer = setTimeout(() => { showDictionary(target.textContent.trim()); }, 600);
};

const handleMove = (e) => {
    if (!longPressTimer) return;
    let clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    let clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    if (Math.abs(clientX - startX) > 10 || Math.abs(clientY - startY) > 10) { clearTimeout(longPressTimer); longPressTimer = null; }
};

const handleEnd = () => { if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; } };

document.addEventListener('touchstart', handleStart, { passive: true });
document.addEventListener('touchend', handleEnd);
document.addEventListener('touchmove', handleMove);
document.addEventListener('mousedown', handleStart);
document.addEventListener('mouseup', handleEnd);
document.addEventListener('mousemove', handleMove);

// Init
async function initApp() {
    try {
        const saved = settingsService.get();
        if (saved.darkMode) document.documentElement.classList.add('dark');
        
        updateSplashCheck(0, 'active');
        await signInAnonymously(auth);
        updateSplashCheck(0, 'done');

        updateSplashCheck(1, 'active');
        await vocabService.fetchData();
        updateSplashCheck(1, 'done');

        updateSplashCheck(2, 'active');
        await dictionaryService.fetchData();
        updateSplashCheck(2, 'done');

        const startBtn = document.getElementById('start-app-btn');
        if(startBtn) {
            startBtn.disabled = false;
            startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            startBtn.classList.add('bg-indigo-600', 'text-white');
            startBtn.innerText = "Start Learning";
            startBtn.onclick = () => {
                const silent = new SpeechSynthesisUtterance(''); window.speechSynthesis.speak(silent);
                document.getElementById('splash-screen').style.display = 'none';
                document.body.classList.remove('is-loading');
                renderView('home');
            };
        }
    } catch(e) { console.error("Init Error", e); }
}

function updateSplashCheck(index, state) {
    const checks = [document.getElementById('check-0'), document.getElementById('check-1'), document.getElementById('check-2')];
    if(checks[index]) {
        if(state==='active') checks[index].style.borderColor = '#6366f1';
        else checks[index].style.backgroundColor = '#22c55e';
    }
}
initApp();

// Settings Logic (Fixed Opacity)
const settingsModal = document.getElementById('settings-modal');
const openModal = () => {
    settingsModal.classList.remove('hidden');
    setTimeout(() => settingsModal.classList.remove('opacity-0'), 10);
};
const closeModal = () => {
    settingsModal.classList.add('opacity-0');
    setTimeout(() => settingsModal.classList.add('hidden'), 200);
};

document.getElementById('settings-open-btn').addEventListener('click', openModal);
document.getElementById('modal-done-btn').addEventListener('click', closeModal);

// Settings Accordions
const accordions = [
    { btn: 'dict-accordion-btn', content: 'dict-options', arrow: 'accordion-arrow-dict' },
    { btn: 'display-accordion-btn', content: 'display-options', arrow: 'accordion-arrow-1' },
    { btn: 'quiz-accordion-btn', content: 'quiz-options', arrow: 'accordion-arrow-3' },
    { btn: 'sent-accordion-btn', content: 'sent-options', arrow: 'accordion-arrow-sent' },
    { btn: 'blanks-accordion-btn', content: 'blanks-options', arrow: 'accordion-arrow-blanks' }
];

accordions.forEach(acc => {
    const btn = document.getElementById(acc.btn);
    const content = document.getElementById(acc.content);
    const arrow = document.getElementById(acc.arrow);
    if(btn && content && arrow) {
        btn.addEventListener('click', () => {
            content.classList.toggle('open');
            arrow.classList.toggle('rotate');
        });
    }
});
