
/**
 * @file Content script for Mindframe OS.
 * This script will be injected into web pages to monitor content
 * and display insights via the InsightCardReact component.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import type { UiInsight, LLMInsight } from '@core_logic/types';
import InsightCard from '@ui_components/InsightCard';

console.log("Mindframe OS Content Script Loaded (v2).");

let mindframeRoot: ReactDOM.Root | null = null;
let mindframeContainer: HTMLDivElement | null = null;

function ensureMindframeContainer(): HTMLDivElement {
  if (!mindframeContainer) {
    mindframeContainer = document.createElement('div');
    mindframeContainer.id = 'mindframe-os-container';
    mindframeContainer.style.position = 'fixed';
    mindframeContainer.style.bottom = '20px';
    mindframeContainer.style.right = '20px';
    mindframeContainer.style.zIndex = '2147483647'; 
    mindframeContainer.style.width = '380px';
    document.body.appendChild(mindframeContainer);
    console.log("Mindframe CS: Mindframe container created.");
  }
  if (!mindframeRoot) {
    mindframeRoot = ReactDOM.createRoot(mindframeContainer);
    console.log("Mindframe CS: React root created for Mindframe container.");
  }
  return mindframeContainer;
}

function unmountInsightCard() {
  if (mindframeRoot) {
    console.log("Mindframe CS: Unmounting InsightCard.");
    mindframeRoot.render(null); // This correctly unmounts the React component
  }
   if (mindframeContainer) {
    // Optionally remove container if no more insights are expected soon,
    // but for now, keep it for potential reuse.
    // mindframeContainer.remove();
    // mindframeContainer = null;
   }
}

function displayInsightCard(insightData: UiInsight) {
  ensureMindframeContainer();
  if (mindframeRoot) {
    console.log("Mindframe CS: Displaying InsightCard with data:", insightData);
    mindframeRoot.render(
      <React.StrictMode>
        <InsightCard
          insight={insightData}
          onAccept={(challengePrompt, hcRelated) => {
            console.log("Mindframe CS: Challenge Accepted from Card:", challengePrompt, hcRelated);
            chrome.runtime.sendMessage({
              action: 'coPilotChallengeAccepted',
              payload: {
                challengePrompt,
                hcRelated: hcRelated || null,
              }
            }).catch(error => console.error("Mindframe CS: Error sending coPilotChallengeAccepted message:", error));
            // setTimeout(unmountInsightCard, 3000); // Dismiss after 3s
          }}
          onDismiss={() => {
            console.log("Mindframe CS: Insight Dismissed from Card.");
            unmountInsightCard();
          }}
        />
      </React.StrictMode>
    );
  } else {
    console.error("Mindframe CS: mindframeRoot not available to display InsightCard.");
  }
}

function highlightPageElements(selector: string) {
  console.log(`Mindframe CS: Attempting to highlight elements with selector: '${selector}'`);
  try {
    document.querySelectorAll('.mindframe-highlight').forEach(el => {
      (el as HTMLElement).style.outline = '';
      (el as HTMLElement).style.boxShadow = '';
      el.classList.remove('mindframe-highlight');
    });

    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`Mindframe CS: Found ${elements.length} elements to highlight.`);
      elements.forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.classList.add('mindframe-highlight'); 
        htmlEl.style.outline = '3px solid orange';
        htmlEl.style.boxShadow = '0 0 10px orange';
        htmlEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      setTimeout(() => {
        elements.forEach(el => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.outline = '';
          htmlEl.style.boxShadow = '';
          htmlEl.classList.remove('mindframe-highlight');
        });
        console.log(`Mindframe CS: Removed highlight from elements.`);
      }, 7000);
    } else {
      console.warn(`Mindframe CS: No elements found for selector: '${selector}'`);
    }
  } catch (e) {
    console.error("Mindframe CS: Error highlighting elements:", e);
  }
}

class ContinuousContextMonitor {
  private lastAnalyzedText: string = "";
  private analysisCooldown: boolean = false;
  private readonly ANALYSIS_COOLDOWN_MS: number = 15000;
  private readonly MIN_RELEVANT_LENGTH: number = 150;
  private readonly MAX_TEXT_LENGTH: number = 1000;
  private observer: MutationObserver | null = null;
  private scrollTimeoutId: number | null = null;

  constructor() {
    this.init();
  }

  private init() {
    console.log("Mindframe CS: Initializing ContinuousContextMonitor.");
    setTimeout(() => this.analyzeVisibleContent(), 3000);

    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true, 
    });

    window.addEventListener('scroll', this.debouncedScrollHandler.bind(this));
    window.addEventListener('click', this.handleClickFocus.bind(this));
    console.log("Mindframe CS: MutationObserver and event listeners attached.");
  }

  private debouncedScrollHandler() {
    if (this.scrollTimeoutId) {
      clearTimeout(this.scrollTimeoutId);
    }
    this.scrollTimeoutId = window.setTimeout(() => {
      console.log("Mindframe CS: Scroll debounce triggered analysis.");
      this.analyzeVisibleContent();
    }, 500); 
  }

  private handleClickFocus(event: MouseEvent) {
    console.log("Mindframe CS: Click detected, analyzing content near target.");
    setTimeout(() => this.analyzeVisibleContent(event.target as HTMLElement), 200);
  }

  private handleMutations(mutations: MutationRecord[]) {
    if (this.analysisCooldown) return;

    let textChanged = false;
    for (const mutation of mutations) {
      if (mutation.type === 'characterData' && mutation.target.textContent && mutation.target.textContent.length > 20) {
        textChanged = true; break;
      }
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.textContent && node.textContent.length > this.MIN_RELEVANT_LENGTH / 2) {
            textChanged = true; break;
          }
        }
      }
      if (textChanged) break;
    }

    if (textChanged) {
      console.log("Mindframe CS: Significant DOM mutation detected, triggering analysis.");
      this.analyzeVisibleContent();
    }
  }

  private isAnalyzableElement(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();
    if (['p', 'article', 'section', 'main', 'li', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0 && element.getClientRects().length === 0) {
        return false; 
      }
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
          return false;
      }
      const text = (element as HTMLElement).innerText || element.textContent || "";
      return text.trim().length > this.MIN_RELEVANT_LENGTH / 5; // Adjusted for more granular elements
    }
    return false;
  }

  private extractTextFromVisibleElements(contextElement?: HTMLElement): string {
    let visibleText = "";
    const elements = contextElement 
        ? contextElement.querySelectorAll('p, li, span, div, article, section, main, h1, h2, h3, h4, h5, h6') 
        : document.querySelectorAll('article, section, main, p, li, div');
    
    Array.from(elements).forEach(el => {
      if (visibleText.length >= this.MAX_TEXT_LENGTH) return;
      if (this.isAnalyzableElement(el)) {
        const text = (el as HTMLElement).innerText || el.textContent || "";
        if (text) {
          visibleText += text.trim().replace(/\s\s+/g, ' ') + "\n";
        }
      }
    });
    return visibleText.trim().substring(0, this.MAX_TEXT_LENGTH);
  }

  public async analyzeVisibleContent(contextElement?: HTMLElement) {
    if (this.analysisCooldown) {
      console.log("Mindframe CS: Analysis skipped due to cooldown.");
      return;
    }

    const collectedText = this.extractTextFromVisibleElements(contextElement);

    if (collectedText.length < this.MIN_RELEVANT_LENGTH) {
      console.log(`Mindframe CS: Analysis skipped, insufficient relevant text (Length: ${collectedText.length}, Min: ${this.MIN_RELEVANT_LENGTH}).`);
      return;
    }
    if (collectedText === this.lastAnalyzedText) {
      console.log("Mindframe CS: Analysis skipped, text content unchanged.");
      return;
    }

    this.lastAnalyzedText = collectedText;
    this.analysisCooldown = true;
    setTimeout(() => {
      this.analysisCooldown = false;
      console.log("Mindframe CS: Analysis cooldown finished.");
    }, this.ANALYSIS_COOLDOWN_MS);

    console.log(`Mindframe CS: Analyzing text (Length: ${collectedText.length}). Sending to service worker.`);
    try {
      chrome.runtime.sendMessage({
        action: 'analyzeVisibleTextForCoPilot',
        payload: {
          visibleText: collectedText,
          pageUrl: window.location.href,
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Mindframe CS: Error sending message to service worker:", chrome.runtime.lastError.message);
        } else if (response?.status === 'error') {
          console.error("Mindframe CS: Service worker reported error during analysis:", response.error);
        } else {
           console.log("Mindframe CS: Analysis request acknowledged by service worker. Response:", response?.status);
        }
      });
    } catch (error) {
      console.error("Mindframe CS: Failed to send message to service worker:", error);
      this.analysisCooldown = false; // Reset cooldown if send fails immediately
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("Mindframe CS: DOMContentLoaded, initializing CCM.");
    new ContinuousContextMonitor();
  });
} else {
  console.log("Mindframe CS: DOM already loaded, initializing CCM.");
  new ContinuousContextMonitor();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Mindframe CS: Received message from runtime:", message);
  if (message.action === 'showMindframeCoPilotInsight' && message.insightData) {
    if (message.insightData.pattern_type !== 'none' || message.insightData.hc_related !== null) {
        const uiInsight: UiInsight = {
            id: message.insightData.id || Date.now().toString(),
            title: message.insightData.title || (message.insightData.pattern_type !== 'none' ? `Pattern: ${message.insightData.pattern_type}` : 'Mindframe Tip'),
            sourceType: message.insightData.sourceType || 'llm',
            hc_related: message.insightData.hc_related,
            explanation: message.insightData.explanation,
            micro_challenge_prompt: message.insightData.micro_challenge_prompt,
            highlight_suggestion_css_selector: message.insightData.highlight_suggestion_css_selector,
            original_text_segment: message.insightData.original_text_segment,
            timestamp: message.insightData.timestamp || Date.now(),
        };
        console.log("Mindframe CS: Processing 'showMindframeCoPilotInsight' action.");
        displayInsightCard(uiInsight);
        sendResponse({ status: 'Insight display attempt initiated.' });
    } else {
        console.log("Mindframe CS: Insight data has 'none' pattern and no hc_related, skipping display.");
        sendResponse({ status: 'Insight skipped (none pattern).' });
    }
  } else if (message.action === 'applyHighlightOnPage' && message.selector) {
    console.log("Mindframe CS: Processing 'applyHighlightOnPage' action.");
    highlightPageElements(message.selector);
    sendResponse({ status: 'Highlight attempted on page.' });
  }
  // Keep message channel open for async response if needed by other handlers, though current ones respond sync.
  // Return true only if you intend to use sendResponse asynchronously.
  return true; 
});
