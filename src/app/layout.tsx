import type { Metadata } from 'next';
import './globals.css'; // Assuming globals.css might still be used by a Next.js process

export const metadata: Metadata = {
  title: 'Mindframe App (Next.js Fallback Layout)',
  description: 'Mindframe Application (Next.js Fallback Layout for compatibility)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* This is a minimal layout to prevent Next.js errors.
            The main UI for the extension is handled by extension/src/popup_src/ via Vite. */}
        {children}
      </body>
    </html>
  );
}
