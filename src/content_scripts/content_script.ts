
console.log("Mindframe MVP Content Script Loaded.");

// Example: Listen for messages from the background script (service_worker)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message, "from sender:", sender);

  if (message.action === "showMindframeCoPilotInsight") {
    // TODO: Implement logic to display the insight on the page
    // This might involve creating/updating an InsightCard component
    // For MVP, we can log it or show a simple alert
    console.log("Received insight to show:", message.insightData);
    if (message.insightData && message.insightData.pattern_type !== 'none') {
        alert(`Mindframe Insight:\nTitle: ${message.insightData.pattern_type}\nExplanation: ${message.insightData.explanation}\nChallenge: ${message.insightData.micro_challenge_prompt}`);
    }
    sendResponse({ status: "Insight shown or logged" });
  } else if (message.action === "highlightElementOnPage") {
    // TODO: Implement logic to highlight an element based on selector
    if (message.selector) {
      try {
        const elements = document.querySelectorAll(message.selector);
        elements.forEach(el => {
          // Add a temporary highlight style. This is very basic.
          (el as HTMLElement).style.outline = "3px solid orange";
          (el as HTMLElement).style.transition = "outline 0.5s ease-in-out";
          setTimeout(() => {
            (el as HTMLElement).style.outline = "";
          }, 5000); // Remove highlight after 5 seconds
        });
        console.log(`Highlighted elements matching selector: ${message.selector}`);
        sendResponse({ status: "Highlight attempted" });
      } catch (e) {
        console.error("Error highlighting element:", e);
        sendResponse({ status: "Highlight failed", error: (e as Error).message });
      }
    }
  }
  // Important: Return true to indicate you wish to send a response asynchronously
  // if you use sendResponse asynchronously. For synchronous, it's not strictly needed.
  return true; 
});


// Placeholder for future logic:
// 1. Identify main content areas of a page.
// 2. Extract visible text from these areas.
// 3. Send text to the service worker for analysis if it's substantial.

function analyzeVisibleContent() {
  // This is a very simplified placeholder
  // In a real scenario, you'd need more sophisticated logic to identify relevant content
  const paragraphs = Array.from(document.querySelectorAll('p'));
  let visibleText = "";
  for (const p of paragraphs) {
    // Basic check for visibility and content length
    if (p.offsetParent !== null && p.textContent && p.textContent.trim().length > 50) {
      visibleText += p.textContent.trim() + "\n\n";
      if (visibleText.length > 1000) break; // Limit text sent
    }
  }

  if (visibleText.length > 100) { // Only send if there's a decent amount of text
    console.log("Sending text for analysis (first 100 chars):", visibleText.substring(0,100));
    chrome.runtime.sendMessage({
      action: "analyzeVisibleTextForCoPilot",
      visibleText: visibleText,
      // userProfile: null // TODO: Get user profile if needed for context
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message to service worker:", chrome.runtime.lastError.message);
      } else {
        console.log("Response from service worker:", response);
      }
    });
  }
}

// Example: Run analysis when the page is idle or after a delay
// This is a naive implementation. A more robust solution would use IntersectionObserver,
// MutationObserver, or listen to specific user interactions.
setTimeout(() => {
  // analyzeVisibleContent(); // Uncomment to enable proactive analysis
}, 5000); // Analyze after 5 seconds (very basic trigger)


// For communication from an injected React InsightCard component back to content script
window.addEventListener("message", (event) => {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.type && (event.data.type === "MINDFRAME_CHALLENGE_ACCEPTED")) {
    console.log("Content Script: Challenge accepted event received from InsightCard", event.data.payload);
    chrome.runtime.sendMessage({
      action: "coPilotChallengeAccepted",
      insightId: event.data.payload.insightId,
      hcId: event.data.payload.hcId,
      points: 5 // Example points
    });
  }

  if (event.data.type && (event.data.type === "MINDFRAME_DISMISS_INSIGHT")) {
    console.log("Content Script: Dismiss insight event received from InsightCard", event.data.payload);
    // Potentially notify service worker or log dismissal
  }
});
