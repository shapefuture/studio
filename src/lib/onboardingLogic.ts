
import type { CognitiveProfileV1, SJTScenario, Quest } from '@/types';
import { mindframeStore } from './MindframeStore';
import { gamificationService } from './gamificationService';
import { sjtScenariosData } from '@/assets/data/sjtScenariosData'; // Assuming this path
import { starterQuestsData } from '@/assets/data/starterQuestsData';

interface OnboardingInputData {
  interests: string[];
  sjtAnswers: { scenarioId: string; selectedOptionId: string }[];
  hcFamiliarity: { [hcId: string]: number };
  userGoal: string;
}

// Simple bias mapping for demo purposes
// In a real app, this could be more complex or even involve light LLM evaluation for nuanced text
const BIAS_MAP: { [key: string]: string } = {
  confirmation_bias_strong: 'Strong tendency towards Confirmation Bias',
  confirmation_bias_mild: 'Mild tendency towards Confirmation Bias',
  confirmation_bias_social: 'Social Confirmation tendency',
  anchoring_strong: 'Susceptible to Anchoring Bias',
  availability_strong: 'Influenced by Availability Heuristic',
};

function calculatePotentialBiases(
  sjtAnswers: { scenarioId: string; selectedOptionId: string }[],
  scenarios: SJTScenario[]
): string[] {
  const biases: Set<string> = new Set();
  sjtAnswers.forEach(answer => {
    const scenario = scenarios.find(s => s.id === answer.scenarioId);
    if (scenario) {
      const option = scenario.options.find(o => o.id === answer.selectedOptionId);
      if (option && option.mapsToBiasKey && BIAS_MAP[option.mapsToBiasKey]) {
        biases.add(BIAS_MAP[option.mapsToBiasKey]);
      }
    }
  });
  return Array.from(biases);
}

export async function processOnboardingData(data: OnboardingInputData): Promise<CognitiveProfileV1> {
  const potentialBiases = calculatePotentialBiases(data.sjtAnswers, sjtScenariosData);

  const newProfile: CognitiveProfileV1 = {
    version: 1,
    userGoal: data.userGoal,
    interests: data.interests,
    sjtAnswers: data.sjtAnswers,
    hcFamiliarity: data.hcFamiliarity,
    potentialBiasesIdentified: potentialBiases,
    onboardingCompleted: true,
  };

  // Update store with the new profile
  await mindframeStore.updateProfile(newProfile);
  
  // Initialize gamification: WXP +50, Level 1 (as per plan, though gamification service handles levels)
  const {newWXP, newLevel} = await gamificationService.addWXP(50); // Award WXP for onboarding

  // Mark onboarding quest as complete and assign other starter quests
  const onboardingQuest = starterQuestsData.find(q => q.id === 'quest_onboarding_complete');
  if (onboardingQuest) {
    // Award WXP for this specific quest if not already given by addWXP(50)
    // This logic might need refinement if addWXP is called multiple times for onboarding steps
    // For now, we assume the 50 WXP covers the onboarding quest.
    await mindframeStore.completeQuest(onboardingQuest.id);
  }
  // Assign other starter quests
  await mindframeStore.assignInitialQuests();


  console.log("Onboarding complete. Profile saved:", newProfile);
  console.log(`Gamification: WXP=${newWXP}, Level=${newLevel}`);
  
  return newProfile;
}
