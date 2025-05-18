
/**
 * @file Service worker for Mindframe OS.
 * Handles background tasks like LLM analysis requests, caching, and offline logic.
 */

import { MindframeStore } from '@core_logic/MindframeStore.js';
import { GamificationService } from '@core_logic/gamificationService.js';
import type { LLMInsight, UiInsight, CognitiveProfileV1, MindframeStoreState } from '@core_logic/types';
import { commonOfflineInsightsData } from '@assets/data/common_offline_insights_data';

console.log("Mindframe OS Service Worker Active (v2.1 - Enhanced).");

// --- Configuration ---
const LLM_PROXY_URL = 'YOUR_CLOUDFLARE_WORKER_URL_HERE/api/analyze'; // IMPORTANT: Replace this
const INSIGHT_CACHE_TTL_MS = 1 * 60 * 60 * 1000; // 1 hour
const WXP_FOR_CHALLENGE_ACCEPTED = 15;


// --- Utility Functions ---
function hashString(str: string): string {
  let hash = 0;
  if (!str || str.length === 0) {
    return "empty_string_hash";
  }
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; 
  }
  console.log(`Mindframe SW: Hashed string (len: ${str.length}) to: ${hash.toString(16)}`);
  return hash.toString(16);
}

function parseXMLResponse(xmlString: string): LLMInsight | null {
  console.log("Mindframe SW: Attempting to parse XML response:", xmlString.substring(0, 300) + "...");
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    const parserErrorNode = xmlDoc.querySelector("parsererror");
    if (parserErrorNode) {
      console.error("Mindframe SW: XML Parsing Error:", parserErrorNode.textContent, "Original XML:", xmlString);
      return null;
    }

    const getString = (tagName: string): string | undefined => {
      const element = xmlDoc.getElementsByTagName(tagName)[0];
      return element?.textContent?.trim() || undefined;
    };
    
    const getNullableString = (tagName: string): string | null => {
      const element = xmlDoc.getElementsByTagName(tagName)[0];
      // Ensure empty tags become null, not empty string, if that's desired for the type.
      // For LLMInsight, empty string might be fine for optional fields if not present.
      const content = element?.textContent?.trim();
      return content || null; 
    }

    const pattern_type = getString("pattern_type");
    const explanation = getString("explanation");
    const micro_challenge_prompt = getString("micro_challenge_prompt");

    if (!pattern_type || !explanation || !micro_challenge_prompt) {
      console.error("Mindframe SW: Malformed XML response, missing one or more required tags (pattern_type, explanation, micro_challenge_prompt). XML:", xmlString);
      return null;
    }

    const insight: LLMInsight = {
      pattern_type,
      hc_related: getNullableString("hc_related"), 
      explanation,
      micro_challenge_prompt,
      highlight_suggestion_css_selector: getNullableString("highlight_suggestion_css_selector"),
      original_text_segment: getString("original_text_segment"), // This can be undefined
    };
    console.log("Mindframe SW: Successfully parsed XML response:", insight);
    return insight;

  } catch (error) {
    console.error("Mindframe SW: Exception during XML parsing:", error, "Original XML:", xmlString);
    return null;
  }
}

function getRandomOfflineInsight(): UiInsight {
  console.log("Mindframe SW: Generating random offline insight.");
  const offlineData = commonOfflineInsightsData[Math.floor(Math.random() * commonOfflineInsightsData.length)];
  const title = offlineData.pattern_type.includes('tip') ? 'Quick Tip' 
              : (offlineData.pattern_type.includes('question') || offlineData.pattern_type.includes('reflection') ? 'Reflection Prompt'
              : (offlineData.pattern_type.includes('fact') ? 'Did You Know?' : 'Mindframe Insight'));
  
  const uiInsight: UiInsight = {
    id: offlineData.id || `offline-${Date.now()}`,
    title: title,
    sourceType: 'offline',
    hc_related: offlineData.hcId || null,
    pattern_type: offlineData.pattern_type,
    explanation: offlineData.explanation,
    micro_challenge_prompt: offlineData.micro_challenge_prompt,
    timestamp: Date.now(),
  };
  console.log("Mindframe SW: Generated random offline insight details:", uiInsight);
  return uiInsight;
}

function sendInsightToContentScript(tabId: number, insight: UiInsight) {
  console.log(`Mindframe SW: Attempting to send insight to Tab ID ${tabId}:`, insight);
  chrome.tabs.sendMessage(tabId, {
    action: 'showMindframeCoPilotInsight',
    insightData: insight,
  }).then(response => {
    console.log(`Mindframe SW: Message sent to tab ${tabId}, response:`, response);
  }).catch(error => {
    console.warn(`Mindframe SW: Could not send insight to content script (Tab ID ${tabId}). Tab might be closed, navigated away, or content script not ready. Error:`, error.message);
  });
}

// --- Core Logic ---
async function handleAnalyzeText(payload: { visibleText: string; pageUrl: string }, senderTabId: number) {
  const { visibleText, pageUrl } = payload;
  console.log(`Mindframe SW: handleAnalyzeText called for Tab ID ${senderTabId}, URL: ${pageUrl}, Text length: ${visibleText.length}`);
  
  let storeState: MindframeStoreState;
  let userProfile: CognitiveProfileV1 | null;

  try {
    storeState = await MindframeStore.get();
    if (!storeState) {
        console.error("Mindframe SW: Failed to get store state. Aborting analysis.");
        sendInsightToContentScript(senderTabId, getRandomOfflineInsight());
        return { status: "error_store_fetch_null", error: "MindframeStore.get() returned null" };
    }
    userProfile = storeState.userProfile;
  } catch (e) {
    console.error("Mindframe SW: Error fetching store state:", e);
    sendInsightToContentScript(senderTabId, getRandomOfflineInsight());
    return { status: "error_store_fetch", error: (e as Error).message };
  }

  if (!userProfile || !userProfile.onboardingCompletedTimestamp) {
    console.log("Mindframe SW: User has not completed onboarding. Skipping analysis. Profile:", userProfile);
    return { status: "onboarding_incomplete" };
  }
  
  if (!storeState.settings || !storeState.settings.analysisEnabled) {
      console.log("Mindframe SW: Analysis is disabled by user settings. Skipping analysis. Settings:", storeState.settings);
      return { status: "analysis_disabled" };
  }

  const cacheKey = hashString(visibleText + (userProfile.primaryGoal || '') + pageUrl);
  const cachedEntry = storeState.llmAnalysisCache?.[cacheKey];

  if (cachedEntry && (Date.now() - cachedEntry.timestamp < INSIGHT_CACHE_TTL_MS)) {
    console.log("Mindframe SW: Returning cached insight for key:", cacheKey, cachedEntry);
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
  console.log("Mindframe SW: Cache miss or stale for key:", cacheKey);


  if (!navigator.onLine) {
    console.log("Mindframe SW: Offline. Sending offline insight.");
    sendInsightToContentScript(senderTabId, getRandomOfflineInsight());
    return { status: "offline_fallback" };
  }

  if (LLM_PROXY_URL === 'YOUR_CLOUDFLARE_WORKER_URL_HERE/api/analyze') {
    console.warn("Mindframe SW: LLM_PROXY_URL is not configured. Skipping LLM call and sending offline insight as fallback.");
    sendInsightToContentScript(senderTabId, getRandomOfflineInsight());
    return { status: "llm_proxy_unconfigured_fallback" };
  }

  try {
    console.log("Mindframe SW: Calling LLM proxy for new analysis. URL:", LLM_PROXY_URL);
    const proxyResponse = await fetch(LLM_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        textSegment: visibleText.substring(0,2000), // Ensure text segment limit
        userGoal: userProfile.primaryGoal || "general cognitive improvement",
      }),
    });

    if (!proxyResponse.ok) {
      const errorText = await proxyResponse.text();
      console.error(`Mindframe SW: LLM Proxy Error: ${proxyResponse.status} ${proxyResponse.statusText}. Details: ${errorText}`);
      throw new Error(`LLM Proxy Error: ${proxyResponse.status} ${proxyResponse.statusText}. Details: ${errorText}`);
    }

    const xmlText = await proxyResponse.text();
    console.log("Mindframe SW: Received XML text from proxy:", xmlText.substring(0, 500) + "...");
    const llmInsight = parseXMLResponse(xmlText);

    if (llmInsight) {
      console.log("Mindframe SW: LLM Insight parsed:", llmInsight);
      if (llmInsight.pattern_type !== 'none' || llmInsight.hc_related !== null) {
        console.log("Mindframe SW: Caching new LLM insight for key:", cacheKey);
        try {
            await MindframeStore.update((current: MindframeStoreState) => ({
              ...current, // Important: spread current state
              llmAnalysisCache: {
                ...(current.llmAnalysisCache || {}), // Spread existing cache
                [cacheKey]: { insight: llmInsight, timestamp: Date.now() },
              },
            }));
            console.log("Mindframe SW: LLM insight cached successfully.");
        } catch (storeError) {
            console.error("Mindframe SW: Error updating MindframeStore with new cache entry:", storeError);
        }
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
        console.log("Mindframe SW: Requesting content script to highlight selector:", llmInsight.highlight_suggestion_css_selector);
        chrome.tabs.sendMessage(senderTabId, {action: 'applyHighlightOnPage', selector: llmInsight.highlight_suggestion_css_selector})
            .catch(e => console.warn("Mindframe SW: Failed to send highlight message to content script:", e.message));
      }
      return { status: "success_live", insight: llmInsight };
    } else {
      console.warn("Mindframe SW: LLM response parsing failed. Sending offline insight as fallback. XML was:", xmlText);
      sendInsightToContentScript(senderTabId, getRandomOfflineInsight());
      return { status: "parse_error_fallback" };
    }
  } catch (error) {
    console.error("Mindframe SW: Error during LLM analysis or proxy call:", error);
    sendInsightToContentScript(senderTabId, getRandomOfflineInsight());
    return { status: "error_fallback", error: (error as Error).message };
  }
}

async function handleChallengeAccepted(payload: { challengePrompt: string; hcRelated: string | null }) {
  console.log("Mindframe SW: handleChallengeAccepted called with payload:", payload);
  try {
    const {newWxp, newLevel} = await GamificationService.addWXP(WXP_FOR_CHALLENGE_ACCEPTED);
    await MindframeStore.update((current: MindframeStoreState) => ({
      ...current,
      completedChallengeLog: [
        {
          timestamp: Date.now(),
          challengeText: payload.challengePrompt,
          hcRelated: payload.hcRelated || "General", // Ensure this is a string, not null
          wxpEarned: WXP_FOR_CHALLENGE_ACCEPTED,
        },
        ...(current.completedChallengeLog || []).slice(0, 19), // Keep last 20
      ],
    }));
    console.log(`Mindframe SW: Co-pilot challenge accepted. Awarded ${WXP_FOR_CHALLENGE_ACCEPTED} WXP. New WXP: ${newWxp}, New Level: ${newLevel}. Log updated.`);
    return { status: "success_challenge_accepted_wxp_awarded" };
  } catch (error) {
    console.error("Mindframe SW: Error processing challenge acceptance:", error);
    return { status: "error_challenge_acceptance", error: (error as Error).message };
  }
}

// --- Event Listeners ---
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Mindframe OS Service Worker Installed/Updated. Reason:', details.reason);
  if (details.reason === 'install') {
    MindframeStore.get().then(initialState => {
      console.log("Mindframe SW: Initial store state on install:", initialState);
      // Potentially initialize default settings if MindframeStore.getDefaultState doesn't cover everything
      if (!initialState.settings) {
        MindframeStore.update(state => ({
            ...state,
            settings: MindframeStore.getDefaultState().settings
        })).then(() => console.log("Mindframe SW: Initialized default settings on install."));
      }
    }).catch(error => console.error("Mindframe SW: Error fetching initial store state on install:", error));
  }
  
  MindframeStore.get().then(state => {
      if (!state) {
          console.warn("Mindframe SW: Store state is null during cache cleanup check.");
          return;
      }
      const newCache : MindframeStoreState['llmAnalysisCache'] = {};
      let updated = false;
      const now = Date.now();
      if(state.llmAnalysisCache){
        Object.entries(state.llmAnalysisCache).forEach(([key, value]) => {
            if(now - value.timestamp < INSIGHT_CACHE_TTL_MS * 7) { // Keep for a week
                newCache[key] = value;
            } else {
                updated = true;
                console.log(`Mindframe SW: Removing stale cache entry for key ${key}`);
            }
        });
      }
      if(updated){
        MindframeStore.update((current: MindframeStoreState) => ({...current, llmAnalysisCache: newCache}))
            .then(() => console.log("Mindframe SW: Cleaned up stale LLM analysis cache entries."))
            .catch(error => console.error("Mindframe SW: Error cleaning LLM cache:", error));
      } else {
        console.log("Mindframe SW: No stale LLM cache entries to clean.");
      }
  }).catch(error => console.error("Mindframe SW: Error accessing store for cache cleanup:", error));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const senderOrigin = sender.tab ? `Tab ${sender.tab.id} (${sender.tab.url?.substring(0,50)}...)` : (sender.id ? `Extension ID ${sender.id}` : "Popup/Other");
  console.log("Mindframe SW: Received message:", message.action, "from:", senderOrigin, "Payload:", message.payload);

  if (message.action === 'analyzeVisibleTextForCoPilot' && message.payload) {
    if (sender.tab && sender.tab.id) {
      handleAnalyzeText(message.payload, sender.tab.id)
        .then(sendResponse)
        .catch(err => {
            console.error("Mindframe SW: Unhandled error in handleAnalyzeText promise chain:", err);
            sendResponse({ status: "error_unhandled_analyze", error: err.message })
        });
    } else {
      console.error("Mindframe SW: 'analyzeVisibleTextForCoPilot' message must be sent from a tab with an ID. Sender:", sender);
      sendResponse({ status: "error_no_tab_id", error: "Message must be sent from a tab."});
    }
    return true; // Indicates asynchronous response.
  }

  if (message.action === 'coPilotChallengeAccepted' && message.payload) {
    handleChallengeAccepted(message.payload)
      .then(sendResponse)
      .catch(err => {
          console.error("Mindframe SW: Unhandled error in handleChallengeAccepted promise chain:", err);
          sendResponse({ status: "error_unhandled_challenge", error: err.message })
      });
    return true; 
  }
  
  if (message.action === 'getUserProfile') { 
    console.log("Mindframe SW: getUserProfile action received.");
    MindframeStore.get()
      .then(state => {
        console.log("Mindframe SW: Sending user profile:", state?.userProfile);
        sendResponse({profile: state?.userProfile});
      })
      .catch(err => {
        console.error("Mindframe SW: Error fetching user profile for getUserProfile action:", err);
        sendResponse({ status: "error_profile_fetch", error: err.message, profile: null });
      });
    return true;
  }

  if (message.action === 'openMindframePage' && message.path) {
    const pageUrl = chrome.runtime.getURL(`popup.html#${message.path}`);
    console.log("Mindframe SW: Attempting to open Mindframe page:", pageUrl);
    chrome.tabs.create({ url: pageUrl })
        .then(tab => console.log(`Mindframe SW: Opened Mindframe page in new tab ${tab.id}`))
        .catch(err => console.error("Mindframe SW: Error opening Mindframe page:", err));
    sendResponse({status: "Page open attempt sent"});
    return false; 
  }
  
  console.warn("Mindframe SW: Unhandled message action:", message.action, "Full message:", message);
  sendResponse({ status: "unknown_action", receivedAction: message.action }); 
  return false; 
});

console.log("Mindframe OS Service Worker event listeners attached.");
