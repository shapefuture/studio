'use strict';

console.log("Mindframe MVP Content Script Loaded.");

let currentInsightElement: HTMLElement | null = null;

// Simple hashing function (not cryptographically secure, just for basic caching key)
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}

function displayInsightUI(insightData: any) { // Accepts LLMInsight or UiInsight structure
  if (currentInsightElement) {
    currentInsightElement.remove();
    currentInsightElement = null;
  }

  // Check for the "no insight" case
  if (insightData.pattern_type === 'none' && (insightData.hc_related === 'none' || !insightData.hc_related)) {
      console.log("Mindframe: No specific insight to display.");
      return;
  }

  const insightId = insightData.id || simpleHash(insightData.explanation + (insightData.micro_challenge_prompt || insightData.challengePrompt || ""));

  const insightContainer = document.createElement('div');
  insightContainer.id = `mindframe-insight-${insightId}`;
  insightContainer.style.position = 'fixed';
  insightContainer.style.bottom = '20px';
  insightContainer.style.right = '20px';
  insightContainer.style.width = '360px';
  insightContainer.style.maxHeight = 'calc(100vh - 40px)';
  insightContainer.style.overflowY = 'auto';
  insightContainer.style.backgroundColor = '#ffffff';
  insightContainer.style.border = '1px solid #e0e0e0';
  insightContainer.style.borderRadius = '12px';
  insightContainer.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
  insightContainer.style.padding = '20px';
  insightContainer.style.zIndex = '2147483647';
  insightContainer.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'";
  insightContainer.style.fontSize = '14px';
  insightContainer.style.color = '#333333';
  insightContainer.style.lineHeight = '1.6';

  const headerDiv = document.createElement('div');
  headerDiv.style.display = 'flex';
  headerDiv.style.justifyContent = 'space-between';
  headerDiv.style.alignItems = 'center';
  headerDiv.style.marginBottom = '12px';

  const titleElement = document.createElement('h3');
  titleElement.textContent = insightData.title || (insightData.pattern_type === 'none' ? "General Reflection" : `Potential Pattern: ${insightData.pattern_type}`);
  titleElement.style.fontSize = '17px';
  titleElement.style.fontWeight = '600';
  titleElement.style.color = insightData.sourceType === 'llm' || insightData.pattern_type ? '#C2410C' : '#0284C7'; // More distinct colors
  titleElement.style.margin = '0';

  const dismissButtonTop = document.createElement('button');
  dismissButtonTop.innerHTML = '&times;'; // Close icon
  dismissButtonTop.title = 'Dismiss Insight';
  dismissButtonTop.style.background = 'transparent';
  dismissButtonTop.style.border = 'none';
  dismissButtonTop.style.fontSize = '24px';
  dismissButtonTop.style.lineHeight = '1';
  dismissButtonTop.style.color = '#999999';
  dismissButtonTop.style.cursor = 'pointer';
  dismissButtonTop.style.padding = '0 4px';
  dismissButtonTop.onmouseover = () => dismissButtonTop.style.color = '#333333';
  dismissButtonTop.onmouseout = () => dismissButtonTop.style.color = '#999999';
  dismissButtonTop.onclick = () => {
    insightContainer.remove();
    currentInsightElement = null;
  };

  headerDiv.appendChild(titleElement);
  headerDiv.appendChild(dismissButtonTop);
  insightContainer.appendChild(headerDiv);

  if (insightData.explanation) {
    const explanationElement = document.createElement('p');
    explanationElement.textContent = insightData.explanation;
    explanationElement.style.marginBottom = '16px';
    insightContainer.appendChild(explanationElement);
  }

  const challengePromptText = insightData.challengePrompt || insightData.micro_challenge_prompt;
  if (challengePromptText) {
    const challengeTitle = document.createElement('h4');
    challengeTitle.textContent = 'Challenge Prompt:';
    challengeTitle.style.fontSize = '15px';
    challengeTitle.style.fontWeight = '600';
    challengeTitle.style.marginBottom = '6px';
    challengeTitle.style.color = '#555555';
    
    const challengeElement = document.createElement('p');
    challengeElement.textContent = challengePromptText;
    challengeElement.style.fontStyle = 'italic';
    challengeElement.style.backgroundColor = '#f9fafb';
    challengeElement.style.padding = '10px';
    challengeElement.style.borderRadius = '6px';
    challengeElement.style.border = '1px dashed #e0e0e0';
    challengeElement.style.marginBottom = '16px';

    insightContainer.appendChild(challengeTitle);
    insightContainer.appendChild(challengeElement);

    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept Challenge';
    acceptButton.style.backgroundColor = '#16A34A'; // Green
    acceptButton.style.color = 'white';
    acceptButton.style.border = 'none';
    acceptButton.style.padding = '10px 16px';
    acceptButton.style.borderRadius = '6px';
    acceptButton.style.cursor = 'pointer';
    acceptButton.style.fontWeight = '500';
    acceptButton.style.fontSize = '14px';
    acceptButton.onclick = () => {
      chrome.runtime.sendMessage({
        action: "coPilotChallengeAccepted",
        insightId: insightId,
        hcId: insightData.hcId || insightData.hc_related,
        points: 5
      });
      challengeElement.textContent = "Challenge accepted! Reflect on this as you continue.";
      challengeElement.style.color = '#16A34A';
      challengeElement.style.fontWeight = '500';
      challengeElement.style.borderStyle = 'solid';
      challengeElement.style.borderColor = '#D1FAE5';
      challengeElement.style.backgroundColor = '#ECFDF5';
      acceptButton.disabled = true;
      acceptButton.style.opacity = '0.6';
      acceptButton.style.cursor = 'default';
    };
    insightContainer.appendChild(acceptButton);
  }

  document.body.appendChild(insightContainer);
  currentInsightElement = insightContainer;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Mindframe: Content script received message:", message, "from sender:", sender);

  if (message.action === "showMindframeCoPilotInsight") {
    if (message.insightData) {
        displayInsightUI(message.insightData);
    } else {
        console.log("Mindframe: No insight data received to show.");
    }
    sendResponse({ status: "Insight UI attempt" });
  } else if (message.action === "highlightElementOnPage") {
    if (message.selector) {
      try {
        const elements = document.querySelectorAll(message.selector);
        if (elements.length === 0) {
          console.log(`Mindframe: No elements found for selector: ${message.selector}`);
          sendResponse({ status: "Highlight failed", error: "No elements found." });
          return true;
        }
        elements.forEach(el => {
          const htmlEl = el as HTMLElement;
          const originalOutline = htmlEl.style.outline;
          const originalBoxShadow = htmlEl.style.boxShadow;

          htmlEl.style.outline = "3px solid #F59E0B"; // Amber color
          htmlEl.style.boxShadow = "0 0 15px #F59E0B, 0 0 5px #F59E0B inset";
          htmlEl.style.transition = "outline 0.3s ease-in-out, boxShadow 0.3s ease-in-out";
          
          if (typeof htmlEl.scrollIntoView === 'function') {
            htmlEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }

          setTimeout(() => {
            htmlEl.style.outline = originalOutline; 
            htmlEl.style.boxShadow = originalBoxShadow;
          }, 5000);
        });
        console.log(`Mindframe: Highlighted elements matching selector: ${message.selector}`);
        sendResponse({ status: "Highlight successful" });
      } catch (e) {
        console.error("Mindframe: Error highlighting element:", e);
        sendResponse({ status: "Highlight failed", error: (e as Error).message });
      }
    } else {
      sendResponse({ status: "Highlight failed", error: "No selector provided." });
    }
  }
  return true; 
});

function analyzeVisibleContent() {
  const mainContentSelectors = ['article', 'main', '[role="main"]', '.post-content', '.entry-content', '.article-body', '.content', '#content', '#main-content'];
  let contentHost: Element | null = null;

  for (const selector of mainContentSelectors) {
    contentHost = document.querySelector(selector);
    if (contentHost) break;
  }

  if (!contentHost) {
    // If no specific main content area, try to find a large div that isn't header/footer/nav
    const allDivs = Array.from(document.querySelectorAll('body > div'));
    allDivs.sort((a,b) => b.scrollHeight * b.clientWidth - a.scrollHeight * a.clientWidth); // Sort by area
    for (const div of allDivs) {
        const tag = div.tagName.toLowerCase();
        const id = div.id.toLowerCase();
        const classList = Array.from(div.classList).join(' ').toLowerCase();
        if (!/(header|nav|footer|sidebar|menu|banner|ad)/.test(id) && !/(header|nav|footer|sidebar|menu|banner|ad)/.test(classList) && div.clientHeight > 300) {
            contentHost = div;
            break;
        }
    }
    if(!contentHost) contentHost = document.body; 
  }
  
  const nonContentTags = new Set(['NAV', 'FOOTER', 'ASIDE', 'HEADER', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'BUTTON', 'A', 'FORM', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL']);
  const minParagraphLength = 70; 
  const maxTextLength = 2000; 
  let visibleText = "";
  let nodesProcessed = 0;

  function extractText(node: Node) {
    if (nodesProcessed > 500 || visibleText.length > maxTextLength) return; // Limit processing

    if (node.nodeType === Node.TEXT_NODE) {
        const parentElement = node.parentElement;
        if (parentElement && parentElement.offsetParent !== null) { // Check visibility of parent
            const text = node.textContent?.trim();
            if (text && text.length > 10) { // Collect smaller chunks and join later
                 // Basic check to avoid navigation links or button texts if missed by tag filter
                if (parentElement.tagName !== 'A' && parentElement.tagName !== 'BUTTON' && !parentElement.closest('nav, footer, aside')) {
                     visibleText += text + " ";
                }
            }
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.offsetParent !== null && !nonContentTags.has(element.tagName.toUpperCase())) {
             // Check if element is reasonably visible
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0) {
                for (const childNode of Array.from(element.childNodes)) {
                    extractText(childNode);
                    if (visibleText.length > maxTextLength) break;
                }
            }
        }
    }
    nodesProcessed++;
  }
  
  extractText(contentHost);
  visibleText = visibleText.replace(/\s\s+/g, ' ').trim(); // Clean up spaces

  if (visibleText.length > minParagraphLength) { 
    console.log("Mindframe: Sending text for analysis (length):", visibleText.length);
    chrome.runtime.sendMessage({
      action: "analyzeVisibleTextForCoPilot",
      visibleText: visibleText.substring(0, maxTextLength),
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Mindframe: Error sending message to service worker:", chrome.runtime.lastError.message);
      } else if (response) {
        console.log("Mindframe: Response from service worker for text analysis:", response.status);
      }
    });
  } else {
    console.log("Mindframe: Not enough relevant text found for analysis (found " + visibleText.length + " chars).");
  }
}

setTimeout(() => {
  analyzeVisibleContent(); 
}, 5000); 


window.addEventListener("message", (event) => {
  if (event.source !== window) {
    return;
  }

  if (event.data.type && (event.data.type === "MINDFRAME_CHALLENGE_ACCEPTED")) {
    console.log("Mindframe: Content Script: Challenge accepted event received from InsightCard", event.data.payload);
    chrome.runtime.sendMessage({
      action: "coPilotChallengeAccepted",
      insightId: event.data.payload.insightId,
      hcId: event.data.payload.hcId,
      points: event.data.payload.points || 5 
    });
  }

  if (event.data.type && (event.data.type === "MINDFRAME_DISMISS_INSIGHT")) {
    console.log("Mindframe: Content Script: Dismiss insight event received from InsightCard", event.data.payload);
    if (currentInsightElement && currentInsightElement.id === `mindframe-insight-${event.data.payload.insightId}`) {
        currentInsightElement.remove();
        currentInsightElement = null;
    }
  }
});