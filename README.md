# Polyglot Flashcards

**Polyglot Flashcards** is a comprehensive, web-based language learning application designed to help users master vocabulary through various interactive game modes. It supports multiple languages (including Japanese, Korean, Chinese, and European languages) and features a spaced-repetition style learning environment. The app includes customizable settings for audio, visual themes, and input methods, catering to different learning styles.

---

## File Structure & Descriptions

| File Name | Description |
| :--- | :--- |
| **`src/index.html`** | The main entry point containing the app's HTML structure, including modals for settings, navigation, and dynamic game containers. |
| **`src/index.js`** | The central controller that initializes the app, manages Firebase Auth, handles routing, and registers global event listeners. |
| **`src/services/vocabService.js`** | Fetches raw data from Firebase and maps it into a unified game object structure (`Front`/`Back`), handling fallbacks. |
| **`src/services/textService.js`** | Critical engine handling smart font resizing (`fitText`, `fitGroup`) and language-specific tokenization logic. |
| **`src/services/audioService.js`** | Manages the Web Speech API (TTS), specifically sanitizing text to prevent reading metadata like parenthesis or separators. |
| **`src/services/settingsService.js`** | Manages the application's state, persisting user preferences (Dark Mode, Language, Volume) to `localStorage`. |
| **`src/components/*`** | Individual game logic files (e.g., `FlashcardApp.js`, `QuizApp.js`) handling rendering and state for specific modes. |
| **`src/styles/main.scss`** | Contains Tailwind CSS directives and custom animations (e.g., 3D flips, shakes, celebrations) for visual design. |

---

## Key Functions & Logic Engines

### `src/services/textService.js`
* **`fitText(element, min, max)`**: Uses binary search to maximize the font size of a specific element within its container bounds without overflowing.
* **`fitGroup(elements, min, max)`**: Calculates the optimal size for every element in a list, finds the smallest among them, and applies it globally for a uniform UI.
* **`tokenizeJapanese(text)`**: Uses `Intl.Segmenter` to split Japanese text, applying post-processing to merge particles (`は`, `が`) and suffixes (`さん`) for logical sentence blocks.

### `src/services/audioService.js`
* **`sanitizeText(text, lang)`**: Filters text before sending it to the Web Speech API, specifically stripping content after separators (`・`, `[`) or parenthesis to ensure natural pronunciation.
* **`speak(text, lang)`**: Manages the TTS queue, canceling previous utterances and applying volume/rate settings dynamically.

### `src/services/vocabService.js`
* **`reload()`**: Fetches the raw `vocab` node from Firebase and maps flat JSON data into structured `front` (target) and `back` (origin) objects.
* **`remapForLanguage(target, origin)`**: Dynamically re-maps the vocabulary objects when the user changes their target or origin language settings.

---

## Critical App Components

### 1. Game Modes (12 Types)
* **Flashcards**: 3D flip cards with auto-play audio and adjustable text sizing.
* **Quiz Mode**: Rapid-fire 4-choice definition checks with double-click safety options.
* **Sentences**: Context-based learning where users reorder scrambled tokens (using smart tokenization) to form correct sentences.
* **Blanks**: Fill-in-the-blank challenges derived from example sentences.
* **Match**: Time-pressure grid game pairing visible words and definitions.
* **Memory**: "Concentration" style game to find hidden matching pairs behind cards.
* **Finder**: Grid-based challenge to locate the correct target word based on a definition.
* **Constructor**: Character-by-character word building for spelling mastery.
* **Writing**: Typing practice with strict spelling validation and visual feedback.
* **Listening**: Audio-only challenge to identify the correct word without visual cues.
* **Review**: Rapid True/False verification of word pairs.
* **Reverse Quiz**: Given a definition, choose the correct word from a list.

### 2. Data Management (Firebase)
* **Vocabulary Data**: Stored as a flat object keyed by ID. The app maps `ja` (Target) and `en` (Origin) dynamically.
* **Dictionary Data**: Used for the in-app dictionary lookup, stored with keys for search term (`s`), pronunciation (`p`), and definition (`e`).

### 3. Audio & Text Engine
* **Smart Masking**: The audio service strips metadata (e.g., "Run (fast)") to read only the core word ("Run").
* **No-Wrap Policy**: The text service enforces `white-space: nowrap` to ensure maximum legibility for single-line vocabulary in Flashcards and Grids.

### 4. Customization
* **Theme Engine**: Fully supported Dark Mode toggled via settings or system preference.
* **Font Control**: Users can adjust font weight and family preference, which triggers a global re-calculation of text fitting.
