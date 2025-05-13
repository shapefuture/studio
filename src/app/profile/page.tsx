
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CognitiveProfileV1, GamificationData } from '@/types';
import { HCS, INTERESTS_OPTIONS, SJT_QUESTIONS, DEFAULT_COGNITIVE_PROFILE, DEFAULT_GAMIFICATION_DATA } from '@/lib/constants';
import { User, Zap, Trophy, BarChart3, Edit3, ShieldQuestion } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CognitiveProfileV1>(DEFAULT_COGNITIVE_PROFILE);
  const [gamification, setGamification] = useState<GamificationData>(DEFAULT_GAMIFICATION_DATA);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedProfile = localStorage.getItem('cognitiveProfile');
    const storedGamification = localStorage.getItem('gamificationData');

    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile) as CognitiveProfileV1;
        if (!parsedProfile.onboardingCompleted) {
          router.push('/onboarding');
        } else {
          setProfile(parsedProfile);
        }
      } catch (e) {
        console.error("Error loading profile", e);
        router.push('/onboarding'); // Corrupted profile, redirect to onboarding
      }
    } else {
      router.push('/onboarding'); // No profile, redirect to onboarding
    }

    if (storedGamification) {
      try {
        setGamification(JSON.parse(storedGamification));
      } catch (e) {
        console.error("Error loading gamification data", e);
         // Use default if corrupted
        localStorage.setItem('gamificationData', JSON.stringify(DEFAULT_GAMIFICATION_DATA));
      }
    } else {
      // Initialize if not present
      localStorage.setItem('gamificationData', JSON.stringify(DEFAULT_GAMIFICATION_DATA));
    }
  }, [router]);

  const getInterestLabel = (id: string) => INTERESTS_OPTIONS.find(opt => opt.id === id)?.label || id;
  
  const getSJTQuestionText = (id: string) => SJT_QUESTIONS.find(q => q.id === id)?.text || "Unknown Question";
  const getSJTAnswerText = (qid: string, aid: string) => SJT_QUESTIONS.find(q => q.id === qid)?.options.find(opt => opt.id === aid)?.text || "Unknown Answer";


  if (!isMounted || !profile.onboardingCompleted) {
    // Show loading or a redirecting message, or rely on AppShell to handle visibility
    return <div className="flex justify-center items-center h-screen"><Progress value={50} className="w-1/2" /> <p className="ml-2">Loading profile...</p></div>;
  }

  const wxpToNextLevel = (currentLevel: number) => Math.pow(currentLevel + 1, 2) * 100; // Example formula
  const progressToNextLevel = (gamification.wxp / wxpToNextLevel(gamification.level)) * 100;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 shadow-xl overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary to-blue-400">
          <Image src="https://picsum.photos/seed/profilebg/1200/200" alt="Profile background" layout="fill" objectFit="cover" data-ai-hint="abstract background"/>
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6">
             <div className="flex items-center">
                <User className="h-16 w-16 text-white rounded-full bg-primary/50 p-3 border-2 border-white" />
                <div className="ml-4">
                    <CardTitle className="text-3xl text-white">Your Cognitive Profile</CardTitle>
                    <CardDescription className="text-blue-100">Overview of your skills and progress.</CardDescription>
                </div>
             </div>
          </div>
        </div>
        <CardContent className="p-6">
          <Button variant="outline" size="sm" className="float-right" onClick={() => router.push('/onboarding')}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            
            <section>
              <h3 className="text-xl font-semibold mb-3 flex items-center text-primary"><BarChart3 className="mr-2"/>Interests & Familiarity</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Selected Interests:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.interests.map(interestId => (
                      <Badge key={interestId} variant="secondary">{getInterestLabel(interestId)}</Badge>
                    ))}
                    {profile.interests.length === 0 && <p className="text-sm text-muted-foreground">No interests selected.</p>}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mt-4">HC Familiarity:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {HCS.map(hc => (
                      <li key={hc.id}>
                        {hc.name} ({hc.tag}): <Badge variant="outline">{profile.hcFamiliarity[hc.id] || 0}/5</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3 flex items-center text-primary"><ShieldQuestion className="mr-2"/>Situational Judgement Summary</h3>
              <div className="space-y-3 text-sm">
                {profile.sjtAnswers.map(answer => (
                  <div key={answer.questionId} className="p-3 border rounded-md bg-secondary/30">
                    <p className="font-medium text-foreground">{getSJTQuestionText(answer.questionId)}</p>
                    <p className="text-muted-foreground">Your Answer: {getSJTAnswerText(answer.questionId, answer.answer)}</p>
                  </div>
                ))}
                 {profile.sjtAnswers.length === 0 && <p className="text-sm text-muted-foreground">No SJT answers recorded.</p>}
              </div>
            </section>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center text-accent">
            <Trophy className="mr-3 h-7 w-7" /> Gamification Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-lg">Level: <Badge className="text-lg bg-accent text-accent-foreground">{gamification.level}</Badge></h4>
            <p className="text-sm text-muted-foreground mt-1">Experience Points (WXP): {gamification.wxp}</p>
            <Progress value={progressToNextLevel} className="mt-2 h-3 [&>div]:bg-accent" />
            <p className="text-xs text-muted-foreground text-right mt-1">{gamification.wxp} / {wxpToNextLevel(gamification.level)} WXP to Level {gamification.level + 1}</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Completed Challenges:</h4>
            {gamification.completedChallenges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {gamification.completedChallenges.map(id => (
                  <Badge key={id} variant="secondary" className="bg-green-100 text-green-700 border-green-300">Challenge {id}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No challenges completed yet. Keep learning!</p>
            )}
          </div>
           {/* <div>
            <h4 className="font-semibold text-lg mt-4 mb-2">Active Quests:</h4>
            {gamification.activeQuests.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {gamification.activeQuests.map(questId => <li key={questId}>Quest: {questId}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No active quests. New quests will appear as you progress.</p>
            )}
          </div> */}
        </CardContent>
        <CardFooter>
            <Link href="/hc-gym" passHref>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Zap className="mr-2 h-4 w-4"/>Continue Learning in HC Gym
                </Button>
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
