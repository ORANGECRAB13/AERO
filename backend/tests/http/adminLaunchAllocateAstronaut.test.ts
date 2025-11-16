import {
  clearRequest,
  registerTwoUsers,
  createOneMission,
  createOneAstronaut,
  createOneLaunchVehicle,
  adminLaunchCreateRequest,
  adminLaunchDetailsRequest,
  errorResult,
  createAstronauts,
  adminMissionAssignAstronautRequest,
  adminLaunchAllocateAstronautRequest,
} from './requestHelpers';
import { validLaunchParameters, validPayloads } from '../../src/testSamples';

describe('HTTP tests for POST /v1/admin/mission/:missionid/launch/:launchid/allocate/:astronautid', () => {
  let sid1: string;
  let sid2: string;
  let missionId: number;
  let astronautId: number;
  let launchId: number;
  let launchVehicleId: number;

  beforeEach(() => {
    clearRequest();
    ({ sid1, sid2 } = registerTwoUsers());
    missionId = createOneMission(sid1, 1);
    astronautId = createOneAstronaut(sid1, 1);
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);
    launchVehicleId = createOneLaunchVehicle(sid1, 2);
    const payload = validPayloads[1];
    const launchParameters = validLaunchParameters[1];

    const res = adminLaunchCreateRequest(sid1, missionId, launchVehicleId, payload, launchParameters);
    launchId = res.result.launchId;
  });

  test('Successfully allocates astronaut to launch', () => {
    const res = adminLaunchAllocateAstronautRequest(sid1, missionId, launchId, astronautId);
    console.log(res.result);
    expect(res.statusCode).toBe(200);
    const launchDetails = adminLaunchDetailsRequest(sid1, missionId, launchId);
    expect(launchDetails.statusCode).toBe(200);
    expect(launchDetails.result.allocatedAstronauts).toEqual(
    expect.arrayContaining([{ astronautId, designation: expect.any(String) }])
    );

  });

  test('401: session ID invalid', () => {
    const res = adminLaunchAllocateAstronautRequest('invalidSession', missionId, launchId, astronautId);
    expect(res.statusCode).toBe(401);
    expect(res.result).toEqual(errorResult);
  });

  test('403: mission does not exist', () => {
    const res = adminLaunchAllocateAstronautRequest(sid1, 1234, launchId, astronautId);
    expect(res.statusCode).toBe(403);
    expect(res.result).toEqual(errorResult);
  });

  test('403: mission owned by another user', () => {
    const res = adminLaunchAllocateAstronautRequest(sid2, missionId, launchId, astronautId);
    expect(res.statusCode).toBe(403);
    expect(res.result).toEqual(errorResult);
  });

  test('400: invalid astronaut ID', () => {
    const res = adminLaunchAllocateAstronautRequest(sid1, missionId, launchId, 9203);
    expect(res.statusCode).toBe(400);
    expect(res.result).toEqual(errorResult);
  });

  test('400: astronaut already allocated to another ongoing launch', () => {
    // 1st allocation attempt (Success)
    const res1 = adminLaunchAllocateAstronautRequest(sid1, missionId, launchId, astronautId);
    expect(res1.statusCode).toBe(200);

    const payload = validPayloads[3];
    const launchParameters = validLaunchParameters[2];

    const newlvid = createOneLaunchVehicle(sid1, 1)
    const newLaunch = adminLaunchCreateRequest(sid1, missionId, newlvid, payload, launchParameters);
    const newLaunchId = newLaunch.result.launchId;
    // 2nd allocation attempt (Fail)
    const res2 = adminLaunchAllocateAstronautRequest(sid1, missionId, newLaunchId, astronautId);
    expect(res2.statusCode).toBe(400);
    expect(res2.result).toEqual(errorResult);
  });

  test('400: total crew weight exceeds maxCrewWeight', () => {
    // 80kg + 80lg = 160 > 150
    adminLaunchAllocateAstronautRequest(sid1, missionId, launchId, astronautId);
    astronautId = createOneAstronaut(sid1, 4);
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);
    const res = adminLaunchAllocateAstronautRequest(sid1, missionId, launchId, astronautId);
    expect(res.statusCode).toBe(400);
    expect(res.result).toEqual(errorResult);
  });

  test('400: astronaut not assigned to this mission', () => {
    astronautId = createOneAstronaut(sid1, 2);
    const res = adminLaunchAllocateAstronautRequest(sid1, missionId, launchId, astronautId);
    expect(res.statusCode).toBe(400);
    expect(res.result).toEqual(errorResult);
  })
});
