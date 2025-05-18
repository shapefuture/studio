
"use client"; // Not strictly needed for Vite React, but good practice if code shared

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { processOnboardingData } from '@core_logic/onboardingLogic';
import type { UserOnboardingData, CognitiveProfileV1 } from '@core_logic/types';
import { sjtScenariosData } from '@assets/data/sjt_scenarios_data';
import { hcLibraryData } from '@assets/data/hc_library_data';

// Import step components
import WelcomeStep from '@components/onboarding/WelcomeStep';
import SJTStep from '@components/onboarding/SJTStep';
import HCRatingStep from '@components/onboarding/HCRatingStep';
import GoalSelectStep from '@components/onboarding/GoalSelectStep';
import CognitiveMirrorStep from '@components/onboarding/CognitiveMirrorStep';

// Define constants directly here or import from a shared constants file if they grow
const INTERESTS_OPTIONS_POPUP = [
  { id: 'tech', label: 'Technology' },
  { id: 'science', label: 'Science' },
  { id: 'business', label: 'Business & Finance' },
  { id: 'arts', label: 'Arts & Culture' },
  { id: 'health', label: 'Health & Wellness' },
  { id: 'politics', label: 'Politics & Current Events' },
];

const ONBOARDING_GOAL_OPTIONS_POPUP = [
  { id: 'improve_critical_thinking', label: 'Enhance Critical Thinking', description: 'Analyze info objectively.' },
  { id: 'reduce_biases', label: 'Understand & Reduce Biases', description: 'Identify cognitive biases.' },
  { id: 'better_decision_making', label: 'Make Better Decisions', description: 'Improve decision-making skills.' },
];

const TOTAL_STEPS = 5; // Welcome, SJTs, HC Ratings, Goal Select, Cognitive Mirror

const OnboardingView: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // State for UserOnboardingData
  const [sjtAnswersById, setSjtAnswersById] = useState<{ [scenarioId: string]: string }>({});
  const [hcProficiency, setHcProficiency] = useState<{ [hcId: string]: number }>({});
  const [primaryGoal, setPrimaryGoal] = useState<string>('');
  const [userInterests, setUserInterests] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [generatedProfile, setGeneratedProfile] = useState<CognitiveProfileV1 | null>(null);


  const handleNext = async () => {
    if (currentStep === TOTAL_STEPS -1 ) { // From GoalSelect to CognitiveMirror
      if (!primaryGoal) {
        alert("Please select your primary goal.");
        return;
      }
      setIsLoading(true);
      try {
        const onboardingPayload: Omit<UserOnboardingData, 'userId'> = {
          sjtAnswersById,
          hcProficiency,
          primaryGoal,
          userInterests,
        };
        const profile = await processOnboardingData(onboardingPayload);
        setGeneratedProfile(profile);
        setCurrentStep(currentStep + 1); // Move to Cognitive Mirror step
      } catch (error) {
        console.error("Error processing onboarding data:", error);
        alert("Failed to process onboarding. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else { // Final step (Cognitive Mirror), finish onboarding
      navigate('/profile');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step specific handlers
  const handleInterestChange = (interestId: string, checked: boolean) => {
    setUserInterests(prev =>
      checked ? [...prev, interestId] : prev.filter(id => id !== interestId)
    );
  };

  const handleSJTAnswerChange = (scenarioId: string, selectedOptionIndex: number) => {
    setSjtAnswersById(prev => ({
      ...prev,
      [scenarioId]: String(selectedOptionIndex),
    }));
  };

  const handleHCProficiencyChange = (hcId: string, value: number) => {
    setHcProficiency(prev => ({ ...prev, [hcId]: value }));
  };

  const handlePrimaryGoalChange = (goalId: string) => {
    setPrimaryGoal(goalId);
  };

  const renderCurrentStepComponent = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomeStep
            onInterestsChange={handleInterestChange}
            selectedInterests={userInterests}
            interestOptions={INTERESTS_OPTIONS_POPUP}
          />
        );
      case 2:
        return (
          <SJTStep
            sjtScenarios={sjtScenariosData}
            sjtAnswersById={sjtAnswersById}
            onSJTAnswerChange={handleSJTAnswerChange}
          />
        );
      case 3:
        return (
          <HCRatingStep
            hcItems={hcLibraryData}
            hcProficiency={hcProficiency}
            onHCProficiencyChange={handleHCProficiencyChange}
          />
        );
      case 4:
        return (
          <GoalSelectStep
            goalOptions={ONBOARDING_GOAL_OPTIONS_POPUP}
            primaryGoal={primaryGoal}
            onPrimaryGoalChange={handlePrimaryGoalChange}
          />
        );
      case TOTAL_STEPS: // Cognitive Mirror Step
        return (
          <CognitiveMirrorStep
            profile={generatedProfile}
            isLoading={isLoading && !generatedProfile} // Show loading only if profile isn't ready
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="flex flex-col h-full bg-background text-foreground p-2">
      <div className="p-4 border-b">
        <h1 className="text-lg font-semibold text-primary">Mindframe Onboarding</h1>
        <div className="w-full bg-muted rounded-full h-1.5 mt-2">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Step {currentStep} of {TOTAL_STEPS}</p>
      </div>

      <div className="flex-grow overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-muted/50">
        {renderCurrentStepComponent()}
      </div>

      <div className="p-4 border-t flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1 || isLoading}
          className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-secondary disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={isLoading || (currentStep === TOTAL_STEPS -1 && !primaryGoal) || (currentStep === TOTAL_STEPS && !generatedProfile)}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : (currentStep === TOTAL_STEPS ? 'Go to Profile' : (currentStep === TOTAL_STEPS -1 ? 'View Summary' : 'Next'))}
        </button>
      </div>
    </div>
  );
};

export default OnboardingView;
