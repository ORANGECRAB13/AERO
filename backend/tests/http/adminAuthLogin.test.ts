import { adminAuthLoginRequest, adminAuthRegisterRequest, clearRequest } from './requestHelpers'

beforeEach(() => {
  clearRequest();
})

describe('POST /v1/admin/auth/login', () => {
  beforeEach(() => {
    adminAuthRegisterRequest('james.kirk@starfleet.gov.au', 'qseawd123', 'Tam', 'gugugu')
  })

  test("email doesnt exist", () => {
    let res = adminAuthLoginRequest("james.kirk@starfleet", 'shfl1sefhils');
    console.log(res.result)
    expect(res.result).toStrictEqual({ error: expect.any(String)});
    expect(res.statusCode).toStrictEqual(400);
  })
  
  test('password isnot correct for the given email', () => {
    let res = adminAuthLoginRequest("james.kirk@starfleet.gov.au", 'shflsefhils');
    expect(res.result).toStrictEqual({ error: expect.any(String)});
    expect(res.statusCode).toStrictEqual(400);
  })
  
  test('correct return', () => {
    let res = adminAuthLoginRequest("james.kirk@starfleet.gov.au", 'qseawd123');
    expect(res.result).toStrictEqual({ controlUserSessionId: expect.any(String)});
  })
})