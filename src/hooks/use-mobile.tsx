// This hook can be moved to extension/src/popup_src/hooks/useIsMobile.ts if needed for popup responsiveness.
import * as React from "react"

const MOBILE_BREAKPOINT = 768 // Or a suitable breakpoint for the popup context

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // For a Chrome extension popup, window.innerWidth might be fixed or less relevant.
    // Consider if this hook is truly needed or if fixed-size design is sufficient.
    // For now, keeping it similar.
    const checkSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkSize(); // Initial check
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return !!isMobile;
}
