import { response } from 'express';
import { validMissions, validUsers } from '../../src/testSamples';
import { adminMissionListRequest, adminMissionTransferRequest, clearRequest, createMissions, errorResult, registerUsers} from './requestHelpers';
// also need the following request helpers:
//  - adminAuthRegister
//  - adminMissionCreate
//  - adminMissionList
//  - clear

const user1 = validUsers.user1
const user2 = validUsers.user2

let sid1: string;
let sid2: string;
let mid1: number;
let mid2: number;
let mid3: number;

beforeEach(() => {
  clearRequest();
  [sid1, sid2] = registerUsers('user1', 'user2');
  [mid1, mid2] = createMissions(sid1, 1, 2);
  [mid3] = createMissions(sid2, 3);
});

// skipping these tests for now
describe('POST /v1/admin/mission/:missionid/transfer Tests', () => {
  describe('Success Tests', () => {
    test('Correct output', () => {
        // call adminMissionTransfer to transfer Mission 2 from User 1 to User 2
        // expect empty output {}
      const res = adminMissionTransferRequest(sid1, mid2, user2.email)
      expect(res.result).toStrictEqual({})
    });
    test('Datastore modification', () => {
        // call adminMissionTransfer to transfer Mission 2 from User 1 to User 2
        // call adminMissionListRequest() for User 2
        // expect User 2 to now have 2 missions with the second mission having a missionid to the original Mission 2 from User 1
      adminMissionTransferRequest(sid1, mid2, user2.email)
      const res = adminMissionListRequest(sid2)
      expect(res.result).toStrictEqual({ missions: [
          { missionId: mid2, name: validMissions[2].name },
          { missionId: mid3, name: validMissions[3].name }
      ]})
    });
  });
  // skipping these tests for now
  describe('Error Cases', () => {
    test('401 - ControlUserSessionId is empty', () => {
        // call adminMissionTransfer with an empty controlUserSessionId
        // expect the response body to equal {error: expect.any(String)}
        // expect the response status code to have a status of 401.
      const res = adminMissionTransferRequest('', mid2, user2.email)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(401)
    });
    test('401 - ControlUserSessionId is invalid', () => {
        // call adminMissionTransfer with an invalid controlUserSessionId (concatenate User 1 controlUserSessionId and User 2 controlUserSessionId)
        // expect the response body to equal {error: expect.any(String)}
        // expect the response status code to have a status of 401.
      const res = adminMissionTransferRequest(sid1 + sid2, mid2, user2.email)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(401)
    });
    test('403 - missionid is empty', () => {
        // call adminMissionTransfer with empty missionid
        // expect the response body to equal {error: expect.any(String)}
        // expect the response status code to have a status of 403.
      const res = adminMissionTransferRequest(sid1, -1, user2.email)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(403)
    });
    test('403 - Mission does not belong to this User', () => {
        // call adminMissionTransfer with Mission 2 missionid but for User 2 controlUserSessionId.
        // expect the response body to equal {error: expect.any(String)}
        // expect the response status code to have a status of 403.
      const res = adminMissionTransferRequest(sid2, mid2, user2.email)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(403)
    });
    
    test('400 - userEmail is not a real control user', () => {
        // call adminMissionTransfer with an email not in the system
        // expect the response body to equal {error: expect.any(String)}
        // expect the response status code to have a status of 400.
      const res = adminMissionTransferRequest(sid1, mid2, user1.email + user2.email)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    });
    test('400 - userEmail is the current logged in control user', () => {
        // call adminMissionTransfer with Mission 2 for User 1 to User 1
        // expect the response body to equal {error: expect.any(String)}
        // expect the response status code to have a status of 403.
      const res = adminMissionTransferRequest(sid1, mid2, user1.email)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    });
    test('400 - missionId refers to a space mission that has a name that is already used by the target user', () => {
        // create Mission 4 using Sample Mission 2 for User 2
        // call adminMissionTransfer with Mission 2 to User 2.
        // expect the response body to equal {error: expect.any(String)}
        // expect the response status code to have a status of 403.
      const [mid4] = createMissions(sid2, 2)
      const res = adminMissionTransferRequest(sid1, mid2, user2.email)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    });
  });
})