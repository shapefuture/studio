
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InsightCard } from '@/components/insight-card';
import type { Insight } from '@/types';
import { ArrowRight, BookOpen, Brain } from 'lucide-react';
import React from 'react';

const sampleInsight: Insight = {
  id: 'sample1',
  biasType: 'Confirmation Bias',
  textExcerpt: "Everyone I know agrees that this new policy is fantastic, so it must be the right decision for the company.",
  challengePrompt: "Could there be perspectives you haven't encountered? What might someone who disagrees with this policy say, and what could be their reasons?",
  hcId: 'bias-detection',
  timestamp: Date.now(),
};

export default function HomePage() {
  const [onboardingComplete, setOnboardingComplete] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('cognitiveProfile');
      if (profile) {
        try {
          const parsedProfile = JSON.parse(profile);
          setOnboardingComplete(parsedProfile.onboardingCompleted || false);
        } catch (e) {
          console.error("Failed to parse profile from localStorage", e);
        }
      }
    }
  }, []);


  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-primary">Welcome to Your Local Cognitive Coach!</CardTitle>
          <CardDescription className="text-lg">
            Sharpen your thinking, understand biases, and enhance your decision-making skills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This application helps you identify potential cognitive biases in text and provides
            tools and exercises to improve your cognitive abilities.
          </p>
          <p>
            Navigate through the HC Gym to practice specific skills, or complete the onboarding
            to personalize your experience.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          {!onboardingComplete && (
            <Link href="/onboarding" passHref>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Start Onboarding <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
          <Link href="/hc-gym" passHref>
            <Button size="lg" variant="outline">
              Explore HC Gym <Brain className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <div className="my-10">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Example Insight</h2>
        <InsightCard insight={sampleInsight} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-6 w-6 text-primary" />
              Learn & Grow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Visit the HC Gym to access detailed explanations of various HCs (Heuristic & Cognitive skills) and practice with interactive drills.</p>
          </CardContent>
          <CardFooter>
            <Link href="/hc-gym" passHref>
              <Button variant="link" className="text-primary">Go to HC Gym <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
             <Brain className="mr-2 h-6 w-6 text-accent" />
              Challenge Yourself
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Our AI-powered analysis helps you spot potential biases. Use the challenge prompts to think differently and expand your perspectives.</p>
          </CardContent>
           <CardFooter>
            {/* This could link to a page explaining insights if one existed */}
            <Button variant="link" className="text-accent cursor-default">Stay Curious</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
