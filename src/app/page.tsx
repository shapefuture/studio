
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InsightCard } from '@/components/insight-card';
import type { UiInsight } from '@/types';
import { ArrowRight, BookOpen, Brain, Sparkles, UserCheck, ThumbsUp, XCircle, ExternalLink } from 'lucide-react';
import React from 'react';
import { mindframeStore } from '@/lib/MindframeStore';
import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';


const sampleLLMInsightInitial: UiInsight = {
  id: 'llm_sample_01',
  title: 'Potential Bias: Confirmation Bias',
  sourceType: 'llm',
  hcId: 'bias-detection', 
  explanation: "The analyzed text appears to heavily favor sources that confirm a pre-existing viewpoint on Topic Y, while alternative perspectives are downplayed or omitted. This pattern is often indicative of confirmation bias.",
  challengePrompt: "What are two potential weaknesses or counter-arguments to the main point made in the text, even if you generally agree with it?",
  timestamp: Date.now(),
};

const sampleOfflineInsightInitial: UiInsight = {
  id: 'offline_tip_01',
  title: 'Quick Tip: The Five Whys',
  sourceType: 'offline',
  hcId: 'critique', 
  explanation: "When facing a problem or a strong assertion, try asking 'Why?' five times to drill down to the root cause or underlying assumptions. This can reveal deeper insights.",
  timestamp: Date.now(),
};


export default function HomePage() {
  const [onboardingComplete, setOnboardingComplete] = React.useState<boolean | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  
  const [displayedInsights, setDisplayedInsights] = React.useState<UiInsight[]>([]);

  React.useEffect(() => {
    setIsMounted(true);
    setDisplayedInsights([sampleLLMInsightInitial, sampleOfflineInsightInitial]); 

    const checkOnboarding = async () => {
      const storeState = await mindframeStore.get();
      setOnboardingComplete(storeState.profile?.onboardingCompleted || false);
    };
    checkOnboarding();
  }, []);

  const handleDismissInsight = (id: string) => {
    setDisplayedInsights(prev => prev.filter(insight => insight.id !== id));
    console.log('Dismissed Insight on HomePage:', id);
  };

  const handleAcceptChallengeHome = (id: string, hcId?: string) => {
    setDisplayedInsights(prev => prev.map(insight => 
      insight.id === id 
        ? { ...insight, challengePrompt: `Challenge accepted! Keep this in mind: "${insight.challengePrompt}"` } 
        : insight
    ));
    console.log('Challenge Accepted on HomePage:', id, hcId);
  };


  if (!isMounted || onboardingComplete === null) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background">
        <Sparkles className="h-16 w-16 text-primary animate-pulse mb-4" />
        <p className="text-lg text-muted-foreground">Loading {APP_NAME}...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 animate-slideInUp">
      <Card className="mb-10 shadow-apple-xl rounded-3xl overflow-hidden border-primary/10 glassmorphic">
        <CardHeader className="p-8 md:p-12 bg-gradient-to-br from-primary/80 via-primary/70 to-blue-400/70 text-primary-foreground">
           <div className="flex items-center gap-4 mb-3">
            <Image src="/logo.svg" alt={`${APP_NAME} Logo`} width={64} height={64} className="bg-white/30 p-2 rounded-full shadow-lg" data-ai-hint="app logo"/>
            <CardTitle className="text-4xl md:text-5xl font-extrabold tracking-tight">{APP_NAME}</CardTitle>
           </div>
          <CardDescription className="text-xl md:text-2xl text-blue-100 font-light">
            Your personal guide to sharper thinking, clearer understanding, and enhanced decision-making.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 md:p-12">
          <p className="mb-4 text-lg text-foreground/90 leading-relaxed">
            This application helps you identify potential cognitive biases, provides
            tools and exercises to improve your cognitive abilities, and supports your journey towards more effective thinking.
          </p>
          <p className="text-lg text-foreground/90 leading-relaxed">
            {onboardingComplete 
              ? "Explore the HC Gym to practice specific skills, or visit your profile to track your progress."
              : "Complete our quick onboarding process to personalize your experience and unlock all features."
            }
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 p-8 md:p-12 bg-muted/30 border-t border-primary/10">
          {!onboardingComplete && (
            <Link href="/onboarding" passHref>
              <Button size="lg" className="btn-apple-accent text-lg py-3.5 px-8 rounded-xl shadow-apple-lg transform hover:scale-105">
                Start Onboarding <UserCheck className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          )}
          <Link href="/hc-gym" passHref>
            <Button size="lg" variant="outline" className="btn-apple-outline text-lg py-3.5 px-8 rounded-xl shadow-apple-lg border-primary text-primary hover:bg-primary/10 hover:text-primary hover:border-primary transform hover:scale-105">
              Explore HC Gym <Brain className="ml-2 h-6 w-6" />
            </Button>
          </Link>
           {onboardingComplete && (
            <Link href="/profile" passHref>
              <Button size="lg" variant="ghost" className="btn-apple-ghost text-lg py-3.5 px-8 rounded-xl text-primary hover:bg-primary/10 hover:text-primary transform hover:scale-105">
                View My Profile <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>

      {displayedInsights.length > 0 && (
        <div className="my-16">
          <h2 className="text-3xl font-semibold mb-8 text-foreground text-center">Example Insights</h2>
          <div className="grid md:grid-cols-2 gap-8">
              {displayedInsights.map(insight => (
                <InsightCard 
                    key={insight.id}
                    insight={insight} 
                    onDismiss={handleDismissInsight}
                    onChallengeAccepted={handleAcceptChallengeHome}
                />
              ))}
          </div>
        </div>
      )}
      {isMounted && displayedInsights.length === 0 && onboardingComplete && (
         <Card className="my-16 text-center p-8 md:p-12 shadow-apple-lg rounded-2xl bg-card glassmorphic">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl text-muted-foreground">No Sample Insights</CardTitle>
            <CardDescription className="text-md text-muted-foreground mt-2">You've dismissed all sample insights. Explore the app!</CardDescription>
         </Card>
      )}


      <div className="grid md:grid-cols-2 gap-8 mt-20">
        <Card className="shadow-apple-lg hover:shadow-apple-xl transition-shadow duration-300 rounded-2xl overflow-hidden glassmorphic">
          <CardHeader className="bg-secondary/20 p-6">
            <CardTitle className="flex items-center text-xl text-primary">
              <BookOpen className="mr-3 h-7 w-7" />
              Learn & Grow
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">Visit the HC Gym to access detailed explanations of various Heuristic & Cognitive skills and practice with interactive MCQ drills.</p>
          </CardContent>
          <CardFooter className="bg-muted/20 p-6 border-t">
            <Link href="/hc-gym" passHref>
              <Button variant="link" className="text-primary font-semibold group">
                Go to HC Gym 
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-apple-lg hover:shadow-apple-xl transition-shadow duration-300 rounded-2xl overflow-hidden glassmorphic">
          <CardHeader className="bg-secondary/20 p-6">
            <CardTitle className="flex items-center text-xl text-accent">
             <Sparkles className="mr-3 h-7 w-7" />
              Proactive Co-Pilot
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">Our AI-powered analysis helps you spot potential biases as you browse. Use challenge prompts to think differently and expand your perspectives.</p>
          </CardContent>
           <CardFooter className="bg-muted/20 p-6 border-t">
            <Button variant="link" className="text-accent font-semibold cursor-default group">
                Stay Curious & Aware
                <ExternalLink className="ml-1.5 h-4 w-4 opacity-70 group-hover:opacity-100" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
