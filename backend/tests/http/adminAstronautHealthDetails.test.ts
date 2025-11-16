import { 
  adminAstronautHealthDetailsUpdateRequest,
  adminAstronautHealthDetailsRequest,
  clearRequest, 
  createAstronauts, 
  errorResult, 
  registerUsers, 
} from "./requestHelpers";

import { validPhysicalHealth, validMentalHealth } from "../../src/testSamples";
import { HealthStatus } from "../../src/interfaces";

beforeEach(() => clearRequest())

describe('GET /v1/admin/astronaut/:astronautid/health/details', () => {

  describe('Error Cases', () => {
    test('400 - Invalid astronautId', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      const res = adminAstronautHealthDetailsRequest(sid, aid + 999);
      expect(res.result).toStrictEqual(errorResult);
      expect(res.statusCode).toBe(400);
    });

    test('400 - Negative astronautId', () => {
      const [sid] = registerUsers('user1');
      createAstronauts(sid, 1);
      const res = adminAstronautHealthDetailsRequest(sid, -1);
      expect(res.result).toStrictEqual(errorResult);
      expect(res.statusCode).toBe(400);
    });

    test('401 - Empty sessionId', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      const res = adminAstronautHealthDetailsRequest('', aid);
      expect(res.result).toStrictEqual(errorResult);
      expect(res.statusCode).toBe(401);
    });

    test('401 - Invalid sessionId', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      const res = adminAstronautHealthDetailsRequest('invalidsession123', aid);
      expect(res.result).toStrictEqual(errorResult);
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Success Cases', () => {
    test('Correct return type with health record', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
      
      const res = adminAstronautHealthDetailsRequest(sid, aid);
      expect(res.statusCode).toBe(200);
      expect(res.result).toHaveProperty('physicalHealth');
      expect(res.result).toHaveProperty('mentalHealth');
      expect(res.result).toHaveProperty('timeLastEdited');
    });

    test('Returns most recent health record', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      
      // Add first record
      adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
      
      // Add second record with different values
      const updatedPhysicalHealth = { ...validPhysicalHealth, restingHeartRate: HealthStatus.YELLOW };
      const updatedMentalHealth = { ...validMentalHealth, anxietyLevel: HealthStatus.RED };
      adminAstronautHealthDetailsUpdateRequest(sid, aid, updatedPhysicalHealth, updatedMentalHealth);
      
      const res = adminAstronautHealthDetailsRequest(sid, aid);
      expect(res.result.physicalHealth.restingHeartRate).toBe("YELLOW");
      expect(res.result.mentalHealth.anxietyLevel).toBe("RED");
    });

    test('Physical health contains all required fields', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
      
      const res = adminAstronautHealthDetailsRequest(sid, aid);
      const physicalHealth = res.result.physicalHealth;
      
      expect(physicalHealth).toHaveProperty('restingHeartRate');
      expect(physicalHealth).toHaveProperty('bloodPressure');
      expect(physicalHealth).toHaveProperty('boneDensity');
      expect(physicalHealth).toHaveProperty('muscleMass');
      expect(physicalHealth).toHaveProperty('reactionTime');
      expect(physicalHealth).toHaveProperty('radiationLevel');
      expect(physicalHealth).toHaveProperty('whiteBloodCellLevel');
      expect(physicalHealth).toHaveProperty('sleepQuality');
    });

    test('Mental health contains all required fields', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
      
      const res = adminAstronautHealthDetailsRequest(sid, aid);
      const mentalHealth = res.result.mentalHealth;
      
      expect(mentalHealth).toHaveProperty('depressionLevel');
      expect(mentalHealth).toHaveProperty('anxietyLevel');
      expect(mentalHealth).toHaveProperty('stressLevel');
      expect(mentalHealth).toHaveProperty('cognitivePerformance');
      expect(mentalHealth).toHaveProperty('personalityTraits');
      expect(mentalHealth).toHaveProperty('motivationLevel');
    });

    test('Physical health values match input', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
      
      const res = adminAstronautHealthDetailsRequest(sid, aid);
      expect(res.result.physicalHealth).toStrictEqual(validPhysicalHealth);
    });

    test('Mental health values match input', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
      
      const res = adminAstronautHealthDetailsRequest(sid, aid);
      expect(res.result.mentalHealth).toStrictEqual(validMentalHealth);
    });

    test('timeLastEdited is a valid Unix timestamp', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      
      const beforeTime = Math.floor(Date.now() / 1000);
      adminAstronautHealthDetailsUpdateRequest(sid, aid, validPhysicalHealth, validMentalHealth);
      const afterTime = Math.floor(Date.now() / 1000);
      
      const res = adminAstronautHealthDetailsRequest(sid, aid);
      expect(res.result.timeLastEdited).toBeGreaterThanOrEqual(beforeTime);
      expect(res.result.timeLastEdited).toBeLessThanOrEqual(afterTime);
      expect(typeof res.result.timeLastEdited).toBe('number');
    });

    test('Works for different astronauts independently', () => {
      const [sid] = registerUsers('user1');
      const [aid1, aid2] = createAstronauts(sid, 1, 2);
      
      const physical1 = { ...validPhysicalHealth, restingHeartRate: HealthStatus.GREEN };
      const physical2 = { ...validPhysicalHealth, restingHeartRate: HealthStatus.RED };
      
      adminAstronautHealthDetailsUpdateRequest(sid, aid1, physical1, validMentalHealth);
      adminAstronautHealthDetailsUpdateRequest(sid, aid2, physical2, validMentalHealth);
      
      const res1 = adminAstronautHealthDetailsRequest(sid, aid1);
      const res2 = adminAstronautHealthDetailsRequest(sid, aid2);
      
      expect(res1.result.physicalHealth.restingHeartRate).toBe("GREEN");
      expect(res2.result.physicalHealth.restingHeartRate).toBe("RED");
    });

    test('Different users can access their own astronaut health', () => {
      const [sid1] = registerUsers('user1');
      const [sid2] = registerUsers('user2');
      const [aid1] = createAstronauts(sid1, 1);
      const [aid2] = createAstronauts(sid2, 2);
      
      adminAstronautHealthDetailsUpdateRequest(sid1, aid1, validPhysicalHealth, validMentalHealth);
      adminAstronautHealthDetailsUpdateRequest(sid2, aid2, validPhysicalHealth, validMentalHealth);
      
      const res1 = adminAstronautHealthDetailsRequest(sid1, aid1);
      const res2 = adminAstronautHealthDetailsRequest(sid2, aid2);
      
      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
    });

    test('Returns empty/initial health record for astronaut without updates', () => {
      const [sid] = registerUsers('user1');
      const [aid] = createAstronauts(sid, 1);
      
      const res = adminAstronautHealthDetailsRequest(sid, aid);
      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual(expect.any(String))
    });
  });
});