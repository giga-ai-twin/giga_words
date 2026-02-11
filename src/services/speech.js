const getVoices = () => {
    return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            resolve(voices);
            return;
        }
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            resolve(voices);
        };
    });
};

export const speak = async (text, lang = 'en-US') => {
    const voices = await getVoices();
    const utterance = new SpeechSynthesisUtterance(text);

    // Try to find a specific voice for US/UK
    if (lang === 'en-US') {
        utterance.voice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
            voices.find(v => v.lang === 'en-US') || voices[0];
    } else if (lang === 'en-GB') {
        utterance.voice = voices.find(v => v.lang === 'en-GB' && v.name.includes('Google')) ||
            voices.find(v => v.lang === 'en-GB') || voices[0];
    }

    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
};
