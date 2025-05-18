
// Stub for ProfileView.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MindframeStore } from '@core_logic/MindframeStore.js';
import { GamificationService } from '@core_logic/gamificationService.js';
import type { MindframeStoreState, Quest, CompletedChallengeLogEntry } from '@core_logic/types';
import { starterQuestsData } from '@assets/data/starter_quests_data'; // To get quest details
import { hcLibraryData } from '@assets/data/hc_library_data'; // To get HC names

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

  if (isLoading || !userData || !userData.userProfile) {
    return <div className="p-4 text-center">Loading profile...</div>;
  }

  const { userProfile, gamificationData, activeQuestIds, completedChallengeLog } = userData;

  const currentLevel = gamificationData.level;
  const currentWXP = gamificationData.wxp;
  const wxpForNext = GamificationService.getWXPForNextLevel(currentWXP);
  const wxpThresholdForCurrentLevel = GamificationService.WXP_THRESHOLDS[currentLevel -1] || 0;
  const wxpThresholdForNextLevel = GamificationService.WXP_THRESHOLDS[currentLevel] || currentWXP + wxpForNext; // WXP needed TO REACH currentLevel + 1
  
  const progressPercentage = wxpThresholdForNextLevel > wxpThresholdForCurrentLevel ?
    ((currentWXP - wxpThresholdForCurrentLevel) / (wxpThresholdForNextLevel - wxpThresholdForCurrentLevel)) * 100
    : (wxpForNext === 0 ? 100 : 0);


  const getActiveQuestsDetails = (): Quest[] => {
    return activeQuestIds
      .map(id => starterQuestsData.find(q => q.id === id))
      .filter(q => q !== undefined) as Quest[];
  };

  const activeQuestsDetails = getActiveQuestsDetails();

  const getHcName = (hcId: string | null): string => {
    if (!hcId) return "General";
    return hcLibraryData.find(hc => hc.id === hcId)?.name || hcId;
  };
  
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };


  return (
    <div className="p-4 space-y-4 max-h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-primary">Your Mindframe Profile</h1>
        <Link to="/gym" className="text-sm text-primary-foreground bg-primary px-3 py-1 rounded-md hover:bg-primary/90">
          Go to Gym
        </Link>
      </div>

      {/* User & Level Info */}
      <div className="p-4 border rounded-lg shadow-sm bg-card">
        <p className="text-xs text-muted-foreground">User ID: {userProfile.userId}</p>
        <h2 className="text-lg font-medium">Level {currentLevel}</h2>
        <p className="text-sm text-muted-foreground">{currentWXP} WXP</p>
        {wxpForNext > 0 && (
          <>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2 mb-1">
              <div className="bg-accent h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p className="text-xs text-muted-foreground">{wxpForNext} WXP to next level</p>
          </>
        )}
         {wxpForNext === 0 && <p className="text-xs text-accent mt-1">Max level reached or next threshold not defined!</p>}
      </div>

      {/* Primary Goal & Interests */}
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="font-medium mb-1">Focus Areas</h3>
        <p className="text-sm"><strong>Goal:</strong> {userProfile.primaryGoal}</p>
        <p className="text-sm"><strong>Interests:</strong> {userProfile.interests.join(', ')}</p>
      </div>

      {/* Active Quests */}
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="font-medium mb-2">Active Quests</h3>
        {activeQuestsDetails.length > 0 ? (
          <ul className="space-y-2">
            {activeQuestsDetails.map(quest => (
              <li key={quest.id} className="p-2 border rounded bg-secondary/50">
                <p className="font-semibold text-sm">{quest.title} <span className="text-xs text-accent">({quest.rewardWXP} WXP)</span></p>
                <p className="text-xs text-muted-foreground">{quest.description}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-foreground">No active quests. Explore the Gym!</p>}
      </div>
      
      {/* Recent Challenges */}
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="font-medium mb-2">Recent Challenge Log (Last 3)</h3>
        {completedChallengeLog && completedChallengeLog.length > 0 ? (
           <ul className="space-y-2">
            {completedChallengeLog.slice(0,3).map((entry, index) => (
              <li key={index} className="p-2 border rounded text-xs bg-secondary/50">
                <p><strong>{entry.challengeText}</strong></p>
                <p>HC: {getHcName(entry.hcRelated)} | +{entry.wxpEarned} WXP</p>
                <p className="text-muted-foreground/70">{formatTimeAgo(entry.timestamp)}</p>
              </li>
            ))}
           </ul>
        ) : <p className="text-sm text-muted-foreground">No challenges completed yet.</p>}
      </div>

    </div>
  );
};

export default ProfileView;
