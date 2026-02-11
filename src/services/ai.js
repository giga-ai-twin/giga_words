// This is a mock OCR service for demonstration. 
// In a real application, you would call an API like Gemini or an OCR service.

export const translateWord = async (word) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Placeholder logic mimicking Gemini's structured response
    // In a real app, this prompt would ask for common/uncommon POS, translations, and examples.
    return {
        word: word,
        phonetics: { dj: `/${word.toLowerCase()}/`, kk: `[${word.toLowerCase()}]` },
        pos: [
            { type: "常用 (n.)", translation: `(常用) ${word} 的名詞解釋`, example: `A common example sentence for ${word} as a noun.` },
            { type: "常用 (v.)", translation: `(常用) ${word} 的動詞解釋`, example: `A common example sentence for ${word} as a verb.` },
            { type: "不常用 (adj.)", translation: `(不常用) ${word} 的形容詞解釋`, example: `An uncommon example sentence for ${word} as an adjective.` }
        ],
        // For compatibility with the current word schema, we'll pick the primary one as default
        translation: `(常用) ${word} 的名詞解釋`,
        example: `A common example sentence for ${word} as a noun.`
    };
};

export const analyzeScreenshot = async (base64Image, targetWord) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Placeholder logic: In a real app, send base64Image and targetWord to Gemini API
    if (targetWord) {
        return {
            word: targetWord,
            phonetics: { dj: `/${targetWord.toLowerCase()}/`, kk: `[${targetWord.toLowerCase()}]` },
            translation: `(分析中) 對於 "${targetWord}" 的精確翻譯`,
            example: `This is an example sentence featuring the word "${targetWord}" as found in the image context.`,
            contextMatch: `Detected "${targetWord}" in the provided screenshot context.`,
            pos: [
                { type: "常用 (n.)", translation: `(分析) ${targetWord} 的名詞`, example: `Example for ${targetWord} as a noun.` },
                { type: "不常用 (v.)", translation: `(分析) ${targetWord} 的動詞`, example: `Example for ${targetWord} as a verb.` }
            ]
        };
    }

    return {
        word: "Resilient",
        phonetics: { dj: "/rɪˈzɪl.i.ənt/", kk: "[rɪˈzɪliənt]" },
        translation: "有韌性的，能復原的",
        example: "She is a resilient woman who can overcome any obstacle.",
        contextMatch: "Found in a news article about mental health.",
        pos: [
            { type: "常用 (adj.)", translation: "有韌性的，能復原的", example: "She is a resilient woman who can overcome any obstacle." }
        ]
    };
};

export const getGeminiAnalysis = async (imageData) => {
    // To avoid hitting API limits/requiring keys immediately, we provide a robust mock
    // that mimics the expected structure from Gemini.
    return analyzeScreenshot(imageData);
};
