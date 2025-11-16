import { getData } from './dataStore';
import { errorMessages } from './testSamples';
import { Astronaut, Launch, LaunchVehicle, Mission, User, missionLaunchState } from './interfaces';
import HTTPError from 'http-errors';

/**
 * Retrieves the user ID associated with a session ID,
 * Throws HTTPError if session ID is empty or does not refet to existing session
 * @param {string} controlUserSessionId - Session ID to look up
 * @returns {number} The control user ID associated with the session
 *
 * Note: Assumes session ID is valid
 */
export function getControlUserIdFromSessionId(controlUserSessionId: string): number {
  const session = getData().sessions.find(session => session.controlUserSessionId === controlUserSessionId);
  if (!session) throw HTTPError(401, errorMessages.INVALID_CREDENTIALS.sessionId);
  return session.controlUserId;
}

/**
 * Checks if an email address exists in the system
 * @param {string} email - Email address to check
 * @returns {void} - throws HTTPError if email doesn't exist
 */
export function getControlUserFromEmail(email: string): User {
  const user = getData().users.find(user => user.email === email);
  if (!user) {
    throw HTTPError(400, errorMessages.BAD_INPUT.AUTH.emailDNE);
  }
  return user;
}

/**
 * Validates that a mission ID exists, is active, and belongs to the specified user
 * @param {number} missionId - Mission ID to validate
 * @param {number} userId - User ID who should own the mission
 * @returns {void} - throws HTTPError if invalid
 * @returns {Mission} - the corresponding mission if valid
 *
 * Checks:
 * - Mission exists
 * - Mission is active
 * - Mission belongs to the specified user
 */
export function getMissionFromMissionId(missionId: number, userId: number): Mission {
  const mission = getData().missions.find(mission =>
    mission.active === true && mission.missionId === missionId && mission.controlUserId === userId);
  if (!mission) throw HTTPError(403, errorMessages.INACCESSIBLE_VALUE.missionId);
  return mission;
}

/**
 * Validates a astronautId exists
 * @param astronautId - astronaut id to validate
 * @returns {void} - throws HTTPError if invalid
 */
export function getAstronautFromAstronautId(astronautId: number): Astronaut {
  const astronaut = getData().astronauts.find(astronaut => astronaut.astronautId === astronautId);
  if (!astronaut) throw HTTPError(400, errorMessages.BAD_INPUT.ASTRONAUT.astronautIdInvalid);
  return astronaut;
}

/**
 * Returns the current Unix timestamp in seconds.
 *
 * The value is computed from Date.now() / 1000 and floored to produce an
 * integer number of seconds elapsed since the Unix epoch (1970-01-01T00:00:00Z).
 *
 * @returns The current Unix timestamp as an integer number of seconds.
 */
export const getTime = () => Math.floor(Date.now() / 1000);

/**
 * Retrieves a launch vehicle from the data store by its ID
 *
 * @param launchVehicleId - The unique identifier of the launch vehicle to retrieve
 * @param retiredCheck - Optional boolean flag to check if the vehicle is retired
 * @returns The launch vehicle object matching the provided ID
 * @throws {HTTPError} With status 400 if the launch vehicle ID is invalid
 * @throws {HTTPError} With status 400 if retiredCheck is true and the vehicle is retired
 */
export function getLaunchVehicleFromLaunchVehicleId(launchVehicleId: number, retiredCheck?: boolean): LaunchVehicle {
  const data = getData();
  const launchVehicle = data.launchVehicles.find(
    lv => lv.launchVehicleId === launchVehicleId
  );

  if (!launchVehicle) {
    throw HTTPError(400, `Launch vehicle ID ${launchVehicleId} is invalid`);
  }

  if (retiredCheck) {
    if (launchVehicle.retired) {
      throw HTTPError(400, `Launch vehicle ${launchVehicleId} is retired`);
    }
  }
  return launchVehicle;
}

/**
 * Validates that a launch vehicle is not currently in an active launch
 * @param launchVehicleId - Launch vehicle ID to check
 * @throws HTTPError 400 if currently in active launch
 */
export function validateLaunchVehicleNotInActiveLaunch(launchVehicleId: number): void {
  const data = getData();
  const activeWithThisVehicle = data.launches.find(
    launch => launch.assignedLaunchVehicleId === launchVehicleId &&
              launch.state !== missionLaunchState.ON_EARTH
  );

  if (activeWithThisVehicle) {
    throw HTTPError(400, 'Launch vehicle is currently in an active launch');
  }
}

export function getLaunchFromLaunchId(launchId: number): Launch {
  const launch = getData().launches.find(launch => launch.launchId === launchId);
  if (!launch) throw HTTPError(400, `Launch ID ${launchId} is invalid`);
  return launch;
}
