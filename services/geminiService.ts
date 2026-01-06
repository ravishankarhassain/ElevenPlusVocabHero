
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Word, ValidationResult, GameAnswer, WordCategory } from "../types";

// Always initialize with named property apiKey from process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let audioCtx: AudioContext | null = null;

export const generateVocabWord = async (level: number, category?: WordCategory): Promise<Word> => {
  const categoryPrompt = category ? ` focused on the category "${category}"` : '';
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a challenging 11+ UK exam vocabulary word for Year ${level} level${categoryPrompt}. Include a phonetic spelling.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          definition: { type: Type.STRING },
          part_of_speech: { type: Type.STRING },
          synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
          antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
          example_sentence: { type: Type.STRING },
          phonetic: { type: Type.STRING },
          level: { type: Type.NUMBER }
        },
        required: ["word", "definition", "part_of_speech", "synonyms", "antonyms", "example_sentence", "level"]
      }
    }
  });

  // response.text is a property, not a method
  const word = JSON.parse(response.text || '{}') as Word;
  return { ...word, id: crypto.randomUUID(), masteryLevel: 0 };
};

export const getWordHint = async (word: string, partOfSpeech: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Give a cryptic but helpful hint for an 11+ student to guess the meaning of the ${partOfSpeech} "${word}". Do not use the word itself or its definition directly. Keep it short and encouraging.`,
  });
  return response.text || "Think about how you might use this in a story!";
};

export const validateUserAnswer = async (word: Word, answer: GameAnswer): Promise<ValidationResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Evaluate this student's answer for the word "${word.word}".
      Correct Word Data:
      - Definition: ${word.definition}
      - Synonyms: ${word.synonyms.join(', ')}
      - Antonyms: ${word.antonyms.join(', ')}
      
      Student Answer:
      - Definition: ${answer.definition}
      - Synonyms: ${answer.synonyms}
      - Antonyms: ${answer.antonyms}
      - Sentence: ${answer.sentence}
      
      Provide a constructive score (0-100) and specific feedback for an 11+ student.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          corrections: {
            type: Type.OBJECT,
            properties: {
              definition: { type: Type.STRING },
              synonyms: { type: Type.STRING },
              antonyms: { type: Type.STRING },
              sentence: { type: Type.STRING }
            }
          }
        },
        required: ["isCorrect", "score", "feedback", "corrections"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as ValidationResult;
};

// Implement base64 decoding manually as per guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Audio decoding for raw PCM data as per guidelines
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const playWordPronunciation = async (word: string): Promise<void> => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say this word clearly: ${word}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data returned");

  // Decode using the raw PCM logic
  const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start(0);
};
