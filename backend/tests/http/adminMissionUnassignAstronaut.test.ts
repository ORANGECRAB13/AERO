import { validLaunchParameters, validPayloads } from '../../src/testSamples';
import {
  clearRequest,
  registerTwoUsers,
  createOneMission,
  createOneAstronaut,
  adminMissionAssignAstronautRequest,
  adminMissionUnassignAstronautRequest,
  adminMissionUnassignAstronautRequestV2,
  adminMissionInfoRequest,
  adminAstronautDetailsRequest,
  createOneLaunchVehicle,
  adminLaunchCreateRequest,
  adminLaunchAllocateAstronautRequest,
} from './requestHelpers';

describe('HTTP tests for DELETE /v1/admin/mission/:missionid/assign/:astronautid', () => {
  let sid1: string;
  let sid2: string;
  let missionId: number;
  let astronautId: number;

  beforeEach(() => {
    clearRequest();
    ({ sid1, sid2 } = registerTwoUsers());
    missionId = createOneMission(sid1, 1);
    astronautId = createOneAstronaut(sid1, 1);
  });

  test('Successfully unassigned astronaut', () => {
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);

    const res = adminMissionUnassignAstronautRequest(sid1, missionId, astronautId);
    expect(res.statusCode).toBe(200);
    expect(res.result).toStrictEqual({});

    const missionInfo = adminMissionInfoRequest(sid1, missionId);
    expect(missionInfo.statusCode).toBe(200);
    expect(missionInfo.result.assignedAstronauts).toEqual([]);

    const astronautDetails = adminAstronautDetailsRequest(sid1, astronautId);
    expect(astronautDetails.statusCode).toBe(200);
    expect(astronautDetails.result.assignedMission).toEqual({});
  });

  test('Astronaut is allocated to a launch - Success', () => {
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);
    const lvid = createOneLaunchVehicle(sid1, 1)
    const launchId = adminLaunchCreateRequest(sid1, missionId, lvid, validPayloads[1], validLaunchParameters[1]).result.launchId
    const result = adminLaunchAllocateAstronautRequest(sid1, missionId, launchId, astronautId)
    expect(result.statusCode).toBe(200)
    const res = adminMissionUnassignAstronautRequest(sid1, missionId, astronautId);
    expect(res.result).toStrictEqual({})
    expect(res.statusCode).toBe(200)
  })

  test('Invalid session ID, return 401', () => {
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);

    const res = adminMissionUnassignAstronautRequest('invalidSession', missionId, astronautId);
    expect(res.statusCode).toBe(401);
  });

  test('missionId does not exist or no permission, return 403', () => {
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);

    const res = adminMissionUnassignAstronautRequest(sid1, 9999, astronautId);
    expect(res.statusCode).toBe(403);
  });

  test('Mission belongs to another user, return 403', () => {
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);

    const res = adminMissionUnassignAstronautRequest(sid2, missionId, astronautId);
    expect(res.statusCode).toBe(403);
  });

  test('Invalid astronautId, return 400', () => {
    const res = adminMissionUnassignAstronautRequest(sid1, missionId, 9999);
    expect(res.statusCode).toBe(400);
  });

  test('Astronaut not assigned to this mission, return 400', () => {
    const res = adminMissionUnassignAstronautRequest(sid1, missionId, astronautId);
    expect(res.statusCode).toBe(400);
  });

  test('Astronaut is assigned to another mission, return 400', () => {
    const otherMissionId = createOneMission(sid1, 2);
    adminMissionAssignAstronautRequest(sid1, otherMissionId, astronautId);

    const res = adminMissionUnassignAstronautRequest(sid1, missionId, astronautId);
    expect(res.statusCode).toBe(400);
  });
});

describe('HTTP tests for DELETE /v2/admin/mission/:missionid/assign/:astronautid', () => {
  let sid1: string;
  let sid2: string;
  let missionId: number;
  let astronautId: number;

  beforeEach(() => {
    clearRequest();
    ({ sid1, sid2 } = registerTwoUsers());
    missionId = createOneMission(sid1, 1);
    astronautId = createOneAstronaut(sid1, 1);
  });

  test('Successfully unassigned astronaut', () => {
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);

    const res = adminMissionUnassignAstronautRequestV2(sid1, missionId, astronautId);
    expect(res.statusCode).toBe(200);
    expect(res.result).toStrictEqual({});

    const missionInfo = adminMissionInfoRequest(sid1, missionId);
    expect(missionInfo.statusCode).toBe(200);
    expect(missionInfo.result.assignedAstronauts).toEqual([]);

    const astronautDetails = adminAstronautDetailsRequest(sid1, astronautId);
    expect(astronautDetails.statusCode).toBe(200);
    expect(astronautDetails.result.assignedMission).toEqual({});
  });

  test('Invalid session ID, return 401', () => {
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);

    const res = adminMissionUnassignAstronautRequestV2('invalidSession', missionId, astronautId);
    expect(res.statusCode).toBe(401);
  });

  test('missionId does not exist or no permission, return 403', () => {
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);

    const res = adminMissionUnassignAstronautRequestV2(sid1, 9999, astronautId);
    expect(res.statusCode).toBe(403);
  });

  test('Mission belongs to another user, return 403', () => {
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);

    const res = adminMissionUnassignAstronautRequestV2(sid2, missionId, astronautId);
    expect(res.statusCode).toBe(403);
  });

  test('Invalid astronautId, return 400', () => {
    const res = adminMissionUnassignAstronautRequestV2(sid1, missionId, 9999);
    expect(res.statusCode).toBe(400);
  });

  test('Astronaut not assigned to this mission, return 400', () => {
    const res = adminMissionUnassignAstronautRequestV2(sid1, missionId, astronautId);
    expect(res.statusCode).toBe(400);
  });

  test('Astronaut is assigned to another mission, return 400', () => {
    const otherMissionId = createOneMission(sid1, 2);
    adminMissionAssignAstronautRequest(sid1, otherMissionId, astronautId);

    const res = adminMissionUnassignAstronautRequestV2(sid1, missionId, astronautId);
    expect(res.statusCode).toBe(400);
  });

  test('Astronaut is allocated to a launch - 400', () => {
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);
    const lvid = createOneLaunchVehicle(sid1, 1)
    const launchId = adminLaunchCreateRequest(sid1, missionId, lvid, validPayloads[1], validLaunchParameters[1]).result.launchId
    const result = adminLaunchAllocateAstronautRequest(sid1, missionId, launchId, astronautId)
    expect(result.statusCode).toBe(200)
    const res = adminMissionUnassignAstronautRequestV2(sid1, missionId, astronautId);
    expect(res.result).toStrictEqual({ error: expect.any(String) })
    expect(res.statusCode).toBe(400)
  })
});
