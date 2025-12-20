import './services/firebase';
import './styles/main.scss';
import { settingsService } from './services/settingsService';
import { vocabService } from './services/vocabService';
import { dictionaryService } from './services/dictionaryService';
import { scoreService } from './services/scoreService'; 
import { achievementService } from './services/achievementService'; 
import { ACHIEVEMENTS } from './data/achievements';
import { auth, onAuthStateChanged, googleProvider, signInWithPopup, signOut, update, ref, db, signInAnonymously, get } from './services/firebase';
import { flashcardApp } from './components/FlashcardApp';
import { quizApp } from './components/QuizApp';
import { sentencesApp } from './components/SentencesApp';
import { blanksApp } from './components/BlanksApp';
import { listeningApp } from './components/ListeningApp'; 
import { matchApp } from './components/MatchApp'; 
import { memoryApp } from './components/MemoryApp'; 
import { finderApp } from './components/FinderApp';
import { constructorApp } from './components/ConstructorApp';
import { writingApp } from './components/WritingApp';
import { trueFalseApp } from './components/TrueFalseApp';
import { reverseApp } from './components/ReverseApp';
import { audioService } from './services/audioService';
import { textService } from './services/textService';

window.wasLongPress = false;

if ('serviceWorker' in navigator) { 
    window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW failed', err)); }); 
}

let savedHistory = {}; 
try { savedHistory = JSON.parse(localStorage.getItem('polyglot_history') || '{}'); } catch (e) {}
window.saveGameHistory = (game, id) => { 
    if (id) { 
        savedHistory[game] = id; 
        localStorage.setItem('polyglot_history', JSON.stringify(savedHistory)); 
    } 
};

let currentActiveApp = null;

document.addEventListener('DOMContentLoaded', () => {
    try { scoreService.init(); } catch(e){ console.error("Score Init Error", e); }

    const views = { 
        home: document.getElementById('main-menu'), 
        flashcard: document.getElementById('flashcard-view'), 
        quiz: document.getElementById('quiz-view'), 
        sentences: document.getElementById('sentences-view'), 
        blanks: document.getElementById('blanks-view'),
        listening: document.getElementById('listening-view'),
        match: document.getElementById('match-view'),
        memory: document.getElementById('memory-view'),
        finder: document.getElementById('finder-view'),
        constructor: document.getElementById('constructor-view'),
        writing: document.getElementById('writing-view'),
        truefalse: document.getElementById('truefalse-view'),
        reverse: document.getElementById('reverse-view')
    };

    const iconOut = document.getElementById('icon-user-out'); 
    const iconIn = document.getElementById('icon-user-in'); 
    let currentUser = null;

    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (user) { 
            if(!user.isAnonymous) {
                if(iconOut) iconOut.classList.add('hidden'); 
                if(iconIn) { iconIn.classList.remove('hidden'); iconIn.src = user.photoURL; }
            }
            await loadApplicationData();
        } else { 
            try { await signInAnonymously(auth); } catch(e) { console.error("Auth Error", e); } 
            if(iconOut) iconOut.classList.remove('hidden'); 
            if(iconIn) iconIn.classList.add('hidden'); 
        }
        updateEditPermissions();
    });

    async function loadApplicationData() {
        const startBtn = document.getElementById('start-app-btn');
        if(startBtn) startBtn.innerText = "Loading Data...";

        try {
            const saved = settingsService.get(); 
            if(saved.darkMode) document.documentElement.classList.add('dark');
            await vocabService.reload(); 
            dictionaryService.fetchData();

            if (!vocabService.hasData()) throw new Error("No vocabulary data.");

            if(startBtn) {
                startBtn.disabled = false; 
                startBtn.classList.remove('opacity-50', 'cursor-not-allowed'); 
                startBtn.classList.add('bg-indigo-600', 'text-white'); 
                startBtn.innerText = "Start Learning";
                startBtn.onclick = () => {
                    const s = new SpeechSynthesisUtterance(''); window.speechSynthesis.speak(s);
                    const splash = document.getElementById('splash-screen');
                    if(splash) splash.style.display = 'none'; 
                    document.body.classList.remove('is-loading'); 
                    renderView('home');
                };
            }
        } catch(e) {
            console.error("Data Load Error:", e);
            if(startBtn) { startBtn.disabled = false; startBtn.innerText = "Retry"; startBtn.onclick = () => window.location.reload(); }
        }
    }

    const loginBtn = document.getElementById('user-login-btn');
    if (loginBtn) loginBtn.addEventListener('click', async () => { if (currentUser && !currentUser.isAnonymous) { if(confirm("Log out?")) await signOut(auth); } else { try { await signInWithPopup(auth, googleProvider); } catch(e){} } });

    function updateEditPermissions() { 
        const isAdmin = currentUser && currentUser.email === 'kevinkicho@gmail.com'; 
        const btns = document.querySelectorAll('#btn-save-vocab, .btn-save-dict, #btn-add-dict');
        btns.forEach(btn => { if(btn.id === 'btn-add-dict') btn.style.display = isAdmin ? 'block' : 'none'; else { btn.disabled = !isAdmin; btn.style.display = isAdmin ? 'block' : 'none'; } }); 
    }

    function renderView(viewName) { 
        audioService.stop(); 
        if (viewName === 'home') document.body.classList.remove('game-mode'); 
        else document.body.classList.add('game-mode'); 
        
        Object.values(views).forEach(el => { if(el) el.classList.add('hidden'); }); 
        
        const target = views[viewName]; 
        currentActiveApp = null; 

        if (target) { 
            target.classList.remove('hidden'); 
            const lastId = savedHistory[viewName]; 
            
            if (viewName === 'flashcard' && views.flashcard) { flashcardApp.mount('flashcard-view'); currentActiveApp = flashcardApp; if(lastId) flashcardApp.goto(lastId); } 
            if (viewName === 'quiz' && views.quiz) { quizApp.mount('quiz-view'); currentActiveApp = quizApp; if(lastId) quizApp.next(lastId); } 
            if (viewName === 'sentences' && views.sentences) { sentencesApp.mount('sentences-view'); currentActiveApp = sentencesApp; if(lastId) sentencesApp.next(lastId); } 
            if (viewName === 'blanks' && views.blanks) { blanksApp.mount('blanks-view'); currentActiveApp = blanksApp; if(lastId) blanksApp.next(lastId); }
            if (viewName === 'listening' && views.listening) { listeningApp.mount('listening-view'); currentActiveApp = listeningApp; if(lastId) listeningApp.next(lastId); }
            if (viewName === 'match' && views.match) { matchApp.mount('match-view'); currentActiveApp = matchApp; }
            if (viewName === 'memory' && views.memory) { memoryApp.mount('memory-view'); currentActiveApp = memoryApp; }
            if (viewName === 'finder' && views.finder) { finderApp.mount('finder-view'); currentActiveApp = finderApp; }
            if (viewName === 'constructor' && views.constructor) { constructorApp.mount('constructor-view'); currentActiveApp = constructorApp; }
            if (viewName === 'writing' && views.writing) { writingApp.mount('writing-view'); currentActiveApp = writingApp; }
            if (viewName === 'truefalse' && views.truefalse) { trueFalseApp.mount('truefalse-view'); currentActiveApp = trueFalseApp; }
            if (viewName === 'reverse' && views.reverse) { reverseApp.mount('reverse-view'); currentActiveApp = reverseApp; }
        } 
    }

    const bindNav = (id, view) => { const btn = document.getElementById(id); if(btn) btn.addEventListener('click', () => { history.pushState({view}, '', `#${view}`); renderView(view); }); };
    ['flashcard','quiz','sentences','blanks','listening','match','memory','finder','constructor','writing','truefalse','reverse'].forEach(v => bindNav(`menu-${v}-btn`, v));

    window.addEventListener('popstate', (e) => renderView(e.state ? e.state.view : 'home'));
    window.addEventListener('router:home', () => history.back());
    vocabService.subscribe(() => { if (views.flashcard && !views.flashcard.classList.contains('hidden')) flashcardApp.refresh(); });

    let resizeTimer;
    window.addEventListener('resize', () => {
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { if (currentActiveApp && currentActiveApp.render) currentActiveApp.render(); else document.querySelectorAll('[data-fit="true"]').forEach(el => textService.fitText(el)); }, 100);
    });

    const achPopup = document.getElementById('achievement-popup');
    window.addEventListener('achievement:unlocked', (e) => {
        const ach = e.detail; const t = document.getElementById('ach-popup-title'); const d = document.getElementById('ach-popup-desc'); const p = document.getElementById('ach-popup-pts');
        if(!t||!d||!p||!achPopup) return;
        t.textContent = ach.title; d.textContent = ach.desc; p.textContent = ach.points;
        achPopup.classList.remove('hidden'); setTimeout(() => achPopup.classList.add('hidden'), 4000);
    });

    const achBtn = document.getElementById('ach-btn');
    if(achBtn) achBtn.addEventListener('click', async () => {
        const achModal = document.getElementById('ach-list-modal');
        const achContent = document.getElementById('ach-list-content');
        if(!achModal || !achContent) return;
        
        achModal.classList.remove('hidden'); 
        setTimeout(()=>achModal.classList.remove('opacity-0'),10);
        achContent.innerHTML = '<div class="text-center p-4 text-white">Loading...</div>';
        
        let unlockedMap = {};
        if (currentUser) {
            try { unlockedMap = await achievementService.getUserAchievements(currentUser.uid) || {}; } catch(e){ console.error(e); }
        }
        
        let html = '';
        const sorted = [...ACHIEVEMENTS].sort((a,b) => { 
            const aU = !!unlockedMap[a.id], bU = !!unlockedMap[b.id]; 
            if (aU && !bU) return -1; if (!aU && bU) return 1; return b.points - a.points; 
        });
        
        sorted.forEach(ach => {
            const unlocked = !!unlockedMap[ach.id];
            const bg = unlocked ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200 dark:bg-gray-800 dark:border-yellow-900' : 'bg-gray-50 border-gray-100 dark:bg-black/20 dark:border-gray-800 opacity-60';
            const ic = unlocked ? '🏆' : '🔒';
            html += `<div class="flex items-center gap-3 p-3 rounded-xl border ${bg}"><div class="text-2xl">${ic}</div><div class="flex-1"><h4 class="font-bold text-sm ${unlocked?'dark:text-white':''}">${ach.title}</h4><p class="text-[10px] text-gray-500">${ach.desc}</p></div><div class="text-xs font-black text-orange-500">+${ach.points}</div></div>`;
        });
        achContent.innerHTML = html;
    });

    const achClose = document.getElementById('ach-list-close');
    if (achClose) achClose.addEventListener('click', ()=>{ const m = document.getElementById('ach-list-modal'); if(m) { m.classList.add('opacity-0'); setTimeout(()=>m.classList.add('hidden'),200); }});

    const scoreModal = document.getElementById('score-modal');
    const scoreClose = document.getElementById('score-close-btn');
    let chartDataCache=null, showingWeeklyScore=false;
    scoreService.subscribe((s) => { document.querySelectorAll('.global-score-display').forEach(el=>el.textContent=s); });
    
    document.addEventListener('click', (e) => {
        if(e.target.closest('#score-pill')) showScoreChart();
        if(e.target.closest('#home-settings-btn')) openSettings();
        if(e.target.closest('#modal-done-btn')) closeSettings();
        if (e.target.closest('.game-edit-btn')) {
            let app = currentActiveApp; 
            if (app) {
                let item = app.currentData && (app.currentData.target || app.currentData.item) ? (app.currentData.target || app.currentData.item) : (app.currentData || (app.currentIndex!==undefined && vocabService.getAll().length > app.currentIndex ? vocabService.getAll()[app.currentIndex] : null));
                if (item && item.id) {
                    currentEditId = item.id;
                    const fullData = vocabService.getAll().find(v => v.id == item.id);
                    if(fullData) {
                        const em = document.getElementById('edit-modal');
                        if(em) { em.classList.remove('hidden'); setTimeout(()=>em.classList.remove('opacity-0'), 10); }
                        switchEditTab('vocab');
                        renderVocabEditFields(fullData);
                        populateDictionaryEdit((fullData.ja||'') + (fullData.ja_ex||'') + (fullData.zh||'') + (fullData.ko||''));
                        updateEditPermissions();
                    }
                }
            }
        }
    });

    if(scoreClose) scoreClose.addEventListener('click', ()=>{ if(scoreModal) { scoreModal.classList.add('opacity-0'); setTimeout(()=>scoreModal.classList.add('hidden'),200); }});
    const scoreTotalToggle = document.getElementById('score-total-toggle');
    if(scoreTotalToggle) scoreTotalToggle.addEventListener('click', ()=>{ showingWeeklyScore=!showingWeeklyScore; updateScoreDisplay(); });
    
    function updateScoreDisplay() {
        const label = document.getElementById('score-display-label');
        const val = document.getElementById('modal-today-score');
        if (!chartDataCache || !label || !val) return;
        if (showingWeeklyScore) {
            const total = chartDataCache.reduce((sum, d) => sum + d.total, 0);
            label.textContent = "Weekly Total"; val.textContent = total;
        } else {
            const todayStr = scoreService.getDateStr(new Date());
            const todayData = chartDataCache.find(d => d.dateStr === todayStr) || { total: 0 };
            label.textContent = "Today's Score"; val.textContent = todayData.total;
        }
    }

    async function showScoreChart() {
        if(!scoreModal) return;
        scoreModal.classList.remove('hidden'); setTimeout(()=>scoreModal.classList.remove('opacity-0'), 10);
        const container = document.getElementById('score-chart-container');
        const tooltipArea = document.getElementById('chart-tooltip-area');
        if(container) container.innerHTML = '<div class="flex justify-center items-center h-full text-gray-500">Loading...</div>';

        const curr = new Date(); const day = curr.getDay() || 7; curr.setDate(curr.getDate() - (day - 1)); curr.setHours(0,0,0,0);
        const weekDates = []; for (let i = 0; i < 7; i++) { const d = new Date(curr); d.setDate(curr.getDate() + i); weekDates.push(scoreService.getDateStr(d)); }
        const todayStr = scoreService.getDateStr(new Date());

        try {
            const statsRef = scoreService.getUserStatsRef(); 
            if (!statsRef) throw new Error("No User");
            const snap = await get(statsRef); 
            const data = snap.exists() ? snap.val() : {};
            const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            
            // KEY FIX: Safely retrieve numbers. If 'constructor' key is missing, d['constructor'] returns a function.
            // checking type ensures we only get numbers.
            const getVal = (obj, key) => (obj && typeof obj[key] === 'number') ? obj[key] : 0;

            chartDataCache = weekDates.map((date, i) => {
                const d = data[date] || {};
                const fc = getVal(d, 'flashcard'), qz = getVal(d, 'quiz'), st = getVal(d, 'sentences'), bl = getVal(d, 'blanks');
                const li = getVal(d, 'listening'), ma = getVal(d, 'match'), me = getVal(d, 'memory'), fi = getVal(d, 'finder');
                const co = getVal(d, 'constructor'), wr = getVal(d, 'writing'), tf = getVal(d, 'truefalse'), rv = getVal(d, 'reverse');
                
                return { 
                    dateStr: date, label: dayLabels[i], 
                    fc, qz, st, bl, li, ma, me, fi, co, wr, tf, rv,
                    total: fc+qz+st+bl+li+ma+me+fi+co+wr+tf+rv
                };
            });
            
            const maxScore = Math.max(...chartDataCache.map(s => s.total), 50);
            let html = '';
            chartDataCache.forEach((s, idx) => {
                const heightPct = Math.round((s.total / maxScore) * 100);
                const isToday = s.dateStr === todayStr;
                const labelColor = isToday ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-gray-400';
                const t = s.total || 1;
                html += `
                <div class="chart-bar-container group relative" data-idx="${idx}">
                    <div class="chart-bar flex-col-reverse border-2 border-white dark:border-gray-700 shadow-sm" style="height: ${heightPct}%;">
                        ${s.fc>0?`<div style="height:${(s.fc/t)*100}%;" class="w-full bg-indigo-500"></div>`:''}
                        ${s.qz>0?`<div style="height:${(s.qz/t)*100}%;" class="w-full bg-purple-500"></div>`:''}
                        ${s.st>0?`<div style="height:${(s.st/t)*100}%;" class="w-full bg-pink-500"></div>`:''}
                        ${s.bl>0?`<div style="height:${(s.bl/t)*100}%;" class="w-full bg-teal-500"></div>`:''}
                        ${s.li>0?`<div style="height:${(s.li/t)*100}%;" class="w-full bg-blue-500"></div>`:''}
                        ${s.ma>0?`<div style="height:${(s.ma/t)*100}%;" class="w-full bg-yellow-500"></div>`:''}
                        ${s.me>0?`<div style="height:${(s.me/t)*100}%;" class="w-full bg-purple-400"></div>`:''}
                        ${s.fi>0?`<div style="height:${(s.fi/t)*100}%;" class="w-full bg-rose-500"></div>`:''}
                        ${s.co>0?`<div style="height:${(s.co/t)*100}%;" class="w-full bg-emerald-500"></div>`:''}
                        ${s.wr>0?`<div style="height:${(s.wr/t)*100}%;" class="w-full bg-cyan-500"></div>`:''}
                        ${s.tf>0?`<div style="height:${(s.tf/t)*100}%;" class="w-full bg-orange-500"></div>`:''}
                        ${s.rv>0?`<div style="height:${(s.rv/t)*100}%;" class="w-full bg-indigo-400"></div>`:''}
                    </div>
                    <span class="chart-label ${labelColor}">${s.label.charAt(0)}</span>
                </div>`;
            });
            if(container) {
                container.innerHTML = html;
                updateScoreDisplay();
                container.querySelectorAll('.chart-bar-container').forEach(el => { el.addEventListener('click', (e) => { e.stopPropagation(); container.querySelectorAll('.chart-bar').forEach(b => b.classList.remove('ring-2', 'ring-indigo-400')); el.querySelector('.chart-bar').classList.add('ring-2', 'ring-indigo-400'); const s=chartDataCache[el.dataset.idx]; if(tooltipArea) tooltipArea.innerHTML = `<div class="flex gap-2 text-xs font-bold items-center flex-wrap justify-center"><span class="text-gray-500 dark:text-gray-300 uppercase">${s.label}</span><span class="text-gray-800 dark:text-white border-l border-gray-300 pl-2">Tot: ${s.total}</span></div>`; }); });
            }
        } catch (e) { console.error("Chart Error", e); if(container) container.innerHTML = `<div class="text-red-500 p-4 text-xs">Error</div>`; }
    }

    const settingsModal = document.getElementById('settings-modal');
    const openSettings = () => { if(settingsModal){ loadSettingsToUI(); settingsModal.classList.remove('hidden'); setTimeout(()=>settingsModal.classList.remove('opacity-0'), 10); }};
    const closeSettings = () => { if(settingsModal){ settingsModal.classList.add('opacity-0'); setTimeout(()=>settingsModal.classList.add('hidden'), 200); }};
    function loadSettingsToUI() {
        const s = settingsService.get();
        const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
        const setChk = (id, val) => { const el = document.getElementById(id); if(el) el.checked = val; };
        setVal('target-select', s.targetLang); setVal('origin-select', s.originLang);
        setChk('toggle-dark', s.darkMode); setChk('toggle-audio', s.autoPlay); setChk('toggle-wait-audio', s.waitForAudio); setChk('toggle-click-audio', s.clickAudio);
        setVal('volume-slider', s.volume !== undefined ? s.volume : 1.0); setVal('font-family-select', s.fontFamily); setVal('font-weight-select', s.fontWeight);
        setChk('toggle-vocab', s.showVocab); setChk('toggle-sentence', s.showSentence); setChk('toggle-english', s.showEnglish);
        setChk('toggle-dict-enable', s.dictEnabled); setChk('toggle-dict-click-audio', s.dictClickAudio);
        setChk('toggle-quiz-audio', s.quizAnswerAudio); setChk('toggle-quiz-autoplay-correct', s.quizAutoPlayCorrect); setChk('toggle-quiz-double', s.quizDoubleClick);
        setChk('toggle-sent-audio', s.sentencesWordAudio); setChk('toggle-blanks-audio', s.blanksAnswerAudio); setChk('toggle-blanks-double', s.blanksDoubleClick);
        setChk('toggle-sent-anim', s.sentencesWinAnim !== false);
    }
    function bindSetting(id, key, cb) { const el = document.getElementById(id); if(el) el.addEventListener('change', (e) => { settingsService.set(key, e.target.type==='checkbox'?e.target.checked:e.target.value); if(cb) cb(); }); }
    bindSetting('target-select', 'targetLang', ()=>flashcardApp.refresh()); bindSetting('origin-select', 'originLang', ()=>flashcardApp.refresh());
    bindSetting('toggle-dark', 'darkMode', () => document.documentElement.classList.toggle('dark')); bindSetting('toggle-audio', 'autoPlay'); bindSetting('toggle-wait-audio', 'waitForAudio'); bindSetting('volume-slider', 'volume'); bindSetting('font-family-select', 'fontFamily', () => document.querySelectorAll('[data-fit="true"]').forEach(el => textService.fitText(el))); bindSetting('font-weight-select', 'fontWeight', () => document.querySelectorAll('[data-fit="true"]').forEach(el => textService.fitText(el))); bindSetting('toggle-vocab', 'showVocab', ()=>flashcardApp.refresh()); bindSetting('toggle-sentence', 'showSentence', ()=>flashcardApp.refresh()); bindSetting('toggle-english', 'showEnglish', ()=>flashcardApp.refresh()); bindSetting('toggle-dict-enable', 'dictEnabled'); bindSetting('toggle-dict-click-audio', 'dictClickAudio'); bindSetting('toggle-quiz-audio', 'quizAnswerAudio'); bindSetting('toggle-quiz-autoplay-correct', 'quizAutoPlayCorrect'); bindSetting('toggle-quiz-double', 'quizDoubleClick'); bindSetting('toggle-sent-audio', 'sentencesWordAudio'); bindSetting('toggle-blanks-audio', 'blanksAnswerAudio'); bindSetting('toggle-blanks-double', 'blanksDoubleClick'); bindSetting('toggle-sent-anim', 'sentencesWinAnim'); bindSetting('toggle-click-audio', 'clickAudio');
    [{btn:'dict-accordion-btn',c:'dict-options',a:'accordion-arrow-dict'},{btn:'display-accordion-btn',c:'display-options',a:'accordion-arrow-1'},{btn:'quiz-accordion-btn',c:'quiz-options',a:'accordion-arrow-3'},{btn:'sent-accordion-btn',c:'sent-options',a:'accordion-arrow-sent'},{btn:'blanks-accordion-btn',c:'blanks-options',a:'accordion-arrow-blanks'},{btn:'fonts-accordion-btn',c:'fonts-options',a:'accordion-arrow-fonts'}].forEach(o=>{ const b=document.getElementById(o.btn), c=document.getElementById(o.c), a=document.getElementById(o.a); if(b) b.addEventListener('click', ()=>{ c.classList.toggle('open'); a.classList.toggle('rotate'); }); });

    let currentEditId = null;
    function switchEditTab(tab) {
        const tabVocab = document.getElementById('edit-tab-vocab'); const tabDict = document.getElementById('edit-tab-dict'); const tabVocabBtn = document.getElementById('tab-vocab-btn'); const tabDictBtn = document.getElementById('tab-dict-btn');
        if(!tabVocab || !tabDict) return;
        if (tab === 'vocab') { tabVocab.classList.remove('hidden'); tabDict.classList.add('hidden'); tabVocabBtn.classList.replace('bg-gray-200', 'bg-indigo-600'); tabVocabBtn.classList.replace('text-gray-600', 'text-white'); tabDictBtn.classList.replace('bg-indigo-600', 'bg-gray-200'); tabDictBtn.classList.replace('text-white', 'text-gray-600'); } 
        else { tabVocab.classList.add('hidden'); tabDict.classList.remove('hidden'); tabDictBtn.classList.replace('bg-gray-200', 'bg-indigo-600'); tabDictBtn.classList.replace('text-gray-600', 'text-white'); tabVocabBtn.classList.replace('bg-indigo-600', 'bg-gray-200'); tabVocabBtn.classList.replace('text-white', 'text-gray-600'); }
    }
    const tabVocabBtn = document.getElementById('tab-vocab-btn'); if(tabVocabBtn) tabVocabBtn.addEventListener('click', () => switchEditTab('vocab'));
    const tabDictBtn = document.getElementById('tab-dict-btn'); if(tabDictBtn) tabDictBtn.addEventListener('click', () => switchEditTab('dict'));
    const ec = document.getElementById('edit-close-btn'); if(ec) ec.addEventListener('click', () => { const em=document.getElementById('edit-modal'); if(em){ em.classList.add('opacity-0'); setTimeout(()=>em.classList.add('hidden'), 200); }});
    const fsBtn = document.getElementById('fullscreen-btn'); if(fsBtn) fsBtn.addEventListener('click', () => (!document.fullscreenElement) ? document.documentElement.requestFullscreen() : document.exitFullscreen());
});
