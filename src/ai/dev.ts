import { config } from 'dotenv';
config();

import '@/ai/flows/generate-challenge-prompt.ts';
import '@/ai/flows/summarize-hc-drills.ts';
import '@/ai/flows/analyze-text-for-bias.ts';