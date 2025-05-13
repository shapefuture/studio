'use server';

/**
 * @fileOverview Summarizes key concepts and exercises from HC Gym drills.
 *
 * - summarizeHcDrills - A function that summarizes HC Gym drills.
 * - SummarizeHcDrillsInput - The input type for the summarizeHcDrills function.
 * - SummarizeHcDrillsOutput - The return type for the summarizeHcDrills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeHcDrillsInputSchema = z.object({
  hcDrillsContent: z
    .string()
    .describe('The content of the HC Gym drills to be summarized.'),
});
export type SummarizeHcDrillsInput = z.infer<typeof SummarizeHcDrillsInputSchema>;

const SummarizeHcDrillsOutputSchema = z.object({
  summary: z.string().describe('A summary of the key concepts and exercises from the HC Gym drills.'),
});
export type SummarizeHcDrillsOutput = z.infer<typeof SummarizeHcDrillsOutputSchema>;

export async function summarizeHcDrills(input: SummarizeHcDrillsInput): Promise<SummarizeHcDrillsOutput> {
  return summarizeHcDrillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeHcDrillsPrompt',
  input: {schema: SummarizeHcDrillsInputSchema},
  output: {schema: SummarizeHcDrillsOutputSchema},
  prompt: `You are an expert cognitive coach. Please provide a concise summary of the key concepts and exercises from the following HC Gym drills content, focusing on practical application and reinforcement of understanding:\n\nContent: {{{hcDrillsContent}}}`,
});

const summarizeHcDrillsFlow = ai.defineFlow(
  {
    name: 'summarizeHcDrillsFlow',
    inputSchema: SummarizeHcDrillsInputSchema,
    outputSchema: SummarizeHcDrillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
