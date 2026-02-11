import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const translateWord = async (word) => {
    if (!genAI) {
        throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in .env");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const prompt = `Translate the English word "${word}" into Traditional Chinese. 
  Provide the result in a valid JSON format with the following structure:
  {
    "word": "${word}",
    "phonetics": { "dj": "/.../", "kk": "[...]" },
    "pos": [
      { "type": "常用 (n.)", "translation": "中文翻譯", "example": "English example sentence" },
      { "type": "不常用 (v.)", "translation": "不常用翻譯", "example": "Another example" }
    ],
    "translation": "(pos.) Most common Chinese translation",
    "example": "A natural English example sentence for the most common usage"
  }
  Requirements:
  1. Phonetics must include both DJ and KK systems.
  2. The POS list must categorize items as "常用" or "不常用".
  3. Ensure all translations are in Traditional Chinese (TW).
  4. The primary "translation" field MUST include the part of speech prefix in parentheses, e.g., "(n.) 翻譯" or "(v.) 翻譯".
  5. Return ONLY the JSON object, no markdown blocks.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini Translation Raw Response:", text);
        // Clean up potential markdown formatting or leading/trailing text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid response format from AI. Could not find JSON.");
        }
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Gemini Translation Error:", error);
        throw error;
    }
};

export const analyzeScreenshot = async (base64Image, targetWord) => {
    if (!genAI) {
        throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in .env");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // Convert base64 to parts for Gemini
    const inlineData = {
        inlineData: {
            data: base64Image.split(",")[1], // Extract data part from data:image/png;base64,...
            mimeType: "image/png"
        }
    };

    const prompt = `Analyze this image. ${targetWord ? `Find and specifically analyze the English word "${targetWord}" based on its context.` : `Pick the most important English learning word in the image.`}
  Provide the result in a valid JSON format:
  {
    "word": "The word found",
    "phonetics": { "dj": "/.../", "kk": "[...]" },
    "translation": "(pos.) Traditional Chinese translation",
    "example": "English example sentence based on the image context",
    "contextMatch": "Briefly explain how the word relates to the image context",
    "pos": [
      { "type": "常用 (...)", "translation": "...", "example": "..." }
    ]
  }
  Requirements:
  1. Return ONLY the JSON, no markdown.
  2. The "translation" field MUST include the part of speech prefix in parentheses, e.g., "(adj.) 翻譯".
  3. Maintain consistency with the POS structure used in translateWord.`;

    try {
        const result = await model.generateContent([prompt, inlineData]);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini Vision Raw Response:", text);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid vision response format from AI. Could not find JSON.");
        }
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Gemini Vision Error:", error);
        throw error;
    }
};

export const getGeminiAnalysis = async (imageData) => {
    return analyzeScreenshot(imageData);
};
