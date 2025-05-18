// Genkit specific dev file, may not be directly relevant to Phase 1 of the extension build
// as per the prompt. Preserving for now, but its usage context might change.
import { config } from 'dotenv';
config();

// These flows are Next.js server actions. Their equivalents in the extension
// would be handled by the service worker and Cloudflare worker.
// import '@/ai/flows/generate-challenge-prompt.ts';
// import '@/ai/flows/summarize-hc-drills.ts';
// import '@/ai/flows/analyze-text-for-bias.ts';
