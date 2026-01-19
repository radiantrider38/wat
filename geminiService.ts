
import { GoogleGenAI, Type } from "@google/genai";
import { WordNature, WATBreakdown } from "./types";

const SYSTEM_INSTRUCTION = `You are a Senior ISSB Psychologist and Officer Selection Trainer. Your expertise lies in evaluating candidates for the Armed Forces through the Word Association Test (WAT). Your goal is to guide candidates on how to think like an officer when they see a word, focusing on spontaneous, positive, and action-oriented psychology.

For every word provided, generate a structured psychological pedagogical report in JSON format.
Identify Word Nature as Positive, Neutral, or Negative.
Identify specific Officer Like Qualities (OLQs) such as Determination, Social Adjustment, Courage, Sense of Responsibility, Emotional Stability, etc.
Explain the 3-second mental shift required (e.g., from 'Problem' to 'Solution').
Provide sentence-making logic (Formula: Action + Result or Attitude + Responsibility).
List common weak 'Reject' level responses with reasoning.
Provide FOUR short (4-6 words) ideal officer responses that demonstrate leadership, resilience, and initiative.`;

export async function getWATBreakdown(word: string): Promise<WATBreakdown> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the word: "${word}" for ISSB WAT training.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          nature: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] },
          natureReasoning: { type: Type.STRING },
          olqs: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          thinkingDirection: { type: Type.STRING },
          sentenceLogic: {
            type: Type.OBJECT,
            properties: {
              formula: { type: Type.STRING },
              avoid: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["formula", "avoid"]
          },
          weakResponses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                response: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["response", "reason"]
            }
          },
          idealResponses: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Four ideal officer-like responses."
          }
        },
        required: ["word", "nature", "natureReasoning", "olqs", "thinkingDirection", "sentenceLogic", "weakResponses", "idealResponses"]
      }
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text);
}
