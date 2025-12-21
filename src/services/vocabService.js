import { db, ref, onValue, update } from './firebase'; 
import { settingsService } from './settingsService';

class VocabService {
    constructor() {
        this.vocabList = [];
        this.subscribers = [];
        this.isLoaded = false;
        this.unsubscribe = null;
    }

    // UPDATED: Now returns a Promise that resolves ONLY when data arrives
    init() {
        return new Promise((resolve, reject) => {
            // If already loaded/subscribed, resolve immediately
            if (this.unsubscribe && this.isLoaded) {
                resolve();
                return;
            }

            console.log("VocabService: Subscribing to realtime updates...");
            const dbRef = ref(db, 'vocab');
            
            this.unsubscribe = onValue(dbRef, (snapshot) => {
                if (snapshot.exists()) {
                    this.processData(snapshot);
                } else {
                    console.warn("VocabService: No data found.");
                    this.vocabList = [];
                    this.notify();
                }
                
                // Mark as loaded and resolve the promise on the first successful load
                if (!this.isLoaded) {
                    this.isLoaded = true;
                    resolve(); 
                }
            }, (error) => {
                console.error("VocabService Error:", error);
                // Only reject if it fails on the initial load
                if (!this.isLoaded) reject(error);
            });
        });
    }

    processData(snapshot) {
        const list = [];
        snapshot.forEach(childSnap => {
            const val = childSnap.val();
            if (val) {
                val.firebaseKey = childSnap.key; 
                list.push(val);
            }
        });

        this.vocabList = list
            .filter(item => item && item.id !== undefined)
            .map(item => {
                const id = parseInt(item.id);
                
                let frontObj = item.front || {};
                if (!frontObj.main) {
                    const mainText = item.ja || item.zh || item.ko || item.ru || item.fr || item.de || item.es || item.it || item.pt || item.word || "???";
                    const subText = item.ja_furi || item.furi || item.pinyin || item.roma || "";
                    frontObj = { main: mainText, sub: subText };
                }

                let backObj = item.back || {};
                if (!backObj.main) {
                    const def = item.en || item.meaning || "???";
                    const sentT = item.ja_ex || item.zh_ex || item.ko_ex || item.de_ex || item.fr_ex || item.es_ex || item.it_ex || "";
                    const sentO = item.en_ex || "";
                    backObj = { main: def, definition: def, sentenceTarget: sentT, sentenceOrigin: sentO };
                } else {
                        if (!backObj.main) backObj.main = backObj.definition || item.en || "???";
                }

                return {
                    ...item, 
                    id: id,
                    front: frontObj,
                    back: backObj
                };
            });

        console.log(`VocabService: Updated ${this.vocabList.length} items.`);
        this.notify();
    }

    async saveItem(firebaseKey, data) {
        if (!firebaseKey) return;
        try {
            const updates = {};
            Object.keys(data).forEach(field => {
                updates[`vocab/${firebaseKey}/${field}`] = data[field];
            });
            await update(ref(db), updates);
            console.log(`VocabService: Saved item ${firebaseKey}`);
        } catch (e) {
            console.error("VocabService: Save Failed", e);
            throw e;
        }
    }

    // Legacy support for manual reload, just calls init
    async reload() {
        return this.init();
    }

    hasData() { return this.isLoaded && this.vocabList.length > 0; }
    getAll() { return this.vocabList; }
    findIndexById(id) { return this.vocabList.findIndex(item => item.id === id); }
    getRandomIndex() {
        if (this.vocabList.length === 0) return 0;
        return Math.floor(Math.random() * this.vocabList.length);
    }
    subscribe(callback) { 
        this.subscribers.push(callback); 
        if(this.isLoaded) callback(this.vocabList);
    }
    notify() { this.subscribers.forEach(cb => cb(this.vocabList)); }
}

export const vocabService = new VocabService();
