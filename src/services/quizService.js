import { vocabService } from './vocabService';
import { settingsService } from './settingsService';

class QuizService {
    generateQuestion(specificId = null) {
        const fullList = vocabService.getFlashcardData();
        const settings = settingsService.get();
        const numChoices = parseInt(settings.quizChoices) || 4;

        if (!fullList || fullList.length === 0) return null;

        // 1. Select Correct Answer
        let correctIndex;
        if (specificId !== null) {
            correctIndex = vocabService.findIndexById(specificId);
            // Safety fallback if ID not found
            if (correctIndex === -1) correctIndex = vocabService.getRandomIndex();
        } else {
            correctIndex = vocabService.getRandomIndex();
        }
        
        const correctItem = fullList[correctIndex];

        // 2. Select Distractors
        const choices = [correctItem];
        const usedIndices = new Set([correctIndex]);

        // Safety break to prevent infinite loops if list is small
        let safetyCounter = 0;
        while (choices.length < numChoices && safetyCounter < 100) {
            const randIndex = vocabService.getRandomIndex();
            if (!usedIndices.has(randIndex)) {
                choices.push(fullList[randIndex]);
                usedIndices.add(randIndex);
            }
            safetyCounter++;
        }

        // 3. Shuffle Choices
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }

        return {
            target: correctItem, // The correct object
            choices: choices     // Mixed array
        };
    }
}

export const quizService = new QuizService();
