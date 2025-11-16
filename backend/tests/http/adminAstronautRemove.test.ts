import { adminAstronautCreateRequest, adminAstronautRemoveRequest, adminAuthLogoutRequest, adminMissionAssignAstronautRequest, adminMissionCreateRequest, clearRequest, registerOneUser } from "./requestHelpers"
import { validAstronauts } from "../../src/testSamples";

const no1 = validAstronauts[1]

beforeEach(() => {
    clearRequest();
})
describe('DELETE /v1/admin/astronaut/:astronautid', () => {
  test('controlusersessinoid is empty', () => {
    const res = adminAstronautRemoveRequest('eee', 6);
    expect(res.result).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  })
  let controlUserSessionId: string;
  beforeEach(() => {
      controlUserSessionId = registerOneUser('user1');
  })
  test('controlusersessinoid is invalid', () => {
    const sessionId = registerOneUser('user1');
    adminAuthLogoutRequest(sessionId);
    const res = adminAstronautRemoveRequest(sessionId, 6);
    expect(res.result).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  })
  describe('BAD INPUT', () => {
    test('astronautid is invalid', () => {
      const res = adminAstronautRemoveRequest(controlUserSessionId, 6);
      expect(res.result).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toBe(400);
    })
    test('The astronaut is currently assigned to a mission', () => {
      const missionid = adminMissionCreateRequest(controlUserSessionId, 'mission1', 'description', 'who knows').result.missionId;
      const astronautId = adminAstronautCreateRequest(controlUserSessionId, no1.nameFirst, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height).result.astronautId;
      adminMissionAssignAstronautRequest(controlUserSessionId, astronautId, missionid);
      const res = adminAstronautRemoveRequest(controlUserSessionId, astronautId);
      expect(res.result).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toBe(400);
    })
  })
  test('successfully delete the astronaut', () => {
    const astronautId = adminAstronautCreateRequest(controlUserSessionId, no1.nameFirst, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height).result.astronautId;
    const res = adminAstronautRemoveRequest(controlUserSessionId, astronautId);
    expect(res.result).toStrictEqual({});
  })
})