import { adminAuthLoginRequest, adminAuthRegisterRequest, adminControlUserDetailsRequest, clearRequest } from "./requestHelpers"

beforeEach(() => {
  clearRequest();
})

describe("GET /v1/admin/controluser/details", () => {
  test('the controlsessionId is not a valid user', () => {
    const res = adminControlUserDetailsRequest('123qwe');
    expect(res.statusCode).toBe(401);
    expect(res.result).toStrictEqual({ error: expect.any(String)});
  })
  
  let controlusersessionId: string;
  beforeEach(() => {
    controlusersessionId = adminAuthRegisterRequest('james.kirk@starfleet.gov.au', 'qseawd123', 'Tam', 'gugugu').result.controlUserSessionId;
  })

  test('success output the information', () => {
    const res = adminControlUserDetailsRequest(controlusersessionId);
    expect(res.result).toStrictEqual({
      user: {
        controlUserId: expect.any(Number),
        name: 'Tam gugugu',
        email: 'james.kirk@starfleet.gov.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  })
  test('correctly count the number of failedpassword', () => {
    adminAuthLoginRequest('james.kirk@starfleet.gov.au', 'qseawd12');
    adminAuthLoginRequest('james.kirk@starfleet.gov.au', 'sefsegs778')
    const res = adminControlUserDetailsRequest(controlusersessionId);
    expect(res.result).toStrictEqual({
      user: {
        controlUserId: expect.any(Number),
        name: 'Tam gugugu',
        email: 'james.kirk@starfleet.gov.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 2
      }
    })
  })
  test('correctly count the number of succsessfullogin' ,() => {
    adminAuthLoginRequest('james.kirk@starfleet.gov.au', 'qseawd123');
    const res = adminControlUserDetailsRequest(controlusersessionId);
    expect(res.result).toStrictEqual({
      user: {
        controlUserId: expect.any(Number),
        name: 'Tam gugugu',
        email: 'james.kirk@starfleet.gov.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    })
  })
})