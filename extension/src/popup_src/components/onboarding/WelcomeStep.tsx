
// Stub for WelcomeStep.tsx
import React from 'react';
import type { HCData } from '@core_logic/types'; // Example import

interface WelcomeStepProps {
  onInterestsChange: (interestId: string, checked: boolean) => void;
  selectedInterests: string[];
  // Assuming INTERESTS_OPTIONS is passed or imported
  interestOptions: Array<{id: string, label: string}>;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onInterestsChange, selectedInterests, interestOptions }) => {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold text-primary">Welcome to Mindframe OS!</h2>
      <p>Let's personalize your cognitive companion to help you develop sharper thinking skills.</p>
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">What topics are you interested in?</h3>
        <p className="text-xs text-muted-foreground mb-2">This helps us tailor insights and content relevant to you.</p>
        <div className="grid grid-cols-2 gap-2">
          {interestOptions.map(interest => (
            <label key={interest.id} className={`flex items-center space-x-2 p-2 border rounded-md hover:bg-secondary/50 transition-colors cursor-pointer ${selectedInterests.includes(interest.id) ? 'bg-primary/10 ring-1 ring-primary' : ''}`}>
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary"
                checked={selectedInterests.includes(interest.id)}
                onChange={(e) => onInterestsChange(interest.id, e.target.checked)}
              />
              <span className="text-sm">{interest.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
