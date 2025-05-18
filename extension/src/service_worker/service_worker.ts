
/**
 * @file Service worker for Mindframe OS.
 * Handles background tasks like LLM analysis requests, caching, and offline logic.
 */

import { MindframeStore } from '@core_logic/MindframeStore.js';
import { GamificationService } from '@core_logic/gamificationService.js';
import type { LLMInsight, OfflineInsight, MindframeStoreState, UiInsight, CognitiveProfileV1 } from '@core_logic/types';
import { commonOfflineInsightsData } from '@assets/data/common_offline_insights_data';

// --- Configuration ---
// IMPORTANT: Replace with your actual deployed Cloudflare Worker URL
const LLM_PROXY_URL = 'YOUR_CLOUDFLARE_WORKER_URL_HERE/api/analyze'; 
const INSIGHT_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const WXP_FOR_CHALLENGE_ACCEPTED = 15; // WXP points for accepting a co-pilot challenge


// --- Utility Functions ---

/**
 * Simple string hashing function for cache keys.
 * @param str - The string to hash.
 * @returns A string hash.
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
}

/**
 * Parses the XML-like response from the LLM proxy.
 * Uses DOMParser for more robust parsing.
 * @param xmlString - The XML string from the proxy.
 * @returns An LLMInsight object or null if parsing fails.
 */
function parseXMLResponse(xmlString: string): LLMInsight | null {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    const parserErrorNode = xmlDoc.querySelector("parsererror");
    if (parserErrorNode) {
      console.error("Mindframe SW: XML Parsing Error:", parserErrorNode.textContent);
      return null;
    }

    const getString = (tagName: string): string | undefined => {
      const element = xmlDoc.getElementsByTagName(tagName)[0];
      return element?.textContent?.trim() || undefined;
    };

    const pattern_type = getString("pattern_type");
    const explanation = getString("explanation");
    const micro_challenge_prompt = getString("micro_challenge_prompt");

    if (!pattern_type || !explanation || !micro_challenge_prompt) {
      console.error("Mindframe SW: Malformed XML response from LLM, missing required tags (pattern_type, explanation, or micro_challenge_prompt). XML:", xmlString);
      return null;
    }

    return {
      pattern_type,
      hc_related: getString("hc_related") || null,
      explanation,
      micro_challenge_prompt,
      highlight_suggestion_css_selector: getString("highlight_suggestion_css_selector") || null,
      original_text_segment: getString("original_text_segment") || undefined,
    };
  } catch (error) {
    console.error("Mindframe SW: Error parsing XML response:", error, "Original XML:", xmlString);
    return null;
  }
}


/**
 * Gets a random offline insight and formats it as a UiInsight.
 * @returns A UiInsight object formatted from OfflineInsight.
 */
function getRandomOfflineInsight(): UiInsight {
  const offlineData = commonOfflineInsightsData[Math.floor(Math.random() * commonOfflineInsightsData.length)];
  return {
    id: offlineData.id || `offline-${Date.now()}`,
    title: offlineData.pattern_type.includes('tip') ? 'Quick Tip' 
           : (offlineData.pattern_type.includes('question') || offlineData.pattern_type.includes('reflection') ? 'Reflection Prompt'
           : (offlineData.pattern_type.includes('fact') ? 'Did You Know?' : 'Mindframe Insight')),
    sourceType: 'offline',
    hc_related: offlineData.hcId || null,
    pattern_type: offlineData.pattern_type, // This is more like a category for offline insights
    explanation: offlineData.explanation,
    micro_challenge_prompt: offlineData.micro_challenge_prompt,
    timestamp: Date.now(),
  };
}

/**
 * Sends an insight to the specified tab's content script.
 * @param tabId - The ID of the tab to send the message to.
 * @param insight - The UiInsight data to send.
 */
function sendInsightToContentScript(tabId: number, insight: UiInsight) {
  chrome.tabs.sendMessage(tabId, {
    action: 'showMindframeCoPilotInsight',
    insightData: insight,
  }).catch(error => console.warn("Mindframe SW: Could not send insight to content script. Tab might be closed or navigated away.", error.message));
}


// --- Core Logic ---

/**
 * Handles the 'analyzeVisibleTextForCoPilot' action.
 * Fetches profile, checks cache, calls LLM proxy, or serves offline insight.
 */
async function handleAnalyzeText(payload: { visibleText: string; pageUrl: string }, senderTabId: number) {
  const { visibleText, pageUrl } = payload;
  let storeState: MindframeStoreState;
  let userProfile: CognitiveProfileV1 | null;

  try {
    storeState = await MindframeStore.get();
    userProfile = storeState.userProfile;
  } catch (e) {
    console.error("Mindframe SW: Error fetching store state:", e);
    sendInsightToContentScript(senderTabId, getRandomOfflineInsight());
    return { status: "error", error: "Failed to fetch user profile" };
  }

  if (!userProfile || !userProfile.onboardingCompletedTimestamp) {
    console.log("Mindframe SW: User has not completed onboarding. Skipping analysis.");
    // Optionally, send a message to prompt onboarding or show a specific "onboarding needed" card
    return { status: "onboarding_incomplete" };
  }
  
  if (!storeState.settings.analysisEnabled) {
      console.log("Mindframe SW: Analysis is disabled by user settings.");
      return { status: "analysis_disabled" };
  }

  const cacheKey = hashString(visibleText + (userProfile.primaryGoal || '') + pageUrl);
  const cachedEntry = storeState.llmAnalysisCache?.[cacheKey];

  if (cachedEntry && (Date.now() - cachedEntry.timestamp < INSIGHT_CACHE_TTL_MS)) {
    console.log("Mindframe SW: Returning cached insight for key:", cacheKey);
    const uiInsight: UiInsight = { 
        ...cachedEntry.insight, 
        sourceType: 'llm', 
        title: `Pattern: ${cachedEntry.insight.pattern_type === 'none' ? 'General Reflection' : cachedEntry.insight.pattern_type}`, 
        id: cacheKey,
        timestamp: cachedEntry.timestamp
    };
    sendInsightToContentScript(senderTabId, uiInsight);
    return { status: "success_cached", insight: cachedEntry.insight };
  }

  if (!navigator.onLine) {
    console.log("Mindframe SW: Offline. Sending offline insight.");
    sendInsightToContentScript(senderTabId, getRandomOfflineInsight());
    return { status: "offline_fallback" };
  }

  try {
    console.log("Mindframe SW: Calling LLM proxy for new analysis.");
    const proxyResponse = await fetch(LLM_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        textSegment: visibleText.substring(0,2000), // Ensure textSegment is within limits for proxy
        userGoal: userProfile.primaryGoal,
      }),
    });

    if (!proxyResponse.ok) {
      const errorText = await proxyResponse.text();
      throw new Error(`LLM Proxy Error: ${proxyResponse.status} ${proxyResponse.statusText}. Details: ${errorText}`);
    }

    const xmlText = await proxyResponse.text();
    const llmInsight = parseXMLResponse(xmlText);

    if (llmInsight) {
      if (llmInsight.pattern_type !== 'none' || llmInsight.hc_related !== null) { // Cache meaningful insights
        await MindframeStore.update((current: MindframeStoreState) => ({ // Corrected updater function
          ...current,
          llmAnalysisCache: {
            ...current.llmAnalysisCache,
            [cacheKey]: { insight: llmInsight, timestamp: Date.now() },
          },
        }));
      }
      const uiInsight: UiInsight = { 
          ...llmInsight, 
          sourceType: 'llm', 
          title: `Pattern: ${llmInsight.pattern_type === 'none' ? 'General Reflection' : llmInsight.pattern_type}`, 
          id: cacheKey,
          timestamp: Date.now()
      };
      sendInsightToContentScript(senderTabId, uiInsight);
      if (llmInsight.highlight_suggestion_css_selector) {
        chrome.tabs.sendMessage(senderTabId, {action: 'applyHighlightOnPage', selector: llmInsight.highlight_suggestion_css_selector})
            .catch(e => console.warn("Mindframe SW: Failed to send highlight message", e.message));
      }
      return { status: "success_live", insight: llmInsight };
    } else {
      console.warn("Mindframe SW: LLM response parsing failed. Sending offline insight.");
      sendInsightToContentScript(senderTabId, getRandomOfflineInsight());
      return { status: "parse_error_fallback" };
    }
  } catch (error) {
    console.error("Mindframe SW: Error during LLM analysis or proxy call:", error);
    sendInsightToContentScript(senderTabId, getRandomOfflineInsight());
    return { status: "error_fallback", error: (error as Error).message };
  }
}

/**
 * Handles the 'coPilotChallengeAccepted' action.
 * Awards WXP and logs the completed challenge.
 */
async function handleChallengeAccepted(payload: { challengePrompt: string; hcRelated: string | null }) {
  try {
    await GamificationService.addWXP(WXP_FOR_CHALLENGE_ACCEPTED);
    await MindframeStore.update((current: MindframeStoreState) => ({
      ...current, // Spread current state first
      completedChallengeLog: [
        {
          timestamp: Date.now(),
          challengeText: payload.challengePrompt,
          hcRelated: payload.hcRelated || "General", // Ensure hcRelated is string or null
          wxpEarned: WXP_FOR_CHALLENGE_ACCEPTED,
        },
        ...(current.completedChallengeLog || []).slice(0, 19), // Keep last 20
      ],
    }));
    console.log(`Mindframe SW: Co-pilot challenge accepted. Awarded ${WXP_FOR_CHALLENGE_ACCEPTED} WXP.`);
    return { status: "success_challenge_accepted_wxp_awarded" };
  } catch (error) {
    console.error("Mindframe SW: Error processing challenge acceptance:", error);
    return { status: "error", error: (error as Error).message };
  }
}


// --- Event Listeners ---

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Mindframe OS Service Worker Installed/Updated.', details.reason);
  if (details.reason === 'install') {
    MindframeStore.get().then(initialState => {
      console.log("Mindframe SW: Initial store state on install:", initialState);
      // Onboarding logic should handle initial quest assignment upon its completion.
      // Optionally, open onboarding page:
      // chrome.tabs.create({ url: chrome.runtime.getURL('popup.html#/onboarding') });
    });
  }
  // Clean up old cache entries
  MindframeStore.get().then(state => {
      const newCache : MindframeStoreState['llmAnalysisCache'] = {};
      let updated = false;
      const now = Date.now();
      if(state.llmAnalysisCache){
        Object.entries(state.llmAnalysisCache).forEach(([key, value]) => {
            if(now - value.timestamp < INSIGHT_CACHE_TTL_MS * 7) { // Keep for 7 days for example
                newCache[key] = value;
            } else {
                updated = true;
            }
        });
      }
      if(updated){
        MindframeStore.update((current: MindframeStoreState) => ({...current, llmAnalysisCache: newCache}));
        console.log("Mindframe SW: Cleaned up stale LLM analysis cache entries.");
      }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Mindframe SW: Received message:", message.action, "from:", sender.tab?.id ? `Tab ${sender.tab.id}`: "Popup/Other");

  if (message.action === 'analyzeVisibleTextForCoPilot' && message.payload) {
    if (sender.tab && sender.tab.id) {
      handleAnalyzeText(message.payload, sender.tab.id)
        .then(sendResponse)
        .catch(err => {
            console.error("Mindframe SW: Error in handleAnalyzeText promise chain:", err);
            sendResponse({ status: "error", error: err.message })
        });
    } else {
      console.error("Mindframe SW: 'analyzeVisibleTextForCoPilot' message must be sent from a tab with an ID.");
      sendResponse({ status: "error", error: "Message must be sent from a tab."});
    }
    return true; // Indicates asynchronous response.
  }

  if (message.action === 'coPilotChallengeAccepted' && message.payload) {
    handleChallengeAccepted(message.payload)
      .then(sendResponse)
      .catch(err => {
          console.error("Mindframe SW: Error in handleChallengeAccepted promise chain:", err);
          sendResponse({ status: "error", error: err.message })
      });
    return true; // Indicates asynchronous response.
  }
  
  if (message.action === 'getUserProfile') { 
    MindframeStore.get().then(state => sendResponse({profile: state.userProfile}))
      .catch(err => sendResponse({ status: "error", error: err.message }));
    return true;
  }

  // For opening popup pages from content scripts (e.g., "Learn More" on InsightCard)
  if (message.action === 'openMindframePage' && message.path) {
    chrome.tabs.create({ url: chrome.runtime.getURL(`popup.html#${message.path}`) });
    sendResponse({status: "Page open attempt sent"});
    return true;
  }

  // Default response for unhandled actions
  // sendResponse({ status: "unknown_action" }); // No default response to avoid errors if not expected
  return false; // Indicate synchronous handling if no other path returns true
});

console.log("Mindframe OS Service Worker active.");
