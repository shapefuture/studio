
/**
 * @file Content script for Mindframe OS.
 * This script will be injected into web pages to monitor content
 * and display insights via the InsightCardReact component.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
// Types will be imported from @core_logic/types
import type { LLMInsight, OfflineInsight, UiInsight } from '@core_logic/types'; // Assuming types are in core_logic
import InsightCard from '@ui_components/InsightCard'; // Path based on new structure

console.log("Mindframe OS Content Script Loaded.");

let mindframeRoot: ReactDOM.Root | null = null;
let mindframeContainer: HTMLDivElement | null = null;

function ensureMindframeContainer(): HTMLDivElement {
  if (!mindframeContainer) {
    mindframeContainer = document.createElement('div');
    mindframeContainer.id = 'mindframe-os-container';
    // Basic styling for the container - can be enhanced with Tailwind if this script itself uses it
    // or via injected CSS. For now, direct styling.
    mindframeContainer.style.position = 'fixed';
    mindframeContainer.style.bottom = '20px';
    mindframeContainer.style.right = '20px';
    mindframeContainer.style.zIndex = '2147483647'; // Max z-index
    mindframeContainer.style.width = '380px'; // Max width for the card
    document.body.appendChild(mindframeContainer);
  }
  if (!mindframeRoot) {
    mindframeRoot = ReactDOM.createRoot(mindframeContainer);
  }
  return mindframeContainer;
}

function unmountInsightCard() {
  if (mindframeRoot) {
    mindframeRoot.render(null);
  }
}

/**
 * Renders the InsightCardReact component on the page.
 * @param insightData - The insight data to display.
 */
function displayInsightCard(insightData: UiInsight) {
  ensureMindframeContainer();
  if (mindframeRoot) {
    mindframeRoot.render(
      <React.StrictMode>
        <InsightCard
          insight={insightData}
          onAccept={(challengePrompt, hcRelated) => {
            console.log("Challenge Accepted from Card:", challengePrompt, hcRelated);
            chrome.runtime.sendMessage({
              action: 'coPilotChallengeAccepted',
              payload: {
                challengePrompt,
                hcRelated: hcRelated || null, // Ensure hcRelated is string or null
                // WXP points can be defined in service_worker or passed here
              }
            });
            // Optionally, provide feedback in the card or unmount after a delay
            setTimeout(unmountInsightCard, 3000); // Dismiss after 3s
          }}
          onDismiss={() => {
            console.log("Insight Dismissed from Card");
            unmountInsightCard();
          }}
        />
      </React.StrictMode>
    );
  }
}

/**
 * Highlights elements on the page matching the CSS selector.
 * @param selector - The CSS selector for elements to highlight.
 */
function highlightPageElements(selector: string) {
  try {
    document.querySelectorAll('.mindframe-highlight').forEach(el => {
      (el as HTMLElement).style.outline = '';
      (el as HTMLElement).style.boxShadow = '';
      el.classList.remove('mindframe-highlight');
    });

    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      elements.forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.classList.add('mindframe-highlight'); // For potential CSS targeting
        htmlEl.style.outline = '3px solid orange'; // Example highlight
        htmlEl.style.boxShadow = '0 0 10px orange';
        htmlEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      // Remove highlight after a delay
      setTimeout(() => {
        elements.forEach(el => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.outline = '';
          htmlEl.style.boxShadow = '';
          htmlEl.classList.remove('mindframe-highlight');
        });
      }, 7000); // Highlight for 7 seconds
    }
  } catch (e) {
    console.error("Mindframe: Error highlighting elements:", e);
  }
}


class ContinuousContextMonitor {
  private lastAnalyzedText: string = "";
  private analysisCooldown: boolean = false;
  private readonly ANALYSIS_COOLDOWN_MS: number = 15000; // 15 seconds
  private readonly MIN_RELEVANT_LENGTH: number = 150;
  private readonly MAX_TEXT_LENGTH: number = 1000; // As per prompt
  private observer: MutationObserver | null = null;
  private scrollTimeoutId: number | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Initial analysis after page load
    setTimeout(() => this.analyzeVisibleContent(), 3000);

    // Setup MutationObserver
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true, // Observe text changes within nodes
    });

    // Setup scroll listener (debounced)
    window.addEventListener('scroll', this.debouncedScrollHandler.bind(this));
    window.addEventListener('click', this.handleClickFocus.bind(this)); // Analyze on click potentially
  }

  private debouncedScrollHandler() {
    if (this.scrollTimeoutId) {
      clearTimeout(this.scrollTimeoutId);
    }
    this.scrollTimeoutId = window.setTimeout(() => {
      this.analyzeVisibleContent();
    }, 500); // Analyze 500ms after scroll stops
  }

  private handleClickFocus(event: MouseEvent) {
    // Analyze content around the clicked element after a short delay
    // This can help capture dynamically loaded content or user focus areas
    setTimeout(() => this.analyzeVisibleContent(event.target as HTMLElement), 200);
  }


  private handleMutations(mutations: MutationRecord[]) {
    // Basic check if significant text content has changed
    let textChanged = false;
    for (const mutation of mutations) {
      if (mutation.type === 'characterData' && mutation.target.textContent && mutation.target.textContent.length > 20) {
        textChanged = true;
        break;
      }
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.textContent && node.textContent.length > this.MIN_RELEVANT_LENGTH / 2) {
            textChanged = true;
            break;
          }
        }
      }
      if (textChanged) break;
    }

    if (textChanged) {
      this.analyzeVisibleContent();
    }
  }

  private isAnalyzableElement(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();
    // Prioritize common content tags
    if (['p', 'article', 'section', 'main', 'li', 'div'].includes(tagName)) {
      // Check visibility
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0 && element.getClientRects().length === 0) {
        return false; // Not visible
      }
      // Check if element is within viewport (simplified)
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
          return false;
      }

      const text = (element as HTMLElement).innerText || element.textContent || "";
      return text.trim().length > this.MIN_RELEVANT_LENGTH / 3; // Shorter threshold for individual elements
    }
    return false;
  }

  private extractTextFromVisibleElements(contextElement?: HTMLElement): string {
    let visibleText = "";
    const elements = contextElement ? contextElement.querySelectorAll('p, li, span, div') : document.querySelectorAll('article, section, main, p, li');
    
    Array.from(elements).forEach(el => {
      if (visibleText.length >= this.MAX_TEXT_LENGTH) return;
      if (this.isAnalyzableElement(el)) {
        const text = (el as HTMLElement).innerText || el.textContent || "";
        if (text) {
          visibleText += text.trim() + "\n";
        }
      }
    });
    return visibleText.replace(/\s\s+/g, ' ').trim().substring(0, this.MAX_TEXT_LENGTH);
  }


  public async analyzeVisibleContent(contextElement?: HTMLElement) {
    if (this.analysisCooldown) return;

    const collectedText = this.extractTextFromVisibleElements(contextElement);

    if (collectedText.length < this.MIN_RELEVANT_LENGTH || collectedText === this.lastAnalyzedText) {
      return;
    }

    this.lastAnalyzedText = collectedText;
    this.analysisCooldown = true;
    setTimeout(() => (this.analysisCooldown = false), this.ANALYSIS_COOLDOWN_MS);

    console.log("Mindframe OS: Analyzing text (length " + collectedText.length + ")");
    try {
      chrome.runtime.sendMessage({
        action: 'analyzeVisibleTextForCoPilot',
        payload: {
          visibleText: collectedText,
          pageUrl: window.location.href,
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Mindframe OS: Error sending message to service worker:", chrome.runtime.lastError.message);
        } else if (response?.status === 'error') {
          console.error("Mindframe OS: Service worker reported error:", response.error);
        } else {
          // console.log("Mindframe OS: Analysis request sent, SW response:", response);
        }
      });
    } catch (error) {
      console.error("Mindframe OS: Failed to send message to service worker:", error);
      // Reset cooldown if send fails immediately.
      this.analysisCooldown = false;
    }
  }
}

// Initialize the context monitor
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ContinuousContextMonitor());
} else {
  new ContinuousContextMonitor();
}

// Listen for messages from the service worker or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showMindframeCoPilotInsight' && message.insightData) {
    // Ensure pattern_type and other fields are present
    if (message.insightData.pattern_type !== 'none' || message.insightData.hc_related !== null) {
        const uiInsight: UiInsight = {
            id: message.insightData.id || Date.now().toString(), // Ensure ID
            title: message.insightData.title || (message.insightData.pattern_type !== 'none' ? `Pattern: ${message.insightData.pattern_type}` : 'Mindframe Tip'),
            sourceType: message.insightData.sourceType || 'llm', // Assume LLM if not specified
            hc_related: message.insightData.hc_related,
            explanation: message.insightData.explanation,
            micro_challenge_prompt: message.insightData.micro_challenge_prompt,
            highlight_suggestion_css_selector: message.insightData.highlight_suggestion_css_selector,
            original_text_segment: message.insightData.original_text_segment,
            timestamp: message.insightData.timestamp || Date.now(),
        };
        displayInsightCard(uiInsight);
    }
    sendResponse({ status: 'Insight displayed or skipped' });
  } else if (message.action === 'applyHighlightOnPage' && message.selector) {
    highlightPageElements(message.selector);
    sendResponse({ status: 'Highlight attempted' });
  }
  return true; // Keep message channel open for async response if needed elsewhere
});
