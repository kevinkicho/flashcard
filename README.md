# Polyglot Flashcards

**Polyglot.AI** is a comprehensive, web-based language learning application designed to help users master vocabulary through various interactive game modes. It supports multiple languages (Japanese, Korean, Chinese, and English) and utilizes Firebase for real-time data management and authentication. The app features integrated text-to-speech audio, a built-in dictionary lookup for characters, and customizable settings.

---

## File Structure & Descriptions

| File Name | Description |
| :--- | :--- |
| **`src/index.html`** | The main entry point containing the app's HTML structure, including the global header, main menu, game containers, and modals (Settings, Dictionary, Edit). |
| **`src/index.js`** | The central controller that initializes the app, manages routing between views, handles authentication state, and orchestrates global events like dictionary lookups. |
| **`src/services/firebase.js`** | Configuration and initialization for Firebase Authentication (Google/Anonymous) and Realtime Database connections. |
| **`src/services/vocabService.js`** | Fetches vocabulary data from Firebase, standardizes the format, and provides methods to retrieve or filter items for games. |
| **`src/services/dictionaryService.js`** | Manages the dictionary data (Hanzi/Kanji), providing lookup functionality to find character details within any text. |
| **`src/services/settingsService.js`** | Manages application state and user preferences (e.g., target language, dark mode, audio settings), persisting them to `localStorage`. |
| **`src/services/audioService.js`** | Handles the browser's Text-to-Speech (TTS) API to generate audio for target language words and sentences. |
| **`src/components/FlashcardApp.js`** | Logic for the **Flashcard** mode, handling card flipping, navigation, and display customization. |
| **`src/components/QuizApp.js`** | Logic for the **Quiz** mode, generating 4-choice questions and validating user answers. |
| **`src/components/SentencesApp.js`** | Logic for the **Sentences** mode, where users reconstruct sentences by selecting scrambled words in the correct order. |
| **`src/components/BlanksApp.js`** | Logic for the **Blanks** mode, challenging users to fill in the missing word in a given sentence context. |

---

## Key Features

### 1. Interactive Game Modes
* **Flashcards**: Classic study tool with 3D flip animations to reveal meanings and example sentences.
* **Quiz**: A rapid-fire multiple-choice game to test vocabulary recognition.
* **Sentences**: Context-based learning where users build sentences from a bank of shuffled words.
* **Blanks**: A "fill-in-the-blank" exercise to test understanding of grammar and vocabulary usage.

### 2. Dictionary & Editing
* **Instant Lookup**: Long-press on any text (Flashcards, Questions, etc.) to open a dictionary modal showing Pinyin, English, and Korean definitions for Chinese characters.
* **Admin Editing**: Authenticated admins can edit vocabulary and dictionary entries directly within the app interface using the "Edit" (pencil) button.
* **Smart Scoping**: The edit modal automatically gathers all relevant text from the current view to populate the dictionary editor.

### 3. Audio Engine
* **Text-to-Speech**: Integrated audio support for Japanese, Chinese, Korean, and English.
* **Auto-Play**: Configurable settings to automatically play audio when a card loads or an answer is correct.
* **Targeted Playback**: Ability to play audio for full sentences or specific gap-fill words.

### 4. Customization & Persistence
* **Settings System**: Users can toggle Dark Mode, choose target/origin languages, and adjust game-specific options (e.g., toggling English translations or reading aids).
* **State Tracking**: The app remembers the last card or question visited in each game mode, allowing users to pick up exactly where they left off.
* **Navigation**: ID input fields allow users to jump to specific vocabulary IDs instantly.
