import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import {
  getMissionFromMissionId,
  getTime,
  getLaunchVehicleFromLaunchVehicleId,
  validateLaunchVehicleNotInActiveLaunch,
  getLaunchFromLaunchId,
  getAstronautFromAstronautId,
  getControlUserIdFromSessionId
} from './helper';
import {
  Launch,
  Payload,
  missionLaunchState,
  missionLaunchAction,
  LaunchCalcParameters,
  LaunchVehicle,
  adminLaunchDetailsReturn,
  LaunchVehicleSummary,
  AstronautSummary
} from './interfaces';
import { adminLaunchVehicleInfo } from './launchVehicle';
import { errorMessages } from './testSamples';
import { getOrbitalDistance, getOrbitalVelocity } from './payload';
/**
 * Validates payload description
 * @param description - Payload description to validate
 * @throws HTTPError 400 if empty or too long
 */
function validatePayloadDescription(description: string): void {
  if (!description) {
    throw HTTPError(400, 'Payload description cannot be empty');
  }

  if (description.length > 400) {
    throw HTTPError(400, 'Payload description cannot exceed 400 characters');
  }
}

/**
 * Validates payload weight against launch vehicle capacity
 * @param weight - Payload weight in kg
 * @param maxPayloadWeight - max payload weight for a launch vehicle
 * @throws HTTPError 400 if weight exceeds capacity
 */
function validatePayloadWeight(weight: number, maxPayloadWeight: number): void {
  if (weight > maxPayloadWeight) {
    throw HTTPError(400,
      `Payload weight ${weight} exceeds maximum payload weight ${maxPayloadWeight} for launch vehicle`
    );
  }
}

/**
 * Validates all launch calculation parameters
 * @param params - Launch calculation parameters to validate
 * @throws HTTPError 400 if any parameter is invalid
 */
function validateLaunchParameters(params: LaunchCalcParameters): void {
  // Check all parameters are non-negative
  if (params.targetDistance < 0) {
    throw HTTPError(400, 'Target distance cannot be negative');
  }

  if (params.thrustFuel < 0) {
    throw HTTPError(400, 'Thrust fuel cannot be negative');
  }

  if (params.fuelBurnRate < 0) {
    throw HTTPError(400, 'Fuel burn rate cannot be negative');
  }

  if (params.activeGravityForce < 0) {
    throw HTTPError(400, 'Active gravity force cannot be negative');
  }

  // maneuveringDelay must be at least 1
  if (params.maneuveringDelay < 1) {
    throw HTTPError(400, 'Maneuvering delay must be at least 1 second');
  }

  // fuelBurnRate cannot exceed thrustFuel
  if (params.fuelBurnRate > params.thrustFuel) {
    throw HTTPError(400, 'Fuel burn rate cannot exceed thrust fuel');
  }
}

/**
 * Validate initial launch calculations to ensure the vehicle can lift off and reach the target distance.
 *
 * Performs the following calculations:
 * - burnTime = params.thrustFuel / params.fuelBurnRate
 * - massTotal = launchVehicle.launchVehicleWeight + (sum of astronaut masses in assignedAstronauts) + payloadWeight
 * - netForce = launchVehicle.thrustCapacity - (params.activeGravityForce * massTotal)
 * - acceleration = netForce / massTotal
 * - distanceTraveled = 0.5 * acceleration * burnTime^2
 *
 * If the distance traveled during the burn is greater or equal than the
 * requested `params.targetDistance`, return true. Otherwise, return false
 *
 * @param params - Launch calculation parameters. Expected properties used:
 *   - `thrustFuel` (numeric): available fuel/energy for thrust
 *   - `fuelBurnRate` (numeric): rate at which fuel is consumed (must be > 0)
 *   - `activeGravityForce` (numeric): gravity acceleration used when computing weight force
 *   - `targetDistance` (numeric): required distance to reach during burn
 * @param launchVehicle - The launch vehicle object. Expected properties used:
 *   - `launchVehicleWeight` (numeric): dry/vehicle mass
 *   - `thrustCapacity` (numeric): maximum thrust produced by the vehicle
 * @param assignedAstronauts - Array of assigned astronauts whose masses are summed and included in the total mass.
 * @param payloadWeight - Payload mass (numeric) added to total mass.
 *
 * @returns boolean
 */
export function launchCalculator(
  params: LaunchCalcParameters,
  launchVehicle: LaunchVehicle,
  astronautIds: number[],
  payloadWeight: number
) {
  // Calculate burn time
  const fuelBurnTime = params.thrustFuel / params.fuelBurnRate;

  // Calculate net force (thrust - gravity * mass)
  const data = getData();
  const crewWeight = astronautIds.reduce((accmu, astronautId) => accmu + data.astronauts.find(a => a.astronautId === astronautId).weight, 0);
  const totalMass = launchVehicle!.launchVehicleWeight + crewWeight + payloadWeight;
  const netForce = launchVehicle!.thrustCapacity - (params.activeGravityForce * totalMass);

  // Calculate acceleration: F = ma, so a = F/m
  const acceleration = netForce / totalMass;

  // Calculate distance traveled: d = 0.5 * a * t^2
  const maxHeight = 0.5 * acceleration * Math.pow(fuelBurnTime, 2);
  const canReachTarget = maxHeight >= params.targetDistance;
  return { fuelBurnTime, crewWeight, totalMass, netForce, acceleration, maxHeight, canReachTarget };
}

/**
 * Checks if a given action is valid in the current mission launch state.
 *
 * @param state - The current state of the mission launch
 * @param action - The action to validate
 * @throws {HTTPError} With status 400 if the action is unknown
 * @throws {HTTPError} With status 400 if the action is invalid for the current state
 */
function isActionValidInState(state: missionLaunchState, action: missionLaunchAction) {
  if (!Object.values(missionLaunchAction).includes(action)) {
    throw HTTPError(400, `unknown action: ${action}`);
  }

  const ValidActions: Record<missionLaunchState, Set<missionLaunchAction>> = {
    READY_TO_LAUNCH: new Set([missionLaunchAction.LIFTOFF, missionLaunchAction.FAULT]),
    LAUNCHING: new Set([missionLaunchAction.FAULT, missionLaunchAction.SKIP_WAITING]),
    MANEUVERING: new Set([missionLaunchAction.FIRE_THRUSTERS, missionLaunchAction.FAULT, missionLaunchAction.CORRECTION]),
    COASTING: new Set([missionLaunchAction.DEPLOY_PAYLOAD, missionLaunchAction.FAULT]),
    MISSION_COMPLETE: new Set([missionLaunchAction.GO_HOME]),
    RE_ENTRY: new Set([missionLaunchAction.RETURN]),
    ON_EARTH: new Set()
  };
  if (!ValidActions[state].has(action)) {
    throw HTTPError(400, `invalid action: Cannot do action ${action} in state ${state}`);
  }
}

export const timeoutStore = new Map<number, ReturnType<typeof setTimeout>>();

/**
 * Determines the next state in the mission launch sequence.
 *
 * @param state - The current mission launch state
 * @returns The next state in the sequence:
 *          - If LAUNCHING, returns MANEUVERING
 *          - If MANEUVERING, returns COASTING
 *          - If any other state, returns undefined
 */
function getNextState(state: missionLaunchState, launch: Launch): { nextState: missionLaunchState, seconds: number } | void {
  if (state === missionLaunchState.LAUNCHING) return { nextState: missionLaunchState.MANEUVERING, seconds: 3 };
  if (state === missionLaunchState.MANEUVERING) return { nextState: missionLaunchState.COASTING, seconds: launch.launchCalculationParameters.maneuveringDelay };
}

/**
 * Initializes or updates the state of a launch and manages state transitions
 * @param launch - The Launch object to be updated
 * @param state - The new missionLaunchState to set for the launch
 * @param secondsToNextState - Optional number of seconds for auto transition to the next state
 *
 * @remarks
 * This function performs the following:
 * 1. Updates the launch state
 * 2. Clears any existing timeout
 * 3. Updates persistent data
 * 4. Sets up the next state transition timer if secondsToNextState is provided
 */
function initializeState(launch: Launch, state: missionLaunchState) {
  launch.state = state;
  const timerId = timeoutStore.get(launch.launchId);
  if (timerId) {
    clearTimeout(timerId);
    timeoutStore.delete(launch.launchId);
  }
  // deallocate astronauts when launch is on earch
  if (launch.state === missionLaunchState.ON_EARTH) {
    launch.allocatedAstronauts = [];
  }
  setData(getData());

  const autoStateTransition = getNextState(state, launch);
  if (autoStateTransition) {
    const timerId = setTimeout(() =>
      initializeState(launch, autoStateTransition.nextState), autoStateTransition.seconds * 1000);
    timeoutStore.set(launch.launchId, timerId);
  }
}

function checkManeuveringFuel(launch: Launch) {
  return launch.remainingLaunchVehicleManeuveringFuel - 3 > 0;
}

function validateAstronautNotAllocated(astronautId: number) {
  const data = getData();
  const allocated = data.launches.some(launch => launch.allocatedAstronauts.includes(astronautId) &&
    launch.state !== missionLaunchState.ON_EARTH);

  if (allocated) throw HTTPError(400, errorMessages.BAD_INPUT.ASTRONAUT.astronautAssignedToAnotherLaunch);
}

function validateAstronautMissionAssignment(missionId: number, controlUserId: number, astronautId: number) {
  const mission = getMissionFromMissionId(missionId, controlUserId);
  if (!mission.assignedAstronauts.some(a => a.astronautId === astronautId)) {
    throw HTTPError(400, 'Astronaut not assigned to this mission');
  }
}

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function adminLaunchCreate(
  controlUserId: number, missionId: number, launchVehicleId: number,
  payload: {
    description: string,
    weight: number
  },
  launchParameters: LaunchCalcParameters
): { launchId: number } {
  // Validate mission exists and belongs to user
  const mission = getMissionFromMissionId(missionId, controlUserId);

  // Validate launch vehicle
  const launchVehicle = getLaunchVehicleFromLaunchVehicleId(launchVehicleId, true);
  validateLaunchVehicleNotInActiveLaunch(launchVehicleId);

  // Validate payload
  validatePayloadDescription(payload.description);
  validatePayloadWeight(payload.weight, launchVehicle.maxPayloadWeight);

  // Validate launch parameters
  validateLaunchParameters(launchParameters);
  if (!launchCalculator(launchParameters, launchVehicle, [], payload.weight).canReachTarget) {
    throw HTTPError(400, 'Insufficient fuel to reach target distance');
  }

  const data = getData();
  const newPayload: Payload = {
    payloadId: 1,
    description: payload.description,
    weight: payload.weight,
    timeDeployed: null,
    orbitalDistance: null,
    orbitalVelocity: null
  };

  // Create deep copy of mission
  const missionCopy = JSON.parse(JSON.stringify(mission));

  const launchId = data.launches.length === 0
    ? 1
    : Math.max(...data.launches.map(l => l.launchId)) + 1;
  const newLaunch: Launch = {
    launchId,
    missionCopy,
    launchCreationTime: getTime(),
    state: missionLaunchState.READY_TO_LAUNCH,
    assignedLaunchVehicleId: launchVehicleId,
    remainingLaunchVehicleManeuveringFuel: launchVehicle.maneuveringFuel,
    payload: newPayload,
    allocatedAstronauts: [],
    launchCalculationParameters: launchParameters
  };

  data.launches.push(newLaunch);
  setData(data);
  return { launchId };
}

export function adminLaunchDetails(launchId: number): adminLaunchDetailsReturn {
  const launch = getLaunchFromLaunchId(launchId);
  const { controlUserId, active, ...missionCopy } = launch.missionCopy;

  const launchVehicleId = launch.assignedLaunchVehicleId;
  const lv = getLaunchVehicleFromLaunchVehicleId(launchVehicleId);
  const launchVehicle: LaunchVehicleSummary = {
    launchVehicleId,
    name: lv.name,
    maneuveringFuelRemaining: launch.remainingLaunchVehicleManeuveringFuel
  };

  const allocatedAstronauts: AstronautSummary[] = launch.allocatedAstronauts
    .map(astronautId => {
      const astronaut = getData().astronauts.find(a => a.astronautId === astronautId);
      return { astronautId: astronaut.astronautId, designation: `${astronaut.rank} ${astronaut.nameFirst} ${astronaut.nameLast}` };
    });

  return {
    launchId,
    missionCopy: missionCopy,
    timeCreated: launch.launchCreationTime,
    state: launch.state,
    launchVehicle,
    payload: {
      payloadId: launch.payload.payloadId,
      description: launch.payload.description,
      weight: launch.payload.weight,
      deployed: launch.payload.timeDeployed !== null
    },
    allocatedAstronauts,
    launchCalculationParameters: launch.launchCalculationParameters
  };
}

/**
 * Updates the status of a mission launch based on the provided action.
 *
 * @param newAction - The action to be performed on the launch
 * @param launchId - The unique identifier of the launch
 * @returns An empty object
 *
 * @throws {HTTPError} 400 - If LIFTOFF is attempted with invalid launch parameters
 * @throws {HTTPError} 400 - If CORRECTION is attempted with insufficient fuel
 * @throws {HTTPError} 400 - If FIRE_THRUSTERS is attempted with insufficient fuel
 *
 * Actions and their effects:
 * - LIFTOFF: Initiates launch if parameters are valid
 * - CORRECTION: Performs course correction if sufficient fuel
 * - FIRE_THRUSTERS: Activates thrusters if sufficient fuel
 * - DEPLOY_PAYLOAD: Deploys the payload and completes mission
 * - GO_HOME: Initiates reentry sequence
 * - RETURN: Returns to Earth
 * - FAULT: Triggers emergency reentry / returns to earch
 * - SKIP_WAITING: Moves to maneuvering state
 */
export function adminLaunchStatusUpdate(newAction: missionLaunchAction, launchId: number): Record<string, never> {
  const launch = getLaunchFromLaunchId(launchId);

  // checks an action exists and if its valid in this state
  isActionValidInState(launch.state, newAction);

  // big switch statement to check if action is permitted in current state and if it is, what to do
  switch (newAction) {
    case missionLaunchAction.LIFTOFF: {
      const { acceleration, canReachTarget } = launchCalculator(
        launch.launchCalculationParameters, getLaunchVehicleFromLaunchVehicleId(launch.assignedLaunchVehicleId),
        launch.allocatedAstronauts, launch.payload.weight
      );

      if (!canReachTarget) {
        adminLaunchStatusUpdate(missionLaunchAction.FAULT, launchId);
        throw HTTPError(400, 'A LIFTOFF action has been attempted with bad launch parameters');
      } else {
        const targetDistance = launch.launchCalculationParameters.targetDistance;
        launch.payload.orbitalDistance = getOrbitalDistance(targetDistance);
        launch.payload.orbitalVelocity = getOrbitalVelocity(acceleration, targetDistance);
        initializeState(launch, missionLaunchState.LAUNCHING);
      }
      break;
    }
    case missionLaunchAction.CORRECTION:
      if (!checkManeuveringFuel(launch)) {
        adminLaunchStatusUpdate(missionLaunchAction.FAULT, launchId);
        throw HTTPError(400, 'A CORRECTION action been attempted with insufficient fuel available');
      } else {
        launch.remainingLaunchVehicleManeuveringFuel -= 3;
        initializeState(launch, missionLaunchState.LAUNCHING);
      }
      break;
    case missionLaunchAction.FIRE_THRUSTERS:
      if (!checkManeuveringFuel(launch)) {
        adminLaunchStatusUpdate(missionLaunchAction.FAULT, launchId);
        throw HTTPError(400, 'A FIRE_THRUSTERS action been attempted with insufficient fuel available');
      } else {
        launch.remainingLaunchVehicleManeuveringFuel -= 3;
        initializeState(launch, missionLaunchState.COASTING);
      }
      break;
    case missionLaunchAction.DEPLOY_PAYLOAD:
      launch.payload.timeDeployed = getTime();
      initializeState(launch, missionLaunchState.MISSION_COMPLETE);
      break;
    case missionLaunchAction.GO_HOME:
      initializeState(launch, missionLaunchState.REENTRY);
      break;
    case missionLaunchAction.RETURN:
      initializeState(launch, missionLaunchState.ON_EARTH);
      break;
    case missionLaunchAction.FAULT: {
      const nextState = launch.state === missionLaunchState.READY_TO_LAUNCH
        ? missionLaunchState.ON_EARTH
        : missionLaunchState.REENTRY;
      initializeState(launch, nextState);
      break;
    }
    case missionLaunchAction.SKIP_WAITING:
      initializeState(launch, missionLaunchState.MANEUVERING);
      break;
  }
  return {};
}

export function adminLaunchList(controlUserId: number) {
  const data = getData();

  const activeLaunches = data.launches
    .filter(launch => launch.state !== 'ON_EARTH')
    .map(launch => launch.launchId);

  const completedLaunches = data.launches
    .filter(launch => launch.state === 'ON_EARTH')
    .map(launch => launch.launchId);

  return { activeLaunches, completedLaunches };
}

/**
 * Allocates an astronaut to a specific launch within a mission.
 *
 * @param controlUserId - ID of the control user performing the allocation
 * @param astronautId - ID of the astronaut to allocate
 * @param missionId - ID of the mission the astronaut belongs to
 * @param launchId - ID of the launch to which the astronaut will be allocated
 *
 * @returns An empty object after successful allocation
 *
 * @throws {HTTPError} 400 - If the astronaut or launch is invalid, not part of the mission, already on another active launch, or if crew weight exceeds maxCrewWeight
 * @throws {HTTPError} 401 - If the session is invalid or expired
 * @throws {HTTPError} 403 - If the mission does not exist or is not owned by this user
 *
 * Validates astronaut–mission relation, ensures launch capacity limits,
 * and updates the launch’s allocatedAstronauts list.
 */

export function adminLaunchAllocateAstronaut(controlUserId: number,
  astronautId: number,
  missionId: number,
  launchId: number
) {
  const launch: Launch = getLaunchFromLaunchId(launchId);
  const astronaut = getAstronautFromAstronautId(astronautId); // validate astronaut id
  const launchVehicle = adminLaunchVehicleInfo(launchId);
  validateAstronautMissionAssignment(missionId, controlUserId, astronautId); // validate astrounaut assigned to specific mission
  validateAstronautNotAllocated(astronautId); // check if astronaut is assigned to an ongoing launch

  let assignedTotal = 0;

  for (const id of launch.allocatedAstronauts) {
    const crewMember = getAstronautFromAstronautId(id);
    assignedTotal += crewMember.weight;
  }

  assignedTotal += astronaut.weight;

  if (assignedTotal > launchVehicle.maxCrewWeight) {
    throw HTTPError(400, 'Total weight of allocated astronauts exceeds max crew weight');
  }

  launch.allocatedAstronauts.push(astronautId);
  setData(getData());
}

/**
 * Remove an astronaut from a launch
 *
 * @param controlUserId - specific identifier of user
 * @param astronautId - specific identifier of astronaut
 * @param missionId - specific identifier of mission
 * @param launchId - specific identifier of launch
 *
 * @returns An empty object after successful allocation
 *
 * @throws {HTTPError} 400 - If the astronaut or launch is invalid, astronaut not allocated to hte launch, launch state is not READY_TO_EARTH ot ON-EARTH
 * @throws {HTTPError} 401 - If the session is invalid or expired
 * @throws {HTTPError} 403 - If the mission does not exist or is not owned by this user
 *
 */

export function adminLaunchDeallocateAstronaut(controlUserSessionId: string, astronautId: number, missionId: number, launchId: number) {
  // check the sessionid is empty or invalid
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);

  // check if the control user is an owner of this mission or the specified missionId does not exist
  getMissionFromMissionId(missionId, controlUserId);

  // check if the astronautid is valid
  getAstronautFromAstronautId(astronautId);

  // check if the launchid in valid
  const launch = getLaunchFromLaunchId(launchId);

  // check if the launch has started and is still in progress
  if (launch.state !== missionLaunchState.READY_TO_LAUNCH && launch.state !== missionLaunchState.ON_EARTH) {
    throw HTTPError(400, 'The launch has started and is still in progress');
  }
  // check if the astronaut allocated to this launch
  if (!launch.allocatedAstronauts.includes(astronautId)) {
    throw HTTPError(400, 'The astronaut not allocated to this launch');
  }

  // Remove the astronaut
  launch.allocatedAstronauts = launch.allocatedAstronauts.filter(aid => aid !== astronautId);

  setData(getData());
  return {};
}
