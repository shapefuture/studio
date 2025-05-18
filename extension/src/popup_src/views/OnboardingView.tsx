
"use client"; // Not strictly needed for Vite React, but good practice if code shared

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { processOnboardingData } from '@core_logic/onboardingLogic';
import type { SJTScenario, HCData, UserOnboardingData, CognitiveProfileV1 } from '@core_logic/types';
import { sjtScenariosData } from '@assets/data/sjt_scenarios_data';
import { hcLibraryData } from '@assets/data/hc_library_data';
// Assuming INTERESTS_OPTIONS and onboardingGoalOptions are moved or redefined. For now, create placeholders.
// These should ideally be in a constants.ts or similar shared file.

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

const TOTAL_STEPS = 5; // Welcome, Interests, SJTs, HC Ratings, Goal Select, Cognitive Mirror

const OnboardingView: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // Start at step 1 (Welcome)

  // State for UserOnboardingData (excluding userId, which is generated in processOnboardingData)
  const [sjtAnswersById, setSjtAnswersById] = useState<{ [scenarioId: string]: string }>({});
  const [hcProficiency, setHcProficiency] = useState<{ [hcId: string]: number }>({});
  const [primaryGoal, setPrimaryGoal] = useState<string>('');
  const [userInterests, setUserInterests] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [generatedProfile, setGeneratedProfile] = useState<CognitiveProfileV1 | null>(null);


  const handleNext = async () => {
    if (currentStep === TOTAL_STEPS -1) { // Transitioning to Cognitive Mirror step
      if (!primaryGoal) {
        alert("Please select your primary goal."); // Simple alert for MVP
        return;
      }
      setIsLoading(true);
      try {
        // The userId is generated within processOnboardingData
        const onboardingPayload: Omit<UserOnboardingData, 'userId'> = {
          sjtAnswersById,
          hcProficiency,
          primaryGoal,
          userInterests,
        };
        const profile = await processOnboardingData(onboardingPayload);
        setGeneratedProfile(profile);
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Error processing onboarding data:", error);
        alert("Failed to process onboarding. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else { // Final step, finish onboarding
      navigate('/profile');
      // Optional: Trigger a full page reload if necessary for extension context updates,
      // but generally router navigation should suffice within the popup.
      // setTimeout(() => { if (typeof window !== 'undefined') window.location.reload(); } , 500);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // --- Step specific handlers ---
  const handleInterestChange = (interestId: string, checked: boolean) => {
    setUserInterests(prev =>
      checked ? [...prev, interestId] : prev.filter(id => id !== interestId)
    );
  };

  const handleSJTAnswer = (scenarioId: string, selectedOptionIndex: number) => {
    setSjtAnswersById(prev => ({
      ...prev,
      [scenarioId]: String(selectedOptionIndex), // Store index as string
    }));
  };

  const handleHCFamiliarityChange = (hcId: string, value: number) => {
    setHcProficiency(prev => ({ ...prev, [hcId]: value }));
  };

  const handleGoalSelect = (goalId: string) => {
    setPrimaryGoal(goalId);
  };


  // --- Render logic for steps ---
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: // Welcome + Interests
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-semibold text-primary">Welcome to Mindframe OS!</h2>
            <p>Let's personalize your cognitive companion.</p>
            <h3 className="font-medium">Select Your Interests:</h3>
            <div className="grid grid-cols-2 gap-2">
              {INTERESTS_OPTIONS_POPUP.map(interest => (
                <label key={interest.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-secondary/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary rounded"
                    checked={userInterests.includes(interest.id)}
                    onChange={(e) => handleInterestChange(interest.id, e.target.checked)}
                  />
                  <span>{interest.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 2: // SJTs
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Situational Judgement</h2>
            <p className="text-sm text-muted-foreground">How would you respond?</p>
            {sjtScenariosData.map((sjt, index) => (
              <div key={sjt.id} className="mb-4 p-3 border rounded-md">
                <p className="font-medium mb-2">{index + 1}. {sjt.scenarioText}</p>
                <div className="space-y-1">
                  {sjt.options.map((opt, optIndex) => (
                    <label key={optIndex} className={`flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-secondary/30 ${sjtAnswersById[sjt.id] === String(optIndex) ? 'bg-primary/10 ring-1 ring-primary' : ''}`}>
                      <input
                        type="radio"
                        name={`sjt-${sjt.id}`}
                        className="form-radio h-4 w-4 text-primary"
                        checked={sjtAnswersById[sjt.id] === String(optIndex)}
                        onChange={() => handleSJTAnswer(sjt.id, optIndex)}
                      />
                      <span>{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 3: // HC Proficiency
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Cognitive Skills Familiarity</h2>
            <p className="text-sm text-muted-foreground">Rate your familiarity (0=Not familiar, 5=Very familiar).</p>
            {hcLibraryData.map(hc => (
              <div key={hc.id} className="mb-3 p-2 border rounded-md">
                <label htmlFor={`hc-${hc.id}`} className="block mb-1 font-medium">{hc.name} <span className="text-xs">({hc.tag})</span></label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    id={`hc-${hc.id}`}
                    min="0" max="5" step="1"
                    value={hcProficiency[hc.id] || 0}
                    onChange={(e) => handleHCFamiliarityChange(hc.id, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                  />
                  <span className="w-8 text-center text-sm font-semibold p-1 bg-primary/20 text-primary rounded-md">
                    {hcProficiency[hc.id] || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      case 4: // Goal Select
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Your Primary Goal</h2>
            <p className="text-sm text-muted-foreground">What do you want to achieve with Mindframe?</p>
            <div className="space-y-2">
              {ONBOARDING_GOAL_OPTIONS_POPUP.map(goal => (
                <label key={goal.id} className={`flex flex-col p-3 border rounded-lg cursor-pointer hover:shadow-md ${primaryGoal === goal.id ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-secondary/30'}`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="primaryGoal"
                      value={goal.id}
                      checked={primaryGoal === goal.id}
                      onChange={() => handleGoalSelect(goal.id)}
                      className="form-radio h-4 w-4 text-primary mr-2"
                    />
                    <span className="font-semibold">{goal.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">{goal.description}</p>
                </label>
              ))}
            </div>
          </div>
        );
      case TOTAL_STEPS: // Cognitive Mirror (Summary)
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-semibold text-accent">Your Cognitive Snapshot</h2>
            {isLoading && <p>Generating your profile...</p>}
            {generatedProfile && !isLoading && (
              <div className="space-y-2 p-3 border rounded-lg bg-secondary/30">
                <p><strong>User ID:</strong> <span className="text-xs">{generatedProfile.userId}</span></p>
                <p><strong>Primary Goal:</strong> {generatedProfile.primaryGoal}</p>
                <p><strong>Interests:</strong> {generatedProfile.interests.join(', ')}</p>
                <div><strong>Potential Biases to Explore:</strong>
                  {Object.keys(generatedProfile.potentialBiases).length > 0 ? (
                    <ul className="list-disc list-inside pl-4 text-sm">
                      {Object.entries(generatedProfile.potentialBiases).map(([bias, score]) => (
                        score > 0 && <li key={bias}>{bias}: Score {score}</li>
                      ))}
                    </ul>
                  ) : <p className="text-sm italic">No strong bias patterns identified yet.</p>}
                </div>
                <p className="mt-3 text-sm text-accent-foreground bg-accent/90 p-2 rounded-md">
                  You're all set! Your Mindframe journey begins now.
                </p>
              </div>
            )}
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  // Progress bar
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

      <div className="flex-grow overflow-y-auto p-2">
        {renderCurrentStep()}
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
          disabled={isLoading || (currentStep === TOTAL_STEPS && !generatedProfile)}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : (currentStep === TOTAL_STEPS ? 'Go to Profile' : (currentStep === TOTAL_STEPS -1 ? 'View Summary' : 'Next'))}
        </button>
      </div>
    </div>
  );
};

export default OnboardingView;
