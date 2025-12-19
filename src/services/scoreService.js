import { db, auth, ref, update, increment, onValue } from './firebase';
import { achievementService } from './achievementService';

class ScoreService {
    constructor() {
        this.todayScore = 0;
        this.subscribers = [];
        this.userId = null;
        this.isInitialized = false;
    }

    // NEW: We call this manually from index.js when the page is ready
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        auth.onAuthStateChanged(user => {
            if (user) {
                this.userId = user.uid;
                this.listenToToday();
                // Check achievements only after we have a user
                achievementService.checkLoginAchievements(user.uid);
            } else {
                this.userId = null;
                this.todayScore = 0;
                this.notify();
            }
        });
    }

    getDateStr(dateObj = new Date()) {
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        const y = dateObj.getFullYear();
        return `${m}-${d}-${y}`;
    }

    listenToToday() {
        if (!this.userId) return;
        const dateStr = this.getDateStr();
        const todayRef = ref(db, `users/${this.userId}/stats/${dateStr}`);
        
        onValue(todayRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.todayScore = (data.flashcard || 0) + (data.quiz || 0) + (data.sentences || 0) + (data.blanks || 0);
            } else {
                this.todayScore = 0;
            }
            this.notify();
        });
    }

    addScore(gameType, points) {
        if (!this.userId) return;
        const dateStr = this.getDateStr();
        
        const updates = {};
        updates[`users/${this.userId}/stats/${dateStr}/${gameType}`] = increment(points);
        updates[`users/${this.userId}/stats/total/${gameType}`] = increment(points);
        updates[`users/${this.userId}/stats/total/score`] = increment(points);
        
        if (points > 0) {
             updates[`users/${this.userId}/stats/total/${gameType}_wins`] = increment(1);
             updates[`users/${this.userId}/stats/streaks/${gameType}`] = increment(1);
        }

        update(ref(db), updates)
            .then(() => {
                achievementService.checkScoreAchievements(this.userId, gameType, points, this.todayScore + points);
            })
            .catch(err => console.error("Score update failed", err));
    }

    subscribe(cb) {
        this.subscribers.push(cb);
        cb(this.todayScore);
    }

    notify() {
        this.subscribers.forEach(cb => cb(this.todayScore));
        const displays = document.querySelectorAll('.global-score-display');
        if (displays.length) {
            displays.forEach(el => el.textContent = this.todayScore);
        }
    }

    getUserStatsRef() {
        if (!this.userId) return null;
        return ref(db, `users/${this.userId}/stats`);
    }
}

export const scoreService = new ScoreService();
