import { db, ref, get, child } from './firebase';

class VocabService {
    constructor() {
        this.list = [];
        this.isInitialized = false;
    }

    async fetchData() {
        if (this.isInitialized) return;
        
        try {
            console.log("[Vocab] Connecting to Firebase...");
            const dbRef = ref(db);
            
            // 1. Fetch Root to inspect structure (helps debug path issues)
            const rootSnapshot = await get(dbRef);
            if (rootSnapshot.exists()) {
                const rootVal = rootSnapshot.val();
                console.log("[Vocab] DB Connected. Root Keys found:", Object.keys(rootVal));
            } else {
                console.error("[Vocab] CRITICAL: Database is completely empty!");
                return;
            }

            // 2. Attempt to fetch 'vocab' node
            const snapshot = await get(child(dbRef, 'vocab'));
            
            if (snapshot.exists()) {
                const val = snapshot.val();
                let rawList = Array.isArray(val) ? val : Object.values(val);
                console.log(`[Vocab] Raw entries found: ${rawList.length}`);

                // 3. Debugging the first item to ensure filter logic is correct
                if (rawList.length > 0) {
                    console.log("[Vocab] Sample Item 0:", JSON.stringify(rawList[0]));
                }

                // 4. LENIENT FILTER (Prevents rejecting valid data with slight mismatches)
                this.list = rawList.filter((item, index) => {
                    const isValid = item && (typeof item === 'object');
                    if (!isValid) {
                        if (index < 5) console.warn(`[Vocab] Item ${index} invalid structure:`, item);
                        return false;
                    }
                    
                    // Allow if it has at least 'front' OR 'id' to be safe
                    const hasData = (item.front || item.id); 
                    if (!hasData && index < 5) {
                        console.warn(`[Vocab] Item ${index} missing 'front' or 'id':`, item);
                    }
                    return hasData;
                });

                this.isInitialized = true;
                console.log(`[Vocab] Final valid list size: ${this.list.length}`);
            } else {
                console.error("[Vocab] Node '/vocab' does not exist! Check the Root Keys log above.");
                // Fallback: Check if user uploaded list directly to root?
                // const rootVal = rootSnapshot.val();
                // if (Array.isArray(rootVal)) { ... } 
            }
        } catch (error) {
            console.error("[Vocab] Fetch FAILED:", error);
            this.list = [];
        }
    }

    getAll() { return this.list || []; }
    getFlashcardData() { return this.list || []; }
    
    getRandomIndex() { 
        if (!this.list || this.list.length === 0) return 0;
        return Math.floor(Math.random() * this.list.length); 
    }
    
    findIndexById(id) { 
        if (!this.list) return -1;
        return this.list.findIndex(item => item.id === id); 
    }
}

export const vocabService = new VocabService();
