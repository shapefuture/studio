
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MindframeStore } from '@core_logic/MindframeStore.js';
import { GamificationService } from '@core_logic/gamificationService.js';
import type { MindframeStoreState, Quest, CompletedChallengeLogEntry, HCData, CognitiveProfileV1 } from '@core_logic/types';
import { starterQuestsData } from '@assets/data/starter_quests_data';
import { hcLibraryData } from '@assets/data/hc_library_data';
import { User, Zap, Trophy, BarChart3, Edit3, ShieldQuestion, BookOpen, Lightbulb, CheckSquare, Activity, Target } from 'lucide-react';

const ProfileView: React.FC = () => {
  const [userData, setUserData] = useState<MindframeStoreState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const state = await MindframeStore.get();
        setUserData(state);
      } catch (error) {
        console.error("Error fetching user data for profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center h-full flex flex-col justify-center items-center bg-background">
        <Lightbulb className="h-12 w-12 text-primary animate-pulse mb-3" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }
  
  if (!userData || !userData.userProfile) {
      return (
          <div className="p-4 text-center h-full flex flex-col justify-center items-center bg-background">
             <User className="h-12 w-12 text-destructive mb-3" />
             <p className="text-destructive-foreground mb-4">Profile not found or onboarding not completed.</p>
             <Link to="/onboarding">
                <button className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90">
                    Start Onboarding
                </button>
             </Link>
          </div>
      )
  }


  const { userProfile, gamificationData, activeQuestIds, completedChallengeLog } = userData;

  const currentLevel = gamificationData.level;
  const currentWXP = gamificationData.wxp;
  
  const wxpThresholdForCurrentLevel = GamificationService.WXP_THRESHOLDS[currentLevel -1] || 0;
  const wxpThresholdForNextLevel = GamificationService.WXP_THRESHOLDS[currentLevel] || (currentWXP + (GamificationService.getWXPForNextLevel(currentWXP) || 100) ); // WXP needed TO REACH currentLevel + 1
  
  const progressPercentageWithinLevel = wxpThresholdForNextLevel > wxpThresholdForCurrentLevel ?
    Math.max(0, Math.min(100, ((currentWXP - wxpThresholdForCurrentLevel) / (wxpThresholdForNextLevel - wxpThresholdForCurrentLevel)) * 100))
    : 100; // Max level or next threshold not defined

  const wxpRemainingForNextLevel = Math.max(0, wxpThresholdForNextLevel - currentWXP);


  const getActiveQuestsDetails = (): Quest[] => {
    return activeQuestIds
      .map(id => starterQuestsData.find(q => q.id === id))
      .filter(q => q !== undefined) as Quest[];
  };
  const activeQuestsDetails = getActiveQuestsDetails();

  const getHcName = (hcId: string | null): string => {
    if (!hcId) return "General";
    const hc = hcLibraryData.find(hc => hc.id === hcId);
    return hc ? hc.name : hcId;
  };
  
  const getHcIcon = (hcId: string | null): React.ReactNode => {
    if (!hcId) return <Activity className="w-4 h-4 inline mr-1 text-muted-foreground"/>;
    const hc = hcLibraryData.find(hc => hc.id === hcId);
    if (hc && typeof hc.icon !== 'string') {
        const IconComp = hc.icon;
        return <IconComp className="w-4 h-4 inline mr-1 text-primary"/>;
    }
    return hc?.icon || <Lightbulb className="w-4 h-4 inline mr-1 text-primary"/>;
  }


  return (
    <div className="p-3 space-y-4 max-h-full overflow-y-auto bg-background text-foreground scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-muted/50">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-primary flex items-center">
            <User className="w-6 h-6 mr-2"/> Your Mindframe Profile
        </h1>
        <Link to="/gym" className="text-sm text-primary-foreground bg-primary px-3 py-1.5 rounded-md hover:bg-primary/90 shadow-sm">
          Go to Gym
        </Link>
      </div>

      {/* User & Level Info */}
      <div className="p-4 border rounded-lg shadow-sm bg-card">
        <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold mr-3">
                {currentLevel}
            </div>
            <div>
                <h2 className="text-lg font-medium">Level {currentLevel}</h2>
                <p className="text-sm text-muted-foreground">{currentWXP} WXP</p>
            </div>
        </div>
        {wxpRemainingForNextLevel > 0 && wxpThresholdForNextLevel > wxpThresholdForCurrentLevel && (
          <>
            <div className="w-full bg-muted rounded-full h-2 my-1.5">
              <div className="bg-accent h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentageWithinLevel}%` }}></div>
            </div>
            <p className="text-xs text-muted-foreground text-right">{wxpRemainingForNextLevel} WXP to next level</p>
          </>
        )}
         {wxpRemainingForNextLevel === 0 && <p className="text-xs text-accent mt-1">Max level reached or next threshold not defined!</p>}
      </div>

      {/* Primary Goal & Interests */}
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="font-medium mb-2 text-foreground flex items-center"><Target className="w-5 h-5 mr-2 text-primary"/>Focus Areas</h3>
        <p className="text-sm mb-1"><strong>Goal:</strong> <span className="font-normal text-muted-foreground">{userProfile.primaryGoal}</span></p>
        <div className="text-sm"><strong>Interests:</strong>
            {userProfile.interests.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {userProfile.interests.map(interest => (
                        <span key={interest} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{interest}</span>
                    ))}
                </div>
            ) : <span className="font-normal text-muted-foreground ml-1">None specified</span>}
        </div>
      </div>

      {/* Active Quests */}
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="font-medium mb-3 text-foreground flex items-center"><Zap className="w-5 h-5 mr-2 text-primary"/>Active Quests</h3>
        {activeQuestsDetails.length > 0 ? (
          <ul className="space-y-3">
            {activeQuestsDetails.map(quest => (
              <li key={quest.id} className="p-3 border rounded-md bg-secondary/50">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm flex items-center">{quest.icon && <span className="mr-1.5 text-base">{quest.icon}</span>}{quest.title}</span>
                    <span className="text-xs bg-accent/80 text-accent-foreground px-1.5 py-0.5 rounded">{quest.rewardWXP} WXP</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1.5">{quest.description}</p>
                {/* Optional: Show quest steps progress if available */}
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-foreground text-center py-2">No active quests. New challenges await in the Gym!</p>}
      </div>
      
      {/* Recent Challenges */}
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="font-medium mb-3 text-foreground flex items-center"><Trophy className="w-5 h-5 mr-2 text-primary"/>Recent Challenge Log</h3>
        {completedChallengeLog && completedChallengeLog.length > 0 ? (
           <ul className="space-y-2.5">
            {completedChallengeLog.slice(0,3).map((entry, index) => (
              <li key={index} className="p-2.5 border rounded-md text-xs bg-secondary/50">
                <p className="font-medium text-foreground mb-0.5 truncate" title={entry.challengeText}>{entry.challengeText}</p>
                <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center">{getHcIcon(entry.hcRelated)} {getHcName(entry.hcRelated)}</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">+{entry.wxpEarned} WXP</span>
                </div>
                <p className="text-muted-foreground/70 text-right text-[10px] mt-0.5">{formatTimeAgo(entry.timestamp)}</p>
              </li>
            ))}
           </ul>
        ) : <p className="text-sm text-muted-foreground text-center py-2">No challenges completed yet from Co-Pilot insights.</p>}
      </div>

    </div>
  );
};

export default ProfileView;
