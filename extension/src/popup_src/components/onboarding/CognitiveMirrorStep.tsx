
// Stub for CognitiveMirrorStep.tsx
import React from 'react';
import type { CognitiveProfileV1 } from '@core_logic/types';

interface CognitiveMirrorStepProps {
  profile: CognitiveProfileV1 | null;
  isLoading: boolean;
}

const CognitiveMirrorStep: React.FC<CognitiveMirrorStepProps> = ({ profile, isLoading }) => {
  if (isLoading) {
    return <div className="p-4 text-center">Generating your cognitive snapshot...</div>;
  }

  if (!profile) {
    return <div className="p-4 text-center text-red-500">Could not generate profile. Please go back and try again.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold text-accent">Your Cognitive Snapshot</h2>
      <p className="text-sm text-muted-foreground">Here's a summary based on your input. This will help tailor your Mindframe OS experience.</p>
      
      <div className="space-y-3 p-3 border rounded-lg bg-card shadow-sm">
        <div>
          <strong className="text-sm">User ID:</strong>
          <p className="text-xs text-muted-foreground break-all">{profile.userId}</p>
        </div>
        <div>
          <strong className="text-sm">Primary Goal:</strong>
          <p className="text-sm">{profile.primaryGoal}</p>
        </div>
        <div>
          <strong className="text-sm">Interests:</strong>
          <p className="text-sm">{profile.interests.join(', ')}</p>
        </div>
        <div>
          <strong className="text-sm">Potential Biases to Explore:</strong>
          {Object.keys(profile.potentialBiases).length > 0 ? (
            <ul className="list-disc list-inside pl-4 text-xs">
              {Object.entries(profile.potentialBiases).map(([bias, score]) => (
                score > 0 && <li key={bias}>{bias}: Score {score}</li>
              ))}
            </ul>
          ) : <p className="text-xs italic">No strong bias patterns identified from initial responses.</p>}
        </div>
         <div>
          <strong className="text-sm">HC Proficiency Ratings:</strong>
            <ul className="list-disc list-inside pl-4 text-xs">
              {Object.entries(profile.hcProficiency).map(([hcId, rating]) => (
                 <li key={hcId}>{hcId}: {rating}/5</li>
              ))}
            </ul>
        </div>
        <p className="mt-3 text-xs text-accent-foreground bg-accent/90 p-2 rounded-md">
          You're all set! Your Mindframe OS journey begins now.
        </p>
      </div>
    </div>
  );
};

export default CognitiveMirrorStep;
