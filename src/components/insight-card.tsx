
"use client";

import Link from 'next/link';
import type { Insight } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lightbulb, Zap, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface InsightCardProps {
  insight: Insight;
  onDismiss?: (id: string) => void;
}

export function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Allow animation to complete before calling onDismiss
    setTimeout(() => {
      if (onDismiss) {
        onDismiss(insight.id);
      }
    }, 300); 
  };

  if (!insight) {
    return null;
  }

  return (
    <Card 
      className={`shadow-lg border-l-4 border-primary transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-primary" />
              Potential Bias Detected: {insight.biasType}
            </CardTitle>
            <CardDescription>
              Excerpt: "{insight.textExcerpt}"
            </CardDescription>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="icon" onClick={handleDismiss} aria-label="Dismiss insight">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-secondary/50 p-4 rounded-md">
          <h4 className="font-semibold text-md mb-2 flex items-center text-foreground">
            <Lightbulb className="mr-2 h-5 w-5 text-accent" />
            Challenge Prompt:
          </h4>
          <p className="text-sm text-muted-foreground">{insight.challengePrompt}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        <Link href={`/hc-gym/${insight.hcId}`} passHref>
          <Button variant="outline">
            <Zap className="mr-2 h-4 w-4" />
            Learn about {insight.biasType}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
