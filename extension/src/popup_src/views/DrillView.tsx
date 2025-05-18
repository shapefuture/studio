
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { hcDrillsData } from '@assets/data/hc_drills_data';
import { hcLibraryData } from '@assets/data/hc_library_data';
import type { HCDrillQuestion, HCDrillOption, HCData } from '@core_logic/types';
import { MindframeStore } from '@core_logic/MindframeStore.js';
import { GamificationService } from '@core_logic/gamificationService.js';
import { ChevronLeft, CheckCircle, XCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const DrillView: React.FC = () => {
  const { hcId, drillId } = useParams<{ hcId: string; drillId: string }>();
  const navigate = useNavigate();

  const [drill, setDrill] = useState<HCDrillQuestion | null>(null);
  const [hcInfo, setHcInfo] = useState<HCData | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");

  useEffect(() => {
    console.log(`DrillView: Mounting for hcId=${hcId}, drillId=${drillId}`);
    const currentHc = hcLibraryData.find(h => h.id === hcId);
    if (currentHc) {
      setHcInfo(currentHc);
    } else {
      console.warn(`DrillView: HC info not found for hcId=${hcId}. Navigating back to gym.`);
      navigate('/gym');
      return;
    }

    const currentDrill = hcDrillsData.find(d => d.id === drillId && d.hcId === hcId);
    if (currentDrill) {
      setDrill(currentDrill);
      MindframeStore.get().then(state => {
        if (state.completedDrillIds.includes(currentDrill.id)) {
          console.log(`DrillView: Drill ${currentDrill.id} already completed.`);
          setIsAlreadyCompleted(true);
          setIsSubmitted(true); 
          setIsCorrect(true); // Assume previously completed correctly for display
          setSelectedOptionId(currentDrill.correctAnswerId); // Show the correct answer selected
          setFeedbackMessage(currentDrill.explanationOnCorrect + " (You've previously completed this drill.)");
        } else {
          console.log(`DrillView: Drill ${currentDrill.id} not yet completed.`);
          setIsAlreadyCompleted(false);
          setIsSubmitted(false);
          setIsCorrect(null);
          setSelectedOptionId(null);
          setFeedbackMessage("");
        }
      }).catch(error => {
        console.error("DrillView: Error fetching MindframeStore state:", error);
      });
    } else {
      console.warn(`DrillView: Drill not found for hcId=${hcId}, drillId=${drillId}. Navigating back to HC detail.`);
      navigate(`/hc-detail/${hcId}`); 
    }
    // Reset state for new drill
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setFeedbackMessage("");
    setIsAlreadyCompleted(false);

  }, [hcId, drillId, navigate]);

  const handleSubmit = async () => {
    if (!drill || selectedOptionId === null) {
      console.warn("DrillView: handleSubmit called with no drill or no selected option.");
      return;
    }
    if (isAlreadyCompleted) {
      console.log("DrillView: handleSubmit called for an already completed drill. No action taken.");
      return;
    }

    console.log(`DrillView: Submitting answer for drill ${drill.id}. Selected: ${selectedOptionId}`);
    const correct = selectedOptionId === drill.correctAnswerId;
    setIsCorrect(correct);
    setIsSubmitted(true);
    setFeedbackMessage(correct ? drill.explanationOnCorrect : drill.explanationOnIncorrect);

    if (correct) {
      const wxpEarned = drill.rewardWXP || 5; // Default WXP if not specified
      try {
        console.log(`DrillView: Correct answer. Awarding ${wxpEarned} WXP.`);
        await GamificationService.addWXP(wxpEarned);
        await MindframeStore.update(state => ({
          ...state, // Ensure existing state is spread
          completedDrillIds: Array.from(new Set([...state.completedDrillIds, drill.id]))
        }));
        setIsAlreadyCompleted(true); // Mark as completed for this session too
        setFeedbackMessage(prev => prev + ` (+${wxpEarned} WXP)`);
        console.log(`DrillView: WXP and completedDrillIds updated in store for drill ${drill.id}.`);
      } catch (error) {
        console.error("DrillView: Error updating WXP or completed drills:", error);
        setFeedbackMessage(prev => prev + ` (Error saving progress)`);
      }
    } else {
      console.log(`DrillView: Incorrect answer for drill ${drill.id}.`);
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

  const handleNextDrill = () => {
    if (nextDrill) {
      console.log(`DrillView: Navigating to next drill: ${nextDrill.id}`);
      navigate(`/drill/${nextDrill.hcId}/${nextDrill.id}`);
    } else {
      console.log(`DrillView: No next drill. Navigating back to HC detail for ${hcId}.`);
      navigate(`/hc-detail/${hcId}`);
    }
  };

  if (!drill || !hcInfo) {
    return <div className="p-4 text-center text-muted-foreground">Loading drill...</div>;
  }
  
  return (
    <div className="p-4 space-y-4 max-h-full overflow-y-auto">
      <Link to={`/hc-detail/${hcId}`} className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to {hcInfo.name}
      </Link>
      <div className="p-4 border rounded-lg bg-card shadow-sm">
        <h1 className="text-lg font-semibold mb-1">{drill.name}</h1>
        <p className="text-sm text-muted-foreground mb-3">Part of: {hcInfo.name}</p>
        
        <div className="p-3 mb-4 bg-secondary/30 rounded-md border border-border/50">
            <div className="flex items-start text-primary mb-1">
                <Lightbulb className="w-5 h-5 mr-2 shrink-0" />
                <h3 className="font-medium">Question:</h3>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap ml-7">{drill.questionText}</p>
        </div>

        <div className="space-y-2 mb-4">
          {drill.options.map((opt: HCDrillOption) => (
            <label
              key={opt.id}
              className={cn(
                `flex items-center space-x-2 p-3 border rounded-md transition-all`,
                selectedOptionId === opt.id && 'ring-2 ring-primary bg-primary/10',
                !(isSubmitted || isAlreadyCompleted) && 'hover:bg-secondary/50 cursor-pointer',
                isSubmitted && opt.id === drill.correctAnswerId && 'border-green-500 bg-green-500/10 ring-2 ring-green-500',
                isSubmitted && selectedOptionId === opt.id && opt.id !== drill.correctAnswerId && 'border-red-500 bg-red-500/10 ring-2 ring-red-500',
                (isSubmitted || isAlreadyCompleted) && 'cursor-not-allowed opacity-80'
              )}
            >
              <input
                type="radio"
                name={`drill-${drill.id}`}
                value={opt.id}
                checked={selectedOptionId === opt.id}
                onChange={() => !(isSubmitted || isAlreadyCompleted) && setSelectedOptionId(opt.id)}
                disabled={isSubmitted || isAlreadyCompleted}
                className="form-radio h-4 w-4 text-primary focus:ring-primary"
              />
              <span className="text-sm flex-1">{opt.text}</span>
              {isSubmitted && opt.id === drill.correctAnswerId && <CheckCircle className="ml-2 h-5 w-5 text-green-600" />}
              {isSubmitted && selectedOptionId === opt.id && opt.id !== drill.correctAnswerId && <XCircle className="ml-2 h-5 w-5 text-red-600" />}
            </label>
          ))}
        </div>

        {!isSubmitted && !isAlreadyCompleted && (
          <button
            onClick={handleSubmit}
            disabled={selectedOptionId === null}
            className="w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 shadow-sm"
          >
            Submit Answer
          </button>
        )}

        {isSubmitted && feedbackMessage && (
          <div className={cn(
            "mt-4 p-3 rounded-md text-sm border", 
            isCorrect || (isAlreadyCompleted && isCorrect !== false) ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
          )}>
             <p className="font-medium mb-1">
              {isCorrect ? "Correct!" : (isAlreadyCompleted ? "Previously Completed" : "Needs Review")}
            </p>
            <p className="whitespace-pre-wrap">{feedbackMessage}</p>
          </div>
        )}

        {(isSubmitted || isAlreadyCompleted) && (
            <button 
                onClick={handleNextDrill}
                className="w-full mt-3 px-4 py-2 text-sm font-medium text-accent-foreground bg-accent rounded-md hover:bg-accent/90 shadow-sm flex items-center justify-center"
            >
                {nextDrill ? 'Next Drill' : `Back to ${hcInfo.name}`}
                <ArrowRight className="ml-2 h-4 w-4"/>
            </button>
        )}
      </div>
    </div>
  );
};

export default DrillView;
