
import type { HCDrillQuestion } from '@/types';

export const hcDrillsData: HCDrillQuestion[] = [
  // Critical Thinking (#critique)
  {
    id: 'critique_drill1',
    hcId: 'critique',
    name: 'Evaluating a Claim',
    questionText: 'A news headline states: "New Study PROVES Chocolate Cures All Illnesses!" As a critical thinker, what should be your first step?',
    options: [
      { id: 'a', text: 'Share the news immediately with everyone you know.' },
      { id: 'b', text: 'Buy as much chocolate as possible.' },
      { id: 'c', text: 'Look for the original study, check its methodology, and see if other sources confirm it.' },
      { id: 'd', text: 'Dismiss it as obviously false without further investigation.' },
    ],
    correctAnswerId: 'c',
    explanationOnCorrect: 'Correct! Critical thinking involves questioning sources and seeking corroborating evidence before accepting a claim.',
    explanationOnIncorrect: 'Not quite. Critical thinking encourages skepticism and thorough investigation, especially for extraordinary claims.',
    rewardWXP: 15,
  },
  {
    id: 'critique_drill2',
    hcId: 'critique',
    name: 'Identifying Argument Components',
    questionText: 'In the statement "All birds can fly. Penguins are birds. Therefore, penguins can fly," which part is a flawed premise?',
    options: [
      { id: 'a', text: '"All birds can fly."' },
      { id: 'b', text: '"Penguins are birds."' },
      { id: 'c', text: '"Therefore, penguins can fly."' },
      { id: 'd', text: 'There are no flawed premises.' },
    ],
    correctAnswerId: 'a',
    explanationOnCorrect: 'Excellent! The premise "All birds can fly" is incorrect, which makes the conclusion flawed, even if the logical structure is valid.',
    explanationOnIncorrect: 'Consider which statement is a generalization that isn\'t universally true.',
    rewardWXP: 15,
  },
  // Evidence-Based Reasoning (#evidencebased)
  {
    id: 'evidencebased_drill1',
    hcId: 'evidence-based',
    name: 'Source Reliability',
    questionText: 'Which of the following sources is generally MOST reliable for scientific information?',
    options: [
      { id: 'a', text: 'A personal blog discussing a scientific topic.' },
      { id: 'b', text: 'A peer-reviewed scientific journal article.' },
      { id: 'c', text: 'A social media post from an influencer.' },
      { id: 'd', text: 'An advertisement for a health product.' },
    ],
    correctAnswerId: 'b',
    explanationOnCorrect: 'Correct! Peer-reviewed journals undergo rigorous scrutiny by experts in the field, making them highly reliable sources.',
    explanationOnIncorrect: 'Think about which source is most likely to have its information verified by other experts before publication.',
    rewardWXP: 10,
  },
  {
    id: 'evidencebased_drill2',
    hcId: 'evidence-based',
    name: 'Correlation vs. Causation',
    questionText: 'If a study shows that ice cream sales increase at the same time as crime rates, what can be concluded?',
    options: [
      { id: 'a', text: 'Eating ice cream causes people to commit crimes.' },
      { id: 'b', text: 'Committing crimes makes people want to eat ice cream.' },
      { id: 'c', text: 'There is a correlation, but one does not necessarily cause the other; a third factor (like warm weather) might be involved.' },
      { id: 'd', text: 'The study must be flawed.' },
    ],
    correctAnswerId: 'c',
    explanationOnCorrect: 'Spot on! Correlation does not imply causation. Two variables can be related without one directly causing the other.',
    explanationOnIncorrect: 'Remember that just because two things happen together doesn\'t mean one caused the other.',
    rewardWXP: 15,
  },
  // Fallacy Detection (#fallacydetection)
  {
    id: 'fallacy_drill1',
    hcId: 'fallacy-detection',
    name: 'Ad Hominem Fallacy',
    questionText: 'Politician A says Politician B\'s tax plan is bad because "Politician B is a terrible person and dresses poorly." What fallacy is Politician A using?',
    options: [
      { id: 'a', text: 'Straw Man' },
      { id: 'b', text: 'Appeal to Authority' },
      { id: 'c', text: 'Ad Hominem' },
      { id: 'd', text: 'Slippery Slope' },
    ],
    correctAnswerId: 'c',
    explanationOnCorrect: 'Correct! This is an Ad Hominem fallacy, which attacks the person making the argument instead of addressing the argument itself.',
    explanationOnIncorrect: 'This fallacy involves attacking the opponent\'s character rather than their argument.',
    rewardWXP: 10,
  },
  {
    id: 'fallacy_drill2',
    hcId: 'fallacy-detection',
    name: 'Straw Man Fallacy',
    questionText: 'Person A: "We should invest more in public education." Person B: "So you\'re saying we should throw unlimited money at schools and bankrupt the country? That\'s ridiculous!" What fallacy is Person B using?',
    options: [
      { id: 'a', text: 'False Dichotomy' },
      { id: 'b', text: 'Straw Man' },
      { id: 'c', text: 'Appeal to Ignorance' },
      { id: 'd', text: 'Ad Hominem' },
    ],
    correctAnswerId: 'b',
    explanationOnCorrect: 'Right! Person B is misrepresenting Person A\'s argument to make it easier to attack, which is a Straw Man fallacy.',
    explanationOnIncorrect: 'This fallacy occurs when someone distorts or exaggerates an opponent\'s argument to make it easier to refute.',
    rewardWXP: 15,
  },
  // Assumption Spotting (#assumptionspotting)
  {
    id: 'assumption_drill1',
    hcId: 'assumption-spotting',
    name: 'Unstated Premise',
    questionText: 'Statement: "This new app will be a huge success because it uses the latest AI technology." What is a key unstated assumption?',
    options: [
      { id: 'a', text: 'The app has a user-friendly interface.' },
      { id: 'b', text: 'Using the latest AI technology guarantees market success.' },
      { id: 'c', text: 'The development team is highly skilled.' },
      { id: 'd', text: 'The app is priced competitively.' },
    ],
    correctAnswerId: 'b',
    explanationOnCorrect: 'Precisely! The statement assumes that "latest AI technology" is a sufficient condition for success, which may not be true.',
    explanationOnIncorrect: 'Look for the belief that must be true for the "because" part to logically lead to the "success" part.',
    rewardWXP: 10,
  },
  {
    id: 'assumption_drill2',
    hcId: 'assumption-spotting',
    name: 'Identifying Cultural Assumptions',
    questionText: 'An advertisement shows a family happily eating a specific brand of cereal for breakfast. What might be a cultural assumption embedded in this ad?',
    options: [
      { id: 'a', text: 'All families eat breakfast together.' },
      { id: 'b', text: 'Cereal is a common and desirable breakfast food in the target culture.' },
      { id: 'c', text: 'Eating this cereal guarantees family happiness.' },
      { id: 'd', text: 'Both a and b.' },
    ],
    correctAnswerId: 'd',
    explanationOnCorrect: 'Good job! Ads often rely on shared cultural norms, like families eating together or common food choices, as unstated assumptions.',
    explanationOnIncorrect: 'Consider what widely accepted beliefs or practices the ad is leveraging without explicitly stating them.',
    rewardWXP: 15,
  },
  // Perspective Taking (#perspectivetaking)
  {
    id: 'perspective_drill1',
    hcId: 'perspective-taking',
    name: 'Understanding Different Views',
    questionText: 'Your friend is very upset about a new local policy you support. To practice perspective-taking, what should you do?',
    options: [
      { id: 'a', text: 'Explain again why your view is correct and they are wrong.' },
      { id: 'b', text: 'Avoid talking to them about the policy to prevent conflict.' },
      { id: 'c', text: 'Try to understand their reasons for being upset, even if you don\'t agree with them.' },
      { id: 'd', text: 'Tell them they are overreacting.' },
    ],
    correctAnswerId: 'c',
    explanationOnCorrect: 'Excellent! Perspective-taking involves understanding others\' feelings and reasons, which is key to empathy and constructive dialogue.',
    explanationOnIncorrect: 'Focus on understanding their point of view, rather than immediately defending your own or dismissing theirs.',
    rewardWXP: 10,
  },
  {
    id: 'perspective_drill2',
    hcId: 'perspective-taking',
    name: 'Considering Multiple Stakeholders',
    questionText: 'When a company decides to build a new factory, which of these is NOT a stakeholder whose perspective should ideally be considered?',
    options: [
      { id: 'a', text: 'Local residents living near the proposed factory site.' },
      { id: 'b', text: 'Company shareholders and investors.' },
      { id: 'c', text: 'Future employees of the factory.' },
      { id: 'd', text: 'A rival company in a different country.' },
    ],
    correctAnswerId: 'd',
    explanationOnCorrect: 'Correct! While a rival company might be affected, they are not typically considered a direct stakeholder whose perspective is actively sought in the decision-making process for *this* company\'s factory.',
    explanationOnIncorrect: 'A stakeholder is anyone significantly impacted by a decision. Think about who would be directly affected.',
    rewardWXP: 15,
  },
];
