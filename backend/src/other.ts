// This file should contain your functions relating to:
// - clear

import { setData } from './dataStore';
import { timeoutStore } from './launch';

/**
  * Reset the state of the application back to the start.
  *
  * @returns {}
*/
export function clear(): Record<string, never> {
  setData({
    users: [],
    missions: [],
    astronauts: [],
    sessions: [],
    launches: [],
    launchVehicles: []
  });
  timeoutStore.forEach((v) => clearTimeout(v));
  timeoutStore.clear();
  return {};
}
