
import React, { useState, useEffect } from 'react';
import type { UiInsight, LLMInsight, OfflineInsight, HCData } from '@core_logic/types';
import { hcLibraryData } from '@assets/data/hc_library_data';
import { AlertTriangle, Lightbulb, Zap, X, CheckCircle, HelpCircle, Eye, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming utils is setup for Vite (e.g. in src/lib)

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
  const HCLabel = relatedHC?.name || insight.hc_related || (insight.sourceType === 'llm' ? "Cognitive Pattern" : "Mindframe Tip");
  
  // Determine icon: LucideIcon or string (emoji)
  let HCIconComponent: React.ReactNode = <HelpCircle size={22} strokeWidth={2} />;
  if (relatedHC?.icon) {
    if (typeof relatedHC.icon === 'string') {
      HCIconComponent = <span className="text-xl">{relatedHC.icon}</span>;
    } else { // Assuming LucideIcon component
      const Icon = relatedHC.icon;
      HCIconComponent = <Icon size={22} strokeWidth={2} />;
    }
  } else if (insight.sourceType === 'llm') {
    HCIconComponent = <AlertTriangle size={22} strokeWidth={2} />;
  } else {
    HCIconComponent = <Lightbulb size={22} strokeWidth={2} />;
  }


  useEffect(() => {
    const visibleTimer = setTimeout(() => setIsVisible(true), 50);
    const challengeTimer = setTimeout(() => setShowMicroChallenge(true), 1200);
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

    // In a Chrome extension, if InsightCard is rendered by content_script.tsx,
    // this message would be sent from content_script to service_worker.
    // If this component itself needs to communicate (e.g. highlight), it would be via props or context.
    if (insight.sourceType === 'llm' && (insight as LLMInsight).highlight_suggestion_css_selector) {
      chrome.runtime.sendMessage({
          action: 'applyHighlightOnPage', // Message for content script to handle
          selector: (insight as LLMInsight).highlight_suggestion_css_selector
      });
    }
  };

  if (!insight) return null;

  const cardTheme = insight.sourceType === 'llm' ? 'amber' : 'sky';

  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-2xl shadow-apple-lg overflow-hidden transform transition-all duration-500 ease-out",
        "bg-card text-card-foreground border border-border/50", // Using theme variables
        "dark:bg-gray-800 dark:border-gray-700", // Explicit dark for extension context if theme not fully propagated
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
      )}
      // Apply glassmorphic via global styles if needed
      // className="glassmorphic ..." (ensure globals.css is injected or Tailwind plugin provides this)
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
            <h2 className="text-md font-semibold tracking-tight">{HCLabel}</h2>
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
              Related: "{(insight as LLMInsight).original_text_segment!.substring(0, 100)}..."
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
                        "ring-primary",
                        cardTheme === 'amber' ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-sky-500 hover:bg-sky-600 text-white",
                        "dark:hover:opacity-90"
                      )
                )}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5 inline-block" />
                {isChallengeAccepted ? 'Challenge Accepted!' : `Accept (+${WXP_FOR_CHALLENGE_ACCEPTED} WXP)`}
              </button>
            </div>
          </div>
        )}
      </div>

      {insight.hc_related && (
        <div className={cn(
            "px-4 py-2.5 border-t text-right",
            cardTheme === 'amber' ? "border-amber-500/30 bg-amber-500/5" : "border-sky-500/30 bg-sky-500/5",
            "dark:bg-opacity-10 dark:border-opacity-30"
        )}>
          <Link
            to={`/hc-detail/${insight.hc_related}`} // This needs to be a chrome.runtime.sendMessage if card is not in popup context
            onClick={(e) => {
              // If not in popup, prevent default and send message
              if (!window.location.hash.includes('/popup_src/')) { // crude check
                e.preventDefault();
                chrome.runtime.sendMessage({ action: 'openMindframePage', path: `/hc-detail/${insight.hc_related}` });
              }
            }}
            className={cn(
                "text-xs font-medium group inline-flex items-center",
                cardTheme === 'amber' ? "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300" : "text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            )}
          >
            Learn more about {HCLabel} <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5"/>
          </Link>
        </div>
      )}
    </div>
  );
};

export default InsightCard;
