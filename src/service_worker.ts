
'use strict';

import { analyzeTextForBias, type AnalyzeTextForBiasInput, type AnalyzeTextForBiasOutput } from './ai/flows/analyze-text-for-bias';
import { mindframeStore } from './lib/MindframeStore';
import { gamificationService } from './lib/gamificationService';
import { commonOfflineInsightsData } from './assets/data/commonOfflineInsightsData';
import type { LLMInsight, CognitiveProfileV1, OfflineInsight, UiInsight } from './types';

const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds
const insightCache = new Map<string, { insight: LLMInsight, timestamp: number }>();

// Simple hashing function (not cryptographically secure, just for basic caching key)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}

async function getCachedInsight(text: string): Promise<LLMInsight | null> {
  const key = simpleHash(text);
  const cachedEntry = insightCache.get(key);
  if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL)) {
    console.log("Service Worker: Returning cached insight for key:", key);
    return cachedEntry.insight;
  }
  insightCache.delete(key); // Stale or not found
  return null;
}

function cacheInsight(text: string, insight: LLMInsight): void {
  const key = simpleHash(text);
  insightCache.set(key, { insight, timestamp: Date.now() });
  console.log("Service Worker: Cached new insight for key:", key);
}

function getRandomOfflineInsight(): UiInsight {
  const randomIndex = Math.floor(Math.random() * commonOfflineInsightsData.length);
  const offlineData = commonOfflineInsightsData[randomIndex];
  return {
    id: offlineData.id,
    title: offlineData.type.charAt(0).toUpperCase() + offlineData.type.slice(1), // e.g. "Tip"
    sourceType: 'offline',
    hcId: offlineData.hcId,
    explanation: offlineData.text,
    challengePrompt: offlineData.type === 'question' ? "Consider this question for a moment." : undefined,
    timestamp: Date.now(),
  };
}


chrome.runtime.onInstalled.addListener(() => {
  console.log('Mindframe MVP Service Worker Installed/Updated.');
  // Perform any first-time setup, like initializing default settings or quests
  mindframeStore.get().then(async (state) => {
    if (!state.profile || !state.profile.onboardingCompleted) {
      // Potentially set up default quests or initial state if onboarding is not done
      // but usually onboarding handles this.
    } else {
      // Ensure initial quests are set if profile exists
      await mindframeStore.assignInitialQuests();
    }
    await gamificationService.initializeGamificationState();
  });
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Service Worker received message:", message, "from sender:", sender);

  if (message.action === "analyzeVisibleTextForCoPilot") {
    (async () => {
      const { visibleText } = message;
      let userGoal: string | undefined;

      try {
        const storeState = await mindframeStore.get();
        userGoal = storeState.profile?.userGoal;

        if (!navigator.onLine) {
          console.log("Service Worker: Offline. Sending offline insight.");
          const offlineInsight = getRandomOfflineInsight();
          sendResponse({ status: "offline", insight: offlineInsight });
          // Also send to content script to display
          if (sender.tab?.id) {
            chrome.tabs.sendMessage(sender.tab.id, { action: "showMindframeCoPilotInsight", insightData: offlineInsight });
          }
          return;
        }
        
        const cached = await getCachedInsight(visibleText);
        if (cached) {
           sendResponse({ status: "success_cached", insight: cached });
           if (sender.tab?.id) {
             chrome.tabs.sendMessage(sender.tab.id, { action: "showMindframeCoPilotInsight", insightData: cached });
           }
           return;
        }

        const analysisInput: AnalyzeTextForBiasInput = { text: visibleText, userGoal };
        console.log("Service Worker: Calling analyzeTextForBias Genkit flow with input:", analysisInput);
        
        const analysisOutput: AnalyzeTextForBiasOutput = await analyzeTextForBias(analysisInput);
        console.log("Service Worker: Genkit flow response:", analysisOutput);

        // The output from analyzeTextForBias is already in LLMInsight format
        const llmInsight: LLMInsight = analysisOutput;
        
        if (llmInsight.pattern_type !== 'none') {
          cacheInsight(visibleText, llmInsight);
        }
        
        sendResponse({ status: "success_live", insight: llmInsight });
        // Send the insight to the content script of the tab that requested it
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(sender.tab.id, { action: "showMindframeCoPilotInsight", insightData: llmInsight });
        }

      } catch (error) {
        console.error("Service Worker: Error during text analysis:", error);
        const offlineInsight = getRandomOfflineInsight(); // Fallback to offline insight
        sendResponse({ status: "error_fallback_offline", error: (error as Error).message, insight: offlineInsight });
        if (sender.tab?.id) {
            chrome.tabs.sendMessage(sender.tab.id, { action: "showMindframeCoPilotInsight", insightData: offlineInsight });
        }
      }
    })();
    return true; // Indicates that the response will be sent asynchronously.
  }

  if (message.action === "coPilotChallengeAccepted") {
    (async () => {
      try {
        const points = message.points || 5; // Default to 5 WXP
        await gamificationService.addWXP(points);
        // Optionally, track accepted challenges if needed (e.g., for quests)
        // For now, just awarding WXP.
        console.log(`Service Worker: Co-pilot challenge accepted (Insight ID: ${message.insightId}, HC ID: ${message.hcId}). Awarded ${points} WXP.`);
        sendResponse({ status: "challenge_accepted_wxp_awarded" });
      } catch (error) {
        console.error("Service Worker: Error processing challenge acceptance:", error);
        sendResponse({ status: "error", error: (error as Error).message });
      }
    })();
    return true; // Async response
  }
  
  // Keep alive for Genkit flows (if they take longer than standard event handling)
  // This is a common pattern for extensions using async operations in service workers.
  // However, with Manifest V3, long-running operations are tricky. Genkit calls should be relatively fast.
  // If Genkit calls become very long, an alternative approach like offscreen documents might be needed.
  // For now, assuming Genkit flows are quick enough.

  // Default: if no action matches, return false or nothing for synchronous handling.
});

console.log("Mindframe MVP Service Worker Active.");
