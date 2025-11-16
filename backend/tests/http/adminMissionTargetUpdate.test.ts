import { errorResult, clearRequest, adminAuthRegisterRequest, adminMissionCreateRequest, adminMissionTargetUpdateRequest } from "./requestHelpers";

const successResult = {};

beforeEach(() => {
  // call clearRequest() to reset the state
  clearRequest();
});

describe('PUT /v1/admin/mission/{missionid}/target', () => {
  let user1: any; 
  let user2: any;
  let mission1: any;

  beforeEach(() => {
    // call adminAuthRegisterRequest() with sample data for User 1 to create a sample User 1
    user1 = adminAuthRegisterRequest('user1@example.com', 'Password123', 'User', 'One');
    // call adminAuthRegisterRequest() with sample data for User 2 to create a sample User 2
    user2 = adminAuthRegisterRequest('user2@example.com', 'Password123', 'User', 'Two');
    // call adminMissionCreateRequest() with sample data for Mission 1 to create a sample Mission 1 for User 1
    mission1 = adminMissionCreateRequest(user1.result.controlUserSessionId, 'Apollo', 'Moon mission', 'Moon');
  });

  describe('Success Cases', () => {
    test('Successfully updates mission target', () => {
      // call adminMissionTargetUpdateRequest to update Mission 1's target to 'Mars'
      const res = adminMissionTargetUpdateRequest(user1.result.controlUserSessionId, mission1.result.missionId, 'Mars');
      // expect empty output {}
      expect(res.result).toStrictEqual(successResult);
    });
  });

  describe('Error Cases', () => {
    test('ControlUserSessionId is invalid', () => {
      // call adminMissionTargetUpdateRequest with an invalid controlUserSessionId
      const res = adminMissionTargetUpdateRequest('invalid-session', mission1.result.missionId, 'Mars');
      // expect the response body to equal {error: expect.any(String)}
      expect(res.result).toStrictEqual(errorResult);
      // expect the response status code to have a status of 401
      expect(res.statusCode).toBe(401);
    });

    test('missionId does not exist', () => {
      // call adminMissionTargetUpdateRequest with a missionId that doesn't exist
      const res = adminMissionTargetUpdateRequest(user1.result.controlUserSessionId, 999999, 'Mars');
      // expect the response body to equal {error: expect.any(String)}
      expect(res.result).toStrictEqual(errorResult);
      // expect the response status code to have a status of 403
      expect(res.statusCode).toBe(403);
    });

    test('Mission does not belong to this User', () => {
      // call adminMissionTargetUpdateRequest with Mission 1 missionId but for User 2 controlUserSessionId
      const res = adminMissionTargetUpdateRequest(user2.result.controlUserSessionId, mission1.result.missionId, 'Mars');
      // expect the response body to equal {error: expect.any(String)}
      expect(res.result).toStrictEqual(errorResult);
      // expect the response status code to have a status of 403
      expect(res.statusCode).toBe(403);
    });

    test('Target is more than 100 characters in length', () => {
      // call adminMissionTargetUpdateRequest with a target more than 100 characters
      const res = adminMissionTargetUpdateRequest(user1.result.controlUserSessionId, mission1.result.missionId, 'A'.repeat(101));
      // expect the response body to equal {error: expect.any(String)}
      expect(res.result).toStrictEqual(errorResult);
      // expect the response status code to have a status of 400
      expect(res.statusCode).toBe(400);
    });
  });
});