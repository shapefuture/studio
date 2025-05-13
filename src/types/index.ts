
import type { LucideIcon } from 'lucide-react';

// --- Core Heuristics & Cognitive Skills Types ---

export interface HC {
  id: string;
  tag: string; // e.g., #critique
  name: string;
  description: string;
  longDescription?: string;
  icon?: LucideIcon;
  // Drills are now separate in hcDrillsData.ts, linked by hcId
}

export interface HCDrillOption {
  id: string; // e.g., 'a', 'b', 'c'
  text: string;
}

export interface HCDrillQuestion {
  id: string; // Unique drill ID
  hcId: string; // ID of the HC this drill belongs to
  name: string; // Name of the drill/question
  questionText: string;
  options: HCDrillOption[];
  correctAnswerId: string; // ID of the correct HCDrillOption
  explanationOnCorrect: string;
  explanationOnIncorrect: string;
  rewardWXP?: number; // WXP points awarded for completion
}

// --- Situational Judgement Test (SJT) Types ---

export interface SJTOption {
  id: string;
  text: string;
  mapsToBiasKey?: string; // Optional: key to identify a specific bias if this option indicates it
}

export interface SJTScenario {
  id: string;
  scenarioText: string;
  options: SJTOption[];
  // associatedBias: string; // General bias the scenario might explore, e.g., "Confirmation Bias"
  // Individual options can map to specific bias tendencies
}

// --- User Profile & Onboarding Types ---

export interface CognitiveProfileV1 {
  version: 1;
  userGoal?: string; // Primary goal selected during onboarding
  interests: string[]; // Array of interest IDs
  sjtAnswers: {
    scenarioId: string; // SJTScenario ID
    selectedOptionId: string;
  }[];
  hcFamiliarity: { [hcId: string]: number }; // 0-5 rating for each HC
  potentialBiasesIdentified?: string[]; // From SJT analysis
  onboardingCompleted: boolean;
}

// --- Gamification & Quest Types ---

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardWXP: number;
  criteria: {
    type: 'complete_drills' | 'rate_hc_familiarity' | 'explore_hc'; // Add more as needed
    count?: number; // e.g., complete 3 drills
    hcId?: string; // e.g., explore specific HC
    targetValue?: any; // for specific criteria
  };
  isCompleted?: boolean; // Track completion status within the quest object if managed in activeQuests
}

export interface GamificationData {
  wxp: number;
  level: number;
  completedDrillIds: string[]; // Array of HCDrillQuestion IDs
  // completedChallenges is now completedDrillIds for clarity with MCQs
  // activeQuests are now part of MindframeStoreState directly
  // completedQuests are now part of MindframeStoreState directly
}

// --- Insight Types ---

// For LLM-generated insights (as per plan's XML-like structure)
export interface LLMInsight {
  pattern_type: string; // e.g., 'Confirmation Bias', 'Anchoring', or 'none'
  hc_related: string; // HC ID, e.g., 'bias-detection'
  explanation: string;
  highlight_suggestion_css_selector?: string; // CSS selector for host page highlighting
  micro_challenge_prompt: string;
}

// For predefined offline insights
export interface OfflineInsight {
  id: string;
  text: string;
  type: 'tip' | 'motivation' | 'question' | 'fact';
  hcId?: string; // Optional: link to a relevant HC
}

// General Insight type used in UI components like InsightCard
// This can be derived from LLMInsight or OfflineInsight
export interface UiInsight {
  id: string; // Can be generated or use original ID
  title: string; // e.g., "Potential Bias: Confirmation Bias" or "Quick Tip"
  sourceType: 'llm' | 'offline';
  hcId?: string; // To link to HC Gym
  explanation: string;
  challengePrompt?: string; // For LLM insights
  timestamp?: number;
}


// --- Local Storage (MindframeStore) Types ---

export interface MindframeStoreState {
  version: number;
  profile: CognitiveProfileV1 | null;
  gamification: GamificationData;
  activeQuests: Quest[];
  completedQuestIds: string[];
  lastLLMAnalysisCache?: {
    [textHash: string]: {
      insight: LLMInsight;
      timestamp: number;
    };
  };
}

// Keep existing simple Insight for compatibility or update if InsightCard is fully switched
export interface Insight {
  id: string;
  biasType: string;
  textExcerpt: string;
  challengePrompt: string;
  hcId: string; // Link to relevant HC
  timestamp: number;
}
