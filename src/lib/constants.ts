
// This file's contents might be split or moved.
// For example, DEFAULT_COGNITIVE_PROFILE and DEFAULT_GAMIFICATION_DATA
// are more related to MindframeStore.js in the new structure.
// INTERESTS_OPTIONS could be in assets/data or a new constants.ts in core_logic.

// For now, I'll assume its contents are used by the new files,
// and specific constants will be defined where needed or in a new
// extension/src/core_logic/constants.ts file.

export const APP_NAME = 'Mindframe OS'; // Updated App Name

// These will likely be defined within MindframeStore.js or types.ts for defaults.
// export const DEFAULT_COGNITIVE_PROFILE: CognitiveProfileV1 = { ... };
// export const DEFAULT_GAMIFICATION_DATA: GamificationData = { ... };

// Moved to OnboardingView.tsx for popup context or a shared data file
// export const INTERESTS_OPTIONS = [ ... ];

// This should be an environment variable for the Cloudflare worker, not hardcoded client-side.
// export const LLM_PROXY_URL = process.env.NEXT_PUBLIC_LLM_PROXY_URL || 'http://127.0.0.1:8787/api/analyze';
// Service worker will have its own constant for this.
