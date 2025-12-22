import { GoogleGenAI } from "@google/genai";

export const generateBirthdayWish = async (): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: "AIzaSyCJbR-3ljKhtmk865Ep5tMAGdU5GMc3Nhg"});
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Write a short, heartwarming birthday wish for Aunt Abeer who is turning 47.",
    });
    
    return response.text || "Happy 47th Birthday, Abeer!";
  } catch (error) {
    console.error("Error generating wish:", error);
    return "Happy 47th Birthday, Abeer!";
  }
};
