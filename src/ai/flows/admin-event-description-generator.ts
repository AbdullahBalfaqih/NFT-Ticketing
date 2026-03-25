'use server';
/**
 * @fileOverview An AI assistant for generating or refining event descriptions for the admin dashboard.
 *
 * - generateEventDescription - A function that handles the event description generation/refinement process.
 * - AdminEventDescriptionGeneratorInput - The input type for the generateEventDescription function.
 * - AdminEventDescriptionGeneratorOutput - The return type for the generateEventDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminEventDescriptionGeneratorInputSchema = z.object({
  keywords: z
    .array(z.string())
    .optional()
    .describe('An array of keywords relevant to the event.'),
  theme: z.string().optional().describe('The main theme or genre of the event.'),
  existingDescription: z
    .string()
    .optional()
    .describe(
      'An optional existing description to be refined. If provided, the AI will refine this description based on keywords and theme.'
    ),
});
export type AdminEventDescriptionGeneratorInput = z.infer<
  typeof AdminEventDescriptionGeneratorInputSchema
>;

const AdminEventDescriptionGeneratorOutputSchema = z.object({
  generatedDescription: z
    .string()
    .describe('The AI-generated or refined event description.'),
});
export type AdminEventDescriptionGeneratorOutput = z.infer<
  typeof AdminEventDescriptionGeneratorOutputSchema
>;

export async function generateEventDescription(
  input: AdminEventDescriptionGeneratorInput
): Promise<AdminEventDescriptionGeneratorOutput> {
  return adminEventDescriptionGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminEventDescriptionGeneratorPrompt',
  input: {schema: AdminEventDescriptionGeneratorInputSchema},
  output: {schema: AdminEventDescriptionGeneratorOutputSchema},
  prompt: `You are an AI assistant specialized in writing engaging and concise event descriptions.

Your task is to generate a compelling event description based on the provided information, or refine an existing one if provided.

${'{{{ #if existingDescription }}}'}
Refine the following existing description to make it more engaging and relevant, incorporating the provided keywords and theme:
Existing Description: """{{{existingDescription}}}"""
${'{{{ else }}}'}
Generate a new event description from scratch based on the following details:
${'{{{ /if }}}'}

${'{{{ #if theme }}}'}
Event Theme: {{{theme}}}
${'{{{ /if }}}'}

${'{{{ #if keywords }}}'}
Keywords: ${'{{{ keywords }}}'}
${'{{{ /if }}}'}

Ensure the description is engaging, clear, and highlights the unique aspects of the event. Aim for a tone that matches the event theme. The description should be suitable for a public event ticketing platform.

Response must be in JSON format.`,
});

const adminEventDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'adminEventDescriptionGeneratorFlow',
    inputSchema: AdminEventDescriptionGeneratorInputSchema,
    outputSchema: AdminEventDescriptionGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
