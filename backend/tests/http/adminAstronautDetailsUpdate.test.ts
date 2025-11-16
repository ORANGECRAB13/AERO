import { getData } from "../../src/dataStore";
import { validAstronauts, errorAstronaut } from "../../src/testSamples";
import { adminAstronautCreateRequest, clearRequest, errorResult, registerUsers, registerOneUser, adminAstronautDetailsUpdateRequest, createAstronauts } from "./requestHelpers";


const successResult = { astronautId: expect.any(Number)}

const no1 = validAstronauts[1];
const no2 = validAstronauts[2];
const no3 = validAstronauts[3];

beforeEach(() => clearRequest())

describe('PUT v1/admin/astronaut/:astronautid', () => {

  test('error - INVALID CREDENTIALS', () => {
    const res = adminAstronautDetailsUpdateRequest('sefsef',2, no1.nameFirst, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height)
    expect(res.result).toStrictEqual(errorResult)
    expect(res.statusCode).toBe(401)
  })

  describe('error - BAD INPUT', () => {
      let sid: string;
      beforeEach(() => {
        [sid] = registerUsers('user1')
        createAstronauts(sid, 1)
      })
  
      test('astornautid invalid', () => {
        let astornautId = (adminAstronautCreateRequest(sid, no2.nameFirst, no2.nameLast, no1.rank, no1.age, no1.weight, no1.height)).result.astornautId
        const res = adminAstronautDetailsUpdateRequest(sid, astornautId + 1, no1.nameFirst, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height)
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
      ])(`%s`, (testName, nameFirst, nameLast, rank, age, weight, height) => {
        let astronautId = (adminAstronautCreateRequest(sid, no1.nameFirst, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height)).result.astronautId
        const res = adminAstronautDetailsUpdateRequest(sid, astronautId, nameFirst, nameLast, rank, age, weight, height)
        expect(res.result).toStrictEqual(errorResult)
        expect(res.statusCode).toBe(400)
      })
    })

  describe('success cases', () => {
    test('correct return type', () => {
      const [sid] = registerUsers('user1')
      let astronautId = (adminAstronautCreateRequest(sid, no1.nameFirst, no1.nameLast, no1.rank, no1.age, no1.weight, no1.height)).result.astronautId;
      const res = adminAstronautDetailsUpdateRequest(sid, astronautId, no2.nameFirst, no2.nameLast, no2.rank, no2.age, no2.weight, no2.height)
      expect(res.result).toStrictEqual({})
    })
  })
})