
import type { SJTScenario } from '@/types';

export const sjtScenariosData: SJTScenario[] = [
  {
    id: 'sjt_confirm_01',
    scenarioText: 'You are researching a new phone to buy. You have a favorite brand and find an article that lists many great features of their latest model, confirming your initial preference. What are you most likely to do next?',
    options: [
      { id: 'a', text: 'Stop researching and decide to buy that phone, as the article confirmed it\'s good.', mapsToBiasKey: 'confirmation_bias_strong' },
      { id: 'b', text: 'Briefly look for reviews of other brands but mostly focus on finding more positive details about your preferred brand.' , mapsToBiasKey: 'confirmation_bias_mild'},
      { id: 'c', text: 'Actively search for critical reviews of your preferred brand and equally detailed positive reviews of competing brands.' },
      { id: 'd', text: 'Ask friends who own the same brand for their (likely positive) opinions.' , mapsToBiasKey: 'confirmation_bias_social'},
    ],
    // associatedBias: 'Confirmation Bias',
  },
  {
    id: 'sjt_anchor_01',
    scenarioText: 'You are negotiating the price of a used item. The seller initially asks for $200. You think it\'s worth around $100. What is your negotiation strategy likely to be influenced by?',
    options: [
      { id: 'a', text: 'Firmly offer $100 and stick to it, regardless of their initial price.' },
      { id: 'b', text: 'Offer $150, trying to meet somewhere in the middle of your valuation and their ask.' , mapsToBiasKey: 'anchoring_strong'},
      { id: 'c', text: 'Start by offering $80, significantly lower than your valuation, to counter their high anchor.' },
      { id: 'd', text: 'Ignore their initial price completely and only state what you are willing to pay based on your research ($100).' },
    ],
    // associatedBias: 'Anchoring Bias',
  },
  {
    id: 'sjt_avail_01',
    scenarioText: 'You recently saw several news reports about a rare but dramatic type of accident. Now, you need to make a decision related to an activity where this type of accident, while statistically very unlikely, could occur. How does this affect your decision-making?',
    options: [
      { id: 'a', text: 'You significantly overestimate the likelihood of that accident and might avoid the activity altogether.' , mapsToBiasKey: 'availability_strong'},
      { id: 'b', text: 'You acknowledge the news but primarily rely on statistical data to assess the actual risk.' },
      { id: 'c', text: 'You feel a bit more anxious but proceed after rationally considering the low probability.' },
      { id: 'd', text: 'You dismiss the news reports as fear-mongering and ignore any potential risk.' },
    ],
    // associatedBias: 'Availability Heuristic/Bias',
  },
];
