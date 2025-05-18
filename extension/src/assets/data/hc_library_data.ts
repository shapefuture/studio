
import type { HCData } from '../../core_logic/types';
import { Aperture, CheckSquare, AlertTriangle, ScanSearch, Users } from 'lucide-react';

export const hcLibraryData: HCData[] = [
  {
    id: 'critique',
    tag: '#critique',
    name: 'Critical Thinking',
    icon: Aperture,
    description: 'Analyze information objectively and make reasoned judgments.',
    longDescription: 'Critical thinking is the ability to analyze facts, evidence, observations, and arguments to form a judgment. It involves self-directed, self-disciplined, self-monitored, and self-corrective thinking. It presupposes assent to rigorous standards of excellence and mindful command of their use. It entails effective communication and problem-solving abilities as well as a commitment to overcome native egocentrism and sociocentrism.',
    keySkills: ['Questioning assumptions', 'Evaluating evidence', 'Logical reasoning', 'Spotting inconsistencies', 'Bias detection'],
    examples: ['Examining the credibility of news sources before sharing.', 'Evaluating the pros and cons of a major decision.', 'Identifying logical fallacies in an advertisement.'],
    shortTip: 'Always ask "Why?" and "What if?" to dig deeper into any claim or situation.'
  },
  {
    id: 'evidencebased',
    tag: '#evidencebased',
    name: 'Evidence-Based Reasoning',
    icon: CheckSquare,
    description: 'Form conclusions based on verifiable evidence rather than speculation.',
    longDescription: 'Evidence-based reasoning involves making decisions and forming beliefs by systematically finding, evaluating, and applying the best available evidence. This approach emphasizes the use of empirical data and documented facts over intuition, anecdote, or tradition. It requires checking sources and understanding data.',
    keySkills: ['Distinguishing facts from opinions', 'Evaluating source credibility', 'Understanding statistical concepts', 'Recognizing data limitations', 'Verifying claims'],
    examples: ['Checking multiple reliable sources before accepting a health claim.', 'Looking for peer-reviewed research to support a scientific statement.', 'Understanding the difference between correlation and causation.'],
    shortTip: 'Before accepting a claim, ask: "What is the evidence, and is it reliable?"'
  },
  {
    id: 'fallacy-detection',
    tag: '#fallacydetection',
    name: 'Fallacy Detection',
    icon: AlertTriangle,
    description: 'Identify common errors in reasoning and argumentation.',
    longDescription: 'Fallacy detection is the skill of recognizing flawed reasoning patterns (logical fallacies) in arguments. Understanding fallacies helps in evaluating the validity of claims and constructing stronger, more persuasive arguments yourself. Common fallacies include ad hominem, straw man, and appeal to emotion.',
    keySkills: ['Recognizing common fallacies (Ad Hominem, Straw Man, etc.)', 'Understanding logical structure', 'Analyzing rhetorical strategies', 'Testing argument validity', 'Spotting emotional manipulation'],
    examples: ['Identifying an "ad hominem" attack in a political debate.', 'Recognizing a "slippery slope" argument in a discussion about new rules.', 'Noticing an "appeal to popularity" instead of factual evidence.'],
    shortTip: 'Be wary of arguments that attack the person, misrepresent views, or rely solely on emotion.'
  },
  {
    id: 'assumption-spotting',
    tag: '#assumptionspotting',
    name: 'Assumption Spotting',
    icon: ScanSearch,
    description: 'Identify unstated beliefs or premises underlying an argument or statement.',
    longDescription: 'Assumption spotting involves uncovering the implicit beliefs, ideas, or conditions that are taken for granted in a line of reasoning. Recognizing these hidden assumptions is crucial for understanding the full context of an argument and evaluating its soundness. It means looking for what is NOT said.',
    keySkills: ['Recognizing implicit premises', 'Understanding worldviews', 'Identifying cognitive biases', 'Questioning the "obvious"', 'Exploring underlying beliefs'],
    examples: ['Questioning the assumption that "newer is always better" in technology.', 'Identifying the assumption that "everyone wants the same thing" in a group decision.', 'Recognizing that an argument assumes a certain level of prior knowledge.'],
    shortTip: 'Ask: "What must be true for this statement/argument to make sense?"'
  },
  {
    id: 'perspective-taking',
    tag: '#perspectivetaking',
    name: 'Perspective Taking',
    icon: Users,
    description: 'Understand situations and arguments from multiple viewpoints.',
    longDescription: 'Perspective taking is the cognitive skill of viewing a situation or understanding a concept from an alternative point of view. It involves imagining oneself in another\'s position to comprehend their thoughts, feelings, and motivations, which is essential for empathy, negotiation, and conflict resolution.',
    keySkills: ['Empathetic understanding', 'Ideological flexibility', 'Cultural awareness', 'Recognition of lived experiences', 'Considering stakeholder views'],
    examples: ['Trying to understand why a friend is upset, even if you don\'t agree with their reason.', 'Considering how a policy might affect different groups of people.', 'Reading opinions from people with different backgrounds on a social issue.'],
    shortTip: 'Before judging, try to walk a mile in someone else\'s shoes (figuratively!).'
  },
];
