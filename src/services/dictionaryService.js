import { db } from './firebase'; 
import { ref, get, child } from 'firebase/database';

class DictionaryService {
    constructor() {
        this.index = {};
        this.isInitialized = false;
    }

    async fetchData() {
        if (this.isInitialized) return;
        try {
            console.log("[Dictionary] Fetching...");
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, 'dictionary'));
            
            if (snapshot.exists()) {
                const val = snapshot.val();
                const list = Array.isArray(val) ? val : Object.values(val);

                list.forEach(item => {
                    if (!item) return;
                    // Standardize keys from Firebase: s (simplified), t (traditional), p (pinyin), e (english), k (korean)
                    const entry = { 
                        id: item.id,
                        s: item.s, 
                        t: item.t, 
                        p: item.p, 
                        e: item.e, 
                        ko: item.k 
                    };
                    
                    if (item.s) this.index[item.s] = entry;
                    if (item.t && item.t !== item.s) this.index[item.t] = entry;
                });
                
                this.isInitialized = true;
                console.log(`[Dictionary] Loaded ${Object.keys(this.index).length} entries.`);
            } else {
                console.warn("[Dictionary] No data.");
            }
        } catch (error) {
            console.error("[Dictionary] Error:", error);
        }
    }

    lookupText(text) {
        if (!text || !this.isInitialized) return [];
        const results = [];
        const seen = new Set();
        const regex = /[\u4E00-\u9FFF]/g;
        const matches = text.match(regex);

        if (matches) {
            matches.forEach(char => {
                if (!seen.has(char)) {
                    const data = this.index[char];
                    if (data) {
                        results.push(data);
                        seen.add(char);
                    }
                }
            });
        }
        return results;
    }
}
export const dictionaryService = new DictionaryService();
