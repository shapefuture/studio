
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InsightCard } from '@/components/insight-card';
import type { UiInsight } from '@/types';
import { ArrowRight, BookOpen, Brain, Sparkles, UserCheck } from 'lucide-react';
import React from 'react';
import { mindframeStore } from '@/lib/MindframeStore';
import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';


const sampleLLMInsight: UiInsight = {
  id: 'llm_sample_01',
  title: 'Potential Bias: Confirmation Bias',
  sourceType: 'llm',
  hcId: 'bias-detection', // Matches one of the HC IDs from hcLibraryData
  explanation: "The analyzed text appears to heavily favor sources that confirm a pre-existing viewpoint on Topic Y, while alternative perspectives are downplayed or omitted. This pattern is often indicative of confirmation bias.",
  challengePrompt: "What are two potential weaknesses or counter-arguments to the main point made in the text, even if you generally agree with it?",
  timestamp: Date.now(),
};

const sampleOfflineInsight: UiInsight = {
  id: 'offline_tip_01',
  title: 'Quick Tip: The Five Whys',
  sourceType: 'offline',
  hcId: 'critique', // Matches one of the HC IDs
  explanation: "When facing a problem or a strong assertion, try asking 'Why?' five times to drill down to the root cause or underlying assumptions. This can reveal deeper insights.",
  timestamp: Date.now(),
};


export default function HomePage() {
  const [onboardingComplete, setOnboardingComplete] = React.useState<boolean | null>(null); // null for loading state
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const checkOnboarding = async () => {
      const storeState = await mindframeStore.get();
      setOnboardingComplete(storeState.profile?.onboardingCompleted || false);
    };
    checkOnboarding();
  }, []);


  if (!isMounted || onboardingComplete === null) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Sparkles className="h-16 w-16 text-primary animate-pulse mb-4" />
        <p className="text-lg text-muted-foreground">Loading {APP_NAME}...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-10 shadow-2xl rounded-xl overflow-hidden border-primary/20">
        <CardHeader className="p-8 bg-gradient-to-br from-primary via-blue-400 to-blue-500 text-primary-foreground">
           <div className="flex items-center gap-4 mb-3">
            <Image src="/logo.svg" alt={`${APP_NAME} Logo`} width={64} height={64} className="bg-white/30 p-2 rounded-full shadow-lg" data-ai-hint="app logo"/>
            <CardTitle className="text-4xl md:text-5xl font-extrabold tracking-tight">{APP_NAME}</CardTitle>
           </div>
          <CardDescription className="text-xl md:text-2xl text-blue-100 font-light">
            Your personal guide to sharper thinking, clearer understanding, and enhanced decision-making.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <p className="mb-4 text-lg text-foreground leading-relaxed">
            This application helps you identify potential cognitive biases, provides
            tools and exercises to improve your cognitive abilities, and supports your journey towards more effective thinking.
          </p>
          <p className="text-lg text-foreground leading-relaxed">
            {onboardingComplete 
              ? "Explore the HC Gym to practice specific skills, or visit your profile to track your progress."
              : "Complete our quick onboarding process to personalize your experience and unlock all features."
            }
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 p-8 bg-muted/30 border-t">
          {!onboardingComplete && (
            <Link href="/onboarding" passHref>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                Start Onboarding <UserCheck className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          )}
          <Link href="/hc-gym" passHref>
            <Button size="lg" variant="outline" className="text-lg py-3 px-8 rounded-lg border-primary text-primary hover:bg-primary/10 hover:text-primary shadow-sm hover:shadow-md transition-all duration-300">
              Explore HC Gym <Brain className="ml-2 h-6 w-6" />
            </Button>
          </Link>
           {onboardingComplete && (
            <Link href="/profile" passHref>
              <Button size="lg" variant="ghost" className="text-lg py-3 px-8 rounded-lg text-primary hover:bg-primary/10 hover:text-primary">
                View My Profile <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>

      <div className="my-12">
        <h2 className="text-3xl font-semibold mb-6 text-foreground text-center">Example Insights</h2>
        <div className="grid md:grid-cols-2 gap-8">
            <InsightCard 
                insight={sampleLLMInsight} 
                onDismiss={(id) => console.log('Dismissed LLM Insight:', id)}
                onChallengeAccepted={(id, hcId) => console.log('LLM Challenge Accepted:', id, hcId)}
            />
            <InsightCard 
                insight={sampleOfflineInsight}
                onDismiss={(id) => console.log('Dismissed Offline Insight:', id)}
            />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-16">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
          <CardHeader className="bg-secondary/20">
            <CardTitle className="flex items-center text-xl">
              <BookOpen className="mr-3 h-7 w-7 text-primary" />
              Learn & Grow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Visit the HC Gym to access detailed explanations of various Heuristic & Cognitive skills and practice with interactive MCQ drills.</p>
          </CardContent>
          <CardFooter className="bg-muted/20">
            <Link href="/hc-gym" passHref>
              <Button variant="link" className="text-primary font-semibold hover:underline">Go to HC Gym <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
          <CardHeader className="bg-secondary/20">
            <CardTitle className="flex items-center text-xl">
             <Sparkles className="mr-3 h-7 w-7 text-accent" />
              Challenge Yourself
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Our AI-powered analysis (coming soon) helps you spot potential biases. Use challenge prompts to think differently and expand your perspectives.</p>
          </CardContent>
           <CardFooter className="bg-muted/20">
            <Button variant="link" className="text-accent font-semibold cursor-default">Stay Curious & Aware</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
