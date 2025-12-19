import { db, auth, onAuthStateChanged } from './firebase';
import { ref, onValue } from 'firebase/database';

class VocabService {
    constructor() {
        this.vocabData = [];
        this.categoryMap = {};
        this.subscribers = [];
        this.isInitialized = false;
        
        // A promise that resolves when data is actually ready
        this.dataReadyPromise = new Promise((resolve) => {
            this._resolveDataReady = resolve;
        });
    }

    /**
     * Initialize the service:
     * 1. Load from LocalStorage (Instant / Offline support)
     * 2. Wait for Auth
     * 3. Listen to Firebase (Realtime / Online support)
     */
    async init() {
        if (this.isInitialized) return this.dataReadyPromise;
        this.isInitialized = true;

        // 1. Load Local Cached Data immediately (Fast render)
        const cached = localStorage.getItem('polyglot_vocab_cache');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed && parsed.length > 0) {
                    this.processData(parsed);
                    console.log("[Vocab] Loaded from cache (Offline ready)");
                    this._resolveDataReady(true);
                }
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }

        // 2. Wait for Auth state to settle before connecting to DB
        // This prevents "Permission Denied" errors on page refresh
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.connectToDb();
            } else {
                console.log("[Vocab] Waiting for user login/anon to connect to DB...");
            }
        });

        return this.dataReadyPromise;
    }

    connectToDb() {
        console.log("[Vocab] Subscribing to realtime updates...");
        const vocabRef = ref(db, 'vocab');
        
        onValue(vocabRef, (snapshot) => {
            const val = snapshot.val();
            if (val) {
                // Convert object {0: {..}, 1: {..}} or array to array
                const data = Array.isArray(val) ? val : Object.values(val);
                
                // Save to cache for next time (Persistence)
                localStorage.setItem('polyglot_vocab_cache', JSON.stringify(data));
                
                this.processData(data);
                console.log(`[Vocab] Realtime update: ${this.vocabData.length} items.`);
                
                // Resolve the promise so the app knows we are good to go
                this._resolveDataReady(true);
            } else {
                console.warn("[Vocab] No data in DB.");
                // Even if no data, we are "ready" (just empty)
                this._resolveDataReady(true);
            }
        }, (error) => {
            console.error("[Vocab] Permission denied or network error:", error);
            // If permission denied, we likely have cache, so we don't block entirely,
            // but we might want to trigger a re-auth if needed.
        });
    }

    processData(data) {
        if (!data) return;
        this.vocabData = data.map(item => ({
            ...item,
            // Ensure essential fields exist
            id: item.id,
            category: item.category || 'General',
            front: {
                main: item.ja || item.zh || item.ko || item.en || '?',
                sub: item.zh_pin || item.ja_furi || item.ja_roma || ''
            },
            back: {
                definition: item.en || '?',
                sentenceTarget: item.ja_ex || item.zh_ex || item.ko_ex || '',
                sentenceOrigin: item.en_ex || ''
            }
        }));

        this.categoryMap = {};
        this.vocabData.forEach(item => {
            const cat = item.category || 'General';
            if (!this.categoryMap[cat]) this.categoryMap[cat] = [];
            this.categoryMap[cat].push(item);
        });

        // Notify all UI components that data has changed
        this.notifySubscribers();
    }

    // --- Subscription System ---
    subscribe(callback) {
        this.subscribers.push(callback);
        // If we already have data, trigger immediately
        if (this.vocabData.length > 0) callback();
    }

    notifySubscribers() {
        this.subscribers.forEach(cb => cb());
    }

    // --- Data Accessors ---
    getAll() { return this.vocabData; }
    getFlashcardData() { return this.vocabData; }
    
    findIndexById(id) {
        return this.vocabData.findIndex(item => item.id == id); // Loose equality for string/int safety
    }

    getRandomIndex() {
        return this.vocabData.length > 0 ? Math.floor(Math.random() * this.vocabData.length) : 0;
    }
}

export const vocabService = new VocabService();
