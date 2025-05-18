// This file is part of the Next.js app structure and might be phased out
// or adapted if the Chrome Extension becomes the sole focus.
// For now, ensuring it builds by fixing imports.
"use client";

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { hcLibraryData } from '@/assets/data/hcLibraryData';
import { hcDrillsData } from '@/assets/data/hcDrillsData';
import type { HC, HCDrillQuestion } from '@/types'; // Ensure this path is correct
import { CheckCircle, Lightbulb, MessageSquare, RefreshCw, ChevronLeft, XCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Ensure this path is correct
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { gamificationService } from '@/lib/gamificationService'; // Ensure this path is correct
import { mindframeStore } from '@/lib/MindframeStore'; // Ensure this path is correct

interface DrillPageProps {
  params: { hcId: string; drillId: string };
  // searchParams?: { [key: string]: string | string[] | undefined }; // Next.js app router passes searchParams
}

export default function DrillPage({ params }: DrillPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [hc, setHc] = useState<HC | undefined>(undefined);
  const [drill, setDrill] = useState<HCDrillQuestion | undefined>(undefined);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isDrillCompletedInStore, setIsDrillCompletedInStore] = useState(false);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const currentHc = hcLibraryData.find((h) => h.id === params.hcId);
    if (currentHc) {
      setHc(currentHc);
      const currentDrill = hcDrillsData.find((d) => d.id === params.drillId && d.hcId === params.hcId);
      if (currentDrill) {
        setDrill(currentDrill);
        // Check if drill was already completed
        mindframeStore.get().then(store => {
            if (store.gamification.completedDrillIds.includes(currentDrill.id)) {
                setIsDrillCompletedInStore(true);
                setIsSubmitted(true); // Mark as submitted to show feedback if already done
                // We don't know their previous answer, so can't set isCorrect without storing more data
            }
        });

      } else {
        notFound();
      }
    } else {
      notFound();
    }
  }, [params.hcId, params.drillId]);

  const handleSubmit = async () => {
    if (!drill || !selectedAnswer) return;

    const correct = selectedAnswer === drill.correctAnswerId;
    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct && !isDrillCompletedInStore) {
      await gamificationService.markDrillAsCompleted(drill.id, drill.rewardWXP || 10);
      setIsDrillCompletedInStore(true); // Mark as completed for this session too
      toast({
        title: "Correct!",
        description: `Awesome job! You've earned ${drill.rewardWXP || 10} WXP.`,
        className: "bg-accent text-accent-foreground",
      });
    } else if (!correct) {
       toast({
        title: "Not Quite",
        description: "Review the explanation and try to understand the concept better.",
        variant: "destructive"
      });
    } else if (isDrillCompletedInStore) {
        toast({
            title: "Already Completed",
            description: "You've already mastered this drill! Try another one.",
        });
    }
  };

  const handleReset = () => {
    setSelectedAnswer(undefined);
    setIsSubmitted(false);
    setIsCorrect(null);
  };

  const findNextDrill = (): HCDrillQuestion | null => {
    if (!hc || !drill) return null;
    const drillsForCurrentHc = hcDrillsData.filter(d => d.hcId === hc.id);
    const currentIndex = drillsForCurrentHc.findIndex(d => d.id === drill.id);
    if (currentIndex !== -1 && currentIndex < drillsForCurrentHc.length - 1) {
      return drillsForCurrentHc[currentIndex + 1];
    }
    return null;
  };
  const nextDrill = findNextDrill();


  if (!isMounted || !hc || !drill) {
    return <div className="flex justify-center items-center h-screen text-muted-foreground">Loading drill...</div>;
  }

  const feedbackMessage = isCorrect === true 
    ? drill.explanationOnCorrect 
    : (isCorrect === false ? drill.explanationOnIncorrect : (isDrillCompletedInStore ? "You've previously completed this drill." : ""));

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" size="sm" onClick={() => router.push(`/hc-gym/${hc.id}`)} className="mb-6 shadow-sm">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to {hc.name} Drills
      </Button>

      <Card className="shadow-xl rounded-xl overflow-hidden border-border">
        <CardHeader className="bg-gradient-to-br from-primary via-blue-400 to-blue-500 text-primary-foreground p-6">
          <CardTitle className="text-3xl font-bold">{drill.name}</CardTitle>
          <CardDescription className="text-lg text-blue-100 mt-1">
            Interactive MCQ Drill for {hc.name} ({hc.tag})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <section className="mb-6 p-4 border-l-4 border-accent bg-accent/10 rounded-r-md shadow">
            <h3 className="text-xl font-semibold mb-2 text-accent-foreground flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-accent" /> Drill Question
            </h3>
            <p className="text-md text-foreground whitespace-pre-wrap">{drill.questionText}</p>
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" /> Your Answer
            </h3>
            <RadioGroup
              value={selectedAnswer}
              onValueChange={setSelectedAnswer}
              disabled={isSubmitted || isDrillCompletedInStore}
              className="space-y-3"
            >
              {drill.options.map(option => (
                <Label 
                  key={option.id} 
                  htmlFor={`option-${option.id}`}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:shadow-md 
                    ${selectedAnswer === option.id ? 'ring-2 ring-primary bg-primary/10' : 'bg-card hover:border-primary/50'}
                    ${(isSubmitted || isDrillCompletedInStore) && option.id === drill.correctAnswerId ? 'border-green-500 bg-green-50 ring-2 ring-green-500' : ''}
                    ${(isSubmitted || isDrillCompletedInStore) && selectedAnswer === option.id && option.id !== drill.correctAnswerId ? 'border-red-500 bg-red-50 ring-2 ring-red-500' : ''}
                    ${(isSubmitted || isDrillCompletedInStore) ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  <RadioGroupItem 
                    value={option.id} 
                    id={`option-${option.id}`} 
                    className="mr-3 h-5 w-5"
                    disabled={isSubmitted || isDrillCompletedInStore}
                  />
                  <span className="text-sm flex-1">{option.text}</span>
                   {(isSubmitted || isDrillCompletedInStore) && option.id === drill.correctAnswerId && <CheckCircle className="ml-2 h-5 w-5 text-green-600" />}
                   {(isSubmitted || isDrillCompletedInStore) && selectedAnswer === option.id && option.id !== drill.correctAnswerId && <XCircle className="ml-2 h-5 w-5 text-red-600" />}
                </Label>
              ))}
            </RadioGroup>
          </section>

          {isSubmitted && feedbackMessage && (
             <Alert variant={isCorrect === null ? "default" : (isCorrect ? "default" : "destructive")} className={`mt-6 shadow-md ${isCorrect ? 'border-accent bg-accent/10' : (isDrillCompletedInStore && !isCorrect ? 'border-muted' : '')}`}>
              {(isCorrect === true || isDrillCompletedInStore) ? <CheckCircle className="h-5 w-5 text-accent" /> : <XCircle className="h-5 w-5 text-destructive" />}
              <AlertTitle className={isCorrect ? "text-accent" : (isDrillCompletedInStore && !isCorrect ? "text-muted-foreground" : "text-destructive")}>
                {isCorrect ? "Feedback: Correct!" : (isDrillCompletedInStore && !isCorrect ? "Previously Completed" : "Feedback: Needs Review")}
              </AlertTitle>
              <AlertDescription>
                {feedbackMessage}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="p-6 bg-muted/30 flex flex-col sm:flex-row justify-between items-center gap-3 border-t">
          <Button 
            variant="outline" 
            onClick={handleReset} 
            className="w-full sm:w-auto shadow-sm" 
            disabled={(!selectedAnswer && !isSubmitted) || isDrillCompletedInStore}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Reset Selections
          </Button>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedAnswer || isSubmitted || isDrillCompletedInStore}
              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Submit Answer
            </Button>
            {isSubmitted && nextDrill && (
                 <Link href={`/hc-gym/${nextDrill.hcId}/${nextDrill.id}`} passHref className="flex-1 sm:flex-none">
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
                        Next Drill <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                 </Link>
            )}
             {isSubmitted && !nextDrill && (
                 <Link href={`/hc-gym/${hc.id}`} passHref className="flex-1 sm:flex-none">
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
                        Back to {hc.name} <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                 </Link>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
