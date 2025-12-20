# Polyglot Flashcards

**Polyglot Flashcards** is a comprehensive, web-based Progressive Web App (PWA) designed for immersive language learning. It leverages **12 distinct game modes** to reinforce vocabulary retention through visual, auditory, and kinetic interaction. Built with **Vanilla JavaScript**, **Webpack**, and **Tailwind CSS**, it uses **Firebase** for real-time data synchronization and authentication.

---

## File Structure & Descriptions

| File Name | Description |
| :--- | :--- |
| **`src/index.html`** | The main entry point containing the app's HTML structure, navigation menu, settings modal, and the dynamic game view containers. |
| **`src/index.js`** | The central controller that initializes the app, manages Firebase Auth, handles routing, and registers global event listeners (Resize, Settings). |
| **`src/services/vocabService.js`** | Fetches raw data from Firebase and maps it into a unified game object structure (`Front`/`Back`), handling fallbacks for missing fields. |
| **`src/services/textService.js`** | **Critical Engine**. Handles smart font resizing (`fitText`, `fitGroup`) and advanced language-specific tokenization (Japanese segmentation). |
| **`src/services/audioService.js`** | Manages the Web Speech API (TTS), specifically sanitizing text to prevent reading metadata (e.g., removing text in parenthesis). |
| **`src/components/*`** | Individual game logic files. Includes `FlashcardApp`, `QuizApp`, `SentencesApp`, `MemoryApp`, `FinderApp`, `MatchApp`, `ConstructorApp`, and others. |
| **`src/styles/main.scss`** | Contains Tailwind CSS directives and custom animations (e.g., 3D flips, shakes, celebrations). |

---

## Specialized Logic Engines

### 1. Advanced Text Fitting
* **`fitText`**: Uses a binary search algorithm to maximize the font size of a specific element within its container bounds without overflowing.
* **`fitGroup`**: Calculates the optimal size for *every* element in a list (e.g., a grid of answer choices), finds the smallest size among them, and applies it globally to ensure a uniform UI.
* **No-Wrap Policy**: The engine enforces `white-space: nowrap` to ensure maximum legibility for single-line vocabulary.

### 2. Audio Sanitization Engine (`AudioService`)
* **Smart Masking**: The app filters text before sending it to the Web Speech API to ensure natural pronunciation.
* **Japanese Rules**: Specifically checks for separators (`・`, `·`, `[`, `<`) and parenthesis (`（`, `(`). It strips all content following these characters so that metadata (like "Noun" or "Suru-verb") is not read aloud during gameplay.

### 3. Japanese Tokenization (`SentencesApp`)
* **Semantic Segmentation**: Unlike European languages which split by space, the Sentences game uses `Intl.Segmenter('ja-JP', { granularity: 'word' })` to natively split Japanese text.
* **Grammar Merging**: A post-processing layer merges grammatical particles (`は`, `が`, `を`) and suffixes (`さん`, `ました`) with their preceding words. This ensures that sentence puzzle blocks are logical (e.g., `猫が` remains one block instead of `猫` + `が`).

### 4. Game Modes (12 Types)
* **Flashcards**: 3D flip cards with auto-play.
* **Quiz / Reverse Quiz**: Rapid-fire 4-choice definition checks.
* **Sentences**: Reorder scrambled words/tokens to form correct sentences.
* **Blanks**: Context-based learning; fill in the missing word in an example sentence.
* **Match**: Time-pressure grid game to pair visible words and definitions.
* **Memory**: "Concentration" style game to find hidden matching pairs.
* **Finder**: Find the correct target word in a 3x3 grid based on a definition.
* **Constructor**: Build the target word character-by-character.
* **Writing**: Typing practice with strict spelling validation.
* **Listening**: Audio-only challenge to identify the correct word.
* **Review**: Rapid True/False verification.

---

## Data Management (Firebase)

The application relies on a specific data structure in the Firebase Realtime Database.

### 1. Vocabulary Schema (`vocab`)
Data is stored as a flat object keyed by ID. The `vocabService` maps this into `front` (Target) and `back` (Origin) objects at runtime.

```json
{
  "vocab": {
    "101": {
      "id": 101,
      "ja": "猫",             // Target Language
      "furi": "ねこ",         // Sub-text (Furigana)
      "en": "Cat",            // Origin Language
      "ja_ex": "猫が好きです。", // Target Sentence
      "en_ex": "I like cats." // Origin Sentence
    }
  }
}
