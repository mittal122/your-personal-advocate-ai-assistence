
import { GoogleGenAI } from "@google/genai";
import { Language, GroundingChunk } from '../types';
import { SYSTEM_PROMPT } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development and will show an error in the console.
  // In a production environment, the API_KEY should be set.
  console.error("API_KEY is not set. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateAdvocateResponse(query: string, language: Language): Promise<{ text: string, sources?: GroundingChunk[] }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      // FIX: The 'contents' field for generateContent should be a string for a single-text prompt, not an array of Content objects.
      contents: query,
      config: {
        systemInstruction: SYSTEM_PROMPT(language),
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

    return { text, sources };
  } catch (error) {
    console.error("Error generating response from Gemini API:", error);
    throw new Error("Failed to get a response from the advocate AI.");
  }
}
