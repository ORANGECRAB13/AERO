import { registerUsers, createMissions, adminMissionInfoRequest, clearRequest, errorResult } from './requestHelpers'
import { adminMissionInfo } from '../../src/mission'
import { errorMessages, validMissions, validUsers } from '../../src/testSamples'

const { user1, user2 } = validUsers

beforeEach(() => clearRequest())

describe('GET /v1/admin/mission/:missionid', () => {
  describe('Error Cases', () => {
    test('401', () => {
      const res = adminMissionInfoRequest('', 1)
      expect(res.result).toStrictEqual({ error: errorMessages.INVALID_CREDENTIALS.sessionId })
      expect(res.statusCode).toBe(401)
    })

    test('403 - missionid DNE', () => {
      const [sid] = registerUsers('user1')
      const res = adminMissionInfoRequest(sid, 1)
      expect(res.result).toStrictEqual({ error: errorMessages.INACCESSIBLE_VALUE.missionId })
      expect(res.statusCode).toBe(403)
    })

    test('403 - mission does not belong to user', () => {
      const [sid1, sid2] = registerUsers('user1', 'user2')
      const [mid] = createMissions(sid1, 1)
      const res = adminMissionInfoRequest(sid2, 1)
      expect(res.result).toStrictEqual({ error: errorMessages.INACCESSIBLE_VALUE.missionId })
      expect(res.statusCode).toBe(403)
    })
  })

  describe('Mixed Cases', () => {
    test('correct return value', () => {
      const [sid1, sid2] = registerUsers('user1', 'user2')
      const [mid1, mid2] = createMissions(sid1, 1, 2)
      const [mid3, mid4] = createMissions(sid2, 3, 4)

      const result1 = adminMissionInfoRequest(sid1, 1)
      expect(result1.result).toStrictEqual({
        missionId: mid1,
        name: validMissions[1].name,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: validMissions[1].description,
        target: validMissions[1].target,
        assignedAstronauts: []
      })

      const result2 = adminMissionInfoRequest(sid1, 2)
      expect(result2.result).toStrictEqual({
        missionId: mid2,
        name: validMissions[2].name,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: validMissions[2].description,
        target: validMissions[2].target,
        assignedAstronauts: []
      })

      const result3 = adminMissionInfoRequest(sid2, 3)
      expect(result3.result).toStrictEqual({
        missionId: mid3,
        name: validMissions[3].name,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: validMissions[3].description,
        target: validMissions[3].target,
        assignedAstronauts: []
      })

      const result4 = adminMissionInfoRequest(sid2, 4)
      expect(result4.result).toStrictEqual({
        missionId: mid4,
        name: validMissions[4].name,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: validMissions[4].description,
        target: validMissions[4].target,
        assignedAstronauts: []
      })

      const error403 = adminMissionInfoRequest(sid2, 1)
      expect(error403.result).toStrictEqual({ error: errorMessages.INACCESSIBLE_VALUE.missionId })
      expect(error403.statusCode).toBe(403)
    })

  })
})