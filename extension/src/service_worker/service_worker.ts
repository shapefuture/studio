
/**
 * @file Service worker for Mindframe OS.
 * Handles background tasks like LLM analysis requests, caching, and offline logic.
 */

import { MindframeStore } from '@core_logic/MindframeStore.js';
import { GamificationService } from '@core_logic/gamificationService.js';
import type { LLMInsight, UiInsight, CognitiveProfileV1, MindframeStoreState, OfflineInsight } from '@core_logic/types';
import { commonOfflineInsightsData } from '@assets/data/common_offline_insights_data';

console.log("Mindframe OS Service Worker Active (v2.1 - Enhanced with Env Var).");

// --- Configuration ---
// The actual URL will be injected by Vite during the build process
const LLM_PROXY_URL = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 'YOUR_CLOUDFLARE_WORKER_URL_PLACEHOLDER/api/analyze';
const DEFAULT_FALLBACK_URL_MESSAGE = 'YOUR_CLOUDFLARE_WORKER_URL_PLACEHOLDER/api/analyze';

if (LLM_PROXY_URL === DEFAULT_FALLBACK_URL_MESSAGE) {
  console.warn("Mindframe SW: LLM_PROXY_URL is using the default placeholder. Please ensure VITE_CLOUDFLARE_WORKER_URL is set in your .env file and Vite is configured correctly.");
}


const INSIGHT_CACHE_TTL_MS = 1 * 60 * 60 * 1000; // 1 hour
const WXP_FOR_CHALLENGE_ACCEPTED = 15;


// --- Utility Functions ---
function hashString(str: string): string {
  let hash = 0;
  if (!str || str.length === 0) {
    console.warn("Mindframe SW: hashString called with empty string.");
    return "empty_string_hash";
  }
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; 
  }
  // console.log(`Mindframe SW: Hashed string (len: ${str.length}) to: ${hash.toString(16)}`);
  return hash.toString(16);
}

function parseXMLResponse(xmlString: string): LLMInsight | null {
  console.log("Mindframe SW: Attempting to parse XML response:", xmlString.substring(0, 300) + "...");
  if (!xmlString || typeof xmlString !== 'string' || xmlString.trim() === '') {
    console.error("Mindframe SW: XML Parsing Error: Received empty or invalid XML string.");
    return null;
  }
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
      return element?.textContent?.trim(); // undefined if tag missing or empty
    };
    
    const getNullableString = (tagName: string): string | null => {
      const content = getString(tagName);
      return content === undefined || content === "" ? null : content;
    }

    const pattern_type = getString("pattern_type");
    const explanation = getString("explanation");
    const micro_challenge_prompt = getString("micro_challenge_prompt");

    // pattern_type being "none" is acceptable. Explanation and prompt can be empty for "none".
    if (pattern_type === undefined ) {
      console.error("Mindframe SW: Malformed XML response, missing required tag <pattern_type>. XML:", xmlString);
      return null;
    }
     if (explanation === undefined ) {
      console.error("Mindframe SW: Malformed XML response, missing required tag <explanation>. XML:", xmlString);
      return null;
    }
     if (micro_challenge_prompt === undefined ) {
      console.error("Mindframe SW: Malformed XML response, missing required tag <micro_challenge_prompt>. XML:", xmlString);
      return null;
    }


    const insight: LLMInsight = {
      pattern_type: pattern_type, // Can be "none"
      hc_related: getNullableString("hc_related"), 
      explanation: explanation, // Can be empty if pattern_type is "none"
      micro_challenge_prompt: micro_challenge_prompt, // Can be empty if pattern_type is "none"
      highlight_suggestion_css_selector: getNullableString("highlight_suggestion_css_selector"),
      original_text_segment: getNullableString("original_text_segment"),
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
  if (!commonOfflineInsightsData || commonOfflineInsightsData.length === 0) {
    console.error("Mindframe SW: commonOfflineInsightsData is empty or undefined. Cannot generate offline insight.");
    // Return a very basic fallback to prevent crashes
    return {
      id: `offline-error-${Date.now()}`,
      title: "Offline Tip Unavailable",
      sourceType: 'offline',
      hc_related: null,
      pattern_type: 'general_tip',
      explanation: "We're having trouble loading tips right now. Please try again later.",
      micro_challenge_prompt: "Try reflecting on your current task.",
      timestamp: Date.now(),
    };
  }
  const offlineData: OfflineInsight = commonOfflineInsightsData[Math.floor(Math.random() * commonOfflineInsightsData.length)];
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
    if (chrome.runtime.lastError) {
        console.warn(`Mindframe SW: Error sending insight to content script (Tab ID ${tabId}) after response:`, chrome.runtime.lastError.message, "Response was:", response);
    } else {
        console.log(`Mindframe SW: Message sent to tab ${tabId}, response:`, response);
    }
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
        console.error("Mindframe SW: Failed to get store state (MindframeStore.get() returned null). Aborting analysis.");
        sendInsightToContentScript(senderTabId, getRandomOfflineInsight());
        return { status: "error_store_fetch_null", error: "MindframeStore.get() returned null" };
    }
    userProfile = storeState.userProfile;
  } catch (e: any) {
    console.error("Mindframe SW: Error fetching store state:", e.message, e);
    sendInsightToContentScript(senderTabId, getRandomOfflineInsight());
    return { status: "error_store_fetch", error: e.message };
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

  if (LLM_PROXY_URL === DEFAULT_FALLBACK_URL_MESSAGE || !LLM_PROXY_URL) {
    console.warn(`Mindframe SW: LLM_PROXY_URL is not configured or is the placeholder ('${LLM_PROXY_URL}'). Skipping LLM call and sending offline insight as fallback. Please set VITE_CLOUDFLARE_WORKER_URL in your .env file.`);
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
              ...current, 
              llmAnalysisCache: {
                ...(current.llmAnalysisCache || {}), 
                [cacheKey]: { insight: llmInsight, timestamp: Date.now() },
              },
            }));
            console.log("Mindframe SW: LLM insight cached successfully.");
        } catch (storeError: any) {
            console.error("Mindframe SW: Error updating MindframeStore with new cache entry:", storeError.message, storeError);
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
  } catch (error: any) {
    console.error("Mindframe SW: Error during LLM analysis or proxy call:", error.message, error);
    sendInsightToContentScript(senderTabId, getRandomOfflineInsight());
    return { status: "error_fallback", error: error.message };
  }
}

async function handleChallengeAccepted(payload: { challengePrompt: string; hcRelated: string | null }) {
  console.log("Mindframe SW: handleChallengeAccepted called with payload:", payload);
  try {
    const {newWxp, newLevel} = await GamificationService.addWXP(WXP_FOR_CHALLENGE_ACCEPTED);
    await MindframeStore.update((current: MindframeStoreState) => {
      // Ensure completedChallengeLog is initialized if it doesn't exist
      const currentLog = current.completedChallengeLog || [];
      return {
        ...current,
        completedChallengeLog: [
          {
            timestamp: Date.now(),
            challengeText: payload.challengePrompt,
            hcRelated: payload.hcRelated || "General", 
            wxpEarned: WXP_FOR_CHALLENGE_ACCEPTED,
          },
          ...currentLog.slice(0, 19), // Keep last 20
        ],
      };
    });
    console.log(`Mindframe SW: Co-pilot challenge accepted. Awarded ${WXP_FOR_CHALLENGE_ACCEPTED} WXP. New WXP: ${newWxp}, New Level: ${newLevel}. Log updated.`);
    return { status: "success_challenge_accepted_wxp_awarded" };
  } catch (error: any) {
    console.error("Mindframe SW: Error processing challenge acceptance:", error.message, error);
    return { status: "error_challenge_acceptance", error: error.message };
  }
}

// --- Event Listeners ---
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Mindframe OS Service Worker Installed/Updated. Reason:', details.reason);
  if (details.reason === 'install') {
    MindframeStore.get().then(initialState => {
      console.log("Mindframe SW: Initial store state on install:", initialState);
      if (!initialState.settings) {
        MindframeStore.update(state => ({
            ...state,
            settings: MindframeStore.getDefaultState().settings
        })).then(() => console.log("Mindframe SW: Initialized default settings on install."))
           .catch(error => console.error("Mindframe SW: Error initializing default settings on install:", error));
      }
    }).catch(error => console.error("Mindframe SW: Error fetching initial store state on install:", error));
  }
  
  MindframeStore.get().then(state => {
      if (!state) {
          console.warn("Mindframe SW: Store state is null during cache cleanup check onInstalled.");
          return;
      }
      const newCache : MindframeStoreState['llmAnalysisCache'] = {};
      let updated = false;
      const now = Date.now();
      const STALE_CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days for longer term cleanup

      if(state.llmAnalysisCache){
        Object.entries(state.llmAnalysisCache).forEach(([key, value]) => {
            if(now - value.timestamp < STALE_CACHE_EXPIRY_MS) { 
                newCache[key] = value;
            } else {
                updated = true;
                console.log(`Mindframe SW: Removing stale cache entry (older than 7 days) for key ${key}`);
            }
        });
      }
      if(updated){
        MindframeStore.update((current: MindframeStoreState) => ({...current, llmAnalysisCache: newCache}))
            .then(() => console.log("Mindframe SW: Cleaned up stale LLM analysis cache entries."))
            .catch(error => console.error("Mindframe SW: Error cleaning LLM cache:", error));
      } else {
        console.log("Mindframe SW: No stale LLM cache entries to clean onInstalled.");
      }
  }).catch(error => console.error("Mindframe SW: Error accessing store for cache cleanup onInstalled:", error));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const senderOrigin = sender.tab ? `Tab ${sender.tab.id} (${sender.tab.url?.substring(0,50)}...)` : (sender.id ? `Extension ID ${sender.id}` : "Popup/Other");
  console.log("Mindframe SW: Received message:", message.action, "from:", senderOrigin, "Payload keys:", message.payload ? Object.keys(message.payload) : "No Payload");

  if (message.action === 'analyzeVisibleTextForCoPilot' && message.payload) {
    if (sender.tab && sender.tab.id) {
      handleAnalyzeText(message.payload, sender.tab.id)
        .then(sendResponse)
        .catch(err => {
            console.error("Mindframe SW: Unhandled error in handleAnalyzeText promise chain:", err.message, err);
            sendResponse({ status: "error_unhandled_analyze", error: err.message })
        });
    } else {
      console.error("Mindframe SW: 'analyzeVisibleTextForCoPilot' message must be sent from a tab with an ID. Sender:", sender);
      sendResponse({ status: "error_no_tab_id", error: "Message must be sent from a tab."});
    }
    return true; // Indicates asynchronous response.
  } else if (message.action === 'coPilotChallengeAccepted' && message.payload) {
    handleChallengeAccepted(message.payload)
      .then(sendResponse)
      .catch(err => {
          console.error("Mindframe SW: Unhandled error in handleChallengeAccepted promise chain:", err.message, err);
          sendResponse({ status: "error_unhandled_challenge", error: err.message })
      });
    return true; 
  } else if (message.action === 'getUserProfile') { 
    console.log("Mindframe SW: getUserProfile action received.");
    MindframeStore.get()
      .then(state => {
        console.log("Mindframe SW: Sending user profile:", state?.userProfile);
        sendResponse({profile: state?.userProfile});
      })
      .catch(err => {
        console.error("Mindframe SW: Error fetching user profile for getUserProfile action:", err.message, err);
        sendResponse({ status: "error_profile_fetch", error: err.message, profile: null });
      });
    return true;
  } else if (message.action === 'openMindframePage' && message.path) {
    const pageUrl = chrome.runtime.getURL(`popup.html#${message.path}`);
    console.log("Mindframe SW: Attempting to open Mindframe page:", pageUrl);
    chrome.tabs.create({ url: pageUrl })
        .then(tab => console.log(`Mindframe SW: Opened Mindframe page in new tab ${tab.id}`))
        .catch(err => console.error("Mindframe SW: Error opening Mindframe page:", err.message, err));
    sendResponse({status: "Page open attempt sent"});
    // return false; // Synchronous, no need to return true
  } else {
    console.warn("Mindframe SW: Unhandled message action:", message.action, "Full message:", message);
    sendResponse({ status: "unknown_action", receivedAction: message.action }); 
    // return false; // Synchronous, no need to return true for unknown actions
  }
  // If an async path wasn't taken, it's good practice for addListener to not return true,
  // or to explicitly return false for synchronous messages.
  // However, for simplicity, if any path MIGHT be async, returning true is safer.
  // Let's be explicit: if an action is known to be sync, it doesn't return true.
  // Since the last two 'else if' are sync, we'd return false there.
  // But the 'if/else if' structure means only one path is taken.
  // The default case (unknown_action) is synchronous.
  // So, only return true for known async actions.
  if (['analyzeVisibleTextForCoPilot', 'coPilotChallengeAccepted', 'getUserProfile'].includes(message.action)) {
      return true;
  }
  return false; // For sync messages like 'openMindframePage' and unknown actions.
});

console.log("Mindframe OS Service Worker event listeners attached. Proxy URL configured to:", LLM_PROXY_URL);
