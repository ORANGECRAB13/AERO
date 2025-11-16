import { 
  adminAstronautHealthDetailsUpdateRequest,
  adminAstronautHealthDetailsRequest,
  clearRequest, 
  createAstronauts, 
  errorResult, 
  registerUsers, 
} from "./requestHelpers";
import { validPhysicalHealth, validMentalHealth } from "../../src/testSamples";

beforeEach(() => clearRequest())

describe('PUT /v1/admin/astronaut/:astronautid/health/details', () => {

  describe('Error Cases', () => {
    test('400 - Invalid astronautId', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      const res = adminAstronautHealthDetailsUpdateRequest(sid, aid + 999, validPhysicalHealth, validMentalHealth);
      expect(res.result).toStrictEqual(errorResult);
      expect(res.statusCode).toBe(400);
    });

    test('400 - Invalid physical health indicators', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      const invalidPhysicalHealth = { ...validPhysicalHealth, restingHeartRate: "INVALID" };
      const res = adminAstronautHealthDetailsUpdateRequest(sid, aid, invalidPhysicalHealth as any, validMentalHealth);
      expect(res.result).toStrictEqual(errorResult);
      expect(res.statusCode).toBe(400);
    });

    test('400 - Invalid mental health indicators', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      const invalidMentalHealth = { ...validMentalHealth, anxietyLevel: "INVALID" };
      const res = adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, invalidMentalHealth as any);
      expect(res.result).toStrictEqual(errorResult);
      expect(res.statusCode).toBe(400);
    });

    test('401 - Empty sessionId', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      const res = adminAstronautHealthDetailsUpdateRequest('', aid, validPhysicalHealth, validMentalHealth);
      expect(res.result).toStrictEqual(errorResult);
      expect(res.statusCode).toBe(401);
    });

    test('401 - Invalid sessionId', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      const res = adminAstronautHealthDetailsUpdateRequest('invalidsession123', aid, validPhysicalHealth, validMentalHealth);
      expect(res.result).toStrictEqual(errorResult);
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Success Cases', () => {
    test('Correct return type - empty object', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      const res = adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
      expect(res.result).toStrictEqual({});
      expect(res.statusCode).toBe(200);
    });

    test('Health record contains correct physical health data', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      
      adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
      
      const details = adminAstronautHealthDetailsRequest(sid, aid);
      expect(details.result.physicalHealth).toStrictEqual(validPhysicalHealth);
    });

    test('Health record contains correct mental health data', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      
      adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
      
      const details = adminAstronautHealthDetailsRequest(sid, aid);
      expect(details.result.mentalHealth).toStrictEqual(validMentalHealth);
    });

    test('Health record contains valid timeLastEdited timestamp', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      
      const beforeTime = Math.floor(Date.now() / 1000);
      adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
      const afterTime = Math.floor(Date.now() / 1000);
      
      const details = adminAstronautHealthDetailsRequest(sid, aid);
      
      expect(details.result.timeLastEdited).toBeGreaterThanOrEqual(beforeTime);
      expect(details.result.timeLastEdited).toBeLessThanOrEqual(afterTime);
    });

    // test('Multiple health updates create multiple records', () => {
    //   const [sid] = registerUsers('user1');
    //   const [aid] = createAstronauts(sid, 1);
      
    //   adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
    //   adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
    //   adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
      
    //   const details = adminAstronautHealthDetailsRequest(sid, aid);
    //   expect(details.result.healthRecords.length).toBeGreaterThanOrEqual(3);
    // });

    test('Works with different astronauts', () => {
      const [sid] = registerUsers('user1');
      const [aid1, aid2, aid3] = createAstronauts(sid, 1, 2, 3);
      
      const res1 = adminAstronautHealthDetailsUpdateRequest(sid, aid1, validPhysicalHealth, validMentalHealth);
      const res2 = adminAstronautHealthDetailsUpdateRequest(sid, aid2, validPhysicalHealth, validMentalHealth);
      const res3 = adminAstronautHealthDetailsUpdateRequest(sid, aid3, validPhysicalHealth, validMentalHealth);
      
      expect(res1.result).toStrictEqual({});
      expect(res2.result).toStrictEqual({});
      expect(res3.result).toStrictEqual({});
    });
  });
});