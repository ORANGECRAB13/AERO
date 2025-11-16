// This file should contain your functions relating to:
// - adminMission*

import { getData, setData } from './dataStore';
import {
  getMissionFromMissionId,
  getControlUserIdFromSessionId,
  getAstronautFromAstronautId,
  getControlUserFromEmail,
  getTime
} from './helper';
import { errorMessages } from './testSamples';
import {
  AdminMissionListReturn,
  AdminMissionCreateReturn,
  AdminMissionInfoReturn,
  Mission
} from './interfaces';
import HTTPError from 'http-errors';

const MISSION_NAME_MIN_LENGTH = 3;
const MISSION_NAME_MAX_LENGTH = 30;
const MISSION_NAME_REGEX = /[^A-za-z0-9 ]/;
const MISSION_DESCRIPTION_MAX_LENGTH = 400;
const MISSION_TARGET_MAX_LENGTH = 100;

/**
 * Validates mission name meets format requirements and is unique for the user
 * @param {string} name - Mission name to validate
 * @param {number} controlUserId - ID of the user creating/updating the mission
 * @returns {void} - throws HTTPError if invalid
 *
 * Requirements:
 * - Must be between 3 and 30 characters long
 * - Can only contain letters, numbers, and spaces
 * - Must be unique among the user's missions
 */
export function isMissionNameValid(name: string, controlUserId: number): void {
  if (name.length > MISSION_NAME_MAX_LENGTH || name.length < MISSION_NAME_MIN_LENGTH) {
    throw HTTPError(400, errorMessages.BAD_INPUT.MISSION.nameInvalidLength);
  }

  const nameInvalidChars = MISSION_NAME_REGEX.test(name);
  if (nameInvalidChars) {
    throw HTTPError(400, errorMessages.BAD_INPUT.MISSION.nameInvalidChars);
  }

  const nameUsedByUser =
    getData().missions.some(mission => mission.controlUserId === controlUserId && mission.name === name);
  if (nameUsedByUser) {
    throw HTTPError(400, errorMessages.BAD_INPUT.MISSION.nameUsed);
  }
}

/**
 * Validates mission description length
 * @param {string} description - Mission description to validate
 * @returns {void} - throws HTTPError if invalid
 *
 * Requirements:
 * - Must be 400 characters or less
 */
export function isMissionDescriptionValid(description: string): void {
  if (description.length > MISSION_DESCRIPTION_MAX_LENGTH) {
    throw HTTPError(400, errorMessages.BAD_INPUT.MISSION.description);
  }
}

/**
 * Validates mission target length
 * @param {string} target - Mission target to validate
 * @returns {void} - throws HTTPError if invalid
 *
 * Requirements:
 * - Must be 100 characters or less
 */
export function isMissionTargetValid(target: string): void {
  if (target.length > MISSION_TARGET_MAX_LENGTH) {
    throw HTTPError(400, errorMessages.BAD_INPUT.MISSION.target);
  }
}

/**
  * List all active missions
  *
  * @param {string} controlUserSessionId - unique identifier for a user
  *
  * @returns { error: String, errorCategory: 'INVALID_CREDENTIALS' } - if user id does not exist in data
  * @returns { missionId: Number, name: String } - on successful inputs
*/
export function adminMissionList(controlUserSessionId: string): AdminMissionListReturn {
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
  const data = getData();
  const missions = data.missions
    .filter(mission => (mission.controlUserId === controlUserId && mission.active === true))
    .map(mission => ({ missionId: mission.missionId, name: mission.name }));
  return { missions };
}

/**
  * Creates a new mission
  *
  * @param {string} controlUserSessionId - requesting user's ID number
  * @param {String} name - Mission Name
  * @param {String} description - Mission Description
  * @param {String} target - Mission target
  *
  * @returns { error: String, errorCategory: 'specific errorCategories' } - for invalid inputs
  * @returns { missionId } - for valid inputs
*/
export function adminMissionCreate(
  controlUserSessionId: string, name: string, description: string, target: string
): AdminMissionCreateReturn {
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
  isMissionNameValid(name, controlUserId);
  isMissionDescriptionValid(description);
  isMissionTargetValid(target);

  const data = getData();
  // mission ID
  let missionId;
  if (data.missions.length === 0) {
    missionId = 1;
  } else {
    missionId = Math.max(...data.missions.map(m => m.missionId)) + 1;
  }

  const currentTime = getTime();
  const MissionContent: Mission = {
    active: true,
    missionId,
    controlUserId,
    name,
    description,
    target,
    assignedAstronauts: [],
    timeCreated: currentTime,
    timeLastEdited: currentTime,
  };
  data.missions.push(MissionContent);
  setData(data);
  return { missionId };
}

/**
  * Remove one mission specified by the missionid
  *
  * @param {String} controlUserSessionId - unique identifier for a user
  * @param {Number} missionId - unique identifier for a mission
  *
  * @returns { error: String, errorCategory: 'INVALID_CREDENTIALS' } - if user id does not exist in data
  * @returns { error: String, errorCategory: 'INACCESSIBLE_VALUE' }
  *   - if missionId does not refer to a valid space mission, or a space mission that this mission control user owns.
  * @returns {} - if remove is successful
*/
export function adminMissionRemove(controlUserSessionId: string, missionId: number): Record<string, never> {
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
  const mission = getMissionFromMissionId(missionId, controlUserId);

  if (mission.assignedAstronauts.length !== 0) {
    throw HTTPError(400, errorMessages.BAD_INPUT.MISSION.missionHasAstronautAssigned);
  }
  mission.active = false;

  const data = getData();
  setData(data);
  return {};
}

/**
 * Get mission information for a specific mission owned by the control user
 *
 * @param {string} controlUserSessionId - unique identifier for a user
 * @param {Number} missionId - unique identifier for a mission
 *
 * @returns { error: String, errorCategory: 'INVALID_CREDENTIALS' } - if user id does not exist in data
 * @returns { error: String, errorCategory: 'INACCESSIBLE_VALUE' }
 * - if missionId does not refer to a valid space mission, or a space mission that this mission control user owns.
 * @returns { missionId: Number, name: String, timeCreated: String, timeLastEdited: String, description: String, target: String } - if retrieval is successful
 */
export function adminMissionInfo(controlUserSessionId: string, missionId: number): AdminMissionInfoReturn {
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
  const mission = getMissionFromMissionId(missionId, controlUserId);

  return {
    missionId: mission.missionId,
    name: mission.name,
    timeCreated: mission.timeCreated,
    timeLastEdited: mission.timeLastEdited,
    description: mission.description,
    target: mission.target,
    assignedAstronauts: mission.assignedAstronauts
  };
}

/**
 * Update the name of the relevant space mission.
 *
 * @param {String} controlUserSessionId - unique identifier for a user
 * @param {Number} missionId - unique identifier for a mission
 * @param {String} name - new name for the mission
 *
 * @returns { error: String, errorCategory: 'INVALID_CREDENTIALS' } - if user id does not exist in data
 * @returns { error: String, errorCategory: 'INACCESSIBLE_VALUE' }
 * - if missionId does not refer to a valid active space mission, or a space mission that this mission control user owns.
 * @returns { error: String, errorCategory: 'BAD_INPUT' }
 * - if name is less than 3 characters or more than 30 characters long, contains invalid characters (only alphanumeric and spaces are valid), or is already used by the current user for another active mission.
 * @returns {} - if update is successful
 */
export function adminMissionNameUpdate(
  controlUserSessionId: string, missionId: number, name: string
): Record<string, never> {
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
  const mission = getMissionFromMissionId(missionId, controlUserId);
  isMissionNameValid(name, controlUserId);

  mission.name = name;
  mission.timeLastEdited = getTime();
  const data = getData();
  setData(data);

  return {};
}

/**
 * Update the description of the relevant space mission.
 * @param {string} controlUserSessionId - User's ID
 * @param {number} missionId - misssion's ID
 * @param {string} description - mission's description
 * @returns { error: 'specific error message', errorCategory: errorCategories} - invalid input
 * @returns { } - valid input
 */

export function adminMissionDescriptionUpdate(
  controlUserSessionId: string, missionId: number, description: string
): Record<string, never> {
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
  const mission = getMissionFromMissionId(missionId, controlUserId);
  isMissionDescriptionValid(description);

  mission.description = description;
  mission.timeLastEdited = getTime();

  setData(getData());
  return {};
}

/**
  * Handles mission target updates
  *
  * @param {String} controlUserSessionId - requesting user's ID number
  * @param {number} missionId - MissionId
  * @param {String} target - Mission target
  *
  * @returns { error: String, errorCategory: 'specific errorCategories' } - for invalid inputs
  * @returns { } - for valid inputs
*/
export function adminMissionTargetUpdate(
  controlUserSessionId: string, missionId: number, target: string
): Record<string, never> {
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
  const mission = getMissionFromMissionId(missionId, controlUserId);
  isMissionTargetValid(target);

  mission.target = target;
  mission.timeLastEdited = getTime();

  setData(getData());
  return {};
}

/**
  * Handles assigning of astronauts to missions
  *
  * @param {String} controlUserSessionId - requesting user's ID number
  * @param {number} astronautId - astronautId
  * @param {number} missionId - missionId
  *
  * @returns { error: String, errorCategory: 'specific errorCategories' } - for invalid inputs
  * @returns { } - for valid inputs
*/
export function adminMissionAssignAstronaut(
  controlUserSessionId: string, astronautId: number, missionId: number
): Record<string, never> {
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
  const mission = getMissionFromMissionId(missionId, controlUserId);
  const astronaut = getAstronautFromAstronautId(astronautId);

  // Check if astronaut is already assigned to another mission
  if (Object.keys(astronaut.assignedMission).length !== 0) {
    throw HTTPError(400, errorMessages.BAD_INPUT.ASTRONAUT.astronautAssignedToAnotherMission);
  }

  astronaut.assignedMission = {
    missionId,
    objective: `[${mission.target}] ${mission.name}`,
  };

  mission.assignedAstronauts.push({
    astronautId,
    designation: astronaut.designation,
  });

  const now = getTime();
  mission.timeLastEdited = now;
  astronaut.timeLastEdited = now;

  setData(getData());
  return {};
}

export function adminMissionUnassignAstronaut(
  controlUserSessionId: string, astronautId: number, missionId: number, allocateCheck: boolean
): Record<string, never> {
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
  const mission = getMissionFromMissionId(missionId, controlUserId);
  const astronaut = getAstronautFromAstronautId(astronautId);

  const astronautAssignedToCurrentMission =
    'missionId' in astronaut.assignedMission &&
    astronaut.assignedMission.missionId === missionId;

  if (!astronautAssignedToCurrentMission) {
    throw HTTPError(400, errorMessages.BAD_INPUT.ASTRONAUT.astronautNotAssignedToCurrentMission);
  }

  // v2 route
  if (allocateCheck && getData().launches.some(launch => launch.allocatedAstronauts.includes(astronautId))) {
    throw HTTPError(400, 'The astronaut is allocated to a launch');
  }

  mission.assignedAstronauts = mission.assignedAstronauts.filter(a => a.astronautId !== astronautId);
  astronaut.assignedMission = {};

  const now = getTime();
  mission.timeLastEdited = now;
  astronaut.timeLastEdited = now;

  setData(getData());
  return {};
}

/**
 * Transfers a space mission from one control User to another controlUser
 *
 * @param {number} controlUserSessionId - The controlUserSessionId of the current user
 * @param {number} missionId - The missionId of the mission to be transfered
 * @param {string} userEmail - the email address of the target controlUser who will be the new owner of the space mission
 *
 * @returns
 *  {}
 */
export function adminMissionTransfer(controlUserSessionId: string, missionId: number, userEmail: string): Record<string, never> {
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
  const mission = getMissionFromMissionId(missionId, controlUserId);

  const data = getData();
  const targetUser = getControlUserFromEmail(userEmail);
  const thisUser = data.users.find((user) => user.controlUserId === controlUserId);
  if (thisUser.email === userEmail) throw HTTPError(400, 'Cannot transfer a mission to the same user');
  isMissionNameValid(mission.name, targetUser.controlUserId);

  mission.controlUserId = targetUser.controlUserId;
  setData(data);
  return {};
}
