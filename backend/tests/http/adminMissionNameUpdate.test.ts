import { errorResult, clearRequest, adminAuthRegisterRequest, adminMissionCreateRequest, adminMissionNameUpdateRequest } from "./requestHelpers";

const successResult = {}; 

beforeEach(() => {
  // call clearRequest() to reset the state
  clearRequest();
});

describe('PUT /v1/admin/mission/{missionid}/name', () => {
  let user1: any;
  let user2: any;
  let mission1: any;
  let mission2: any;

  beforeEach(() => {
    // call adminAuthRegisterRequest() with sample data for User 1 to create a sample User 1
    user1 = adminAuthRegisterRequest('user1@example.com', 'Password123', 'User', 'One');
    // call adminAuthRegisterRequest() with sample data for User 2 to create a sample User 2
    user2 = adminAuthRegisterRequest('user2@example.com', 'Password123', 'User', 'Two');
    // call adminMissionCreateRequest() with sample data for Mission 1 to create a sample Mission 1 for User 1
    mission1 = adminMissionCreateRequest(user1.result.controlUserSessionId, 'Apollo', 'Moon mission', 'Moon');
    // call adminMissionCreateRequest() with sample data for Mission 2 to create a sample Mission 2 for User 1
    mission2 = adminMissionCreateRequest(user1.result.controlUserSessionId, 'Gemini', 'Another mission', 'Earth orbit');
  });

  describe('Success Cases', () => {
    test('Successfully updates mission name', () => {
      // call adminMissionNameUpdateRequest to update Mission 1's name to 'Apollo Updated'
      const res = adminMissionNameUpdateRequest(user1.result.controlUserSessionId, mission1.result.missionId, 'Apollo Updated');
      // expect empty output {} //the reply //expecting res.result to equal successresult
      expect(res.result).toStrictEqual(successResult);
    });
  });

  describe('Error Cases', () => {
    test('ControlUserSessionId is invalid', () => {
      // call adminMissionNameUpdateRequest with an invalid controlUserSessionId 
      const res = adminMissionNameUpdateRequest('invalid-session', mission1.result.missionId, 'New Name');
      // expect the response body to equal {error: expect.any(String)}
      expect(res.result).toStrictEqual(errorResult);
      // expect the response status code to have a status of 401 
    });

    test('missionId does not exist', () => {
      // call adminMissionNameUpdateRequest with a missionId that doesn't exist
      const res = adminMissionNameUpdateRequest(user1.result.controlUserSessionId, 999999, 'New Name');
      // expect the response body to equal {error: expect.any(String)}
      expect(res.result).toStrictEqual(errorResult);
      // expect the response status code to have a status of 403
      expect(res.statusCode).toBe(403);
    });

    test('Mission does not belong to this User', () => {
      // call adminMissionNameUpdateRequest with Mission 1 missionId but for User 2 controlUserSessionId 
      const res = adminMissionNameUpdateRequest(user2.result.controlUserSessionId, mission1.result.missionId, 'New Name');
      // expect the response body to equal {error: expect.any(String)}
      expect(res.result).toStrictEqual(errorResult);
      // expect the response status code to have a status of 403
      expect(res.statusCode).toBe(403);
    });

    test('Name contains invalid characters', () => {
      // call adminMissionNameUpdateRequest with a name containing invalid characters
      const res = adminMissionNameUpdateRequest(user1.result.controlUserSessionId, mission1.result.missionId, 'Apollo@#$');
      // expect the response body to equal {error: expect.any(String)}
      expect(res.result).toStrictEqual(errorResult);
      // expect the response status code to have a status of 400
      expect(res.statusCode).toBe(400);
    });

    test('Name is too short', () => {
      // call adminMissionNameUpdateRequest with a name less than 3 characters
      const res = adminMissionNameUpdateRequest(user1.result.controlUserSessionId, mission1.result.missionId, 'Ab');
      // expect the response body to equal {error: expect.any(String)}
      expect(res.result).toStrictEqual(errorResult);
      // expect the response status code to have a status of 400
      expect(res.statusCode).toBe(400);
    });

    test('Name is too long', () => {
      // call adminMissionNameUpdateRequest with a name more than 30 characters
      const res = adminMissionNameUpdateRequest(user1.result.controlUserSessionId, mission1.result.missionId, 'A'.repeat(31));
      // expect the response body to equal {error: expect.any(String)}
      expect(res.result).toStrictEqual(errorResult);
      // expect the response status code to have a status of 400
      expect(res.statusCode).toBe(400);
    });

    test('Name is already used by the current logged in user for another mission', () => {
      // call adminMissionNameUpdateRequest to update Mission 1's name to 'Gemini' which is already used by Mission 2 
      const res = adminMissionNameUpdateRequest(user1.result.controlUserSessionId, mission1.result.missionId, 'Gemini');
      // expect the response body to equal {error: expect.any(String)}
      expect(res.result).toStrictEqual(errorResult);
      // expect the response status code to have a status of 400
      expect(res.statusCode).toBe(400);
    });
  });
});