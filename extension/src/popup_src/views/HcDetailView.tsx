
// Stub for HcDetailView.tsx
import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { hcLibraryData } from '@assets/data/hc_library_data';
import { hcDrillsData } from '@assets/data/hc_drills_data';
import type { HCData } from '@core_logic/types';
import { ChevronLeft, ListChecks } from 'lucide-react';

const HcDetailView: React.FC = () => {
  const { hcId } = useParams<{ hcId: string }>();
  const navigate = useNavigate();
  const hc = hcLibraryData.find(h => h.id === hcId);
  const associatedDrills = hcDrillsData.filter(drill => drill.hcId === hcId);


  if (!hc) {
    // Should not happen if links are correct, but good to have a fallback
    React.useEffect(() => {
      navigate('/gym');
    }, [navigate]);
    return <div className="p-4 text-center">HC not found. Redirecting...</div>;
  }

  return (
    <div className="p-4 space-y-4 max-h-full overflow-y-auto">
      <Link to="/gym" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Gym
      </Link>
      <div className="p-4 border rounded-lg bg-card shadow-sm">
        <div className="flex items-center space-x-3 mb-3">
          {typeof hc.icon === 'string' ? (
            <span className="text-3xl">{hc.icon}</span>
          ) : (
            <hc.icon className="w-8 h-8 text-primary" />
          )}
          <h1 className="text-xl font-semibold">{hc.name}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{hc.tag}</p>
        <p className="text-sm mb-3">{hc.longDescription || hc.description}</p>
        
        <h3 className="font-medium mb-1 text-sm">Key Skills:</h3>
        <ul className="list-disc list-inside pl-4 text-xs space-y-0.5 mb-3">
          {hc.keySkills.map(skill => <li key={skill}>{skill}</li>)}
        </ul>

        <h3 className="font-medium mb-1 text-sm">Examples:</h3>
        <ul className="list-disc list-inside pl-4 text-xs space-y-0.5 mb-3">
          {hc.examples.map(example => <li key={example}>{example}</li>)}
        </ul>
        
        <div className="p-2 rounded-md bg-accent/10 border border-accent/30 text-accent-foreground text-xs">
          <strong>Quick Tip:</strong> {hc.shortTip}
        </div>
      </div>

      {associatedDrills.length > 0 && (
        <div className="p-4 border rounded-lg bg-card">
            <h2 className="text-md font-semibold mb-2 flex items-center text-primary">
                <ListChecks className="w-5 h-5 mr-2"/> Practice Drills
            </h2>
            <ul className="space-y-2">
                {associatedDrills.map(drill => (
                    <li key={drill.id}>
                        <Link 
                            to={`/drill/${hc.id}/${drill.id}`}
                            className="block p-2 border rounded-md hover:bg-secondary/50 text-sm"
                        >
                            {drill.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
      )}
      {associatedDrills.length === 0 && (
         <p className="text-sm text-muted-foreground text-center py-4">No specific drills available for {hc.name} yet.</p>
      )}
    </div>
  );
};

export default HcDetailView;
