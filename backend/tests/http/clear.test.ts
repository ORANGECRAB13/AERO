import { validUsers } from '../../src/testSamples'
import { errorResult, adminAuthRegisterRequest, clearRequest, adminControlUserDetailsRequest } from './requestHelpers'

const user1 = validUsers.user1

describe('DELETE /clear', () => {
  test('Success Response', () => {
    expect(clearRequest()).toStrictEqual({})
  })

  test('Clears Data', () => {
    const sid = adminAuthRegisterRequest(user1.email, user1.password, user1.nameFirst, user1.nameLast).result.controlUserSessionId
    clearRequest()
    const res = adminControlUserDetailsRequest(sid)
    expect(res.result).toStrictEqual(errorResult)
    expect(res.statusCode).toBe(401)
  })
})