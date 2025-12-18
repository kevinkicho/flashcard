class AudioService {
    constructor() {
        this.synth = window.speechSynthesis;
    }

    stop() {
        if (this.synth.speaking) this.synth.cancel();
    }

    speak(text, lang) {
        return new Promise((resolve) => {
            this.stop();
            if (!text) { resolve(); return; }

            const utterance = new SpeechSynthesisUtterance(text);
            if (lang === 'zh') utterance.lang = 'zh-CN';
            else if (lang === 'ja') utterance.lang = 'ja-JP';
            else if (lang === 'ko') utterance.lang = 'ko-KR';
            else utterance.lang = 'en-US';

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();

            this.synth.speak(utterance);
        });
    }

    speakGapSentence(part1, part2, lang) {
        return new Promise(async (resolve) => {
            await this.speak(part1, lang);
            setTimeout(async () => {
                await this.speak(part2, lang);
                resolve();
            }, 300);
        });
    }
}
export const audioService = new AudioService();
