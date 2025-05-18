// Genkit specific initialization.
// The Cloudflare worker in the blueprint calls the LLM API directly (OpenRouter).
// If Genkit were to be used on the Cloudflare worker side, this might be relevant there.
// Preserving for now.
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-pro', // Note: Prompt specificies 'google/gemini-2.0-flash-exp:free' or similar for worker
});
