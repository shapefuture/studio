
import type {
  CognitiveProfileV1,
  SJTScenario,
  UserOnboardingData,
  MindframeStoreState,
  Quest
} from './types';
import { MindframeStore } from './MindframeStore.js'; // Use .js as per prompt
import { sjtScenariosData } from '../assets/data/sjt_scenarios_data';
import { starterQuestsData } from '../assets/data/starter_quests_data';
import { GamificationService } from './gamificationService.js'; // Use .js as per prompt

/**
 * Generates a UUID v4.
 * @returns {string} A new UUID.
 */
function generateUUIDv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Calculates potential biases based on SJT answers.
 * @param sjtAnswersById - Object mapping scenarioId to selected option ID (text or index).
 * @param scenarios - Array of SJTScenario objects.
 * @returns Object map of bias names to scores.
 */
function calculatePotentialBiases(
  sjtAnswersById: { [scenarioId: string]: string }, // Assuming optionId is string. If it's option index, type should be number.
  scenarios: SJTScenario[]
): { [biasName: string]: number } {
  const potentialBiases: { [biasName: string]: number } = {};

  scenarios.forEach(scenario => {
    const selectedOptionId = sjtAnswersById[scenario.id]; // This assumes selectedOptionId is the *text* of the option.
                                                        // If it's index, logic needs to adjust.
                                                        // Let's assume sjtAnswersById stores the *index* of the selected option as a string.

    if (selectedOptionId === undefined || selectedOptionId === null) return;

    // The prompt for UserOnboardingData implies sjtAnswersById maps scenarioId to selectedOptionId (string).
    // The SJTScenarioOption itself doesn't have an 'id'. So we'll assume the string is the option's text, or we need to rethink.
    // Let's assume UserOnboardingData.sjtAnswersById maps scenario.id to the *index* of the selected option.

    const selectedOptionIndex = parseInt(selectedOptionId, 10);
    if (isNaN(selectedOptionIndex) || selectedOptionIndex < 0 || selectedOptionIndex >= scenario.options.length) {
        return;
    }

    const selectedOption = scenario.options[selectedOptionIndex];

    if (selectedOption.cognitiveBiasTargeted && (selectedOption.cognitiveBiasTargetedScore || 0) > 0) {
      const biasName = selectedOption.cognitiveBiasTargeted;
      const score = selectedOption.cognitiveBiasTargetedScore || 0;
      potentialBiases[biasName] = (potentialBiases[biasName] || 0) + score;
    }
  });

  return potentialBiases;
}


/**
 * Processes user onboarding data, creates a cognitive profile,
 * initializes gamification, and assigns starter quests.
 * @param rawOnboardingData - The data collected from the onboarding UI.
 * This should match the structure expected by `UserOnboardingData` but before userId is assigned.
 */
export async function processOnboardingData(
  rawOnboardingData: Omit<UserOnboardingData, 'userId'>
): Promise<CognitiveProfileV1> {
  const userId = generateUUIDv4(); // Generate userId here

  const onboardingData: UserOnboardingData = {
    userId,
    ...rawOnboardingData
  };

  const potentialBiases = calculatePotentialBiases(
    onboardingData.sjtAnswersById,
    sjtScenariosData
  );

  const newProfile: CognitiveProfileV1 = {
    version: 1,
    userId: onboardingData.userId,
    primaryGoal: onboardingData.primaryGoal,
    interests: onboardingData.userInterests,
    potentialBiases,
    hcProficiency: onboardingData.hcProficiency,
    onboardingCompletedTimestamp: Date.now(),
  };

  // Determine starter quest(s)
  // For MVP, let's assign the "Welcome Aboard!" quest and one based on primary goal or interest if possible.
  const activeQuestIds: string[] = [];
  const welcomeQuest = starterQuestsData.find(q => q.id === 'quest_onboarding_complete');
  if (welcomeQuest) {
    activeQuestIds.push(welcomeQuest.id);
  }
  // Potentially add another starter quest based on profile, e.g., related to primaryGoal.
  // For now, just the welcome quest is automatically assigned on onboarding completion.
  // Other quests can be discovered or assigned through other mechanics.

  const WXP_FOR_ONBOARDING = 50;

  await MindframeStore.update((currentState: MindframeStoreState) => {
    // This function returns a partial update for MindframeStore
    return {
      userId: onboardingData.userId, // Ensure userId is set in the store
      userProfile: newProfile,
      onboardingProgress: null, // Onboarding is complete
      gamificationData: {
        ...currentState.gamificationData, // Keep existing gamification data if any, or default
        wxp: (currentState.gamificationData?.wxp || 0) + WXP_FOR_ONBOARDING,
        level: GamificationService.getLevel((currentState.gamificationData?.wxp || 0) + WXP_FOR_ONBOARDING),
      },
      activeQuestIds: Array.from(new Set([...(currentState.activeQuestIds || []), ...activeQuestIds])),
      // Potentially mark the 'quest_onboarding_complete' as completed if its steps are met by this process
      // For now, just adding to active. Quest completion logic would handle it.
    };
  });

  console.log("Onboarding complete. Profile saved:", newProfile);
  const finalState = await MindframeStore.get();
  console.log(`Gamification: WXP=${finalState.gamificationData.wxp}, Level=${finalState.gamificationData.level}`);

  return newProfile;
}
