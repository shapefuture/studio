// src/app/page.tsx

import React from 'react';

// Minimal React component to satisfy Next.js build requirements.
// The main UI for the extension is handled by extension/src/popup_src/ via Vite.
export default function HomePage() {
  return (
    <div>
      <h1>Mindframe App (Next.js Fallback Page)</h1>
      <p>
        This page is a fallback for the Next.js environment.
        The primary Mindframe OS experience is delivered via the Chrome Extension.
      </p>
    </div>
  );
}
