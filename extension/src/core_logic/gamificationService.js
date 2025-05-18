
/**
 * @file Manages gamification logic like WXP and levels.
 */
// JSDoc type imports
/** @typedef {import('./types').MindframeStoreState} MindframeStoreState */
/** @typedef {import('./MindframeStore').MindframeStore} MindframeStore */ // Assuming MindframeStore is imported if needed directly, but we'll use its static methods.

// Assuming MindframeStore.js is in the same directory and MindframeStore is the class name
import { MindframeStore } from './MindframeStore.js';

export class GamificationService {
  /**
   * WXP thresholds for each level. Index corresponds to WXP needed to reach that level.
   * Level 1: 0 WXP
   * Level 2: 100 WXP
   * ...
   * @type {number[]}
   * @static
   * @readonly
   */
  static WXP_THRESHOLDS = [0, 100, 250, 500, 1000, 1500, 2100, 2800, 3600, 4500]; // WXP for L1, L2, ... L10

  /**
   * Calculates the user's level based on their WXP.
   * Levels are 1-indexed.
   * @param {number} wxp - The user's current WXP.
   * @returns {number} The calculated level.
   * @static
   */
  static getLevel(wxp) {
    for (let i = this.WXP_THRESHOLDS.length - 1; i >= 0; i--) {
      if (wxp >= this.WXP_THRESHOLDS[i]) {
        return i + 1; // Levels are 1-indexed (index 0 is 0 WXP for level 1)
      }
    }
    return 1; // Default to level 1 if WXP is somehow negative or thresholds are empty
  }

  /**
   * Adds WXP to the user's current total and updates their level accordingly.
   * @param {number} points - The amount of WXP to add.
   * @returns {Promise<{newWxp: number, newLevel: number, leveledUp: boolean}>}
   * A promise that resolves with the new WXP, new level, and a boolean indicating if the user leveled up.
   * @static
   */
  static async addWXP(points) {
    const currentState = await MindframeStore.get();
    const oldLevel = currentState.gamificationData.level;

    const newWxp = currentState.gamificationData.wxp + points;
    const newLevel = GamificationService.getLevel(newWxp);
    const leveledUp = newLevel > oldLevel;

    await MindframeStore.update((state) => ({
      ...state, // This spread is not in the prompt's example for MindframeStore.update
                  // but it makes sense if updaterFn returns a partial update
      gamificationData: {
        ...state.gamificationData,
        wxp: newWxp,
        level: newLevel,
      },
    }));
    // The prompt for MindframeStore.update says: const newState = { ...currentState, ...updates };
    // So, updaterFn should return a partial update.
    // Correct call to MindframeStore.update based on prompt:
    // await MindframeStore.update(state => ({ // state here is currentState
    //   gamificationData: { // This is the partial update object
    //     ...state.gamificationData,
    //     wxp: newWxp,
    //     level: newLevel,
    //   }
    // }));


    if (leveledUp) {
      console.log(`Leveled up from ${oldLevel} to ${newLevel}!`);
      // Here you could trigger notifications or other level-up events.
    }

    return { newWxp, newLevel, leveledUp };
  }

  /**
   * Gets the WXP needed to reach the next level.
   * @param {number} currentWxp - The user's current WXP.
   * @returns {number} WXP points needed for the next level, or 0 if at max level.
   * @static
   */
  static getWXPForNextLevel(currentWxp) {
    const currentLevel = GamificationService.getLevel(currentWxp);
    if (currentLevel >= GamificationService.WXP_THRESHOLDS.length) {
      return 0; // Max level reached or beyond defined thresholds
    }
    const wxpForNextLevelAbsolute = GamificationService.WXP_THRESHOLDS[currentLevel]; // Threshold to *reach* next level (level currentLevel+1)
    return wxpForNextLevelAbsolute - currentWxp;
  }
}
