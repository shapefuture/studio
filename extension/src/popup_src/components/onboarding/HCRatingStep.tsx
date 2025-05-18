
// Stub for HCRatingStep.tsx
import React from 'react';
import type { HCData } from '@core_logic/types';

interface HCRatingStepProps {
  hcItems: HCData[];
  hcProficiency: { [hcId: string]: number };
  onHCProficiencyChange: (hcId: string, value: number) => void;
}

const HCRatingStep: React.FC<HCRatingStepProps> = ({ hcItems, hcProficiency, onHCProficiencyChange }) => {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Cognitive Skills Familiarity</h2>
      <p className="text-sm text-muted-foreground">Rate your current familiarity with these cognitive skills (0 = Not familiar, 5 = Very familiar).</p>
      {hcItems.map(hc => (
        <div key={hc.id} className="mb-3 p-3 border rounded-md bg-card">
          <label htmlFor={`hc-${hc.id}`} className="block mb-1 text-sm font-medium">
            {typeof hc.icon === 'string' ? <span className="mr-1">{hc.icon}</span> : React.isValidElement(hc.icon) ? React.cloneElement(hc.icon as React.ReactElement, { className: "w-4 h-4 inline mr-1" }) : null}
            {hc.name} <span className="text-xs font-mono text-muted-foreground">({hc.tag})</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              id={`hc-${hc.id}`}
              min="0" max="5" step="1"
              value={hcProficiency[hc.id] || 0}
              onChange={(e) => onHCProficiencyChange(hc.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
            />
            <span className="w-8 text-center text-sm font-semibold p-1 bg-primary/20 text-primary rounded-md">
              {hcProficiency[hc.id] || 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{hc.description}</p>
        </div>
      ))}
    </div>
  );
};

export default HCRatingStep;
