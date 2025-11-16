import {
  adminAuthRegisterRequest,
  adminMissionCreateRequest,
  adminMissionDescriptionUpdateRequest,
  clearRequest,
  errorResult
} from './requestHelpers';

const emptyResult = {};
const longDescription = 'x'.repeat(401);

beforeEach(() => {
  clearRequest();
});

describe('PUT /v1/admin/mission/{missionId}/description', () => {
  test('updates mission description successfully', () => {
    const register = adminAuthRegisterRequest('owner@example.com', 'Password1!', 'Owner', 'One');
    const mission = adminMissionCreateRequest(
      register.result.controlUserSessionId,
      'Apollo',
      'Initial description',
      'Moon'
    );

    const update = adminMissionDescriptionUpdateRequest(
      register.result.controlUserSessionId,
      mission.result.missionId,
      'Updated mission description'
    );

    expect(update.statusCode).toBe(200);
    expect(update.result).toStrictEqual(emptyResult);
  });

  test('rejects description longer than 400 characters', () => {
    const register = adminAuthRegisterRequest('long@example.com', 'Password1!', 'Long', 'Desc');
    const mission = adminMissionCreateRequest(
      register.result.controlUserSessionId,
      'Gemini',
      'Initial description',
      'Orbit'
    );

    const update = adminMissionDescriptionUpdateRequest(
      register.result.controlUserSessionId,
      mission.result.missionId,
      longDescription
    );

    expect(update.result).toStrictEqual(errorResult);
    expect(update.statusCode).toBe(400);
  });

  test('rejects invalid session', () => {
    const update = adminMissionDescriptionUpdateRequest(
      'invalid-session',
      1,
      'Description that will fail'
    );

    expect(update.result).toStrictEqual(errorResult);
    expect(update.statusCode).toBe(401);
  });

  test('rejects update for mission not owned by user', () => {
    const owner = adminAuthRegisterRequest('owner2@example.com', 'Password1!', 'Owner', 'Two');
    const other = adminAuthRegisterRequest('other@example.com', 'Password1!', 'Other', 'User');
    const mission = adminMissionCreateRequest(
      owner.result.controlUserSessionId,
      'Voyager',
      'Explore space',
      'Deep Space'
    );

    const update = adminMissionDescriptionUpdateRequest(
      other.result.controlUserSessionId,
      mission.result.missionId,
      'Should not update'
    );

    expect(update.result).toStrictEqual(errorResult);
    expect(update.statusCode).toBe(403);
  });
});
