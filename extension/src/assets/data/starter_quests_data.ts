
import type { Quest } from '../../core_logic/types';

export const starterQuestsData: Quest[] = [
  {
    id: 'quest_onboarding_complete',
    title: 'Welcome Aboard!',
    description: 'Complete your initial cognitive profile setup to begin your Mindframe journey.',
    icon: '🚀',
    steps: [
      { description: 'Finish all onboarding steps.', completed: false, targetValue: 1 }
    ],
    rewardWXP: 50,
    tags: ['beginner', 'onboarding'],
    isMandatory: true,
  },
  {
    id: 'quest_first_three_drills',
    title: 'Gym Novice',
    description: 'Sharpen your mind by completing any 3 HC drills in the Gym.',
    icon: '🏋️',
    steps: [
      { description: 'Complete 1st HC Drill.', completed: false },
      { description: 'Complete 2nd HC Drill.', completed: false },
      { description: 'Complete 3rd HC Drill.', completed: false },
    ],
    rewardWXP: 75,
    tags: ['beginner', 'hc_gym', 'practice'],
  },
  {
    id: 'quest_first_insight_challenge',
    title: 'Insight Challenger',
    description: 'Accept and reflect on your first micro-challenge from an insight card.',
    icon: '💡',
    steps: [
        { description: 'Accept a micro-challenge from an insight card.', completed: false }
    ],
    rewardWXP: 25,
    tags: ['beginner', 'co-pilot', 'reflection']
  }
];
