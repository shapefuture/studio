
import type { SJTScenario } from '../../core_logic/types';

export const sjtScenariosData: SJTScenario[] = [
  {
    id: 'sjt_confirmation_bias',
    scenarioText: 'You are researching a new phone to buy. You have a favorite brand and find an article that lists many great features of their latest model, confirming your initial preference. What are you most likely to do next?',
    options: [
      {
        text: 'Stop researching and decide to buy that phone, as the article confirmed it\'s good.',
        cognitiveBiasTargeted: 'Confirmation Bias',
        cognitiveBiasTargetedScore: 2,
        isBetterThinking: false,
      },
      {
        text: 'Briefly look for reviews of other brands but mostly focus on finding more positive details about your preferred brand.',
        cognitiveBiasTargeted: 'Confirmation Bias',
        cognitiveBiasTargetedScore: 1,
        isBetterThinking: false,
      },
      {
        text: 'Actively search for critical reviews of your preferred brand and equally detailed positive reviews of competing brands.',
        cognitiveBiasTargeted: null,
        cognitiveBiasTargetedScore: 0,
        isBetterThinking: true,
      },
      {
        text: 'Ask friends who own the same brand for their (likely positive) opinions.',
        cognitiveBiasTargeted: 'Confirmation Bias', // Social confirmation
        cognitiveBiasTargetedScore: 1,
        isBetterThinking: false,
      },
    ],
    biasExplanation: 'Confirmation bias is our tendency to search for, interpret, favor, and recall information in a way that confirms or supports our prior beliefs or values.',
    relatedInterests: ["tech", "business"],
  },
  {
    id: 'sjt_anchoring_bias',
    scenarioText: 'You are negotiating the price of a used item. The seller initially asks for $200. You think it\'s worth around $100. What is your negotiation strategy likely to be influenced by?',
    options: [
      {
        text: 'Firmly offer $100 and stick to it, regardless of their initial price.',
        cognitiveBiasTargeted: null,
        cognitiveBiasTargetedScore: 0,
        isBetterThinking: true,
      },
      {
        text: 'Offer $150, trying to meet somewhere in the middle of your valuation and their ask.',
        cognitiveBiasTargeted: 'Anchoring Bias',
        cognitiveBiasTargetedScore: 2,
        isBetterThinking: false,
      },
      {
        text: 'Start by offering $80, significantly lower than your valuation, to counter their high anchor.',
        cognitiveBiasTargeted: null, // This is a negotiation tactic, not necessarily bias-free but not anchoring to their price
        cognitiveBiasTargetedScore: 0,
        isBetterThinking: false, // Could be seen as strategic, but not "better thinking" in the sense of avoiding bias.
      },
      {
        text: 'Ignore their initial price completely and only state what you are willing to pay based on your research ($100).',
        cognitiveBiasTargeted: null,
        cognitiveBiasTargetedScore: 0,
        isBetterThinking: true,
      },
    ],
    biasExplanation: 'Anchoring bias occurs when individuals rely too heavily on an initial piece of information (the "anchor") when making decisions.',
    relatedInterests: ["business", "tech"],
  },
  {
    id: 'sjt_availability_heuristic',
    scenarioText: 'You recently saw several news reports about a rare but dramatic type of accident. Now, you need to make a decision related to an activity where this type of accident, while statistically very unlikely, could occur. How does this affect your decision-making?',
    options: [
      {
        text: 'You significantly overestimate the likelihood of that accident and might avoid the activity altogether.',
        cognitiveBiasTargeted: 'Availability Heuristic',
        cognitiveBiasTargetedScore: 2,
        isBetterThinking: false,
      },
      {
        text: 'You acknowledge the news but primarily rely on statistical data to assess the actual risk.',
        cognitiveBiasTargeted: null,
        cognitiveBiasTargetedScore: 0,
        isBetterThinking: true,
      },
      {
        text: 'You feel a bit more anxious but proceed after rationally considering the low probability.',
        cognitiveBiasTargeted: 'Availability Heuristic', // Acknowledges influence but tries to overcome
        cognitiveBiasTargetedScore: 1,
        isBetterThinking: true,
      },
      {
        text: 'You dismiss the news reports as fear-mongering and ignore any potential risk.',
        cognitiveBiasTargeted: 'Overconfidence Bias', // Could also be reactance
        cognitiveBiasTargetedScore: 1, // Not directly availability, but poor risk assessment
        isBetterThinking: false,
      },
    ],
    biasExplanation: 'The availability heuristic is a mental shortcut that relies on immediate examples that come to a given person\'s mind when evaluating a specific topic, concept, method or decision.',
    relatedInterests: ["health", "sports", "politics"],
  },
];
