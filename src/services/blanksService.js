import { vocabService } from './vocabService';
import { settingsService } from './settingsService';

class BlanksService {
    generateQuestion(specificId = null) {
        const fullList = vocabService.getFlashcardData();
        const settings = settingsService.get();
        const numChoices = parseInt(settings.blanksChoices) || 4;
        const targetLang = settings.targetLang;

        let correctIndex, correctItem, sentence, obscuredSentence, answerWord;
        let attempts = 0;

        // Find a suitable question
        do {
            if (specificId !== null && attempts === 0) {
                correctIndex = vocabService.findIndexById(specificId);
            } else {
                correctIndex = vocabService.getRandomIndex();
            }
            
            correctItem = fullList[correctIndex];
            sentence = correctItem.back.sentenceTarget;
            const vocab = correctItem.front.main; // The vocab word (e.g. "逃げる")

            if (sentence) {
                // STRATEGY 1: Exact Match
                if (sentence.includes(vocab)) {
                    const escaped = vocab.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    obscuredSentence = sentence.replace(new RegExp(escaped, 'g'), '_______');
                    answerWord = vocab;
                } 
                // STRATEGY 2: Japanese Conjugation Match (Stem Search)
                // e.g. Vocab "逃げる" -> Sentence "彼は逃げました"
                else if (targetLang === 'ja' && vocab.length > 1) {
                    // Remove last character to find stem (逃げる -> 逃げ)
                    const stem = vocab.slice(0, -1);
                    if (sentence.includes(stem)) {
                        // Find exactly what string in the sentence matches the stem + following chars
                        // We strictly just replace the stem part to create the blank, 
                        // implying the user must identify the root concept.
                        // Or better: Replace the stem portion with blank.
                        obscuredSentence = sentence.replace(stem, '_______');
                        answerWord = vocab; // The answer key remains the dictionary form
                    }
                }
            }
            
            if (obscuredSentence) break;
            
            attempts++;
            if (specificId !== null) specificId = null; 
        } while (attempts < fullList.length * 2);

        if (!obscuredSentence) return null;

        // Select Distractors
        const choices = [correctItem];
        const usedIndices = new Set([correctIndex]);

        while (choices.length < numChoices) {
            const randIndex = vocabService.getRandomIndex();
            if (!usedIndices.has(randIndex)) {
                // Ensure distractor is unique
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
            sentence: obscuredSentence, // "彼は_______ました"
            cleanSentence: sentence,    // "彼は逃げました" (for audio reconstruction)
            answerWord: answerWord,
            choices: choices
        };
    }
}

export const blanksService = new BlanksService();
