
"use client";

import Link from 'next/link';
import type { UiInsight } from '@/types'; // Using UiInsight for flexibility
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lightbulb, Zap, X, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { gamificationService } from '@/lib/gamificationService'; // For challenge accepted WXP

interface InsightCardProps {
  insight: UiInsight;
  onDismiss?: (id: string) => void;
  onChallengeAccepted?: (id: string, hcId?: string) => void; 
}

export function InsightCard({ insight, onDismiss, onChallengeAccepted }: InsightCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isChallengeAccepted, setIsChallengeAccepted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100); // Animation on mount
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) {
        onDismiss(insight.id);
      }
    }, 300); 
  };

  const handleAcceptChallenge = async () => {
    setIsChallengeAccepted(true);
    if (onChallengeAccepted) {
      onChallengeAccepted(insight.id, insight.hcId);
    }
    // Example: Award WXP for accepting a challenge from an LLM insight
    if (insight.sourceType === 'llm') {
        await gamificationService.addWXP(5); // Small WXP for engagement
        // Potentially trigger a quest update or other gamified event
    }
    // Optionally, automatically dismiss after accepting, or navigate, etc.
  };

  if (!insight) {
    return null;
  }
  
  const Icon = insight.sourceType === 'llm' ? AlertTriangle : Lightbulb;
  const cardBorderColor = insight.sourceType === 'llm' ? 'border-amber-500' : 'border-sky-500';
  const titleColor = insight.sourceType === 'llm' ? 'text-amber-700' : 'text-sky-700';


  return (
    <Card 
      className={`shadow-xl rounded-xl border-l-4 ${cardBorderColor} transition-all duration-500 ease-out transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
    >
      <CardHeader className="pb-4 pt-5 px-5">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className={`text-xl font-semibold flex items-center ${titleColor}`}>
              <Icon className="mr-3 h-6 w-6 shrink-0" />
              {insight.title}
            </CardTitle>
            {insight.explanation && insight.sourceType === 'llm' && ( // Only show excerpt-like description for LLM source type for now
                 <CardDescription className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    Re: "{insight.explanation.substring(0, 100)}{insight.explanation.length > 100 ? '...' : ''}"
                 </CardDescription>
            )}
          </div>
          {onDismiss && (
            <Button variant="ghost" size="icon" onClick={handleDismiss} aria-label="Dismiss insight" className="text-muted-foreground hover:text-foreground h-8 w-8">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        {insight.sourceType === 'llm' && insight.explanation && (
             <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow-inner">
                <h4 className="font-medium text-md mb-1 text-amber-800">
                    Detailed Explanation:
                </h4>
                <p className="text-sm text-amber-700 leading-relaxed">{insight.explanation}</p>
            </div>
        )}
         {insight.sourceType === 'offline' && insight.explanation && (
             <div className="bg-sky-50 p-4 rounded-lg border border-sky-200 shadow-inner">
                <p className="text-sm text-sky-700 leading-relaxed">{insight.explanation}</p>
            </div>
        )}

        {insight.challengePrompt && (
          <div className={`mt-4 p-4 rounded-lg border ${isChallengeAccepted ? 'bg-green-50 border-green-200' : 'bg-secondary/50 border-border'}`}>
            <h4 className="font-semibold text-md mb-2 flex items-center text-foreground">
              <Lightbulb className={`mr-2 h-5 w-5 ${isChallengeAccepted ? 'text-green-600' : 'text-accent'}`} />
              {isChallengeAccepted ? 'Challenge Accepted!' : 'Challenge Prompt:'}
            </h4>
            <p className={`text-sm ${isChallengeAccepted ? 'text-green-700' : 'text-muted-foreground'}`}>{insight.challengePrompt}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-3 pb-5 px-5 border-t bg-muted/30">
        {insight.hcId && (
          <Link href={`/hc-gym/${insight.hcId}`} passHref>
            <Button variant="outline" size="sm" className="w-full sm:w-auto shadow-sm hover:bg-primary/10 hover:border-primary">
              <Zap className="mr-2 h-4 w-4 text-primary" />
              Learn about related HC
            </Button>
          </Link>
        )}
        {insight.challengePrompt && !isChallengeAccepted && (
          <Button 
            size="sm" 
            onClick={handleAcceptChallenge} 
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Accept Challenge
          </Button>
        )}
         {isChallengeAccepted && (
             <p className="text-sm text-green-600 font-medium flex items-center"><CheckCircle className="mr-2 h-5 w-5"/> Challenge noted!</p>
         )}
      </CardFooter>
    </Card>
  );
}

// Example usage in a page:
// import { InsightCard } from '@/components/insight-card';
// import type { UiInsight } from '@/types';
// const sampleUiInsight: UiInsight = {
//   id: 'llm-sample-1',
//   title: 'Potential Bias: Confirmation Bias',
//   sourceType: 'llm',
//   hcId: 'bias-detection',
//   explanation: "It seems you're focusing heavily on articles that support your existing viewpoint on the new X policy, while quickly dismissing contradictory reports.",
//   challengePrompt: "What's one strong argument someone against the X policy might make, that has some validity?",
//   timestamp: Date.now(),
// };
// const sampleOfflineInsight: UiInsight = {
//   id: 'offline-sample-1',
//   title: 'Quick Tip: Pause & Reflect',
//   sourceType: 'offline',
//   hcId: 'critique',
//   explanation: "Before making a quick judgment, take a deep breath and ask yourself: 'What if my first thought isn't the full picture?'",
//   timestamp: Date.now(),
// };
// <InsightCard insight={sampleUiInsight} onDismiss={(id) => console.log('Dismissed LLM:', id)} onChallengeAccepted={(id, hcId) => console.log('Challenge Accepted LLM:', id, hcId)} />
// <InsightCard insight={sampleOfflineInsight} onDismiss={(id) => console.log('Dismissed Offline:', id)} />
