import { flashcardApp } from '../components/FlashcardApp';
import { quizApp } from '../components/QuizApp';
import { sentencesApp } from '../components/SentencesApp';
import { blanksApp } from '../components/BlanksApp';
import { listeningApp } from '../components/ListeningApp'; 
import { matchApp } from '../components/MatchApp'; 
import { memoryApp } from '../components/MemoryApp'; 
import { finderApp } from '../components/FinderApp';
import { constructorApp } from '../components/ConstructorApp';
import { writingApp } from '../components/WritingApp';
import { trueFalseApp } from '../components/TrueFalseApp';
import { reverseApp } from '../components/ReverseApp';
import { audioService } from '../services/audioService';
import { textService } from '../services/textService';
import { vocabService } from '../services/vocabService';

class ViewManager {
    constructor() {
        this.views = {};
        this.currentActiveApp = null;
        this.savedHistory = {};
        try { this.savedHistory = JSON.parse(localStorage.getItem('polyglot_history') || '{}'); } catch (e) {}
        
        // Expose global for legacy calls (if any)
        window.saveGameHistory = (game, id) => { 
            if (id) { 
                this.savedHistory[game] = id; 
                localStorage.setItem('polyglot_history', JSON.stringify(this.savedHistory)); 
            } 
        };
    }

    init() {
        this.views = { 
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

        this.bindNavigation();
        
        window.addEventListener('popstate', (e) => this.render(e.state ? e.state.view : 'home'));
        window.addEventListener('router:home', () => history.back());
        
        // Global Resize Handler for Text Fitting
        let resizeTimer;
        window.addEventListener('resize', () => {
            if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { 
                if (this.currentActiveApp && this.currentActiveApp.render) this.currentActiveApp.render(); 
                else document.querySelectorAll('[data-fit="true"]').forEach(el => textService.fitText(el)); 
            }, 100);
        });

        // Refresh active app when vocab changes (e.g. language switch)
        vocabService.subscribe(() => { 
            if (this.currentActiveApp && this.currentActiveApp.refresh) {
                this.currentActiveApp.refresh();
            }
        });
    }

    bindNavigation() {
        const bind = (id, view) => { 
            const btn = document.getElementById(id); 
            if(btn) btn.addEventListener('click', () => { 
                history.pushState({view}, '', `#${view}`); 
                this.render(view); 
            }); 
        };
        ['flashcard','quiz','sentences','blanks','listening','match','memory','finder','constructor','writing','truefalse','reverse'].forEach(v => bind(`menu-${v}-btn`, v));
    }

    render(viewName) {
        audioService.stop();
        if (viewName === 'home') document.body.classList.remove('game-mode'); 
        else document.body.classList.add('game-mode'); 
        
        Object.values(this.views).forEach(el => { if(el) el.classList.add('hidden'); }); 
        
        const target = this.views[viewName]; 
        this.currentActiveApp = null; 

        if (target) { 
            target.classList.remove('hidden'); 
            const lastId = this.savedHistory[viewName]; 
            
            // Mounting Logic
            if (viewName === 'flashcard') { flashcardApp.mount('flashcard-view'); this.currentActiveApp = flashcardApp; if(lastId) flashcardApp.goto(lastId); } 
            else if (viewName === 'quiz') { quizApp.mount('quiz-view'); this.currentActiveApp = quizApp; if(lastId) quizApp.next(lastId); } 
            else if (viewName === 'sentences') { sentencesApp.mount('sentences-view'); this.currentActiveApp = sentencesApp; if(lastId) sentencesApp.next(lastId); } 
            else if (viewName === 'blanks') { blanksApp.mount('blanks-view'); this.currentActiveApp = blanksApp; if(lastId) blanksApp.next(lastId); }
            else if (viewName === 'listening') { listeningApp.mount('listening-view'); this.currentActiveApp = listeningApp; if(lastId) listeningApp.next(lastId); }
            else if (viewName === 'match') { matchApp.mount('match-view'); this.currentActiveApp = matchApp; }
            else if (viewName === 'memory') { memoryApp.mount('memory-view'); this.currentActiveApp = memoryApp; }
            else if (viewName === 'finder') { finderApp.mount('finder-view'); this.currentActiveApp = finderApp; }
            else if (viewName === 'constructor') { constructorApp.mount('constructor-view'); this.currentActiveApp = constructorApp; }
            else if (viewName === 'writing') { writingApp.mount('writing-view'); this.currentActiveApp = writingApp; }
            else if (viewName === 'truefalse') { trueFalseApp.mount('truefalse-view'); this.currentActiveApp = trueFalseApp; }
            else if (viewName === 'reverse') { reverseApp.mount('reverse-view'); this.currentActiveApp = reverseApp; }
        }
    }

    getActiveApp() {
        return this.currentActiveApp;
    }
}

export const viewManager = new ViewManager();
