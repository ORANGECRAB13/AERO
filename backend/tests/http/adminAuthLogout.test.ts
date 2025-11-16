import { validUsers } from "../../src/testSamples";
import { errorResult, clearRequest, adminAuthRegisterRequest, adminAuthLogoutRequest } from "./requestHelpers";
import { v4 as uuidv4 } from 'uuid'

const user1 = validUsers.user1
const user2 = validUsers.user2

function registerUsers() {
  const id1 = adminAuthRegisterRequest(user1.email, user1.password, user1.nameFirst, user1.nameLast).result.controlUserSessionId
  const id2 = adminAuthRegisterRequest(user2.email, user2.password, user2.nameFirst, user2.nameLast).result.controlUserSessionId
  return { id1, id2 }
}

beforeEach(() => clearRequest())

describe('POST /v1/admin/auth/logout', () => {
  test('error case - invalid sessionid provided', () => {
    const id = uuidv4()
    const res = adminAuthLogoutRequest(id)
    expect(res.result).toStrictEqual(errorResult)
    expect(res.statusCode).toBe(401)
  })

  test('success logout return type', () => {
    const { id1, id2 } = registerUsers()
    expect(adminAuthLogoutRequest(id1).result).toStrictEqual({})
    expect(adminAuthLogoutRequest(id2).result).toStrictEqual({})
  })

  test('side effects - success logout modifys data', () => {
    const { id1, id2 } = registerUsers()
    expect(adminAuthLogoutRequest(id1).result).toStrictEqual({})
    const res1 = adminAuthLogoutRequest(id1)
    expect(res1.result).toStrictEqual(errorResult)
    expect(res1.statusCode).toBe(401)
    expect(adminAuthLogoutRequest(id2).result).toStrictEqual({})
    const res2 = adminAuthLogoutRequest(id2)
    expect(res2.result).toStrictEqual(errorResult)
    expect(res2.statusCode).toBe(401)
  })
})