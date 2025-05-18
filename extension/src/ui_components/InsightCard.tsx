
import React, { useState, useEffect } from 'react';
import type { UiInsight, HCData, LLMInsight } from '@core_logic/types';
import { hcLibraryData } from '@assets/data/hc_library_data'; // For HC icons/names
import { AlertTriangle, Lightbulb, Zap, X, CheckCircle, HelpCircle, Eye, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming utils is setup for Vite (e.g. in src/lib)

// Define WXP_FOR_CHALLENGE_ACCEPTED here if not imported, matching service_worker
const WXP_FOR_CHALLENGE_ACCEPTED = 15;

interface InsightCardProps {
  insight: UiInsight;
  onAccept: (challengePrompt: string, hcRelated: string | null) => void;
  onDismiss: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onAccept, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isChallengeAccepted, setIsChallengeAccepted] = useState(false);
  const [showMicroChallenge, setShowMicroChallenge] = useState(false);

  const relatedHC: HCData | undefined = insight.hc_related ? hcLibraryData.find(hc => hc.id === insight.hc_related) : undefined;
  
  // Determine Title and Icon
  let cardTitle = insight.title;
  if (!cardTitle) { // Fallback title logic if not provided by UiInsight directly
    if (insight.sourceType === 'llm') {
      cardTitle = insight.pattern_type === 'none' ? "General Reflection" : `Pattern: ${insight.pattern_type}`;
    } else {
      cardTitle = relatedHC?.name || "Mindframe Tip";
    }
  }

  let HCIconComponent: React.ReactNode = <Lightbulb size={22} strokeWidth={2} />; // Default for offline/tip
  if (relatedHC?.icon) {
    if (typeof relatedHC.icon === 'string') { // Emoji
      HCIconComponent = <span className="text-xl">{relatedHC.icon}</span>;
    } else { // LucideIcon component
      const IconComponent = relatedHC.icon;
      HCIconComponent = <IconComponent size={22} strokeWidth={2} />;
    }
  } else if (insight.sourceType === 'llm') {
    HCIconComponent = <AlertTriangle size={22} strokeWidth={2} />; // Default for LLM if no specific HC icon
  }


  useEffect(() => {
    const visibleTimer = setTimeout(() => setIsVisible(true), 50);
    // Reveal challenge prompt a bit later to allow reading the explanation
    const challengeTimer = setTimeout(() => setShowMicroChallenge(true), 2500); 
    return () => {
      clearTimeout(visibleTimer);
      clearTimeout(challengeTimer);
    };
  }, []);

  const handleDismissClick = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Match animation duration
  };

  const handleAcceptChallengeClick = () => {
    if (isChallengeAccepted) return;
    setIsChallengeAccepted(true);
    onAccept(insight.micro_challenge_prompt, insight.hc_related || null);

    // Message content script to highlight if selector exists
    if (insight.sourceType === 'llm' && (insight as LLMInsight).highlight_suggestion_css_selector) {
      chrome.runtime.sendMessage({
          action: 'applyHighlightOnPage',
          selector: (insight as LLMInsight).highlight_suggestion_css_selector
      }).catch(e => console.warn("InsightCard: Failed to send highlight message", e.message));
    }
  };

  if (!insight) return null;

  // Determine theme based on source or pattern
  const cardTheme = insight.sourceType === 'llm' 
    ? (insight.pattern_type === 'none' ? 'sky' : 'amber') // LLM general reflection vs specific pattern
    : 'sky'; // Offline insights use 'sky'

  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-2xl shadow-apple-lg overflow-hidden transform transition-all duration-500 ease-out",
        "bg-card text-card-foreground border border-border/50", 
        "dark:bg-gray-800 dark:border-gray-700", 
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 pb-3 border-b",
        cardTheme === 'amber' ? "border-amber-500/30" : "border-sky-500/30",
        "dark:border-opacity-50"
      )}>
        <div className="flex items-center space-x-2.5">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shadow-inner",
            cardTheme === 'amber' ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" : "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400"
          )}>
            {HCIconComponent}
          </div>
          <div>
            <h2 className="text-md font-semibold tracking-tight">{cardTitle}</h2>
            <p className="text-xs text-muted-foreground">
              {insight.sourceType === 'llm' ? 'AI Insight' : 'Mindframe Tip'}
            </p>
          </div>
        </div>
        <button
            onClick={handleDismissClick}
            aria-label="Dismiss insight"
            className="p-1 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
            <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-4">
        <div className="mb-3">
          <p className="text-foreground/90 dark:text-gray-300 text-sm leading-relaxed">
            {insight.explanation}
          </p>
          {insight.sourceType === 'llm' && (insight as LLMInsight).original_text_segment && (
            <div className="mt-2 p-2.5 bg-secondary/50 dark:bg-gray-700/40 rounded-lg border border-border/50 text-xs text-muted-foreground italic leading-normal">
              Related to: "{(insight as LLMInsight).original_text_segment!.substring(0, 100)}..."
            </div>
          )}
        </div>

        {insight.micro_challenge_prompt && (
          <div
            className={cn(
              "transition-all duration-500 ease-in-out overflow-hidden",
              showMicroChallenge ? 'max-h-96 opacity-100 mt-3.5' : 'max-h-0 opacity-0 mt-0'
            )}
          >
            <div className={cn(
                "p-3.5 rounded-lg border",
                cardTheme === 'amber' ? "bg-amber-500/5 border-amber-500/20 dark:bg-amber-900/10 dark:border-amber-500/30" : "bg-sky-500/5 border-sky-500/20 dark:bg-sky-900/10 dark:border-sky-500/30"
            )}>
              <h3 className={cn(
                  "font-semibold text-sm mb-1.5 flex items-center",
                  cardTheme === 'amber' ? "text-amber-700 dark:text-amber-300" : "text-sky-700 dark:text-sky-300"
              )}>
                <Zap className="w-3.5 h-3.5 mr-1.5"/>Mind Gym Prompt:
              </h3>
              <div className="p-2.5 bg-background/70 dark:bg-gray-800/40 rounded-md shadow-inner text-xs mb-3">
                <p className="text-foreground/80 dark:text-gray-300">{insight.micro_challenge_prompt}</p>
              </div>
              <button
                onClick={handleAcceptChallengeClick}
                disabled={isChallengeAccepted}
                className={cn(
                  "w-full text-xs font-medium py-2 px-3 rounded-md transition-all duration-150 ease-out focus-visible:ring-2 focus-visible:ring-offset-2",
                  isChallengeAccepted
                    ? "bg-positive text-positive-foreground cursor-not-allowed ring-green-500"
                    : cn(
                        "ring-primary", // For focus ring
                        cardTheme === 'amber' ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-sky-500 hover:bg-sky-600 text-white",
                        "dark:hover:opacity-90"
                      )
                )}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5 inline-block" />
                {isChallengeAccepted ? 'Challenge Logged!' : `Accept (+${WXP_FOR_CHALLENGE_ACCEPTED} WXP)`}
              </button>
            </div>
          </div>
        )}
      </div>

      {relatedHC && (
        <div className={cn(
            "px-4 py-2.5 border-t text-right",
            cardTheme === 'amber' ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-900/5" : "border-sky-500/30 bg-sky-500/5 dark:bg-sky-900/5",
            "dark:bg-opacity-10 dark:border-opacity-30"
        )}>
          <a // Using <a> for potential cross-origin if this card is ever rendered outside extension context.
            // For extension popup, Link from react-router-dom would be used.
            // For content script, this needs to message the service worker.
            href={`popup.html#/hc-detail/${relatedHC.id}`} // Simplified for direct popup linking if possible
            target="_blank" // Open in new tab if it's a direct link
            rel="noopener noreferrer"
            onClick={(e) => {
              // Check if we are in a context where chrome.runtime is available (i.e., content script)
              if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
                e.preventDefault(); // Prevent default link navigation
                chrome.runtime.sendMessage({ action: 'openMindframePage', path: `/hc-detail/${relatedHC.id}` })
                  .catch(err => console.warn("InsightCard: Error sending openMindframePage message:", err.message));
              }
              // If not in content script (e.g. in popup), let default behavior proceed or handle with React Router Link.
              // This component is designed for content_script primarily, so messaging is the main path.
            }}
            className={cn(
                "text-xs font-medium group inline-flex items-center",
                cardTheme === 'amber' ? "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300" : "text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            )}
          >
            Learn more about {relatedHC.name} <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5"/>
          </a>
        </div>
      )}
    </div>
  );
};

export default InsightCard;
