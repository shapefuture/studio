// This can be moved to extension/src/popup_src/components/Logo.tsx
import type { SVGProps } from 'react';
// const APP_NAME = 'Mindframe OS'; // Defined in constants or passed as prop

export function Logo(props: SVGProps<SVGSVGElement> & { appName?: string }) {
  const appName = props.appName || 'Mindframe OS';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-primary"
      aria-label={`${appName} Logo`}
      {...props}
    >
      <title>{`${appName} Logo`}</title>
      {/* Brain-like shape */}
      <path d="M16.5 3.5c1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5M7.5 3.5C5.57 3.5 4 5.07 4 7s1.57 3.5 3.5 3.5" />
      <path d="M12 14.5a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M4.55 11A5.9 5.9 0 0 0 4 12.55C4 15.55 6.5 18 9.5 18c1.32 0 2.53-.46 3.47-1.24" />
      <path d="M19.45 11A5.9 5.9 0 0 1 20 12.55C20 15.55 17.5 18 14.5 18c-1.32 0-2.53-.46-3.47-1.24" />
      {/* Lightbulb/idea element within */}
      <path d="M12 14.5V11" /> 
      <path d="M10.5 8.5h3" /> 
      <path d="M9.5 11A2.5 2.5 0 0 1 12 8.5a2.5 2.5 0 0 1 2.5 2.5" />
      {/* Sparkles/activity around */}
      <path d="M12 6V4M18.36 5.64l1.42-1.42M5.64 5.64l-1.42-1.42M12 20v-2M18.36 18.36l1.42 1.42M5.64 18.36l-1.42 1.42" />
    </svg>
  );
}
