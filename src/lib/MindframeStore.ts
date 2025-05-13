
import type { MindframeStoreState, CognitiveProfileV1, GamificationData, Quest } from '@/types';
import { DEFAULT_COGNITIVE_PROFILE, DEFAULT_GAMIFICATION_DATA } from './constants'; // Assuming these are updated or still relevant
import { starterQuestsData } from '@/assets/data/starterQuestsData';

const STORAGE_KEY = 'mindframe_mvp_data_v1';
const CURRENT_VERSION = 1;

function getDefaultState(): MindframeStoreState {
  return {
    version: CURRENT_VERSION,
    profile: null, // Onboarding will populate this
    gamification: { ...DEFAULT_GAMIFICATION_DATA },
    activeQuests: [], // Will be populated after onboarding
    completedQuestIds: [],
    lastLLMAnalysisCache: {},
  };
}

class MindframeStore {
  static CURRENT_VERSION = CURRENT_VERSION;

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__testLocalStorage__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  async get(): Promise<MindframeStoreState> {
    if (!this.isLocalStorageAvailable()) {
      console.warn('LocalStorage is not available. Using in-memory default state.');
      return getDefaultState();
    }

    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (rawData) {
        const parsedData: MindframeStoreState = JSON.parse(rawData);
        if (parsedData.version === MindframeStore.CURRENT_VERSION) {
          // Ensure all parts of the default state are present if they were added later
          const defaultState = getDefaultState();
          return {
            ...defaultState,
            ...parsedData,
            profile: parsedData.profile ? { ...defaultState.profile, ...parsedData.profile } : null,
            gamification: { ...defaultState.gamification, ...parsedData.gamification },
            activeQuests: parsedData.activeQuests || defaultState.activeQuests,
            completedQuestIds: parsedData.completedQuestIds || defaultState.completedQuestIds,
            lastLLMAnalysisCache: parsedData.lastLLMAnalysisCache || defaultState.lastLLMAnalysisCache,
          };
        } else {
          console.warn(`Store version mismatch. Expected ${MindframeStore.CURRENT_VERSION}, found ${parsedData.version}. Resetting to default.`);
          // For a real app, you'd implement migration logic here.
          // For MVP, resetting to default is acceptable.
          const defaultState = getDefaultState();
          await this.save(defaultState);
          return defaultState;
        }
      }
    } catch (error) {
      console.error("Error reading from MindframeStore, resetting to default:", error);
      // Fallthrough to return default state
    }
    
    // If no data or error, initialize with default and save
    const defaultState = getDefaultState();
    await this.save(defaultState);
    return defaultState;
  }

  async save(state: MindframeStoreState): Promise<void> {
    if (!this.isLocalStorageAvailable()) {
      console.warn('LocalStorage is not available. State not saved.');
      return;
    }
    try {
      const rawData = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, rawData);
    } catch (error) {
      console.error("Error writing to MindframeStore:", error);
    }
  }

  async update(updaterFn: (currentState: MindframeStoreState) => MindframeStoreState | Promise<MindframeStoreState>): Promise<void> {
    const currentState = await this.get();
    const newState = await updaterFn(currentState);
    await this.save(newState);
  }

  async clearStore(): Promise<void> {
    if (!this.isLocalStorageAvailable()) {
      console.warn('LocalStorage is not available. Store not cleared.');
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    console.log("MindframeStore cleared.");
  }

  // Utility to update profile specifically
  async updateProfile(profileData: Partial<CognitiveProfileV1>): Promise<void> {
    await this.update(state => ({
      ...state,
      profile: state.profile ? { ...state.profile, ...profileData } : (profileData as CognitiveProfileV1),
    }));
  }

  // Utility to update gamification data
  async updateGamification(gamificationData: Partial<GamificationData>): Promise<void> {
    await this.update(state => ({
      ...state,
      gamification: { ...state.gamification, ...gamificationData },
    }));
  }
  
  // Utility to add a completed quest
  async completeQuest(questId: string): Promise<void> {
    await this.update(state => {
      const quest = state.activeQuests.find(q => q.id === questId);
      if (!quest || state.completedQuestIds.includes(questId)) {
        return state; // Quest not active or already completed
      }
      return {
        ...state,
        activeQuests: state.activeQuests.filter(q => q.id !== questId),
        completedQuestIds: [...state.completedQuestIds, questId],
        // Gamification update for WXP should happen in GamificationService after calling this
      };
    });
  }

  async addActiveQuest(quest: Quest): Promise<void> {
    await this.update(state => {
        if (state.activeQuests.some(q => q.id === quest.id) || state.completedQuestIds.includes(quest.id)) {
            return state; // Quest already active or completed
        }
        return {
            ...state,
            activeQuests: [...state.activeQuests, quest],
        };
    });
  }

   async assignInitialQuests(): Promise<void> {
    await this.update(state => {
      // Assign specific starter quests if not already active or completed
      const questsToAssign = starterQuestsData.filter(
        sq => !state.activeQuests.some(aq => aq.id === sq.id) && !state.completedQuestIds.includes(sq.id)
      );
      return {
        ...state,
        activeQuests: [...state.activeQuests, ...questsToAssign],
      };
    });
  }
}

export const mindframeStore = new MindframeStore();
