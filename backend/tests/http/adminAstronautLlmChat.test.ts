import {
  clearRequest,
  registerTwoUsers,
  createOneMission,
  createOneAstronaut,
  createOneLaunchVehicle,
  adminMissionAssignAstronautRequest,
  adminLaunchCreateRequest,
  adminAllocateAstronautLaunchRequest,
  adminLaunchStatusUpdateRequest,
  errorResult,
} from './requestHelpers';

import request from 'sync-request-curl';
import { port, url } from '../../src/config.json';
import { validLaunchParameters, validPayloads } from '../../src/testSamples';

const SERVER_URL = `${url}:${port}`;
const ADMIN_ASTRONAUT_URL_V1 = '/v1/admin/astronaut';

// Helper for sending a chat message to AeroBot
const adminAstronautLlmChatRequest = (astronautId: number, messageRequest: string) => {
  const res = request('POST', SERVER_URL + ADMIN_ASTRONAUT_URL_V1 + `/${astronautId}/llmchat`, {
    json: { messageRequest }, // ✅ correct param name
    timeout: 15000,
  });
  return { result: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

describe('HTTP tests for /v1/admin/astronaut/:astronautid/llmchat', () => {
  let sid1: string;
  let sid2: string;
  let missionId: number;
  let astronautId: number;
  let launchId: number;
  let launchVehicleId: number;

  beforeEach(() => {
    clearRequest();
    ({ sid1, sid2 } = registerTwoUsers());

    // Step 1: Create mission and astronaut
    missionId = createOneMission(sid1, 1);
    astronautId = createOneAstronaut(sid1, 1);

    // Step 2: Assign astronaut to mission
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);

    // Step 3: Create launch vehicle and launch
    launchVehicleId = createOneLaunchVehicle(sid1, 1);
    const payload = validPayloads[1];
    const launchParameters = validLaunchParameters[1];
    const launchRes = adminLaunchCreateRequest(sid1, missionId, launchVehicleId, payload, launchParameters);
    launchId = launchRes.result.launchId;

    // Step 4: Allocate astronaut to launch
    adminAllocateAstronautLaunchRequest(sid1, missionId, launchId, astronautId);

    // Step 5: Set state to active (not ON_EARTH)
    adminLaunchStatusUpdateRequest(sid1, missionId, launchId, 'LIFTOFF');
  });

  test.only('✅ Successfully chats with AeroBot', () => {
    const res = adminAstronautLlmChatRequest(astronautId, 'How are the mission systems performing today?');

    console.log('LLM Chat Response:', res.result);
    expect(res.statusCode).toBe(200);
    expect(res.result).toHaveProperty('messageResponse');
    expect(typeof res.result.messageResponse).toBe('string');
  });

  test('🚫 400: astronaut not in active launch', () => {
    const newAstronautId = createOneAstronaut(sid1, 2); // not allocated
    const res = adminAstronautLlmChatRequest(newAstronautId, 'Hello AeroBot');
    expect(res.statusCode).toBe(400);
    expect(res.result).toEqual(errorResult);
  });

  test('🚫 400: invalid astronaut ID', () => {
    const res = adminAstronautLlmChatRequest(9999, 'Who am I?');
    expect(res.statusCode).toBe(400);
    expect(res.result).toEqual(errorResult);
  });
});
