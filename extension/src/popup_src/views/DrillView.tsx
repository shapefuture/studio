
// Stub for DrillView.tsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { hcDrillsData } from '@assets/data/hc_drills_data';
import { hcLibraryData } from '@assets/data/hc_library_data';
import type { HCDrillQuestion, HCDrillOption } from '@core_logic/types';
import { MindframeStore } from '@core_logic/MindframeStore.js';
import { GamificationService } from '@core_logic/gamificationService.js';
import { ChevronLeft, CheckCircle, XCircle } from 'lucide-react';


const DrillView: React.FC = () => {
  const { hcId, drillId } = useParams<{ hcId: string; drillId: string }>();
  const navigate = useNavigate();

  const [drill, setDrill] = useState<HCDrillQuestion | null>(null);
  const [hcName, setHcName] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);

  useEffect(() => {
    const currentHc = hcLibraryData.find(h => h.id === hcId);
    setHcName(currentHc?.name || 'Skill Drill');

    const currentDrill = hcDrillsData.find(d => d.id === drillId && d.hcId === hcId);
    if (currentDrill) {
      setDrill(currentDrill);
      MindframeStore.get().then(state => {
        if (state.completedDrillIds.includes(currentDrill.id)) {
          setIsAlreadyCompleted(true);
          setIsSubmitted(true); // Show feedback if already done
        }
      });
    } else {
      navigate(`/hc-detail/${hcId}`); // Or to gym if HC not found
    }
  }, [hcId, drillId, navigate]);

  const handleSubmit = async () => {
    if (!drill || selectedOptionId === null) return;

    const correct = selectedOptionId === drill.correctAnswerId;
    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct && !isAlreadyCompleted) {
      const wxpEarned = drill.rewardWXP || 5; // Default 5 WXP
      await GamificationService.addWXP(wxpEarned);
      await MindframeStore.update(state => ({
        ...state,
        completedDrillIds: Array.from(new Set([...state.completedDrillIds, drill.id]))
      }));
      setIsAlreadyCompleted(true); // Mark as completed for this session too
      // Simple alert, a toast system would be better
      alert(`Correct! You earned ${wxpEarned} WXP.`);
    } else if (!correct) {
      alert("Not quite. Review the explanation.");
    }
  };
  
  const findNextDrill = (): HCDrillQuestion | null => {
    if (!hcId || !drill) return null;
    const drillsForCurrentHc = hcDrillsData.filter(d => d.hcId === hcId);
    const currentIndex = drillsForCurrentHc.findIndex(d => d.id === drill.id);
    if (currentIndex !== -1 && currentIndex < drillsForCurrentHc.length - 1) {
      return drillsForCurrentHc[currentIndex + 1];
    }
    return null;
  };
  const nextDrill = findNextDrill();


  if (!drill) {
    return <div className="p-4 text-center">Loading drill...</div>;
  }
  
  const feedbackMessage = isCorrect === true 
    ? drill.explanationOnCorrect 
    : (isCorrect === false ? drill.explanationOnIncorrect : (isAlreadyCompleted ? "You've previously completed this drill." : ""));

  return (
    <div className="p-4 space-y-4 max-h-full overflow-y-auto">
      <Link to={`/hc-detail/${hcId}`} className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to {hcName}
      </Link>
      <div className="p-4 border rounded-lg bg-card shadow-sm">
        <h1 className="text-lg font-semibold mb-1">{drill.name}</h1>
        <p className="text-sm text-muted-foreground mb-3">For {hcName}</p>
        <p className="text-sm mb-4 whitespace-pre-wrap">{drill.questionText}</p>

        <div className="space-y-2 mb-4">
          {drill.options.map((opt: HCDrillOption) => (
            <label
              key={opt.id}
              className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer transition-all
                ${selectedOptionId === opt.id ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-secondary/30'}
                ${isSubmitted && opt.id === drill.correctAnswerId ? 'border-green-500 bg-green-50 ring-2 ring-green-500' : ''}
                ${isSubmitted && selectedOptionId === opt.id && opt.id !== drill.correctAnswerId ? 'border-red-500 bg-red-50 ring-2 ring-red-500' : ''}
                ${isSubmitted || isAlreadyCompleted ? 'cursor-not-allowed opacity-80' : ''}
              `}
            >
              <input
                type="radio"
                name={`drill-${drill.id}`}
                value={opt.id}
                checked={selectedOptionId === opt.id}
                onChange={() => setSelectedOptionId(opt.id)}
                disabled={isSubmitted || isAlreadyCompleted}
                className="form-radio h-4 w-4 text-primary"
              />
              <span className="text-sm flex-1">{opt.text}</span>
              {isSubmitted && opt.id === drill.correctAnswerId && <CheckCircle className="ml-2 h-5 w-5 text-green-600" />}
              {isSubmitted && selectedOptionId === opt.id && opt.id !== drill.correctAnswerId && <XCircle className="ml-2 h-5 w-5 text-red-600" />}
            </label>
          ))}
        </div>

        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            disabled={selectedOptionId === null || isAlreadyCompleted}
            className="w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            Submit Answer
          </button>
        )}

        {isSubmitted && feedbackMessage && (
          <div className={`mt-4 p-3 rounded-md text-sm border ${isCorrect || (isAlreadyCompleted && isCorrect === null) ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
            <p className="font-medium mb-1">
              {isCorrect ? "Correct!" : (isAlreadyCompleted && isCorrect === null ? "Previously Completed" : "Needs Review")}
            </p>
            <p>{feedbackMessage}</p>
          </div>
        )}

        {isSubmitted && nextDrill && (
             <Link to={`/drill/${nextDrill.hcId}/${nextDrill.id}`} className="block w-full mt-3">
                <button className="w-full px-4 py-2 text-sm font-medium text-accent-foreground bg-accent rounded-md hover:bg-accent/90">
                    Next Drill
                </button>
             </Link>
        )}
         {isSubmitted && !nextDrill && (
             <Link to={`/hc-detail/${hcId}`} className="block w-full mt-3">
                <button className="w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90">
                    Back to {hcName}
                </button>
             </Link>
        )}


      </div>
    </div>
  );
};

export default DrillView;
