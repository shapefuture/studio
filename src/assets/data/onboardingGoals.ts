
export interface OnboardingGoalOption {
  id: string;
  label: string;
  description: string;
}

export const onboardingGoalOptions: OnboardingGoalOption[] = [
  {
    id: 'improve_critical_thinking',
    label: 'Enhance Critical Thinking',
    description: 'Develop skills to analyze information objectively and make reasoned judgments.',
  },
  {
    id: 'reduce_biases',
    label: 'Understand & Reduce Biases',
    description: 'Learn to identify common cognitive biases and lessen their impact on your decisions.',
  },
  {
    id: 'better_decision_making',
    label: 'Make Better Decisions',
    description: 'Improve your ability to make sound choices by sharpening your cognitive toolkit.',
  },
  {
    id: 'improve_perspective_taking',
    label: 'Broaden My Perspective',
    description: 'Become better at understanding situations from multiple viewpoints.',
  },
  {
    id: 'general_cognitive_fitness',
    label: 'Boost General Cognitive Fitness',
    description: 'Keep your mind sharp and agile with regular cognitive exercises.',
  },
];
