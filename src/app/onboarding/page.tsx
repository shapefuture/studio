"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { CognitiveProfileV1, SJTScenario, HC as HCType } from '@/types';
import { INTERESTS_OPTIONS, DEFAULT_COGNITIVE_PROFILE, APP_NAME } from '@/lib/constants';
import { hcLibraryData } from '@/assets/data/hcLibraryData';
import { sjtScenariosData } from '@/assets/data/sjtScenariosData';
import { onboardingGoalOptions, type OnboardingGoalOption } from '@/assets/data/onboardingGoals';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles, Target, UserCheck, Activity } from 'lucide-react';
import { processOnboardingData } from '@/lib/onboardingLogic';
import { mindframeStore } from '@/lib/MindframeStore';

const TOTAL_STEPS = 5; // Welcome, Interests, SJTs, HC Ratings, Goal Select, Cognitive Mirror

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [interests, setInterests] = useState<string[]>(DEFAULT_COGNITIVE_PROFILE.interests);
  const [sjtAnswers, setSjtAnswers] = useState<{ scenarioId: string; selectedOptionId: string }[]>(DEFAULT_COGNITIVE_PROFILE.sjtAnswers);
  const [hcFamiliarity, setHcFamiliarity] = useState<{[hcId: string]: number}>(DEFAULT_COGNITIVE_PROFILE.hcFamiliarity);
  const [userGoal, setUserGoal] = useState<string>('');
  const [generatedProfile, setGeneratedProfile] = useState<CognitiveProfileV1 | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const loadProfile = async () => {
      const storeState = await mindframeStore.get();
      if (storeState.profile && storeState.profile.onboardingCompleted) {
        // If already completed, maybe allow re-onboarding or go to profile.
        // For now, let's assume if they land here and it's complete, they want to re-do or view.
        // If just viewing, profile page is better.
        // If re-doing, then current logic is fine but might want a "Start Over" button somewhere.
        // Let's prefill and allow them to go through.
        setInterests(storeState.profile.interests || []);
        setSjtAnswers(storeState.profile.sjtAnswers || []);
        setHcFamiliarity(storeState.profile.hcFamiliarity || {});
        setUserGoal(storeState.profile.userGoal || '');
        // We don't auto-redirect to /profile here to allow re-onboarding if desired.
        // A message could be shown: "You've completed onboarding. Go to Profile or update selections."
      }
    };
    loadProfile();
  }, []);

  const handleNext = async () => {
    if (currentStep === TOTAL_STEPS - 1) { // Transitioning from penultimate step (Goal Select) to last (Cognitive Mirror)
      const onboardingInput = { interests, sjtAnswers, hcFamiliarity, userGoal };
      if (!userGoal) {
        toast({ title: "Goal Selection Needed", description: "Please select your primary goal before proceeding.", variant: "destructive" });
        return;
      }
      try {
        const finalProfile = await processOnboardingData(onboardingInput);
        setGeneratedProfile(finalProfile);
        setCurrentStep(currentStep + 1); // Move to Cognitive Mirror step
        toast({
          title: "Profile Snapshot Generated!",
          description: "Review your cognitive snapshot below.",
        });
      } catch (error) {
        console.error("Error processing onboarding data for summary:", error);
        toast({
          title: "Error",
          description: "Could not generate profile summary. Please try again.",
          variant: "destructive",
        });
      }
    } else if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else { // On the final step (Cognitive Mirror), button click means finish.
      if (!generatedProfile) {
         // This case should ideally not happen if button is disabled until profile is generated.
        toast({ title: "Profile Not Ready", description: "Please wait for profile summary to load or try again.", variant: "destructive"});
        return;
      }
      toast({
        title: "Profile Setup Complete!",
        description: `Welcome to ${APP_NAME}! Your cognitive coach is ready.`,
        className: "bg-accent text-accent-foreground",
      });
      router.push('/profile');
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.reload();
      } , 500); 
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInterestChange = (interestId: string, checked: boolean) => {
    setInterests(prev => checked ? [...prev, interestId] : prev.filter(id => id !== interestId));
  };

  const handleSJTAnswer = (scenarioId: string, selectedOptionId: string) => {
    setSjtAnswers(prev => [
      ...prev.filter(ans => ans.scenarioId !== scenarioId),
      { scenarioId, selectedOptionId },
    ]);
  };

  const handleHCFamiliarityChange = (hcId: string, value: number[]) => {
    setHcFamiliarity(prev => ({ ...prev, [hcId]: value[0] }));
  };

  const handleGoalSelect = (goalId: string) => {
    setUserGoal(goalId);
  };

  if (!isMounted) {
    return <div className="flex justify-center items-center h-screen"><Progress value={0} className="w-1/2" /></div>;
  }
  
  const currentProgress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center">
      <Card className="w-full max-w-2xl shadow-2xl rounded-xl">
        <CardHeader className="bg-gradient-to-br from-primary to-blue-400 text-primary-foreground p-6 rounded-t-xl">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8" />
            <CardTitle className="text-3xl font-bold">Welcome to {APP_NAME}!</CardTitle>
          </div>
          <CardDescription className="text-blue-100 text-md">
            Let's personalize your cognitive coaching experience. (Step {currentStep} of {TOTAL_STEPS})
          </CardDescription>
          <Progress value={currentProgress} className="mt-3 h-2 [&>div]:bg-accent" />
        </CardHeader>
        <CardContent className="p-6 md:p-8 min-h-[350px]">
          {currentStep === 1 && ( // Interests
            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center"><Activity className="mr-2 text-primary h-6 w-6"/>Select Your Interests</h3>
              <p className="text-sm text-muted-foreground mb-6">This helps us tailor insights and content relevant to you.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {INTERESTS_OPTIONS.map(interest => (
                  <div key={interest.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-secondary/50 transition-colors">
                    <Checkbox
                      id={`interest-${interest.id}`}
                      checked={interests.includes(interest.id)}
                      onCheckedChange={(checked) => handleInterestChange(interest.id, !!checked)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor={`interest-${interest.id}`} className="text-sm font-medium cursor-pointer flex-1">
                      {interest.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentStep === 2 && ( // SJTs
            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Situational Judgement</h3>
              <p className="text-sm text-muted-foreground mb-6">Respond to the following scenarios to help us understand your thinking patterns.</p>
              {sjtScenariosData.map((q: SJTScenario) => (
                <div key={q.id} className="mb-6 p-4 border rounded-lg shadow-sm bg-background">
                  <p className="font-medium mb-3 text-md">{q.scenarioText}</p>
                  <RadioGroup
                    onValueChange={(value) => handleSJTAnswer(q.id, value)}
                    value={sjtAnswers.find(ans => ans.scenarioId === q.id)?.selectedOptionId}
                    className="space-y-2"
                  >
                    {q.options.map(opt => (
                      <div key={opt.id} className="flex items-center space-x-3 p-2 border rounded-md hover:bg-secondary/30 transition-colors cursor-pointer">
                        <RadioGroupItem value={opt.id} id={`${q.id}-${opt.id}`} className="h-5 w-5"/>
                        <Label htmlFor={`${q.id}-${opt.id}`} className="text-sm cursor-pointer flex-1">{opt.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}
          {currentStep === 3 && ( // HC Familiarity
            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Cognitive Skills Familiarity</h3>
              <p className="text-sm text-muted-foreground mb-6">Rate your current familiarity with these cognitive skills (0=Not familiar, 5=Very familiar).</p>
              {hcLibraryData.map((hc: HCType) => (
                <div key={hc.id} className="mb-5 p-3 border rounded-md">
                  <Label htmlFor={`hc-${hc.id}`} className="block mb-2 text-md font-medium">{hc.name} <span className="text-xs font-mono bg-muted px-1 rounded">({hc.tag})</span></Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id={`hc-${hc.id}`}
                      min={0} max={5} step={1}
                      defaultValue={[hcFamiliarity[hc.id] || 0]}
                      onValueChange={(value) => handleHCFamiliarityChange(hc.id, value)}
                      className="flex-1"
                    />
                    <span className="w-10 text-center text-sm font-semibold p-2 bg-primary/20 text-primary rounded-md">
                      {hcFamiliarity[hc.id] || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {currentStep === 4 && ( // Goal Select
             <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center"><Target className="mr-2 text-primary h-6 w-6"/>What's Your Primary Goal?</h3>
              <p className="text-sm text-muted-foreground mb-6">Selecting a primary goal helps us customize your coaching journey.</p>
              <RadioGroup onValueChange={handleGoalSelect} value={userGoal} className="space-y-3">
                {onboardingGoalOptions.map((goal: OnboardingGoalOption) => (
                  <Label key={goal.id} htmlFor={`goal-${goal.id}`} 
                    className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:shadow-md ${userGoal === goal.id ? 'ring-2 ring-primary bg-primary/10 shadow-lg' : 'bg-background hover:bg-secondary/30'}`}>
                    <div className="flex items-center">
                      <RadioGroupItem value={goal.id} id={`goal-${goal.id}`} className="mr-3 h-5 w-5" />
                      <span className="font-semibold text-md text-foreground">{goal.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-8">{goal.description}</p>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}
          {currentStep === 5 && ( // Cognitive Mirror (Summary & Finalization)
            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center"><UserCheck className="mr-2 text-accent h-6 w-6"/>Your Cognitive Snapshot</h3>
              <p className="text-sm text-muted-foreground mb-6">Here's a summary based on your input. This will help tailor your coaching.</p>
              {generatedProfile ? (
                <div className="space-y-4 p-4 border rounded-lg bg-secondary/30 shadow-inner">
                  <div><strong>Primary Goal:</strong> <span className="font-medium">{onboardingGoalOptions.find(g => g.id === generatedProfile.userGoal)?.label || 'Not set'}</span></div>
                  <div><strong>Interests:</strong> <span className="font-medium">{generatedProfile.interests.map(id => INTERESTS_OPTIONS.find(i=>i.id===id)?.label).join(', ') || 'None selected'}</span></div>
                  
                  <div className="mt-2">
                    <h4 className="font-medium text-sm">HC Familiarity Ratings:</h4>
                    <ul className="list-disc list-inside pl-4 text-sm">
                    {Object.entries(generatedProfile.hcFamiliarity).map(([hcId, rating]) => {
                        const hc = hcLibraryData.find(h => h.id === hcId);
                        return <li key={hcId}>{hc?.name || hcId}: {rating}/5</li>
                    })}
                    {Object.keys(generatedProfile.hcFamiliarity).length === 0 && <li>No familiarity ratings provided.</li>}
                    </ul>
                  </div>

                  {generatedProfile.potentialBiasesIdentified && generatedProfile.potentialBiasesIdentified.length > 0 && (
                    <div className="mt-2">
                        <h4 className="font-medium text-sm">Potential Biases/Patterns to Explore:</h4>
                        <ul className="list-disc list-inside pl-4 text-sm">
                        {generatedProfile.potentialBiasesIdentified.map((bias, idx) => <li key={idx}>{bias}</li>)}
                        </ul>
                    </div>
                  )}
                   {(!generatedProfile.potentialBiasesIdentified || generatedProfile.potentialBiasesIdentified.length === 0) && (
                     <p className="text-sm italic text-muted-foreground">No specific bias patterns strongly indicated by initial responses. General awareness is always beneficial!</p>
                   )}
                  <p className="mt-4 text-sm text-accent-foreground bg-accent/90 p-3 rounded-md shadow">
                    Your profile is set! You're ready to start your journey towards sharper thinking.
                  </p>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-10">Generating your profile summary... Please wait.</p>
              )}
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between p-6 bg-muted/30 rounded-b-xl">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="shadow-sm">
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          <Button 
            onClick={handleNext} 
            className={`shadow-md ${currentStep === TOTAL_STEPS ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
            disabled={
              (currentStep === 2 && sjtAnswers.length < sjtScenariosData.length) || // Must answer all SJTs
              (currentStep === 4 && !userGoal) || // Must select a goal on step 4 before "Process"
              (currentStep === TOTAL_STEPS && !generatedProfile) // On last step, "Finish" is disabled until profile is generated
            }
          >
            {currentStep === TOTAL_STEPS ? 'Finish & Go to Profile' : (currentStep === TOTAL_STEPS -1 ? 'Process & View Summary' : 'Next')}
            {currentStep === TOTAL_STEPS ? <CheckCircle className="ml-2 h-4 w-4" /> : <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
      <p className="text-xs text-muted-foreground mt-4">Your data is stored locally in your browser.</p>
    </div>
  );
}
