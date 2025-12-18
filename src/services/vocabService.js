import { db, ref, get, child } from './firebase';

class VocabService {
    constructor() {
        this.list = [];
        this.isInitialized = false;
    }

    async fetchData() {
        if (this.isInitialized) return;
        
        try {
            console.log("Fetching Vocab...");
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, 'vocab'));
            
            if (snapshot.exists()) {
                const val = snapshot.val();
                let rawList = Array.isArray(val) ? val : Object.values(val);
                
                // [CRITICAL FIX] Strict filtering to prevent 'undefined' crashes later
                this.list = rawList.filter(item => 
                    item && 
                    typeof item === 'object' &&
                    item.id !== undefined &&
                    item.front && (item.front.main || item.front.expression) &&
                    item.back && (item.back.definition || item.back.meaning)
                );

                this.isInitialized = true;
                console.log(`Vocab loaded: ${this.list.length} valid entries.`);
            } else {
                console.warn("No vocab data found in Firebase.");
                this.list = [];
            }
        } catch (error) {
            console.error("Vocab fetch failed:", error);
            this.list = [];
        }
    }

    getAll() { return this.list || []; }
    getFlashcardData() { return this.list || []; }
    
    getRandomIndex() { 
        if (this.list.length === 0) return 0;
        return Math.floor(Math.random() * this.list.length); 
    }
    
    findIndexById(id) { 
        if (!this.list) return -1;
        return this.list.findIndex(item => item.id === id); 
    }
}

export const vocabService = new VocabService();
