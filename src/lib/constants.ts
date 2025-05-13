
import type { CognitiveProfileV1, GamificationData } from '@/types';
// HCS, SJT_QUESTIONS are now in src/assets/data/

export const APP_NAME = 'Local Cognitive Coach';

export const INTERESTS_OPTIONS = [
  { id: 'tech', label: 'Technology' },
  { id: 'science', label: 'Science' },
  { id: 'business', label: 'Business & Finance' },
  { id: 'arts', label: 'Arts & Culture' },
  { id: 'health', label: 'Health & Wellness' },
  { id: 'politics', label: 'Politics & Current Events' },
  { id: 'education', label: 'Education' },
  { id: 'sports', label: 'Sports' },
  { id: 'psychology', label: 'Psychology & Self-Improvement'},
  { id: 'history', label: 'History'},
];

export const DEFAULT_COGNITIVE_PROFILE: CognitiveProfileV1 = {
  version: 1,
  userGoal: undefined,
  interests: [],
  sjtAnswers: [],
  hcFamiliarity: {},
  potentialBiasesIdentified: [],
  onboardingCompleted: false,
};

export const DEFAULT_GAMIFICATION_DATA: GamificationData = {
  wxp: 0,
  level: 1,
  completedDrillIds: [],
};

// For Cloudflare Worker proxy (replace with your actual worker URL if deployed)
export const LLM_PROXY_URL = process.env.NEXT_PUBLIC_LLM_PROXY_URL || 'http://127.0.0.1:8787/api/analyze'; // Default for local dev with wrangler
