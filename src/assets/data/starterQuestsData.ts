
import type { Quest } from '@/types';

export const starterQuestsData: Quest[] = [
  {
    id: 'quest_onboarding_complete',
    title: 'Welcome Aboard!',
    description: 'Complete your initial cognitive profile setup.',
    rewardWXP: 50,
    criteria: {
      type: 'rate_hc_familiarity', // This is a placeholder; actual completion triggered by onboardingLogic
      targetValue: true, // Simply means onboarding was done
    },
  },
  {
    id: 'quest_first_drills',
    title: 'Sharpen Your Skills',
    description: 'Complete any 3 HC drills in the Gym.',
    rewardWXP: 75,
    criteria: {
      type: 'complete_drills',
      count: 3,
    },
  },
  {
    id: 'quest_explore_critique',
    title: 'Critical Explorer',
    description: 'Explore the Critical Thinking HC and complete one of its drills.',
    rewardWXP: 40,
    criteria: {
        type: 'explore_hc',
        hcId: 'critique', // Assumes completion of one drill from this HC
    }
  }
];
