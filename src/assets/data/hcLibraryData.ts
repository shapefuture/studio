
import type { HC } from '@/types';
import { Aperture, CheckSquare, AlertTriangle, ScanSearch, Users } from 'lucide-react';

export const hcLibraryData: HC[] = [
  {
    id: 'critique',
    tag: '#critique',
    name: 'Critical Thinking',
    icon: Aperture,
    description: 'Analyze information objectively and make reasoned judgments.',
    longDescription: 'Critical thinking is the ability to analyze facts, evidence, observations, and arguments to form a judgment. It involves self-directed, self-disciplined, self-monitored, and self-corrective thinking. It presupposes assent to rigorous standards of excellence and mindful command of their use. It entails effective communication and problem-solving abilities as well as a commitment to overcome native egocentrism and sociocentrism.',
  },
  {
    id: 'evidence-based',
    tag: '#evidencebased',
    name: 'Evidence-Based Reasoning',
    icon: CheckSquare,
    description: 'Form conclusions based on verifiable evidence rather than speculation.',
    longDescription: 'Evidence-based reasoning involves making decisions and forming beliefs by systematically finding, evaluating, and applying the best available evidence. This approach emphasizes the use of empirical data and documented facts over intuition, anecdote, or tradition.',
  },
  {
    id: 'fallacy-detection',
    tag: '#fallacydetection',
    name: 'Fallacy Detection',
    icon: AlertTriangle,
    description: 'Identify common errors in reasoning and argumentation.',
    longDescription: 'Fallacy detection is the skill of recognizing flawed reasoning patterns (logical fallacies) in arguments. Understanding fallacies helps in evaluating the validity of claims and constructing stronger, more persuasive arguments yourself. Common fallacies include ad hominem, straw man, and appeal to emotion.',
  },
  {
    id: 'assumption-spotting',
    tag: '#assumptionspotting',
    name: 'Assumption Spotting',
    icon: ScanSearch,
    description: 'Identify unstated beliefs or premises underlying an argument or statement.',
    longDescription: 'Assumption spotting involves uncovering the implicit beliefs, ideas, or conditions that are taken for granted in a line of reasoning. Recognizing these hidden assumptions is crucial for understanding the full context of an argument and evaluating its soundness.',
  },
  {
    id: 'perspective-taking',
    tag: '#perspectivetaking',
    name: 'Perspective Taking',
    icon: Users,
    description: 'Understand situations and arguments from multiple viewpoints.',
    longDescription: 'Perspective taking is the cognitive skill of viewing a situation or understanding a concept from an alternative point of view. It involves imagining oneself in another\'s position to comprehend their thoughts, feelings, and motivations, which is essential for empathy, negotiation, and conflict resolution.',
  },
];
