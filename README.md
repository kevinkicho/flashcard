# Polyglot Flashcards

**Polyglot Flashcards** is a gamified, web-based language learning application designed to help users master vocabulary through interactive game modes. Built with a modular Vanilla JavaScript architecture and Firebase, it features real-time data synchronization, achievement tracking, and a customizable learning environment for multiple languages (Japanese, Korean, Chinese, and more).

---

## Game Modes & Learning Tools

### 1. Interactive Games
* **Flashcards**: Classic 3D flip-card interface for rote memorization with auto-play audio support.
* **Quiz Mode**: A rapid-fire multiple-choice game to test vocabulary recognition. Includes smart audio parsing to handle complex word entries (e.g., separating dot-delimited readings).
* **Sentences**: A syntax-building game where users reconstruct sentences from scrambled word blocks.
* **Blanks**: A "cloze deletion" exercise challenging users to fill in missing context words within example sentences.

### 2. Gamification Engine
* **Achievements**: A robust system with over 100 unlockable badges tracking login streaks, total scores, daily volume, and specific game mastery (e.g., "Grand Slam", "Night Owl").
* **Weekly Progress**: An interactive stacked bar chart visualizing daily performance, broken down by game mode (Flashcard, Quiz, Sentence, Blanks).
* **Scoring System**: Real-time XP tracking with atomic updates to Firebase, ensuring accurate "Today's Score" and "All-Time" stats.

### 3. Audio & Dictionary
* **Text-to-Speech (TTS)**: Integrated browser-based TTS with configurable settings (Auto-Play, Wait-for-Audio).
* **Smart Dictionary**: A long-press dictionary popup available across all game modes, allowing users to instantly look up definitions for Kanji, Hanzi, or unknown words without leaving the game.

### 4. Data Management
* **Firebase Integration**: seamless synchronization with Firebase Realtime Database for vocabulary content and user statistics.
* **Smart Mapping**: The `VocabService` automatically maps "flat" database structures (e.g., simple key-value pairs for languages) into the complex object structures required by game components, ensuring compatibility even with simple data sources.

### 5. Customization
* **Visuals**: Native Dark Mode support (enabled by default) and responsive design for tablets and mobile devices.
* **Settings**: Users can customize target/origin languages, font families (Noto Sans, Serif, etc.), font weights, and audio behaviors.

---

## File Structure & Descriptions

| File Name | Description |
| :--- | :--- |
| **`src/index.html`** | The main entry point containing the app's shell, modal structures (Settings, Achievements, Charts), and game view containers. |
| **`src/index.js`** | The central controller that handles authentication, data loading sequences, routing between views, and global event listeners. |
| **`src/styles/main.scss`** | The core stylesheet incorporating Tailwind CSS directives, custom animations (e.g., achievement popups), and global resets for mobile touch interactions. |
| **`src/data/achievements.js`** | Configuration file defining the logic, titles, descriptions, and point values for all unlockable achievements. |
| **`src/services/vocabService.js`** | Manages fetching, caching, and mapping vocabulary data from Firebase. Includes robust error handling and data sanitation. |
| **`src/services/scoreService.js`** | Handles all score-related logic, including incrementing points, tracking streaks, and calculating daily/weekly totals. |
| **`src/services/achievementService.js`** | The brain of the gamification system. Monitors stats to trigger achievement unlocks and displays the "Funky" popup notifications. |
| **`src/services/audioService.js`** | A wrapper for the Web Speech API, managing text-to-speech playback, queuing, and language selection. |
| **`src/services/settingsService.js`** | Persists user preferences (Dark Mode, Audio settings, Language choices) to `localStorage`. |
| **`src/components/FlashcardApp.js`** | Component logic for the Flashcard game mode, including 3D flip animations and navigation. |
| **`src/components/QuizApp.js`** | Component logic for the Quiz game, handling question generation, answer validation, and audio cues. |
| **`src/components/SentencesApp.js`** | Component logic for the Sentence Builder game, managing word banks and sentence reconstruction logic. |
| **`src/components/BlanksApp.js`** | Component logic for the Fill-in-the-Blank game, creating context-based questions from vocabulary examples. |
