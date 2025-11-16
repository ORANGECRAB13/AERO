/**
 * This file contains http request helper function
 * function returns {result, statusCode}
 * result is response.body parsed to a JSON string
 * statusCode
 */
 
import request, { Response } from 'sync-request-curl';
import { port, url } from '../../src/config.json';
import { validAstronauts, validLaunchVehicles, validMissions, validUsers } from '../../src/testSamples';
import { LaunchCalcParameters, MentalHealthIndicators, PhysicalHealthIndicators } from '../../src/interfaces';

// URL Definition
const SERVER_URL = `${url}:${port}`;
const ADMIN_AUTH_URL_V1 = '/v1/admin/auth'
const ADMIN_CONTROLUSER_URL_V1 = '/v1/admin/controluser'
const ADMIN_MISSION_URL_V1 = '/v1/admin/mission'
const ADMIN_MISSION_URL_V2 = '/v2/admin/mission'
const ADMIN_ASTRONAUT_URL_V1 = '/v1/admin/astronaut'
const ADMIN_LAUNCHVEHICLE_URL_V1 = '/v1/admin/launchvehicle'
const ADMIN_LAUNCH_URL_V1 = '/v1/admin/launch'
const CLEAR_URL = '/clear'

const TIMEOUT_MS = 5000;

const parseResponse = (res: Response) => JSON.parse(res.body.toString())

const errorResult = { error: expect.any(String) }

type RequestReturn = {
  result: any
  statusCode?: number
}

const clearRequest = (): RequestReturn => parseResponse(request('DELETE', SERVER_URL + CLEAR_URL, { timeout: TIMEOUT_MS }))

function adminAuthRegisterRequest(
  email: string, password: string, nameFirst: string, nameLast: string
): RequestReturn {
  const response = request(
    'POST',
    SERVER_URL + ADMIN_AUTH_URL_V1 + '/register',
    {
      json: { email, password, nameFirst, nameLast },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminAuthLoginRequest(email: string, password: string): RequestReturn {
  const response = request(
    'POST',
    SERVER_URL + ADMIN_AUTH_URL_V1 + '/login',
    {
      json: { email, password },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminAuthLogoutRequest(controlUserSessionId: string): RequestReturn {
  const response = request(
    'POST',
    SERVER_URL + ADMIN_AUTH_URL_V1 + '/logout',
    { 
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminControlUserDetailsRequest(controlUserSessionId: string): RequestReturn {
  const response = request(
    'GET',
    SERVER_URL + ADMIN_CONTROLUSER_URL_V1 + '/details',
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminControlUserDetailsUpdateRequest(
  controlUserSessionId: string, email: string, nameFirst: string, nameLast: string
): RequestReturn {
  const response = request(
    'PUT',
    SERVER_URL + ADMIN_CONTROLUSER_URL_V1 + '/details',
    {
      json: { email, nameFirst, nameLast },
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminControlUserPasswordUpdateRequest(
  controlUserSessionId: string, oldPassword: string, newPassword: string
): RequestReturn {
  const response = request(
    'PUT',
    SERVER_URL + ADMIN_CONTROLUSER_URL_V1 + '/password',
    {
      json: { oldPassword, newPassword },
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminMissionListRequest(controlUserSessionId: string): RequestReturn {
  const response = request(
    'GET',
    SERVER_URL + ADMIN_MISSION_URL_V1 + '/list',
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminMissionCreateRequest(
  controlUserSessionId: string, name: string, description: string, target: string
): RequestReturn {
  const response = request(
    'POST',
    SERVER_URL + ADMIN_MISSION_URL_V1,
    {
      json: { name, description, target },
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminMissionRemoveRequest(controlUserSessionId: string, missionId: number): RequestReturn {
  const response = request(
    'DELETE',
    SERVER_URL + ADMIN_MISSION_URL_V1 + `/${missionId}`,
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminMissionInfoRequest(
  controlUserSessionId: string, missionid: number
): RequestReturn {
  const response = request(
    'GET',
    SERVER_URL + ADMIN_MISSION_URL_V1 + `/${missionid}`,
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminMissionNameUpdateRequest(
  controlUserSessionId: string, missionId: number, name: string
): RequestReturn {
  const response = request(
    'PUT',
    SERVER_URL + ADMIN_MISSION_URL_V1 + `/${missionId}/name`,
    {
      json: { name },
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminMissionDescriptionUpdateRequest(
  controlUserSessionId: string, missionId: number, description: string
): RequestReturn {
  const response = request(
    'PUT',
    SERVER_URL + ADMIN_MISSION_URL_V1 + `/${missionId}/description`,
    {
      json: { description },
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminMissionTargetUpdateRequest(
  controlUserSessionId: string, missionId: number, target: string
): RequestReturn {
  const response = request(
    'PUT',
    SERVER_URL + ADMIN_MISSION_URL_V1 + `/${missionId}/target`,
    {
      json: { target },
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminMissionAssignAstronautRequest(
  controlUserSessionId: string, missionId: number, astronautId: number
): RequestReturn {
  const response = request(
    'POST',
    SERVER_URL + ADMIN_MISSION_URL_V1 + `/${missionId}/assign/${astronautId}`,
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }  
}

function adminMissionUnassignAstronautRequest(
  controlUserSessionId: string, missionId: number, astronautId: number
): RequestReturn {
  const response = request(
    'DELETE',
    SERVER_URL + ADMIN_MISSION_URL_V1 + `/${missionId}/assign/${astronautId}`,
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }  
}

export function adminMissionUnassignAstronautRequestV2(
  controlUserSessionId: string, missionId: number, astronautId: number
): RequestReturn {
  const response = request(
    'DELETE',
    SERVER_URL + ADMIN_MISSION_URL_V2 + `/${missionId}/assign/${astronautId}`,
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }  
}

function adminMissionTransferRequest(
  controlUserSessionId: string, missionId: number, userEmail: string
): RequestReturn {
  const response = request(
    'POST',
    SERVER_URL + ADMIN_MISSION_URL_V1 + `/${missionId}/transfer`,
    {
      json: { userEmail },
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminAstronautPoolRequest(controlUserSessionId: string): RequestReturn {
  const response = request(
    'GET',
    SERVER_URL + ADMIN_ASTRONAUT_URL_V1 + '/pool',
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminAstronautCreateRequest(
  controlUserSessionId: string, nameFirst: string, nameLast: string,
  rank: string, age: number, weight: number, height: number
): RequestReturn {
  const response = request(
    'POST',
    SERVER_URL + ADMIN_ASTRONAUT_URL_V1,
    {
      json: { nameFirst, nameLast, rank, age, weight, height }, 
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminAstronautRemoveRequest(controlUserSessionId: string, astronautId: number): RequestReturn {
  const response = request(
    'DELETE',
    SERVER_URL + ADMIN_ASTRONAUT_URL_V1 + `/${astronautId}`,
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminAstronautDetailsRequest(controlUserSessionId: string, astronautId: number): RequestReturn {
  const response = request(
    'GET',
    SERVER_URL + ADMIN_ASTRONAUT_URL_V1 + `/${astronautId}`,
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

function adminAstronautDetailsUpdateRequest(
  controlUserSessionId: string, astronautId: number, nameFirst: string, nameLast: string,
  rank: string, age: number, weight: number, height: number
): RequestReturn {
  const response = request(
    'PUT',
    SERVER_URL + ADMIN_ASTRONAUT_URL_V1 + `/${astronautId}`,
    {
      headers: { controlUserSessionId },
      json: { nameFirst, nameLast, rank, age, weight, height },
      timeout: TIMEOUT_MS 
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

export function adminAstronautHealthDetailsRequest(
  controlUserSessionId: string, astronautId: number
): RequestReturn {
  const response = request(
    'GET',
    SERVER_URL + ADMIN_ASTRONAUT_URL_V1 + `/${astronautId}/health`,
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

export function adminAstronautHealthDetailsUpdateRequest(
  controlUserSessionId: string, astronautId: number, 
  physicalHealth: PhysicalHealthIndicators, mentalHealth: MentalHealthIndicators
): RequestReturn {
  const response = request(
    'PUT',
    SERVER_URL + ADMIN_ASTRONAUT_URL_V1 + `/${astronautId}/health`,
    {
      headers: { controlUserSessionId },
      json: { physicalHealth, mentalHealth },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

export function adminLaunchVehicleCreateRequest(
  controlUserSessionId: string, name: string, description: string, maxCrewWeight: number,
  maxPayloadWeight: number, launchVehicleWeight: number, thrustCapacity: number, maneuveringFuel: number
): RequestReturn {
  const response = request(
    'POST',
    SERVER_URL + ADMIN_LAUNCHVEHICLE_URL_V1,
    {
      headers: { controlUserSessionId },
      json: { name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

export function adminLaunchCreateRequest(
  controlUserSessionId: string, missionId: number, launchVehicleId: number,
  payload: { description: string, weight: number }, launchParameters: LaunchCalcParameters
): RequestReturn {
  const response = request(
    'POST',
    SERVER_URL + ADMIN_MISSION_URL_V1 + `/${missionId}/launch`,
    {
      headers: { controlUserSessionId },
      json: { launchVehicleId, payload, launchParameters },
      timeout: TIMEOUT_MS
    }
  );
  return { result: parseResponse(response), statusCode: response.statusCode };
}

export function adminLaunchVehicleInfoRequest(
  controlUserSessionId: string, launchVehicleId: number
): RequestReturn {
  const response = request(
    'GET',
    SERVER_URL + ADMIN_LAUNCHVEHICLE_URL_V1 + `/${launchVehicleId}`,
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  );
  return { result: parseResponse(response), statusCode: response.statusCode };
}

export function adminLaunchVehicleInfoUpdateRequest(
  controlUserSessionId: string, launchVehicleId: number, name: string, description: string, maxCrewWeight: number,
  maxPayloadWeight: number, launchVehicleWeight: number, thrustCapacity: number, maneuveringFuel: number
): RequestReturn {
  const response = request(
    'PUT',
    SERVER_URL + ADMIN_LAUNCHVEHICLE_URL_V1 + `/${launchVehicleId}`,
    {
      headers: { controlUserSessionId },
      json: {
        name, description, maxCrewWeight, maxPayloadWeight,
        launchVehicleWeight, thrustCapacity, maneuveringFuel
      },
      timeout: TIMEOUT_MS
    }
  );
  return { result: parseResponse(response), statusCode: response.statusCode };
}

function adminLaunchVehicleListRequest(
  controlUserSessionId: string
): RequestReturn {
  const response = request(
    'GET',
    SERVER_URL + ADMIN_LAUNCHVEHICLE_URL_V1 + '/list',
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  );
  return { result: parseResponse(response), statusCode: response.statusCode };
}

export function adminLaunchStatusUpdateRequest(
  controlUserSessionId: string, missionId: number, launchId: number, action: string
): RequestReturn {
  const response = request(
    'PUT',
    SERVER_URL + ADMIN_MISSION_URL_V1 + `/${missionId}/launch/${launchId}/status`,
    {
      headers: { controlUserSessionId },
      json: { action },
      timeout: TIMEOUT_MS
    }
  );
  return { result: parseResponse(response), statusCode: response.statusCode };
}

export function adminLaunchVehicleRetireRequest(
  controlUserSessionId: string, launchVehicleId: number
): RequestReturn {
  const response = request(
    'DELETE',
    SERVER_URL + ADMIN_LAUNCHVEHICLE_URL_V1 + `/${launchVehicleId}`,
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  );
  return { result: parseResponse(response), statusCode: response.statusCode };
}

export function adminLaunchDetailsRequest(
  controlUserSessionId: string, missionId: number, launchId: number 
): RequestReturn {
  const response = request(
    'GET',
    SERVER_URL + ADMIN_MISSION_URL_V1 + `/${missionId}/launch/${launchId}`,
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  )
  return { result: parseResponse(response), statusCode: response.statusCode }
}

export function registerOneUser(userKey: keyof typeof validUsers): string {
  const user = validUsers[userKey];
  const sid = adminAuthRegisterRequest(
    user.email, 
    user.password, 
    user.nameFirst, 
    user.nameLast
  ).result.controlUserSessionId;
  return sid;
}

export function registerUsers(...userKeys: (keyof typeof validUsers)[]): string[] {
  return userKeys.map(key => registerOneUser(key));
}

export function registerTwoUsers() {
  const [sid1, sid2] = registerUsers('user1', 'user2');
  return { sid1, sid2 }
}

export function createOneMission(
  sessionId: string,
  missionKey: keyof typeof validMissions
): number {
  const mission = validMissions[missionKey];
  const mid = adminMissionCreateRequest(
    sessionId,
    mission.name,
    mission.description,
    mission.target
  ).result.missionId;
  return mid;
}

export function createMissions(
  sessionId: string,
  ...missionKeys: (keyof typeof validMissions)[]
): number[] {
  return missionKeys.map(key => createOneMission(sessionId, key));
}

export function createOneAstronaut(
  sessionId: string,
  astronautKey: keyof typeof validAstronauts
): number {
  const astronaut = validAstronauts[astronautKey];
  const aid = adminAstronautCreateRequest(
    sessionId,
    astronaut.nameFirst,
    astronaut.nameLast,
    astronaut.rank,
    astronaut.age,
    astronaut.weight,
    astronaut.height
  ).result.astronautId;
  return aid;
}

export function createAstronauts(
  sessionId: string,
  ...astronautKeys: (keyof typeof validAstronauts)[]
): number[] {
  return astronautKeys.map(key => createOneAstronaut(sessionId, key));
}

export function createOneLaunchVehicle(
  sessionId: string, LVKey: keyof typeof validLaunchVehicles
): number {
  const lv = validLaunchVehicles[LVKey];
  const lvid = adminLaunchVehicleCreateRequest(sessionId, lv.name, lv.description, 
    lv.maxCrewWeight, lv.maxPayloadWeight, lv.launchVehicleWeight, lv.thrustCapacity, lv.maneuveringFuel)
  return lvid.result.launchVehicleId;
}

export function createLaunchVehicles(
  sessionId: string, ...LVKeys: (keyof typeof validLaunchVehicles)[]
): number[] {
  return LVKeys.map(key => createOneLaunchVehicle(sessionId, key));
}

export function adminLaunchAllocateAstronautRequest (
  controlUserSessionId: string,
  missionId: number,
  launchId: number,
  astronautId: number
): RequestReturn {
  const response = request(
    'POST',
    SERVER_URL +
      ADMIN_MISSION_URL_V1 +
      `/${missionId}/launch/${launchId}/allocate/${astronautId}`,
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    }
  );
  return { result: parseResponse(response), statusCode: response.statusCode };
};

export function adminRemoveAstronautfromLaunchRequest(controlUserSessionId: string, astronautId: number, missionId: number, launchId: number): RequestReturn { 
  const res = request(
    'DELETE', 
    SERVER_URL + `/v1/admin/mission/${missionId}/launch/${launchId}/allocate/${astronautId}`, 
    {
      headers: { controlUserSessionId },
      timeout: TIMEOUT_MS
    })
  return { result: parseResponse(res), statusCode: res.statusCode }
}

export {
  errorResult,
  clearRequest,
  adminAuthRegisterRequest,
  adminAuthLoginRequest,
  adminAuthLogoutRequest,
  adminControlUserDetailsRequest,
  adminControlUserDetailsUpdateRequest,
  adminControlUserPasswordUpdateRequest,
  adminMissionListRequest,
  adminMissionCreateRequest,
  adminMissionRemoveRequest,
  adminMissionInfoRequest,
  adminMissionNameUpdateRequest,
  adminMissionDescriptionUpdateRequest,
  adminMissionTargetUpdateRequest,
  adminMissionAssignAstronautRequest,
  adminMissionUnassignAstronautRequest,
  adminMissionTransferRequest,
  adminAstronautPoolRequest,
  adminAstronautCreateRequest,
  adminAstronautRemoveRequest,
  adminAstronautDetailsRequest,
  adminAstronautDetailsUpdateRequest,
  adminLaunchVehicleListRequest
}

