'use server';

/**
 * @fileOverview An AI flow for translating Russian words and providing pronunciation.
 *
 * - translateWord - A function that handles the translation and TTS process.
 * - TranslateWordInput - The input type for the translateWord function.
 * - TranslateWordOutput - The return type for the translateWord function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';

// The input schema for our flow (not exported)
const TranslateWordInputSchema = z.object({
  word: z.string().describe('The Russian word to translate.'),
});
export type TranslateWordInput = z.infer<typeof TranslateWordInputSchema>;

// The output schema for our flow (not exported)
const TranslateWordOutputSchema = z.object({
  translation: z.string().describe('The Persian translation of the word.'),
  phonetic: z.string().describe('The phonetic transcription in simple Latin letters (e.g., privet).'),
  audioDataUri: z.string().describe("The audio pronunciation as a data URI in WAV format."),
});
export type TranslateWordOutput = z.infer<typeof TranslateWordOutputSchema>;

/**
 * The main exported function that client components will call.
 * It invokes the Genkit flow and returns the result.
 */
export async function translateWord(input: TranslateWordInput): Promise<TranslateWordOutput> {
  return translateWordFlow(input);
}

// Genkit prompt for getting translation and phonetics in a structured format
const translationPrompt = ai.definePrompt({
  name: 'translationPrompt',
  input: { schema: z.object({ word: z.string() }) },
  output: {
    schema: z.object({
      translation: z.string().describe('The direct, most common Persian translation.'),
      phonetic: z.string().describe('A simple, easy-to-read phonetic transcription in Latin letters.'),
    }),
  },
  prompt: `You are a concise Russian-to-Persian translator.
    For the given Russian word, provide its most common Persian translation and a simple phonetic transcription in Latin letters.
    Provide only the JSON output, with no additional text or explanations.
    Word: {{{word}}}`,
});

// The Genkit flow that orchestrates the AI calls
const translateWordFlow = ai.defineFlow(
  {
    name: 'translateWordFlow',
    inputSchema: TranslateWordInputSchema,
    outputSchema: TranslateWordOutputSchema,
  },
  async ({ word }) => {
    // 1. Get translation and phonetics from the LLM
    const { output: textData } = await translationPrompt({ word });
    if (!textData) {
      throw new Error('Failed to get translation from the model.');
    }

    // 2. Generate Text-to-Speech audio for the original Russian word
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Naira' } }, // A Russian-compatible voice
        },
      },
      prompt: word,
    });
    if (!media) {
      throw new Error('Failed to generate audio from the model.');
    }

    // 3. Convert the raw PCM audio data to WAV format
    const pcmBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(pcmBuffer);

    // 4. Combine all results and return
    return {
      translation: textData.translation,
      phonetic: textData.phonetic,
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);

/**
 * Converts a raw PCM audio buffer to a Base64-encoded WAV string.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}
