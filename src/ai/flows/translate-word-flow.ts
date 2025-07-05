'use server';
/**
 * @fileOverview A flow to translate a single word from Russian to Persian.
 *
 * - translateWord - A function that handles the single word translation.
 * - TranslateWordInput - The input type for the translateWord function.
 * - TranslateWordOutput - The return type for the translateWord function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const TranslateWordInputSchema = z.object({
  word: z.string().describe('The Russian word to translate.'),
});
export type TranslateWordInput = z.infer<typeof TranslateWordInputSchema>;

export const TranslateWordOutputSchema = z.object({
  translation: z.string().describe('The translated Persian word or a short phrase.'),
});
export type TranslateWordOutput = z.infer<typeof TranslateWordOutputSchema>;

export async function translateWord(
  input: TranslateWordInput
): Promise<TranslateWordOutput> {
  return translateWordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateWordPrompt',
  input: {schema: TranslateWordInputSchema},
  output: {schema: TranslateWordOutputSchema},
  prompt: `You are an expert Russian to Persian translator. Translate the following single Russian word to its most common Persian equivalent.
  
Provide only the Persian translation. Do not add any extra text, explanations, or quotation marks. If the word has multiple common meanings, provide the most likely one in a concise phrase.

Russian Word:
{{{word}}}
`,
});

const translateWordFlow = ai.defineFlow(
  {
    name: 'translateWordFlow',
    inputSchema: TranslateWordInputSchema,
    outputSchema: TranslateWordOutputSchema,
  },
  async input => {
    // If word is empty, return empty translation to save tokens.
    if (!input.word.trim()) {
        return { translation: '' };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
