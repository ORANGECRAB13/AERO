import { validUsers,  invalidUserInputs } from "../../src/testSamples";
import { errorResult, clearRequest, adminAuthRegisterRequest, adminControlUserDetailsRequest } from "./requestHelpers";

const successResult = { controlUserSessionId: expect.any(String) }

const user1 = validUsers.user1
const user2 = validUsers.user2

beforeEach(() => clearRequest())

describe('POST /v1/admin/auth/register', () => {
  describe('Success Cases', () => {
    test('Register 1 user', () => {
      const res = adminAuthRegisterRequest(user1.email, user1.password, user1.nameFirst, user1.nameLast)
      expect(res.result).toStrictEqual(successResult)
    })

    test('Register multiple users modifys data', () => {
      const res1 = adminAuthRegisterRequest(user1.email, user1.password, user1.nameFirst, user1.nameLast)
      const res2 = adminAuthRegisterRequest(user2.email, user2.password, user2.nameFirst, user2.nameLast)
      expect(res1.result).toStrictEqual(successResult)
      expect(res2.result).toStrictEqual(successResult)
      expect(adminControlUserDetailsRequest(res1.result.controlUserSessionId).result).toStrictEqual({
        user: {
          controlUserId: expect.any(Number),
          name: user1.nameFirst + ' ' + user1.nameLast,
          email: user1.email,
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0
        }
      })
      expect(adminControlUserDetailsRequest(res2.result.controlUserSessionId).result).toStrictEqual({
        user: {
          controlUserId: expect.any(Number),
          name: user2.nameFirst + ' ' + user2.nameLast,
          email: user2.email,
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0
        }
      })
    })
  })

  describe('Error Cases', () => {
    test('Email Used', () => {
      adminAuthRegisterRequest(user1.email, user1.password, user1.nameFirst, user1.nameLast)
      const res = adminAuthRegisterRequest(user1.email, user1.password, user1.nameFirst, user1.nameLast)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })

    test('Email Invalid', () => {
      const res = adminAuthRegisterRequest(invalidUserInputs.emailInvalid, user1.password, user1.nameFirst, user1.nameLast)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })

    test('First Name Contains Invalid Chars', () => {
      const res = adminAuthRegisterRequest(user1.email, user1.password, invalidUserInputs.nameInvalidChar, user1.nameLast)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })

    test('First Name too short', () => {
      const res = adminAuthRegisterRequest(user1.email, user1.password, invalidUserInputs.nameShort, user1.nameLast)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })

    test('First Name too Long', () => {
      const res = adminAuthRegisterRequest(user1.email, user1.password, invalidUserInputs.nameLong, user1.nameLast)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })

    test('Last Name Contains Invalid Chars', () => {
      const res = adminAuthRegisterRequest(user1.email, user1.password, user1.nameFirst, invalidUserInputs.nameInvalidChar)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })

    test('Last Name too short', () => {
      const res = adminAuthRegisterRequest(user1.email, user1.password, user1.nameFirst, invalidUserInputs.nameShort)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })

    test('Last Name too Long', () => {
      const res = adminAuthRegisterRequest(user1.email, user1.password, user1.nameFirst, invalidUserInputs.nameLong)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })

    test('Password is less than 8 characters', () => {
      const res = adminAuthRegisterRequest(user1.email, invalidUserInputs.passwordShort, user1.nameFirst, user1.nameLast)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })

    test('Password no numbers', () => {
      const res = adminAuthRegisterRequest(user1.email, invalidUserInputs.passwordNoNumber, user1.nameFirst, user1.nameLast)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })

    test('Password no characters', () => {
      const res = adminAuthRegisterRequest(user1.email, invalidUserInputs.passwordNoChar, user1.nameFirst, user1.nameLast)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })
  })
})