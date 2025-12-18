import { vocabService } from './vocabService';
import { settingsService } from './settingsService';

export const quizService = {
    generateQuestion(specificId = null) {
        const allVocab = vocabService.getAll();
        // [FIX] Handle empty or small lists
        if (!allVocab || allVocab.length < 2) return null;

        let target = null;
        if (specificId) {
            target = allVocab.find(i => i.id === specificId);
        } 
        
        // Fallback or random
        if (!target) {
            target = allVocab[Math.floor(Math.random() * allVocab.length)];
        }

        const numChoices = parseInt(settingsService.get().quizChoices) || 4;
        const choices = [target];
        
        // [FIX] Prevent infinite loop
        let attempts = 0;
        while (choices.length < numChoices && attempts < 50) {
            attempts++;
            const random = allVocab[Math.floor(Math.random() * allVocab.length)];
            if (!choices.find(c => c.id === random.id)) {
                choices.push(random);
            }
        }

        return {
            target,
            choices: choices.sort(() => Math.random() - 0.5)
        };
    }
};
