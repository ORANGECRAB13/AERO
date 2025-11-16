import { clearRequest, adminAuthRegisterRequest, adminAstronautCreateRequest, adminAstronautPoolRequest, errorResult } from './requestHelpers';

const emptyResult = { astronauts: expect.any(Array) };

beforeEach(() => {
  clearRequest();
});

describe('GET /v1/admin/astronaut/pool', () => {
  test('returns list of astronauts with assignment flag', () => {
    const user = adminAuthRegisterRequest('pool@example.com', 'Password1!', 'Pool', 'Owner');
    const sessionId = user.result.controlUserSessionId;

    const create = adminAstronautCreateRequest(
      sessionId,
      'Jane',
      'Doe',
      'Captain',
      35,
      80,
      170
    );

    expect(create.statusCode).toBe(200);

    const pool = adminAstronautPoolRequest(sessionId);
    expect(pool.statusCode).toBe(200);
    expect(pool.result).toMatchObject(emptyResult);
    expect(pool.result.astronauts).toContainEqual({
      astronautId: expect.any(Number),
      designation: 'Captain Jane Doe',
      assigned: false
    });
  });

  test('rejects requests with invalid session', () => {
    const pool = adminAstronautPoolRequest('invalid-session');
    expect(pool.result).toStrictEqual(errorResult);
    expect(pool.statusCode).toBe(401);
  });
});
