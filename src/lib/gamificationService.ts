import { mindframeStore } from './MindframeStore';
import type { GamificationData, Quest } from '@/types';
import { starterQuestsData } from '@/assets/data/starterQuestsData';


export const WXP_THRESHOLDS: { [level: number]: number } = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 800,
  6: 1200,
  7: 1700,
  8: 2300,
  9: 3000,
  10: 4000,
  // Add more levels as needed
};

class GamificationService {
  async addWXP(points: number): Promise<{ newWXP: number; newLevel: number; leveledUp: boolean }> {
    const state = await mindframeStore.get();
    const currentGamification = state.gamification;
    
    const newWXP = (currentGamification.wxp || 0) + points;
    const oldLevel = this.getLevelFromWXP(currentGamification.wxp || 0);
    const newLevel = this.getLevelFromWXP(newWXP);
    const leveledUp = newLevel > oldLevel;

    await mindframeStore.updateGamification({ wxp: newWXP, level: newLevel });
    
    if (leveledUp) {
      // console.log(`Leveled up to ${newLevel}!`);
      // Potentially trigger other events like awarding new quests or badges
    }
    await this.checkQuestCompletion();
    return { newWXP, newLevel, leveledUp };
  }

  getLevelFromWXP(wxp: number): number {
    let calculatedLevel = 1;
    const levels = Object.keys(WXP_THRESHOLDS).map(Number).sort((a, b) => a - b);
    for (const level of levels) {
      if (wxp >= WXP_THRESHOLDS[level]) {
        calculatedLevel = level;
      } else {
        break;
      }
    }
    return calculatedLevel;
  }

  getWXPForNextLevel(currentLevel: number): number {
    const nextLevel = currentLevel + 1;
    return WXP_THRESHOLDS[nextLevel] || Infinity; // Return Infinity if max level reached
  }

  async markDrillAsCompleted(drillId: string, wxpAward?: number): Promise<void> {
    const state = await mindframeStore.get();
    const currentCompletedDrills = state.gamification.completedDrillIds || [];
    
    if (!currentCompletedDrills.includes(drillId)) {
      await mindframeStore.updateGamification({
        completedDrillIds: [...currentCompletedDrills, drillId],
      });
      if (wxpAward && wxpAward > 0) {
        await this.addWXP(wxpAward);
      }
    }
    await this.checkQuestCompletion();
  }

  async checkQuestCompletion(): Promise<void> {
    const state = await mindframeStore.get();
    const activeQuests = state.activeQuests || [];
    const completedDrillIds = state.gamification.completedDrillIds || [];

    for (const quest of activeQuests) {
      if (state.completedQuestIds.includes(quest.id)) continue; // Already completed

      let isQuestComplete = false;
      switch (quest.criteria.type) {
        case 'complete_drills':
          if (quest.criteria.count && completedDrillIds.length >= quest.criteria.count) {
            isQuestComplete = true;
          }
          break;
        case 'rate_hc_familiarity': // This is typically tied to onboarding completion
           if (state.profile?.onboardingCompleted && quest.criteria.targetValue === true) {
             isQuestComplete = true;
           }
          break;
        case 'explore_hc':
          if (quest.criteria.hcId) {
            // Check if any completed drill belongs to this HC
            const hcDrills = (await import('@/assets/data/hcDrillsData')).hcDrillsData;
            const relevantCompletedDrills = completedDrillIds.filter(drillId => 
              hcDrills.find(d => d.id === drillId && d.hcId === quest.criteria.hcId)
            );
            if (relevantCompletedDrills.length > 0) { // Simplified: 1 drill from HC completes quest
              isQuestComplete = true;
            }
          }
          break;
        // Add more quest types as needed
      }

      if (isQuestComplete) {
        await mindframeStore.completeQuest(quest.id);
        await this.addWXP(quest.rewardWXP); // Grant WXP for quest completion
        // console.log(`Quest "${quest.title}" completed! Awarded ${quest.rewardWXP} WXP.`);
      }
    }
  }

  async initializeGamificationState(): Promise<void> {
    const state = await mindframeStore.get();
    if (!state.gamification) {
        await mindframeStore.updateGamification(DEFAULT_GAMIFICATION_DATA);
    }
    if(!state.activeQuests || state.activeQuests.length === 0) {
        // Only assign if no active quests, assuming onboarding is the first time
        // Or if specific conditions met for re-assigning starter quests (e.g. after a reset)
        const onboardingQuest = starterQuestsData.find(q => q.id === 'quest_onboarding_complete');
        if (onboardingQuest) {
            await mindframeStore.addActiveQuest(onboardingQuest);
        }
    }
  }
}

export const gamificationService = new GamificationService();
