// use server'
'use server';
/**
 * @fileOverview Generates a challenge prompt to help users consider alternative perspectives and improve their cognitive skills.
 *
 * - generateChallengePrompt - A function that generates a challenge prompt based on detected bias.
 * - GenerateChallengePromptInput - The input type for the generateChallengePrompt function.
 * - GenerateChallengePromptOutput - The return type for the generateChallengePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChallengePromptInputSchema = z.object({
  biasType: z.string().describe('The type of cognitive bias detected.'),
  textExcerpt: z.string().describe('A relevant excerpt of the text exhibiting the bias.'),
});
export type GenerateChallengePromptInput = z.infer<typeof GenerateChallengePromptInputSchema>;

const GenerateChallengePromptOutputSchema = z.object({
  challengePrompt: z.string().describe('A prompt designed to challenge the detected bias and encourage alternative perspectives.'),
});
export type GenerateChallengePromptOutput = z.infer<typeof GenerateChallengePromptOutputSchema>;

export async function generateChallengePrompt(input: GenerateChallengePromptInput): Promise<GenerateChallengePromptOutput> {
  return generateChallengePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChallengePromptPrompt',
  input: {schema: GenerateChallengePromptInputSchema},
  output: {schema: GenerateChallengePromptOutputSchema},
  prompt: `You are a cognitive coach, skilled at helping people overcome biases.

  A user has exhibited the following bias:
  Bias Type: {{{biasType}}}
  Text Excerpt: {{{textExcerpt}}}

  Generate a single question or prompt that encourages the user to consider alternative perspectives and challenge the bias. Be concise and direct.
  `,
});

const generateChallengePromptFlow = ai.defineFlow(
  {
    name: 'generateChallengePromptFlow',
    inputSchema: GenerateChallengePromptInputSchema,
    outputSchema: GenerateChallengePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
