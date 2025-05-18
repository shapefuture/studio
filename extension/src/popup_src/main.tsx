
import React, { useEffect, useState, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MindframeStore } from '@core_logic/MindframeStore.js';
import '@assets/styles.css'; // Global styles for the popup (Tailwind base, etc.)

// Lazy load views for better initial load performance
const OnboardingView = React.lazy(() => import('@views/OnboardingView'));
const ProfileView = React.lazy(() => import('@views/ProfileView'));
const GymView = React.lazy(() => import('@views/GymView'));
const HcDetailView = React.lazy(() => import('@views/HcDetailView'));
const DrillView = React.lazy(() => import('@views/DrillView'));

const PopupLoadingFallback: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', backgroundColor: 'var(--background)' }}>
    {/* You can use a simple loading spinner here or an SVG */}
    <p style={{ color: 'var(--foreground)'}}>Loading Mindframe...</p>
  </div>
);

const AppRouter: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    MindframeStore.get().then(state => {
      if (state.userProfile && state.userProfile.onboardingCompletedTimestamp) {
        setInitialRoute('/profile');
      } else {
        setInitialRoute('/onboarding');
      }
    }).catch(error => {
      console.error("Error fetching initial state for router:", error);
      setInitialRoute('/onboarding'); // Fallback to onboarding on error
    });
  }, []);

  if (!initialRoute) {
    return <PopupLoadingFallback />;
  }

  return (
    <HashRouter>
      <Suspense fallback={<PopupLoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to={initialRoute} replace />} />
          <Route path="/onboarding" element={<OnboardingView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/gym" element={<GymView />} />
          <Route path="/hc-detail/:hcId" element={<HcDetailView />} />
          <Route path="/drill/:hcId/:drillId" element={<DrillView />} />
          {/* Add more routes as needed */}
          <Route path="*" element={<Navigate to={initialRoute} replace />} /> {/* Fallback for unknown routes */}
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppRouter />
    </React.StrictMode>
  );
} else {
  console.error("Target root element not found for Mindframe popup.");
}
