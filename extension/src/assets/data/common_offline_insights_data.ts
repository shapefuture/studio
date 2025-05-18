
import type { OfflineInsight } from '../../core_logic/types';

export const commonOfflineInsightsData: OfflineInsight[] = [
  {
    id: 'offline_tip_01',
    text: "Take a moment to consider an alternative viewpoint. How might someone else see this situation?",
    type: 'tip',
    hcId: 'perspective-taking',
    pattern_type: 'general_tip',
    explanation: "Take a moment to consider an alternative viewpoint. How might someone else see this situation?",
    micro_challenge_prompt: "What's one different way to interpret the current situation or text?",
  },
  {
    id: 'offline_motivation_01',
    text: "Every challenge is an opportunity to grow your cognitive skills. Keep practicing!",
    type: 'motivation',
    hcId: null,
    pattern_type: 'motivational_quote',
    explanation: "Every challenge is an opportunity to grow your cognitive skills. Keep practicing!",
    micro_challenge_prompt: "What's one small step you can take today to improve a skill?",
  },
  {
    id: 'offline_question_01',
    text: "What's one assumption you're making right now? Is it well-supported?",
    type: 'question',
    hcId: 'assumption-spotting',
    pattern_type: 'reflection_prompt',
    explanation: "What's one assumption you're making right now? Is it well-supported?",
    micro_challenge_prompt: "Identify one assumption in the text you're reading. Is it stated or unstated?",
  },
  {
    id: 'offline_fact_01',
    text: "Did you know? Confirmation bias makes us seek out info that supports what we already believe. Stay vigilant!",
    type: 'fact',
    hcId: 'fallacy-detection', // Or a specific 'bias-awareness' HC if created
    pattern_type: 'educational_fact',
    explanation: "Confirmation bias is the tendency to search for, interpret, favor, and recall information in a way that confirms or supports one's preexisting beliefs or hypotheses.",
    micro_challenge_prompt: "Can you recall a time you might have exhibited confirmation bias recently?",
  },
  {
    id: 'offline_tip_02',
    text: "Before accepting a claim, ask: What's the evidence? Is the source reliable?",
    type: 'tip',
    hcId: 'evidence-based',
    pattern_type: 'general_tip',
    explanation: "Before accepting a claim, ask: What's the evidence? Is the source reliable?",
    micro_challenge_prompt: "For the next claim you encounter, try to find at least two pieces of evidence.",
  },
];
