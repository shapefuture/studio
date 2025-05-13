import type { HC } from '@/types';
import { Aperture, CheckSquare, Scale, Search, Lightbulb } from 'lucide-react';

export const APP_NAME = 'Local Cognitive Coach';

export const HCS: HC[] = [
  {
    id: 'critique',
    tag: '#critique',
    name: 'Critical Thinking',
    description: 'Analyze information objectively and make reasoned judgments.',
    longDescription: 'Critical thinking involves evaluating evidence, identifying assumptions, and recognizing biases. It is the ability to think clearly and rationally about what to do or what to believe.',
    icon: Aperture,
    drills: [
      { id: 'd1', name: 'Identify Assumptions', description: 'Practice identifying underlying assumptions in statements.', content: 'Statement: "This new policy will surely boost employee morale." What are the assumptions here?' },
      { id: 'd2', name: 'Evaluate Evidence', description: 'Assess the strength and relevance of evidence provided.', content: 'Scenario: A product review claims a phone has "the best camera ever". What evidence would you need to verify this?' },
    ],
  },
  {
    id: 'evidence-based',
    tag: '#evidencebased',
    name: 'Evidence-Based Reasoning',
    description: 'Form conclusions based on verifiable evidence rather than speculation.',
    longDescription: 'Evidence-based reasoning is crucial for making informed decisions. It means relying on data, facts, and credible sources to support claims and arguments.',
    icon: CheckSquare,
    drills: [
      { id: 'd1', name: 'Source Credibility', description: 'Analyze the credibility of different information sources.', content: 'Compare a peer-reviewed scientific paper with a blog post on the same topic. Which is more credible and why?' },
    ],
  },
  {
    id: 'bias-detection',
    tag: '#biasdetection',
    name: 'Bias Detection',
    description: 'Recognize and understand common cognitive biases in oneself and others.',
    longDescription: 'Cognitive biases are systematic patterns of deviation from norm or rationality in judgment. Identifying them is the first step to mitigating their impact.',
    icon: Scale,
    drills: [
      { id: 'd1', name: 'Confirmation Bias Spotting', description: 'Identify examples of confirmation bias in news articles.', content: 'Read an article about a political issue. Look for instances where the author might be favoring information that confirms their existing beliefs.' },
    ],
  },
  {
    id: 'perspective-taking',
    tag: '#perspectivetaking',
    name: 'Perspective Taking',
    description: 'Understand situations from multiple viewpoints.',
    longDescription: 'Perspective taking involves stepping into someone else\'s shoes to understand their thoughts, feelings, and motivations. This skill is vital for empathy and effective communication.',
    icon: Search,
    drills: [
      { id: 'd1', name: 'Role Reversal', description: 'Argue a case from an opposing viewpoint.', content: 'Choose a recent debate or disagreement you had. Write down arguments for the other person\'s side as convincingly as possible.' },
    ],
  },
  {
    id: 'metacognition',
    tag: '#metacognition',
    name: 'Metacognition',
    description: 'Thinking about one\'s own thinking processes.',
    longDescription: 'Metacognition, or "thinking about thinking," involves awareness and understanding of one\'s own thought processes. It enables individuals to monitor and regulate their learning and problem-solving strategies.',
    icon: Lightbulb,
    drills: [
      { id: 'd1', name: 'Reflect on Learning', description: 'After learning a new skill, reflect on what strategies worked best for you.', content: 'Think about the last time you learned something complex. What did you do when you got stuck? What would you do differently next time?' },
    ],
  },
];

export const INTERESTS_OPTIONS = [
  { id: 'tech', label: 'Technology' },
  { id: 'science', label: 'Science' },
  { id: 'business', label: 'Business & Finance' },
  { id: 'arts', label: 'Arts & Culture' },
  { id: 'health', label: 'Health & Wellness' },
  { id: 'politics', label: 'Politics & Current Events' },
  { id: 'education', label: 'Education' },
  { id: 'sports', label: 'Sports' },
];

export const SJT_QUESTIONS = [
  {
    id: 'sjt1',
    text: 'You read an article online that strongly supports your existing views on a controversial topic. What is your most likely initial reaction?',
    options: [
      { id: 'a', text: 'Share it immediately with friends who hold similar views.' },
      { id: 'b', text: 'Critically evaluate the sources and look for counter-arguments before forming a strong opinion.' },
      { id: 'c', text: 'Assume it\'s accurate because it aligns with your beliefs.' },
      { id: 'd', text: 'Feel validated and strengthened in your current perspective.' },
    ],
  },
  {
    id: 'sjt2',
    text: 'A colleague presents an idea in a meeting that seems impractical. How do you respond?',
    options: [
      { id: 'a', text: 'Immediately point out the flaws in their idea.' },
      { id: 'b', text: 'Ask clarifying questions to better understand their perspective before offering feedback.' },
      { id: 'c', text: 'Stay silent to avoid confrontation.' },
      { id: 'd', text: 'Suggest your own idea as a better alternative without addressing theirs.' },
    ],
  },
];

export const DEFAULT_COGNITIVE_PROFILE: CognitiveProfileV1 = {
  version: 1,
  interests: [],
  sjtAnswers: [],
  hcFamiliarity: {},
  onboardingCompleted: false,
};

export const DEFAULT_GAMIFICATION_DATA: GamificationData = {
  wxp: 0,
  level: 1,
  completedChallenges: [],
  activeQuests: [],
};
