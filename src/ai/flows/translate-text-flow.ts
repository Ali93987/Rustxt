'use server';
/**
 * @fileOverview A flow to translate a block of text from Russian to Persian.
 *
 * - translateText - A function that handles the text translation.
 * - TranslateTextPublicInput - The public input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// This is the input schema for the public-facing wrapper function.
// It's more convenient for the caller than passing a JSON string.
export const TranslateTextPublicInputSchema = z.object({
  text: z.string().describe('The Russian text to translate.'),
  vocabulary: z
    .record(z.string())
    .describe(
      'A key-value map of Russian words to their Persian translations to guide the translation.'
    ),
});
export type TranslateTextPublicInput = z.infer<typeof TranslateTextPublicInputSchema>;

// This is the internal schema for the Genkit flow and prompt,
// as Handlebars templates cannot stringify objects directly.
const TranslateTextFlowInputSchema = z.object({
  text: z.string(),
  vocabularyJson: z.string(),
});

export const TranslateTextOutputSchema = z.object({
  translation: z.string().describe('The translated Persian text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;


export async function translateText(
  input: TranslateTextPublicInput
): Promise<TranslateTextOutput> {
  return translateTextFlow({
    text: input.text,
    vocabularyJson: JSON.stringify(input.vocabulary || {}, null, 2),
  });
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextFlowInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `You are an expert Russian to Persian translator. Translate the following Russian text to fluent, natural-sounding Persian.

Use the provided vocabulary map as a strong guide for translating specific words to maintain consistency with the rest of the application. However, prioritize natural language flow over a literal word-for-word translation if it sounds better.

Return only the final Persian translation. Do not include any other text, preambles, or explanations.

Vocabulary Hints:
\`\`\`json
{{{vocabularyJson}}}
\`\`\`

Russian Text to Translate:
---
{{{text}}}
---
`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextFlowInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    // If text is empty, return empty translation to save tokens.
    if (!input.text.trim()) {
        return { translation: '' };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
