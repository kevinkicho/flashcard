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
                    // Map Simplified
                    if (item.s) this.index[item.s] = { ...item, ko: item.k };
                    // Map Traditional
                    if (item.t && item.t !== item.s) this.index[item.t] = { ...item, ko: item.k };
                });
                
                this.isInitialized = true;
                console.log(`[Dictionary] Loaded ${Object.keys(this.index).length} entries.`);
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
                        // Return standardized object
                        results.push({ 
                            id: data.id,
                            simp: data.s, 
                            trad: data.t, 
                            pinyin: data.p, 
                            en: data.e, 
                            ko: data.k // Ensure 'k' is mapped to 'ko'
                        });
                        seen.add(char);
                    }
                }
            });
        }
        return results;
    }
}
export const dictionaryService = new DictionaryService();
