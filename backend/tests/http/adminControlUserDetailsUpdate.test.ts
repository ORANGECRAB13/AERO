import {
  adminAuthRegisterRequest,
  adminControlUserDetailsRequest,
  adminControlUserDetailsUpdateRequest,
  clearRequest,
  errorResult
} from './requestHelpers';

const emptyResult = {};

beforeEach(() => {
  clearRequest();
});

describe('PUT /v1/admin/controluser/details', () => {
  test('updates current user profile successfully', () => {
    const register = adminAuthRegisterRequest('user@example.com', 'Password1!', 'Alice', 'Smith');
    const sessionId = register.result.controlUserSessionId;

    const update = adminControlUserDetailsUpdateRequest(
      sessionId,
      'updated@example.com',
      'Alicia',
      'Stone'
    );

    expect(update.statusCode).toBe(200);
    expect(update.result).toStrictEqual(emptyResult);

    const details = adminControlUserDetailsRequest(sessionId);
    expect(details.statusCode).toBe(200);
    expect(details.result).toMatchObject({
      user: {
        controlUserId: expect.any(Number),
        email: 'updated@example.com',
        name: 'Alicia Stone',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number)
      }
    });
  });

  test('rejects update when email already used by another user', () => {
    const user1 = adminAuthRegisterRequest('first@example.com', 'Password1!', 'First', 'User');
    adminAuthRegisterRequest('second@example.com', 'Password1!', 'Second', 'User');

    const update = adminControlUserDetailsUpdateRequest(
      user1.result.controlUserSessionId,
      'second@example.com',
      'First',
      'User'
    );

    expect(update.result).toStrictEqual(errorResult);
    expect(update.statusCode).toBe(400);
  });

  test('rejects update when session is invalid', () => {
    const update = adminControlUserDetailsUpdateRequest(
      'invalid-session',
      'any@example.com',
      'Any',
      'Body'
    );

    expect(update.result).toStrictEqual(errorResult);
    expect(update.statusCode).toBe(401);
  });
});
