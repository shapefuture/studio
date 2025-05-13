"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CognitiveProfileV1, GamificationData, Quest as QuestType, MindframeStoreState } from '@/types';
import { DEFAULT_COGNITIVE_PROFILE, DEFAULT_GAMIFICATION_DATA, INTERESTS_OPTIONS, APP_NAME } from '@/lib/constants';
import { hcLibraryData } from '@/assets/data/hcLibraryData';
import { sjtScenariosData } from '@/assets/data/sjtScenariosData';
import { onboardingGoalOptions } from '@/assets/data/onboardingGoals';
import { starterQuestsData } from '@/assets/data/starterQuestsData';
import { mindframeStore } from '@/lib/MindframeStore';
import { gamificationService } from '@/lib/gamificationService';
import { User, Zap, Trophy, BarChart3, Edit3, ShieldQuestion, BookOpen, Lightbulb, CheckSquare } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const [storeState, setStoreState] = useState<MindframeStoreState | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const loadData = async () => {
      const currentStoreState = await mindframeStore.get();
      if (!currentStoreState.profile || !currentStoreState.profile.onboardingCompleted) {
        router.push('/onboarding');
      } else {
        setStoreState(currentStoreState);
      }
    };
    loadData();
  }, [router]);

  const profile = storeState?.profile || DEFAULT_COGNITIVE_PROFILE;
  const gamification = storeState?.gamification || DEFAULT_GAMIFICATION_DATA;
  
  const activeQuests = storeState?.activeQuests || [];
  const completedQuestIds = storeState?.completedQuestIds || [];

  const allQuestsForDisplay = React.useMemo(() => {
    if (!storeState) return [];
    
    const displayedQuestsMap = new Map<string, QuestType>();

    // Add active quests
    activeQuests.forEach(quest => displayedQuestsMap.set(quest.id, quest));

    // Add completed quests, ensuring details are fetched
    completedQuestIds.forEach(id => {
      if (!displayedQuestsMap.has(id)) {
        // Try to find in active quests first (it might have just been completed)
        let questDetail = activeQuests.find(q => q.id === id);
        if (!questDetail) {
          // If not in active (e.g. completed in a previous session), find in starter data
          questDetail = starterQuestsData.find(q => q.id === id);
        }
        if (questDetail) {
          displayedQuestsMap.set(id, { ...questDetail, isCompleted: true });
        }
      } else {
        // If already in map (was active), mark as completed for display
        const existingQuest = displayedQuestsMap.get(id);
        if (existingQuest) {
            displayedQuestsMap.set(id, { ...existingQuest, isCompleted: true });
        }
      }
    });
    return Array.from(displayedQuestsMap.values());
  }, [storeState, activeQuests, completedQuestIds]);


  const getInterestLabel = (id: string) => INTERESTS_OPTIONS.find(opt => opt.id === id)?.label || id;
  const getSJTScenarioText = (id: string) => sjtScenariosData.find(s => s.id === id)?.scenarioText || "Unknown Scenario";
  const getSJTAnswerText = (scenarioId: string, optionId: string) => 
    sjtScenariosData.find(s => s.id === scenarioId)?.options.find(opt => opt.id === optionId)?.text || "Unknown Answer";
  const getGoalLabel = (id?: string) => onboardingGoalOptions.find(opt => opt.id === id)?.label || "Not Set";

  if (!isMounted || !storeState || !profile.onboardingCompleted) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Lightbulb className="h-16 w-16 text-primary animate-pulse mb-4" />
        <p className="text-lg text-muted-foreground">Loading your Cognitive Profile...</p>
        <Progress value={50} className="w-1/3 mt-4" />
      </div>
    );
  }

  const wxpForNextLevel = gamificationService.getWXPForNextLevel(gamification.level);
  const progressToNextLevel = wxpForNextLevel === Infinity ? 100 : (gamification.wxp / wxpForNextLevel) * 100;
  
  // Calculate WXP earned within the current level
  const previousLevelThreshold = WXP_THRESHOLDS[gamification.level -1] || 0;
  const currentLevelWXPProgress = gamification.wxp - (WXP_THRESHOLDS[gamification.level] || 0);
  const wxpNeededForNextLevelInCurrent = (WXP_THRESHOLDS[gamification.level + 1] || Infinity) - (WXP_THRESHOLDS[gamification.level] || 0);


  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 shadow-xl overflow-hidden rounded-xl">
        <div className="relative h-56 bg-gradient-to-br from-primary via-blue-400 to-blue-500">
          <Image 
            src={`https://picsum.photos/seed/${profile.interests.join('') || 'profileBg'}/1200/300`} 
            alt="Abstract profile background" 
            fill={true}
            style={{objectFit:"cover"}}
            className="opacity-70"
            data-ai-hint="abstract pattern"
            priority
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-6">
            <div className="flex items-center">
              <User className="h-20 w-20 text-white rounded-full bg-primary/60 p-4 border-2 border-white shadow-lg" />
              <div className="ml-5">
                <CardTitle className="text-4xl font-bold text-white tracking-tight">Your Profile</CardTitle>
                <CardDescription className="text-blue-100 text-lg mt-1">Your cognitive journey with {APP_NAME}.</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 text-white border-white/50" onClick={() => router.push('/onboarding')}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <section className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center text-primary"><BarChart3 className="mr-2 h-5 w-5"/>Interests & Goals</h3>
                <p className="text-sm"><strong>Primary Goal:</strong> <Badge variant="secondary" className="text-md">{getGoalLabel(profile.userGoal)}</Badge></p>
                <div className="mt-2">
                  <h4 className="font-medium text-sm">Selected Interests:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.interests.map(interestId => (
                      <Badge key={interestId} variant="outline" className="font-normal">{getInterestLabel(interestId)}</Badge>
                    ))}
                    {profile.interests.length === 0 && <p className="text-xs text-muted-foreground">No interests selected.</p>}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3 mt-6 flex items-center text-primary"><ShieldQuestion className="mr-2 h-5 w-5"/>Situational Judgement Insights</h3>
                <div className="space-y-2 text-sm">
                  {profile.sjtAnswers.map(answer => (
                    <div key={answer.scenarioId} className="p-3 border rounded-md bg-secondary/30">
                      <p className="font-medium text-foreground text-xs">{getSJTScenarioText(answer.scenarioId)}</p>
                      <p className="text-muted-foreground text-xs mt-1">Your Answer: {getSJTAnswerText(answer.scenarioId, answer.selectedOptionId)}</p>
                    </div>
                  ))}
                  {profile.sjtAnswers.length === 0 && <p className="text-xs text-muted-foreground">No SJT answers recorded.</p>}
                   {profile.potentialBiasesIdentified && profile.potentialBiasesIdentified.length > 0 && (
                    <div className="mt-2 p-3 border border-amber-500 bg-amber-50 rounded-md">
                        <h5 className="text-xs font-semibold text-amber-700">Potential Biases to Explore:</h5>
                        <ul className="list-disc list-inside text-xs text-amber-600 ml-4">
                        {profile.potentialBiasesIdentified.map((bias, idx) => <li key={idx}>{bias}</li>)}
                        </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <aside className="md:col-span-1 space-y-6">
              <Card className="bg-secondary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center text-primary"><BookOpen className="mr-2 h-5 w-5"/>HC Familiarity</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  {hcLibraryData.map(hc => (
                    <div key={hc.id} className="flex justify-between items-center">
                      <span>{hc.name} <span className="text-xs font-mono">({hc.tag})</span>:</span>
                      <Badge variant="outline" className="font-semibold">{profile.hcFamiliarity[hc.id] || 0}/5</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </aside>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl rounded-xl">
        <CardHeader className="bg-accent/10 rounded-t-xl">
          <CardTitle className="text-2xl flex items-center text-accent-foreground">
            <Trophy className="mr-3 h-7 w-7 text-accent" /> Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-6 p-6">
          <div>
            <h4 className="font-semibold text-lg">Level: <Badge className="text-xl px-3 py-1 bg-accent text-accent-foreground">{gamification.level}</Badge></h4>
            <p className="text-sm text-muted-foreground mt-1">Experience Points (WXP): {gamification.wxp}</p>
            <Progress value={progressToNextLevel} className="mt-2 h-3 [&>div]:bg-accent" />
             <p className="text-xs text-muted-foreground text-right mt-1">
              {wxpForNextLevel === Infinity 
                ? "Max Level Reached!" 
                : `${currentLevelWXPProgress} / ${wxpNeededForNextLevelInCurrent} WXP to Level ${gamification.level + 1}`}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Completed Drills:</h4>
            {gamification.completedDrillIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {gamification.completedDrillIds.slice(0,10).map(id => ( 
                  <Badge key={id} variant="secondary" className="font-normal bg-green-100 text-green-700 border-green-300">Drill {id.substring(0,15)}...</Badge>
                ))}
                 {gamification.completedDrillIds.length > 10 && <Badge variant="outline">...and {gamification.completedDrillIds.length - 10} more</Badge>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No drills completed yet. Time to hit the Gym!</p>
            )}
          </div>
          <div className="md:col-span-2">
            <h4 className="font-semibold text-lg mb-2">Quests:</h4>
            {allQuestsForDisplay.length > 0 ? (
              <ul className="space-y-2">
                {allQuestsForDisplay.map((quest) => (
                  <li key={quest.id} className={`p-3 border rounded-md text-sm ${quest.isCompleted || completedQuestIds.includes(quest.id) ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${quest.isCompleted || completedQuestIds.includes(quest.id) ? 'text-green-700' : 'text-blue-700'}`}>{quest.title}</span>
                      {quest.isCompleted || completedQuestIds.includes(quest.id) ? 
                        <Badge variant="default" className="bg-green-500 text-white"><CheckSquare className="mr-1 h-4 w-4"/>Completed</Badge> :
                        <Badge variant="outline" className="border-blue-500 text-blue-600">Active</Badge>
                      }
                    </div>
                    <p className={`text-xs mt-1 ${quest.isCompleted || completedQuestIds.includes(quest.id) ? 'text-green-600' : 'text-blue-600'}`}>{quest.description} (Reward: {quest.rewardWXP} WXP)</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No active quests. New challenges await in the HC Gym!</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-6 bg-muted/20 rounded-b-xl border-t">
            <Link href="/hc-gym" passHref>
                <Button className="bg-accent hover:bg-accent/80 text-accent-foreground shadow-md">
                    <Zap className="mr-2 h-5 w-5"/>Continue Learning in HC Gym
                </Button>
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
