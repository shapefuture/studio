
// Stub for GoalSelectStep.tsx
import React from 'react';

interface GoalOption {
  id: string;
  label: string;
  description: string;
}

interface GoalSelectStepProps {
  goalOptions: GoalOption[];
  primaryGoal: string;
  onPrimaryGoalChange: (goalId: string) => void;
}

const GoalSelectStep: React.FC<GoalSelectStepProps> = ({ goalOptions, primaryGoal, onPrimaryGoalChange }) => {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Your Primary Goal</h2>
      <p className="text-sm text-muted-foreground">What do you want to achieve with Mindframe OS?</p>
      <div className="space-y-2">
        {goalOptions.map(goal => (
          <label
            key={goal.id}
            className={`flex flex-col p-3 border rounded-lg cursor-pointer hover:shadow-md transition-all
              ${primaryGoal === goal.id ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-secondary/30 border-border'}
            `}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="primaryGoal"
                value={goal.id}
                checked={primaryGoal === goal.id}
                onChange={() => onPrimaryGoalChange(goal.id)}
                className="form-radio h-4 w-4 text-primary mr-2 focus:ring-primary"
              />
              <span className="font-semibold text-sm">{goal.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">{goal.description}</p>
          </label>
        ))}
      </div>
    </div>
  );
};

export default GoalSelectStep;
