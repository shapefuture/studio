
"use client";

import Link from 'next/link';
import type { UiInsight } from '@/types';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lightbulb, Zap, X, CheckCircle, HelpCircle, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { gamificationService } from '@/lib/gamificationService';
import { cn } from '@/lib/utils';
import { hcLibraryData } from '@/assets/data/hcLibraryData';


interface InsightCardProps {
  insight: UiInsight;
  onDismiss?: (id: string) => void;
  onChallengeAccepted?: (id: string, hcId?: string) => void; 
}

export function InsightCard({ insight, onDismiss, onChallengeAccepted }: InsightCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isChallengeAccepted, setIsChallengeAccepted] = useState(false);
  const [showMicroChallenges, setShowMicroChallenges] = useState(false);

  const relatedHC = hcLibraryData.find(hc => hc.id === insight.hcId);
  const HCLabel = relatedHC?.name || insight.hcId || 'Cognitive Skill';
  const HCIcon = relatedHC?.icon || HelpCircle;


  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50); // Faster mount
    const challengeTimer = setTimeout(() => setShowMicroChallenges(true), 1200); // Slightly faster reveal
    return () => {
      clearTimeout(timer);
      clearTimeout(challengeTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) {
        onDismiss(insight.id);
      }
    }, 300); // Match animation duration
  };

  const handleAcceptChallenge = async () => {
    setIsChallengeAccepted(true);
    if (onChallengeAccepted) {
      onChallengeAccepted(insight.id, insight.hcId);
    }
    await gamificationService.addWXP(5); // Award WXP

    if (insight.sourceType === 'llm' && (insight as any).highlight_suggestion_css_selector) {
      // Highlighting logic for web app context (simplified)
      // In a real extension, this would message the content script
      console.log("Web App: Would highlight selector:", (insight as any).highlight_suggestion_css_selector);
       if (typeof window !== 'undefined' && (window as any).chrome && (window as any).chrome.runtime && (window as any).chrome.runtime.sendMessage) {
        (window as any).chrome.runtime.sendMessage({
          action: 'highlightElements',
          selector: (insight as any).highlight_suggestion_css_selector
        });
      }
    }
  };
  
  if (!insight) {
    return null;
  }

  const cardIcon = insight.sourceType === 'llm' 
    ? <AlertTriangle className="w-5 h-5 text-amber-500" /> 
    : <Lightbulb className="w-5 h-5 text-sky-500" />;

  return (
    <div 
      className={cn(
        "w-full max-w-md mx-auto rounded-3xl shadow-apple-lg overflow-hidden relative transform transition-all duration-300 ease-out glassmorphic",
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-95'
      )}
    >
      {/* Optional decorative glow - more subtle */}
      <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none opacity-50 animate-pulse"></div>

      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-3 border-b border-border/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shadow-inner-apple">
            <HCIcon size={22} strokeWidth={2}/>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">{HCLabel.toUpperCase()}</h2>
             <p className="text-xs text-muted-foreground">Cognitive Insight</p>
          </div>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="icon" onClick={handleDismiss} aria-label="Dismiss insight" className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full hover:bg-secondary/50">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Content */}
      <div className="px-5 pt-4 pb-5">
        <div className="mb-4">
          <span className={cn(
            "inline-block rounded-full px-3.5 py-1.5 text-sm font-medium mb-3 relative overflow-hidden shadow-sm",
            insight.sourceType === 'llm' ? "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" : "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
          )}>
            <span className="relative z-10 flex items-center">{cardIcon} <span className="ml-1.5">{insight.title}</span></span>
            {/* <span className="absolute inset-0 animate-shimmer z-0"></span> */}
          </span>
          
          <p className="text-foreground/80 dark:text-neutral-300 text-sm leading-relaxed">{insight.explanation}</p>

          {insight.sourceType === 'llm' && (insight as any).textExcerpt && (
            <div className="mt-3 p-3 bg-secondary/50 dark:bg-secondary/30 rounded-xl border border-border/50 text-xs text-muted-foreground italic leading-normal">
              Related text: "{ (insight as any).textExcerpt.substring(0, 120) }{ (insight as any).textExcerpt.length > 120 ? '...' : '' }"
            </div>
          )}
        </div>
        
        {insight.challengePrompt && (
          <div 
            className={cn(
              "transition-all duration-500 ease-in-out overflow-hidden",
              showMicroChallenges ? 'max-h-96 opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0'
            )}
          >
            <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/20 dark:border-primary/30">
              <h3 className="font-semibold text-primary mb-2 text-sm flex items-center"><Zap className="w-4 h-4 mr-1.5"/>Mind Gym Prompt:</h3>
              <div className="space-y-2 mb-4">
                  <div className="p-3 bg-background/70 dark:bg-background/50 rounded-lg shadow-inner-apple border border-border/30">
                      <p className="text-foreground/80 dark:text-neutral-300 text-sm">{insight.challengePrompt}</p>
                  </div>
              </div>
              
              <Button 
                onClick={handleAcceptChallenge} 
                disabled={isChallengeAccepted}
                className={cn(
                  "w-full btn-apple",
                  isChallengeAccepted 
                    ? "bg-positive hover:bg-positive/90 text-positive-foreground cursor-not-allowed"
                    : "btn-apple-primary"
                )}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isChallengeAccepted ? 'Challenge Accepted!' : 'Accept Challenge (+5 WXP)'}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {insight.hcId && (
      <div className="px-5 py-3 border-t border-border/30 bg-muted/20 dark:bg-muted/10 text-right">
          <Link href={`/hc-gym/${insight.hcId}`} passHref>
            <Button variant="link" size="sm" className="text-xs text-primary hover:text-primary/80 p-0 h-auto group">
              Learn more about {HCLabel} <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5"/>
            </Button>
          </Link>
      </div>
      )}
    </div>
  );
}
