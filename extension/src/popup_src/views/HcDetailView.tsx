
import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { hcLibraryData } from '@assets/data/hc_library_data';
import { hcDrillsData } from '@assets/data/hc_drills_data';
import type { HCData } from '@core_logic/types';
import { ChevronLeft, ListChecks, BookOpenText, Zap, Lightbulb, Award } from 'lucide-react'; // Added Award for examples

const HcDetailView: React.FC = () => {
  const { hcId } = useParams<{ hcId: string }>();
  const navigate = useNavigate();
  const hc = hcLibraryData.find(h => h.id === hcId);
  const associatedDrills = hcDrillsData.filter(drill => drill.hcId === hcId);

  useEffect(() => {
    if (!hc) {
      console.warn(`HcDetailView: HC data not found for hcId=${hcId}. Navigating to /gym.`);
      navigate('/gym');
    }
  }, [hc, hcId, navigate]);

  if (!hc) {
    // This will briefly show before useEffect navigates away
    return <div className="p-4 text-center text-muted-foreground">Loading HC details...</div>;
  }

  const IconComponent = hc.icon && typeof hc.icon !== 'string' ? hc.icon : Lightbulb;


  return (
    <div className="p-3 space-y-4 max-h-full overflow-y-auto bg-background text-foreground scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-muted/50">
      <Link to="/gym" className="inline-flex items-center text-sm text-primary hover:underline mb-2 group">
        <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" /> Back to Gym
      </Link>
      
      <div className="p-4 border rounded-lg bg-card shadow-sm">
        <div className="flex items-start space-x-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            {typeof hc.icon === 'string' ? (
              <span className="text-3xl">{hc.icon}</span>
            ) : (
              <IconComponent className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{hc.name}</h1>
            <p className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded inline-block mt-0.5">{hc.tag}</p>
          </div>
        </div>
        
        <section className="mb-4">
            <h2 className="text-md font-semibold mb-2 flex items-center text-primary">
                <BookOpenText className="w-5 h-5 mr-2"/> Description
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{hc.longDescription || hc.description}</p>
        </section>
        
        {hc.keySkills && hc.keySkills.length > 0 && (
            <section className="mb-4">
                <h3 className="text-md font-semibold mb-2 flex items-center text-primary">
                    <Zap className="w-5 h-5 mr-2"/>Key Skills
                </h3>
                <ul className="list-disc list-inside pl-4 text-sm text-muted-foreground space-y-1">
                {hc.keySkills.map(skill => <li key={skill}>{skill}</li>)}
                </ul>
            </section>
        )}

        {hc.examples && hc.examples.length > 0 && (
            <section className="mb-4">
                <h3 className="text-md font-semibold mb-2 flex items-center text-primary">
                    <Award className="w-5 h-5 mr-2"/>Examples
                </h3>
                <ul className="list-disc list-inside pl-4 text-sm text-muted-foreground space-y-1">
                {hc.examples.map(example => <li key={example}>{example}</li>)}
                </ul>
            </section>
        )}
        
        {hc.shortTip && (
            <div className="mt-4 p-3 rounded-md bg-accent/10 border border-accent/30">
            <h3 className="font-semibold text-sm mb-1 text-accent flex items-center">
                <Lightbulb className="w-4 h-4 mr-1.5"/> Quick Tip
            </h3>
            <p className="text-xs text-accent-foreground/90">{hc.shortTip}</p>
            </div>
        )}
      </div>

      {associatedDrills.length > 0 && (
        <div className="p-4 border rounded-lg bg-card shadow-sm">
            <h2 className="text-md font-semibold mb-3 flex items-center text-primary">
                <ListChecks className="w-5 h-5 mr-2"/> Practice Drills
            </h2>
            <ul className="space-y-2">
                {associatedDrills.map(drill => (
                    <li key={drill.id}>
                        <Link 
                            to={`/drill/${hc.id}/${drill.id}`}
                            className="block p-3 border rounded-md hover:bg-secondary/50 hover:shadow-sm text-sm transition-all group"
                        >
                           <div className="flex justify-between items-center">
                                <span>{drill.name}</span>
                                <ChevronLeft className="w-4 h-4 text-muted-foreground transform rotate-180 transition-transform group-hover:translate-x-1 group-hover:text-primary"/>
                           </div>
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
