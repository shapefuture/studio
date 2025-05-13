
"use client";

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HCS } from '@/lib/constants';
import type { HC, Drill } from '@/types';
import { CheckCircle, Lightbulb, MessageSquare, RefreshCw, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DrillPageProps {
  params: { hcId: string; drillId: string };
}

export default function DrillPage({ params }: DrillPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [hc, setHc] = useState<HC | undefined>(undefined);
  const [drill, setDrill] = useState<Drill | undefined>(undefined);
  const [userResponse, setUserResponse] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const currentHc = HCS.find((h) => h.id === params.hcId);
    if (currentHc) {
      setHc(currentHc);
      const currentDrill = currentHc.drills.find((d) => d.id === params.drillId);
      if (currentDrill) {
        setDrill(currentDrill);
      } else {
        notFound();
      }
    } else {
      notFound();
    }
  }, [params.hcId, params.drillId]);

  const handleSubmit = () => {
    // Mock feedback generation
    if (userResponse.trim().length < 10) {
      setFeedback("Your response seems a bit short. Try to elaborate more to fully engage with the drill.");
      setIsCompleted(false);
    } else {
      setFeedback(`Great effort! You've thoughtfully engaged with: "${drill?.name}". Reflect on how this exercise helps in understanding ${hc?.name}.`);
      setIsCompleted(true);
      toast({
        title: "Drill Submitted!",
        description: "Your response has been recorded. Check the feedback.",
        className: "bg-accent text-accent-foreground",
      });
      // Potentially update gamification data here
      // e.g., add WXP, mark challenge as complete
      // This would require access to localStorage and updating it.
      const gamificationData = JSON.parse(localStorage.getItem('gamificationData') || '{}');
      const updatedGamificationData = {
        ...gamificationData,
        wxp: (gamificationData.wxp || 0) + 10, // Add 10 WXP
        completedChallenges: [...(gamificationData.completedChallenges || []), `${params.hcId}-${params.drillId}`],
      };
      localStorage.setItem('gamificationData', JSON.stringify(updatedGamificationData));
    }
  };

  const handleReset = () => {
    setUserResponse('');
    setFeedback('');
    setIsCompleted(false);
  };

  if (!isMounted || !hc || !drill) {
    // Or a loading skeleton
    return <div className="flex justify-center items-center h-screen">Loading drill...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to {hc.name}
      </Button>

      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-primary p-6 text-primary-foreground">
          <CardTitle className="text-3xl font-bold">{drill.name}</CardTitle>
          <CardDescription className="text-lg text-blue-100 mt-1">
            An interactive drill for {hc.name} ({hc.tag})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <section className="mb-6 p-4 border-l-4 border-accent bg-accent/10 rounded-r-md">
            <h3 className="text-xl font-semibold mb-2 text-accent flex items-center">
              <Lightbulb className="mr-2 h-5 w-5" /> Drill Instructions
            </h3>
            <p className="text-muted-foreground">{drill.description}</p>
            {drill.content && (
              <div className="mt-3 p-3 bg-background rounded shadow-sm">
                <p className="font-medium text-sm">Scenario/Task:</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{drill.content}</p>
              </div>
            )}
          </section>

          <section className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" /> Your Response
            </h3>
            <Textarea
              placeholder="Type your response here..."
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              rows={6}
              className="shadow-sm focus:ring-2 focus:ring-primary"
              disabled={isCompleted}
            />
          </section>

          {feedback && (
             <Alert variant={isCompleted ? "default" : "destructive"} className={`mt-6 ${isCompleted ? 'border-accent bg-accent/10' : ''}`}>
              {isCompleted ? <CheckCircle className="h-5 w-5 text-accent" /> : <Lightbulb className="h-5 w-5 text-destructive" />}
              <AlertTitle className={isCompleted ? "text-accent" : "text-destructive"}>
                {isCompleted ? "Feedback" : "Suggestion"}
              </AlertTitle>
              <AlertDescription>
                {feedback}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="p-6 bg-muted/30 flex flex-col sm:flex-row justify-end items-center gap-3">
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto" disabled={!userResponse && !feedback}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reset Drill
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!userResponse.trim() || isCompleted}
            className={`w-full sm:w-auto ${isCompleted ? "bg-gray-400" : "bg-accent hover:bg-accent/90 text-accent-foreground"}`}
          >
            <CheckCircle className="mr-2 h-4 w-4" /> {isCompleted ? "Completed" : "Submit Response"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
