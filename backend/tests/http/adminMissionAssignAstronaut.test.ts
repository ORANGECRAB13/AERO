import {
  clearRequest,
  registerTwoUsers,
  createOneMission,
  createOneAstronaut,
  adminMissionAssignAstronautRequest,
  adminMissionInfoRequest,
} from './requestHelpers';

describe('HTTP tests for /v1/admin/mission/:missionid/assign/:astronautid', () => {
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

  test('Successfully assigns astronaut to mission', () => {
    const res = adminMissionAssignAstronautRequest(sid1, missionId, astronautId);
    expect(res.statusCode).toBe(200);

    const missionInfo = adminMissionInfoRequest(sid1, missionId);
    expect(missionInfo.statusCode).toBe(200);
    expect(missionInfo.result.assignedAstronauts).toEqual(
      expect.arrayContaining([{ astronautId, designation: expect.any(String) }])
    );
  });

  test('session ID is invalid (401)', () => {
    const res = adminMissionAssignAstronautRequest('invalidSession', missionId, astronautId);
    expect(res.statusCode).toBe(401);
  });

  test('mission ID does not exist (403)', () => {
    const res = adminMissionAssignAstronautRequest(sid1, 9999, astronautId);
    expect(res.statusCode).toBe(403);
  });

  test(' mission belongs to another user (403)', () => {
    const res = adminMissionAssignAstronautRequest(sid2, missionId, astronautId);
    expect(res.statusCode).toBe(403);
  });

  test('astronaut ID is invalid (400)', () => {
    const res = adminMissionAssignAstronautRequest(sid1, missionId, 9999);
    expect(res.statusCode).toBe(400);
  });

  test('astronaut already assigned to another mission (400)', () => {
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);
    const newMissionId = createOneMission(sid1, 2);
    const res = adminMissionAssignAstronautRequest(sid1, newMissionId, astronautId);
    expect(res.statusCode).toBe(400);
  });

  test('astronaut already assigned to the same mission (400)', () => {
    adminMissionAssignAstronautRequest(sid1, missionId, astronautId);
    const res = adminMissionAssignAstronautRequest(sid1, missionId, astronautId);
    expect(res.statusCode).toBe(400);
  });
});
