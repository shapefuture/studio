
import type { OfflineInsight } from '@/types';

export const commonOfflineInsightsData: OfflineInsight[] = [
  {
    id: 'offline_tip_01',
    text: "Take a moment to consider an alternative viewpoint. How might someone else see this situation?",
    type: 'tip',
    hcId: 'perspective-taking',
  },
  {
    id: 'offline_motivation_01',
    text: "Every challenge is an opportunity to grow your cognitive skills. Keep practicing!",
    type: 'motivation',
  },
  {
    id: 'offline_question_01',
    text: "What's one assumption you're making right now? Is it well-supported?",
    type: 'question',
    hcId: 'assumption-spotting',
  },
  {
    id: 'offline_fact_01',
    text: "Did you know? Confirmation bias makes us seek out info that supports what we already believe. Stay vigilant!",
    type: 'fact',
    hcId: 'bias-detection', // Assuming bias-detection HC exists
  },
  {
    id: 'offline_tip_02',
    text: "Before accepting a claim, ask: What's the evidence? Is the source reliable?",
    type: 'tip',
    hcId: 'evidence-based',
  },
];
