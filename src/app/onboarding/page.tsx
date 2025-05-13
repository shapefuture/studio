
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
import type { CognitiveProfileV1 } from '@/types';
import { INTERESTS_OPTIONS, SJT_QUESTIONS, HCS, DEFAULT_COGNITIVE_PROFILE } from '@/lib/constants';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<CognitiveProfileV1>(DEFAULT_COGNITIVE_PROFILE);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedProfile = localStorage.getItem('cognitiveProfile');
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        if (parsedProfile.onboardingCompleted) {
          // User has already completed onboarding, redirect them or show a message
          toast({ title: "Onboarding Complete", description: "You've already set up your profile." });
          router.push('/profile');
        } else {
          setProfile(parsedProfile);
        }
      } catch (error) {
        console.error("Error loading profile from localStorage", error);
        localStorage.removeItem('cognitiveProfile'); // Clear corrupted data
      }
    }
  }, [router, toast]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishOnboarding = () => {
    const finalProfile = { ...profile, onboardingCompleted: true };
    localStorage.setItem('cognitiveProfile', JSON.stringify(finalProfile));
    toast({
      title: "Profile Setup Complete!",
      description: "Welcome! Your cognitive coach is ready.",
      variant: "default",
      className: "bg-accent text-accent-foreground",
    });
    router.push('/profile');
    // Force a reload or use a state management solution to update AppShell's nav
    setTimeout(() => window.location.reload(), 500);
  };

  const handleInterestChange = (interestId: string, checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      interests: checked
        ? [...prev.interests, interestId]
        : prev.interests.filter(id => id !== interestId),
    }));
  };

  const handleSJTAnswer = (questionId: string, answerId: string) => {
    setProfile(prev => ({
      ...prev,
      sjtAnswers: [
        ...prev.sjtAnswers.filter(ans => ans.questionId !== questionId),
        { questionId, answer: answerId },
      ],
    }));
  };

  const handleHCFamiliarityChange = (hcId: string, value: number[]) => {
    setProfile(prev => ({
      ...prev,
      hcFamiliarity: {
        ...prev.hcFamiliarity,
        [hcId]: value[0],
      },
    }));
  };

  if (!isMounted) {
    return <div className="flex justify-center items-center h-screen"><Progress value={0} className="w-1/2" /></div>; // Or a loading spinner
  }

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">Set Up Your Cognitive Profile</CardTitle>
          <CardDescription className="text-center">
            Step {currentStep} of {TOTAL_STEPS}
          </CardDescription>
          <Progress value={(currentStep / TOTAL_STEPS) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="min-h-[300px]">
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Your Interests</h3>
              <p className="text-sm text-muted-foreground mb-4">This helps us tailor insights for you.</p>
              <div className="grid grid-cols-2 gap-4">
                {INTERESTS_OPTIONS.map(interest => (
                  <div key={interest.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest.id}
                      checked={profile.interests.includes(interest.id)}
                      onCheckedChange={(checked) => handleInterestChange(interest.id, !!checked)}
                    />
                    <Label htmlFor={interest.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {interest.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Situational Judgement</h3>
              <p className="text-sm text-muted-foreground mb-4">Respond to the following scenarios.</p>
              {SJT_QUESTIONS.map(q => (
                <div key={q.id} className="mb-6 p-4 border rounded-lg shadow-sm">
                  <p className="font-medium mb-2">{q.text}</p>
                  <RadioGroup
                    onValueChange={(value) => handleSJTAnswer(q.id, value)}
                    value={profile.sjtAnswers.find(ans => ans.questionId === q.id)?.answer}
                  >
                    {q.options.map(opt => (
                      <div key={opt.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.id} id={`${q.id}-${opt.id}`} />
                        <Label htmlFor={`${q.id}-${opt.id}`}>{opt.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">HC Familiarity</h3>
              <p className="text-sm text-muted-foreground mb-4">Rate your familiarity with these cognitive skills (0=Not familiar, 5=Very familiar).</p>
              {HCS.map(hc => (
                <div key={hc.id} className="mb-4">
                  <Label htmlFor={hc.id} className="block mb-1">{hc.name} ({hc.tag})</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id={hc.id}
                      min={0}
                      max={5}
                      step={1}
                      defaultValue={[profile.hcFamiliarity[hc.id] || 0]}
                      onValueChange={(value) => handleHCFamiliarityChange(hc.id, value)}
                      className="flex-1"
                    />
                    <span className="w-8 text-center text-sm font-medium">
                      {profile.hcFamiliarity[hc.id] || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={handleNext} className={currentStep === TOTAL_STEPS ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}>
            {currentStep === TOTAL_STEPS ? 'Finish Setup' : 'Next'}
            {currentStep === TOTAL_STEPS ? <CheckCircle className="ml-2 h-4 w-4" /> : <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
