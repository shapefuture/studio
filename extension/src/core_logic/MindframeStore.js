
/**
 * @file Manages the local storage for the Mindframe extension.
 * Uses chrome.storage.local for persistence.
 */

// JSDoc type imports (assuming types.ts is in the same directory or accessible via path alias)
/** @typedef {import('./types').MindframeStoreState} MindframeStoreState */
/** @typedef {import('./types').CognitiveProfileV1} CognitiveProfileV1 */
/** @typedef {import('./types').GamificationData} GamificationData */
/** @typedef {import('./types').Quest} Quest */
/** @typedef {import('./types').CompletedChallengeLogEntry} CompletedChallengeLogEntry */

export class MindframeStore {
  /**
   * The key used for storing data in chrome.storage.local.
   * @type {string}
   * @static
   * @readonly
   */
  static STORAGE_KEY = 'mindframe_os_data_v1'; // Updated key for new structure

  /**
   * The current version of the store data structure.
   * @type {number}
   * @static
   * @readonly
   */
  static CURRENT_VERSION = 1;

  /**
   * Generates a UUID v4.
   * @returns {string} A new UUID.
   * @private
   */
  static _generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Returns the default state for the store.
   * @returns {MindframeStoreState} The default store state.
   * @static
   */
  static getDefaultState() {
    const defaultUserId = this._generateUUIDv4();
    return {
      version: MindframeStore.CURRENT_VERSION,
      userId: defaultUserId,
      userProfile: null,
      onboardingProgress: {
        currentStep: 0,
        totalSteps: 5, // Example total steps
      },
      settings: {
        analysisEnabled: true,
        showInsightCard: true,
        theme: 'system',
      },
      cognitiveProfileHistory: [],
      gamificationData: {
        wxp: 0,
        level: 1,
      },
      activeQuestIds: [],
      completedQuestIds: [],
      completedDrillIds: [],
      completedChallengeLog: [],
      llmAnalysisCache: {},
      lastSyncTimestamp: null,
    };
  }

  /**
   * Retrieves the current state from chrome.storage.local.
   * Handles version migration by resetting to default if versions mismatch.
   * @returns {Promise<MindframeStoreState>} A promise that resolves with the store state.
   * @static
   */
  static get() {
    return new Promise((resolve) => {
      chrome.storage.local.get([MindframeStore.STORAGE_KEY], (result) => {
        /** @type {MindframeStoreState | undefined} */
        const storedState = result[MindframeStore.STORAGE_KEY];

        if (storedState && storedState.version === MindframeStore.CURRENT_VERSION) {
          // Ensure all default fields are present if state structure evolved
          const defaultStateForMerge = MindframeStore.getDefaultState();
          resolve({
            ...defaultStateForMerge,
            ...storedState,
            userId: storedState.userId || defaultStateForMerge.userId, // Ensure userId exists
            gamificationData: {
              ...defaultStateForMerge.gamificationData,
              ...(storedState.gamificationData || {}),
            },
            settings: {
              ...defaultStateForMerge.settings,
              ...(storedState.settings || {}),
            }
          });
        } else {
          if (storedState) {
            console.warn(
              `MindframeStore: Version mismatch. Expected ${MindframeStore.CURRENT_VERSION}, found ${storedState.version}. Resetting to default.`
            );
          } else {
            console.log("MindframeStore: No existing state found. Initializing with default state.");
          }
          // For MVP, reset to default. In future, implement migration logic here.
          const defaultState = MindframeStore.getDefaultState();
          chrome.storage.local.set({ [MindframeStore.STORAGE_KEY]: defaultState }, () => {
            resolve(defaultState);
          });
        }
      });
    });
  }

  /**
   * Updates the state in chrome.storage.local using an updater function.
   * The updater function receives the current state and should return the new state.
   * @param {(currentState: MindframeStoreState) => MindframeStoreState} updaterFn
   * @returns {Promise<MindframeStoreState>} A promise that resolves with the new state.
   * @static
   */
  static update(updaterFn) {
    return MindframeStore.get().then((currentState) => {
      const newState = updaterFn(currentState); // The prompt specified { ...currentState, ...updaterFn(currentState) }, which is unusual.
                                              // Standard is updaterFn receives current state and returns the new state entirely or partial to merge.
                                              // Given the JSDoc, updaterFn should return the *new* state.
                                              // The blueprint says: "newState = { ...currentState, ...updaterFn(currentState) }"
                                              // This implies updaterFn returns a partial state to be merged. Let's follow that.
                                              // However, the function signature `(currentState: MindframeStoreState) => MindframeStoreState` implies it returns a *complete* new state.
                                              // Re-reading: "The update function's merging logic should be newState = { ...currentState, ...updaterFn(currentState) }." This means the updater returns a PARTIAL update.
                                              // Let's correct this to:
                                              // const updates = updaterFn(currentState); // updaterFn returns a partial update
                                              // const newState = { ...currentState, ...updates };
                                              // For simplicity and robustness, let's assume updaterFn returns the *complete new state object*.
                                              // If it needs to be partial, the caller can do the merge before passing to updaterFn or updaterFn does it.
                                              // The prompt for `onboardingLogic.ts` says "Uses MindframeStore.update() to save profile". This typically means providing the full state or using a specific method.

                                              // Let's assume `updaterFn` returns the *complete new state*. This is more common for such store patterns.
                                              // If `updaterFn` is meant to return a partial update, then the logic here should be:
                                              // const partialUpdate = updaterFn(currentState);
                                              // const newState = { ...currentState, ...partialUpdate };
                                              // Given the complex state, assuming updaterFn returns the full new state is safer.

      // The prompt: "The update function's merging logic should be newState = { ...currentState, ...updaterFn(currentState) }."
      // This implies updaterFn returns a partial state. Let's try to adhere to that.
      // So, if updaterFn returns `{ wxp: 50 }`, newState becomes `{ ...currentState, wxp: 50 }`.
      // This means the type of updaterFn should be `(currentState: MindframeStoreState) => Partial<MindframeStoreState>`
      // But the prompt's AI Agent Request 1 doesn't specify this for the JSDoc for this function.
      // I will assume for now that updaterFn returns the *new complete state*.
      // If it's intended to be a partial update, then the call would be `const partialUpdates = updaterFn(currentState); const newState = {...currentState, ...partialUpdates};`

      // Sticking to the prompt for merging logic if updaterFn returns a partial update:
      // const partialUpdate = updaterFn(currentState); // This line makes updaterFn return Partial.
      // const newState = { ...currentState, ...partialUpdate }; // This line is from the prompt.

      // Let's reconcile. If updaterFn signature is (currentState) => MindframeStoreState, then it *returns* the new state.
      // If the prompt implies updaterFn *is* the partial update object itself, that's different.
      // "updaterFn(currentState)" - this means it's a function call.
      // So, `updaterFn` IS a function that takes current state and returns a partial state.

      const updates = updaterFn(currentState); // Assume updaterFn returns a *partial* state object.
      const newState = { ...currentState, ...updates };


      return new Promise((resolve) => {
        chrome.storage.local.set({ [MindframeStore.STORAGE_KEY]: newState }, () => {
          resolve(newState);
        });
      });
    });
  }

  /**
   * Clears all Mindframe data from local storage.
   * @returns {Promise<void>}
   * @static
   */
  static clear() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(MindframeStore.STORAGE_KEY, () => {
        console.log("MindframeStore cleared.");
        resolve();
      });
    });
  }
}
