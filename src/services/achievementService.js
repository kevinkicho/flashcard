import { db, ref, get, child } from './firebase';

class AchievementService {
    async getUserAchievements(uid) {
        if (!uid) return {};
        try {
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, `users/${uid}/achievements`));
            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                return {};
            }
        } catch (error) {
            console.error("Error fetching achievements:", error);
            return {};
        }
    }
}

export const achievementService = new AchievementService();
