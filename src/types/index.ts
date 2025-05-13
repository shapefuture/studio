import type { LucideIcon } from 'lucide-react';

export interface Drill {
  id: string;
  name: string;
  description: string;
  content: string; // Could be markdown or structured content
}

export interface HC {
  id: string;
  tag: string; // e.g., #critique
  name: string;
  description: string;
  longDescription?: string;
  icon?: LucideIcon;
  drills: Drill[];
}

export interface CognitiveProfileV1 {
  version: 1;
  interests: string[];
  sjtAnswers: { questionId: string; answer: string }[];
  hcFamiliarity: { [hcId: string]: number }; // 0-5 rating
  onboardingCompleted: boolean;
}

export interface Insight {
  id: string;
  biasType: string;
  textExcerpt: string;
  challengePrompt: string;
  hcId: string; // Link to relevant HC
  timestamp: number;
}

export interface GamificationData {
  wxp: number;
  level: number;
  completedChallenges: string[]; // array of insight IDs or challenge IDs
  activeQuests: string[]; // array of quest IDs
}
