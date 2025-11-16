import { adminMissionAssignAstronautRequest, adminMissionInfoRequest, adminMissionRemoveRequest, clearRequest, createAstronauts, createMissions, errorResult, registerUsers, } from "./requestHelpers";

beforeEach(() => clearRequest())

describe('DELETE /v1/admin/mission/:missionid', () => {
  describe('Error Cases', () => {
    test('400 - Astronaut Assigned', () => {
      const [sid] = registerUsers('user1')
      const [mid] = createMissions(sid, 1)
      const [aid] = createAstronauts(sid, 1)
      adminMissionAssignAstronautRequest(sid, mid, aid)
      const res = adminMissionRemoveRequest(sid, mid)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })

    test('401 - sessionid invalid', () => {
      const [sid] = registerUsers('user1')
      const [mid] = createMissions(sid, 1)
      const res = adminMissionRemoveRequest('', mid)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(401)
    })

    test('403 - mission DNE', () => {
      const [sid] = registerUsers('user1')
      const [mid] = createMissions(sid, 1)
      const res = adminMissionRemoveRequest(sid, mid + 1)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(403)
    })

    test('403 - controluser not owner of mission', () => {
      const [sid] = registerUsers('user1')
      const [sid2] = registerUsers('user2')
      const [mid] = createMissions(sid2, 1)
      const res = adminMissionRemoveRequest(sid, mid)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(403)
    })
    
  })

  describe('Success Cases', () => {
    test('correct return type', () => {
      const [sid] = registerUsers('user1')
      const [mid] = createMissions(sid, 1)
      const res = adminMissionRemoveRequest(sid, mid)
      expect(res.result).toStrictEqual({})
      expect(adminMissionInfoRequest(sid, mid).result).toStrictEqual(errorResult)
    })
  })
})