import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-primary"
      aria-label="Local Cognitive Coach Logo"
      {...props}
    >
      <path d="M12 2a10 10 0 0 0-7.5 16.5A5 5 0 0 1 12 15a5 5 0 0 1 7.5 3.5A10 10 0 0 0 12 2Z" />
      <path d="M12 15a2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 0-5Z" />
      <path d="M12 2v4" />
      <path d="m4.93 4.93 2.83 2.83" />
      <path d="M2 12h4" />
      <path d="m4.93 19.07 2.83-2.83" />
      <path d="m19.07 4.93-2.83 2.83" />
      <path d="M22 12h-4" />
      <path d="m19.07 19.07-2.83-2.83" />
    </svg>
  );
}
