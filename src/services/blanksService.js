import { vocabService } from './vocabService';
import { settingsService } from './settingsService';

class BlanksService {
    generateQuestion(specificId = null) {
        const fullList = vocabService.getFlashcardData();
        const settings = settingsService.get();
        const numChoices = parseInt(settings.blanksChoices) || 4;
        const targetLang = settings.targetLang;

        let correctIndex, correctItem, sentence, obscuredSentence;
        let attempts = 0;

        // Find a suitable question (must have a sentence containing the vocab word)
        do {
            if (specificId !== null && attempts === 0) {
                correctIndex = vocabService.findIndexById(specificId);
            } else {
                correctIndex = vocabService.getRandomIndex();
            }
            
            correctItem = fullList[correctIndex];
            sentence = correctItem.back.sentenceTarget;
            const vocab = correctItem.front.main;

            // Check if sentence exists and contains the vocab word
            if (sentence && sentence.includes(vocab)) {
                 // Replace vocab with blank. Using regex to replace all occurrences just in case.
                 // We escape special regex characters in the vocab string first.
                 const escapedVocab = vocab.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                 const regex = new RegExp(escapedVocab, 'g');
                 obscuredSentence = sentence.replace(regex, '_______');
                 break;
            }
            
            attempts++;
            if (specificId !== null) specificId = null; // Give up on specific ID if it fails
        } while (attempts < fullList.length * 2); // Avoid infinite loop if data is bad

        if (!obscuredSentence) return null; // Should handle this in UI if it happens

        // Select Distractors
        const choices = [correctItem];
        const usedIndices = new Set([correctIndex]);

        while (choices.length < numChoices) {
            const randIndex = vocabService.getRandomIndex();
            if (!usedIndices.has(randIndex)) {
                // Ensure distractor isn't the same word even if different ID
                if (fullList[randIndex].front.main !== correctItem.front.main) {
                    choices.push(fullList[randIndex]);
                    usedIndices.add(randIndex);
                }
            }
        }

        // Shuffle
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }

        return {
            target: correctItem,
            sentence: obscuredSentence,
            choices: choices
        };
    }
}

export const blanksService = new BlanksService();
