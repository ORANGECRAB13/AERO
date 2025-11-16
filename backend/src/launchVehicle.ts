import { getData, setData } from './dataStore';
import { getLaunchVehicleFromLaunchVehicleId, getTime, getControlUserIdFromSessionId } from './helper';
import HTTPError from 'http-errors';
import { adminLaunchVehicleInfoReturn, LaunchSummary, LaunchVehicle, missionLaunchState, AdminLaunchVehicleListReturn } from './interfaces';

const LV_NAME_MAX_LENGTH = 20;
const LV_NAME_MIN_LENGTH = 2;
const LV_NAME_REGEX = /[^a-zA-Z '-]/;
const LV_DESCRIPTION_MAX_LENGTH = 50;
const LV_DESCRIPTION_MIN_LENGTH = 2;
const LV_DESCRIPTION_REGEX = /[^a-zA-Z '-]/;
const LV_CREW_WEIGHT_MAX = 1000;
const LV_CREW_WEIGHT_MIN = 100;
const LV_PAYLOAD_WEIGHT_MAX = 1000;
const LV_PAYLOAD_WEIGHT_MIN = 100;
const LV_WEIGHT_MAX = 100000;
const LV_WEIGHT_MIN = 1000;
const LV_THRUST_CAPACITY_MAX = 10000000;
const LV_THRUST_CAPACITY_MIN = 100000;
const LV_MANEUVERING_FUEL_MAX = 100;
const LV_MANEUVERING_FUEL_MIN = 10;

export function launchVehicleIdGen() {
  const launchVehicles = getData().launchVehicles;
  return launchVehicles.length === 0
    ? 1
    : Math.max(...launchVehicles.map(lv => lv.launchVehicleId)) + 1;
}

export function launchVehicleNameValidityCheck(name: string) {
  const nameInvalidChars = LV_NAME_REGEX.test(name);
  if (name.length > LV_NAME_MAX_LENGTH || name.length < LV_NAME_MIN_LENGTH || nameInvalidChars) {
    throw HTTPError(400, `${name} is not a valid name for a launch vehicle`);
  }
}

export function launchVehicleDescriptionValidityCheck(description: string) {
  const invalidChars = LV_DESCRIPTION_REGEX.test(description);
  if (description.length > LV_DESCRIPTION_MAX_LENGTH || description.length < LV_DESCRIPTION_MIN_LENGTH || invalidChars) {
    throw HTTPError(400, `${description} is not a valid description for a launch vehicle`);
  }
}

export function launchVehicleCrewWeightValidityCheck(maxCrewWeight: number) {
  if (maxCrewWeight < LV_CREW_WEIGHT_MIN || maxCrewWeight > LV_CREW_WEIGHT_MAX) {
    throw HTTPError(400, `Maximum crew weight must be between ${LV_CREW_WEIGHT_MIN} and ${LV_CREW_WEIGHT_MAX}`);
  }
}

export function launchVehiclePayloadWeightValidityCheck(maxPayloadWeight: number) {
  if (maxPayloadWeight < LV_PAYLOAD_WEIGHT_MIN || maxPayloadWeight > LV_PAYLOAD_WEIGHT_MAX) {
    throw HTTPError(400, `Maximum payload weight must be between ${LV_PAYLOAD_WEIGHT_MIN} and ${LV_PAYLOAD_WEIGHT_MAX}`);
  }
}

export function launchVehicleWeightValidityCheck(launchVehicleWeight: number) {
  if (launchVehicleWeight < LV_WEIGHT_MIN || launchVehicleWeight > LV_WEIGHT_MAX) {
    throw HTTPError(400, `Launch vehicle weight must be between ${LV_WEIGHT_MIN} and ${LV_WEIGHT_MAX}`);
  }
}

export function launchVehicleThrustCapacityValidityCheck(thrustCapacity: number) {
  if (thrustCapacity < LV_THRUST_CAPACITY_MIN || thrustCapacity > LV_THRUST_CAPACITY_MAX) {
    throw HTTPError(400, `Thrust capacity must be between ${LV_THRUST_CAPACITY_MIN} and ${LV_THRUST_CAPACITY_MAX}`);
  }
}

export function launchVehicleManeuveringFuelValidityCheck(maneuveringFuel: number) {
  if (maneuveringFuel < LV_MANEUVERING_FUEL_MIN || maneuveringFuel > LV_MANEUVERING_FUEL_MAX) {
    throw HTTPError(400, `Maneuvering fuel must be between ${LV_MANEUVERING_FUEL_MIN} and ${LV_MANEUVERING_FUEL_MAX}`);
  }
}

function validateLaunchVehicleNotAssignedToActiveLaunch(launchVehicleId: number) {
  if (getData().launches.some(launch =>
    launch.assignedLaunchVehicleId === launchVehicleId && launch.state !== missionLaunchState.ON_EARTH)
  ) {
    throw HTTPError(400, `Launch vehicle (id: ${launchVehicleId}) is already assigned to an active launch`);
  }
}

export function adminLaunchVehicleCreate(
  name: string,
  description: string,
  maxCrewWeight: number,
  maxPayloadWeight: number,
  launchVehicleWeight: number,
  thrustCapacity: number,
  maneuveringFuel: number) {
  // 401 check should have been done in a call from the server before we got to the logic - so we do not need to do it here.
  launchVehicleNameValidityCheck(name);
  launchVehicleDescriptionValidityCheck(description);
  launchVehicleCrewWeightValidityCheck(maxCrewWeight);
  launchVehiclePayloadWeightValidityCheck(maxPayloadWeight);
  launchVehicleWeightValidityCheck(launchVehicleWeight);
  launchVehicleThrustCapacityValidityCheck(thrustCapacity);
  launchVehicleManeuveringFuelValidityCheck(maneuveringFuel);

  const data = getData();
  const launchVehicleId = launchVehicleIdGen();
  const currentTime = getTime();
  const newLaunchVehicle: LaunchVehicle = {
    launchVehicleId,
    name,
    description,
    maxCrewWeight,
    maxPayloadWeight,
    launchVehicleWeight,
    thrustCapacity,
    maneuveringFuel,
    timeAdded: currentTime,
    timeLastEdited: currentTime,
    retired: false
  };

  data.launchVehicles.push(newLaunchVehicle);
  setData(data);

  return { launchVehicleId };
}

export function adminLaunchVehicleRetire(launchVehicleId: number): Record<string, never> {
  const launchVehicle = getLaunchVehicleFromLaunchVehicleId(launchVehicleId);
  validateLaunchVehicleNotAssignedToActiveLaunch(launchVehicleId);
  launchVehicle.retired = true;
  launchVehicle.timeLastEdited = getTime();
  setData(getData());
  return {};
}

/**
 * Retrieves detailed information about a launch vehicle.
 *
 * @param launchVehicleId - The unique identifier of the launch vehicle
 * @returns { adminLaunchVehicleInfoReturn } An object containing comprehensive information about the launch vehicle
 *
 * @throws {Error} If launch vehicle with given ID is not found
 */
export function adminLaunchVehicleInfo(launchVehicleId: number): adminLaunchVehicleInfoReturn {
  const launchVehicle = getLaunchVehicleFromLaunchVehicleId(launchVehicleId);
  const launches: LaunchSummary[] = getData().launches
    .filter(launch => launch.assignedLaunchVehicleId === launchVehicleId)
    .map(launch => ({
      launch: `[${launch.missionCopy.target}] ${launch.missionCopy.name} - ${launch.launchCreationTime}`,
      state: launch.state
    }));

  return {
    launchVehicleId,
    name: launchVehicle.name,
    timeAdded: launchVehicle.timeAdded,
    timeLastEdited: launchVehicle.timeLastEdited,
    maxCrewWeight: launchVehicle.maxCrewWeight,
    maxPayloadWeight: launchVehicle.maxPayloadWeight,
    launchVehicleWeight: launchVehicle.launchVehicleWeight,
    thrustCapacity: launchVehicle.thrustCapacity,
    startingManeuveringFuel: launchVehicle.maneuveringFuel,
    retired: launchVehicle.retired,
    launches
  };
}

export function adminLaunchVehicleInfoUpdate(
  launchVehicleId: number,
  name: string,
  description: string,
  maxCrewWeight: number,
  maxPayloadWeight: number,
  launchVehicleWeight: number,
  thrustCapacity: number,
  maneuveringFuel: number
): Record<string, never> {
  const launchVehicle = getLaunchVehicleFromLaunchVehicleId(launchVehicleId);
  launchVehicleNameValidityCheck(name);
  launchVehicleDescriptionValidityCheck(description);
  launchVehicleCrewWeightValidityCheck(maxCrewWeight);
  launchVehiclePayloadWeightValidityCheck(maxPayloadWeight);
  launchVehicleWeightValidityCheck(launchVehicleWeight);
  launchVehicleThrustCapacityValidityCheck(thrustCapacity);
  launchVehicleManeuveringFuelValidityCheck(maneuveringFuel);

  launchVehicle.timeLastEdited = getTime();
  launchVehicle.name = name;
  launchVehicle.description = description;
  launchVehicle.maxCrewWeight = maxCrewWeight;
  launchVehicle.maxPayloadWeight = maxPayloadWeight;
  launchVehicle.launchVehicleWeight = launchVehicleWeight;
  launchVehicle.thrustCapacity = thrustCapacity;
  launchVehicle.maneuveringFuel = maneuveringFuel;

  setData(getData());
  return {};
}

export function adminLaunchVehicleList(controlUserSessionId: string): AdminLaunchVehicleListReturn {
  getControlUserIdFromSessionId(controlUserSessionId);
  const data = getData();

  const launchVehicles = data.launchVehicles
    .filter(launchVehicle => launchVehicle.retired === false)
    .sort((a, b) => a.launchVehicleId - b.launchVehicleId)
    .map(launchVehicle => ({
      launchVehicleId: launchVehicle.launchVehicleId,
      name: launchVehicle.name,
      assigned: data.launches.some(launch =>
        launch.assignedLaunchVehicleId === launchVehicle.launchVehicleId &&
        launch.state !== missionLaunchState.ON_EARTH
      )
    }));

  return { launchVehicles };
}
