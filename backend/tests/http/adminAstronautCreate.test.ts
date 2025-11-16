import { validAstronauts, errorAstronaut } from "../../src/testSamples";
import { adminAstronautCreateRequest, clearRequest, errorResult, registerUsers, registerOneUser } from "./requestHelpers";
import { v4 as uuidGen } from 'uuid'

const successResult = { astronautId: expect.any(Number)}

const no1 = validAstronauts[1];
const no2 = validAstronauts[2];
const no3 = validAstronauts[3];

beforeEach(() => clearRequest())

describe('POST /v1/admin/astronaut', () => {

  test('error - INVALID CREDENTIALS', () => {
    const res = adminAstronautCreateRequest(uuidGen(), no1.nameFirst, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height)
    expect(res.result).toStrictEqual(errorResult)
    expect(res.statusCode).toBe(401)
  })

  describe('error - BAD INPUT', () => {
    let sid: string;
    beforeEach(() => {
      [sid] = registerUsers('user1')
    })

    test('name used', () => {
      adminAstronautCreateRequest(sid, no1.nameFirst, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height)
      const res = adminAstronautCreateRequest(sid, no1.nameFirst, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })

    test.each([
      ['namefirst short', errorAstronaut.nameShort, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height],
      ['namefirst long', errorAstronaut.nameLong, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height],
      ['namefirst invalid char', errorAstronaut.nameInvalidChar, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height],
      ['namelast short', no1.nameFirst, errorAstronaut.nameShort, no1.rank, no1.age, no1.weight, no1.height],
      ['namelast long', no1.nameFirst, errorAstronaut.nameLong, no1.rank, no1.age, no1.weight, no1.height],
      ['namelast invalid char', no1.nameFirst, errorAstronaut.nameInvalidChar, no1.rank, no1.age, no1.weight, no1.height],
      ['rank short', no1.nameFirst, no1.nameLast, errorAstronaut.rankShort, no1.age, no1.weight, no1.height],
      ['rank long', no1.nameFirst, no1.nameLast, errorAstronaut.rankLong, no1.age, no1.weight, no1.height],
      ['rank invalid char', no1.nameFirst, no1.nameLast, errorAstronaut.rankInvalidChar, no1.age, no1.weight, no1.height],
      ['age small', no1.nameFirst, no1.nameLast, no1.rank, errorAstronaut.ageYoung, no1.weight, no1.height],
      ['age large', no1.nameFirst, no1.nameLast, no1.rank, errorAstronaut.ageOld, no1.weight, no1.height],
      ['overweight', no1.nameFirst, no1.nameLast, no1.rank, no1.age, errorAstronaut.weight, no1.height],
      ['height small', no1.nameFirst, no1.nameLast, no1.rank, no1.age, no1.weight, errorAstronaut.heightShort],
      ['height large', no1.nameFirst, no1.nameLast, no1.rank, no1.age, no1.weight, errorAstronaut.heightTall],
    ])('%s', (testName, nameFirst, nameLast, rank, age, weight, height) => {
      const res = adminAstronautCreateRequest(sid, nameFirst, nameLast, rank, age, weight, height)
      expect(res.result).toStrictEqual(errorResult)
      expect(res.statusCode).toBe(400)
    })
  })
  
  describe('success cases', () => {
    test('correct return type', () => {
      const [sid] = registerUsers('user1')
      const res = adminAstronautCreateRequest(sid, no1.nameFirst, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height)
      expect(res.result).toStrictEqual(successResult)
    })

    test('create multiple astronauts', () => {
      const [sid1, sid2] = registerUsers('user1', 'user2')
      const res1 = adminAstronautCreateRequest(sid1, no1.nameFirst, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height)
      expect(res1.result).toStrictEqual(successResult)
      const res2 = adminAstronautCreateRequest(sid1, no2.nameFirst, no2.nameLast, no2.rank, no2.age, no2.weight, no2.height)
      expect(res2.result).toStrictEqual(successResult)
      const res3 = adminAstronautCreateRequest(sid2, no3.nameFirst, no3.nameLast, no3.rank, no3.age, no3.weight, no3.height)
      expect(res3.result).toStrictEqual(successResult)
    })
  })
})