import type { CognitiveProfileV1, GamificationData } from '@/types';

export const APP_NAME = 'Mindframe OS';

export const DEFAULT_COGNITIVE_PROFILE: CognitiveProfileV1 = {
  version: 1,
  userGoal: '',
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

export const INTERESTS_OPTIONS = [
  { id: 'tech', label: 'Technology' },
  { id: 'science', label: 'Science' },
  { id: 'business', label: 'Business & Finance' },
  { id: 'arts', label: 'Arts & Culture' },
  { id: 'health', label: 'Health & Wellness' },
  { id: 'politics', label: 'Politics & Current Events' },
  { id: 'education', label: 'Education' },
  { id: 'psychology', label: 'Psychology' },
  { id: 'self_improvement', label: 'Self-Improvement' },
];

// Note: LLM_PROXY_URL was here but is better handled by environment variables for the extension
// For the Next.js part, if it needs it, it should also use environment variables (e.g., NEXT_PUBLIC_LLM_PROXY_URL)
