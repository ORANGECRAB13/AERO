import {
  clearRequest,
  adminControlUserPasswordUpdateRequest,
  adminAuthLoginRequest,
  registerOneUser,
  adminAuthRegisterRequest,
} from './requestHelpers';

describe('HTTP tests for /v1/admin/controluser/password', () => {
  let sid: string;

  beforeEach(() => {
    clearRequest();
    sid = registerOneUser('user1');
  });

  const oldPassword = 'eHI63}E;58eJ';
  const newPassword = 'NewValid123';

  test('Successfully updates password and allows login with new password', () => {
    const update = adminControlUserPasswordUpdateRequest(sid, oldPassword, newPassword);
    expect(update.statusCode).toBe(200);
    expect(update.result).toStrictEqual({});

    const loginNew = adminAuthLoginRequest('myBrotherErwin@ad.unsw.edu.au', newPassword);
    expect(loginNew.statusCode).toBe(200);
  });

  test('Unsuccessful password update cases', () => {
    // Invalid credentials (nonexistent session)
    const invalid = adminControlUserPasswordUpdateRequest('9999', 'doesntMatterHahaha', 'somethingNew123');
    expect(invalid.statusCode).toBe(401);
    expect(invalid.result).toHaveProperty('error');

    // Incorrect old password
    const user2Sid = registerOneUser('user2');
    const wrongOld = adminControlUserPasswordUpdateRequest(user2Sid, 'wrongPass', 'AnotherPass123');
    expect(wrongOld.statusCode).toBe(400);
    expect(wrongOld.result).toHaveProperty('error');

    // New password matches old password
    const samePassUser = adminAuthRegisterRequest('oldkjdf3@example.com', 'GoodPass123', 'User', 'Three');
    const samePass = adminControlUserPasswordUpdateRequest(
      samePassUser.result.controlUserSessionId,
      'GoodPass123',
      'GoodPass123'
    );
    expect(samePass.statusCode).toBe(400);
    expect(samePass.result).toHaveProperty('error');

    // Reusing a previously used password
    const reuseUser = adminAuthRegisterRequest('mrbrown4@example.com', 'FirstPass123', 'User', 'Four');
    adminControlUserPasswordUpdateRequest(reuseUser.result.controlUserSessionId, 'FirstPass123', 'SecondPass123');
    const reused = adminControlUserPasswordUpdateRequest(
      reuseUser.result.controlUserSessionId,
      'SecondPass123',
      'FirstPass123'
    );
    expect(reused.statusCode).toBe(400);
    expect(reused.result).toHaveProperty('error');

    // Invalid new password format (too short)
    const shortUser = adminAuthRegisterRequest('user5@example.com', 'ValidPass123', 'User', 'Five');
    const shortPass = adminControlUserPasswordUpdateRequest(
      shortUser.result.controlUserSessionId,
      'ValidPass123',
      'short'
    );
    expect(shortPass.statusCode).toBe(400);
    expect(shortPass.result).toHaveProperty('error');
  });
});
